from __future__ import annotations

import json
import os
import tempfile
import threading
from email.parser import BytesParser
from email.policy import default
from http import HTTPStatus
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path

from .adapters import EngineConfigurationError, EngineExecutionError
from .models import Challenge, ValidationError
from .pipeline import PronunciationPipeline


MAX_UPLOAD_BYTES = 12 * 1024 * 1024
AUDIO_EXTENSIONS = {"audio/mp4": ".m4a", "audio/x-m4a": ".m4a", "audio/wav": ".wav", "audio/x-wav": ".wav", "audio/aiff": ".aiff"}
EVALUATION_SLOT = threading.BoundedSemaphore(1)


class Handler(BaseHTTPRequestHandler):
    pipeline = PronunciationPipeline()

    def do_GET(self) -> None:
        if self.path != "/health":
            self._json(HTTPStatus.NOT_FOUND, {"error": "not_found"})
            return
        required = ("VINCERO_MFA_COMMAND", "VINCERO_KALDI_GOP_COMMAND")
        configured = all(os.environ.get(name) for name in required)
        self._json(HTTPStatus.OK, {"status": "ready" if configured else "configuration_required"})

    def do_POST(self) -> None:
        if self.path != "/v1/pronunciation/evaluate":
            self._json(HTTPStatus.NOT_FOUND, {"error": "not_found"})
            return
        try:
            content_length = int(self.headers.get("Content-Length", "0"))
        except ValueError:
            content_length = 0
        if content_length <= 0 or content_length > MAX_UPLOAD_BYTES:
            self._json(HTTPStatus.REQUEST_ENTITY_TOO_LARGE, {"error": "invalid_upload_size"})
            return
        content_type = self.headers.get("Content-Type", "")
        if not content_type.startswith("multipart/form-data"):
            self._json(HTTPStatus.UNSUPPORTED_MEDIA_TYPE, {"error": "multipart_required"})
            return
        try:
            body = self.rfile.read(content_length)
            message = BytesParser(policy=default).parsebytes(
                f"Content-Type: {content_type}\r\nMIME-Version: 1.0\r\n\r\n".encode() + body
            )
            fields = {part.get_param("name", header="content-disposition"): part for part in message.iter_parts()}
            challenge = Challenge.from_json(json.loads(fields["challenge"].get_content()))
            audio = fields["audio"].get_payload(decode=True)
            if not audio:
                raise ValidationError("audio is required")
            suffix = AUDIO_EXTENSIONS.get(fields["audio"].get_content_type())
            if suffix is None:
                raise ValidationError("unsupported audio content type")
            if not EVALUATION_SLOT.acquire(blocking=False):
                self._json(HTTPStatus.SERVICE_UNAVAILABLE, {"error": "engine_busy"})
                return
            try:
                with tempfile.TemporaryDirectory(prefix="vincero-attempt-") as directory:
                    workspace = Path(directory)
                    audio_path = workspace / ("attempt" + suffix)
                    audio_path.write_bytes(audio)
                    result = self.pipeline.evaluate(audio_path, challenge, workspace)
            finally:
                EVALUATION_SLOT.release()
            self._json(HTTPStatus.OK, result)
        except (KeyError, json.JSONDecodeError, ValidationError, UnicodeDecodeError) as error:
            self._json(HTTPStatus.BAD_REQUEST, {"error": "invalid_request", "message": str(error)})
        except EngineConfigurationError as error:
            self._json(HTTPStatus.SERVICE_UNAVAILABLE, {"error": "engine_not_configured", "message": str(error)})
        except (EngineExecutionError, ValueError) as error:
            self._json(HTTPStatus.UNPROCESSABLE_ENTITY, {"error": "evaluation_failed", "message": str(error)})

    def log_message(self, format: str, *args: object) -> None:
        # Request metadata only; never log multipart bodies or raw audio.
        super().log_message(format, *args)

    def _json(self, status: HTTPStatus, body: dict) -> None:
        payload = json.dumps(body).encode()
        self.send_response(status)
        self.send_header("Content-Type", "application/json")
        self.send_header("Content-Length", str(len(payload)))
        self.end_headers()
        self.wfile.write(payload)


def main() -> None:
    host = os.environ.get("VINCERO_HOST", "127.0.0.1")
    port = int(os.environ.get("VINCERO_PORT", "8787"))
    server = ThreadingHTTPServer((host, port), Handler)
    print(f"Vinceró pronunciation API listening on http://{host}:{port}")
    server.serve_forever()


if __name__ == "__main__":
    main()

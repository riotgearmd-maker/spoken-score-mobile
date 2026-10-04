import json
import threading
import unittest
import urllib.error
import urllib.request
from http.server import ThreadingHTTPServer

from vincero_backend.server import Handler


class FakePipeline:
    def evaluate(self, audio, challenge, workspace):
        return {"engineId": "test", "engineVersion": "1", "phonemes": []}


def multipart(challenge: dict, audio: bytes) -> tuple[bytes, str]:
    boundary = "vincero-test-boundary"
    parts = [
        f"--{boundary}\r\nContent-Disposition: form-data; name=\"challenge\"\r\n\r\n".encode()
        + json.dumps(challenge).encode()
        + b"\r\n",
        f"--{boundary}\r\nContent-Disposition: form-data; name=\"audio\"; filename=\"attempt.m4a\"\r\nContent-Type: audio/mp4\r\n\r\n".encode()
        + audio
        + b"\r\n",
        f"--{boundary}--\r\n".encode(),
    ]
    return b"".join(parts), f"multipart/form-data; boundary={boundary}"


class ServerTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        Handler.pipeline = FakePipeline()
        cls.server = ThreadingHTTPServer(("127.0.0.1", 0), Handler)
        cls.thread = threading.Thread(target=cls.server.serve_forever, daemon=True)
        cls.thread.start()
        cls.base_url = f"http://127.0.0.1:{cls.server.server_port}"

    @classmethod
    def tearDownClass(cls):
        cls.server.shutdown()
        cls.server.server_close()
        cls.thread.join()

    def test_evaluation_contract(self):
        body, content_type = multipart(
            {"id": "v", "profileId": "italian", "text": "Vincerò", "phonemes": [{"symbol": "v"}]},
            b"not-real-audio",
        )
        request = urllib.request.Request(
            self.base_url + "/v1/pronunciation/evaluate",
            data=body,
            headers={"Content-Type": content_type, "Accept": "application/json"},
            method="POST",
        )
        with urllib.request.urlopen(request) as response:
            result = json.load(response)
        self.assertEqual(result["engineId"], "test")

    def test_rejects_unsupported_profile_before_engine(self):
        body, content_type = multipart(
            {"id": "x", "profileId": "martian", "text": "Hi", "phonemes": [{"symbol": "h"}]},
            b"audio",
        )
        request = urllib.request.Request(
            self.base_url + "/v1/pronunciation/evaluate",
            data=body,
            headers={"Content-Type": content_type},
            method="POST",
        )
        with self.assertRaises(urllib.error.HTTPError) as raised:
            urllib.request.urlopen(request)
        self.assertEqual(raised.exception.code, 400)


if __name__ == "__main__":
    unittest.main()

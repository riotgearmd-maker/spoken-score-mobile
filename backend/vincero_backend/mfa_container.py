"""Run a pinned MFA image with only the attempt workspace mounted."""
import argparse
import os
import subprocess
from pathlib import Path

IMAGE = "mmcauliffe/montreal-forced-aligner@sha256:1986960fcb5169979630a7efb2576480c587500ab556c9daa66a930f471215b8"


def main():
    parser = argparse.ArgumentParser()
    for name in ("audio", "transcript", "dictionary", "acoustic-model", "output"):
        parser.add_argument("--" + name, required=True)
    args = parser.parse_args()
    audio = Path(args.audio).resolve()
    workspace = audio.parent
    transcript = Path(args.transcript).resolve()
    output = Path(args.output).resolve()
    if transcript.parent != workspace or output.parent != workspace:
        parser.error("all attempt files must share one workspace")
    docker = os.environ.get("VINCERO_DOCKER", "/Applications/Docker.app/Contents/Resources/bin/docker")
    command = [docker, "run", "--rm", "--platform", "linux/amd64",
               "--mount", f"type=bind,source={workspace},target=/attempt",
               "--mount", "type=volume,source=vincero-mfa-models,target=/models",
               "-e", "MFA_ROOT_DIR=/models",
               IMAGE, "mfa", "align_one", f"/attempt/{audio.name}",
               f"/attempt/{transcript.name}", args.dictionary, args.acoustic_model,
               f"/attempt/{output.name}", "--output_format", "json", "--clean",
               "--beam", "100"]
    subprocess.run(command, check=True, timeout=300)


if __name__ == "__main__":
    main()

import argparse
import os
import sys


def main():
    """
    The main function.

    Returns:
      None

    Examples:
      >>> main()
      None
    """

    parser = argparse.ArgumentParser(description="Funcnodes React Cli.")

    parser.add_argument(
        "--port",
        default=None,
        help="Port to run the server on",
        type=int,
    )
    parser.add_argument(
        "--no-browser",
        action="store_true",
        help="Open the browser after starting the server",
    )

    args = parser.parse_args()
    cmd = sys.executable + " -m funcnodes runserver"
    if args.port:
        cmd += f" --port {args.port}"
    if args.no_browser:
        cmd += " --no-browser"

    os.system(cmd)


#    "@mui/icons-material": "^5.15.18",
# "@mui/material": "^5.15.18"

if __name__ == "__main__":
    main()

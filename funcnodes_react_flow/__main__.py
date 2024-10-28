from .run import run_server
import funcnodes as fn
import argparse

try:
    from setproctitle import setproctitle
except ModuleNotFoundError:
    setproctitle = print


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
        default=fn.config.CONFIG["frontend"]["port"],
        help="Port to run the server on",
        type=int,
    )
    parser.add_argument(
        "--no-browser",
        action="store_false",
        help="Open the browser after starting the server",
    )

    args = parser.parse_args()

    setproctitle("funcnodes_server")
    run_server(port=args.port, open_browser=args.no_browser)


if __name__ == "__main__":
    main()

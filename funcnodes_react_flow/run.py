from typing import Optional
import http.server
import socketserver
import webbrowser
import os
import time
import threading
import asyncio
import funcnodes as fn
import websockets

PORT = 8029


class CustomHTTPRequestHandler(http.server.SimpleHTTPRequestHandler):
    def do_GET(self):
        if self.path == "/worker_manager":
            self.get_worker_manager()
        else:
            # Call the superclass method to handle standard requests
            super().do_GET()

    def do_POST(self):
        if self.path == "/custom-post":
            self.handle_custom_post()
        else:
            # Send a 405 Method Not Allowed response for unsupported endpoints
            self.send_error(405, "Method Not Allowed")

    def get_worker_manager(self):
        # Implement custom GET handling logic here
        asyncio.run(
            fn.worker.worker_manager.assert_worker_manager_running(
                host=self.server.worker_manager_host,
                port=self.server.worker_manager_port,
                ssl=self.server.worker_manager_ssl,
            )
        )
        self.send_response(200)
        self.send_header("Content-type", "text/json")
        self.end_headers()
        self.wfile.write(
            f"ws{'s' if self.server.worker_manager_ssl else ''}://{self.server.worker_manager_host}:{self.server.worker_manager_port}".encode(
                "utf-8"
            )
        )

    def handle_custom_post(self):
        # Implement custom POST handling logic here
        content_length = int(self.headers["Content-Length"])
        post_data = self.rfile.read(content_length)

        self.send_response(200)
        self.send_header("Content-type", "text/html")
        self.end_headers()
        response = f"Received POST data: {post_data.decode('utf-8')}"
        self.wfile.write(response.encode("utf-8"))


class GracefulHTTPServer(socketserver.TCPServer):
    allow_reuse_address = False
    timeout = 5

    def __init__(
        self,
        server_address,
        RequestHandlerClass,
        bind_and_activate=True,
        worker_manager_host: Optional[str] = None,
        worker_manager_port: Optional[int] = None,
        worker_manager_ssl: Optional[bool] = None,
    ):
        if worker_manager_host is None:
            worker_manager_host = fn.config.CONFIG["worker_manager"]["host"]

        if worker_manager_port is None:
            worker_manager_port = fn.config.CONFIG["worker_manager"]["port"]

        if worker_manager_ssl is None:
            worker_manager_ssl = fn.config.CONFIG["worker_manager"].get("ssl", False)

        self.worker_manager_ssl = worker_manager_ssl
        self.worker_manager_host = worker_manager_host
        self.worker_manager_port = worker_manager_port
        super().__init__(server_address, RequestHandlerClass, bind_and_activate)
        self._is_serving = True

    def serve_forever(self, poll_interval=0.5):
        while self._is_serving:
            self.handle_request()

    def shutdown(self):
        self._is_serving = False


def _open_browser(port, delay=1.0):
    time.sleep(delay)
    webbrowser.open(f"http://localhost:{port}")


async def websocket_handler(websocket, path):
    async for message in websocket:
        print(f"Received WebSocket message: {message}")
        await websocket.send(f"Echo: {message}")


def start_websocket_server(port):
    asyncio.set_event_loop(asyncio.new_event_loop())
    start_server = websockets.serve(websocket_handler, "localhost", port)
    asyncio.get_event_loop().run_until_complete(start_server)
    asyncio.get_event_loop().run_forever()


def run_server(
    port=PORT,
    open_browser=True,
    worker_manager_host: Optional[str] = None,
    worker_manager_port: Optional[int] = None,
    worker_manager_ssl: Optional[bool] = None,
):
    import funcnodes as fn

    asyncio.run(
        fn.worker.worker_manager.assert_worker_manager_running(
            host=worker_manager_host,
            port=worker_manager_port,
            ssl=worker_manager_ssl,
        )
    )
    try:
        script_directory = os.path.dirname(os.path.abspath(__file__))
        os.chdir(script_directory)
        httpd = GracefulHTTPServer(
            ("", port),
            CustomHTTPRequestHandler,
            worker_manager_host=worker_manager_host,
            worker_manager_port=worker_manager_port,
            worker_manager_ssl=worker_manager_ssl,
        )
        print(f"Serving at port {port}")
        if open_browser:
            threading.Thread(target=_open_browser, args=(port,), daemon=True).start()
        httpd.serve_forever()
    except KeyboardInterrupt:
        if httpd._is_serving:
            print("Stopping server...")
            httpd.shutdown()
            print("Server has been stopped.")
        else:
            raise
    except OSError as e:
        print(f"Could not start server at port {port}: {e}")





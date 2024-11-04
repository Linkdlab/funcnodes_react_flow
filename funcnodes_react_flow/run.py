import os
from funcnodes.runner import BaseServer


class FuncnodesreactflowServer(BaseServer):
    STATIC_PATH = os.path.join(os.path.dirname(__file__), "static")
    STATIC_URL = "/static"

    async def index(self, request):
        request.match_info["filename"] = "index.html"
        return await self.serve_static_file(request)


def run_server(**kwargs):
    return FuncnodesreactflowServer.run_server(**kwargs)

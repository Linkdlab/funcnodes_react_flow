from typing import TypedDict, List

try:
    from .run import run_server  # noqa: F401
except ImportError:
    pass
from .plugin_setup import ReactPlugin, setup, FUNCNODES_REACT_PLUGIN


class ExpandedReactPlugin(TypedDict):
    """
    A typed dictionary for an expanded React plugin.

    Attributes:
      js (list[bytes]): A list of JavaScript files.
    """

    js: List[bytes]
    module: bytes
    css: List[bytes]


def get_react_plugin_content(key: str) -> ExpandedReactPlugin:
    """
    Get the content of a React plugin.

    Args:
      key (str): The key of the plugin.

    Returns:
      str: The content of the plugin.
    """
    key = str(key)

    if key not in FUNCNODES_REACT_PLUGIN:
        raise ValueError(f"React plugin {key} not found")

    if FUNCNODES_REACT_PLUGIN[key]["module"]:
        with open(FUNCNODES_REACT_PLUGIN[key]["module"], "rb") as f:
            module = f.read()

    resp: ExpandedReactPlugin = {
        "js": [],
        "module": module,
        "css": [],
    }
    if "js" in FUNCNODES_REACT_PLUGIN[key]:
        for js in FUNCNODES_REACT_PLUGIN[key]["js"]:
            with open(js, "rb") as f:
                resp["js"].append(f.read())

    if "css" in FUNCNODES_REACT_PLUGIN[key]:
        for css in FUNCNODES_REACT_PLUGIN[key]["css"]:
            with open(css, "rb") as f:
                resp["css"].append(f.read())
    return resp


setup()


__all__ = [
    "run_server",
    "ReactPlugin",
    "FUNCNODES_REACT_PLUGIN",
    "get_react_plugin_content",
    "ReactPlugin",
]

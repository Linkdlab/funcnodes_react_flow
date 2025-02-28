from types import ModuleType
from typing import Dict
from funcnodes_core import plugins


class ReactPlugin(plugins.BasePlugin):
    """
    A typed dictionary for a React plugin.

    Attributes:
      js (list[str]): A list of JavaScript files.
    """

    js: list[str]
    css: list[str]


FUNCNODES_REACT_PLUGIN: Dict[str, ReactPlugin] = {}


def add_react_plugin(module: ModuleType, plugin: ReactPlugin):
    """
    Add a React plugin to the FUNCNODES_REACT_PLUGIN dictionary.

    Args:
      name (str): The name of the plugin.
      plugin (ReactPlugin): The plugin to add.
    """
    FUNCNODES_REACT_PLUGIN[str(module)] = plugin


def plugin_function(installed_module: plugins.InstalledModule):
    entry_points = installed_module.entry_points
    mod = installed_module.module

    if "react_plugin" in entry_points:
        add_react_plugin(mod, entry_points["react_plugin"])
    elif hasattr(mod, "REACT_PLUGIN"):
        add_react_plugin(mod, mod.REACT_PLUGIN)
        entry_points["react_plugin"] = mod.REACT_PLUGIN


def setup():
    plugins.register_setup_plugin(plugin_function)

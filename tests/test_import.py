import unittest


class TestImport(unittest.TestCase):
    def test_import(self):
        import funcnodes_react_flow

        self.assertIsInstance(funcnodes_react_flow, object)

    def test_is_setup(self):
        from funcnodes_core import plugins
        import funcnodes_react_flow

        self.assertIn("funcnodes_react_flow.plugin_setup", plugins.PLUGIN_FUNCTIONS)
        self.assertEqual(
            plugins.PLUGIN_FUNCTIONS["funcnodes_react_flow.plugin_setup"],
            funcnodes_react_flow.plugin_setup.plugin_function,
        )

import unittest


class TestImport(unittest.TestCase):
    def test_import(self):
        import funcnodes

        self.assertIsInstance(funcnodes, object)

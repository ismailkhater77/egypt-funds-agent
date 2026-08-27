#!/usr/bin/env python3
"""Unit checks for the fixed EIMA 31-report provenance manifest."""

import importlib.util
import unittest
from pathlib import Path


MODULE_PATH = Path(__file__).with_name("reconcile_eima_report_manifest.py")
SPEC = importlib.util.spec_from_file_location("eima_manifest", MODULE_PATH)
assert SPEC and SPEC.loader
MODULE = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(MODULE)


class EimaReportManifestTests(unittest.TestCase):
    def test_contains_31_unique_canonical_dates(self) -> None:
        dates = [date_value for date_value, _, _ in MODULE.REPORT_MANIFEST]
        self.assertEqual(len(dates), 31)
        self.assertEqual(len(set(dates)), 31)

    def test_corrects_impossible_february_29_2026_label(self) -> None:
        correction = [entry for entry in MODULE.REPORT_MANIFEST if entry[0] == "2026-02-26"]
        self.assertEqual(len(correction), 1)
        self.assertIn("February 29th", correction[0][1])
        self.assertIn("26-February", correction[0][2])


if __name__ == "__main__":
    unittest.main()

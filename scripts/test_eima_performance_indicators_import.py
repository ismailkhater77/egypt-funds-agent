#!/usr/bin/env python3
"""Unit checks for EIMA performance/indicator import transformations."""

import importlib.util
import unittest
from pathlib import Path


MODULE_PATH = Path(__file__).with_name("import_eima_performance_indicators.py")
SPEC = importlib.util.spec_from_file_location("eima_performance_import", MODULE_PATH)
assert SPEC and SPEC.loader
MODULE = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(MODULE)


class EimaPerformanceImportTests(unittest.TestCase):
    def test_source_row_key_changes_across_horizons(self) -> None:
        row = {"report_date": "2026-07-30", "category": "Equity", "row_number": "1", "fund_name_raw": "Fund", "management_company_raw": "Manager", "horizon": "1y"}
        second = {**row, "horizon": "2y"}
        self.assertNotEqual(MODULE.performance_source_row_key(row), MODULE.performance_source_row_key(second))

    def test_legacy_identity_ignores_preliminary_nav_rounding(self) -> None:
        existing = {"eima_fund_name_raw": "Fund", "report_date": "2026-07-30", "horizon": "1y", "category": "Equity", "management_company_raw": "Manager", "nav_value": 10.1234}
        candidate = {**existing, "nav_value": 10.123456}
        self.assertTrue(MODULE.same_legacy_identity(existing, candidate))
        self.assertFalse(MODULE.same_performance(existing, candidate))

    def test_currency_preserves_dollar_category(self) -> None:
        row = {"category": "Open- End Fixed Income Dollar Funds", "fund_name_raw": "Fund"}
        self.assertEqual(MODULE.currency_for(row), ("USD", "explicit_dollar_category_or_name"))

    def test_indicator_keys_are_distinct_and_report_linked(self) -> None:
        keys = [entry[1] for entry in MODULE.INDICATORS]
        self.assertEqual(len(keys), len(set(keys)))
        self.assertIn("EGX30_CLOSE", keys)
        self.assertIn("CPI_HEADLINE_MONTHLY_CHANGE", keys)


if __name__ == "__main__":
    unittest.main()

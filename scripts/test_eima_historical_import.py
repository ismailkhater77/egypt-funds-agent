#!/usr/bin/env python3
"""Unit tests for the local EIMA historical import policy."""

import importlib.util
import unittest
from datetime import date
from pathlib import Path


MODULE_PATH = Path(__file__).with_name("import_eima_historical_nav.py")
SPEC = importlib.util.spec_from_file_location("eima_import", MODULE_PATH)
assert SPEC and SPEC.loader
MODULE = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(MODULE)


class CurrencyResolutionTests(unittest.TestCase):
    def test_detects_explicit_dollar_marker(self) -> None:
        self.assertEqual(MODULE.currency_for({"category": "Open End Funds", "fund_name_raw": "Fund ($)"}), ("USD", "explicit_dollar_category_or_name"))

    def test_detects_euro_category(self) -> None:
        self.assertEqual(MODULE.currency_for({"category": "Open- End Fixed Income Euro Funds", "fund_name_raw": "Fund"}), ("EUR", "explicit_euro_category_or_name"))

    def test_uses_egp_default_for_non_foreign_category(self) -> None:
        self.assertEqual(MODULE.currency_for({"category": "Open End- Money Market Funds", "fund_name_raw": "Fund"}), ("EGP", "egp_default_for_egyptian_fund_report"))


class ObservationPreparationTests(unittest.TestCase):
    def test_collapses_horizons_and_selects_amended_status(self) -> None:
        source = Path(self._testMethodName + ".csv")
        source.write_text(
            "report_date,report_status,fund_name_raw,management_company_raw,nav_value,category,source_page,source_file,horizon\n"
            "2026-07-30,Original,Exact Fund,Exact Manager,12.34,Open End Fund,1,first.webp,1y\n"
            "2026-07-30,Amended,Exact Fund,Exact Manager,12.34,Open End Fund,1,second.webp,5y\n",
            encoding="utf-8",
        )
        try:
            rows, summary = MODULE.prepare_observations(source, {("Exact Fund", "Exact Manager"): "fund-1"}, date(2026, 8, 26))
        finally:
            source.unlink(missing_ok=True)
        self.assertEqual(summary["eligible_unique_fund_date_observations"], 1)
        self.assertEqual(rows[0]["report_status"], "Amended")
        self.assertEqual(rows[0]["collapsed_source_row_count"], 2)

    def test_rejects_conflicting_nav_for_one_fund_date(self) -> None:
        source = Path(self._testMethodName + ".csv")
        source.write_text(
            "report_date,report_status,fund_name_raw,management_company_raw,nav_value,category,source_page,source_file,horizon\n"
            "2026-07-30,Original,Exact Fund,Exact Manager,12.34,Open End Fund,1,first.webp,1y\n"
            "2026-07-30,Original,Exact Fund,Exact Manager,13.34,Open End Fund,1,first.webp,5y\n",
            encoding="utf-8",
        )
        try:
            rows, summary = MODULE.prepare_observations(source, {("Exact Fund", "Exact Manager"): "fund-1"}, date(2026, 8, 26))
        finally:
            source.unlink(missing_ok=True)
        self.assertEqual(rows, [])
        self.assertEqual(summary["conflicting_fund_date_groups_excluded"], 1)

    def test_rejects_future_dates(self) -> None:
        source = Path(self._testMethodName + ".csv")
        source.write_text(
            "report_date,report_status,fund_name_raw,management_company_raw,nav_value,category,source_page,source_file,horizon\n"
            "2026-08-27,Original,Exact Fund,Exact Manager,12.34,Open End Fund,1,first.webp,1y\n",
            encoding="utf-8",
        )
        try:
            rows, summary = MODULE.prepare_observations(source, {("Exact Fund", "Exact Manager"): "fund-1"}, date(2026, 8, 26))
        finally:
            source.unlink(missing_ok=True)
        self.assertEqual(rows, [])
        self.assertEqual(summary["excluded_input_rows"]["future_valuation_date"], 1)


if __name__ == "__main__":
    unittest.main()

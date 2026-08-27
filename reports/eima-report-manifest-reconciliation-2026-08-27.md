# EIMA 31-Report Manifest Reconciliation — 27 August 2026

The user confirmed that the uploaded CSV is a consolidation of 31 weekly EIMA fund-performance reports listed on EIMA’s official reports index.[1] This reconciliation compares those 31 canonical report dates with the CSV `report_date` field. It does not change fund-price observations.

| Control | Result |
| --- | --- |
| Reports in reconciled manifest | 31 |
| Distinct `report_date` values in CSV | 31 |
| Manifest dates absent from CSV | 0 |
| CSV dates absent from manifest | 0 |
| Source classification | Review-only historical association source; not validated NAV |

## Explicit date correction

The EIMA page visually labels the final February entry as **February 29th, 2026**, but 2026 is not a leap year. Its linked PDF filename states `Performance-26-February-2026-Time-Weighted.pdf`, and the CSV correctly uses **2026-02-26**. The canonical date used in the import is consequently 26 February 2026; the page label is preserved below for audit clarity.

## Reconciled report manifest

| Canonical report date | EIMA page label | CSV rows | Official PDF |
| --- | --- | ---: | --- |
| 2025-12-31 | December 31st, 2025 | 1080 | [Report PDF](http://eima.org.eg/wp-content/uploads/2026/04/Performance-31-December-2025-Time-Weighted-Final.pdf) |
| 2026-01-08 | January 08th, 2026 | 1620 | [Report PDF](http://eima.org.eg/wp-content/uploads/2026/03/Performance-8-January-2026-Time-Weighted.pdf) |
| 2026-01-15 | January 15th, 2026 | 1620 | [Report PDF](http://eima.org.eg/wp-content/uploads/2026/03/Performance-15-January-2026-Time-Weighted.pdf) |
| 2026-01-22 | January 22th, 2026 | 1620 | [Report PDF](http://eima.org.eg/wp-content/uploads/2026/03/Performance-22-January-2026-Time-Weighted.pdf) |
| 2026-01-29 | January 29th, 2026 | 1656 | [Report PDF](http://eima.org.eg/wp-content/uploads/2026/03/Performance-29-January-2026-Time-Weighted.pdf) |
| 2026-02-05 | February 05th, 2026 | 1665 | [Report PDF](http://eima.org.eg/wp-content/uploads/2026/03/Performance-5-February-2026-Time-Weighted.pdf) |
| 2026-02-12 | February 12th, 2026 | 1674 | [Report PDF](http://eima.org.eg/wp-content/uploads/2026/03/Performance-12-February-2026-Time-Weighted.pdf) |
| 2026-02-19 | February 19th, 2026 | 1674 | [Report PDF](http://eima.org.eg/wp-content/uploads/2026/03/Performance-19-February-2026-Time-Weighted.pdf) |
| 2026-02-26 | February 29th, 2026 (site label; PDF filename confirms 26-Feb) | 1692 | [Report PDF](http://eima.org.eg/wp-content/uploads/2026/03/Performance-26-February-2026-Time-Weighted.pdf) |
| 2026-03-05 | March 05th, 2026 | 1683 | [Report PDF](http://eima.org.eg/wp-content/uploads/2026/03/Performance-5-March-2026-Time-Weighted.pdf) |
| 2026-03-12 | March 12th, 2026 | 1692 | [Report PDF](http://eima.org.eg/wp-content/uploads/2026/03/Performance-12-March-2026-Time-Weighted.pdf) |
| 2026-03-19 | March 19th, 2026 | 1710 | [Report PDF](http://eima.org.eg/wp-content/uploads/2026/04/Performance-19-March-2026-Time-Weighted.pdf) |
| 2026-03-26 | March 26th, 2026 | 1710 | [Report PDF](http://eima.org.eg/wp-content/uploads/2026/04/Performance-26-March-2026-Time-Weighted.pdf) |
| 2026-04-02 | April 02nd, 2026 (Amended) | 1710 | [Report PDF](http://eima.org.eg/wp-content/uploads/2026/04/Amended-Performance-02-April-2026-Time-Weighted1.pdf) |
| 2026-04-09 | April 09th, 2026 | 1764 | [Report PDF](http://eima.org.eg/wp-content/uploads/2026/04/Performance-09-April-2026-Time-Weighted.pdf) |
| 2026-04-16 | April 16th, 2026 (Edited) | 1764 | [Report PDF](http://eima.org.eg/wp-content/uploads/2026/04/Edited-Performance-16-April-2026-Time-Weighted.pdf) |
| 2026-04-23 | April 23rd, 2026 | 1764 | [Report PDF](http://eima.org.eg/wp-content/uploads/2026/04/Performance-23-April-2026-Time-Weighted.pdf) |
| 2026-04-30 | April 30th, 2026 | 1764 | [Report PDF](http://eima.org.eg/wp-content/uploads/2026/05/Performance-30-April-2026-Time-Weighted.pdf) |
| 2026-05-07 | May 07th, 2026 | 1764 | [Report PDF](http://eima.org.eg/wp-content/uploads/2026/05/Performance-07-May-2026-Time-Weighted.pdf) |
| 2026-05-14 | May 14th, 2026 | 1764 | [Report PDF](http://eima.org.eg/wp-content/uploads/2026/05/Performance-14-May-2026-Time-Weighted.pdf) |
| 2026-05-21 | May 21st, 2026 | 1764 | [Report PDF](http://eima.org.eg/wp-content/uploads/2026/06/Performance-21-May-2026-Time-Weighted.pdf) |
| 2026-05-28 | May 28th, 2026 | 1764 | [Report PDF](http://eima.org.eg/wp-content/uploads/2026/06/Performance-28-May-2026-Time-Weighted.pdf) |
| 2026-06-04 | June 04th, 2026 | 1764 | [Report PDF](http://eima.org.eg/wp-content/uploads/2026/06/Performance-04-June-2026-Time-Weighted.pdf) |
| 2026-06-11 | June 11th, 2026 | 1764 | [Report PDF](http://eima.org.eg/wp-content/uploads/2026/06/Performance-11-June-2026-Time-Weighted.pdf) |
| 2026-06-18 | June 18th, 2026 | 1764 | [Report PDF](http://eima.org.eg/wp-content/uploads/2026/07/Performance-18-June-2026-Time-Weighted.pdf) |
| 2026-06-25 | June 25th, 2026 | 1773 | [Report PDF](http://eima.org.eg/wp-content/uploads/2026/07/Performance-25-June-2026-Time-Weighted.pdf) |
| 2026-07-02 | July 02nd, 2026 | 1773 | [Report PDF](http://eima.org.eg/wp-content/uploads/2026/07/Performance-02-of-July-2026-Time-Weighted.pdf) |
| 2026-07-09 | July 09th, 2026 | 1773 | [Report PDF](http://eima.org.eg/wp-content/uploads/2026/07/Performance-09-of-July-2026-Time-Weighted.pdf) |
| 2026-07-16 | July 16th, 2026 | 1773 | [Report PDF](http://eima.org.eg/wp-content/uploads/2026/07/Performance-16-of-July-2026-Time-Weighted.pdf) |
| 2026-07-23 | July 23rd, 2026 | 1800 | [Report PDF](http://eima.org.eg/wp-content/uploads/2026/07/Performance-23-of-July-2026-Time-Weighted1.pdf) |
| 2026-07-30 | July 30th, 2026 | 1818 | [Report PDF](http://eima.org.eg/wp-content/uploads/2026/08/Performance-30-of-July-2026-Time-Weighted.pdf) |

## References

[1] [EIMA Reports Index](https://eima.org.eg/?page_id=1886)

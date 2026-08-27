export type TrackRecordPeriod = "all" | "1y" | "2y" | "3y" | "4y" | "5y" | "6y" | "last12m";
export type MarketCriterion = "best_category" | "tbills" | "usd_egp" | "gold_egp" | "egx30";

export type UniverseFilterItem = {
  canonicalName: string;
  manager: string | null;
  category: string | null;
  fundType: string;
  currency: string | null;
  active: boolean;
  dataAvailability: string;
  naturalBenchmark: string | null;
  smartScore: number | null;
  returns: Record<string, number | null>;
};

export type UniverseFilters = {
  search: string;
  category: string;
  manager: string;
  fundType: string;
  currency: string;
  activeStatus: "all" | "active" | "inactive";
  availability: string;
  period: TrackRecordPeriod;
  criterion: MarketCriterion | null;
};

const ALL = "__all__";

function categoryBestScores<T extends UniverseFilterItem>(items: T[]) {
  const best = new Map<string, number>();
  for (const item of items) {
    if (!item.category || item.smartScore === null) continue;
    best.set(item.category, Math.max(best.get(item.category) ?? -Infinity, item.smartScore));
  }
  return best;
}

function matchesCriterion<T extends UniverseFilterItem>(item: T, criterion: MarketCriterion | null, bestScores: Map<string, number>) {
  if (!criterion) return true;
  if (criterion === "best_category") return item.category !== null && item.smartScore !== null && item.smartScore === bestScores.get(item.category);
  const benchmarks: Record<Exclude<MarketCriterion, "best_category">, string> = {
    tbills: "TBILLS",
    usd_egp: "USD",
    gold_egp: "GOLD",
    egx30: "EGX30",
  };
  return item.naturalBenchmark === benchmarks[criterion];
}

export function filterUniverseItems<T extends UniverseFilterItem>(items: T[], filters: UniverseFilters): T[] {
  const search = filters.search.trim().toLocaleLowerCase();
  const bestScores = categoryBestScores(items);
  return items.filter((item) => {
    const matchesSearch = !search || `${item.canonicalName} ${item.manager ?? ""}`.toLocaleLowerCase().includes(search);
    const matchesCategory = filters.category === ALL || item.category === filters.category;
    const matchesManager = filters.manager === ALL || item.manager === filters.manager;
    const matchesType = filters.fundType === ALL || item.fundType === filters.fundType;
    const matchesCurrency = filters.currency === ALL || item.currency === filters.currency;
    const matchesActivity = filters.activeStatus === "all" || (filters.activeStatus === "active" ? item.active : !item.active);
    const matchesAvailability = filters.availability === ALL || item.dataAvailability === filters.availability;
    const matchesPeriod = filters.period === "all" || item.returns[filters.period] !== null;
    return matchesSearch && matchesCategory && matchesManager && matchesType && matchesCurrency && matchesActivity && matchesAvailability && matchesPeriod && matchesCriterion(item, filters.criterion, bestScores);
  });
}

const csvCell = (value: string | number | null | undefined) => `"${String(value ?? "").replaceAll('"', '""')}"`;

export function buildFundUniverseCsv<T extends UniverseFilterItem>(items: T[]) {
  const columns = ["الصندوق", "شركة الإدارة", "الفئة", "النوع", "العملة", "الحالة", "توافر البيانات", "SmartScore", "عائد YTD", "المرجع الطبيعي"];
  const rows = items.map((item) => [item.canonicalName, item.manager, item.category, item.fundType, item.currency, item.active ? "نشط" : "غير نشط", item.dataAvailability, item.smartScore, item.returns.ytd, item.naturalBenchmark]);
  return `\uFEFF${[columns, ...rows].map((row) => row.map(csvCell).join(",")).join("\r\n")}`;
}

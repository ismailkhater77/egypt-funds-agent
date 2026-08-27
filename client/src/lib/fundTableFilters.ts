export type NavAvailabilityFilter = string;

export interface FundTableItem {
  canonical_name: string;
  category: string | null;
  verified: boolean;
}

export function filterFundTableItems<T extends FundTableItem>(
  funds: T[],
  options: { query: string; category: string; navStatus: NavAvailabilityFilter; limit?: number },
): T[] {
  const query = options.query.trim().toLocaleLowerCase();
  const limit = options.limit ?? 80;

  return funds.filter((fund) => {
    const matchesQuery = !query || fund.canonical_name.toLocaleLowerCase().includes(query);
    const matchesCategory = options.category === "all" || fund.category === options.category;
    const matchesNav = options.navStatus === "all" || (options.navStatus === "verified" ? fund.verified : !fund.verified);
    return matchesQuery && matchesCategory && matchesNav;
  }).slice(0, limit);
}

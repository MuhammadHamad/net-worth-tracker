// Currency-agnostic net-worth milestones (work reasonably for PKR, USD, etc.).
export const MILESTONES = [
  10_000, 50_000, 100_000, 250_000, 500_000,
  1_000_000, 2_500_000, 5_000_000, 10_000_000,
  25_000_000, 50_000_000, 100_000_000,
];

/** The highest milestone the given net worth has reached, or 0 if below the first. */
export function highestMilestone(netWorth: number): number {
  let reached = 0;
  for (const m of MILESTONES) {
    if (netWorth >= m) reached = m;
    else break;
  }
  return reached;
}

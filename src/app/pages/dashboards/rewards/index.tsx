import { useState } from "react";
import { useConnection } from "wagmi";
import { Page } from "@/components/shared/Page";
import { Button, Card, Box } from "@/components/ui";
//import { UserIcon, ChevronDoubleUpIcon } from "@heroicons/react/24/outline";
// ── Constants ───────────────────────────────────────────────────────────────

const RANKS = [
  { level: 1, name: "Amaranth", price: 20, color: "#fca5a5" },
  { level: 2, name: "Jasmine", price: 25, color: "#fcd34d" },
  { level: 3, name: "Carnation", price: 50, color: "#fde047" },
  { level: 4, name: "Marigold", price: 200, color: "#a3e635" },
  { level: 5, name: "Rose", price: 500, color: "#4ade80" },
  { level: 6, name: "Lily", price: 1000, color: "#2dd4bf" },
  { level: 7, name: "Lavender", price: 2000, color: "#22d3ee" },
  { level: 8, name: "Chrysanthemum", price: 3000, color: "#60a5fa" },
  { level: 9, name: "Hibiscus", price: 40000, color: "#a78bfa" },
  { level: 10, name: "Osmanthus", price: 50000, color: "#a855f7" },
] as const;

// Step-up prices per level used in the gifting income table
// (levels 9–10 use 4000/5000, distinct from the rank upgrade prices in RANKS)
const GIFTING_STEP_PRICES = [20, 25, 50, 200, 500, 1000, 2000, 3000, 4000, 5000];

const GIFTING_TABLE = GIFTING_STEP_PRICES.map((price, i) => {
  const level = i + 1;
  const members = Math.pow(3, level);
  const lfx = members * price * 0.5;
  const net = lfx - (GIFTING_STEP_PRICES[i + 1] ?? 0);
  return { level, price, members, lfx, net };
});

const MIN_DEPOSIT = 20;
const MIN_WITHDRAW = 10;

// ── Placeholder data (replace with contract reads) ──────────────────────────

const MOCK = {
  isRegistered: true,
  rank: 0,
  directIncome: 0,
  unilevelIncome: 0,
  totalIncome: 0,
  availableBalance: 0,
  directReferrals: 0,
  genealogy: [] as { address: string; rank: number; level: number }[],
};

// ── Sub-components ───────────────────────────────────────────────────────────

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <Card skin="bordered" className="overflow-hidden">
      <Box className="border-b border-gray-100 p-5 dark:border-dark-600">
        <h3 className="text-sm font-semibold text-gray-800 dark:text-dark-50">{title}</h3>
      </Box>
      <Box className="p-5">{children}</Box>
    </Card>
  );
}

function Stat({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <Card skin="bordered" className="flex flex-1 flex-col gap-0.5 p-3">
      <span className="text-xs text-gray-500 dark:text-dark-400">{label}</span>
      <span className="text-lg font-semibold text-gray-900 dark:text-dark-50">{value}</span>
      {sub && <span className="text-xs text-gray-400 dark:text-dark-500">{sub}</span>}
    </Card>
  );
}

// ── Page ─────────────────────────────────────────────────────────────────────

type Tab = "overview" | "deposit" | "rankup" | "withdraw" | "genealogy";

export default function RewardsPage() {
  const { address } = useConnection();

  const [tab, setTab] = useState<Tab>("overview");
  const [sponsorInput, setSponsorInput] = useState("");
  const [depositAmt, setDepositAmt] = useState("");
  const [selectedRank, setSelectedRank] = useState<number | null>(null);
  const [withdrawAmt, setWithdrawAmt] = useState("");

  const isRegistered = MOCK.isRegistered;
  const currentRank = RANKS.find((r) => r.level === MOCK.rank);

  // ── Registration gate ───────────────────────────────────────────────────

  if (!isRegistered) {
    return (
      <Page title="Rewards">
        <div className="transition-content w-full bg-gradient-to-br from-emerald-50 via-white to-indigo-50 px-(--margin-x) pt-5 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 lg:pt-6">
          <h2 className="mb-5 text-xl font-medium tracking-wide text-gray-800 dark:text-dark-50">Rewards</h2>
          <Box className="mx-auto max-w-md">
            <Section title="Register">
              <div className="flex flex-col gap-4">
                <p className="text-sm text-gray-500 dark:text-dark-400">
                  You must register with a valid sponsor address before accessing the rewards system.
                </p>
                <div>
                  <label className="mb-1 block text-xs font-medium text-gray-600 dark:text-dark-300">Your Wallet</label>
                  <Box className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 font-mono text-xs text-gray-500 dark:border-dark-500 dark:bg-dark-800 dark:text-dark-400">
                    {address ?? "Not connected"}
                  </Box>
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-gray-600 dark:text-dark-300">Sponsor Address</label>
                  <input
                    value={sponsorInput}
                    onChange={(e) => setSponsorInput(e.target.value)}
                    placeholder="0x..."
                    className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm dark:border-dark-500 dark:bg-dark-800 dark:text-dark-50"
                  />
                  <p className="mt-1 text-xs text-gray-400 dark:text-dark-500">Must be a valid registered wallet address.</p>
                </div>
                <Button color="primary" className="w-full" disabled={!sponsorInput || !address}
                  onClick={() => { /* TODO: call genealogy.register(sponsorInput) */ }}>
                  Register
                </Button>
              </div>
            </Section>
          </Box>
        </div>
      </Page>
    );
  }

  // ── Main UI (post-registration) ──────────────────────────────────────────

  const tabs: { id: Tab; label: string }[] = [
    { id: "overview", label: "Overview" },
    { id: "deposit", label: "Deposit" },
    { id: "rankup", label: "Rank Up" },
    { id: "withdraw", label: "Withdraw" },
    { id: "genealogy", label: "Genealogy" },
  ];

  return (
    <Page title="Rewards">
      <div className="transition-content w-full bg-gradient-to-br from-emerald-50 via-white to-indigo-50 px-(--margin-x) pt-5 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 lg:pt-6">

        {/* Header */}
        <Box className="mb-5 flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-xl font-medium tracking-wide text-gray-800 dark:text-dark-50">Rewards</h2>
          <span className="text-xs text-gray-500 dark:text-dark-400">
            Rank:{" "}
            <span className="font-semibold text-primary-600 dark:text-primary-400">
              {currentRank ? `Lv.${currentRank.level} ${currentRank.name}` : "Unranked"}
            </span>
          </span>
        </Box>

        {/* Tabs */}
        <Card skin="bordered" className="mb-5 flex gap-1 overflow-x-auto p-1">
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`shrink-0 rounded-md px-3 py-2 text-sm font-medium transition-colors ${tab === t.id
                ? "bg-white text-primary-600 shadow-sm dark:bg-dark-600 dark:text-primary-400"
                : "text-gray-500 hover:text-gray-700 dark:text-dark-300 dark:hover:text-dark-100"
                }`}
            >
              {t.label}
            </button>
          ))}
        </Card>

        {/* OVERVIEW */}
        {tab === "overview" && (
          <div className="flex flex-col gap-4">
            <Box className="flex flex-wrap gap-3">
              <Stat label="Total Income" value={`${MOCK.totalIncome} USDT`} />
              <Stat label="Direct Referral" value={`${MOCK.directIncome} USDT`} sub={`${MOCK.directReferrals} referrals`} />
              <Stat label="Unilevel Income" value={`${MOCK.unilevelIncome} USDT`} sub="Up to 10 levels" />
              <Stat label="Available Balance" value={`${MOCK.availableBalance} USDT`} />
            </Box>

            <Section title="Pay Plan Explanation">
              <div className="flex flex-col gap-8">

                {/* ── 1. Allocation Breakdown ── */}
                <div>
                  <h4 className="mb-3 text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-dark-500">Rank Activation Allocation</h4>
                  <Card skin="bordered" className="p-4">
                    <p className="mb-3 text-xs text-gray-500 dark:text-dark-400">
                      When you activate a tea rank, the activation cost is distributed as follows:
                    </p>
                    {/* Allocation bar */}
                    <div className="mb-3 flex h-8 w-full overflow-hidden rounded-lg">
                      <div className="flex h-full w-[50%] items-center justify-center bg-green-500 text-[10px] font-bold text-white">50%</div>
                      <div className="flex h-full w-[30%] items-center justify-center bg-amber-500 text-[10px] font-bold text-white">30%</div>
                      <div className="flex h-full w-[10%] items-center justify-center bg-blue-500 text-[10px] font-bold text-white">10%</div>
                      <div className="flex h-full w-[10%] items-center justify-center bg-violet-500 text-[10px] font-bold text-white">10%</div>
                    </div>
                    {/* Legend */}
                    <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                      {[
                        { color: "bg-green-500", label: "Gifting (Direct)", pct: "50%" },
                        { color: "bg-amber-500", label: "Product Points", pct: "30%" },
                        { color: "bg-blue-500", label: "Unilevel (Upline)", pct: "10%" },
                        { color: "bg-violet-500", label: "Liquidity Pool", pct: "10%" },
                      ].map((item) => (
                        <div key={item.label} className="flex items-center gap-2">
                          <div className={`h-3 w-3 shrink-0 rounded ${item.color}`} />
                          <div>
                            <span className="block text-[10px] font-semibold text-gray-700 dark:text-dark-200">{item.pct}</span>
                            <span className="block text-[8px] text-gray-500 dark:text-dark-400">{item.label}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </Card>
                </div>

                {/* ── 2. Tea Rank Staircase ── */}
                <div>
                  <h4 className="mb-3 text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-dark-500">Tea Rank Progression</h4>
                  {/* Staircase bars — height proportional to log scale */}
                  <Card skin="bordered" className="overflow-hidden p-4">
                    {(() => {
                      const BAR_H = 96;
                      const logMin = Math.log10(15);
                      const logMax = Math.log10(60000);
                      const bars = RANKS.map((r) => {
                        const pct = ((Math.log10(r.price) - logMin) / (logMax - logMin)) * 85 + 15;
                        return { ...r, barPx: Math.round((pct / 100) * BAR_H) };
                      });
                      return (
                        <>
                          {/* Relative container — bars use absolute bottom:0 to anchor at baseline */}
                          <div className="relative flex gap-1" style={{ height: BAR_H }}>
                            {bars.map((r) => (
                              <div key={r.level} className="relative flex-1">
                                <div
                                  className={`absolute bottom-0 left-0 right-0 rounded-t transition-all ${r.level === MOCK.rank ? "ring-2 ring-offset-1 ring-primary-500" : ""}`}
                                  style={{ height: r.barPx, backgroundColor: r.color }}
                                />
                              </div>
                            ))}
                          </div>
                          {/* Labels row */}
                          <div className="mt-1 flex gap-1">
                            {bars.map((r) => (
                              <span key={r.level} className="flex-1 text-center text-[9px] font-medium text-gray-500 dark:text-dark-400">
                                {r.name.slice(0, 3)}
                              </span>
                            ))}
                          </div>
                        </>
                      );
                    })()}
                    {/* Price table below chart */}
                    <div className="mt-3 overflow-x-auto">
                      <table className="w-full min-w-[500px] text-xs">
                        <thead>
                          <tr className="border-b border-gray-100 dark:border-dark-600">
                            <th className="pb-1 text-left font-medium text-gray-400 dark:text-dark-500">Lv.</th>
                            <th className="pb-1 text-left font-medium text-gray-400 dark:text-dark-500">Tea Rank</th>
                            <th className="pb-1 text-right font-medium text-gray-400 dark:text-dark-500">Price (USDT)</th>
                            <th className="pb-1 text-right font-medium text-gray-400 dark:text-dark-500">Cumulative</th>
                          </tr>
                        </thead>
                        <tbody>
                          {(() => {
                            let cum = 0;
                            return RANKS.map((r, i) => {
                              cum += r.price;
                              const isCur = r.level === MOCK.rank;
                              return (
                                <tr key={r.level} className={`${i < RANKS.length - 1 ? "border-b border-gray-50 dark:border-dark-700" : ""} ${isCur ? "bg-primary-50 font-semibold dark:bg-primary-900/10" : ""}`}>
                                  <td className="py-1.5 text-gray-400 dark:text-dark-500">{r.level}</td>
                                  <td className="py-1.5 text-gray-700 dark:text-dark-200">{r.name} {isCur && <span className="ml-1 rounded bg-primary-100 px-1 text-[9px] text-primary-700 dark:bg-primary-900/30 dark:text-primary-400">Current</span>}</td>
                                  <td className="py-1.5 text-right text-gray-700 dark:text-dark-200">{r.price.toLocaleString()}</td>
                                  <td className="py-1.5 text-right text-gray-400 dark:text-dark-500">{cum.toLocaleString()}</td>
                                </tr>
                              );
                            });
                          })()}
                        </tbody>
                      </table>
                    </div>
                  </Card>
                </div>

                {/* ── 3. Auto-Upgrade Mechanism ── */}
                <div>
                  <h4 className="mb-3 text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-dark-500">Auto-Upgrade: Geometric Network Progression</h4>
                  <Card skin="bordered" className="mb-3 p-4">
                    <p className="mb-3 text-xs text-gray-500 dark:text-dark-400">
                      <span className="font-semibold text-gray-800 dark:text-dark-100">Auto-upgrade tracks your network at each depth level.</span> When you reach a threshold of 3^N referrals at depth N with tea rank N, you automatically upgrade to the next rank — <span className="font-semibold">no manual payment needed</span>.
                    </p>
                    {/* Thresholds table */}
                    <div className="overflow-x-auto">
                      <table className="w-full text-[10px]">
                        <thead>
                          <tr className="border-b border-gray-200 dark:border-dark-600">
                            <th className="px-2 py-1 text-left text-gray-500 dark:text-dark-400">Promote To</th>
                            <th className="px-2 py-1 text-center text-gray-500 dark:text-dark-400">Network Level</th>
                            <th className="px-2 py-1 text-right text-gray-500 dark:text-dark-400">Threshold (3^n)</th>
                            <th className="px-2 py-1 text-right text-gray-500 dark:text-dark-400">Referrals Needed</th>
                          </tr>
                        </thead>
                        <tbody>
                          {[
                            { rank: "Jasmine (2)", level: 1, threshold: "3^1", count: 3 },
                            { rank: "Carnation (3)", level: 2, threshold: "3^2", count: 9 },
                            { rank: "Marigold (4)", level: 3, threshold: "3^3", count: 27 },
                            { rank: "Rose (5)", level: 4, threshold: "3^4", count: 81 },
                            { rank: "Lily (6)", level: 5, threshold: "3^5", count: 243 },
                            { rank: "Lavender (7)", level: 6, threshold: "3^6", count: 729 },
                            { rank: "Chrysanthemum (8)", level: 7, threshold: "3^7", count: 2187 },
                            { rank: "Hibiscus (9)", level: 8, threshold: "3^8", count: 6561 },
                            { rank: "Osmanthus (10)", level: 9, threshold: "3^9", count: 19683 },
                          ].map((row, i) => (
                            <tr key={row.rank} className={`${i < 8 ? "border-b border-gray-100 dark:border-dark-700" : ""}`}>
                              <td className="px-2 py-1 font-medium text-gray-700 dark:text-dark-200">{row.rank}</td>
                              <td className="px-2 py-1 text-center text-gray-600 dark:text-dark-300">Level {row.level}</td>
                              <td className="px-2 py-1 text-right text-gray-600 dark:text-dark-300">{row.threshold}</td>
                              <td className="px-2 py-1 text-right font-semibold text-amber-600 dark:text-amber-400">{row.count.toLocaleString()}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </Card>

                  {/* Depth-based auto-upgrade visual */}
                  <Card skin="bordered" className="p-4">
                    <p className="mb-3 text-xs font-semibold text-gray-700 dark:text-dark-200">How It Works: Depth-Based Triggering</p>
                    <div className="space-y-3">
                      {/* Example for Rank 1 */}
                      <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 dark:border-amber-800 dark:bg-amber-900/10">
                        <p className="mb-2 text-[10px] font-semibold text-amber-900 dark:text-amber-200">Example: You at Rank 1 → Auto-Upgrade to Rank 2</p>
                        <div className="ml-2 space-y-1 border-l-2 border-amber-300 pl-3 dark:border-amber-700">
                          <p className="text-[9px] text-amber-800 dark:text-amber-300">
                            <span className="font-semibold">Trigger:</span> 3 of your <span className="font-semibold">direct referrals</span> (Level 1) activate at Rank 1
                          </p>
                          <p className="text-[9px] text-amber-800 dark:text-amber-300">
                            <span className="font-semibold">Counter:</span> account[you][1][1] ≥ 3 ✓
                          </p>
                          <p className="text-[9px] text-amber-800 dark:text-amber-300">
                            <span className="font-semibold">Result:</span> Automatic promotion to Rank 2 (Jasmine)
                          </p>
                        </div>
                      </div>

                      {/* Example for Rank 2 */}
                      <div className="rounded-lg border border-blue-200 bg-blue-50 p-3 dark:border-blue-800 dark:bg-blue-900/10">
                        <p className="mb-2 text-[10px] font-semibold text-blue-900 dark:text-blue-200">Example: You at Rank 2 → Auto-Upgrade to Rank 3</p>
                        <div className="ml-2 space-y-1 border-l-2 border-blue-300 pl-3 dark:border-blue-700">
                          <p className="text-[9px] text-blue-800 dark:text-blue-300">
                            <span className="font-semibold">Trigger:</span> 9 of your <span className="font-semibold">level-2 referrals</span> (grandchildren) activate at Rank 2
                          </p>
                          <p className="text-[9px] text-blue-800 dark:text-blue-300">
                            <span className="font-semibold">Counter:</span> account[you][2][2] ≥ 9 ✓
                          </p>
                          <p className="text-[9px] text-blue-800 dark:text-blue-300">
                            <span className="font-semibold">Result:</span> Automatic promotion to Rank 3 (Carnation)
                          </p>
                        </div>
                      </div>
                    </div>
                  </Card>
                </div>

                {/* ── 4. Gifting (Direct Sponsor Income) ── */}
                <div>
                  <h4 className="mb-3 text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-dark-500">Gifting & Auto Upgrade</h4>

                </div>

                {/* ── 5. Direct Referral Income Table ── */}
                <div>
                  <h4 className="mb-3 text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-dark-500">Direct Referral Income — Gifting</h4>
                  <Card skin="bordered" className="overflow-x-auto">
                    <table className="w-full min-w-[560px] text-xs">
                      <thead>
                        <tr className="border-b border-gray-100 bg-gray-50 dark:border-dark-600 dark:bg-dark-800">
                          <th className="px-3 py-2 text-left font-medium text-gray-500 dark:text-dark-400">Lv.</th>
                          <th className="px-3 py-2 text-left font-medium text-gray-500 dark:text-dark-400">Tea Rank</th>
                          <th className="px-3 py-2 text-right font-medium text-gray-500 dark:text-dark-400">Step Up</th>
                          <th className="px-3 py-2 text-right font-medium text-gray-500 dark:text-dark-400">Members (3ⁿ)</th>
                          <th className="px-3 py-2 text-center font-medium text-gray-500 dark:text-dark-400">%</th>
                          <th className="px-3 py-2 text-right font-medium text-gray-500 dark:text-dark-400">LFX</th>
                          <th className="px-3 py-2 text-right font-medium text-gray-500 dark:text-dark-400">NET</th>
                        </tr>
                      </thead>
                      <tbody>
                        {GIFTING_TABLE.map((row, i) => {
                          const rank = RANKS[i];
                          const fmt = (n: number) =>
                            n >= 1_000_000 ? `${(n / 1_000_000).toFixed(2)}M`
                              : n >= 1_000 ? `${(n / 1_000).toFixed(1)}K`
                                : n % 1 !== 0 ? n.toFixed(1)
                                  : n.toLocaleString();
                          return (
                            <tr key={row.level} className={`${i < GIFTING_TABLE.length - 1 ? "border-b border-gray-50 dark:border-dark-700" : ""}`}>
                              <td className="px-3 py-2 text-gray-400 dark:text-dark-500">{row.level}</td>
                              <td className="px-3 py-2">
                                <span className="inline-flex items-center gap-1.5">
                                  <span className="inline-block h-2 w-2 rounded-sm" style={{ backgroundColor: rank.color }} />
                                  <span className="font-medium text-gray-700 dark:text-dark-200">{rank.name}</span>
                                </span>
                              </td>
                              <td className="px-3 py-2 text-right text-gray-600 dark:text-dark-300">{row.price.toLocaleString()}</td>
                              <td className="px-3 py-2 text-right text-gray-600 dark:text-dark-300">{row.members.toLocaleString()}</td>
                              <td className="px-3 py-2 text-center text-gray-400 dark:text-dark-500">50%</td>
                              <td className="px-3 py-2 text-right text-green-600 dark:text-green-400">{fmt(row.lfx)}</td>
                              <td className="px-3 py-2 text-right font-semibold text-gray-800 dark:text-dark-100">{fmt(row.net)}</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </Card>
                </div>

                {/* ── 6. Unilevel ── */}
                <div>
                  <h4 className="mb-3 text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-dark-500">Unilevel — 1% × 10 Levels = 10% Total</h4>

                  {/* Rule pill + bar */}
                  <Card skin="bordered" className="mb-3 p-4">
                    <p className="mb-3 text-xs text-gray-500 dark:text-dark-400">
                      Every tea rank earns <span className="font-semibold text-gray-800 dark:text-dark-100">1% per network level</span> up to 10 levels deep — for a maximum of <span className="font-semibold text-gray-800 dark:text-dark-100">10% total</span> per activation. The qualifier is simple: <span className="font-semibold text-gray-800 dark:text-dark-100">you only earn if the activating member is at the same tea rank as you or lower.</span>
                    </p>
                    {/* 10-block bar */}
                    <div className="flex gap-0.5">
                      {Array.from({ length: 10 }, (_, i) => i + 1).map((lv) => (
                        <div key={lv} className="flex flex-1 flex-col items-center gap-1">
                          <div className="flex h-8 w-full items-center justify-center rounded bg-blue-100 text-[10px] font-bold text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
                            1%
                          </div>
                          <span className="text-[8px] text-gray-400 dark:text-dark-500">L{lv}</span>
                        </div>
                      ))}
                    </div>
                    <div className="mt-1 flex items-center justify-end gap-1">
                      <div className="h-px flex-1 bg-blue-200 dark:bg-blue-900/30" />
                      <span className="text-[10px] font-semibold text-blue-600 dark:text-blue-400">= 10% max per activation</span>
                    </div>

                    {/* Qualifier rule */}
                    <div className="mt-3 grid grid-cols-2 gap-2">
                      <div className="rounded-lg border border-green-200 bg-green-50 px-3 py-2 dark:border-green-800 dark:bg-green-900/10">
                        <p className="text-[10px] font-semibold text-green-700 dark:text-green-400">✓ You Earn</p>
                        <p className="text-[10px] text-green-600 dark:text-green-500">Activating member's tea rank is the same as yours or lower</p>
                      </div>
                      <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 dark:border-red-800 dark:bg-red-900/10">
                        <p className="text-[10px] font-semibold text-red-700 dark:text-red-400">✗ Skipped</p>
                        <p className="text-[10px] text-red-600 dark:text-red-500">Activating member's tea rank is higher than yours</p>
                      </div>
                    </div>
                  </Card>

                  {/* Network depth visual */}
                  <Card skin="bordered" className="mb-3 p-4">
                    <p className="mb-3 text-xs font-semibold text-gray-700 dark:text-dark-200">Network Depth (assuming 3 direct sponsors per member)</p>
                    <div className="flex flex-col gap-0">
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary-500 text-[9px] font-bold text-white">YOU</div>
                        <span className="text-xs text-gray-500 dark:text-dark-400">Your Network Root</span>
                      </div>
                      {(() => {
                        let members = 1;
                        let cumulative = 0;
                        return Array.from({ length: 10 }, (_, i) => {
                          members = members * 3;
                          cumulative += members;
                          const barPct = Math.min((members / 59049) * 100, 100);
                          return (
                            <div key={i} className="flex items-center gap-3 pl-4">
                              <div className="flex w-px self-stretch bg-gray-200 dark:bg-dark-600" />
                              <div className="my-0.5 flex flex-1 items-center gap-2 rounded-lg border border-gray-100 px-3 py-1.5 dark:border-dark-700">
                                <span className="w-10 shrink-0 text-center text-[9px] font-bold text-gray-400 dark:text-dark-500">L{i + 1}</span>
                                <div className="flex-1">
                                  <div className="mb-0.5 flex items-center justify-between">
                                    <span className="text-[10px] text-gray-600 dark:text-dark-300">{members.toLocaleString()} members</span>
                                    <span className="text-[10px] font-semibold text-blue-600 dark:text-blue-400">1% each</span>
                                  </div>
                                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-gray-100 dark:bg-dark-700">
                                    <div className="h-full rounded-full bg-blue-400" style={{ width: `${barPct}%` }} />
                                  </div>
                                </div>
                                <span className="w-20 shrink-0 text-right text-[9px] text-gray-400 dark:text-dark-500">cum. {cumulative.toLocaleString()}</span>
                              </div>
                            </div>
                          );
                        });
                      })()}
                    </div>
                    <div className="mt-2 flex justify-end text-[10px] text-gray-400 dark:text-dark-500">
                      Total network: <span className="ml-1 font-semibold text-gray-600 dark:text-dark-300">88,572 members</span>
                    </div>
                  </Card>

                  {/* Potential income table */}
                  <Card skin="bordered" className="overflow-x-auto">
                    <Box className="border-b border-gray-100 px-4 py-3 dark:border-dark-600">
                      <p className="text-xs font-semibold text-gray-700 dark:text-dark-200">Potential Unilevel Income</p>
                      <p className="text-[10px] text-gray-400 dark:text-dark-500">Assumes full 10-level network (88,572 members) all at same tea rank — 1% per activation per level</p>
                    </Box>
                    <table className="w-full min-w-[560px] text-xs">
                      <thead>
                        <tr className="border-b border-gray-100 bg-gray-50 dark:border-dark-600 dark:bg-dark-800">
                          <th className="px-3 py-2 text-left font-medium text-gray-500 dark:text-dark-400">Lv.</th>
                          <th className="px-3 py-2 text-left font-medium text-gray-500 dark:text-dark-400">Tea Rank</th>
                          <th className="px-3 py-2 text-right font-medium text-gray-500 dark:text-dark-400">Activation (USDT)</th>
                          <th className="px-3 py-2 text-right font-medium text-gray-500 dark:text-dark-400">1% per activation</th>
                          <th className="px-3 py-2 text-right font-medium text-gray-500 dark:text-dark-400">Est. Total (USDT)</th>
                        </tr>
                      </thead>
                      <tbody>
                        {RANKS.map((r, i) => {
                          const perActivation = r.price * 0.01;
                          const total = perActivation * 88572;
                          const isCur = r.level === MOCK.rank;
                          return (
                            <tr key={r.level} className={`${i < RANKS.length - 1 ? "border-b border-gray-50 dark:border-dark-700" : ""} ${isCur ? "bg-primary-50 dark:bg-primary-900/10" : ""}`}>
                              <td className="px-3 py-2 text-gray-400 dark:text-dark-500">{r.level}</td>
                              <td className="px-3 py-2 font-medium text-gray-700 dark:text-dark-200">
                                {r.name}
                                {isCur && <span className="ml-1 rounded bg-primary-100 px-1 text-[9px] text-primary-700 dark:bg-primary-900/30 dark:text-primary-400">You</span>}
                              </td>
                              <td className="px-3 py-2 text-right text-gray-600 dark:text-dark-300">{r.price.toLocaleString()}</td>
                              <td className="px-3 py-2 text-right text-blue-600 dark:text-blue-400">{perActivation < 1 ? perActivation.toFixed(3) : perActivation.toLocaleString()}</td>
                              <td className="px-3 py-2 text-right font-semibold text-gray-800 dark:text-dark-100">
                                {total >= 1_000_000
                                  ? `${(total / 1_000_000).toFixed(2)}M`
                                  : total >= 1_000
                                    ? `${(total / 1_000).toFixed(1)}K`
                                    : total.toFixed(2)}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                      <tfoot>
                        <tr className="border-t border-gray-200 bg-gray-50 dark:border-dark-600 dark:bg-dark-800">
                          <td colSpan={4} className="px-3 py-2 text-xs text-gray-400 dark:text-dark-500">Network size: 3+9+27+…+59,049 = 88,572 total members</td>
                          <td className="px-3 py-2 text-right text-[10px] text-gray-400 dark:text-dark-500">per rank scenario</td>
                        </tr>
                      </tfoot>
                    </table>
                  </Card>
                </div>

              </div>
            </Section>
          </div>
        )}

        {/* DEPOSIT */}
        {tab === "deposit" && (
          <Box className="mx-auto max-w-md">
            <Section title="Deposit USDT">
              <div className="flex flex-col gap-4">
                <p className="text-sm text-gray-500 dark:text-dark-400">Minimum deposit is {MIN_DEPOSIT} USDT.</p>
                <div>
                  <label className="mb-1 block text-xs font-medium text-gray-600 dark:text-dark-300">Amount (USDT)</label>
                  <input
                    type="number"
                    value={depositAmt}
                    onChange={(e) => setDepositAmt(e.target.value)}
                    placeholder={`Min ${MIN_DEPOSIT}`}
                    min={MIN_DEPOSIT}
                    className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm dark:border-dark-500 dark:bg-dark-800 dark:text-dark-50"
                  />
                </div>
                <Button color="primary" className="w-full"
                  disabled={!depositAmt || Number(depositAmt) < MIN_DEPOSIT}
                  onClick={() => { /* TODO: call contract.deposit(parseUnits(depositAmt, 18)) */ }}>
                  Deposit
                </Button>
              </div>
            </Section>
          </Box>
        )}

        {/* RANK UP */}
        {tab === "rankup" && (
          <div className="flex flex-col gap-4">
            <Section title="Select Rank">
              <div className="flex flex-col gap-2">
                {RANKS.map((r) => {
                  const isOwned = r.level <= MOCK.rank;
                  const isCurrent = r.level === MOCK.rank;
                  const isNext = r.level === MOCK.rank + 1;
                  return (
                    <button
                      key={r.level}
                      disabled={isOwned}
                      onClick={() => setSelectedRank(r.level)}
                      className={`flex items-center justify-between rounded-lg border px-4 py-3 text-left transition-colors ${selectedRank === r.level && !isOwned
                        ? "border-primary-500 bg-primary-50 dark:bg-primary-900/20"
                        : isOwned
                          ? "cursor-default border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-900/20"
                          : "border-gray-200 hover:border-gray-300 dark:border-dark-600 dark:hover:border-dark-400"
                        }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="w-6 text-center text-xs font-bold text-gray-400 dark:text-dark-500">{r.level}</span>
                        <div>
                          <div className="text-sm font-medium text-gray-800 dark:text-dark-50">{r.name}</div>
                          {isNext && <div className="text-xs text-primary-600 dark:text-primary-400">Next rank</div>}
                          {isCurrent && <div className="text-xs text-green-600 dark:text-green-400">Current rank</div>}
                        </div>
                      </div>
                      <span className={`text-sm font-semibold ${isOwned ? "text-green-600 dark:text-green-400" : "text-gray-700 dark:text-dark-200"}`}>
                        {isOwned ? "Owned" : `${r.price} USDT`}
                      </span>
                    </button>
                  );
                })}
              </div>
            </Section>

            {selectedRank && (() => {
              const r = RANKS.find((x) => x.level === selectedRank)!;
              return (
                <Box className="mx-auto w-full max-w-md">
                  <Section title="Confirm Rank Up">
                    <div className="flex flex-col gap-3">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500 dark:text-dark-400">Rank</span>
                        <span className="font-medium text-gray-800 dark:text-dark-50">Lv.{r.level} {r.name}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500 dark:text-dark-400">Cost</span>
                        <span className="font-semibold text-gray-900 dark:text-dark-50">{r.price} USDT</span>
                      </div>
                      <Button color="success" className="w-full"
                        onClick={() => { /* TODO: call contract.rankUp(selectedRank) */ }}>
                        Confirm Rank Up — {r.price} USDT
                      </Button>
                    </div>
                  </Section>
                </Box>
              );
            })()}
          </div>
        )}

        {/* WITHDRAW */}
        {tab === "withdraw" && (
          <Box className="mx-auto max-w-md">
            <Section title="Withdraw">
              <div className="flex flex-col gap-4">
                <Box className="flex flex-wrap gap-3">
                  <Stat label="Total Income" value={`${MOCK.totalIncome} USDT`} />
                  <Stat label="Available" value={`${MOCK.availableBalance} USDT`} />
                </Box>
                <div>
                  <div className="mb-1 flex items-center justify-between">
                    <label className="text-xs font-medium text-gray-600 dark:text-dark-300">Amount (USDT)</label>
                    <span className="text-xs text-gray-400 dark:text-dark-500">Min {MIN_WITHDRAW} USDT</span>
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      value={withdrawAmt}
                      onChange={(e) => setWithdrawAmt(e.target.value)}
                      placeholder={`Min ${MIN_WITHDRAW}`}
                      min={MIN_WITHDRAW}
                      max={MOCK.availableBalance}
                      className="flex-1 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm dark:border-dark-500 dark:bg-dark-800 dark:text-dark-50"
                    />
                    <button
                      onClick={() => setWithdrawAmt(String(MOCK.availableBalance))}
                      className="rounded-lg border border-gray-300 px-3 text-xs font-medium text-gray-600 hover:bg-gray-50 dark:border-dark-500 dark:text-dark-300 dark:hover:bg-dark-600"
                    >
                      Max
                    </button>
                  </div>
                </div>
                <Button color="primary" className="w-full"
                  disabled={!withdrawAmt || Number(withdrawAmt) < MIN_WITHDRAW || Number(withdrawAmt) > MOCK.availableBalance}
                  onClick={() => { /* TODO: call contract.withdraw(parseUnits(withdrawAmt, 18)) */ }}>
                  Withdraw
                </Button>
              </div>
            </Section>
          </Box>
        )}

        {/* GENEALOGY */}
        {tab === "genealogy" && (
          <Section title="Genealogy Tree">
            {MOCK.genealogy.length === 0 ? (
              <Box className="flex flex-col items-center gap-2 py-8 text-center">
                <p className="text-sm text-gray-500 dark:text-dark-400">No referrals yet.</p>
                <p className="text-xs text-gray-400 dark:text-dark-500">Share your wallet address to invite members.</p>
                <Box className="mt-2 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 font-mono text-xs text-gray-500 dark:border-dark-500 dark:bg-dark-800 dark:text-dark-400">
                  {address ?? "—"}
                </Box>
              </Box>
            ) : (
              <div className="flex flex-col gap-2">
                {MOCK.genealogy.map((node) => (
                  <Card key={node.address} skin="bordered" className="flex items-center justify-between px-3 py-2">
                    <span className="font-mono text-xs text-gray-600 dark:text-dark-300">{node.address}</span>
                    <span className="text-xs text-gray-400 dark:text-dark-500">
                      Level {node.level} · {RANKS[node.rank - 1]?.name ?? "Unranked"}
                    </span>
                  </Card>
                ))}
              </div>
            )}
          </Section>
        )}

      </div>
    </Page>
  );
}

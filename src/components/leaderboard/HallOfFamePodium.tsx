import { Crown, Medal } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import type { LeaderboardRow } from "@/hooks/useLearnerLeaderboard";

const tierConfig = [
  {
    rank: 2,
    label: "Silver",
    pedestalHeight: 100,
    glowColor: "rgba(192,192,192,0.5)",
    accentHsl: "0,0%,75%",
    icon: Medal,
    order: "order-1",
    avatarSize: "h-14 w-14 sm:h-16 sm:w-16",
    topColor: "rgba(255,255,255,0.25)",
    rightColor: "rgba(255,255,255,0.08)",
    frontFrom: "rgba(255,255,255,0.15)",
    frontTo: "rgba(255,255,255,0.05)",
  },
  {
    rank: 1,
    label: "Gold",
    pedestalHeight: 140,
    glowColor: "rgba(196,162,77,0.6)",
    accentHsl: "43,58%,54%",
    icon: Crown,
    order: "order-0 sm:order-2",
    avatarSize: "h-16 w-16 sm:h-20 sm:w-20",
    topColor: "rgba(255,255,255,0.3)",
    rightColor: "rgba(255,255,255,0.1)",
    frontFrom: "rgba(255,255,255,0.2)",
    frontTo: "rgba(255,255,255,0.06)",
  },
  {
    rank: 3,
    label: "Bronze",
    pedestalHeight: 72,
    glowColor: "rgba(205,127,50,0.5)",
    accentHsl: "29,59%,50%",
    icon: Medal,
    order: "order-3",
    avatarSize: "h-14 w-14 sm:h-16 sm:w-16",
    topColor: "rgba(255,255,255,0.25)",
    rightColor: "rgba(255,255,255,0.08)",
    frontFrom: "rgba(255,255,255,0.15)",
    frontTo: "rgba(255,255,255,0.05)",
  },
];

function initialsOf(name: string): string {
  return (
    name
      .split(" ")
      .map((n) => n[0])
      .filter(Boolean)
      .join("")
      .slice(0, 2)
      .toUpperCase() || "?"
  );
}

function formatPoints(n: number): string {
  return Number.isInteger(n) ? String(n) : n.toFixed(1);
}

export function HallOfFamePodium({ rows }: { rows: LeaderboardRow[] }) {
  const top3 = rows.slice(0, 3);
  if (top3.length === 0) return null;

  return (
    <div
      className="relative overflow-hidden rounded-2xl p-5 sm:p-8"
      style={{
        background:
          "linear-gradient(180deg, hsl(230,50%,18%) 0%, hsl(260,40%,22%) 50%, hsl(230,50%,18%) 100%)",
      }}
    >
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 60% 50% at 50% 20%, rgba(196,162,77,0.15) 0%, transparent 70%)",
        }}
      />
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 40% 35% at 50% 15%, rgba(100,140,255,0.1) 0%, transparent 60%)",
        }}
      />

      <h3 className="relative z-10 mb-8 text-center text-base font-bold text-white sm:mb-10 sm:text-lg">
        Hall of Fame
      </h3>

      <div className="relative z-10 flex items-end justify-center gap-3 pb-2 sm:gap-5">
        {tierConfig.map((tier) => {
          const row = top3[tier.rank - 1];
          if (!row) return null;
          const TierIcon = tier.icon;
          const isGold = tier.rank === 1;

          return (
            <div
              key={tier.rank}
              className={cn(
                "flex flex-1 max-w-[140px] flex-col items-center sm:max-w-[180px]",
                tier.order,
              )}
            >
              <div className="mb-1">
                <TierIcon
                  className="h-5 w-5 sm:h-6 sm:w-6"
                  style={{ color: `hsl(${tier.accentHsl})` }}
                  fill={isGold ? "currentColor" : "none"}
                  strokeWidth={isGold ? 1 : 2}
                />
              </div>

              <div
                className="relative mb-1"
                style={{ filter: `drop-shadow(0 0 12px ${tier.glowColor})` }}
              >
                <div
                  className="rounded-full p-[3px]"
                  style={{
                    background: `linear-gradient(135deg, hsl(${tier.accentHsl}), hsl(${tier.accentHsl}) 50%, rgba(255,255,255,0.3))`,
                  }}
                >
                  <Avatar className={cn(tier.avatarSize, "border-2 border-background")}>
                    <AvatarFallback className="bg-muted text-xs font-semibold text-foreground sm:text-sm">
                      {initialsOf(row.name)}
                    </AvatarFallback>
                  </Avatar>
                </div>
              </div>

              <p className="mt-1 w-full truncate text-center text-xs font-semibold text-white sm:text-sm">
                {row.name}
                {row.isCurrentUser && <span className="ml-1 text-amber-300">(You)</span>}
              </p>

              <div
                className="mb-2 mt-1 flex items-center gap-1 rounded-full px-2.5 py-0.5"
                style={{
                  background:
                    "linear-gradient(135deg, hsl(20,90%,50%), hsl(35,95%,55%))",
                }}
              >
                <span className="text-[10px] font-bold text-white sm:text-xs">
                  {formatPoints(row.totalPoints)} pts
                </span>
              </div>

              <div className="relative w-full" style={{ marginRight: "-10px" }}>
                <div
                  className="absolute left-0 h-[10px] w-full origin-bottom-left sm:h-[14px]"
                  style={{
                    background: tier.topColor,
                    transform: "skewX(-45deg)",
                    top: "-10px",
                    left: "5px",
                    borderTopLeftRadius: "4px",
                    borderTopRightRadius: "4px",
                    backdropFilter: "blur(8px)",
                  }}
                />
                <div
                  className="absolute top-0 w-[10px] origin-top-right sm:w-[14px]"
                  style={{
                    background: tier.rightColor,
                    transform: "skewY(-45deg)",
                    right: "-10px",
                    top: "-5px",
                    height: "100%",
                    borderTopRightRadius: "4px",
                    borderBottomRightRadius: "4px",
                    backdropFilter: "blur(8px)",
                  }}
                />
                <div
                  className="relative w-full overflow-hidden rounded-tl-lg"
                  style={{
                    background: `linear-gradient(to top, ${tier.frontFrom}, ${tier.frontTo})`,
                    height: `${tier.pedestalHeight}px`,
                    backdropFilter: "blur(12px)",
                    border: "1px solid rgba(255,255,255,0.15)",
                    borderRight: "none",
                    borderBottom: "none",
                  }}
                >
                  <div
                    className="absolute inset-0 opacity-30"
                    style={{
                      background:
                        "linear-gradient(135deg, transparent 30%, rgba(255,255,255,0.5) 45%, rgba(255,255,255,0.1) 55%, transparent 70%)",
                    }}
                  />
                  <div
                    className="absolute left-0 right-0 top-0 h-[2px]"
                    style={{ background: `hsl(${tier.accentHsl})`, opacity: 0.6 }}
                  />
                  <div className="relative z-10 flex items-start justify-center pt-3">
                    <span
                      className="text-2xl font-extrabold sm:text-4xl"
                      style={{ color: "rgba(255,255,255,0.25)" }}
                    >
                      {tier.rank}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

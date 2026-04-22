import { Trophy, Users, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';
import { cmfasRoom } from '../cmfasTheme';

const CHALLENGES = [
  {
    id: 'quick-pass',
    title: 'Quick-Pass Challenge',
    icon: Zap,
    tag: 'Pass each paper on first attempt, within 2 weeks of the previous',
    items: [
      { label: 'M9 in one attempt, within 2 weeks', reward: 'S$50' },
      { label: 'M9A within 2 weeks of M9', reward: 'S$50' },
      { label: 'HI within 2 weeks of M9A', reward: 'S$50' },
      { label: 'RES5 within 2 weeks of HI', reward: 'S$50' },
      { label: 'All 4 papers within 2 months of joining', reward: 'S$100 bonus' },
    ],
    note: 'Rewards paid out only after you contract as a financial advisor.',
  },
  {
    id: 'first-time',
    title: 'Pass-First-Time Challenge',
    icon: Trophy,
    tag: 'Demonstrate excellence',
    items: [{ label: 'Pass all 4 papers on your first attempt', reward: 'S$100' }],
    note: null,
  },
  {
    id: 'refer-friend',
    title: 'Refer-A-Friend Challenge',
    icon: Users,
    tag: 'Bring someone with you',
    items: [
      { label: 'Referred friend passes M9 — both of you', reward: 'S$100 each' },
      { label: 'Referred friend passes all 4 papers — bonus', reward: 'S$100 more each' },
    ],
    note: null,
  },
];

export function RewardsView() {
  return (
    <div className="space-y-6">
      <header>
        <p className={cn('text-[11px] font-semibold uppercase tracking-[0.2em]', cmfasRoom.brassText)}>
          Rewards
        </p>
        <h1 className={cn('mt-2 font-serif text-3xl font-bold sm:text-4xl', cmfasRoom.text)}>
          Real money for passing fast.
        </h1>
        <p className={cn('mt-2 max-w-xl text-sm', cmfasRoom.textMuted)}>
          Three challenges designed to reward commitment. Cash, not points.
        </p>
      </header>

      <div className="space-y-4">
        {CHALLENGES.map((c) => {
          const Icon = c.icon;
          return (
            <section key={c.id} className={cn('rounded-2xl border p-5 sm:p-6', cmfasRoom.surface)}>
              <div className="flex items-start gap-4">
                <div className={cn('flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border-2', cmfasRoom.brassBorder)}>
                  <Icon className={cn('h-5 w-5', cmfasRoom.brassText)} />
                </div>
                <div className="min-w-0 flex-1">
                  <h2 className={cn('text-lg font-bold', cmfasRoom.text)}>{c.title}</h2>
                  <p className={cn('mt-0.5 text-xs', cmfasRoom.textMuted)}>{c.tag}</p>
                </div>
              </div>
              <ul className="mt-4 space-y-2">
                {c.items.map((item, idx) => (
                  <li
                    key={idx}
                    className={cn('flex items-center justify-between gap-3 rounded-md border px-3 py-2', cmfasRoom.brassBorderSoft)}
                  >
                    <span className={cn('min-w-0 flex-1 text-sm', cmfasRoom.text)}>{item.label}</span>
                    <span
                      className={cn(
                        'shrink-0 rounded-full px-2 py-0.5 text-[11px] font-bold tabular-nums',
                        cmfasRoom.brassBgSoft,
                        cmfasRoom.brassTextStrong,
                      )}
                    >
                      {item.reward}
                    </span>
                  </li>
                ))}
              </ul>
              {c.note && (
                <p className={cn('mt-3 text-[11px] italic', cmfasRoom.textFaint)}>{c.note}</p>
              )}
            </section>
          );
        })}
      </div>
    </div>
  );
}

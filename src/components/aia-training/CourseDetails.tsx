import { cn } from "@/lib/utils";
import { MONTHS, nextSession, type Course, type Directory } from "@/features/aia-training-directory/filter";

const FORMAT_LABEL = { classroom: "Classroom", virtual: "Virtual", elearning: "eLearning" } as const;

/** Everything the catalogue says about one course: the "page" a contents line opens. */
export function CourseDetails({ course, dir }: { course: Course; dir: Directory }) {
  const today = new Date();
  const next = nextSession(course, dir.scheduleYear, today);
  const thisMonth = today.getFullYear() === dir.scheduleYear ? today.getMonth() + 1 : 0;

  return (
    <div className="space-y-4 text-sm">
      {course.summary.split("\n\n").map((p, i) => (
        <p key={i} className="break-words leading-relaxed">
          {p}
        </p>
      ))}

      {(course.formats?.length || course.duration || course.cpd || course.eligibility || course.access) && (
        <dl className="grid gap-x-4 gap-y-1 rounded-xl bg-muted/40 p-3 text-xs sm:grid-cols-[auto_1fr]">
          {course.formats?.length ? (
            <>
              <dt className="font-semibold">Format</dt>
              <dd className="text-muted-foreground">{course.formats.map((f) => FORMAT_LABEL[f]).join(", ")}</dd>
            </>
          ) : null}
          {course.duration && (
            <>
              <dt className="font-semibold">Duration</dt>
              <dd className="text-muted-foreground">{course.duration}</dd>
            </>
          )}
          {course.cpd && (
            <>
              <dt className="font-semibold">CPD hours</dt>
              <dd className="text-muted-foreground">{course.cpd}</dd>
            </>
          )}
          {course.eligibility && (
            <>
              <dt className="font-semibold">Who it's for</dt>
              <dd className="text-muted-foreground">{course.eligibility}</dd>
            </>
          )}
          {course.access && (
            <>
              <dt className="font-semibold">Where to find it</dt>
              <dd className="text-muted-foreground">{course.access}</dd>
            </>
          )}
        </dl>
      )}

      {course.outcomes?.length ? (
        <div>
          <h4 className="mb-1 font-semibold">By the end you can</h4>
          <ul className="list-disc space-y-0.5 pl-5 text-muted-foreground">
            {course.outcomes.map((o) => (
              <li key={o}>{o}</li>
            ))}
          </ul>
        </div>
      ) : null}

      {course.topics?.map((t) => (
        <div key={t.heading}>
          <h4 className="mb-1 font-semibold">{t.heading}</h4>
          <ul className="list-disc space-y-0.5 pl-5 text-muted-foreground">
            {t.items.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
      ))}

      {course.notes?.length ? (
        <div>
          <h4 className="mb-1 font-semibold">Before you sign up</h4>
          <ul className="list-disc space-y-0.5 pl-5 text-muted-foreground">
            {course.notes.map((n) => (
              <li key={n}>{n}</li>
            ))}
          </ul>
        </div>
      ) : null}

      {(course.schedule?.length || course.scheduleNote) && (
        <div>
          <h4 className="mb-1 font-semibold">{dir.scheduleYear} dates</h4>
          {course.scheduleNote && <p className="text-muted-foreground">{course.scheduleNote}</p>}
          {course.schedule?.length ? (
            <ul className="divide-y rounded-lg border text-xs">
              {course.schedule.map((s) => {
                const past = (s.endMonth ?? s.month) < thisMonth;
                const current = s === next;
                return (
                  <li
                    key={`${s.month}-${s.when}`}
                    className={cn("flex gap-3 px-3 py-2", past && "text-muted-foreground/60", current && "bg-primary/5 font-medium")}
                  >
                    <span className="w-8 shrink-0 font-semibold">{MONTHS[s.month - 1]}</span>
                    <span className="min-w-0 break-words">{s.when}</span>
                  </li>
                );
              })}
            </ul>
          ) : null}
          {course.schedule?.length ? (
            <p className="mt-1.5 text-xs text-muted-foreground">
              {dir.scheduleKey}. {dir.scheduleNote}
            </p>
          ) : null}
        </div>
      )}
    </div>
  );
}

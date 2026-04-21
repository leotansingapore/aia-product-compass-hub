import { useMemo, useState } from "react";
import { Loader2, Save } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "@/hooks/use-toast";
import { DAY_SUMMARIES } from "@/features/first-60-days/summaries";
import {
  useAllFirst60DaysDayMeta,
  type DayMeta,
} from "@/hooks/first-60-days/useFirst60DaysDayMeta";
import First60DaysSubmissions from "./First60DaysSubmissions";
import First60DaysProgress from "./First60DaysProgress";

type RowPatch = Partial<Omit<DayMeta, "day_number">>;

export default function First60DaysAdmin() {
  const days = DAY_SUMMARIES;
  const metaQuery = useAllFirst60DaysDayMeta();
  const qc = useQueryClient();

  const byDay = useMemo(() => {
    const m: Record<number, DayMeta> = {};
    for (const row of metaQuery.data ?? []) m[row.day_number] = row;
    return m;
  }, [metaQuery.data]);

  const [drafts, setDrafts] = useState<Record<number, RowPatch>>({});

  const upsertMutation = useMutation({
    mutationFn: async (input: { dayNumber: number; patch: RowPatch }) => {
      const existing = byDay[input.dayNumber];
      const row = {
        day_number: input.dayNumber,
        slides_url: input.patch.slides_url ?? existing?.slides_url ?? null,
        video_url: input.patch.video_url ?? existing?.video_url ?? null,
        video_duration_sec:
          input.patch.video_duration_sec ?? existing?.video_duration_sec ?? null,
        published: input.patch.published ?? existing?.published ?? true,
        notes: input.patch.notes ?? existing?.notes ?? null,
      };
      const { error } = await supabase
        .from("first_60_days_day_meta")
        .upsert(row, { onConflict: "day_number" });
      if (error) throw error;
    },
    onSuccess: (_data, input) => {
      qc.invalidateQueries({ queryKey: ["first-60-days-day-meta"] });
      setDrafts((d) => {
        const next = { ...d };
        delete next[input.dayNumber];
        return next;
      });
      toast({ title: `Day ${input.dayNumber} saved` });
    },
    onError: (err: unknown) => {
      toast({
        title: "Save failed",
        description: err instanceof Error ? err.message : "Unknown error",
        variant: "destructive",
      });
    },
  });

  const setDraft = (dayNumber: number, patch: RowPatch) => {
    setDrafts((d) => ({ ...d, [dayNumber]: { ...d[dayNumber], ...patch } }));
  };

  const effectiveValue = <K extends keyof DayMeta>(dayNumber: number, key: K): DayMeta[K] | undefined => {
    const draft = drafts[dayNumber] as DayMeta | undefined;
    if (draft && draft[key as keyof DayMeta] !== undefined) return draft[key as keyof DayMeta] as DayMeta[K];
    return byDay[dayNumber]?.[key];
  };

  if (metaQuery.isLoading) {
    return (
      <div className="flex items-center justify-center py-10">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-3" data-testid="first-60-days-admin">
      <Tabs defaultValue="progress">
        <TabsList>
          <TabsTrigger value="progress">Learner progress</TabsTrigger>
          <TabsTrigger value="urls">Day URLs</TabsTrigger>
          <TabsTrigger value="submissions">Reflection submissions</TabsTrigger>
        </TabsList>
        <TabsContent value="progress" className="space-y-3">
          <First60DaysProgress />
        </TabsContent>
        <TabsContent value="urls" className="space-y-3">
      <Card>
        <CardContent className="p-4 text-sm text-muted-foreground">
          Paste Google Slides embed URLs (<code>.../embed?start=...</code>) and YouTube / Vimeo
          video URLs per day. Unpublished rows stay hidden from learners.
        </CardContent>
      </Card>

      <div className="overflow-x-auto rounded-md border">
        <table className="w-full min-w-[900px] text-sm">
          <thead className="bg-muted/50 text-left text-xs uppercase tracking-wide text-muted-foreground">
            <tr>
              <th className="px-3 py-2">Day</th>
              <th className="px-3 py-2">Title</th>
              <th className="px-3 py-2">Slides URL</th>
              <th className="px-3 py-2">Video URL</th>
              <th className="px-3 py-2">Duration (sec)</th>
              <th className="px-3 py-2">Published</th>
              <th className="px-3 py-2 text-right">Save</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {days.map((day) => {
              const dirty = Boolean(drafts[day.dayNumber]);
              const busy = upsertMutation.isPending && upsertMutation.variables?.dayNumber === day.dayNumber;
              return (
                <tr key={day.dayNumber} className={dirty ? "bg-primary/5" : ""}>
                  <td className="px-3 py-2 align-top">
                    <div className="flex flex-col gap-1">
                      <span className="font-semibold">Day {day.dayNumber}</span>
                      <Badge variant="outline" className="w-fit">
                        Week {day.week}
                      </Badge>
                    </div>
                  </td>
                  <td className="px-3 py-2 align-top">
                    <span className="text-foreground">{day.title}</span>
                  </td>
                  <td className="px-3 py-2 align-top">
                    <Input
                      type="url"
                      placeholder="https://docs.google.com/presentation/d/.../embed"
                      value={(effectiveValue(day.dayNumber, "slides_url") as string | null) ?? ""}
                      onChange={(e) =>
                        setDraft(day.dayNumber, { slides_url: e.target.value || null })
                      }
                    />
                  </td>
                  <td className="px-3 py-2 align-top">
                    <Input
                      type="url"
                      placeholder="https://youtu.be/..."
                      value={(effectiveValue(day.dayNumber, "video_url") as string | null) ?? ""}
                      onChange={(e) =>
                        setDraft(day.dayNumber, { video_url: e.target.value || null })
                      }
                    />
                  </td>
                  <td className="px-3 py-2 align-top">
                    <Input
                      type="number"
                      inputMode="numeric"
                      min={0}
                      className="w-28"
                      value={
                        effectiveValue(day.dayNumber, "video_duration_sec") !== null &&
                        effectiveValue(day.dayNumber, "video_duration_sec") !== undefined
                          ? String(effectiveValue(day.dayNumber, "video_duration_sec"))
                          : ""
                      }
                      onChange={(e) => {
                        const v = e.target.value;
                        setDraft(day.dayNumber, {
                          video_duration_sec: v === "" ? null : Number(v),
                        });
                      }}
                    />
                  </td>
                  <td className="px-3 py-2 align-top">
                    <Switch
                      checked={Boolean(effectiveValue(day.dayNumber, "published") ?? true)}
                      onCheckedChange={(c) => setDraft(day.dayNumber, { published: c })}
                    />
                  </td>
                  <td className="px-3 py-2 align-top text-right">
                    <Button
                      size="sm"
                      variant={dirty ? "default" : "ghost"}
                      disabled={!dirty || busy}
                      onClick={() =>
                        upsertMutation.mutate({ dayNumber: day.dayNumber, patch: drafts[day.dayNumber] })
                      }
                    >
                      {busy ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Save className="h-4 w-4" />
                      )}
                    </Button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
        </TabsContent>
        <TabsContent value="submissions" className="space-y-3">
          <First60DaysSubmissions />
        </TabsContent>
      </Tabs>
    </div>
  );
}

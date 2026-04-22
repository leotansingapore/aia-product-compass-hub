import { GripVertical, Plus, Trash2 } from 'lucide-react';
import {
  DndContext,
  DragEndEvent,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { LessonActionStep } from '@/hooks/useProducts';

const MAX_STEPS = 5;

interface ActionStepsEditorProps {
  steps: LessonActionStep[];
  onChange: (next: LessonActionStep[]) => void;
}

/**
 * Lesson authoring section for explicit action steps.
 *
 * Mounted above the rich-content editor for CMFAS lessons. Stays hidden for
 * other products so the generic video editor isn't changed for them.
 */
export function ActionStepsEditor({ steps, onChange }: ActionStepsEditorProps) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const updateStep = (id: string, patch: Partial<LessonActionStep>) => {
    onChange(steps.map((s) => (s.id === id ? { ...s, ...patch } : s)));
  };

  const removeStep = (id: string) => {
    onChange(steps.filter((s) => s.id !== id));
  };

  const addStep = () => {
    if (steps.length >= MAX_STEPS) return;
    const id =
      typeof crypto !== 'undefined' && 'randomUUID' in crypto
        ? crypto.randomUUID()
        : `step-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    onChange([...steps, { id, title: '' }]);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = steps.findIndex((s) => s.id === active.id);
    const newIndex = steps.findIndex((s) => s.id === over.id);
    if (oldIndex === -1 || newIndex === -1) return;
    onChange(arrayMove(steps, oldIndex, newIndex));
  };

  return (
    <section className="space-y-3 rounded-xl border bg-card p-4 sm:p-5">
      <header className="flex items-center justify-between gap-3">
        <div>
          <h3 className="text-sm font-semibold text-foreground">Action steps</h3>
          <p className="text-xs text-muted-foreground">
            Explicit things the learner must check off before they can mark this lesson complete.
            Keep it 3–5 steps — longer lists get ignored.
          </p>
        </div>
        <span className="shrink-0 rounded-md border bg-muted/40 px-2 py-0.5 text-[11px] font-medium tabular-nums text-muted-foreground">
          {steps.length} / {MAX_STEPS}
        </span>
      </header>

      {steps.length === 0 ? (
        <div className="rounded-lg border border-dashed bg-muted/20 px-4 py-6 text-center text-xs text-muted-foreground">
          No action steps yet. Add one to force learners through a concrete action before they
          finish this lesson.
        </div>
      ) : (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={steps.map((s) => s.id)} strategy={verticalListSortingStrategy}>
            <ul className="space-y-2">
              {steps.map((step, index) => (
                <ActionStepRow
                  key={step.id}
                  step={step}
                  index={index}
                  onUpdate={(patch) => updateStep(step.id, patch)}
                  onRemove={() => removeStep(step.id)}
                />
              ))}
            </ul>
          </SortableContext>
        </DndContext>
      )}

      <Button
        type="button"
        variant="outline"
        size="sm"
        className="w-full gap-2"
        onClick={addStep}
        disabled={steps.length >= MAX_STEPS}
      >
        <Plus className="h-4 w-4" />
        Add action step
      </Button>
    </section>
  );
}

interface ActionStepRowProps {
  step: LessonActionStep;
  index: number;
  onUpdate: (patch: Partial<LessonActionStep>) => void;
  onRemove: () => void;
}

function ActionStepRow({ step, index, onUpdate, onRemove }: ActionStepRowProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: step.id,
  });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.6 : 1,
  };

  return (
    <li
      ref={setNodeRef}
      style={style}
      className="group rounded-lg border bg-background p-3"
    >
      <div className="flex items-start gap-2">
        <button
          type="button"
          className="mt-1 cursor-grab touch-none text-muted-foreground hover:text-foreground active:cursor-grabbing"
          aria-label="Drag to reorder"
          {...attributes}
          {...listeners}
        >
          <GripVertical className="h-4 w-4" />
        </button>
        <div className="flex-1 min-w-0 space-y-2">
          <div className="space-y-1">
            <Label
              htmlFor={`step-title-${step.id}`}
              className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground"
            >
              Step {index + 1} · title
            </Label>
            <Input
              id={`step-title-${step.id}`}
              value={step.title}
              onChange={(e) => onUpdate({ title: e.target.value })}
              placeholder="e.g. Create SCI College account"
              className="h-9"
            />
          </div>
          <div className="grid gap-2 sm:grid-cols-2">
            <div className="space-y-1">
              <Label
                htmlFor={`step-hint-${step.id}`}
                className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground"
              >
                Hint (optional)
              </Label>
              <Input
                id={`step-hint-${step.id}`}
                value={step.hint ?? ''}
                onChange={(e) => onUpdate({ hint: e.target.value || undefined })}
                placeholder="Shown under the title"
                className="h-9"
              />
            </div>
            <div className="space-y-1">
              <Label
                htmlFor={`step-url-${step.id}`}
                className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground"
              >
                Link (optional)
              </Label>
              <Input
                id={`step-url-${step.id}`}
                type="url"
                value={step.url ?? ''}
                onChange={(e) => onUpdate({ url: e.target.value || undefined })}
                placeholder="https://"
                className="h-9"
              />
            </div>
          </div>
        </div>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="shrink-0 text-muted-foreground hover:text-destructive"
          onClick={onRemove}
          aria-label={`Delete step ${index + 1}`}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </li>
  );
}

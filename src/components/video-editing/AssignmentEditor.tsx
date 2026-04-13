import type { AssignmentConfig } from '@/hooks/useProducts';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

interface AssignmentEditorProps {
  assignmentConfig: AssignmentConfig;
  onChange: (config: AssignmentConfig) => void;
}

const submissionOptions = [
  { value: 'text' as const, label: 'Text response' },
  { value: 'file' as const, label: 'File upload' },
  { value: 'both' as const, label: 'Both' },
];

export function AssignmentEditor({ assignmentConfig, onChange }: AssignmentEditorProps) {
  const showFileSize = assignmentConfig.submission_type === 'file' || assignmentConfig.submission_type === 'both';

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>Submission type</Label>
        <RadioGroup
          value={assignmentConfig.submission_type}
          onValueChange={(value: AssignmentConfig['submission_type']) =>
            onChange({ ...assignmentConfig, submission_type: value })
          }
        >
          {submissionOptions.map((option) => (
            <div key={option.value} className="flex items-center space-x-2">
              <RadioGroupItem value={option.value} id={`submission-${option.value}`} />
              <Label htmlFor={`submission-${option.value}`} className="font-normal cursor-pointer">
                {option.label}
              </Label>
            </div>
          ))}
        </RadioGroup>
      </div>

      <div className="space-y-2">
        <Label htmlFor="assignment-prompt">Assignment instructions</Label>
        <Textarea
          id="assignment-prompt"
          rows={4}
          value={assignmentConfig.prompt}
          onChange={(e) => onChange({ ...assignmentConfig, prompt: e.target.value })}
          placeholder="Describe what the learner should submit..."
        />
      </div>

      {showFileSize && (
        <div className="space-y-2">
          <Label htmlFor="max-file-size">Max file size (MB)</Label>
          <Input
            id="max-file-size"
            type="number"
            min={1}
            max={50}
            value={assignmentConfig.max_file_size_mb ?? 10}
            onChange={(e) => {
              const val = Math.min(50, Math.max(1, Number(e.target.value) || 1));
              onChange({ ...assignmentConfig, max_file_size_mb: val });
            }}
          />
        </div>
      )}
    </div>
  );
}

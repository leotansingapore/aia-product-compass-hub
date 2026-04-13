import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Brain, Plus, Trash2, Sparkles, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import type { QuizConfig, QuizItemQuestion } from '@/hooks/useProducts';

interface QuizEditorProps {
  quizConfig: QuizConfig;
  onChange: (config: QuizConfig) => void;
  sourceVideos: Array<{
    id: string;
    title: string;
    rich_content?: string;
    transcript?: string;
  }>;
}

export default function QuizEditor({ quizConfig, onChange, sourceVideos }: QuizEditorProps) {
  const [generating, setGenerating] = useState(false);
  const [selectedVideoId, setSelectedVideoId] = useState('');

  const updateQuestion = (index: number, updates: Partial<QuizItemQuestion>) => {
    const questions = [...quizConfig.questions];
    questions[index] = { ...questions[index], ...updates };
    onChange({ ...quizConfig, questions });
  };

  const updateOption = (qIndex: number, oIndex: number, value: string) => {
    const questions = [...quizConfig.questions];
    const options = [...questions[qIndex].options];
    options[oIndex] = value;
    questions[qIndex] = { ...questions[qIndex], options };
    onChange({ ...quizConfig, questions });
  };

  const removeQuestion = (index: number) => {
    const questions = quizConfig.questions.filter((_, i) => i !== index);
    onChange({ ...quizConfig, questions });
  };

  const addEmptyQuestion = () => {
    const empty: QuizItemQuestion = {
      question: '',
      options: ['', '', '', ''],
      correct_index: 0,
      explanation: '',
    };
    onChange({ ...quizConfig, questions: [...quizConfig.questions, empty] });
  };

  const handleGenerate = async () => {
    const video = sourceVideos.find((v) => v.id === selectedVideoId);
    if (!video) return;

    const content = [video.rich_content, video.transcript].filter(Boolean).join('\n\n');
    if (!content.trim()) {
      toast.error('Selected video has no content or transcript to generate questions from.');
      return;
    }

    setGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-quiz-from-content', {
        body: { content, num_questions: 5, product_title: video.title },
      });

      if (error) throw error;

      const newQuestions: QuizItemQuestion[] = data?.questions ?? [];
      if (newQuestions.length === 0) {
        toast.warning('AI returned no questions. Try a video with more content.');
        return;
      }

      onChange({
        ...quizConfig,
        questions: [...quizConfig.questions, ...newQuestions],
        source_item_id: video.id,
      });
      toast.success(`Added ${newQuestions.length} AI-generated questions.`);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to generate questions';
      toast.error(message);
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* AI Generation */}
      <Card className="border-2 border-dashed">
        <CardContent className="pt-6 space-y-4">
          <div className="flex items-center gap-2 text-sm font-medium">
            <Brain className="h-4 w-4" />
            <span>Generate questions with AI</span>
          </div>

          <div className="flex items-center gap-2">
            <select
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              value={selectedVideoId}
              onChange={(e) => setSelectedVideoId(e.target.value)}
              disabled={sourceVideos.length === 0 || generating}
            >
              <option value="">Select a source video...</option>
              {sourceVideos.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.title}
                </option>
              ))}
            </select>

            <Button
              onClick={handleGenerate}
              disabled={!selectedVideoId || generating || sourceVideos.length === 0}
              size="sm"
            >
              {generating ? (
                <Loader2 className="h-4 w-4 animate-spin mr-1" />
              ) : (
                <Sparkles className="h-4 w-4 mr-1" />
              )}
              Generate
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Questions list */}
      {quizConfig.questions.map((q, qIdx) => (
        <Card key={qIdx}>
          <CardContent className="pt-6 space-y-4">
            <div className="flex items-center justify-between">
              <Badge variant="secondary">Question {qIdx + 1}</Badge>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => removeQuestion(qIdx)}
                aria-label={`Remove question ${qIdx + 1}`}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>

            <Textarea
              placeholder="Enter question text..."
              value={q.question}
              onChange={(e) => updateQuestion(qIdx, { question: e.target.value })}
            />

            <RadioGroup
              value={String(q.correct_index)}
              onValueChange={(val) => updateQuestion(qIdx, { correct_index: Number(val) })}
              className="space-y-2"
            >
              {q.options.map((opt, oIdx) => (
                <div key={oIdx} className="flex items-center gap-2">
                  <RadioGroupItem value={String(oIdx)} id={`q${qIdx}-o${oIdx}`} />
                  <Label htmlFor={`q${qIdx}-o${oIdx}`} className="sr-only">
                    Option {oIdx + 1}
                  </Label>
                  <Input
                    placeholder={`Option ${oIdx + 1}`}
                    value={opt}
                    onChange={(e) => updateOption(qIdx, oIdx, e.target.value)}
                    className="flex-1"
                  />
                </div>
              ))}
            </RadioGroup>

            <Input
              placeholder="Explanation (optional)"
              value={q.explanation ?? ''}
              onChange={(e) => updateQuestion(qIdx, { explanation: e.target.value })}
            />
          </CardContent>
        </Card>
      ))}

      {/* Add question */}
      <Button variant="outline" onClick={addEmptyQuestion} className="w-full">
        <Plus className="h-4 w-4 mr-1" />
        Add Question
      </Button>
    </div>
  );
}

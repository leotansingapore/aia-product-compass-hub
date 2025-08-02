import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { 
  Award, 
  TrendingUp, 
  Target, 
  MessageSquare, 
  RefreshCw,
  CheckCircle,
  AlertCircle,
  ArrowRight,
  Trophy
} from 'lucide-react';

interface RoleplayFeedback {
  overall_score: number;
  communication_score: number;
  listening_score: number;
  objection_handling_score: number;
  product_knowledge_score: number;
  strengths: string[];
  improvement_areas: string[];
  specific_feedback: string;
  coaching_points: string[];
  follow_up_questions: string[];
}

interface RoleplaySession {
  id: string;
  scenario_title: string;
  scenario_category: string;
  scenario_difficulty: string;
  duration_seconds: number;
}

interface RoleplayFeedbackInterfaceProps {
  session: RoleplaySession;
  feedback: RoleplayFeedback;
  onPracticeAgain: () => void;
  onContinue: () => void;
}

export const RoleplayFeedbackInterface: React.FC<RoleplayFeedbackInterfaceProps> = ({
  session,
  feedback,
  onPracticeAgain,
  onContinue
}) => {
  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBadgeVariant = (score: number) => {
    if (score >= 80) return 'default';
    if (score >= 60) return 'secondary';
    return 'destructive';
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty.toLowerCase()) {
      case 'beginner': return 'bg-green-100 text-green-800';
      case 'intermediate': return 'bg-yellow-100 text-yellow-800';
      case 'advanced': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Header */}
      <Card>
        <CardHeader className="text-center">
          <div className="flex items-center justify-center mb-4">
            <Trophy className="h-8 w-8 text-primary mr-2" />
            <CardTitle className="text-2xl">Roleplay Complete!</CardTitle>
          </div>
          <CardDescription className="text-lg">
            {session.scenario_title}
          </CardDescription>
          <div className="flex items-center justify-center gap-4 mt-4">
            <Badge className={getDifficultyColor(session.scenario_difficulty)}>
              {session.scenario_difficulty}
            </Badge>
            <Badge variant="outline">{session.scenario_category}</Badge>
            <Badge variant="outline">
              Duration: {formatDuration(session.duration_seconds)}
            </Badge>
          </div>
        </CardHeader>
      </Card>

      {/* Overall Score */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Award className="h-5 w-5 mr-2" />
            Overall Performance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center">
            <div className={`text-4xl font-bold ${getScoreColor(feedback.overall_score)}`}>
              {feedback.overall_score}%
            </div>
            <Progress value={feedback.overall_score} className="mt-4" />
            <Badge 
              variant={getScoreBadgeVariant(feedback.overall_score)}
              className="mt-4"
            >
              {feedback.overall_score >= 80 ? 'Excellent' : 
               feedback.overall_score >= 60 ? 'Good' : 'Needs Improvement'}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Performance Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Target className="h-5 w-5 mr-2" />
            Performance Breakdown
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium">Communication</span>
                <span className={`text-sm font-bold ${getScoreColor(feedback.communication_score)}`}>
                  {feedback.communication_score}%
                </span>
              </div>
              <Progress value={feedback.communication_score} />
            </div>
            
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium">Active Listening</span>
                <span className={`text-sm font-bold ${getScoreColor(feedback.listening_score)}`}>
                  {feedback.listening_score}%
                </span>
              </div>
              <Progress value={feedback.listening_score} />
            </div>
            
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium">Objection Handling</span>
                <span className={`text-sm font-bold ${getScoreColor(feedback.objection_handling_score)}`}>
                  {feedback.objection_handling_score}%
                </span>
              </div>
              <Progress value={feedback.objection_handling_score} />
            </div>
            
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium">Product Knowledge</span>
                <span className={`text-sm font-bold ${getScoreColor(feedback.product_knowledge_score)}`}>
                  {feedback.product_knowledge_score}%
                </span>
              </div>
              <Progress value={feedback.product_knowledge_score} />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Strengths and Areas for Improvement */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center text-green-600">
              <CheckCircle className="h-5 w-5 mr-2" />
              What You Did Well
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {feedback.strengths.map((strength, index) => (
                <li key={index} className="flex items-start">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                  <span className="text-sm">{strength}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center text-orange-600">
              <TrendingUp className="h-5 w-5 mr-2" />
              Areas for Growth
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {feedback.improvement_areas.map((area, index) => (
                <li key={index} className="flex items-start">
                  <AlertCircle className="h-4 w-4 text-orange-500 mr-2 mt-0.5 flex-shrink-0" />
                  <span className="text-sm">{area}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Feedback */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <MessageSquare className="h-5 w-5 mr-2" />
            Detailed Feedback
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm leading-relaxed whitespace-pre-line">
            {feedback.specific_feedback}
          </p>
        </CardContent>
      </Card>

      {/* Coaching Points */}
      {feedback.coaching_points.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Target className="h-5 w-5 mr-2" />
              Key Coaching Points
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {feedback.coaching_points.map((point, index) => (
                <li key={index} className="flex items-start">
                  <div className="bg-primary text-primary-foreground rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold mr-3 mt-0.5 flex-shrink-0">
                    {index + 1}
                  </div>
                  <span className="text-sm">{point}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Follow-up Questions */}
      {feedback.follow_up_questions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <MessageSquare className="h-5 w-5 mr-2" />
              Questions to Consider
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {feedback.follow_up_questions.map((question, index) => (
                <li key={index} className="text-sm text-muted-foreground">
                  • {question}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      <Separator />

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <Button
          variant="outline"
          onClick={onPracticeAgain}
          className="flex items-center"
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          Practice This Scenario Again
        </Button>
        <Button
          onClick={onContinue}
          className="flex items-center"
        >
          Continue Learning
          <ArrowRight className="h-4 w-4 ml-2" />
        </Button>
      </div>
    </div>
  );
};
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { 
  TrendingUp, 
  BookOpen, 
  Target, 
  Clock, 
  Flame,
  Award,
  BarChart3,
  Calendar
} from "lucide-react";
import { useLearningAnalytics } from "@/hooks/useLearningAnalytics";

export function LearningAnalyticsDashboard() {
  const { getLearningStats, getCategoryProgress, getInsights, getActivityData } = useLearningAnalytics();
  
  const stats = getLearningStats();
  const categoryProgress = getCategoryProgress();
  const insights = getInsights();
  const recentActivity = getActivityData(7); // Last 7 days

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2">Your Learning Journey</h2>
        <p className="text-muted-foreground">Track your progress and discover insights</p>
      </div>

      {/* Key Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        
        <Card className="text-center">
          <CardContent className="p-4">
            <div className="flex items-center justify-center mb-2">
              <BookOpen className="h-6 w-6 text-primary" />
            </div>
            <div className="text-2xl font-bold">{stats.productsViewed}</div>
            <p className="text-sm text-muted-foreground">Products Explored</p>
          </CardContent>
        </Card>

        <Card className="text-center">
          <CardContent className="p-4">
            <div className="flex items-center justify-center mb-2">
              <Target className="h-6 w-6 text-primary" />
            </div>
            <div className="text-2xl font-bold">{stats.categoriesExplored}</div>
            <p className="text-sm text-muted-foreground">Categories</p>
          </CardContent>
        </Card>

        <Card className="text-center">
          <CardContent className="p-4">
            <div className="flex items-center justify-center mb-2">
              <Clock className="h-6 w-6 text-primary" />
            </div>
            <div className="text-2xl font-bold">{stats.timeSpentLearning}</div>
            <p className="text-sm text-muted-foreground">Minutes Learning</p>
          </CardContent>
        </Card>

        <Card className="text-center">
          <CardContent className="p-4">
            <div className="flex items-center justify-center mb-2">
              <Flame className="h-6 w-6 text-orange-500" />
            </div>
            <div className="text-2xl font-bold">{stats.streakDays}</div>
            <p className="text-sm text-muted-foreground">Day Streak</p>
          </CardContent>
        </Card>
      </div>

      {/* Learning Goals */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Learning Goals
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          
          {/* Daily Goal */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium">Daily Goal</span>
              <span className="text-sm text-muted-foreground">
                {stats.learningGoals.daily.current} / {stats.learningGoals.daily.target}
              </span>
            </div>
            <Progress 
              value={(stats.learningGoals.daily.current / stats.learningGoals.daily.target) * 100} 
              className="h-2" 
            />
          </div>

          {/* Weekly Goal */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium">Weekly Goal</span>
              <span className="text-sm text-muted-foreground">
                {stats.learningGoals.weekly.current} / {stats.learningGoals.weekly.target}
              </span>
            </div>
            <Progress 
              value={(stats.learningGoals.weekly.current / stats.learningGoals.weekly.target) * 100} 
              className="h-2" 
            />
          </div>

          {/* Monthly Goal */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium">Monthly Goal</span>
              <span className="text-sm text-muted-foreground">
                {stats.learningGoals.monthly.current} / {stats.learningGoals.monthly.target}
              </span>
            </div>
            <Progress 
              value={(stats.learningGoals.monthly.current / stats.learningGoals.monthly.target) * 100} 
              className="h-2" 
            />
          </div>
        </CardContent>
      </Card>

      {/* Category Progress */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Category Progress
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {categoryProgress.slice(0, 5).map((category) => (
              <div key={category.categoryId}>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium">{category.categoryName}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">
                      {category.viewedProducts}/{category.totalProducts}
                    </span>
                    <Badge variant={category.completionPercentage >= 50 ? "default" : "secondary"}>
                      {category.completionPercentage}%
                    </Badge>
                  </div>
                </div>
                <Progress value={category.completionPercentage} className="h-2" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Recent Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {recentActivity.slice(-5).map((day, index) => (
              <div key={day.date} className="flex items-center justify-between p-2 rounded-lg bg-muted/50">
                <div>
                  <div className="font-medium text-sm">
                    {new Date(day.date).toLocaleDateString('en-US', { 
                      weekday: 'short', 
                      month: 'short', 
                      day: 'numeric' 
                    })}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {day.productsViewed} products • {day.timeSpent} min
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  {day.productsViewed > 0 && (
                    <Badge variant="outline" className="text-xs">
                      {day.productsViewed}
                    </Badge>
                  )}
                  {day.bookmarksAdded > 0 && (
                    <Badge variant="secondary" className="text-xs">
                      +{day.bookmarksAdded}
                    </Badge>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Insights */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="h-5 w-5" />
            Insights & Achievements
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {insights.map((insight, index) => (
              <div key={index} className="p-3 rounded-lg bg-primary/5 border border-primary/10">
                <p className="text-sm">{insight}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Favorite Category */}
      {stats.favoriteCategory !== 'None' && (
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <TrendingUp className="h-8 w-8 text-primary mx-auto mb-2" />
              <h3 className="font-semibold mb-1">Your Focus Area</h3>
              <p className="text-sm text-muted-foreground">
                You're currently focusing on <strong>{stats.favoriteCategory}</strong> products
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
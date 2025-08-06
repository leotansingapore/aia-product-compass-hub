import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Settings, Bell, Globe, Layout, Save } from "lucide-react";

interface Preferences {
  theme: string;
  language: string;
  emailNotifications: boolean;
  pushNotifications: boolean;
  marketingEmails: boolean;
  dashboardLayout: string;
  autoPlayVideos: boolean;
  showProgressBars: boolean;
}

export function PreferencesSection() {
  const { toast } = useToast();
  const [preferences, setPreferences] = useState<Preferences>({
    theme: "system",
    language: "en",
    emailNotifications: true,
    pushNotifications: false,
    marketingEmails: false,
    dashboardLayout: "grid",
    autoPlayVideos: true,
    showProgressBars: true,
  });
  const [saving, setSaving] = useState(false);

  const handlePreferenceChange = (key: keyof Preferences, value: any) => {
    setPreferences(prev => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    setSaving(true);
    
    try {
      // In a real app, you'd save these to a user preferences table
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
      
      toast({
        title: "Success",
        description: "Preferences saved successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save preferences",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
            <Settings className="h-5 w-5" />
            Display & Theme
          </CardTitle>
          <CardDescription className="text-sm">
            Customize your visual experience
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Mobile-friendly preference items */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-4 bg-muted/30 rounded-lg">
            <div className="space-y-1">
              <Label htmlFor="theme" className="text-sm font-medium">Theme</Label>
              <p className="text-xs text-muted-foreground">
                Choose your preferred color scheme
              </p>
            </div>
            <Select
              value={preferences.theme}
              onValueChange={(value) => handlePreferenceChange('theme', value)}
            >
              <SelectTrigger className="w-full sm:w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="light">Light</SelectItem>
                <SelectItem value="dark">Dark</SelectItem>
                <SelectItem value="system">System</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-4 bg-muted/30 rounded-lg">
            <div className="space-y-1">
              <Label htmlFor="dashboard-layout" className="text-sm font-medium">Dashboard Layout</Label>
              <p className="text-xs text-muted-foreground">
                Choose how content is displayed
              </p>
            </div>
            <Select
              value={preferences.dashboardLayout}
              onValueChange={(value) => handlePreferenceChange('dashboardLayout', value)}
            >
              <SelectTrigger className="w-full sm:w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="grid">Grid</SelectItem>
                <SelectItem value="list">List</SelectItem>
                <SelectItem value="compact">Compact</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
            <Bell className="h-5 w-5" />
            Notifications
          </CardTitle>
          <CardDescription className="text-sm">
            Manage your notification preferences
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-4 bg-muted/30 rounded-lg">
            <div className="space-y-1">
              <Label htmlFor="email-notifications" className="text-sm font-medium">Email Notifications</Label>
              <p className="text-xs text-muted-foreground">
                Receive updates about your learning progress
              </p>
            </div>
            <Switch
              id="email-notifications"
              checked={preferences.emailNotifications}
              onCheckedChange={(checked) => handlePreferenceChange('emailNotifications', checked)}
            />
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-4 bg-muted/30 rounded-lg">
            <div className="space-y-1">
              <Label htmlFor="push-notifications" className="text-sm font-medium">Push Notifications</Label>
              <p className="text-xs text-muted-foreground">
                Get notified about new content and updates
              </p>
            </div>
            <Switch
              id="push-notifications"
              checked={preferences.pushNotifications}
              onCheckedChange={(checked) => handlePreferenceChange('pushNotifications', checked)}
            />
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-4 bg-muted/30 rounded-lg">
            <div className="space-y-1">
              <Label htmlFor="marketing-emails" className="text-sm font-medium">Marketing Emails</Label>
              <p className="text-xs text-muted-foreground">
                Receive promotional content and newsletters
              </p>
            </div>
            <Switch
              id="marketing-emails"
              checked={preferences.marketingEmails}
              onCheckedChange={(checked) => handlePreferenceChange('marketingEmails', checked)}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
            <Layout className="h-5 w-5" />
            Learning Experience
          </CardTitle>
          <CardDescription className="text-sm">
            Customize your learning interface
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-4 bg-muted/30 rounded-lg">
            <div className="space-y-1">
              <Label htmlFor="auto-play-videos" className="text-sm font-medium">Auto-play Videos</Label>
              <p className="text-xs text-muted-foreground">
                Automatically play training videos
              </p>
            </div>
            <Switch
              id="auto-play-videos"
              checked={preferences.autoPlayVideos}
              onCheckedChange={(checked) => handlePreferenceChange('autoPlayVideos', checked)}
            />
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-4 bg-muted/30 rounded-lg">
            <div className="space-y-1">
              <Label htmlFor="show-progress-bars" className="text-sm font-medium">Show Progress Bars</Label>
              <p className="text-xs text-muted-foreground">
                Display progress indicators on content
              </p>
            </div>
            <Switch
              id="show-progress-bars"
              checked={preferences.showProgressBars}
              onCheckedChange={(checked) => handlePreferenceChange('showProgressBars', checked)}
            />
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-4 bg-muted/30 rounded-lg">
            <div className="space-y-1">
              <Label htmlFor="language" className="text-sm font-medium">Language</Label>
              <p className="text-xs text-muted-foreground">
                Choose your preferred language
              </p>
            </div>
            <Select
              value={preferences.language}
              onValueChange={(value) => handlePreferenceChange('language', value)}
            >
              <SelectTrigger className="w-full sm:w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="en">English</SelectItem>
                <SelectItem value="zh">中文</SelectItem>
                <SelectItem value="ms">Bahasa Melayu</SelectItem>
                <SelectItem value="ta">தமிழ்</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Mobile-friendly save button */}
      <div className="pt-4">
        <Button 
          onClick={handleSave} 
          disabled={saving}
          className="w-full sm:w-auto"
        >
          <Save className="h-4 w-4 mr-2" />
          {saving ? "Saving..." : "Save Preferences"}
        </Button>
      </div>
    </div>
  );
}
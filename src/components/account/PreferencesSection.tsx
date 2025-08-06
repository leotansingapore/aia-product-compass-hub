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
    <div className="space-y-6">
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-3 text-xl font-bold">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Settings className="h-6 w-6 text-primary" />
            </div>
            Display & Theme
          </CardTitle>
          <CardDescription className="text-base leading-relaxed">
            Customize your visual experience
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Ultra mobile-friendly preference items */}
          <Card className="border-0 shadow-sm bg-muted/30">
            <CardContent className="p-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="theme" className="text-lg font-bold">Theme</Label>
                  <p className="text-base text-muted-foreground leading-relaxed">
                    Choose your preferred color scheme
                  </p>
                </div>
                <Select
                  value={preferences.theme}
                  onValueChange={(value) => handlePreferenceChange('theme', value)}
                >
                  <SelectTrigger className="w-full h-12 text-base">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="light">Light</SelectItem>
                    <SelectItem value="dark">Dark</SelectItem>
                    <SelectItem value="system">System</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm bg-muted/30">
            <CardContent className="p-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="dashboard-layout" className="text-lg font-bold">Dashboard Layout</Label>
                  <p className="text-base text-muted-foreground leading-relaxed">
                    Choose how content is displayed
                  </p>
                </div>
                <Select
                  value={preferences.dashboardLayout}
                  onValueChange={(value) => handlePreferenceChange('dashboardLayout', value)}
                >
                  <SelectTrigger className="w-full h-12 text-base">
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
        </CardContent>
      </Card>

      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-3 text-xl font-bold">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Bell className="h-6 w-6 text-primary" />
            </div>
            Notifications
          </CardTitle>
          <CardDescription className="text-base leading-relaxed">
            Manage your notification preferences
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Card className="border-0 shadow-sm bg-muted/30">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-2 flex-1">
                  <Label htmlFor="email-notifications" className="text-lg font-bold">Email Notifications</Label>
                  <p className="text-base text-muted-foreground leading-relaxed">
                    Receive updates about your learning progress
                  </p>
                </div>
                <Switch
                  id="email-notifications"
                  checked={preferences.emailNotifications}
                  onCheckedChange={(checked) => handlePreferenceChange('emailNotifications', checked)}
                  className="scale-125"
                />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm bg-muted/30">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-2 flex-1">
                  <Label htmlFor="push-notifications" className="text-lg font-bold">Push Notifications</Label>
                  <p className="text-base text-muted-foreground leading-relaxed">
                    Get notified about new content and updates
                  </p>
                </div>
                <Switch
                  id="push-notifications"
                  checked={preferences.pushNotifications}
                  onCheckedChange={(checked) => handlePreferenceChange('pushNotifications', checked)}
                  className="scale-125"
                />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm bg-muted/30">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-2 flex-1">
                  <Label htmlFor="marketing-emails" className="text-lg font-bold">Marketing Emails</Label>
                  <p className="text-base text-muted-foreground leading-relaxed">
                    Receive promotional content and newsletters
                  </p>
                </div>
                <Switch
                  id="marketing-emails"
                  checked={preferences.marketingEmails}
                  onCheckedChange={(checked) => handlePreferenceChange('marketingEmails', checked)}
                  className="scale-125"
                />
              </div>
            </CardContent>
          </Card>
        </CardContent>
      </Card>

      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-3 text-xl font-bold">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Layout className="h-6 w-6 text-primary" />
            </div>
            Learning Experience
          </CardTitle>
          <CardDescription className="text-base leading-relaxed">
            Customize your learning interface
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Card className="border-0 shadow-sm bg-muted/30">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-2 flex-1">
                  <Label htmlFor="auto-play-videos" className="text-lg font-bold">Auto-play Videos</Label>
                  <p className="text-base text-muted-foreground leading-relaxed">
                    Automatically play training videos
                  </p>
                </div>
                <Switch
                  id="auto-play-videos"
                  checked={preferences.autoPlayVideos}
                  onCheckedChange={(checked) => handlePreferenceChange('autoPlayVideos', checked)}
                  className="scale-125"
                />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm bg-muted/30">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-2 flex-1">
                  <Label htmlFor="show-progress-bars" className="text-lg font-bold">Show Progress Bars</Label>
                  <p className="text-base text-muted-foreground leading-relaxed">
                    Display progress indicators on content
                  </p>
                </div>
                <Switch
                  id="show-progress-bars"
                  checked={preferences.showProgressBars}
                  onCheckedChange={(checked) => handlePreferenceChange('showProgressBars', checked)}
                  className="scale-125"
                />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm bg-muted/30">
            <CardContent className="p-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="language" className="text-lg font-bold">Language</Label>
                  <p className="text-base text-muted-foreground leading-relaxed">
                    Choose your preferred language
                  </p>
                </div>
                <Select
                  value={preferences.language}
                  onValueChange={(value) => handlePreferenceChange('language', value)}
                >
                  <SelectTrigger className="w-full h-12 text-base">
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
        </CardContent>
      </Card>

      {/* Ultra mobile-friendly save button */}
      <div className="pt-6">
        <Button 
          onClick={handleSave} 
          disabled={saving}
          className="w-full h-14 text-lg font-bold"
          size="lg"
        >
          <Save className="h-6 w-6 mr-3" />
          {saving ? "Saving..." : "Save Preferences"}
        </Button>
      </div>
    </div>
  );
}
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export function RecentUpdatesSection() {
  return (
    <div>
      <h3 className="text-xl font-semibold mb-6">Recent Updates</h3>
      <Card className="bg-gradient-card">
        <CardHeader>
          <CardTitle>Platform Updates</CardTitle>
          <CardDescription>Stay updated with the latest product information and training materials</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between py-2 border-b border-border/50">
              <div>
                <p className="font-medium">New Video: Investment Product Overview</p>
                <p className="text-sm text-muted-foreground">Added comprehensive training video for investment products</p>
              </div>
              <span className="text-sm text-muted-foreground">2 days ago</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-border/50">
              <div>
                <p className="font-medium">Updated: Medical Insurance Brochures</p>
                <p className="text-sm text-muted-foreground">Latest product brochures and benefit summaries</p>
              </div>
              <span className="text-sm text-muted-foreground">1 week ago</span>
            </div>
            <div className="flex items-center justify-between py-2">
              <div>
                <p className="font-medium">New: AI Assistant for Whole Life Products</p>
                <p className="text-sm text-muted-foreground">Get instant answers about whole life product features</p>
              </div>
              <span className="text-sm text-muted-foreground">2 weeks ago</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
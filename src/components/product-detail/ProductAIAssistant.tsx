import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export function ProductAIAssistant() {
  return (
    <Card className="border-primary/20 bg-gradient-to-r from-blue-50 to-indigo-50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <span>🤖</span> Ask the AI (Custom GPT)
        </CardTitle>
        <CardDescription>
          Get instant answers about this product's features, benefits, and objection handling
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Button variant="hero" size="lg" disabled>
          ➡️ AI Assistant (Coming Soon)
        </Button>
      </CardContent>
    </Card>
  );
}
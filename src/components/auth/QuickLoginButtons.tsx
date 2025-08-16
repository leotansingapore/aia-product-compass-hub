import { Button } from "@/components/ui/button";
import { DemoService } from "@/services/demoService";
import { Crown, Settings, User } from "lucide-react";

interface QuickLoginButtonsProps {
  onDemoLogin: (email: string, password: string) => void;
  loading: boolean;
}

const iconMap = {
  "Master Admin": Crown,
  "Admin": Settings,
  "Regular User": User
};

const colorMap = {
  "Master Admin": "text-yellow-500",
  "Admin": "text-blue-500", 
  "Regular User": "text-green-500"
};

export function QuickLoginButtons({ onDemoLogin, loading }: QuickLoginButtonsProps) {
  const demoAccounts = DemoService.getDemoAccounts();

  return (
    <div className="grid gap-3">
      {demoAccounts.map((account, index) => {
        const IconComponent = iconMap[account.type as keyof typeof iconMap];
        const iconColor = colorMap[account.type as keyof typeof colorMap];
        
        return (
          <Button
            key={index}
            variant="outline"
            size="lg"
            className="justify-start h-auto p-4 text-left"
            disabled={loading}
            onClick={() => onDemoLogin(account.email, account.password)}
          >
            <div className="flex items-center gap-3 w-full">
              <div className={`${iconColor} flex-shrink-0`}>
                <IconComponent className="h-5 w-5" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-medium text-sm">{account.type}</div>
                <div className="text-xs text-muted-foreground truncate">
                  {account.description}
                </div>
              </div>
            </div>
          </Button>
        );
      })}
    </div>
  );
}
import { Button } from "@/components/ui/button";

interface NavigationHeaderProps {
  title: string;
  subtitle?: string;
  showBackButton?: boolean;
  onBack?: () => void;
  actions?: React.ReactNode;
}

export function NavigationHeader({ title, subtitle, showBackButton, onBack, actions }: NavigationHeaderProps) {
  return (
    <div className="bg-gradient-hero text-white py-12 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-4">
            {showBackButton && (
              <Button variant="ghost" onClick={onBack} className="text-white hover:bg-white/20">
                ← Back
              </Button>
            )}
            <div>
              <h1 className="text-3xl font-bold">{title}</h1>
              {subtitle && (
                <p className="text-white/90 mt-2 text-lg">{subtitle}</p>
              )}
            </div>
          </div>
          {actions && (
            <div className="flex items-center space-x-2">
              {actions}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
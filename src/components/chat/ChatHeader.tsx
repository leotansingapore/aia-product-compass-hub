import { Bot, RotateCcw, Settings, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ProductData, ChatStatus } from './types';
import { cn } from '@/lib/utils';

interface ChatHeaderProps {
  productData?: ProductData;
  status: ChatStatus;
  onNewChat: () => void;
  onSettingsClick?: () => void;
  isMobile?: boolean;
  className?: string;
}

export function ChatHeader({
  productData,
  status,
  onNewChat,
  onSettingsClick,
  isMobile = false,
  className
}: ChatHeaderProps) {
  const { isLoading, isConnected, error } = status;

  return (
    <header
      className={cn(
        "border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60",
        isMobile ? "px-3 py-2" : "px-6 py-4",
        className
      )}
      role="banner"
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        {/* Left section - Product info */}
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <div
            className={cn(
              "rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center flex-shrink-0",
              isMobile ? "w-8 h-8" : "w-10 h-10"
            )}
            aria-hidden="true"
          >
            <Bot className={cn("text-white", isMobile ? "h-4 w-4" : "h-5 w-5")} />
          </div>

          <div className="min-w-0 flex-1">
            <h1
              className={cn(
                "font-semibold text-foreground truncate",
                isMobile ? "text-base" : "text-lg"
              )}
            >
              {productData?.name ? `${productData.name} Assistant` : 'AI Assistant'}
            </h1>

            {/* Status indicator */}
            <div className="flex items-center gap-2 mt-0.5">
              {error ? (
                <Badge
                  variant="destructive"
                  className={cn("gap-1", isMobile ? "text-[10px] h-4 px-1.5" : "text-xs")}
                >
                  <XCircle className="h-3 w-3" aria-hidden="true" />
                  <span>Error</span>
                </Badge>
              ) : isLoading ? (
                <Badge
                  variant="secondary"
                  className={cn("gap-1", isMobile ? "text-[10px] h-4 px-1.5" : "text-xs")}
                >
                  <Loader2 className="h-3 w-3 animate-spin" aria-hidden="true" />
                  <span>Typing...</span>
                </Badge>
              ) : isConnected ? (
                <Badge
                  variant="outline"
                  className={cn(
                    "gap-1 border-green-200 bg-green-50 text-green-700 dark:border-green-800 dark:bg-green-950 dark:text-green-400",
                    isMobile ? "text-[10px] h-4 px-1.5" : "text-xs"
                  )}
                >
                  <CheckCircle className="h-3 w-3" aria-hidden="true" />
                  <span>Online</span>
                </Badge>
              ) : null}

              {productData?.category && !isMobile && (
                <Badge variant="secondary" className="text-xs">
                  {productData.category}
                </Badge>
              )}
            </div>
          </div>
        </div>

        {/* Right section - Actions */}
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size={isMobile ? "sm" : "default"}
            onClick={onNewChat}
            className={cn(
              "gap-2",
              isMobile && "h-8 w-8 p-0"
            )}
            aria-label="Start new chat"
            title="Start new chat (Alt+N)"
          >
            <RotateCcw className={cn(isMobile ? "h-4 w-4" : "h-4 w-4")} />
            {!isMobile && <span>New Chat</span>}
          </Button>

          {onSettingsClick && (
            <Button
              variant="ghost"
              size={isMobile ? "sm" : "default"}
              onClick={onSettingsClick}
              className={cn(
                isMobile && "h-8 w-8 p-0"
              )}
              aria-label="Open settings"
              title="Settings"
            >
              <Settings className={cn(isMobile ? "h-4 w-4" : "h-4 w-4")} />
              {!isMobile && <span>Settings</span>}
            </Button>
          )}
        </div>
      </div>

      {/* Error message banner */}
      {error && (
        <div
          className="mt-3 max-w-7xl mx-auto"
          role="alert"
          aria-live="assertive"
        >
          <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-3">
            <p className="text-sm text-destructive font-medium">
              {error}
            </p>
          </div>
        </div>
      )}
    </header>
  );
}

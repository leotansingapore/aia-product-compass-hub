import { useState, createContext, useContext, ReactNode } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAdmin } from '@/hooks/useAdmin';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface ViewModeContextType {
  isViewingAsUser: boolean;
  toggleViewMode: () => void;
}

const ViewModeContext = createContext<ViewModeContextType>({
  isViewingAsUser: false,
  toggleViewMode: () => {},
});

export function ViewModeProvider({ children }: { children: ReactNode }) {
  const [isViewingAsUser, setIsViewingAsUser] = useState(false);

  const toggleViewMode = () => {
    setIsViewingAsUser((prev) => !prev);
  };

  return (
    <ViewModeContext.Provider value={{ isViewingAsUser, toggleViewMode }}>
      {children}
    </ViewModeContext.Provider>
  );
}

export function useViewMode() {
  return useContext(ViewModeContext);
}

export function AdminViewSwitcher() {
  const { isAdmin } = useAdmin();
  const { isViewingAsUser, toggleViewMode } = useViewMode();

  // Only show for actual admins
  if (!isAdmin) return null;

  return (
    <div className="fixed bottom-20 md:bottom-6 left-4 z-50">
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            onClick={toggleViewMode}
            variant={isViewingAsUser ? 'destructive' : 'secondary'}
            size="sm"
            className="shadow-lg gap-2"
          >
            {isViewingAsUser ? (
              <>
                <EyeOff className="h-4 w-4" />
                <span className="hidden sm:inline">Viewing as User</span>
              </>
            ) : (
              <>
                <Eye className="h-4 w-4" />
                <span className="hidden sm:inline">View as User</span>
              </>
            )}
          </Button>
        </TooltipTrigger>
        <TooltipContent side="left">
          {isViewingAsUser
            ? 'Click to return to admin view'
            : 'Preview what regular users see'}
        </TooltipContent>
      </Tooltip>
    </div>
  );
}

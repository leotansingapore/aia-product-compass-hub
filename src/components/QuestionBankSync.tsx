import { useEffect } from "react";
import { useSimplifiedAuth } from "@/hooks/useSimplifiedAuth";
import { setQuestionBankUserId, syncQuestionBankFromServer } from "@/lib/questionBankStore";

/**
 * Keeps the local Question Bank cache (exam attempts + Review Bank) in sync with
 * the signed-in account, so progress follows the user across devices. Mounted
 * once at the app shell; renders nothing.
 */
export function QuestionBankSync() {
  const { user } = useSimplifiedAuth();
  useEffect(() => {
    if (!user?.id) {
      setQuestionBankUserId(null);
      return;
    }
    void syncQuestionBankFromServer(user.id);
  }, [user?.id]);
  return null;
}

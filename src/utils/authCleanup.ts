export const cleanupAuthState = () => {
  try {
    // Remove standard token key if present
    localStorage.removeItem('supabase.auth.token');
  } catch {}

  try {
    // Remove all Supabase auth keys from localStorage
    Object.keys(localStorage).forEach((key) => {
      if (key.startsWith('supabase.auth.') || key.includes('sb-')) {
        localStorage.removeItem(key);
      }
    });
  } catch {}

  try {
    // Also clear sessionStorage keys
    Object.keys(sessionStorage || {}).forEach((key) => {
      if (key.startsWith('supabase.auth.') || key.includes('sb-')) {
        sessionStorage.removeItem(key);
      }
    });
  } catch {}
};

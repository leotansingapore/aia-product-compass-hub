import { useEffect } from 'react';
import { useUser } from '@clerk/clerk-react';
import { supabase } from '@/integrations/supabase/client';

export function useClerkUserSetup() {
  const { user, isLoaded } = useUser();

  useEffect(() => {
    const setupClerkUser = async () => {
      if (!isLoaded || !user) return;

      try {
        // Check if user profile already exists
        const { data: existingProfile } = await supabase
          .from('profiles')
          .select('user_id')
          .eq('user_id', user.id)
          .single();

        if (!existingProfile) {
          // Create profile for new Clerk user
          const { error: profileError } = await supabase
            .from('profiles')
            .insert({
              user_id: user.id,
              email: user.emailAddresses?.[0]?.emailAddress,
              display_name: user.fullName || 'User',
              first_name: user.firstName || '',
              last_name: user.lastName || ''
            });

          if (profileError) {
            console.error('Error creating profile:', profileError);
          }

          // Assign default user role
          const { error: roleError } = await supabase
            .from('user_roles')
            .insert({
              user_id: user.id,
              role: 'user'
            });

          if (roleError) {
            console.error('Error assigning role:', roleError);
          }
        }
      } catch (error) {
        console.error('Error setting up Clerk user:', error);
      }
    };

    setupClerkUser();
  }, [user, isLoaded]);
}
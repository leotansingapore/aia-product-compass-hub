import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';

const signIn = vi.fn();
const signInWithOtp = vi.fn();

vi.mock('@/hooks/useSimplifiedAuth', () => ({
  useSimplifiedAuth: () => ({ signIn, resetPassword: vi.fn() }),
}));
vi.mock('@/hooks/use-toast', () => ({ useToast: () => ({ toast: vi.fn() }) }));
vi.mock('@/integrations/supabase/client', () => ({
  supabase: { auth: { signInWithOtp: (...a: unknown[]) => signInWithOtp(...a) } },
}));

import { SimplifiedAuthForm } from './SimplifiedAuthForm';

describe('SimplifiedAuthForm', () => {
  beforeEach(() => {
    signIn.mockReset().mockResolvedValue(undefined);
    signInWithOtp.mockReset().mockResolvedValue({ error: null });
  });

  it('a blank password emails a sign-in link to existing accounts only', async () => {
    render(<SimplifiedAuthForm />);
    fireEvent.change(screen.getByLabelText('Email'), { target: { value: ' a@b.co ' } });
    fireEvent.click(screen.getByRole('button', { name: 'Email me a sign-in link' }));
    await waitFor(() => expect(screen.getByTestId('link-sent')).toHaveTextContent('a@b.co'));
    expect(signInWithOtp).toHaveBeenCalledWith({
      email: 'a@b.co',
      options: { shouldCreateUser: false, emailRedirectTo: `${window.location.origin}/auth` },
    });
    expect(signIn).not.toHaveBeenCalled();
  });

  it('a typed password signs in with it and sends no link', async () => {
    render(<SimplifiedAuthForm />);
    fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'a@b.co' } });
    fireEvent.change(screen.getByLabelText(/Password/), { target: { value: 'secret123' } });
    fireEvent.click(screen.getByRole('button', { name: 'Sign In' }));
    await waitFor(() => expect(signIn).toHaveBeenCalledWith('a@b.co', 'secret123'));
    expect(signInWithOtp).not.toHaveBeenCalled();
  });
});

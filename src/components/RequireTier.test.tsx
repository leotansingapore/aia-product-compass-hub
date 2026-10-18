import { describe, expect, it, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { RequireTier } from './RequireTier';

// The remembered tier/role may open a page early but must never lock one.
const access = {
  can: () => false,
  lowestTierFor: () => 'post_rnf',
  tier: 'explorer',
  isAdminBypass: false,
  permissionsLoading: false,
  accessFromCache: false,
  accessError: false,
  retryAccess: () => {},
};
vi.mock('@/hooks/useFeatureAccess', () => ({ useFeatureAccess: () => access }));
vi.mock('@/components/tier/TierLockedScreen', () => ({ TierLockedScreen: () => <div>LOCKED</div> }));

const renderGate = () =>
  render(
    <RequireTier feature="pre-rnf-track">
      <div>LESSON</div>
    </RequireTier>,
  );

describe('RequireTier with a remembered access level', () => {
  beforeEach(() => Object.assign(access, { can: () => false, permissionsLoading: false, accessFromCache: false }));

  it('opens the page at once when the remembered level allows it', () => {
    Object.assign(access, { can: () => true, accessFromCache: true });
    renderGate();
    expect(screen.getByText('LESSON')).toBeTruthy();
  });

  it('waits instead of locking when only the remembered level says no', () => {
    Object.assign(access, { accessFromCache: true });
    renderGate();
    expect(screen.queryByText('LOCKED')).toBeNull();
    expect(screen.queryByText('LESSON')).toBeNull();
    expect(screen.getByLabelText('Loading access')).toBeTruthy();
  });

  it('locks once a fresh lookup says no', () => {
    renderGate();
    expect(screen.getByText('LOCKED')).toBeTruthy();
    expect(screen.queryByText('LESSON')).toBeNull();
  });
});

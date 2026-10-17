import { describe, it, expect, vi, afterEach } from 'vitest';
import { verifyFirebaseToken } from '../server';

const mockTokenInfo = (user: Record<string, unknown>) => {
  vi.spyOn(global, 'fetch').mockImplementationOnce(
    async () => new Response(JSON.stringify({ users: [user] }), { status: 200 })
  );
};

describe('Admin authorization: domain + claim rules', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('grants admin to a verified email on the organization domain', async () => {
    mockTokenInfo({ localId: 'u1', email: 'someone@lingopeak.edu.vn', emailVerified: true });
    const result = await verifyFirebaseToken('token');
    expect(result?.isAdmin).toBe(true);
  });

  it('denies admin to an organization-domain email that is NOT verified', async () => {
    mockTokenInfo({ localId: 'u2', email: 'someone@lingopeak.edu.vn', emailVerified: false });
    const result = await verifyFirebaseToken('token');
    expect(result?.isAdmin).toBe(false);
  });

  it('grants admin to an exact trusted admin email even when unverified', async () => {
    mockTokenInfo({ localId: 'u3', email: 'admin@lingopeak.edu.vn', emailVerified: false });
    const result = await verifyFirebaseToken('token');
    expect(result?.isAdmin).toBe(true);
  });

  it('grants admin only for an explicit admin claim, not a spoofed JSON substring', async () => {
    mockTokenInfo({
      localId: 'u4',
      email: 'attacker@gmail.com',
      emailVerified: true,
      customAttributes: JSON.stringify({ nickname: 'admin', role: 'user' })
    });
    const result = await verifyFirebaseToken('token');
    expect(result?.isAdmin).toBe(false);
  });

  it('grants admin when the parsed custom claim sets admin=true', async () => {
    mockTokenInfo({
      localId: 'u5',
      email: 'attacker@gmail.com',
      emailVerified: true,
      customAttributes: JSON.stringify({ admin: true })
    });
    const result = await verifyFirebaseToken('token');
    expect(result?.isAdmin).toBe(true);
  });

  it('never treats an email containing "admin" as proof of privilege', async () => {
    mockTokenInfo({ localId: 'u6', email: 'notadmin@gmail.com', emailVerified: true });
    const result = await verifyFirebaseToken('token');
    expect(result?.isAdmin).toBe(false);
  });
});

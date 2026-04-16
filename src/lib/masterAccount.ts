import type { User } from '@supabase/supabase-js';

const DEFAULT_MASTER = 'mestre@vanzeiro.com.br';

function parseMasterEmailList(): string[] {
  const raw = import.meta.env.VITE_MASTER_EMAILS;
  const source = typeof raw === 'string' && raw.trim() ? raw : DEFAULT_MASTER;
  return source
    .split(',')
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
}

const MASTER_EMAILS = parseMasterEmailList();

/** E-mail usado no login, para comparação com a lista de contas mestre. */
export function getLoginEmail(user: User | null | undefined): string {
  if (!user) return '';
  const direct = typeof user.email === 'string' ? user.email.trim().toLowerCase() : '';
  if (direct) return direct;
  const meta = user.user_metadata as Record<string, unknown> | undefined;
  const fromMeta = meta?.email;
  if (typeof fromMeta === 'string' && fromMeta.trim()) return fromMeta.trim().toLowerCase();
  return '';
}

/** Contas que ignoram bloqueio de assinatura (paywall). Lista extra: `VITE_MASTER_EMAILS` (separado por vírgulas). */
export function isMasterAccount(user: User | null | undefined): boolean {
  const email = getLoginEmail(user);
  return email.length > 0 && MASTER_EMAILS.includes(email);
}

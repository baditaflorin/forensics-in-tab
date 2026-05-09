import { deserializeSession, serializeSession, type SessionState } from './session';

const prefix = '#session=';

function toBase64Url(value: string): string {
  return btoa(value).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
}

function fromBase64Url(value: string): string {
  const padding = value.length % 4 === 0 ? '' : '='.repeat(4 - (value.length % 4));
  return atob(value.replace(/-/g, '+').replace(/_/g, '/') + padding);
}

export function createSessionShareHash(state: SessionState): string {
  const payload = JSON.stringify(serializeSession(state));
  return `${prefix}${toBase64Url(payload)}`;
}

export function parseSessionShareHash(hash: string): SessionState | null {
  if (!hash.startsWith(prefix)) {
    return null;
  }

  const raw = hash.slice(prefix.length);

  try {
    return deserializeSession(JSON.parse(fromBase64Url(raw)));
  } catch {
    return null;
  }
}

export function clearSessionShareHash() {
  history.replaceState(null, document.title, `${location.pathname}${location.search}`);
}

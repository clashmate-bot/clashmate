export function normalizeTag(tag: string): string {
  const trimmed = tag.trim().toUpperCase().replace(/\s+/g, '');
  const withHash = trimmed.startsWith('#') ? trimmed : `#${trimmed}`;

  if (!/^#[A-Z0-9]+$/i.test(withHash)) {
    throw new Error(`Invalid Clash tag: ${tag}`);
  }

  return withHash;
}

export function encodeTagForPath(tag: string): string {
  return encodeURIComponent(normalizeTag(tag));
}

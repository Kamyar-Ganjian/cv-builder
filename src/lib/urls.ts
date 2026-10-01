/** Normalize a web address for hyperlinks, allowing users to omit https://. */
export function normalizeWebUrl(value: string): string | null {
  const trimmed = value.trim();
  if (!trimmed) return null;
  if (/^(?:javascript|data|mailto|tel):/i.test(trimmed)) return null;

  try {
    const url = new URL(/^[a-z][a-z\d+.-]*:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`);
    if (url.protocol !== 'http:' && url.protocol !== 'https:') return null;
    return url.href;
  } catch {
    return null;
  }
}

export function emailHref(value: string): string | null {
  const address = value.trim();
  if (!/^[^\s@]+@[^\s@]+$/.test(address)) return null;
  return `mailto:${encodeURIComponent(address).replace(/%40/gi, '@')}`;
}

export function phoneHref(value: string): string | null {
  const input = value.trim();
  const extension = input.match(/\s*(?:ext\.?|x|#)\s*(\d+)\s*$/i)?.[1];
  const base = extension ? input.slice(0, input.lastIndexOf(extension)).replace(/(?:ext\.?|x|#)\s*$/i, '') : input;
  const number = base.replace(/[^\d+]/g, '');
  if (!/\d/.test(number) || (number.match(/\+/g)?.length ?? 0) > 1 || (number.includes('+') && !number.startsWith('+'))) return null;
  return `tel:${number}${extension ? `;ext=${extension}` : ''}`;
}

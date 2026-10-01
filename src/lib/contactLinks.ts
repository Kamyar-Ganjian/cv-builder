import type { ContactInfo } from './types';
import { emailHref, normalizeWebUrl, phoneHref } from './urls';

export type ContactLinkKey = 'linkedin' | 'github' | 'website';

export interface ContactLink {
  key: ContactLinkKey;
  text: string;
  href: string | null;
}

export interface ContactDetail {
  key: 'email' | 'phone' | 'location';
  text: string;
  href: string | null;
}

export function getContactDetails(contact: ContactInfo): ContactDetail[] {
  const details: ContactDetail[] = [
    { key: 'email', text: contact.email, href: emailHref(contact.email) },
    { key: 'phone', text: contact.phone, href: phoneHref(contact.phone) },
    { key: 'location', text: contact.location, href: null },
  ];
  return details.filter((detail) => Boolean(detail.text));
}

function readableUrl(value: string): string {
  return value.trim().replace(/^https?:\/\//i, '').replace(/^www\./i, '').replace(/\/+$/, '');
}

/** Keep visible resume text independent from the URL destination. */
export function getContactLinks(contact: ContactInfo): ContactLink[] {
  const candidates: { key: ContactLinkKey; destination: string; displayText: string }[] = [
    { key: 'linkedin', destination: contact.linkedin, displayText: contact.linkedinText },
    { key: 'github', destination: contact.github, displayText: contact.githubText },
    { key: 'website', destination: contact.website, displayText: contact.websiteText },
  ];

  return candidates
    .map(({ key, destination, displayText }) => ({
      key,
      text: displayText.trim() || readableUrl(destination),
      href: normalizeWebUrl(destination),
    }))
    .filter((link) => Boolean(link.text));
}

/** Keep profile links to two per row so long URLs do not wrap mid-link. */
export function groupContactLinks(links: ContactLink[]): ContactLink[][] {
  const rows: ContactLink[][] = [];
  for (let index = 0; index < links.length; index += 2) {
    rows.push(links.slice(index, index + 2));
  }
  return rows;
}

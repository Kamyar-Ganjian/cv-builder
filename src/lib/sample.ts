import { createEmptyResume, uid } from './defaults';
import type { Resume } from './types';

/** A realistic sample so first-time users immediately see what "good" looks like. */
export function createSampleResume(): Resume {
  const r = createEmptyResume('Sample - Frontend Engineer', 'US');
  r.contact = {
    fullName: 'Alex Morgan',
    jobTitle: 'Senior Frontend Engineer',
    email: 'alex.morgan@email.com',
    phone: '+1 (415) 555-0132',
    location: 'San Francisco, CA',
    linkedin: 'linkedin.com/in/alexmorgan',
    linkedinText: '',
    github: 'github.com/alexmorgan',
    githubText: '',
    website: 'alexmorgan.dev',
    websiteText: '',
  };
  r.summary =
    'Senior Frontend Engineer with 7 years of experience building high-traffic React and TypeScript applications. Cut load times 43% and lifted conversion 12% for a platform serving 2M monthly users. Deep expertise in Next.js, performance optimization, and design systems.';
  r.skills = [
    { id: uid(), name: 'Languages', skills: 'TypeScript, JavaScript, HTML, CSS, SQL' },
    { id: uid(), name: 'Frontend', skills: 'React, Next.js, Redux, Tailwind CSS, Accessibility (WCAG)' },
    { id: uid(), name: 'Tools & DevOps', skills: 'Git, Docker, AWS, CI/CD, Playwright, Lighthouse' },
  ];
  r.experience = [
    {
      id: uid(),
      title: 'Senior Frontend Engineer',
      company: 'Northwind Labs',
      location: 'San Francisco, CA',
      startDate: '2022-03',
      endDate: '',
      current: true,
      bullets: [
        'Cut Largest Contentful Paint 43% (3.9s to 2.2s) by rebuilding the checkout flow in Next.js with streaming SSR, lifting conversion 12% ($3.1M annual revenue impact)',
        'Led migration of 140+ components to a TypeScript design system used by 4 teams, reducing UI defects 35% and shipping time for new pages 28%',
        'Mentored 5 engineers through RFC reviews and pairing; 3 promoted within 18 months',
      ],
    },
    {
      id: uid(),
      title: 'Frontend Engineer',
      company: 'Brightcart',
      location: 'Oakland, CA',
      startDate: '2019-06',
      endDate: '2022-02',
      current: false,
      bullets: [
        'Grew organic search traffic 61% in 12 months by shipping server-rendered product pages and structured data for 40K SKUs',
        'Reduced bundle size 38% through code splitting and dependency audits, improving mobile conversion 9%',
        'Built A/B testing harness adopted by 3 squads, enabling 25+ experiments per quarter',
      ],
    },
  ];
  r.education = [
    {
      id: uid(),
      school: 'University of Washington',
      degree: 'B.S.',
      field: 'Computer Science',
      location: 'Seattle, WA',
      startDate: '2015-09',
      endDate: '2019-06',
      details: '',
    },
  ];
  r.certifications = [
    { id: uid(), name: 'AWS Certified Solutions Architect - Associate', issuer: 'Amazon Web Services', date: '2023-08' },
  ];
  r.languages = [
    { id: uid(), name: 'English', level: 'Native' },
    { id: uid(), name: 'Spanish', level: 'Professional working proficiency' },
  ];
  r.settings.hiddenSections = ['projects', 'courses'];
  return r;
}

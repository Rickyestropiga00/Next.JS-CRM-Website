// Types for tasks feature

export type ColumnKey = 'todo' | 'inprogress' | 'inreview' | 'done';

export type Task = {
  id: string;
  title: string;
  description: string;
  status: string;
  statusColor: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
  column: ColumnKey;
  lastAdded: string;
  avatars: Array<{
    src: string;
    alt: string;
    fallback: string;
  }>;
};

export const tasks: Task[] = [
  {
    id: '1',
    column: 'todo',
    status: 'DESIGN',
    statusColor: 'var(--badge-design)',
    priority: 'LOW',
    title: 'Hero section',
    description: 'Create a design system for a hero section in 2 different variants. Create a simple presentation with these components.',
    avatars: [
      { src: 'https://cdn.jsdelivr.net/gh/alohe/avatars/png/vibrent_5.png', alt: '@vh', fallback: 'VH' },
      { src: 'https://cdn.jsdelivr.net/gh/alohe/avatars/png/vibrent_7.png', alt: '@ag', fallback: 'AG' },
    ],
    lastAdded: 'Last 2 days ago',
  },
  {
    id: '2',
    column: 'todo',
    status: 'FOLLOW-UP',
    statusColor: 'var(--badge-followup)',
    priority: 'MEDIUM',
    title: 'Prepare project kickoff',
    description: 'Gather requirements and prepare the agenda for the project kickoff meeting.',
    avatars: [
      { src: 'https://cdn.jsdelivr.net/gh/alohe/avatars/png/vibrent_8.png', alt: '@pm', fallback: 'PM' },
    ],
    lastAdded: 'Last 16 minutes ago',
  },
  {
    id: '3',
    column: 'inprogress',
    status: 'DEVELOPMENT',
    statusColor: 'var(--badge-development)',
    priority: 'HIGH',
    title: 'Implement design screens',
    description: 'Our designers created 6 screens for a website that needs to be implemented by our dev team.',
    avatars: [
      { src: 'https://cdn.jsdelivr.net/gh/alohe/avatars/png/vibrent_8.png', alt: '@vh', fallback: 'VH' },
      { src: 'https://cdn.jsdelivr.net/gh/alohe/avatars/png/vibrent_12.png', alt: '@lk', fallback: 'LK' },
    ],
    lastAdded: 'Last 2 hours ago',
  },
  {
    id: '4',
    column: 'inprogress',
    status: 'TESTING',
    statusColor: 'var(--badge-testing)',
    priority: 'MEDIUM',
    title: 'Unit test user login',
    description: 'Write and run unit tests for the user login flow to ensure reliability.',
    avatars: [
      { src: 'https://cdn.jsdelivr.net/gh/alohe/avatars/png/vibrent_15.png', alt: '@em', fallback: 'EM' },
    ],
    lastAdded: 'Last week ago',
  },
  {
    id: '5',
    column: 'inprogress',
    status: 'CONTENT',
    statusColor: 'var(--badge-content)',
    priority: 'LOW',
    title: 'Update documentation',
    description: 'Revise the onboarding documentation for new developers.',
    avatars: [
      { src: 'https://cdn.jsdelivr.net/gh/alohe/avatars/png/vibrent_18.png', alt: '@js', fallback: 'JS' },
    ],
    lastAdded: 'Last 2 weeks ago',
  },
  {
    id: '6',
    column: 'inprogress',
    status: 'FOLLOW-UP',
    statusColor: 'var(--badge-followup)',
    priority: 'MEDIUM',
    title: 'Schedule sprint review',
    description: 'Coordinate with the team to schedule the next sprint review meeting.',
    avatars: [
      { src: 'https://cdn.jsdelivr.net/gh/alohe/avatars/png/vibrent_19.png', alt: '@nl', fallback: 'NL' },
    ],
    lastAdded: 'Last day ago',
  },
  {
    id: '7',
    column: 'inreview',
    status: 'CONTENT',
    statusColor: 'var(--badge-content)',
    priority: 'HIGH',
    title: 'Review homepage layout',
    description: 'The homepage layout implementation is ready for review by the design team.',
    avatars: [
      { src: 'https://cdn.jsdelivr.net/gh/alohe/avatars/png/vibrent_24.png', alt: '@js', fallback: 'JS' },
      { src: 'https://cdn.jsdelivr.net/gh/alohe/avatars/png/vibrent_27.png', alt: '@em', fallback: 'EM' },
    ],
    lastAdded: 'Last 2 weeks ago',
  },
  {
    id: '8',
    column: 'inreview',
    status: 'MEETING',
    statusColor: 'var(--badge-meeting)',
    priority: 'LOW',
    title: 'QA sync meeting',
    description: 'Sync with QA team to review the latest bug reports and fixes.',
    avatars: [
      { src: 'https://cdn.jsdelivr.net/gh/alohe/avatars/png/vibrent_5.png', alt: '@qa', fallback: 'QA' },
    ],
    lastAdded: 'Last week ago',
  },
  {
    id: '9',
    column: 'done',
    status: 'MARKETING',
    statusColor: 'var(--badge-marketing)',
    priority: 'MEDIUM',
    title: 'Fix bugs in the CSS code',
    description: 'Fix small bugs that are essential to prepare for the next release that will happen this quarter.',
    avatars: [
      { src: 'https://cdn.jsdelivr.net/gh/alohe/avatars/png/vibrent_7.png', alt: '@hu', fallback: 'HU' },
      { src: 'https://cdn.jsdelivr.net/gh/alohe/avatars/png/vibrent_8.png', alt: '@nl', fallback: 'NL' },
    ],
    lastAdded: 'Last day ago',
  },
  {
    id: '10',
    column: 'done',
    status: 'TESTING',
    statusColor: 'var(--badge-testing)',
    priority: 'HIGH',
    title: 'End-to-end tests',
    description: 'Completed E2E tests for the checkout flow.',
    avatars: [
      { src: 'https://cdn.jsdelivr.net/gh/alohe/avatars/png/vibrent_12.png', alt: '@em', fallback: 'EM' },
      { src: 'https://cdn.jsdelivr.net/gh/alohe/avatars/png/vibrent_15.png', alt: '@lk', fallback: 'LK' },
    ],
    lastAdded: 'Last 2 hours ago',
  },
  {
    id: '11',
    column: 'done',
    status: 'FOLLOW-UP',
    statusColor: 'var(--badge-followup)',
    priority: 'LOW',
    title: 'Send release notes',
    description: 'Release notes for v1.2 have been sent to all stakeholders.',
    avatars: [
      { src: 'https://cdn.jsdelivr.net/gh/alohe/avatars/png/vibrent_18.png', alt: '@nl', fallback: 'NL' },
    ],
    lastAdded: 'Last 16 minutes ago',
  },
]; 
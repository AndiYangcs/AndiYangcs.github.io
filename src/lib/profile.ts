/**
 * Single source of truth for all profile content.
 *
 * Both the Professional page (rendered as HTML) and the landing Terminal
 * (rendered as command output) consume this module. Edit values here once
 * and they'll update in both places.
 */

export interface SkillGroup {
  category: string;
  items: string[];
}

export interface Role {
  role: string;
  company: string;
  period: string;
  bullets: string[];
  tags: string[];
}

export interface Education {
  degree: string;
  institution: string;
  period: string;
  detail?: string;
}

export interface Project {
  title: string;
  href: string;
  tags: string[];
  description: string;
}

export interface Certification {
  name: string;
  code?: string;
  issuer: string;
  issued: string;
  credentialUrl?: string;
}

export interface Socials {
  email: string;
  github: string;
  linkedin: string;
}

export interface Profile {
  name: string;
  title: string;
  location: string;
  tagline: string;
  about: string[];
  skills: SkillGroup[];
  experience: Role[];
  education: Education[];
  certifications: Certification[];
  projects: Project[];
  socials: Socials;
}

export const PROFILE: Profile = {
  name: 'Andi Yang',
  title: 'AI Engineer',
  location: 'Sydney, Australia',

  tagline:
    'Building practical AI agents and tools that quietly take real work ' +
    "off people's plates.",

  about: [
    "I'm currently a Graduate AI Engineer at Westpac, where I work on " +
      'applying large language models and agentic systems to problems ' +
      "inside one of Australia's largest banks. My focus is the practical " +
      'end of AI: taking capabilities that work in isolation and turning ' +
      'them into tools people can actually rely on. That means integrating ' +
      'with existing systems, making them observable, and shaping them ' +
      'around how the business genuinely operates.',
    'I came into this role through a Bachelor of Computer Science and ' +
      'Commerce, majoring in Computer Science and Financial Technology. ' +
      "I've always been more interested in technology as a means than as " +
      'an end, in understanding the domain well enough to know which ' +
      'problems are worth solving, and then having the engineering skills ' +
      'to actually solve them.',
    'What draws me to AI engineering right now is that the interesting ' +
      "problems have moved. They aren't in the models themselves so much " +
      'as in everything around them, and they\'re shifting again from ' +
      'chatbots you ask questions to toward agents that act on your ' +
      'behalf inside the systems people already use. That makes the real ' +
      'work organisational and architectural: prompt and context design, ' +
      'evaluation, retrieval, tool-use and orchestration, guardrails, and ' +
      'the patient work of understanding a process well enough to delegate ' +
      'the right part of it. I care about solutions that quietly reduce ' +
      'real overhead rather than ones that look impressive in a demo.',
  ],

  skills: [
    { category: 'Languages', items: ['Python', 'TypeScript', 'C', 'Java', 'JavaScript', 'SQL', 'Rust', 'R'] },
    {
      category: 'AI / LLMs',
      items: [
        'Claude Code/CLI',
        'Amp Code',
        'Cursor',
        'GitHub Copilot',
        'Codex',
        'Azure OpenAI',
        'MCP',
        'LangGraph',
      ],
    },
    {
      category: 'Stack & Tools',
      items: [
        'GitHub',
        'Next.js',
        'Node.js',
        'React',
        'Astro',
        'Vue',
        'Tailwind CSS',
        'Bootstrap',
        'Ruby on Rails',
        'FastAPI',
        'PostgreSQL',
        'Supabase',
        'Microsoft Azure',
        'Vercel',
        'Postman',
        'Docker',
        'Sentry',
        'Jira',
        'Confluence',
        'Bitbucket',
        'GitHub Actions',
      ],
    },
    {
      category: 'Practices',
      items: [
        'RAG',
        'LLM evaluation',
        'prompt & context engineering',
        'AI-assisted development',
        'agent design & orchestration',
        'guardrails & safety',
        'TDD',
        'agile',
        'cross-functional collaboration',
      ],
    },
  ],

  experience: [
    {
      role: 'AI Engineer',
      company: 'Westpac',
      period: 'Feb 2026 — Present',
      bullets: [
        'Building AI-powered automation to streamline internal workflows.',
        'Integrating LLM capabilities into existing enterprise processes.',
      ],
      tags: ['LLMs', 'Automation', 'Enterprise AI'],
    },
    {
      role: 'Software Developer',
      company: 'Intuition Education',
      period: 'Jan 2025 — Sep 2025',
      bullets: [
        'Collaborated with the team to plan, build, and test an AI chatbot platform for high-school students on Ruby on Rails.',
        'Owned the front-end interface, prioritising accessibility and usability for a student audience.',
        'Worked across the MVC stack, connecting front-end components to backend logic through a Git-based feature-branch workflow.',
        'Reduced per-query cost ~99% by replacing manual tutor responses with API calls.',
      ],
      tags: ['Ruby on Rails', 'MVC', 'AI/LLM APIs', 'Git'],
    },
    {
      role: 'Senior Teacher & TnL Coordinator',
      company: 'Intuition Education',
      period: 'Feb 2020 — Present',
      bullets: [
        'Oversaw daily operations as a junior manager for teachers and tutors, keeping workflow smooth for students and staff.',
        'Taught and supported students one-on-one with detailed explanations and individualised feedback to help them reach their potential.',
        'Designed and ran training programs for new tutors, covering teaching methodologies and student engagement techniques to maintain quality across the team.',
      ],
      tags: ['Teaching', 'Leadership', 'Training', 'Operations'],
    },
  ],

  education: [
    {
      degree: 'Bachelor of Commerce & Computer Science',
      institution: 'UNSW',
      period: '2020 — 2024',
      detail: 'Majors: Computer Science and Financial Technology.',
    },
  ],

  certifications: [
    {
      name: 'Microsoft Certified: Azure Fundamentals',
      code: 'AZ-900',
      issuer: 'Microsoft',
      issued: 'Apr 2026',
      credentialUrl:
        'https://learn.microsoft.com/api/credentials/share/en-gb/AndiYang-6875/C988783A0DC18A51?sharingId=A95305A02BAA5482',
    },
  ],

  projects: [
    {
      title: 'AI Chatbot',
      href: 'https://ai.intu.com.au',
      tags: ['Ruby on Rails', 'LLM APIs', 'MVC'],
      description:
        'Worked as part of the team at Intuition Education to build an AI chatbot platform for high-school students. Cut per-query cost ~99% by replacing manual tutor responses with API calls.',
    },
    {
      title: 'Personal Website',
      href: 'https://github.com/AndiYangcs/AndiYangcs.github.io',
      tags: ['Astro', 'React', 'TypeScript'],
      description:
        "You're looking at it right now! A personal playground for making random things, and a way to show you who I am beyond a resume or LinkedIn profile.",
    },
  ],

  socials: {
    email: 'andiyang.cs@gmail.com',
    github: 'https://github.com/AndiYangcs',
    linkedin: 'https://www.linkedin.com/in/andiyangcsc/',
  },
};

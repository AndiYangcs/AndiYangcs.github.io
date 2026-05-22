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
  projects: Project[];
  socials: Socials;
}

export const PROFILE: Profile = {
  name: 'Andi Yang',
  title: 'AI Engineer',
  location: 'Sydney, Australia',

  tagline:
    'Engineering practical AI solutions that automate routine work and ' +
    'bridging LLM capabilities with real business processes to reduce ' +
    'overhead, free up time, and let teams focus on higher-value problems.',

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
      'to actually solve them. Finance offers no shortage of either.',
    'What draws me to AI engineering right now is that the interesting ' +
      "problems have moved. They aren't in the models themselves so much " +
      'as in everything around them: prompt and context design, evaluation, ' +
      'retrieval, orchestration, guardrails, and the patient work of ' +
      'understanding a process well enough to automate the right part of ' +
      'it. I care about solutions that quietly reduce real overhead rather ' +
      'than ones that look impressive in a demo.',
    'Outside of work I keep a close eye on the broader AI ecosystem and ' +
      'enjoy prototyping ideas to see what holds up beyond the hype. I ' +
      "value clear thinking, honest measurement of what's working, and " +
      'building things that make the people around me more effective.',
  ],

  skills: [
    { category: 'Languages', items: ['Python', 'Java', 'JavaScript', 'Ruby', 'C', 'SQL', 'HTML'] },
    { category: 'Frameworks', items: ['Ruby on Rails', '.NET', 'React', 'Astro'] },
    { category: 'Tools', items: ['Git', 'MongoDB', 'RStudio', 'Postman'] },
    { category: 'Practices', items: ['MVC', 'OOP', 'unit + integration testing', 'agile'] },
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
        'Built an AI chatbot platform for high-school students on Ruby on Rails (MVC).',
        'Owned the front-end interface, prioritising accessibility and usability.',
        'Reduced per-query cost ~99% by replacing manual tutor responses with API calls.',
      ],
      tags: ['Ruby on Rails', 'AI/LLM APIs', 'Git'],
    },
    {
      role: 'Senior Tutor & Teaching Coordinator',
      company: 'Intuition Education',
      period: 'Feb 2020 — Present',
      bullets: [
        'Junior manager overseeing daily operations for tutors and students.',
        'Designed and ran training programs for new tutors.',
      ],
      tags: ['Leadership', 'Training', 'Operations'],
    },
  ],

  education: [
    {
      degree: 'Bachelor of Commerce & Computer Science',
      institution: 'UNSW',
      period: '2020 — 2024',
      detail: 'Majors: Computer Science (General) and Financial Technology.',
    },
  ],

  projects: [
    {
      title: 'AI Chatbot Platform',
      href: 'https://ai.intu.com.au',
      tags: ['Ruby on Rails', 'LLM APIs', 'MVC'],
      description:
        'Web interface for an AI tutor aimed at high-school students. Cut per-query cost ~99% by moving from human tutors to API calls.',
    },
    {
      title: 'Dungeon Mania (Backend)',
      href: '#',
      tags: ['Java', 'OOP', 'Testing'],
      description:
        'Java backend for a puzzle game with user-generated content. OOP design, agile delivery, full unit + integration test coverage.',
    },
    {
      title: 'Customer Satisfaction Analytics',
      href: '#',
      tags: ['R', 'Statistics', 'Data Viz'],
      description:
        'Led a data project using decision trees and regression to identify drivers of customer satisfaction, built in R.',
    },
    {
      title: 'AndiYangcs.github.io',
      href: 'https://github.com/AndiYangcs/AndiYangcs.github.io',
      tags: ['Astro', 'React', 'TypeScript'],
      description: 'This site. Astro + React islands, deployed to GitHub Pages.',
    },
  ],

  socials: {
    email: 'andiyang.cs@gmail.com',
    github: 'https://github.com/AndiYangcs',
    linkedin: 'https://www.linkedin.com/',
  },
};

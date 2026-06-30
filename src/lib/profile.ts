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
  /** Live deployment URL (omit if no public live demo). */
  liveUrl?: string;
  /** Source-code repository URL (omit if closed-source). */
  repoUrl?: string;
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

export interface FavouriteItem {
  title: string;
  /** Short meta line shown beneath the centred poster, e.g. "Shinkai · 2016". */
  meta?: string;
  /** Path to poster image under /public, e.g. "/posters/films/your-name.jpg". */
  image?: string;
  /** External link opened when the centred poster is clicked. */
  href?: string;
}

export interface FavouriteCategory {
  /** Display label, e.g. "Films". */
  label: string;
  items: FavouriteItem[];
}

export interface VisitedCountry {
  /**
   * Numeric ISO 3166-1 code as a 3-character string, e.g. "578" for Norway.
   * Matched against the `id` field on each feature in
   * `public/data/world-110m.json` (world-atlas 110m TopoJSON).
   * Lookup table: https://en.wikipedia.org/wiki/ISO_3166-1_numeric
   */
  id: string;
  /** Human-readable display name shown in the popover/list. */
  name: string;
  /** Year(s) visited as a free-form string, e.g. "2024" or "2019, 2023" or "2000–". */
  years: string;
  /** Ordered list of cities/regions visited. */
  cities: string[];
  /** 1–3 sentence personal note. Plain text; no markdown. */
  summary: string;
}

export interface AboutHighlight {
  label: string;
  value: string;
}

export interface Profile {
  name: string;
  title: string;
  location: string;
  tagline: string;
  aboutHighlights: AboutHighlight[];
  about: string[];
  /** Short, quirky one-liners shown in the Fortune Cookie widget on /personal. */
  funFacts: string[];
  skills: SkillGroup[];
  experience: Role[];
  education: Education[];
  certifications: Certification[];
  projects: Project[];
  socials: Socials;
  favourites: FavouriteCategory[];
  visited: VisitedCountry[];
}

export const PROFILE: Profile = {
  name: 'Andi Yang',
  title: 'AI Engineer',
  location: 'Sydney, Australia',

  tagline:
    'Building practical AI agents and tools that quietly take real work ' +
    "off people's plates.",

  aboutHighlights: [
    {
      label: 'What I do',
      value:
        'AI Engineer at Westpac, building LLM-powered automation for ' +
        'enterprise workflows.',
    },
    {
      label: 'Specialty',
      value:
        'The practical end of AI — agent design, evaluation, RAG, and ' +
        'the orchestration that turns demos into reliable tools.',
    },
    {
      label: 'Impact',
      value:
        'Previously cut per-query cost ~99% at a high-school tutoring ' +
        'centre by replacing manual tutor responses with API calls.',
    },
  ],

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

  funFacts: [
    'The last physical book I finished completely was my Year 12 Cambridge Ext 2 Maths textbook.',
    "I've tried every sub on the Subway menu.",
    "I prefer Matcha over Coffee",
    "Andi is my chinese name, not a typo",
    "I named my cat Cola because he was black and white, and I was drinking coke at the time."
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
      company: 'High-School Tutoring Centre',
      period: 'Jan 2025 — Sep 2025',
      bullets: [
        'Reduced per-query cost ~99% by replacing manual tutor responses with API calls.',
        'Collaborated with the team to plan, build, and test an AI chatbot platform for high-school students on Ruby on Rails.',
        'Owned the front-end interface, prioritising accessibility and usability for a student audience.',
        'Worked across the MVC stack, connecting front-end components to backend logic through a Git-based feature-branch workflow.',
      ],
      tags: ['Ruby on Rails', 'MVC', 'AI/LLM APIs', 'Git'],
    },
    {
      role: 'Senior Teacher & TnL Coordinator',
      company: 'High-School Tutoring Centre',
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
      liveUrl: 'https://ai.intu.com.au',
      tags: ['Ruby on Rails', 'LLM APIs', 'MVC'],
      description:
        'Worked as part of the team at a high-school tutoring centre to build an AI chatbot platform for students. Cut per-query cost ~99% by replacing manual tutor responses with API calls.',
    },
    {
      title: 'Personal Website',
      repoUrl: 'https://github.com/AndiYangcs/AndiYangcs.github.io',
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

  /**
   * Coverflow data for the Favourites section on /personal.
   * Add `image: "/posters/<category>/<file>.jpg"` per item once you've
   * downloaded the poster art. Leave it omitted and the card renders
   * blank with just the title visible.
   */
  favourites: [
    {
      label: 'Games',
      items: [
        { title: 'Escape From Tarkov', meta: 'BSG · 2017', image: '/posters/games/escape-from-tarkov.jpg' },
        { title: 'League of Legends', meta: 'Riot · 2009', image: '/posters/games/lol.jpg' },
        { title: 'PUBG: Battlegrounds', meta: 'Krafton · 2017', image: '/posters/games/pubg.jpg' },
        { title: 'Minecraft', meta: 'Mojang · 2011', image: '/posters/games/minecraft.webp' },
        { title: 'Stardew Valley', meta: 'ConcernedApe · 2016', image: '/posters/games/stardew-valley.jpg' },
        { title: 'Terraria', meta: 'Re-Logic · 2011', image: '/posters/games/terraria.jpg' },
        { title: "Don't Starve", meta: 'Klei · 2013', image: '/posters/games/dont-starve.jpg' },
        { title: 'Palworld', meta: 'Pocketpair · 2024', image: '/posters/games/palworld.jpg' },
      ],
    },
    {
      label: 'Films',
      items: [
        { title: 'Inception', meta: 'Nolan · 2010', image: '/posters/films/inception.jpg' },
        { title: 'Avengers: Infinity War', meta: 'Marvel · 2018', image: '/posters/films/avengers-infinity-war.jpg' },
        { title: 'Avengers: Endgame', meta: 'Marvel · 2019', image: '/posters/films/avengers-endgame.jpg' },
        { title: 'Your Name', meta: 'Shinkai · 2016', image: '/posters/films/your-name.png' },
        { title: 'Interstellar', meta: 'Nolan · 2014', image: '/posters/films/interstellar.jpg' },
        { title: 'Oppenheimer', meta: 'Nolan · 2023', image: '/posters/films/oppenheimer.jpg' },
      ],
    },
    {
      label: 'Anime',
      items: [
        { title: 'Frieren', meta: 'Madhouse · 2023', image: '/posters/anime/frieren.jpg' },
        { title: 'Mushoku Tensei', meta: 'Studio Bind · 2021', image: '/posters/anime/mushoku-tensei.jpg' },
        { title: 'Konosuba', meta: 'Studio Deen · 2016', image: '/posters/anime/konosuba.jpg' },
        { title: 'Jujutsu Kaisen', meta: 'MAPPA · 2020', image: '/posters/anime/jujutsu-kaisen.jpg' },
        { title: 'Chainsaw Man', meta: 'MAPPA · 2022', image: '/posters/anime/chainsaw-man.jpg' },
        { title: 'Kaguya-sama: Love Is War', meta: 'A-1 Pictures · 2019', image: '/posters/anime/kaguya-sama.jpg' },
        { title: 'Attack on Titan', meta: 'WIT / MAPPA · 2013', image: '/posters/anime/attack-on-titan.jpg' },
      ],
    },
    {
      label: 'TV',
      items: [
        { title: 'Arcane', meta: 'Netflix · 2021', image: '/posters/tv/arcane.jpg' },
        { title: 'The Boys', meta: 'Prime · 2019', image: '/posters/tv/the-boys.jpg' },
        { title: 'Breaking Bad', meta: 'AMC · 2008', image: '/posters/tv/breaking-bad.jpg' },
        { title: 'The Office', meta: 'NBC · 2005', image: '/posters/tv/the-office.jpg' },
      ],
    },
    {
      label: 'Books',
      items: [
        { title: 'Harry Potter series', meta: 'Rowling · 1997–2007', image: '/posters/books/harry-potter.jpg' },
        { title: 'Murder on the Orient Express', meta: 'Christie · 1934', image: '/posters/books/murder-on-the-orient-express.jpg' },
        { title: 'Year 12 Cambridge Ext 2 Maths Textbook', meta: 'Cambridge', image: '/posters/books/cambridge-ext2-maths.jpg' },
      ],
    },
  ],

  /**
   * Countries Andi has visited. The map on /travel reads this list to
   * highlight visited countries and to render the side list of trips.
   * IDs are numeric ISO 3166-1 codes; find yours here:
   * https://en.wikipedia.org/wiki/ISO_3166-1_numeric
   */
  visited: [
    {
      id: "036",
      name: "Australia",
      years: "2000–",
      cities: ["Sydney", "Melbourne", "Brisbane"],
      summary:
        "Home base. Born somewhere else, but everything that matters " +
        "I learned here.",
    },
    {
      id: "156",
      name: "China",
      years: "1998",
      cities: ["Shenzhen"],
      summary:
        "Where I was born. Visits since then have been short, but the " +
        "food and the pace still feel familiar in a way I can't shake.",
    },
    {
      id: "392",
      name: "Japan",
      years: "2019, 2023",
      cities: ["Tokyo", "Kyoto", "Osaka"],
      summary:
        "Comfortably my favourite country to walk around in. Two trips " +
        "in, still nowhere near done.",
    },
    {
      id: "578",
      name: "Norway",
      years: "2024",
      cities: ["Oslo", "Bergen", "Tromsø"],
      summary:
        "Currently my favourite trip. Fjords, the Arctic Circle, and a " +
        "level of quiet I didn't know cities could have.",
    },
    {
      id: "410",
      name: "South Korea",
      years: "2019",
      cities: ["Seoul"],
      summary:
        "A long stopover that turned into one of the best food weeks of " +
        "my life.",
    },
    {
      id: "702",
      name: "Singapore",
      years: "2018, 2024",
      cities: ["Singapore"],
      summary:
        "A reliable layover that I always end up extending. Hawker " +
        "centres are the main draw.",
    },
    {
      id: "764",
      name: "Thailand",
      years: "2022",
      cities: ["Bangkok", "Chiang Mai"],
      summary:
        "First proper trip after the world reopened. Spent more on mango " +
        "sticky rice than I'm willing to admit.",
    },
    {
      id: "458",
      name: "Malaysia",
      years: "2022",
      cities: ["Kuala Lumpur"],
      summary:
        "A quick add-on to the Thailand trip. KL nights and roti canai " +
        "breakfasts.",
    },
    {
      id: "826",
      name: "United Kingdom",
      years: "2017",
      cities: ["London"],
      summary:
        "Family trip. Museums, the Tube, and the realisation that " +
        "Australian coffee really is better.",
    },
    {
      id: "250",
      name: "France",
      years: "2017",
      cities: ["Paris"],
      summary:
        "Same trip as the UK, different vibe. Croissants peaked here " +
        "and have been a disappointment everywhere else since.",
    },
    {
      id: "380",
      name: "Italy",
      years: "2017",
      cities: ["Rome", "Florence", "Venice"],
      summary:
        "Standard European tour stop. Lived on pasta and gelato for ten " +
        "days. Recommended.",
    },
  ],
};

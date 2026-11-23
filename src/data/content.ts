// All site copy lives here. Every fact comes from "Reem Basho CV - Nov 2026.docx".
// Edit this file to update the site; components only read from it.

export type Lens = 'build' | 'research';

export const profile = {
  name: 'Reem Basho',
  headline: 'I question things, then I build something to find out.',
  role: {
    build: 'Software developer and team lead',
    research: 'AI research, early and very curious',
  },
  pitch: {
    build:
      'I ship tested web products, and right now I lead four developers who each drive their own AI coding agent on one shared codebase, without stepping on each other.',
    research:
      'I run small, honest experiments in vision and multimodal AI, and I write down exactly where they fall short. That part teaches me the most.',
  },
  email: 'BashoRW@students.rhu.edu.lb',
  github: 'https://github.com/Reemb-prog',
  githubHandle: 'Reemb-prog',
  linkedin: 'https://www.linkedin.com/in/reem-basho/',
  // Tailored CVs, built from docs/cv/*.html (see docs/cv/README.md). Each lens defaults to its own.
  cv: {
    build: 'cv/Reem-Basho-CV-Software-Engineer.pdf',
    research: 'cv/Reem-Basho-CV-Research.pdf',
  },
  cvs: [
    { lens: 'build', label: 'Software engineer CV', note: '1 page' },
    { lens: 'research', label: 'Research CV', note: '2 pages' },
  ] as { lens: Lens; label: string; note: string }[],
  facts: [
    'B.Sc. Computer Science · Rafic Hariri University · 2024–2027',
    'Saida, Lebanon',
    'Team lead · TechTalks internship · since Nov 2026',
    'CS scholarship · RHU Web Dev Competition winner, 2024',
  ],
};

export const about = [
  'I study Computer Science at Rafic Hariri University, and I’m in my senior year.',
  "I learn in chains. A 30-hour AI bootcamp led me to Stanford's CS229, CS229 led to CS230, and one summer I took two research courses that share a name, Stanford's CS197 and Harvard's CS197, because I wanted to know how research is actually done, not just what it found.",
  "I don't trust an answer until I've built a small experiment around it. Lately that means diffusion models, vision-language models and agent workflows, plus a team of four developers I lead at TechTalks.",
  'I start every software project with a harness: rules, specs, gates and logs written before the first line of code, so AI tools work for the plan instead of improvising it.',
];

export type Project = {
  id: string;
  title: string;
  kind: string;
  date: string;
  img?: string;
  imgAlt?: string;
  /** Typographic frame used when there is no photo. */
  glyph?: string;
  question: string;
  did: string[];
  numbers?: { value: string; label: string }[];
  stack: string[];
  honest?: string;
  lenses: Lens[];
};

export const projects: Project[] = [
  {
    id: 'controlnet',
    title: 'Adaptive ControlNet stopping',
    kind: 'Exploratory research experiment',
    date: 'Jul 2026',
    img: 'controlnet',
    imgAlt: 'A pencil sketch of a church, only outlines and edges',
    question: 'If the picture already has its structure by step 24, does it still need ControlNet until step 30?',
    did: [
      'Ran Stable Diffusion 1.5 with Canny ControlNet and DDIM over 30 denoising steps, comparing full control, a fixed stop, gradual decay and a training-free adaptive stop.',
      'Designed stopping signals from edge-F1 consistency, low-frequency latent change, residual magnitude and trend, high-frequency residual share, rolling slope and drop-from-best.',
      'Added counterfactual oracle labels and a sequential router, with safety limits of edge-F1 loss ≤ 0.02 and CLIP loss ≤ 0.01 against full control.',
    ],
    numbers: [
      { value: '60', label: 'reference generations (30 cases × 2 seeds)' },
      { value: '27.5', label: 'average ControlNet steps the oracle needed' },
      { value: '29', label: 'step the held-out router chose' },
    ],
    stack: ['Stable Diffusion 1.5', 'ControlNet', 'DDIM', 'PyTorch', 'CLIP'],
    honest: 'The oracle shows there is room to stop earlier. My router played it safe and picked step 29, so it has not earned that room yet.',
    lenses: ['research'],
  },
  {
    id: 'qwen',
    title: 'Qwen2.5-VL on MMMU',
    kind: 'Multimodal fine-tuning trial',
    date: 'Jun 2026',
    img: 'qwen',
    imgAlt: 'A graphics card photographed from above',
    question: 'Can a 3B vision-language model learn to write exam questions from a diagram?',
    did: [
      'Built a LoRA fine-tuning trial on Qwen2.5-VL-3B-Instruct with MMMU Accounting, Biology and Chemistry, 20 samples per subject.',
      'Prepared multimodal chat inputs with the Qwen processor, images constrained from 224 × 224 to 512 × 512.',
      'Configured LoRA r = 16, alpha = 32, dropout 0.05, learning rate 2e-4, batch 1 with 8-step gradient accumulation, 30 steps on a Tesla T4. Reviewed loss, approximate perplexity and samples.',
    ],
    numbers: [
      { value: '3B', label: 'parameters, fine-tuned with LoRA' },
      { value: '30', label: 'training steps on one Tesla T4' },
      { value: '3', label: 'MMMU subjects' },
    ],
    stack: ['Hugging Face Transformers', 'PEFT / LoRA', 'PyTorch', 'MMMU'],
    honest: 'The questions it wrote were weakly grounded in the images. Small data, short training and limited compute all show, and I learned that evaluation has to match the task.',
    lenses: ['research'],
  },
  {
    id: 'cs197',
    title: 'Research idea portfolio',
    kind: 'Stanford CS197 methods, AI + mathematics',
    date: 'Jun 2026',
    img: 'cs197',
    imgAlt: 'A blackboard covered in equations next to a lab coat',
    question: 'Which questions are worth a whole semester, and how do you tell before you start?',
    did: [
      'Screened research questions with CS197 methods: nearest-neighbour literature search, an explicit "bit flip", thesis and claim, evaluation design, feasibility and risk, short pilots.',
      'Explored calibration reliability, prompt sensitivity, nonuniform matrix completion, GNN oversmoothing and optimisation stability.',
      'Proposed spectral stopping for multimodal completion using clamped graph propagation, k-NN text graphs and missingness sweeps.',
    ],
    stack: ['Literature search', 'Evaluation design', 'Graph methods', 'Pilot experiments'],
    lenses: ['research'],
  },
  {
    id: 'catalog',
    title: 'RHU Catalog Explorer',
    kind: 'Retrieval chatbot, no LLM',
    date: 'Nov 2026',
    img: 'catalog',
    imgAlt: 'An open library card-catalogue drawer full of index cards',
    question: 'Can a 429-page university catalogue answer your question, with citations, without a language model?',
    did: [
      'Built a local Streamlit chatbot that retrieves and extracts cited answers with classical NLP: TF-IDF retrieval and text normalisation.',
      'Answers carry page-level citations and flag conflicts when the catalogue disagrees with itself.',
      'Added an SVM intent classifier as a soft routing hint, a classical aspect-based feedback module, and a trace view of every retrieval step.',
    ],
    numbers: [
      { value: '429', label: 'catalogue pages, searchable' },
      { value: '0', label: 'language models used' },
    ],
    stack: ['Python', 'scikit-learn', 'pandas', 'Streamlit', 'pytest'],
    lenses: ['research', 'build'],
  },
  {
    id: 'edges',
    title: 'Canny vs RankED',
    kind: 'Comparative research assessment',
    date: 'Apr 2026',
    img: 'edges',
    imgAlt: 'A spiral staircase seen from above, all curves and edges',
    question: 'What do we gain, and lose, when edges are learned instead of designed?',
    did: [
      "Compared John Canny's classical edge detector with RankED, a CVPR 2024 deep-learning method for class imbalance and annotation uncertainty.",
      'Analysed their mathematics, objectives and assumptions, and the trade-offs in interpretability, data dependence, adaptability and compute.',
      'Traced the shift from hand-designed image operators to learned architectures and loss functions.',
    ],
    stack: ['Computer vision', 'Image processing', 'Paper analysis'],
    lenses: ['research'],
  },
  {
    id: 'speech',
    title: 'Speech emotion recognition',
    kind: 'AI bootcamp capstone',
    date: 'Aug–Sep 2025',
    img: 'speech',
    imgAlt: 'A vintage radio microphone on a desk',
    question: 'Can a model hear how someone feels, and how fast can it say so?',
    did: [
      'Built an end-to-end pipeline: audio preprocessing, MFCC extraction, vector features, training, tuning and evaluation.',
      'Compared classical ML with deep learning across accuracy, complexity and inference time, using confusion matrices to choose a model.',
      'Shipped a working Flask API demo as a team, within the ZAKA × Hariri Foundation bootcamp timeline.',
    ],
    stack: ['Python', 'MFCC', 'scikit-learn', 'TensorFlow / Keras', 'Flask'],
    lenses: ['research'],
  },
  {
    id: 'pills',
    title: 'Pill detection & counting',
    kind: 'Computer vision project',
    date: '2026',
    glyph: 'count',
    question: 'Can a trained detector count pills better than classical segmentation?',
    did: [
      'Moved from classical segmentation to trained object detection to find and count pills in images.',
      'Prepared data, trained detection weights, ran inference and reviewed outputs to improve counting accuracy.',
      'Wrapped the workflow in a simple demo app to present results visually.',
    ],
    stack: ['Object detection', 'OpenCV', 'Python'],
    lenses: ['research'],
  },
  {
    id: 'ipcourse',
    title: 'Image processing & pattern recognition',
    kind: 'Coursework with Dr. Roaa Soloh',
    date: '2026',
    img: 'ipcourse',
    imgAlt: 'A close-up of a human iris',
    question: 'How did vision move from deterministic algorithms to learned models, and what did each assume?',
    did: [
      'Applied classical image analysis, feature extraction and computer vision workflows in university coursework.',
      'Studied the differences in mathematical assumptions, objectives, data needs, interpretability and evaluation between classical and learned methods.',
    ],
    stack: ['Image processing', 'Feature extraction', 'Pattern recognition'],
    lenses: ['research'],
  },
  {
    id: 'memorybook',
    title: 'Memory Book Studio',
    kind: 'Canva-style memory book editor',
    date: 'Nov 2026',
    img: 'books',
    imgAlt: 'Stacks of old books in a bookshop',
    question: 'Can a digital memory book feel like turning real pages?',
    did: [
      'Built a canvas editor where designers make memory books that recipients open by unlisted link and read with realistic 3D page turns. Live on Cloudflare Workers.',
      'Smart guides and snapping, masks, crop, freehand pen, undo/redo, 85+ fonts with Arabic RTL templates, collaborator invites, and in-browser MP4 flip-through export.',
      'A secure media gateway with AES-GCM tokens and byte-range streaming, with media stored in the user’s own Google Drive.',
    ],
    numbers: [
      { value: '~104', label: 'Playwright, contract and integration tests' },
      { value: '85+', label: 'fonts, with Arabic RTL templates' },
    ],
    stack: ['TypeScript', 'React 19', 'Vite', 'React Konva', 'StPageFlip', 'Convex', 'Cloudflare Workers', 'Google Drive API', 'WebCodecs'],
    lenses: ['build'],
  },
  {
    id: 'baraem',
    title: 'Baraem Quran Course',
    kind: 'Mosque course management app',
    date: 'Oct–Nov 2026',
    img: 'baraem',
    imgAlt: 'The carpeted prayer hall of a mosque under chandeliers',
    question: 'How do you make an Arabic app feel native to the teachers who use it, not translated for them?',
    did: [
      'Built a mobile-first Arabic RTL app for teachers, coordinators and an admin: attendance, recitation tracking, planning, calendar, room booking and fees. Live in production.',
      'Role-based access enforced in the database, race-safe room booking, a USD / LBP fee ledger with sibling discounts and an audit trail, and Quran verse-to-page mapping.',
      'Delivered in four gated phases, with GitHub Actions backups.',
    ],
    numbers: [
      { value: '228', label: 'Vitest tests, plus Playwright and pgTAP' },
      { value: '4', label: 'gated delivery phases' },
    ],
    stack: ['TypeScript', 'React 19', 'TanStack Query', 'Zod', 'Supabase (RLS, Edge Functions)', 'Vercel'],
    lenses: ['build'],
  },
  {
    id: 'leila',
    title: 'Leila Hneini, bilingual site',
    kind: 'Client portfolio with owner studio',
    date: 'Oct–Nov 2026',
    img: 'leila',
    imgAlt: 'A mirrorless camera with its lens facing the viewer',
    question: 'Can a client edit her own bilingual site without ever calling me?',
    did: [
      'Built an English / Arabic portfolio and marketing site for a marketing consultant and content creator, from an approved Figma design. Live on Vercel.',
      'Full RTL with same-page language switching, and an owner-only studio with drafts, publishing, drag-to-reorder and uploads.',
      'Reduced-motion-aware animation, and a Python harness script that gates backend work on client sign-off.',
    ],
    numbers: [{ value: '~108', label: 'Playwright tests with axe-core accessibility checks' }],
    stack: ['Next.js 16', 'React 19', 'Tailwind CSS v4', 'next-intl', 'dnd-kit', 'Supabase'],
    lenses: ['build'],
  },
  {
    id: 'ventureforge',
    title: 'VentureForge AI',
    kind: 'Multi-agent planning prototype',
    date: 'Jul 2026',
    img: 'ventureforge',
    imgAlt: 'A whiteboard covered in sticky notes in columns',
    question: 'What should never be trusted straight out of a model?',
    did: [
      'Designed a full-stack system that turns a raw startup idea into a structured planning report through a controlled multi-agent workflow.',
      'Typed shared state, agent contracts, dependency sequencing, step-level persistence, retry and repair, trace logging and scoring, so raw model text is never trusted directly.',
      'Paused deliberately at the Phase 1 sequential workflow, before parallel branches, reviewer loops and supervisor routing.',
    ],
    stack: ['React', 'TypeScript', 'FastAPI', 'PostgreSQL', 'LangGraph', 'Pydantic'],
    honest: 'Unfinished on purpose: the contracts and backend flow are in place, the parallel graph is not.',
    lenses: ['build', 'research'],
  },
  {
    id: 'roomiesplit',
    title: 'RoomieSplit',
    kind: 'Shared expense web app',
    date: '2026',
    glyph: 'ledger',
    question: 'Who owes whom, and can the database be the one that decides?',
    did: [
      'Built a roommate app for shared bills, individual payments, balances and settlement summaries.',
      'Owed amounts and balances are calculated in the backend with RPCs and row-level security policies.',
      'Reusable front-end logic and structured data keep it easy to extend.',
    ],
    stack: ['Supabase', 'PostgreSQL RPC', 'Row-Level Security', 'JavaScript'],
    lenses: ['build'],
  },
  {
    id: 'ecommerce',
    title: 'E-commerce web app',
    kind: 'Full-stack Django',
    date: '2025',
    img: 'ecommerce',
    imgAlt: 'An empty green shopping cart against a wall',
    question: 'What does a store need, from schema to checkout?',
    did: [
      'Built a full-stack Django app from requirements through database schema, APIs, pages and admin workflows.',
      'Authentication, catalogue browsing with filtering and pagination, cart logic and the core purchase flow.',
      'Django ORM data modelling, validation, CSRF protection and reusable templates.',
    ],
    stack: ['Python', 'Django', 'SQL'],
    lenses: ['build'],
  },
  {
    id: 'mealplanner',
    title: 'Meal planner & recipes',
    kind: 'Front-end web app',
    date: 'Sep–Dec 2025',
    img: 'mealplanner',
    imgAlt: 'A market stall piled with vegetables',
    question: 'Can planning a week of meals feel quick?',
    did: [
      'Designed and built a responsive app for browsing recipes, planning meals and generating grocery lists.',
      'Event-driven interactions: modals, confirmations, keyboard handling and reusable layout components.',
      'Browser-side data flows that simulate multi-user planning.',
    ],
    stack: ['JavaScript', 'HTML', 'CSS'],
    lenses: ['build'],
  },
];

/** Order of frames on the strip for each lens. */
export const order: Record<Lens, string[]> = {
  build: ['memorybook', 'baraem', 'leila', 'catalog', 'ventureforge', 'roomiesplit', 'ecommerce', 'mealplanner'],
  research: ['controlnet', 'qwen', 'cs197', 'catalog', 'edges', 'speech', 'pills', 'ventureforge', 'ipcourse'],
};

export const now = {
  title: 'Team lead, TechTalks internship',
  product: 'PanelCare, a solar maintenance platform',
  date: 'Nov 2026 – present',
  line: {
    build: 'Right now I lead four developers, and their four AI agents, building one product in parallel.',
    research: 'Right now I am running a live experiment: can four AI coding agents build one product without colliding?',
  },
  context:
    'PanelCare is a web app for coordinators and technicians: customers, sites, systems, recurring maintenance plans, dispatch, inspections and service reports. Four weeks, two sprints.',
  steps: [
    { title: 'Jira holds the status', body: '21 work items with stable IDs mapped to Jira keys, owners, reviewers, story points, PR days and blocking dependencies.' },
    { title: 'The repo holds the rules', body: 'Shared CLAUDE.md / AGENTS.md rules, product scope, typed API contracts, a design blueprint and a decision log with change-request control.' },
    { title: 'One branch per item', body: 'My Node.js harness CLI starts each branch from current main and hands the agent its acceptance criteria and allowed file paths.' },
    { title: 'Plan before code', body: 'Routine tasks are self-approved. Contract, schema, auth or deployment changes need human sign-off. Edits outside allowed paths get flagged.' },
    { title: 'Tests ship with code', body: 'Agents write tests with the code, run only affected tests, and end with a review guide and PR description. Every PR gets a non-author review.' },
  ],
  stack: ['TypeScript', 'Next.js 15', 'React 19', 'Tailwind CSS v4', 'Zod', 'Vitest', 'Playwright', 'Supabase', 'Vercel'],
};

/** A hint at the research I want to pursue next (from my notes on creativity in diffusion). */
export const next = {
  label: 'p.s. the question I want to chase next',
  q: 'Where along a diffusion model’s path from noise to image is there still room to be creative?',
  body: [
    'I suspect there’s a window mid-denoising where the image already has structure but could still become many different, valid things. I want to find it by measurement, then bound how far a model may wander inside it. I’d love to pursue this with a mentor.',
    'In my senior year I take a graphic design course surrounded by designers, and watching them work is teaching me what creativity and design really are. I hope that helps me build a diffusion model that is truly creative, not just random.',
  ],
};

export const questions: { q: string; target: string }[] = [
  { q: 'Does a diffusion model still need its guide at step 29?', target: 'controlnet' },
  { q: 'Can four AI agents build one product without stepping on each other?', target: 'now' },
  { q: 'Why does a 3B model look at a diagram and still guess?', target: 'qwen' },
  { q: 'Can 429 pages answer you without a language model?', target: 'catalog' },
  { q: 'What do we lose when edges are learned instead of designed?', target: 'edges' },
  { q: 'How does an Arabic app feel native, not translated?', target: 'baraem' },
  { q: 'What should never be trusted straight out of a model?', target: 'ventureforge' },
  { q: 'Can a model hear how someone feels?', target: 'speech' },
  { q: 'Which questions are worth a whole semester?', target: 'cs197' },
];

export type Course = {
  when: string;
  name: string;
  by?: string;
  stuck: string;
  lenses: Lens[];
};

export const learning: Course[] = [
  { when: 'Aug–Sep 2025', name: 'ZAKA × Hariri Foundation AI Bootcamp', by: '30 hours', stuck: 'Data science to MLOps in one sprint, and the capstone that hooked me.', lenses: ['research', 'build'] },
  { when: 'Self-study', name: 'Stanford CS229, Machine Learning', by: 'Andrew Ng', stuck: 'Core theory, plus the applied ML labs.', lenses: ['research'] },
  { when: 'Self-study', name: 'Stanford CS230 + Deep Learning Specialization', by: 'Andrew Ng, Kian Katanforoosh', stuck: 'Five courses, from neural nets to sequence models.', lenses: ['research'] },
  { when: 'Dec 2025', name: 'AI Engineering Track: PySpark', stuck: 'Data at a scale that does not fit in pandas.', lenses: ['build'] },
  { when: '2026', name: 'Generative & Agentic AI Bootcamp, RHU', by: 'Dr. Roaa Soloh', stuck: 'n8n agent workflows; a one-day team capstone study planner.', lenses: ['build', 'research'] },
  { when: '2026', name: 'Learn Harness Engineering', by: 'walkinglabs', stuck: 'Why every project I start now begins with a harness.', lenses: ['build'] },
  { when: 'Jun–Jul 2026', name: 'Stanford CS197, Computer Science Research', stuck: 'Bit flips, research velocity, evaluation plans, how to write a paper.', lenses: ['research'] },
  { when: 'Jun–Jul 2026', name: 'Harvard CS197, AI Research Experiences', by: 'Prof. Pranav Rajpurkar', stuck: 'W&B sweeps, Lightning, DreamBooth, AWS GPUs, McNemar and the bootstrap.', lenses: ['research'] },
  { when: 'Jul 2026', name: 'Agentic AI Engineering workshop', by: 'Jon Krohn & Ed Donner', stuck: 'OpenAI Agents SDK, CrewAI and MCP, hands-on.', lenses: ['build', 'research'] },
  { when: 'Jul 2026', name: 'UC Berkeley Agentic AI MOOC, selected lectures', stuck: 'Verifiable agents, graders, benchmark noise, agent safety.', lenses: ['research'] },
  { when: 'Foundations', name: 'Harvard CS50 · Meta back-end, JS & React tracks · freeCodeCamp', stuck: 'The foundations I still lean on.', lenses: ['build'] },
];

export const skills: { group: string; items: string[]; lenses: Lens[] }[] = [
  { group: 'Languages', items: ['Python', 'TypeScript', 'JavaScript', 'C#', 'C++'], lenses: ['build', 'research'] },
  { group: 'Web', items: ['React 19', 'Next.js', 'Vite', 'Tailwind CSS', 'Django', 'FastAPI', 'Flask', 'HTML / CSS'], lenses: ['build'] },
  { group: 'Data & backend', items: ['PostgreSQL', 'Supabase (RLS)', 'Convex', 'MySQL', 'Microsoft SQL', 'PySpark basics'], lenses: ['build'] },
  { group: 'Testing & delivery', items: ['Vitest', 'Playwright', 'pgTAP', 'axe-core', 'GitHub Actions', 'Vercel', 'Cloudflare Workers'], lenses: ['build'] },
  { group: 'ML / AI', items: ['Deep learning', 'Computer vision', 'NLP fundamentals', 'Multimodal AI', 'PEFT / LoRA', 'Diffusion models', 'Agentic AI', 'Model evaluation', 'Statistical model comparison'], lenses: ['research'] },
  { group: 'ML frameworks', items: ['PyTorch', 'PyTorch Lightning', 'TensorFlow / Keras', 'scikit-learn', 'Hugging Face Transformers / PEFT', 'Weights & Biases', 'OpenCV', 'NumPy', 'pandas'], lenses: ['research'] },
  { group: 'Agents', items: ['LangGraph', 'CrewAI', 'OpenAI Agents SDK', 'MCP', 'Pydantic', 'n8n'], lenses: ['research', 'build'] },
  { group: 'How I work', items: ['Claude Code', 'Codex', 'Cursor', 'GitHub Copilot', 'Jira (Scrum)', 'Git', 'Conda', 'Colab', 'AWS EC2'], lenses: ['build', 'research'] },
];

export const recognition = [
  { what: 'Winner, RHU Web Development Competition', when: 'May 2024', note: 'and a Computer Science scholarship' },
  { what: 'Lebanese Collegiate Programming Contest', when: 'Oct 2026', note: 'LCPC 2026 at AUB, after Codeforces training' },
  { what: '2nd nationally, MOS Word 2016', when: '2019', note: 'Microsoft Office Specialist, Lebanon' },
  { what: '2nd nationally, MOS PowerPoint 2016', when: '2020', note: 'plus MOS Excel 2019 in 2023' },
];

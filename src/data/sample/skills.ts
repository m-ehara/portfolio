import type { SkillItem } from "../../types/portfolio"

export const skillsData: SkillItem[] = [
  // Languages
  {
    id: "typescript",
    name: "TypeScript",
    category: "language",
    rank: "★",
    yearsLabel: { ja: "5年以上", en: "5+ yrs" },
    highlight: true,
  },
  {
    id: "javascript",
    name: "JavaScript",
    category: "language",
    rank: "★",
    yearsLabel: { ja: "5年以上", en: "5+ yrs" },
  },
  {
    id: "go",
    name: "Go",
    category: "language",
    rank: "●",
    yearsLabel: { ja: "1年以上", en: "1+ yr" },
  },
  {
    id: "nodejs",
    name: "Node.js",
    category: "language",
    rank: "◎",
    yearsLabel: { ja: "3年以上", en: "3+ yrs" },
    highlight: true,
  },

  // Frameworks & Libraries
  {
    id: "react",
    name: "React",
    category: "framework",
    rank: "◎",
    yearsLabel: { ja: "3年以上", en: "3+ yrs" },
    highlight: true,
  },
  {
    id: "nextjs",
    name: "Next.js",
    category: "framework",
    rank: "◎",
    yearsLabel: { ja: "3年以上", en: "3+ yrs" },
    highlight: true,
  },
  {
    id: "trpc",
    name: "tRPC",
    category: "framework",
    rank: "○",
    yearsLabel: { ja: "業務経験あり", en: "Practical exp" },
    highlight: true,
  },
  {
    id: "vitest",
    name: "Vitest",
    category: "framework",
    rank: "●",
    yearsLabel: { ja: "1年以上", en: "1+ yr" },
  },

  // DB
  {
    id: "postgresql",
    name: "PostgreSQL",
    category: "db",
    rank: "◎",
    yearsLabel: { ja: "3年以上", en: "3+ yrs" },
    highlight: true,
  },
  {
    id: "mysql",
    name: "MySQL",
    category: "db",
    rank: "●",
    yearsLabel: { ja: "1年以上", en: "1+ yr" },
  },
  {
    id: "dynamodb",
    name: "DynamoDB",
    category: "db",
    rank: "△",
    yearsLabel: { ja: "知識あり", en: "Knowledge" },
  },

  // Infra
  {
    id: "aws",
    name: "AWS",
    category: "infra",
    rank: "◎",
    yearsLabel: { ja: "3年以上", en: "3+ yrs" },
    highlight: true,
  },
  {
    id: "cloudflare-workers",
    name: "Cloudflare Workers",
    category: "infra",
    rank: "●",
    yearsLabel: { ja: "1年以上", en: "1+ yr" },
  },

  // OS
  {
    id: "linux",
    name: "Linux",
    category: "os",
    rank: "★",
    yearsLabel: { ja: "5年以上", en: "5+ yrs" },
  },
  {
    id: "macos",
    name: "macOS",
    category: "os",
    rank: "★",
    yearsLabel: { ja: "5年以上", en: "5+ yrs" },
  },

  // AI Tools
  {
    id: "claude",
    name: "Claude",
    category: "ai",
    rank: "●",
    yearsLabel: { ja: "1年以上", en: "1+ yr" },
    highlight: true,
  },
  {
    id: "gemini",
    name: "Gemini",
    category: "ai",
    rank: "●",
    yearsLabel: { ja: "1年以上", en: "1+ yr" },
  },

  // Other / DevOps
  {
    id: "git-github",
    name: "Git / GitHub",
    category: "other",
    rank: "★",
    yearsLabel: { ja: "5年以上", en: "5+ yrs" },
  },
  {
    id: "docker",
    name: "Docker",
    category: "other",
    rank: "◎",
    yearsLabel: { ja: "3年以上", en: "3+ yrs" },
    highlight: true,
  },
]

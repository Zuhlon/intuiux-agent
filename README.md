# IntuiUX Agent

**AI-Powered UX Pipeline** — Transform transcriptions into interactive prototypes in minutes.

![IntuiUX Agent](https://img.shields.io/badge/Next.js-16-black?style=flat-square&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=flat-square&logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-4-38bdf8?style=flat-square&logo=tailwindcss)
![License](https://img.shields.io/badge/License-MIT-green?style=flat-square)

## 🚀 Features

- **📝 Transcription Analysis** — Extract key ideas from interview transcripts
- **🔍 Competitor Analysis** — Virtual competitive analysis and positioning
- **🗺️ Customer Journey Map** — CJM and Information Architecture with Mermaid diagrams
- **👥 Userflow Design** — User scenarios and flow diagrams
- **🎨 Interactive Prototypes** — HTML prototypes in techno-style with honey-yellow accents
- **📋 Testing Plan** — Usability testing plans based on scenarios

## 🛠️ Tech Stack

- **Framework**: Next.js 16 with App Router
- **Language**: TypeScript 5
- **Styling**: Tailwind CSS 4
- **UI Components**: shadcn/ui
- **Database**: Prisma ORM + SQLite
- **AI**: Z.ai LLM SDK

## 📦 Installation

```bash
# Clone the repository
git clone https://github.com/Zuhlon/intuiux-agent.git
cd intuiux-agent

# Install dependencies
bun install

# Setup database
bun run db:push

# Start development server
bun run dev
```

## 🔧 Environment Variables

Create a `.env` file:

```env
DATABASE_URL="file:./dev.db"
```

## 📖 Usage

1. Open the app in your browser
2. Upload a transcription file (.txt, .md, .json) or paste text
3. Click "Запустить анализ" (Start Analysis)
4. Wait for the 6-stage pipeline to complete:
   - 💡 Ideas extraction
   - 🔍 Competitor analysis
   - 🗺️ CJM & IA
   - 👥 Userflow
   - 🎨 Prototype
   - 📋 Testing plan
5. Review results and download HTML prototype

## 🎨 Prototype Design System

The generated prototypes follow a consistent design system:

- **Dark Theme**: `#0a0a0f`, `#12121a` backgrounds
- **Accent Colors**: Honey-yellow `#f5b942`, Amber `#ff9500`
- **Glassmorphism**: Blur effects, subtle borders
- **Accessibility**: WCAG AA contrast, focus indicators, aria-labels
- **Responsive**: Mobile-first approach

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

Made with ❤️ by IntuiUX Team

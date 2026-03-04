# IntuiUX Agent

**AI-Powered UX Pipeline** — Transform transcriptions into interactive prototypes with analytics in minutes.

![Next.js](https://img.shields.io/badge/Next.js-16-black?style=flat-square&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=flat-square&logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-4-38bdf8?style=flat-square&logo=tailwindcss)
![License](https://img.shields.io/badge/License-MIT-green?style=flat-square)

## 🚀 Features

### 7-Stage UX Pipeline

1. **💡 Ideas Extraction** — Extract key product ideas from transcripts
2. **🔍 Competitor Analysis** — Virtual competitive analysis and positioning
3. **🗺️ Customer Journey Map** — CJM with emotional scoring and zoom controls
4. **🏗️ Information Architecture** — Entity taxonomy, ER-diagrams, navigation structure
5. **👥 Userflow** — User scenarios and flow diagrams
6. **🎨 Interactive Prototype** — HTML prototype with Yandex.Metrica analytics
7. **📋 Usability Testing** — Recruitment scripts and testing guidelines

### Key Capabilities

- **CJM Zoom** — Zoom in/out on Customer Journey Maps
- **IA Taxonomy** — Entity taxonomy with ER-diagrams
- **Yandex.Metrica** — Built-in analytics markup (data-ym-* attributes)
- **Accessibility** — WCAG AA compliant prototypes
- **Techno-style** — Dark theme with honey-yellow accents

## 🛠️ Tech Stack

- **Framework**: Next.js 16 with App Router
- **Language**: TypeScript 5
- **Styling**: Tailwind CSS 4
- **UI Components**: shadcn/ui
- **Database**: Prisma ORM + SQLite
- **AI**: Z.ai LLM SDK
- **Diagrams**: Mermaid.js

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
4. Review results across 7 stages:
   - 💡 Ideas
   - 🔍 Competitors
   - 🗺️ CJM (with zoom)
   - 🏗️ IA (with taxonomy)
   - 👥 Userflow
   - 🎨 Prototype (with Yandex.Metrica)
   - 📋 Testing (with scripts & guidelines)
5. Download HTML prototype with analytics

## 🎨 Prototype Features

### Design System
- **Dark Theme**: `#0a0a0f`, `#12121a` backgrounds
- **Accent Colors**: Honey-yellow `#f5b942`, Amber `#ff9500`
- **Glassmorphism**: Blur effects, subtle borders

### Yandex.Metrica Integration
```html
<!-- Event tracking -->
<button data-ym-event="click" 
        data-ym-category="CTA" 
        data-ym-label="main_cta" 
        data-ym-goal="registration">
    Click me
</button>
```

### Accessibility
- Skip-link for keyboard navigation
- ARIA roles and labels
- Focus indicators
- WCAG AA contrast

## 📊 Output Formats

### CJM
- Mermaid journey diagrams
- Detailed stage analysis
- Emotional scoring (1-5)

### IA
- Entity taxonomy (User, Content, System)
- ER-diagrams with relationships
- Navigation structure

### Testing
- Recruitment scripts (Email, Telegram, Social)
- Moderator guidelines
- Evaluation criteria
- Report templates

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

Made with ❤️ by IntuiUX Team

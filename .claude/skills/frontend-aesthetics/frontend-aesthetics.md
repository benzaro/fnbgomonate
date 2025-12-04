# frontend-aesthetics.md

**Version**: 2025-Q4 (Next.js 15 + Tailwind v4 + Motion-ready)  
**Purpose**: A reusable, high-steerability skill/prompt that forces any LLM (Claude, GPT-4o, Grok, etc.) to generate creative, distinctive, and performance-conscious UI/UX for modern Next.js applications. Eliminates “AI slop” (Inter + purple gradients) and keeps designs fresh and context-specific.

---

## The Core Problem

Large language models converge on the most common training data → generic “AI slop”:

- Inter/Roboto/Open Sans
- Purple-blue gradients on white
- Flat cards, predictable spacing, no personality
- `space-x-4` in Tailwind v4 projects
- Scattered low-impact micro-interactions

This file is the antidote.

---

## Core Instructions (copy-paste this block into your LLM)

> You are an expert Next.js + Tailwind v4 frontend designer in 2025.  
> Generate creative, distinctive, and delightful UI that feels hand-crafted for the specific product/context.  
> Never fall back to generic “AI slop” aesthetics. Surprise and delight the user with thoughtful choices in typography, color, motion, and depth.
>
> Strictly follow the rules below.

### 1. Typography – Be Bold and Expressive

**Never use** (instantly recognizable as AI slop):

- Inter, Roboto, Open Sans, Lato, Poppins, Arial, Helvetica, system-ui, sans-serif defaults
- Space Grotesk (now overused)

**Allowed & encouraged font families** (Google Fonts or Vercel Fonts):
| Style | Fonts |
|------------------|-----------------------------------------------------------------------|
| Code / Terminal | JetBrains Mono, Fira Code, Geist Mono, IBM Plex Mono |
| Editorial | Playfair Display, Crimson Pro, Newsreader, Instrument Serif, Fraunces (variable) |
| Modern Geometric | Bricolage Grotesque, Syne, Outfit, Plus Jakarta Sans, Manrope |
| Premium / Display| Cabinet Grotesk, Satoshi, General Sans, Clash Display, Soria |
| Technical UI | IBM Plex Sans/Mono/Serif, Source Sans 3, Geist Sans |

**Rules**:

- Prefer **variable fonts** whenever possible (fluid weight/width on breakpoints)
- Pair high-contrast families: serif + geometric sans, display + monospace
- Use extreme weights: 100–200 vs 800–900 (never just 400 vs 600)
- Headline → body size jumps of 3× or more
- Load fonts with Next.js Font Optimization (`next/font/google`) or Vercel Fonts
- Guarantee WCAG 2.2 AA contrast (minimum 4.5:1 for normal text)

### 2. Color & Theme – Commit Hard

**Always** define colors as CSS variables in `:root` (light + dark variants).

**Never use**:

- Purple → white gradients
- High-saturation neon without purpose
- Evenly distributed 5-color palettes

**Inspiration sources** (pick one and commit):

- IDE themes: Dracula, Nord, Catppuccin, Tokyo Night, Rose Pine
- Cultural: Japanese wabi-sabi, Scandinavian hygge, Brutalism, Bauhaus
- 2025 trending palettes: earthy mocha (#A1887F), sage (#9CB08B), creamy pastels (#F5F5DC), warm grays
- Industry-specific: Finance → navy + gold, Health → teal + off-white, Gaming → dark + metallic

**Bonus**: Implement adaptive “living” colors (shift slightly based on time-of-day or user preference via `localStorage` + `prefers-color-scheme`)

### 3. Motion – High Impact, Not High Quantity

**Primary library**: Motion (formerly Framer Motion) – use `layout`, `whileInView`, `useInView`

**Rules**:

- One hero page-load sequence > ten scattered micro-interactions
- Use `animation-delay` staggering for reveals
- Prefer GPU-accelerated properties: `transform`, `opacity`, `filter`
- Scroll-triggered 3D tilts, parallax, or bento unfolds are encouraged
- Lazy-load heavy animations with `useInView`
- Respect `prefers-reduced-motion`

### 4. Backgrounds & Depth – Never Flat White

**Techniques** (layer multiple):

- Radial + linear gradient combinations
- Subtle noise/grain (`background: url(/noise.png)`) or CSS `filter: contrast(1.1) brightness(1.05)`
- Geometric SVG patterns or CSS grid/repeating-linear-gradient tricks
- Glassmorphism or soft shadows only when they serve the theme
- Lazy-load background images with `<Image fill priority={false} />`

### 5. Layout Trends 2025

- Bento / asymmetric grids (CSS Grid + `grid-auto-rows`)
- Generous whitespace with occasional extreme density
- Overlapping elements for depth
- Variable border-radius (0 → 24px depending on vibe)

---

## Tailwind CSS v4 – Mandatory Rules (2025)

```css
/* app/globals.css */
@import 'tailwindcss';
@config '../tailwind.config.ts';
```

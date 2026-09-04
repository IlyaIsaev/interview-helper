---
name: smui
description: >
  smui theme — terminal aesthetic for shadcn/ui with duskbox-day light and
  duskbox-dusk dark palettes. Use when building or restyling UI, adding shadcn
  components, choosing colors/typography, or applying card/status/label patterns.
---

# smui -- Terminal Theme for shadcn/ui

You are building UI with the **smui** theme, a terminal aesthetic for shadcn/ui
whose colors come from [duskbox](https://github.com/ih-hugh/duskbox)
(`duskbox-day` light, `duskbox-dusk` dark). Read this entire document before
writing any code.

Source: https://smui.statico.io/skill.md

## Install

```bash
npx shadcn add https://smui.statico.io/r/spacemolt-theme.json
```

This sets all shadcn/ui CSS variables. You also need JetBrains Mono.

In this Vite project, load the font from `@fontsource/jetbrains-mono` (not `next/font`).

## Theme Switching

Toggle the `.dark` class on `<html>`. This project uses a Reatom `theme` atom (not `next-themes`). All CSS variables are defined in `:root` (light) and `.dark` (dark).

## Core Rules

1. **Light + dark mode.** `:root` = light (duskbox-day), `.dark` = dark (duskbox-dusk). Accents are overridden per theme.
2. **Zero border radius.** `--radius: 0rem`. All components have sharp corners. The only `rounded-full` elements are status dots, toggle knobs, and avatars.
3. **Monospace everything.** JetBrains Mono is the only font. No serif, no sans-serif.
4. **No emoji.** Use [lucide-react](https://lucide.dev/) icons instead.
5. **Labels are uppercase.** All labels, card titles, and status text use `uppercase` with wide letter-spacing.

## Color Palette

### Semantic Variables (shadcn)

Dark mode (`.dark`, duskbox-dusk):

| Variable | Hex | Usage |
|---|---|---|
| `--background` | `#232336` | Page background |
| `--foreground` | `#ccd8ef` | Primary text |
| `--card` | `#1d1d30` | Card/panel backgrounds |
| `--primary` | `#79b3f7` | Primary accent (blue) |
| `--muted-foreground` | `#a6b1c8` | Secondary/muted text |
| `--border` | `#253a55` | Borders |
| `--destructive` | `#f4514c` | Error/danger |

Light mode (`:root`, duskbox-day):

| Variable | Hex | Usage |
|---|---|---|
| `--background` | `#f9fafc` | Page background |
| `--foreground` | `#252e40` | Primary text |
| `--card` | `#f0f2f4` | Card/panel backgrounds |
| `--primary` | `#33659d` | Primary accent (blue) |
| `--muted-foreground` | `#444d61` | Secondary/muted text |
| `--border` | `#dee0e3` | Borders |
| `--destructive` | `#be2327` | Error/danger |

### Extended SMUI Colors

These are raw HSL triplets, overridden per theme. Use with `hsl()` and optional alpha: `text-[hsl(var(--smui-green))]`, `border-[hsl(var(--smui-yellow)/0.3)]`, `bg-[hsl(var(--smui-frost-2)/0.04)]`.

| Variable | Light | Dark | Usage |
|---|---|---|---|
| `--smui-frost-1` | `#027369` | `#45d0c0` | Teal accent |
| `--smui-frost-2` | `#097687` | `#44d6f1` | Cyan |
| `--smui-frost-3` | `#2769b7` | `#86bafe` | Heading blue |
| `--smui-frost-4` | `#33659d` | `#79b3f7` | Chrome blue (= `--primary`) |
| `--smui-green` | `#3e7232` | `#89cc7b` | Success, online, nominal |
| `--smui-yellow` | `#8e6c02` | `#e7be62` | Warning, standby, caution |
| `--smui-orange` | `#974c00` | `#f68c36` | Alert, degraded |
| `--smui-red` | `#be2327` | `#f4514c` | Critical, error, danger |
| `--smui-purple` | `#695890` | `#b19ee3` | Info, special, rare |

### Surface Hierarchy

Dark (duskbox-dusk):

| Variable | Hex | Usage |
|---|---|---|
| `--smui-surface-0` | `#232336` | Page background |
| `--smui-surface-1` | `#1d1d30` | Cards, panels |
| `--smui-surface-2` | `#2d2d41` | Elevated elements |
| `--smui-surface-3` | `#253a55` | Highlights, active states |

Light (duskbox-day):

| Variable | Hex | Usage |
|---|---|---|
| `--smui-surface-0` | `#f9fafc` | Page background |
| `--smui-surface-1` | `#f0f2f4` | Cards, panels |
| `--smui-surface-2` | `#ebedef` | Elevated elements |
| `--smui-surface-3` | `#dee0e3` | Highlights, active states |

## Typography Patterns

| Tailwind Class | Size | Usage |
|---|---|---|
| `text-label` | 11px | Labels, badges, status text |
| `text-ui` | 13px | Buttons, nav, table body |
| `text-xs` | 12px | Card titles, small text |
| `text-sm` | 14px | Body text, list items |
| `text-heading` | 22px | Section headings |
| `text-stat` | 26px | Big stat numbers |
| `text-hero` | 42px | Hero display text |

**Card title:** `text-xs text-muted-foreground tracking-[1.5px] uppercase font-normal`

**Field label:** `text-label text-muted-foreground tracking-[1.5px] uppercase block mb-1`

**Status/role text:** `text-label text-muted-foreground tracking-wider`

**Big stat number:** `text-stat font-medium text-foreground tracking-tight`

**Status badge:** `text-label tracking-wider uppercase px-1.5 py-px border text-[hsl(var(--smui-green))] border-[hsl(var(--smui-green)/0.3)]`

**Section eyebrow:** `text-xs text-muted-foreground tracking-[2px] uppercase mb-1.5`

## Component Patterns

Always use `card-glow` for hover border effect.

Status colors in alerts:

- Info — frost-2
- Warning — yellow
- Success — green
- Error — `variant="destructive"`

Status dot: `inline-block w-[5px] h-[5px] rounded-full bg-[hsl(var(--smui-green))]`

## tailwind-merge Fix

Custom text sizes conflict with tailwind-merge. Extend `cn()`:

```ts
import { clsx, type ClassValue } from 'clsx'
import { extendTailwindMerge } from 'tailwind-merge'

const twMerge = extendTailwindMerge({
  extend: {
    classGroups: {
      'font-size': ['text-label', 'text-ui', 'text-heading', 'text-stat', 'text-hero'],
    },
  },
})

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
```

## Quick Reference

- Theme: light (duskbox-day) + dark (duskbox-dusk), zero radius, monospace
- Primary accent: dark `#79b3f7` / light `#33659d` (blue)
- Status: green=success, yellow=warning, red=error, purple=info
- Labels: always uppercase with wide tracking
- Cards: use `card-glow` class, `py-2.5 px-3.5` header padding
- No emoji — use lucide-react icons
- Live examples: https://smui.statico.io

---
name: Aqua Info BD
colors:
  surface: '#f6f9ff'
  surface-dim: '#c8dcf0'
  surface-bright: '#f6f9ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#ecf5ff'
  surface-container: '#e1f0ff'
  surface-container-high: '#d6ebff'
  surface-container-highest: '#d0e5f9'
  on-surface: '#081d2c'
  on-surface-variant: '#43474f'
  inverse-surface: '#1f3242'
  inverse-on-surface: '#e6f2ff'
  outline: '#737780'
  outline-variant: '#c3c6d1'
  surface-tint: '#375f96'
  primary: '#00254c'
  on-primary: '#ffffff'
  primary-container: '#073b70'
  on-primary-container: '#80a7e2'
  inverse-primary: '#a7c8ff'
  secondary: '#006590'
  on-secondary: '#ffffff'
  secondary-container: '#78c9ff'
  on-secondary-container: '#005479'
  tertiary: '#002b24'
  on-tertiary: '#ffffff'
  tertiary-container: '#00433a'
  on-tertiary-container: '#3db7a3'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#d5e3ff'
  primary-fixed-dim: '#a7c8ff'
  on-primary-fixed: '#001c3b'
  on-primary-fixed-variant: '#1b477d'
  secondary-fixed: '#c8e6ff'
  secondary-fixed-dim: '#87ceff'
  on-secondary-fixed: '#001e2e'
  on-secondary-fixed-variant: '#004c6d'
  tertiary-fixed: '#83f6e0'
  tertiary-fixed-dim: '#65dac4'
  on-tertiary-fixed: '#00201b'
  on-tertiary-fixed-variant: '#005046'
  background: '#f6f9ff'
  on-background: '#081d2c'
  surface-variant: '#d0e5f9'
  waterline-cyan: '#2AAFC0'
  paper-white: '#FCFDFB'
  mist: '#F2F8FA'
  muted-slate: '#657784'
  rule-border: '#D8E2E6'
typography:
  headline-hero:
    fontFamily: Source Serif 4
    fontSize: 48px
    fontWeight: '700'
    lineHeight: 56px
    letterSpacing: -0.02em
  headline-hero-mobile:
    fontFamily: Source Serif 4
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 38px
    letterSpacing: -0.01em
  headline-lg:
    fontFamily: Source Serif 4
    fontSize: 36px
    fontWeight: '600'
    lineHeight: 44px
    letterSpacing: -0.015em
  headline-lg-mobile:
    fontFamily: Source Serif 4
    fontSize: 26px
    fontWeight: '600'
    lineHeight: 32px
  headline-md:
    fontFamily: Source Serif 4
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  headline-sm:
    fontFamily: Source Serif 4
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
  title-editorial:
    fontFamily: Source Serif 4
    fontSize: 18px
    fontWeight: '500'
    lineHeight: 24px
    letterSpacing: -0.005em
  body-lg:
    fontFamily: Public Sans
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 30px
  body-md:
    fontFamily: Public Sans
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 26px
  body-sm:
    fontFamily: Public Sans
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 22px
  label-caps:
    fontFamily: Public Sans
    fontSize: 11px
    fontWeight: '700'
    lineHeight: 16px
    letterSpacing: 0.08em
  caption:
    fontFamily: Public Sans
    fontSize: 12px
    fontWeight: '400'
    lineHeight: 18px
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  gutter: 1.5rem
  gutter-sm: 1rem
  margin: 2rem
  margin-mobile: 1rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 1rem
  space-lg: 1.5rem
  space-xl: 2.5rem
  space-2xl: 4rem
---

## Brand & Style

The design system embodies an authoritative, research-grounded editorial publication dedicated to aquaculture, fisheries, marine science, and the blue economy in Bangladesh. The target audience includes marine researchers, policy analysts, commercial farm operators, development economists, and environmental journalists.

The visual style blends refined broadsheet authority with contemporary digital journalism. It eschews generic tech styling in favor of structured editorial layouts, crisp hairline borders, asymmetric column balances, and disciplined typographic hierarchy. The aesthetic evokes the rigorous clarity of maritime cartography and scientific publishing, avoiding decorative fluff while remaining deeply human and documentary-led.

## Colors

- **Deep Current (`#073B70`)**: Primary brand anchor. Applied strictly to mastheads, persistent header bars, primary buttons, major section leads, and deep contrast anchors.
- **Ocean Blue (`#0877A8`)**: Secondary interactive color. Utilized for editorial hyperlinking, active navigation tabs, and secondary accents.
- **Aquatic Teal (`#099B88`)**: Tertiary chromatic signal. Reserved for high-value calls-to-action, taxonomic topic badges, and research metric callouts.
- **Waterline Cyan (`#2AAFC0`)**: Fine detail accent. Reserved for micro-indicators, timeline pips, chart data highlights, and thin rule accents.
- **Ink (`#172B3A`)**: Deep navy-tinted neutral. Standard body text and dark-value elements, retaining softer optical contrast than harsh jet black.
- **Muted Slate (`#657784`)**: Subdued neutral. Used for article bylines, publication timestamps, photographic credits, and secondary field labels.
- **Mist (`#F2F8FA`)**: Soft tinted background for callout containers, sidebar side-rails, and editorial pull-quote cards.
- **Paper White (`#FCFDFB`)**: Base canvas tone offering optical warmth that mimics tactile rag paper.

## Typography

Editorial voice is established through the pairing of **Source Serif 4** for editorial titles, story leads, and literary headers, alongside **Public Sans** for reliable, technical clarity across body copy, interface controls, and data tables. For Bengali scripts and localized versions, the system pairs natively with **Hind Siliguri**, matching the visual scale and stroke weight of Public Sans.

- Long-form article copy uses `body-lg` with a strict optical measure of 65–75 characters per line to maximize reading comfort.
- Section tags, taxonomy banners, and metadata headers strictly employ uppercase `label-caps` with expanded tracking to evoke classic broadsheet classification.
- Headline scales adjust seamlessly across breakpoints to maintain typographical presence without breaking awkward hyphenations on smaller screens.

## Layout & Spacing

The layout is grounded in a classic 12-column asymmetric editorial grid with a maximum content canvas width of `1280px`:
- **Desktop (1024px+)**: 12-column grid with `1.5rem` gutters and `2rem` outer margins. Accommodates standard broadsheet distributions: 8 columns for long-form narrative text coupled with 4 columns for contextual sidebars, economic briefs, and related regional reports.
- **Tablet (768px – 1023px)**: 8-column grid with `1.5rem` gutters and `1.5rem` outer margins. Sidebars collapse into sectional dividers beneath primary articles.
- **Mobile (< 768px)**: 4-column fluid layout with `1rem` gutters and `1rem` outer margins.

Vertical rhythm is governed by multiples of 8px (0.5rem), using `space-2xl` between distinct editorial packages and `space-md` within grouped text blocks.

## Elevation & Depth

In alignment with authoritative editorial broadsheets, spatial depth is achieved primarily through planar layering, tonal surfaces, and crisp hairline dividers rather than floating drop shadows:
- **Tonal Contrast**: `Mist` (`#F2F8FA`) is applied to sidebars, data callouts, and secondary panels over the base `Paper White` canvas to establish logical segregation.
- **Structural Lines**: Crisp `1px` solid borders using `#D8E2E6` provide division between stories, header navigation, and footer blocks.
- **Subtle Elevation**: Floating utility panels (e.g., search drawers, sharing bars, modal notices) utilize a soft, ambient elevation: `0 4px 20px -2px rgba(7, 59, 112, 0.08)`. Aggressive blur or pure black drop shadows are strictly prohibited.

## Shapes

The design system maintains a refined, architectural geometry with a roundedness setting of `1` (Soft):
- Standard cards, interactive inputs, and content panels employ subtle 4px (`0.25rem`) corner rounding.
- Editorial taxonomy tags and badge indicators adopt crisp, minimal fillets without venturing into consumer-grade full pill capsules.
- Image frames and documentary photography remain strictly square-edged (`0px`) with optional `1px` interior borders to reflect classic photojournalism standards.

## Components

- **Buttons**:
  - *Primary*: Background `Deep Current` (`#073B70`), text `#FCFDFB`, 4px radius, horizontal padding `space-lg`, vertical padding `space-sm`. Hover state deepens slightly with an underline accent.
  - *Action / Accent*: Background `Aquatic Teal` (`#099B88`), text `#FCFDFB`, used selectively for subscription, research report downloads, and urgent bulletins.
  - *Secondary / Outlined*: Border `1px solid #073B70`, text `Deep Current`, transparent background.

- **Chips & Taxonomy Tags**:
  - Background `Mist` (`#F2F8FA`), border `1px solid #D8E2E6`, text `Deep Current`, uppercase `label-caps`. Active or highlighted topics feature a `2px` left border in `Aquatic Teal`.

- **Lists & Tickers**:
  - Editorial indices feature hairline horizontal rules (`#D8E2E6`) between entries. Leading numbering or category indicators use `Waterline Cyan`.

- **Form Fields & Inputs**:
  - Standard inputs feature a clean `1px` border in `#D8E2E6` on `Paper White`, transitioning to `Ocean Blue` (`#0877A8`) on focus with zero outer glow. Labels sit above inputs in `label-caps` using `Muted Slate`.

- **Cards**:
  - Editorial feature cards rely on clean compositional spacing without heavy containment borders. Image leads on top, followed by `label-caps` category, `Source Serif 4` headline, and `Muted Slate` byline. Data insight cards use `Mist` container background with `1px` border.

- **Specialized Editorial Components**:
  - *Quote Pullouts*: Left-bordered with a `3px` solid stroke of `Ocean Blue`, set in `Source Serif 4` italic (`headline-sm`).
  - *Data Metric Brief*: Large numeric figures displayed in `headline-hero` using `Deep Current`, accompanied by uppercase caption labels in `Aquatic Teal`.
# EduFlow Design System Foundation

---
name: Professional SaaS Identity
colors:
  surface: '#f8f9ff'
  surface-dim: '#d1dbec'
  surface-bright: '#f8f9ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#eef4ff'
  surface-container: '#e5eeff'
  surface-container-high: '#dfe9fa'
  surface-container-highest: '#d9e3f4'
  on-surface: '#121c28'
  on-surface-variant: '#444653'
  inverse-surface: '#27313e'
  inverse-on-surface: '#eaf1ff'
  outline: '#757684'
  outline-variant: '#c4c5d5'
  surface-tint: '#3755c3'
  primary: '#00288e'
  on-primary: '#ffffff'
  primary-container: '#1e40af'
  on-primary-container: '#a8b8ff'
  inverse-primary: '#b8c4ff'
  secondary: '#006c4a'
  on-secondary: '#ffffff'
  secondary-container: '#82f5c1'
  on-secondary-container: '#00714e'
  tertiary: '#532a00'
  on-tertiary: '#ffffff'
  tertiary-container: '#743d00'
  on-tertiary-container: '#ffa85d'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#dde1ff'
  primary-fixed-dim: '#b8c4ff'
  on-primary-fixed: '#001453'
  on-primary-fixed-variant: '#173bab'
  secondary-fixed: '#85f8c4'
  secondary-fixed-dim: '#68dba9'
  on-secondary-fixed: '#002114'
  on-secondary-fixed-variant: '#005137'
  tertiary-fixed: '#ffdcc3'
  tertiary-fixed-dim: '#ffb77d'
  on-tertiary-fixed: '#2f1500'
  on-tertiary-fixed-variant: '#6e3900'
  background: '#f8f9ff'
  on-background: '#121c28'
  surface-variant: '#d9e3f4'
typography:
  h1:
    fontSize: 36px
    fontWeight: '700'
    lineHeight: 44px
    letterSpacing: -0.02em
  h2:
    fontSize: 30px
    fontWeight: '600'
    lineHeight: 38px
    letterSpacing: -0.01em
  h3:
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
    letterSpacing: -0.01em
  h4:
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
    letterSpacing: 0em
  body-lg:
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
    letterSpacing: 0em
  body-md:
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
    letterSpacing: 0em
  body-sm:
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
    letterSpacing: 0em
  label-md:
    fontSize: 14px
    fontWeight: '500'
    lineHeight: 20px
    letterSpacing: 0.01em
  caption:
    fontSize: 12px
    fontWeight: '400'
    lineHeight: 16px
    letterSpacing: 0em
  h1-mobile:
    fontSize: 28px
    fontWeight: '700'
    lineHeight: 36px
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  base: 8px
  xs: 4px
  sm: 8px
  md: 16px
  lg: 24px
  xl: 32px
  xxl: 48px
  gutter: 24px
  margin: 32px
---

## Brand & Style

The brand personality is rooted in reliability and academic excellence. It communicates competence through restraint, targeting educational administrators who require a calm, distraction-free environment for complex data management. 

This design system employs a **Corporate / Modern** aesthetic inspired by high-end fintech tools. It prioritizes clarity and functional density over decorative flair. The visual language uses precise alignment, systematic spacing, and a subtle interplay of light and depth to create a trustworthy, professional workspace. The interface feels established yet modern, bridging the gap between traditional educational values and future-forward technology.

## Colors

The palette is led by a deep, authoritative Blue (#1E40AF) to establish trust. A confident Emerald Green (#059669) serves as the success indicator and secondary accent, reflecting growth and positive outcomes. 

Neutrals are based on a warm-gray scale to prevent the "coldness" often found in pure grays, reducing eye strain during long administrative sessions. 
- **Primary:** Branding, main navigation, and critical action buttons.
- **Secondary/Accent:** Success states, progress indicators, and additive actions.
- **Neutrals:** Used for text hierarchy and structural borders.
- **Semantic:** Standardized Red and Amber for error handling and pending status alerts.

## Typography

The system utilizes **Inter** for all Latin characters and **Noto Sans Bengali** for local language support. Both fonts are chosen for their high x-height and exceptional legibility at small sizes.

**Weight Matching:**
To ensure visual parity between English and Bangla, Bangla text should typically be set 1px larger or with a slightly higher line-height if displayed inline with English, as Bengali script has complex conjuncts. 

**Usage:**
- **Headlines (H1-H4):** Bold and semi-bold weights for clear information architecture.
- **Body:** Regular weight for maximum readability. Use `body-md` for standard content and `body-sm` for denser data tables.
- **Labels:** Medium weight for buttons, navigation items, and form headers.

## Layout & Spacing

This design system follows a strict **8px base grid** to ensure consistency across all components. 

**Grid System:**
- **Desktop:** 12-column fluid grid with 24px gutters and 32px side margins.
- **Tablet:** 8-column grid with 16px gutters and 24px side margins.
- **Mobile:** 4-column grid with 16px gutters and 16px side margins.

Spacing is used generously to create a "breathable" interface. Padding within containers (like cards or modals) should default to `lg` (24px) for desktop and `md` (16px) for mobile to maintain a clean, SaaS-inspired look.

## Elevation & Depth

Hierarchy is established through **Tonal Layers** and **Ambient Shadows**. Surfaces are tiered to represent depth:

1.  **Level 0 (Canvas):** The base background (#F9FAFB).
2.  **Level 1 (Cards/Surface):** White containers with a 1px subtle border (#E5E7EB) and a low-opacity shadow.
3.  **Level 2 (Popovers/Modals):** Elements that float above the surface with a more pronounced, diffused shadow.

**Shadow Character:**
Shadows are tinted with the neutral scale (using a hint of Blue) rather than pure black. They should be soft with a high blur radius and very low opacity (e.g., `box-shadow: 0 4px 6px -1px rgba(30, 64, 175, 0.05)`).

## Shapes

The shape language is modern and approachable without being overly playful. A standard **8px (0.5rem)** radius is applied to most UI components to strike a balance between professional precision and contemporary softness.

- **Standard (8px):** Buttons, Input fields, Cards.
- **Large (16px):** Modals, large featured sections.
- **Pill:** Status chips, tags, and circular icons.

## Components

### Buttons
- **Primary:** Solid `#1E40AF`, white text, 8px radius.
- **Secondary:** Outline `#1E40AF` or solid `#F3F4F6` with primary text.
- **States:** Hover states should be 10% darker; focus states should have a 2px offset ring.

### Input Fields
- White background with a 1px border (`#D1D5DB`).
- On focus: Border changes to `#1E40AF` with a subtle blue glow.
- Labels: `label-md` weight, positioned above the field.

### Cards
- White background, 1px border (`#F3F4F6`), and 8px radius.
- Consistent 24px internal padding.
- For interactive cards, add a slight elevation increase on hover.

### Chips & Tags
- Used for status (e.g., "Active", "Pending").
- Low-saturation background with high-saturation text of the same hue (e.g., Light green background with dark green text for success).

### Iconography
- Consistent **Line Icons** with a 1.5px stroke.
- Corners of icons should be slightly rounded to match the 8px component radius.
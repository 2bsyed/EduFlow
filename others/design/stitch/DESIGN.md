# EduFlow Design System

## Product split

EduFlow has two distinct visual experiences. The signed-in ERP is a flat, compact Fluent-inspired business interface. The public institute website is a premium, photographic experience with translucent navigation over the hero only. Do not apply glass, gradients, or decorative depth to the ERP. Do not apply ERP table density to the public site.

## ERP foundations

- **Typeface:** Inter. Body 400, controls and labels 500, page headings 600. Use Noto Sans Bengali for Bengali text.
- **Primary:** `#0F6CBD`; hover/pressed: `#115EA3`.
- **Canvas:** `#F5F7F9`; work surface: `#FFFFFF`.
- **Neutral text:** `#242424`; secondary text: `#5C5C5C`.
- **Borders/dividers:** `#D1D1D1` / `#E1E1E1`.
- **Success:** `#107C10`; warning: `#A85300`; error: `#BA1A1A`. Always pair status color with text.
- **Spacing:** 4px base increments, with 8px and 16px common; 24px page gutters on desktop and 16px on mobile.
- **Corners:** 4px for fields and compact controls; 6–8px for surfaces and dialogs. Avoid pills except for compact status tags.
- **Elevation:** thin borders first; at most a very subtle shadow for overlays. No hover lift.

## Application shell

Use a stable white left navigation rail, a compact white utility header, and a light neutral work canvas. Keep the institute context, global search, notifications when actionable, and profile controls in predictable positions. The selected navigation item uses a pale blue fill and a slim blue edge indicator. On small screens, navigation must collapse without hiding destinations or clipping controls.

## Components

- **Buttons:** 36–40px high, 4–6px corner radius. Primary actions use the solid primary blue. Secondary actions use white or neutral gray with a border. Destructive actions use red and require confirmation when data is removed.
- **Fields:** white surface, visible label above, thin gray border, 4px radius. Focus uses a 2px blue outline or inset border. Keep helper text short and errors inline.
- **Tables:** compact readable rows, clear header labels, consistent column alignment, thin horizontal dividers, explicit textual statuses, and a distinct action column. Numeric and currency values align consistently.
- **Cards/sections:** prefer titled sections with borders over decorative KPI cards. Use one shared structure for repeated metrics.
- **Dialogs:** reserve for short tasks. Long forms use a page or roomy side panel. Make Save and Cancel easy to distinguish.
- **Responsive behavior:** desktop-first for administrative work; on mobile, reflow tables into readable records and keep touch controls comfortably sized.
- **Accessibility:** visible keyboard focus, readable contrast, text labels for status, and explicit control labels.

## Public institute website

Keep the approved premium direction: cinematic institute photography, restrained translucent navigation over the hero, institute-specific identity and content, clear admission/contact actions, and a polished footer. Use glass only over suitable hero photography. The public site is not the generic EduFlow marketing page.

## Product constraints

Design only capabilities supported by the current product or clearly label a prototype state. Do not imply that online payments, SMS/WhatsApp delivery, custom domains, or other integrations are active unless verified. Use Inter in Stitch; Segoe UI is unavailable there.

---
name: CalcuMap Design System
colors:
  surface: '#fcf8ff'
  surface-dim: '#dcd8e1'
  surface-bright: '#fcf8ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f6f2fb'
  surface-container: '#f0ecf5'
  surface-container-high: '#ebe6f0'
  surface-container-highest: '#e5e1ea'
  on-surface: '#1c1b21'
  on-surface-variant: '#474552'
  inverse-surface: '#313036'
  inverse-on-surface: '#f3eff8'
  outline: '#787583'
  outline-variant: '#c8c4d4'
  surface-tint: '#5951b4'
  primary: '#574eb1'
  on-primary: '#ffffff'
  primary-container: '#7067cc'
  on-primary-container: '#fffbff'
  inverse-primary: '#c5c0ff'
  secondary: '#006c52'
  on-secondary: '#ffffff'
  secondary-container: '#8af7cf'
  on-secondary-container: '#007257'
  tertiary: '#745800'
  on-tertiary: '#ffffff'
  tertiary-container: '#926f00'
  on-tertiary-container: '#fffbff'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#e4dfff'
  primary-fixed-dim: '#c5c0ff'
  on-primary-fixed: '#140067'
  on-primary-fixed-variant: '#41379b'
  secondary-fixed: '#8af7cf'
  secondary-fixed-dim: '#6edab4'
  on-secondary-fixed: '#002117'
  on-secondary-fixed-variant: '#00513d'
  tertiary-fixed: '#ffdf98'
  tertiary-fixed-dim: '#efc04c'
  on-tertiary-fixed: '#251a00'
  on-tertiary-fixed-variant: '#5a4300'
  background: '#fcf8ff'
  on-background: '#1c1b21'
  surface-variant: '#e5e1ea'
typography:
  display-lg:
    fontFamily: Hanken Grotesk
    fontSize: 48px
    fontWeight: '700'
    lineHeight: '1.1'
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Hanken Grotesk
    fontSize: 32px
    fontWeight: '700'
    lineHeight: '1.2'
  headline-lg-mobile:
    fontFamily: Hanken Grotesk
    fontSize: 24px
    fontWeight: '700'
    lineHeight: '1.2'
  headline-md:
    fontFamily: Hanken Grotesk
    fontSize: 24px
    fontWeight: '600'
    lineHeight: '1.3'
  body-lg:
    fontFamily: Hanken Grotesk
    fontSize: 18px
    fontWeight: '400'
    lineHeight: '1.6'
  body-md:
    fontFamily: Hanken Grotesk
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.5'
  label-md:
    fontFamily: Hanken Grotesk
    fontSize: 14px
    fontWeight: '600'
    lineHeight: '1.4'
    letterSpacing: 0.01em
  label-sm:
    fontFamily: Hanken Grotesk
    fontSize: 12px
    fontWeight: '500'
    lineHeight: '1.4'
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
  sm: 12px
  md: 24px
  lg: 40px
  xl: 64px
  gutter: 24px
  margin-mobile: 16px
  margin-desktop: 48px
  max-width: 1280px
---

## Brand & Style

The design system for CalcuMap is built on the principles of **Rounded Minimalism**. The brand personality is encouraging, clear, and academically focused without being rigid. It targets students and educators who value focus and spatial organization. 

The aesthetic is defined by "Soft Precision"—combining the mathematical accuracy of a calculator with the approachable nature of a modern learning tool. The UI utilizes generous whitespace to reduce cognitive load, avoiding heavy textures, skeuomorphism, or aggressive gradients in favor of flat, high-clarity surfaces.

## Colors

The palette is anchored by a deep **Dark Indigo** for maximum legibility in typography, contrasted against a playful **Primary Indigo** for interactive elements. 

- **Primary Indigo (#7F77DD):** Used for main actions, active states, and focus indicators.
- **Secondary Mint (#5DCAA5):** Reserved for "success" states, progress completion, and secondary callouts to provide a refreshing visual break.
- **Background Tint (#EEEDFE):** Applied to the global body background to reduce eye strain compared to pure white.
- **Surface White (#FFFFFF):** Used exclusively for content containers (cards, modals) to create clear "islands" of information.

## Typography

**Hanken Grotesk** is the sole typeface for this design system. It was selected for its clean, geometric construction and high legibility at small sizes, which is critical for mathematical notations. 

Headlines use a heavy weight (700) and tighter letter spacing to create a sense of authority and structure. Body text uses a generous line height (1.5-1.6) to ensure that long-form educational content remains digestible. Labels are set in medium or semi-bold weights to distinguish functional UI text from content.

## Layout & Spacing

The layout follows a **Fixed Grid** model for desktop to maintain a readable line length for educational materials, while transitioning to a **Fluid Grid** for mobile devices.

- **Desktop:** 12-column grid with a 1280px max-width, 24px gutters, and 48px outer margins.
- **Tablet:** 8-column grid with 24px margins.
- **Mobile:** 4-column grid with 16px margins.

The spacing rhythm is strictly based on an 8px scale. Use `lg` (40px) or `xl` (64px) for vertical section spacing to maintain the "generous whitespace" brand pillar.

## Elevation & Depth

This design system uses **Tonal Layering** rather than traditional shadows to define hierarchy. 

1.  **Level 0 (Background):** Background Tint (#EEEDFE).
2.  **Level 1 (Surface):** Surface White (#FFFFFF). Cards use a subtle 1px stroke in #7F77DD at 10% opacity instead of a shadow to maintain a flat aesthetic.
3.  **Level 2 (Interaction):** When a user interacts with a card (hover), a soft, ultra-diffused shadow may be applied: `0 8px 24px rgba(38, 33, 92, 0.08)`. 

Floating elements like Modals or Popovers use a slightly more distinct shadow to separate them from the content layer, but should still feel light and airy.

## Shapes

The shape language is consistently **Rounded**. 

- **Small elements (Buttons, Inputs):** 0.5rem (8px) or 0.75rem (12px) radius.
- **Medium elements (Cards, Modals):** 1rem (16px) or 1.5rem (24px) radius.
- **Badges/Chips:** Fully rounded (pill-shaped) to distinguish them from interactive buttons.

Avoid sharp corners entirely to maintain the approachable, friendly "CalcuMap" identity.

## Components

### Buttons
Primary buttons are solid Primary Indigo (#7F77DD) with white text. Secondary buttons use a Primary Indigo stroke with a transparent background. All buttons have a height of 48px for desktop and 12px-16px corner radius.

### Input Fields
Inputs feature a Surface White background and a subtle 1px border (#26215C at 15% opacity). On focus, the border thickens to 2px and changes to Primary Indigo. Corners are rounded to 12px.

### Progress Indicators
Progress bars utilize a light version of the Secondary Mint as a track and the solid Secondary Mint (#5DCAA5) for the fill. The ends are always rounded.

### Cards
Cards are the primary container. They must have a 16px corner radius, a white background, and 24px-32px of internal padding.

### Badge Icons
Small status indicators or category markers. They should use a low-opacity background of the Primary or Secondary color (10-15%) with high-contrast text or icons in the solid color.
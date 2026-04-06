# Design System

> **Source of truth for visual styles: Stitch**
> The values in this document are derived from the Stitch project (`https://stitch.withgoogle.com/projects/2770586918123854384`).
> Before implementing any screen, **always open the matching Stitch frame and verify the exact values** — colors, fonts, spacing, and radii. This document is a reference guide, not a substitute for reading the design.
> If the Stitch design differs from this document, **Stitch wins**.

This document describes every design token, component pattern, and visual rule used in the LovePath app. Values here are sourced from Stitch and should be registered in `tailwind.config.js` before use in components.

---

## Color Palette

### Brand Colors

| Name | Hex | NativeWind Class | Use |
|------|-----|-----------------|-----|
| Primary Rose | `#C0556A` | `bg-primary` / `text-primary` | CTA buttons, active states, key highlights |
| Secondary Purple | `#7F77DD` | `bg-secondary` / `text-secondary` | Perception phase, secondary accents |
| Teal | `#1D9E75` | `bg-teal` / `text-teal` | Action phase, success states, Mutual badge |
| Amber | `#EF9F27` | `bg-amber` / `text-amber` | Will phase, warning states |
| Danger Red | `#E24B4A` | `bg-danger` / `text-danger` | Error states, One-sided badge |

### Background Colors

| Name | Hex | NativeWind Class | Use |
|------|-----|-----------------|-----|
| App background | `#FAF9F6` | `bg-background` | Screen background |
| Card surface | `#FFFFFF` | `bg-card` | Cards, modals |
| Rose tint | `#FDE8EC` | `bg-rose-tint` | Highlighted cards (onboarding, LovePath) |
| Purple tint | `#EEEDFE` | `bg-purple-tint` | Obstacle cards (Perception), insight card |
| Teal tint | `#E1F5EE` | `bg-teal-tint` | Success cards, rebuild intro |
| Amber tint | `#FAEEDA` | `bg-amber-tint` | Warning cards, obstacle (Will) |
| Red tint | `#FCEBEB` | `bg-red-tint` | Danger alerts, One-sided warnings |

### Text Colors

| Name | Hex | NativeWind Class | Use |
|------|-----|-----------------|-----|
| Primary text | `#1A1A1A` | `text-foreground` | Body copy, headings |
| Muted text | `#888780` | `text-muted` | Subtitles, captions, placeholders |
| Hint text | `#B4B2A9` | `text-hint` | Disabled states |
| Border | `#E8E6E0` | `border-border` | Card borders, dividers, input borders |

---

## Typography

| Style | Size | Weight | Line Height | NativeWind |
|-------|------|--------|-------------|-----------|
| H1 — Screen title | 24px | 700 | 1.3 | `text-2xl font-bold` |
| H2 — Card heading | 20px | 600 | 1.3 | `text-xl font-semibold` |
| H3 — Section heading | 16px | 600 | 1.4 | `text-base font-semibold` |
| Body — Standard | 14px | 400 | 1.6 | `text-sm` |
| Body — Emphasis | 14px | 500 | 1.6 | `text-sm font-medium` |
| Caption | 12px | 400 | 1.5 | `text-xs` |
| Micro | 11px | 500 | 1.4 | `text-[11px] font-medium` |
| Large number | 40px | 700 | 1.1 | `text-[40px] font-bold` |
| Hero number | 48px | 700 | 1.0 | `text-5xl font-bold` |

---

## Spacing

All spacing follows an 8px base grid.

| Name | Value | Use |
|------|-------|-----|
| Screen padding horizontal | 20px | Left/right padding on all screens |
| Card padding | 16px | Internal padding in cards |
| Section gap | 16px | Between major sections |
| Component gap | 12px | Between related components |
| Tight gap | 8px | Between closely related items |
| Card margin-bottom | 12px | Between stacked cards |

---

## Border Radius

| Component | Radius | NativeWind |
|-----------|--------|-----------|
| Cards | 16px | `rounded-2xl` |
| Large cards / hero cards | 20px | `rounded-[20px]` |
| Buttons (pill) | 50px | `rounded-full` |
| Inputs | 12px | `rounded-xl` |
| Badges / pills | 20px | `rounded-full` |
| Small badges | 4px | `rounded` |

---

## Shadows

```
Card shadow (iOS):    shadowColor: #000, shadowOffset: {0,2}, shadowOpacity: 0.06, shadowRadius: 12
Card shadow (Android): elevation: 2
```

NativeWind: `shadow-sm` (configure in `tailwind.config.js` with the above values)

---

## Components

### Primary Button
```
Background:   #C0556A (primary rose)
Text:         White, 16px, font-weight 600
Height:       52px
Border-radius: 50px (pill)
Width:        fill container (minus screen padding)
Disabled:     50% opacity
```

### Outlined Button
```
Background:   transparent
Border:       1.5px solid #C0556A
Text:         #C0556A, 14px, font-weight 500
Height:       44px
Border-radius: 50px
```

### Card
```
Background:   #FFFFFF
Border:       0.5px solid #E8E6E0
Border-radius: 16px
Padding:      16px
Shadow:       see Shadows above
Margin-bottom: 12px
```

### Tinted Card
```
Background:   [tint color — see color palette]
Border:       none
Border-radius: 16px
Padding:      14px
```

### Progress Bar
```
Track:        #E8E6E0, height 7px, border-radius 4px
Fill:         Dynamic color (green / amber / red based on value)
Border-radius: 4px (both track and fill)
```

### Phase Badge (pill)
```
Perception:   background #EEEDFE, text #3C3489, label "PERCEPTION"
Action:       background #E1F5EE, text #085041, label "ACTION"
Will:         background #FAEEDA, text #633806, label "WILL"
Font:         11px, font-weight 600, letter-spacing 0.05em, uppercase
Padding:      3px 10px
Border-radius: 20px
```

### Trust Badge
```
Mutual:       background #E1F5EE, text #0F6E56, label "Mutual"
Watch:        background #FAEEDA, text #854F0B, label "Watch"
One-sided:    background #FCEBEB, text #A32D2D, label "One-sided"
Font:         11px, font-weight 500
Padding:      2px 8px
Border-radius: 20px
```

### Alert Box
```
Good (green): background #E1F5EE, border-left 3px #1D9E75, text #085041
Warning:      background #FAEEDA, border-left 3px #EF9F27, text #633806
Danger:       background #FCEBEB, border-left 3px #E24B4A, text #A32D2D
Info (purple): background #EEEDFE, border-left 3px #7F77DD, text #3C3489
Padding:      10px 14px
Border-radius: 8px
Font:         13px, line-height 1.6
```

### Star Rating
```
Empty star:   border 1px #E8E6E0, background #F1EFE8, size 17px, border-radius 3px
Filled star:  background #FAC775, border 1px #EF9F27
Gap between stars: 3px
```

### Investment Dots (Trust Circle)
```
Empty dot:    width 14px, height 14px, border 0.5px #E8E6E0, background #F1EFE8, border-radius 3px
Filled dot:   background #FAC775, border 0.5px #EF9F27
Gap:          2px
```

### Avatar Circle
```
Size:         44px (standard) / 36px (small) / 72px (large — profile)
Background:   Color based on context (rose for user, purple for partner)
Text:         Initials, font-weight 600, white
Border-radius: 50% (full circle)
```

### Bottom Navigation Bar
```
Height:       80px (including safe area inset)
Background:   #FFFFFF
Border-top:   0.5px solid #E8E6E0
Active icon:  #C0556A (rose)
Inactive icon: #888780 (muted)
Label font:   11px, font-weight 500
Active label: #C0556A
Inactive label: #888780
Tabs:         5 (Home, Compatibility, Obstacles, Rebuild, Profile)
```

### Top Navigation Bar
```
Height:       56px
Background:   #FFFFFF or transparent (depends on screen)
Title:        16px, font-weight 600, centered, #1A1A1A
Back icon:    24px, #1A1A1A
Right icons:  24px, #1A1A1A
```

---

## Screen Layout Template

```
┌─────────────────────────────────┐
│ Status bar (system)             │
├─────────────────────────────────┤
│ Top Nav Bar (56px)              │
│  [back]  [title]  [action]     │
├─────────────────────────────────┤
│                                 │
│  Screen content                 │
│  padding: 20px horizontal       │
│                                 │
│                                 │
├─────────────────────────────────┤
│ Bottom Nav Bar (80px)           │
│  🏠  ❤️  ⛰  🤲  👤            │
└─────────────────────────────────┘
```

Screens that are **not** bottom tab destinations (quiz, detail screens) show no bottom nav bar.

---

## Gradient Specifications

### Greeting Card Gradient (Home Dashboard)
```
Direction: left to right (or 135 degrees)
Start:     #C0556A (rose)
End:       #9E4057 (deep rose)
```

### Featured Insight Card Gradient
```
Direction: 135 degrees
Start:     #A03D55
End:       #7F2D42
```

### Splash Screen Background Gradient
```
Direction: top to bottom
Start:     #FDE8EC (rose tint)
End:       #FAF9F6 (off-white)
```

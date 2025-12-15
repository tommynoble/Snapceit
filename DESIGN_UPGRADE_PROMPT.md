# Snapceit Design Upgrade Prompt for Designer

## Project Overview
Upgrade Snapceit's landing page and dashboard to a **premium, enterprise-grade design** similar to Ramp.com while maintaining our current tech stack (React, TypeScript, Tailwind CSS, Framer Motion).

## Current Tech Stack
- **Framework**: React 18 + TypeScript
- **Styling**: Tailwind CSS (custom color palette with purples/fuchsias)
- **Animations**: Framer Motion
- **Icons**: Lucide React
- **Components**: Custom built (no UI library)

## Design Inspiration: Ramp.com
Study these Ramp design elements:
- **Typography**: Clean, modern sans-serif (likely Inter or similar)
- **Color Palette**: Sophisticated neutrals (blacks, grays) with accent colors
- **Spacing**: Generous whitespace, breathing room
- **Shadows & Depth**: Subtle shadows, layered design
- **Animations**: Smooth, purposeful micro-interactions
- **Cards**: Minimal borders, clean separation
- **Buttons**: Rounded, with hover states and loading states
- **Forms**: Clean inputs with clear labels and error states
- **Navigation**: Sticky header with smooth transitions
- **Hero Section**: Bold typography, clear value proposition
- **Sections**: Clear visual hierarchy, consistent spacing
- **Gradients**: Subtle, not overwhelming

## Design Goals

### 1. Premium Visual Hierarchy
- **Hero Section**: Bold, large typography (80px+ headings)
- **Section Headings**: 48-56px with tight line-height
- **Body Text**: 16-18px for readability
- **Small Text**: 12-14px for supporting copy
- **Font Weights**: Use 400, 500, 600, 700 strategically

### 2. Color Palette Refinement
**Current**: Purple/Fuchsia heavy
**Target**: 
- Primary: Deep purple (#4c1d95) - keep as accent
- Neutral Base: Charcoal (#0f172a), Gray (#64748b), Light Gray (#f1f5f9)
- Accent: Vibrant purple (#a855f7) for CTAs
- Success: Emerald (#10b981)
- Warning: Amber (#f59e0b)
- Error: Rose (#f43f5e)

### 3. Component Refinement

#### Buttons
- **Primary CTA**: Rounded (12px), 48px height, bold text, hover lift effect
- **Secondary**: Outlined, subtle background on hover
- **Tertiary**: Text-only with underline on hover
- **States**: Normal, Hover, Active, Disabled, Loading

#### Cards
- **Border**: Subtle 1px border (#e2e8f0), no shadow by default
- **Hover**: Slight lift (2px shadow), border color change
- **Padding**: 24px-32px for breathing room
- **Border Radius**: 12-16px (consistent)

#### Forms
- **Inputs**: 44px height, 12px border-radius, clear focus states
- **Labels**: Above input, 14px, medium weight
- **Error States**: Red border + error message below
- **Success States**: Green checkmark + confirmation message
- **Placeholder**: Subtle gray (#94a3b8)

#### Navigation
- **Navbar**: Sticky, semi-transparent backdrop blur
- **Links**: Smooth underline animation on hover
- **Active State**: Bold text + underline
- **Mobile**: Slide-in menu with smooth animation

### 4. Spacing System (8px grid)
- **xs**: 4px
- **sm**: 8px
- **md**: 16px
- **lg**: 24px
- **xl**: 32px
- **2xl**: 48px
- **3xl**: 64px

### 5. Typography System
```
Headings:
- h1: 80px, 700, -2px letter-spacing
- h2: 56px, 700, -1px letter-spacing
- h3: 40px, 600, -0.5px letter-spacing
- h4: 28px, 600
- h5: 20px, 600
- h6: 16px, 600

Body:
- Large: 18px, 400, 1.6 line-height
- Regular: 16px, 400, 1.6 line-height
- Small: 14px, 400, 1.5 line-height
- Tiny: 12px, 400, 1.5 line-height
```

### 6. Shadow System
```
- sm: 0 1px 2px rgba(0,0,0,0.05)
- md: 0 4px 6px rgba(0,0,0,0.1)
- lg: 0 10px 15px rgba(0,0,0,0.1)
- xl: 0 20px 25px rgba(0,0,0,0.1)
- 2xl: 0 25px 50px rgba(0,0,0,0.15)
```

### 7. Animation Principles
- **Duration**: 200-300ms for micro-interactions, 600-800ms for page transitions
- **Easing**: ease-out for entrances, ease-in for exits
- **Stagger**: 50-100ms between staggered elements
- **Hover**: Subtle scale (1.02-1.05) or shadow increase
- **Loading**: Smooth spinner or skeleton screens

## Sections to Redesign

### 1. Hero Section
- **Current**: Dark background with grid overlay
- **Target**: Clean, minimal with bold typography
- **Elements**:
  - Large headline (80px)
  - Subheadline (20px, lighter weight)
  - CTA buttons (primary + secondary)
  - Background: Subtle gradient or solid color
  - No grid overlay (too busy)

### 2. Solutions Section (Automate your entire financial workflow)
- **Layout**: 3-column grid on desktop, 1-column on mobile
- **Cards**: White background, subtle border, hover lift
- **Icons**: 48x48px, colored (not monochrome)
- **Spacing**: 32px between cards
- **Typography**: Bold heading, light description

### 3. Features Section (Scan receipts instantly)
- **Layout**: Image + text layout (alternating)
- **Image**: Rounded corners (16px), subtle shadow
- **Text**: Bold heading, light description, "Learn more" link
- **Spacing**: 48px between sections

### 4. Testimonials Section
- **Cards**: White background, subtle border, 24px padding
- **Avatar**: 40x40px, rounded circle
- **Name**: 16px, 600 weight
- **Quote**: 16px, italic, light gray
- **Rating**: 5 stars (yellow)

### 5. Pricing Section
- **Cards**: White background, subtle border
- **Featured Card**: Slightly larger, colored border (purple)
- **Badge**: "Most Popular" positioned above card
- **Price**: Large (48px), bold
- **Features**: Checkmark list, 14px text
- **CTA**: Full-width button

### 6. Footer
- **Background**: Dark (#0f172a)
- **Text**: Light gray
- **Links**: Hover underline animation
- **Spacing**: 64px padding top/bottom
- **Columns**: 4-5 columns on desktop, stacked on mobile

### 7. Dashboard
- **Sidebar**: Fixed, 280px width, dark background
- **Header**: Sticky, white background, subtle shadow
- **Cards**: White background, subtle border, hover lift
- **Charts**: Clean, minimal design
- **Tables**: Striped rows, hover highlight

## Specific Improvements

### Visual Refinements
- [ ] Remove grid overlay from backgrounds
- [ ] Increase whitespace between sections
- [ ] Make borders more subtle (use #e2e8f0 instead of white/10)
- [ ] Add consistent border-radius (12-16px)
- [ ] Improve shadow depth and subtlety
- [ ] Refine color contrast for accessibility

### Typography Improvements
- [ ] Increase heading sizes (h1: 64px → 80px)
- [ ] Tighten line-height on headings (1.1-1.2)
- [ ] Improve font weights (use 600-700 for headings)
- [ ] Add letter-spacing to headings (-1px to -2px)
- [ ] Increase body text size (16px → 18px)

### Component Improvements
- [ ] Redesign buttons (larger, more rounded, better hover states)
- [ ] Improve form inputs (taller, better focus states)
- [ ] Refine card designs (less shadow, subtle borders)
- [ ] Add loading states (spinners, skeleton screens)
- [ ] Improve error/success states (colors, icons, messages)

### Animation Improvements
- [ ] Smooth page transitions (fade + slide)
- [ ] Hover animations on cards (lift + shadow)
- [ ] Button hover states (scale + color change)
- [ ] Link hover animations (underline slide)
- [ ] Stagger animations for lists (50-100ms delay)

### Responsive Design
- [ ] Improve mobile spacing (larger padding)
- [ ] Stack sections properly on mobile
- [ ] Adjust typography sizes for mobile (h1: 48px)
- [ ] Improve touch targets (min 44px height)
- [ ] Test on various screen sizes

## Deliverables

1. **Design System Document**
   - Color palette with hex codes
   - Typography scale with sizes/weights
   - Spacing system (8px grid)
   - Shadow system
   - Border-radius system
   - Animation guidelines

2. **Component Library**
   - Buttons (all variants)
   - Cards (all variants)
   - Forms (inputs, labels, errors)
   - Navigation (navbar, mobile menu)
   - Modals/Dialogs
   - Alerts/Notifications

3. **Page Designs**
   - Landing page (hero, sections, footer)
   - Dashboard (sidebar, header, cards)
   - Auth pages (login, register, reset)

4. **Figma File** (if using Figma)
   - Organized components
   - Design tokens
   - Responsive layouts
   - Interaction states

## Implementation Notes

### Tailwind CSS
- Use custom color palette in `tailwind.config.js`
- Create component classes for reusable patterns
- Use `@apply` for complex component styles
- Maintain responsive design with `md:`, `lg:` breakpoints

### Framer Motion
- Use for page transitions and micro-interactions
- Keep animations subtle (200-300ms)
- Use `whileHover` for interactive elements
- Implement stagger for lists

### Code Organization
- Create reusable component library
- Use TypeScript for type safety
- Document component props
- Create Storybook for component showcase

## References
- **Ramp.com**: Premium SaaS design
- **Stripe.com**: Clean, minimal design
- **Figma.com**: Modern component design
- **Vercel.com**: Bold typography, clean layout

## Timeline
- **Week 1**: Design system + component library
- **Week 2**: Page designs (landing, dashboard)
- **Week 3**: Implementation + refinement
- **Week 4**: Testing + polish

---

**Note**: This prompt is designed to elevate Snapceit to a premium, enterprise-grade design while maintaining our current tech stack and development velocity.

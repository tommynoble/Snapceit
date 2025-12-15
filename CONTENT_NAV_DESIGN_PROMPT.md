# Snapceit Content, Sections & Navigation Design Prompt

## Navigation Design

### Navbar Structure
**Desktop (md breakpoint and up)**
- **Layout**: Fixed sticky header, 100% width
- **Height**: 80px (including padding)
- **Background**: Semi-transparent with backdrop blur (glass effect)
- **Border**: Subtle bottom border (#e2e8f0)
- **Padding**: 16px horizontal, 12px vertical

**Components**:
1. **Logo** (Left side)
   - Size: 48px height, auto width
   - Clickable: Smooth scroll to top
   - Hover: Slight opacity change (0.8)

2. **Navigation Links** (Center)
   - Items: Solutions | Features | Testimonials | Pricing
   - Font: 16px, 600 weight
   - Color: White/90 (default), White (hover)
   - Spacing: 24px gap between links
   - Hover State: Smooth underline animation (2px height, 200ms)
   - Active State: Bold text + underline
   - Smooth scroll behavior (100px offset from top)

3. **Auth Section** (Right side)
   - Login Icon: 20x20px, clickable
   - "Try for Free" Button:
     - Background: Purple (#4c1d95)
     - Hover: Darker purple (#5b21b6)
     - Size: 44px height, 20px padding horizontal
     - Text: 13px, 600 weight
     - Border-radius: 8px
     - Transition: 200ms

**Mobile (below md breakpoint)**
- **Height**: 64px
- **Layout**: Logo (left) + Menu button (right)
- **Menu Button**: 40x40px, centered icon
- **Mobile Menu**:
  - Position: Absolute, top-full, left-0, right-0
  - Background: Dark (#1e1b4b) with backdrop blur
  - Margin: 16px top, 8px horizontal
  - Border-radius: 16px
  - Border: 1px solid white/10
  - Padding: 12px
  - Animation: Slide down + fade in (200ms)
  - Links: Stacked vertically, 16px padding vertical
  - Buttons: Full width, stacked at bottom

### Navigation Behavior
- **Smooth Scroll**: Click any nav link → smooth scroll to section (100px offset)
- **Active Indicator**: Highlight current section as user scrolls
- **Sticky**: Navbar stays fixed at top while scrolling
- **Mobile Menu**: Click hamburger → menu slides down, click link → menu closes

---

## Section Structure & Content

### 1. Hero Section
**Layout**: Full viewport height (100vh), centered content

**Content Elements**:
```
┌─────────────────────────────────────┐
│                                     │
│    [Logo/Brand]                     │
│                                     │
│    Digitize, organize, and access   │
│    your receipts effortlessly       │
│                                     │
│    Our AI-powered solution makes    │
│    expense tracking simpler than    │
│    ever.                            │
│                                     │
│    [Get Started Button] [Learn More]│
│                                     │
│    [Dashboard Preview Image]        │
│                                     │
└─────────────────────────────────────┘
```

**Typography**:
- **Main Heading**: 80px, 700 weight, -2px letter-spacing
- **Subheading**: 20px, 400 weight, light gray
- **CTA Buttons**: 16px, 600 weight

**Spacing**:
- Top padding: 120px (account for navbar)
- Between heading and subheading: 24px
- Between subheading and buttons: 32px
- Between buttons: 16px
- Bottom padding: 64px

**Background**:
- Solid dark color or subtle gradient
- Ambient glows (fuchsia/purple) positioned behind content
- No grid overlay

---

### 2. Solutions Section (Automate your entire financial workflow)
**ID**: #action (for smooth scroll)
**Layout**: Full width, light background

**Content Structure**:
```
┌─────────────────────────────────────┐
│                                     │
│  Automate your entire financial     │
│  workflow                           │
│                                     │
│  Automate your entire financial     │
│  workflow with smart receipt        │
│  scanning and categorization.       │
│                                     │
│  ┌──────────┐  ┌──────────┐  ┌────┐│
│  │ Card 1   │  │ Card 2   │  │ C3 ││
│  │ Icon     │  │ Icon     │  │ I  ││
│  │ Title    │  │ Title    │  │ T  ││
│  │ Desc     │  │ Desc     │  │ D  ││
│  └──────────┘  └──────────┘  └────┘│
│                                     │
└─────────────────────────────────────┘
```

**Typography**:
- **Section Heading**: 56px, 700 weight, dark text
- **Description**: 18px, 400 weight, gray text
- **Card Title**: 20px, 600 weight
- **Card Description**: 16px, 400 weight, light gray

**Cards**:
- **Count**: 6 cards (3 columns desktop, 1 column mobile)
- **Size**: Equal width, auto height
- **Background**: White
- **Border**: 1px solid #e2e8f0
- **Border-radius**: 16px
- **Padding**: 32px
- **Icon**: 48x48px, colored (not monochrome)
- **Spacing**: 24px gap between cards
- **Hover**: Lift effect (2px shadow), border color change to purple

**Spacing**:
- Section padding: 96px top/bottom
- Heading to description: 16px
- Description to cards: 48px
- Between cards: 24px

---

### 3. Features Section (Scan receipts instantly)
**ID**: #features (for smooth scroll)
**Layout**: Alternating image + text layout

**Content Structure** (Desktop):
```
Feature 1:
┌─────────────────────────────────────┐
│  [Image]  │  Title                  │
│           │  Description            │
│           │  Learn more →           │
└─────────────────────────────────────┘

Feature 2 (Image on right):
┌─────────────────────────────────────┐
│  Title                  │  [Image]   │
│  Description            │            │
│  Learn more →           │            │
└─────────────────────────────────────┘
```

**Typography**:
- **Feature Title**: 48px, 700 weight, dark text
- **Feature Description**: 18px, 400 weight, gray text
- **"Learn more" Link**: 16px, 600 weight, purple, with arrow icon

**Images**:
- **Size**: 400x300px (desktop), full width (mobile)
- **Border-radius**: 16px
- **Shadow**: Subtle (md shadow)
- **Aspect Ratio**: 4:3

**Spacing**:
- Section padding: 96px top/bottom
- Between features: 96px
- Image to text: 48px
- Title to description: 16px
- Description to link: 24px

---

### 4. Testimonials Section
**ID**: #testimonials (for smooth scroll)
**Layout**: Carousel/slider with testimonial cards

**Content Structure**:
```
┌─────────────────────────────────────┐
│                                     │
│  Businesses love Snapceit           │
│                                     │
│  ┌──────────────────────────────┐   │
│  │ ★★★★★                       │   │
│  │ "Quote text here..."         │   │
│  │ - Name, Title                │   │
│  │ [Company Logo]               │   │
│  └──────────────────────────────┘   │
│                                     │
│  [← Prev]  [• • •]  [Next →]       │
│                                     │
└─────────────────────────────────────┘
```

**Typography**:
- **Section Heading**: 56px, 700 weight, dark text
- **Quote**: 18px, 400 weight, italic, gray text
- **Name**: 16px, 600 weight, dark text
- **Title**: 14px, 400 weight, light gray
- **Rating**: 5 stars, 16px size, yellow color

**Cards**:
- **Width**: 100% (mobile), 400px (desktop)
- **Height**: Auto
- **Background**: White
- **Border**: 1px solid #e2e8f0
- **Border-radius**: 16px
- **Padding**: 32px
- **Spacing**: 24px gap between cards
- **Hover**: Lift effect (2px shadow)

**Carousel Controls**:
- **Prev/Next Buttons**: 48x48px, rounded, border style
- **Dot Indicators**: 12px diameter, gray/white
- **Auto-scroll**: Every 8 seconds (optional)

**Spacing**:
- Section padding: 96px top/bottom
- Heading to cards: 48px
- Between cards: 24px

---

### 5. Pricing Section
**ID**: #pricing (for smooth scroll)
**Layout**: 3-column grid (desktop), 1-column (mobile)

**Content Structure**:
```
┌─────────────────────────────────────┐
│                                     │
│  Pricing that grows with you        │
│                                     │
│  [Monthly] [Yearly - SAVE 30%]      │
│                                     │
│  ┌────────┐  ┌────────┐  ┌────────┐ │
│  │Starter │  │[Popular]  │Enterprise│
│  │        │  │Professional           │
│  │ $0/mo  │  │ $29/mo │  │Custom   │
│  │        │  │        │  │        │
│  │✓ Feature│  │✓ Feature│  │✓ Feature│
│  │✓ Feature│  │✓ Feature│  │✓ Feature│
│  │        │  │        │  │        │
│  │[Button]│  │[Button]│  │[Button]│
│  └────────┘  └────────┘  └────────┘ │
│                                     │
└─────────────────────────────────────┘
```

**Typography**:
- **Section Heading**: 56px, 700 weight, dark text
- **Card Title**: 20px, 600 weight
- **Price**: 48px, 700 weight, dark text
- **Price Suffix**: 16px, 400 weight, gray text
- **Feature**: 14px, 400 weight, dark text
- **Badge**: 12px, 700 weight, uppercase

**Cards**:
- **Width**: Equal (1fr grid)
- **Height**: Auto
- **Background**: White
- **Border**: 1px solid #e2e8f0
- **Border-radius**: 16px
- **Padding**: 32px
- **Spacing**: 24px gap between cards

**Featured Card** (Professional):
- **Border**: 2px solid purple (#a855f7)
- **Scale**: Slightly larger (1.05) on desktop
- **Badge**: "Most Popular" positioned above card
- **Badge Style**: Orange gradient background, white text, 12px padding

**Buttons**:
- **Width**: 100%
- **Height**: 48px
- **Border-radius**: 8px
- **Font**: 16px, 600 weight
- **Hover**: Color change + lift effect

**Spacing**:
- Section padding: 96px top/bottom
- Heading to toggle: 32px
- Toggle to cards: 48px
- Between cards: 24px

---

### 6. Footer Section
**Layout**: Full width, dark background

**Content Structure**:
```
┌─────────────────────────────────────┐
│                                     │
│  [Logo]  [Links]  [Links]  [Links]  │
│  [Desc]  [Links]  [Links]  [Links]  │
│          [Links]  [Links]  [Links]  │
│                                     │
│  ────────────────────────────────── │
│                                     │
│  © 2025 Snapceit  │  Status: Online │
│                                     │
└─────────────────────────────────────┘
```

**Typography**:
- **Column Heading**: 16px, 600 weight, white
- **Link**: 14px, 400 weight, light gray
- **Copyright**: 12px, 400 weight, gray
- **Status**: 12px, 400 weight, gray

**Layout**:
- **Columns**: 4-5 columns (desktop), stacked (mobile)
- **Column Width**: Equal width
- **Padding**: 64px top/bottom, 32px left/right
- **Border**: Top border (#e2e8f0)

**Links**:
- **Hover**: Underline animation (200ms)
- **Color**: Light gray (#d1d5db), white on hover

**Spacing**:
- Between columns: 48px
- Between links: 12px
- Top section to divider: 48px
- Divider to bottom: 32px

---

## Content Guidelines

### Tone & Voice
- **Professional**: Enterprise-focused, trustworthy
- **Clear**: Simple language, avoid jargon
- **Action-oriented**: Use strong verbs (Automate, Digitize, Maximize)
- **Benefit-focused**: Emphasize value, not features

### Copywriting Standards
- **Headlines**: 6-8 words max, action-oriented
- **Descriptions**: 1-2 sentences, benefit-focused
- **CTAs**: Action verbs (Get Started, Learn More, Try for Free)
- **Features**: Benefit statement, not feature description

### Content Hierarchy
1. **Main Headline**: Biggest, boldest, most important
2. **Subheadline**: Supports main headline
3. **Body Copy**: Details and benefits
4. **CTAs**: Clear, action-oriented
5. **Supporting Text**: Small, secondary information

---

## Mobile Responsiveness

### Breakpoints
- **Mobile**: < 768px (md)
- **Tablet**: 768px - 1024px (lg)
- **Desktop**: > 1024px

### Mobile Adjustments
- **Typography**: Reduce heading sizes by 20-30%
- **Spacing**: Reduce padding/margins by 25%
- **Columns**: Stack to 1 column
- **Images**: Full width with padding
- **Buttons**: Full width, 44px height minimum
- **Navigation**: Hamburger menu

---

## Interaction & Animation

### Hover States
- **Links**: Underline animation (200ms)
- **Buttons**: Scale (1.02) + color change (200ms)
- **Cards**: Lift effect (2px shadow) + border color change (200ms)

### Scroll Animations
- **Sections**: Fade in + slide up (600ms, ease-out)
- **Cards**: Stagger animation (50-100ms delay)
- **Lists**: Stagger animation (50ms delay)

### Page Transitions
- **Navigation**: Fade + slide (300ms)
- **Modals**: Fade in + scale (200ms)
- **Notifications**: Slide in from top (200ms)

---

## Accessibility

### WCAG 2.1 AA Compliance
- **Color Contrast**: 4.5:1 for text, 3:1 for graphics
- **Font Size**: Minimum 14px for body text
- **Line Height**: 1.5 for body text
- **Touch Targets**: Minimum 44x44px
- **Focus States**: Visible focus indicators (2px outline)
- **Alt Text**: Descriptive alt text for all images
- **Semantic HTML**: Proper heading hierarchy, ARIA labels

---

## Implementation Checklist

- [ ] Navbar sticky positioning and styling
- [ ] Smooth scroll behavior on nav links
- [ ] Mobile hamburger menu with slide animation
- [ ] Hero section with proper spacing and typography
- [ ] Solutions cards with hover effects
- [ ] Features section with alternating layout
- [ ] Testimonials carousel with controls
- [ ] Pricing cards with featured state
- [ ] Footer with proper column layout
- [ ] Mobile responsive adjustments
- [ ] Hover animations on interactive elements
- [ ] Scroll animations for sections
- [ ] Accessibility compliance (WCAG 2.1 AA)
- [ ] Cross-browser testing
- [ ] Performance optimization

---

**Note**: All measurements are in pixels. Use Tailwind CSS utility classes for implementation. Refer to the main DESIGN_UPGRADE_PROMPT.md for color palette and component specifications.

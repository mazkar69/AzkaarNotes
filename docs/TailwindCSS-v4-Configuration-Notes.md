# Tailwind CSS v4 Configuration Notes
## Complete Migration Guide (v3 → v4)

> Focus: Configuration, architecture, customization, and migration concepts.
> Not a utility class reference.

---

# Table of Contents

1. Overview
2. Rule of Thumb: When to Use What
3. Architecture Changes
4. Installation Changes
5. CSS-First Configuration
6. Theme Configuration (`@theme`)
7. Colors
8. Fonts
9. Breakpoints
10. Spacing
11. Border Radius
12. Shadows
13. Design Tokens & CSS Variables
14. Content Detection
15. Dark Mode
16. PostCSS Changes
17. Vite Integration
18. Custom Utilities (`@utility`)
19. Functional Utilities
20. Variants (`@variant`)
21. Custom Variants (`@custom-variant`)
22. Replacing Plugins
23. Components & `@apply`
24. Migration Cheatsheet
25. Recommended Project Structure
26. Common Migration Issues
27. Key Takeaways

---

# 1. Overview

Tailwind CSS v4 is not just a version upgrade.

It introduces:

- CSS-first configuration
- Native design tokens
- Faster Rust-based engine (Oxide)
- Automatic content detection
- Reduced dependency on JavaScript configuration
- Simplified plugin creation
- Better design system support

The biggest mindset shift:

## Tailwind v3

```js
tailwind.config.js
```

## Tailwind v4

```css
@theme {

}
```

Configuration moves from JavaScript to CSS.

---

# 2. Rule of Thumb: When to Use What

Choosing the right directive is critical for maintainable Tailwind projects.

## Quick Reference

| Purpose | Use | Example |
|---------|-----|--------|
| Define design tokens | `@theme` | Colors, fonts, spacing |
| Create reusable utility classes | `@utility` | Custom one-off utilities |
| Create custom variants | `@custom-variant` | State-based modifiers |
| Global styles / resets | `@layer base` | Typography, HTML defaults |
| Reusable component classes | `@layer components` | Button styles, card layouts |

---

## `@theme` - Define Design Tokens

**When to use:**
- Creating your design system
- Defining colors, fonts, spacing, shadows
- Values you'll use repeatedly across your project

**Example:**

```css
@theme {
  /* Colors */
  --color-brand: #2563eb;
  --color-accent: #f59e0b;
  
  /* Spacing */
  --spacing-section: 5rem;
  
  /* Typography */
  --font-display: "Playfair Display", serif;
  --font-body: "Inter", sans-serif;
  
  /* Shadows */
  --shadow-elevated: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
  
  /* Radius */
  --radius-card: 1rem;
  --radius-button: 0.5rem;
}
```

**Generated utilities:**

```html
<div class="bg-brand text-accent font-display shadow-elevated rounded-card p-section">
```

---

## `@utility` - Create Reusable Utility Classes

**When to use:**
- CSS properties not covered by Tailwind
- Creating custom one-off utilities
- Frequently used CSS patterns

**Example:**

```css
/* Simple utility */
@utility content-auto {
  content-visibility: auto;
}

/* Utility with multiple properties */
@utility scrollbar-hidden {
  scrollbar-width: none;
  -ms-overflow-style: none;
  
  &::-webkit-scrollbar {
    display: none;
  }
}

/* Parametric utility */
@utility tab-* {
  tab-size: --value(integer);
}

/* Glass morphism utility */
@utility glass {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
}
```

**Usage:**

```html
<div class="content-auto scrollbar-hidden tab-4 glass">
```

---

## `@custom-variant` - Create Custom Variants

**When to use:**
- Creating state-based modifiers
- Data attribute conditions
- Parent-child relationship states
- Library-specific states (Radix UI, Headless UI)

**Example:**

```css
/* Hover + Focus combined */
@custom-variant hocus {
  &:hover,
  &:focus {
    @slot;
  }
}

/* Data attribute variant */
@custom-variant active {
  &[data-active="true"] {
    @slot;
  }
}

/* Radix UI open state */
@custom-variant open {
  &[data-state="open"] {
    @slot;
  }
}

/* Parent selector variant */
@custom-variant group-hocus {
  :is(.group:hover, .group:focus) & {
    @slot;
  }
}

/* Loading state */
@custom-variant loading {
  &[data-loading="true"] {
    @slot;
  }
}
```

**Usage:**

```html
<button class="hocus:bg-blue-600 active:scale-95 loading:opacity-50">
<div class="open:rotate-180 transition-transform">
<div class="group">
  <span class="group-hocus:text-blue-500">Hover me</span>
</div>
```

---

## `@layer base` - Global Styles / Resets

**When to use:**
- Resetting default HTML element styles
- Setting global typography
- Defining default focus rings
- Base HTML element customization

**Example:**

```css
@layer base {
  /* Typography defaults */
  h1 {
    @apply text-4xl font-bold tracking-tight;
  }
  
  h2 {
    @apply text-3xl font-semibold;
  }
  
  /* Remove default focus rings */
  *:focus {
    outline: none;
  }
  
  /* Custom focus ring */
  *:focus-visible {
    @apply ring-2 ring-blue-500 ring-offset-2;
  }
  
  /* Smooth scrolling */
  html {
    scroll-behavior: smooth;
  }
  
  /* Base link styles */
  a {
    @apply text-blue-600 hover:text-blue-800 transition-colors;
  }
  
  /* Image defaults */
  img {
    @apply max-w-full h-auto;
  }
}
```

---

## `@layer components` - Reusable Component Classes

**When to use:**
- Creating reusable component patterns
- Complex multi-utility combinations used repeatedly
- Encapsulating component variations
- Reducing HTML class clutter

**Example:**

```css
@layer components {
  /* Button variations */
  .btn {
    @apply px-4 py-2 rounded-lg font-medium transition-all;
    @apply focus:ring-2 focus:ring-offset-2;
  }
  
  .btn-primary {
    @apply btn bg-blue-600 text-white;
    @apply hover:bg-blue-700 focus:ring-blue-500;
  }
  
  .btn-secondary {
    @apply btn bg-gray-200 text-gray-900;
    @apply hover:bg-gray-300 focus:ring-gray-400;
  }
  
  .btn-outline {
    @apply btn border-2 border-blue-600 text-blue-600;
    @apply hover:bg-blue-50 focus:ring-blue-500;
  }
  
  /* Card component */
  .card {
    @apply bg-white rounded-xl shadow-lg p-6;
    @apply border border-gray-200;
    @apply transition-shadow hover:shadow-xl;
  }
  
  /* Input field */
  .input {
    @apply w-full px-4 py-2 border border-gray-300 rounded-lg;
    @apply focus:border-blue-500 focus:ring-2 focus:ring-blue-200;
    @apply transition-colors;
  }
  
  /* Badge */
  .badge {
    @apply inline-flex items-center px-2.5 py-0.5;
    @apply text-xs font-medium rounded-full;
  }
  
  .badge-success {
    @apply badge bg-green-100 text-green-800;
  }
  
  .badge-error {
    @apply badge bg-red-100 text-red-800;
  }
}
```

**Usage:**

```html
<button class="btn-primary">Submit</button>
<button class="btn-outline">Cancel</button>
<div class="card">
  <span class="badge-success">Active</span>
</div>
<input type="text" class="input" />
```

---

## Decision Tree

```text
Need to add styling?
  |
  ├─ Design system value (color, spacing, font)?
  │   └─ Use @theme
  |
  ├─ New CSS property utility?
  │   └─ Use @utility
  |
  ├─ State-based modifier (hover, data-attribute)?
  │   └─ Use @custom-variant
  |
  ├─ Global HTML element style?
  │   └─ Use @layer base
  |
  └─ Reusable component pattern?
      └─ Use @layer components
```

---

# 3. Architecture Changes

## v3

```text
tailwind.config.js
        ↓
Tailwind Engine
        ↓
Generated CSS
```

## v4

```text
CSS (@theme, @utility, @variant)
                ↓
         Tailwind Engine
                ↓
         Generated CSS
```

The CSS file becomes the source of truth.

---

# 3. Installation Changes

## Tailwind v3

```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

## Tailwind v4

```css
@import "tailwindcss";
```

Single import replaces all three directives.

---

# 4. CSS-First Configuration

Most configuration now lives inside CSS.

Example:

```css
@import "tailwindcss";

@theme {
  --color-primary: #2563eb;
}
```

No config file required for most projects.

---

# 5. Theme Configuration (`@theme`)

`@theme` is the core customization mechanism in Tailwind v4.

Example:

```css
@theme {
  --color-primary: #2563eb;
  --font-sans: "Inter", sans-serif;
  --radius-card: 20px;
}
```

Tailwind automatically generates related utilities.

---

# 6. Colors

## v3

```js
theme: {
  extend: {
    colors: {
      primary: "#2563eb"
    }
  }
}
```

## v4

```css
@theme {
  --color-primary: #2563eb;
}
```

Generated utilities:

```html
bg-primary
text-primary
border-primary
```

---

# 7. Fonts

## v3

```js
fontFamily: {
  sans: ["Inter"]
}
```

## v4

```css
@theme {
  --font-sans: "Inter", sans-serif;
}
```

Usage:

```html
font-sans
```

---

# 8. Breakpoints

## v3

```js
screens: {
  tablet: "900px"
}
```

## v4

```css
@theme {
  --breakpoint-tablet: 900px;
}
```

Usage:

```html
tablet:flex
tablet:grid
```

---

# 9. Spacing

## v3

```js
spacing: {
  18: "4.5rem"
}
```

## v4

```css
@theme {
  --spacing-18: 4.5rem;
}
```

Usage:

```html
p-18
m-18
gap-18
```

---

# 10. Border Radius

## v3

```js
borderRadius: {
  card: "20px"
}
```

## v4

```css
@theme {
  --radius-card: 20px;
}
```

Usage:

```html
rounded-card
```

---

# 11. Shadows

## v3

```js
boxShadow: {
  card: "0 10px 20px rgba(0,0,0,.1)"
}
```

## v4

```css
@theme {
  --shadow-card: 0 10px 20px rgba(0,0,0,.1);
}
```

Usage:

```html
shadow-card
```

---

# 12. Design Tokens & CSS Variables

One of the most important improvements.

```css
@theme {
  --color-primary: #2563eb;
}
```

Can be used directly in custom CSS:

```css
.card {
  border-color: var(--color-primary);
}
```

This makes design systems significantly easier to build.

---

# 13. Content Detection

## v3

```js
content: [
  "./src/**/*.{js,jsx,ts,tsx}"
]
```

## v4

Nothing required.

Tailwind automatically scans project files.

Benefits:

- Less configuration
- Faster setup
- Fewer mistakes

---

# 14. Dark Mode

## v3

```js
darkMode: "class"
```

## v4

```css
@custom-variant dark {
  &:where(.dark, .dark *) {
    @slot;
  }
}
```

Usage:

```html
dark:bg-black
dark:text-white
```

Dark mode is now implemented using variants.

---

# 15. PostCSS Changes

## v3

```js
plugins: {
  tailwindcss: {}
}
```

## v4

```js
plugins: {
  "@tailwindcss/postcss": {}
}
```

A very common migration issue.

---

# 16. Vite Integration

Official Vite plugin:

```bash
npm install @tailwindcss/vite
```

```ts
import tailwindcss from "@tailwindcss/vite";
```

Recommended for Vite projects.

---

# 17. Custom Utilities (`@utility`)

## Old Approach

```css
@layer utilities {
  .content-auto {
    content-visibility: auto;
  }
}
```

## Tailwind v4

```css
@utility content-auto {
  content-visibility: auto;
}
```

Usage:

```html
<div class="content-auto"></div>
```

---

# 18. Functional Utilities

Create dynamic utilities.

```css
@utility tab-* {
  tab-size: --value(integer);
}
```

Usage:

```html
tab-2
tab-4
tab-8
```

This previously required plugin code.

---

# 19. Variants (`@variant`)

Apply variants inside CSS.

```css
.card {
  background: white;

  @variant dark {
    background: black;
  }
}
```

Equivalent to:

```css
.dark .card {
  background: black;
}
```

---

# 20. Custom Variants (`@custom-variant`)

Create your own variants.

Example:

```css
@custom-variant hocus {
  &:hover,
  &:focus {
    @slot;
  }
}
```

Usage:

```html
hocus:bg-blue-500
```

---

## Data Attribute Variant

```css
@custom-variant active {
  &[data-active="true"] {
    @slot;
  }
}
```

Usage:

```html
active:bg-green-500
```

---

## Radix UI Example

```css
@custom-variant open {
  &[data-state="open"] {
    @slot;
  }
}
```

Usage:

```html
open:bg-blue-500
```

---

# 21. Replacing Plugins

Many plugins can now be replaced using:

- `@theme`
- `@utility`
- `@custom-variant`

Example:

## v3 Plugin

```js
addUtilities({
  ".scrollbar-hidden": {
    scrollbarWidth: "none"
  }
})
```

## v4

```css
@utility scrollbar-hidden {
  scrollbar-width: none;
}
```

No custom plugin required.

---

# 22. Components & @apply

## Components

```css
@layer components {
  .btn-primary {
    @apply px-4 py-2 bg-blue-500 text-white;
  }
}
```

Usage:

```html
<button class="btn-primary">
```

---

## @apply Still Exists

```css
.btn {
  @apply px-4 py-2 rounded-lg;
}
```

Contrary to popular belief, `@apply` was not removed.

---

# 23. Migration Cheatsheet

| Tailwind v3 | Tailwind v4 |
|------------|------------|
| theme.extend.colors | @theme --color-* |
| theme.extend.spacing | @theme --spacing-* |
| theme.extend.fontFamily | @theme --font-* |
| theme.extend.screens | @theme --breakpoint-* |
| theme.extend.boxShadow | @theme --shadow-* |
| theme.extend.borderRadius | @theme --radius-* |
| addUtilities() | @utility |
| addVariant() | @custom-variant |
| darkMode: "class" | @custom-variant dark |
| content[] | Auto Detection |
| @tailwind directives | @import "tailwindcss" |

---

# 25. Recommended Project Structure

## File Organization

```text
src/
│
├── styles/
│   ├── app.css              # Main entry point (imports everything)
│   ├── theme.css            # Design tokens (@theme)
│   ├── base.css             # Global resets (@layer base)
│   ├── utilities.css        # Custom utilities (@utility, @custom-variant)
│   └── components.css       # Component classes (@layer components)
│
├── components/
│   └── Button.jsx
│
└── app/
    └── page.jsx
```

---

## How to Import Separate Files

### Option 1: CSS Imports (Recommended)

Tailwind v4 supports standard CSS `@import` statements.

**app.css** (Main entry point):

```css
/* Import Tailwind */
@import "tailwindcss";

/* Import your custom files */
@import "./theme.css";
@import "./base.css";
@import "./utilities.css";
@import "./components.css";
```

**theme.css**:

```css
@theme {
  /* Colors */
  --color-brand: #2563eb;
  --color-accent: #f59e0b;
  --color-success: #10b981;
  --color-error: #ef4444;
  
  /* Typography */
  --font-sans: "Inter", -apple-system, sans-serif;
  --font-mono: "Fira Code", monospace;
  
  /* Spacing */
  --spacing-section: 5rem;
  
  /* Shadows */
  --shadow-card: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  --shadow-elevated: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
}
```

**base.css**:

```css
@layer base {
  /* Typography */
  h1 {
    @apply text-4xl font-bold tracking-tight;
  }
  
  h2 {
    @apply text-3xl font-semibold;
  }
  
  /* Focus styles */
  *:focus-visible {
    @apply ring-2 ring-brand ring-offset-2;
  }
  
  /* Link defaults */
  a {
    @apply text-brand hover:underline;
  }
}
```

**utilities.css**:

```css
/* Custom utilities */
@utility scrollbar-hidden {
  scrollbar-width: none;
  -ms-overflow-style: none;
  
  &::-webkit-scrollbar {
    display: none;
  }
}

@utility glass {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

@utility content-auto {
  content-visibility: auto;
}

/* Custom variants */
@custom-variant hocus {
  &:hover,
  &:focus {
    @slot;
  }
}

@custom-variant loading {
  &[data-loading="true"] {
    @slot;
  }
}
```

**components.css**:

```css
@layer components {
  /* Buttons */
  .btn {
    @apply px-4 py-2 rounded-lg font-medium transition-all;
    @apply focus:ring-2 focus:ring-offset-2;
  }
  
  .btn-primary {
    @apply btn bg-brand text-white;
    @apply hover:bg-blue-700 focus:ring-brand;
  }
  
  .btn-outline {
    @apply btn border-2 border-brand text-brand;
    @apply hover:bg-blue-50;
  }
  
  /* Cards */
  .card {
    @apply bg-white rounded-xl shadow-card p-6;
    @apply border border-gray-200;
  }
  
  /* Inputs */
  .input {
    @apply w-full px-4 py-2 border border-gray-300 rounded-lg;
    @apply focus:border-brand focus:ring-2 focus:ring-blue-200;
  }
}
```

---

### Option 2: Build Tool Imports

If using a bundler (Vite, Webpack, Next.js), import in your JavaScript/TypeScript:

**main.jsx / _app.jsx**:

```jsx
import './styles/app.css';
// All other CSS files are imported via @import in app.css
```

---

## Does Tailwind Auto-Import?

**No.** Tailwind does NOT automatically import your separate CSS files.

**You must explicitly import them** using one of these methods:

1. **CSS `@import`** in your main CSS file (Recommended)
2. **JavaScript import** in your entry file
3. **HTML `<link>`** tags (not recommended for modular projects)

---

## Import Order Matters

Correct order:

```css
/* 1. Import Tailwind first */
@import "tailwindcss";

/* 2. Theme (design tokens) */
@import "./theme.css";

/* 3. Base styles */
@import "./base.css";

/* 4. Custom utilities */
@import "./utilities.css";

/* 5. Components (can use tokens and utilities) */
@import "./components.css";
```

**Why?**
- Theme tokens must be available for utilities/components
- Base styles should come before components
- Components can reference custom utilities

---

## Complete Example

### Project Structure

```text
my-app/
├── src/
│   ├── styles/
│   │   ├── app.css
│   │   ├── theme.css
│   │   ├── base.css
│   │   ├── utilities.css
│   │   └── components.css
│   ├── App.jsx
│   └── main.jsx
├── package.json
└── vite.config.js
```

### main.jsx

```jsx
import './styles/app.css';
import App from './App';

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
```

### app.css

```css
@import "tailwindcss";
@import "./theme.css";
@import "./base.css";
@import "./utilities.css";
@import "./components.css";
```

### Usage in Components

```jsx
function App() {
  return (
    <div className="card">
      <h1 className="text-brand">Welcome</h1>
      <button className="btn-primary hocus:scale-105">
        Get Started
      </button>
      <div className="scrollbar-hidden glass">
        Content
      </div>
    </div>
  );
}
```

---

## Benefits of This Structure

1. **Separation of Concerns**
   - Theme tokens separate from utilities
   - Components separate from base styles

2. **Easier Maintenance**
   - Find design tokens in one place
   - Update utilities without touching components

3. **Better Team Collaboration**
   - Designers work on theme.css
   - Developers work on utilities/components

4. **Reusability**
   - Share theme.css across projects
   - Export components.css as a library

5. **Build Optimization**
   - Build tools can tree-shake unused imports
   - Better caching for unchanged files

---

## Alternative: Single File Approach

For smaller projects, keep everything in one file:

```css
@import "tailwindcss";

/* Theme */
@theme {
  --color-brand: #2563eb;
}

/* Base */
@layer base {
  h1 {
    @apply text-4xl font-bold;
  }
}

/* Utilities */
@utility glass {
  backdrop-filter: blur(10px);
}

/* Components */
@layer components {
  .btn {
    @apply px-4 py-2 rounded-lg;
  }
}
```

Use this approach when:
- Small projects (<5 components)
- Minimal customization
- Rapid prototyping

---

# 26. Common Migration Issues

## Issue 1

```text
Cannot apply unknown utility
```

Cause:

- Utility no longer exists
- Custom utility not defined

---

## Issue 2

```text
Tailwind styles not loading
```

Check:

```css
@import "tailwindcss";
```

is present.

---

## Issue 3

```text
PostCSS error
```

Install:

```bash
npm install @tailwindcss/postcss
```

Update configuration accordingly.

---

## Issue 4

```text
Dark mode stopped working
```

Ensure:

```css
@custom-variant dark {
  &:where(.dark, .dark *) {
    @slot;
  }
}
```

exists.

---

# 26. Key Takeaways

1. `@theme` replaces most config customization.
2. Design tokens are now native CSS variables.
3. `@utility` replaces many utility plugins.
4. `@custom-variant` replaces many variant plugins.
5. Automatic content detection removes the need for `content[]`.
6. Dark mode is variant-based.
7. Tailwind v4 is CSS-first.
8. The best migration strategy is:

```text
tailwind.config.js
        ↓
Move tokens to @theme
        ↓
Move utilities to @utility
        ↓
Move variants to @custom-variant
```

---

## Final Mental Model

### Tailwind v3

```text
JavaScript Config
        ↓
Tailwind
        ↓
CSS
```

### Tailwind v4

```text
CSS
(@theme, @utility, @custom-variant)
                ↓
            Tailwind
                ↓
              CSS
```

If you understand this shift, most Tailwind v4 concepts become easy to learn.

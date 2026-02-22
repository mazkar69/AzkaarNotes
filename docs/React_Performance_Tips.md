# React Performance Tips

> Last Updated: February 22, 2026

## Table of Contents
- [React.memo](#reactmemo)
- [useMemo](#usememo)
- [useCallback](#usecallback)
- [Lazy Loading and Code Splitting](#lazy-loading-and-code-splitting)
- [Virtualized Lists](#virtualized-lists)
- [Image Optimization](#image-optimization)
- [Avoiding Re-renders](#avoiding-re-renders)
- [Bundle Size Optimization](#bundle-size-optimization)
- [Quick Reference](#quick-reference)

---

## React.memo

Prevents a component from re-rendering if its props have not changed.

```jsx
import { memo } from "react";

// Without memo - re-renders every time parent renders
const UserCard = ({ name, email }) => {
  console.log("UserCard rendered");
  return (
    <div>
      <h3>{name}</h3>
      <p>{email}</p>
    </div>
  );
};

// With memo - only re-renders when name or email changes
const MemoizedUserCard = memo(UserCard);

// Usage
<MemoizedUserCard name="John" email="john@example.com" />
```

When to use:
- Component renders often with the same props
- Component is expensive to render
- Parent re-renders frequently

When NOT to use:
- Component always receives different props
- Component is simple/cheap to render

---

## useMemo

Memoize expensive calculations. Returns cached value until dependencies change.

```jsx
import { useMemo } from "react";

const ProductList = ({ products, searchTerm }) => {
  // Without useMemo - runs on every render
  // const filtered = products.filter(p => p.name.includes(searchTerm));

  // With useMemo - only recalculates when products or searchTerm changes
  const filteredProducts = useMemo(() => {
    return products.filter((p) =>
      p.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [products, searchTerm]);

  return (
    <ul>
      {filteredProducts.map((p) => (
        <li key={p.id}>{p.name}</li>
      ))}
    </ul>
  );
};
```

When to use:
- Filtering/sorting large arrays
- Complex calculations
- Creating derived data from props/state

---

## useCallback

Memoize function references. Prevents child components from unnecessary re-renders.

```jsx
import { useCallback, memo } from "react";

// Child component wrapped in memo
const Button = memo(({ onClick, label }) => {
  console.log(`${label} button rendered`);
  return <button onClick={onClick}>{label}</button>;
});

// Parent component
const Parent = () => {
  const [count, setCount] = useState(0);
  const [text, setText] = useState("");

  // Without useCallback - new function on every render, Button re-renders
  // const handleClick = () => setCount(c => c + 1);

  // With useCallback - same function reference, Button does NOT re-render
  const handleClick = useCallback(() => {
    setCount((c) => c + 1);
  }, []);

  return (
    <div>
      <input value={text} onChange={(e) => setText(e.target.value)} />
      <Button onClick={handleClick} label="Add" />
      <p>Count: {count}</p>
    </div>
  );
};
```

---

## Lazy Loading and Code Splitting

Load components only when they are needed. Reduces initial bundle size.

### React.lazy + Suspense

```jsx
import { lazy, Suspense } from "react";

// Lazy load components
const Dashboard = lazy(() => import("./pages/Dashboard"));
const Settings = lazy(() => import("./pages/Settings"));
const Analytics = lazy(() => import("./pages/Analytics"));

function App() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <Routes>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/analytics" element={<Analytics />} />
      </Routes>
    </Suspense>
  );
}
```

### Dynamic Import for Non-Component Code

```javascript
// Load a heavy library only when needed
const handleExport = async () => {
  const { exportToPDF } = await import("./utils/pdfExport");
  exportToPDF(data);
};
```

---

## Virtualized Lists

Render only visible items in long lists. Use `react-window` or `@tanstack/react-virtual`.

```bash
npm install react-window
```

```jsx
import { FixedSizeList } from "react-window";

const VirtualizedList = ({ items }) => {
  const Row = ({ index, style }) => (
    <div style={style}>
      {items[index].name}
    </div>
  );

  return (
    <FixedSizeList
      height={400}         // container height
      itemCount={items.length}
      itemSize={50}        // each row height
      width="100%"
    >
      {Row}
    </FixedSizeList>
  );
};

// Renders only ~8-10 visible rows instead of 10,000+
```

---

## Image Optimization

```jsx
// 1. Use loading="lazy" for native lazy loading
<img src="/image.jpg" loading="lazy" alt="description" />

// 2. Use proper sizes with srcSet
<img
  src="/image-800.jpg"
  srcSet="/image-400.jpg 400w, /image-800.jpg 800w, /image-1200.jpg 1200w"
  sizes="(max-width: 600px) 400px, 800px"
  alt="description"
/>

// 3. Next.js Image component (automatic optimization)
import Image from "next/image";
<Image src="/image.jpg" width={800} height={600} alt="description" />

// 4. Use WebP/AVIF format for smaller file sizes
// 5. Use CDN (CloudFront, Cloudinary) for serving images
```

---

## Avoiding Re-renders

### Move State Down

```jsx
// Bad - entire App re-renders on input change
function App() {
  const [search, setSearch] = useState("");
  return (
    <div>
      <input value={search} onChange={(e) => setSearch(e.target.value)} />
      <ExpensiveComponent />
    </div>
  );
}

// Good - only SearchBar re-renders
function App() {
  return (
    <div>
      <SearchBar />
      <ExpensiveComponent />
    </div>
  );
}

function SearchBar() {
  const [search, setSearch] = useState("");
  return <input value={search} onChange={(e) => setSearch(e.target.value)} />;
}
```

### Use Children Pattern

```jsx
// The children don't re-render when ScrollPosition updates
function ScrollTracker({ children }) {
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div>
      <p>Scroll: {scrollY}</p>
      {children}
    </div>
  );
}

// Usage - ExpensiveComponent won't re-render on scroll
<ScrollTracker>
  <ExpensiveComponent />
</ScrollTracker>
```

### Avoid Creating Objects/Arrays in JSX

```jsx
// Bad - new object on every render
<Component style={{ color: "red" }} />
<Component items={[1, 2, 3]} />

// Good - stable reference
const style = { color: "red" };
const items = [1, 2, 3];
<Component style={style} />
<Component items={items} />
```

---

## Bundle Size Optimization

### Check bundle size
```bash
# Vite
npx vite-bundle-visualizer

# CRA
npm install --save-dev source-map-explorer
npx source-map-explorer build/static/js/*.js
```

### Import only what you need
```javascript
// Bad - imports entire library
import _ from "lodash";
_.debounce(fn, 300);

// Good - imports only the function
import debounce from "lodash/debounce";
debounce(fn, 300);

// Same for other libraries
import { format } from "date-fns";         // Good
import { Button } from "@mui/material";     // Tree-shakeable
```

---

## Quick Reference

| Technique | Use When |
|-----------|----------|
| `React.memo` | Child re-renders with same props |
| `useMemo` | Expensive calculations or derived data |
| `useCallback` | Passing callbacks to memoized children |
| `React.lazy` | Large pages/components not needed immediately |
| `react-window` | Lists with 100+ items |
| `loading="lazy"` | Images below the fold |
| Tree shaking | Importing from large libraries |
| State colocation | State used by only one subtree |

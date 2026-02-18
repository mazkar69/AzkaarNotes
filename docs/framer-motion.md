
# Framer Motion – Core Concepts Guide

A comprehensive guide to essential Framer Motion concepts for building smooth, performant animations in React applications.

---

## 1. Motion Components

Motion components are Framer Motion's foundation. They are special React components that wrap HTML elements and enable animation capabilities.

**What they do:**
- Transform standard HTML elements into animatable components
- Automatically handle CSS transforms for optimal performance
- Support all standard HTML attributes alongside animation props

**Basic Example:**
```jsx
import { motion } from "framer-motion";

export function AnimatedBox() {
  return (
    <motion.div animate={{ opacity: 1, x: 100 }} />
  );
}
```

**Common motion components:** `motion.div`, `motion.span`, `motion.button`, `motion.section`, etc.

---

## 2. Animation Lifecycle: initial / animate / exit

These three properties define the complete lifecycle of an animated element's state transitions.

**Explanation:**
- `initial`: The starting state when component mounts (before animation begins)
- `animate`: The target state the element animates toward
- `exit`: The state applied when component unmounts or is removed from DOM

**Example:**
```jsx
<motion.div
  initial={{ opacity: 0, y: -20 }}
  animate={{ opacity: 1, y: 0 }}
  exit={{ opacity: 0, y: -20 }}
/>
```

This creates a smooth entry animation (fading in and moving down), then reverses when the element exits.

---

## 3. AnimatePresence

Wraps components that conditionally render to enable exit animations. Without it, exit animations won't trigger.

**Why it matters:**
- Unmounting components lose event listeners
- `AnimatePresence` keeps components in DOM briefly to play exit animation
- Must wrap the conditional content, not individual motion components

**Example:**
```jsx
import { AnimatePresence, motion } from "framer-motion";

export function Modal({ isOpen }) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          Modal Content
        </motion.div>
      )}
    </AnimatePresence>
  );
}
```

---

## 4. Transitions: Control Timing and Easing

Transitions define how animations progress over time. They control duration, delay, easing curves, and repetition.

**Key transition properties:**
- `duration`: Animation length in seconds
- `delay`: Wait before animation starts
- `ease`: Easing function (easeIn, easeOut, easeInOut, linear, circIn, etc.)
- `repeat`: Number of times to repeat animation
- `repeatType`: "loop", "reverse", or "mirror"

**Example:**
```jsx
<motion.div
  animate={{ x: 100 }}
  transition={{
    duration: 0.5,
    delay: 0.2,
    ease: "easeInOut",
    repeat: 2,
    repeatType: "reverse"
  }}
/>
```

You can also set transitions per property:
```jsx
<motion.div
  animate={{ opacity: 1, x: 100 }}
  transition={{
    opacity: { duration: 0.3 },
    x: { duration: 1, ease: "easeOut" }
  }}
/>
```

---

## 5. Variants: Reusable Animation States

Variants let you define animation states once and reuse them across multiple components. This reduces code duplication and improves maintainability.

**How they work:**
- Object containing named animation states
- Reference them via `initial` and `animate` props
- Variants can contain transition properties

**Example:**
```jsx
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
};

export function List() {
  return (
    <motion.ul
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {items.map(item => (
        <motion.li key={item.id} variants={itemVariants}>
          {item.text}
        </motion.li>
      ))}
    </motion.ul>
  );
}
```

**Benefits:**
- Easy to reuse across components
- Cleaner, more readable code
- Variants can inherit from parent variants

---

## 6. User Interaction Animations

Trigger animations in response to user gestures without manual event handlers.

**Interaction properties:**
- `whileHover`: Applied when mouse hovers over element
- `whileTap`: Applied when element is clicked/pressed
- `whileFocus`: Applied when element receives focus
- `whileDrag`: Applied while element is being dragged

**Example:**
```jsx
<motion.button
  whileHover={{ scale: 1.05, boxShadow: "0 4px 12px rgba(0,0,0,0.15)" }}
  whileTap={{ scale: 0.95 }}
  transition={{ type: "spring", stiffness: 400, damping: 17 }}
>
  Click Me
</motion.button>
```

The values auto-animate to and from the specified state. No manual revert needed.

---

## 7. State-based Animations

React state can drive animations. Update state and let Framer Motion smoothly animate the transition.

**Explanation:**
- Animate prop accepts conditional values
- Framer Motion interpolates between states
- Useful for responding to user input or data changes

**Example:**
```jsx
export function Toggle() {
  const [isOn, setIsOn] = useState(false);

  return (
    <motion.button
      onClick={() => setIsOn(!isOn)}
      animate={{
        backgroundColor: isOn ? "#00ff00" : "#ff0000",
        x: isOn ? 100 : 0
      }}
      transition={{ duration: 0.3 }}
    >
      {isOn ? "ON" : "OFF"}
    </motion.button>
  );
}
```

---

## 8. Layout Animations

Automatically animate when elements change size or position within the layout. Perfect for reordering lists or responsive designs.

**How to use:**
- Add `layout` prop to motion component
- Changes to width, height, or position automatically animate
- No need to manually specify target values

**Example:**
```jsx
export function FilterList({ items, filter }) {
  const filtered = items.filter(item => item.category === filter);

  return (
    <motion.div layout>
      {filtered.map(item => (
        <motion.div key={item.id} layout>
          {item.name}
        </motion.div>
      ))}
    </motion.div>
  );
}
```

When the list filters, remaining items smoothly animate to their new positions.

---

## 9. Shared Layout Animations (layoutId)

Animate a visual element between two different components. Creates illusion of a single element moving between locations.

**Use cases:**
- Tab indicators moving between tabs
- Card expanding from list to detail view
- Element morphing between different sections

**Example:**
```jsx
export function Tabs({ active }) {
  return (
    <div>
      {tabs.map(tab => (
        <button
          key={tab.id}
          onClick={() => setActive(tab.id)}
        >
          {tab.label}
          {active === tab.id && (
            <motion.div
              layoutId="underline"
              style={{ width: "100%", height: 2, backgroundColor: "blue" }}
            />
          )}
        </button>
      ))}
    </div>
  );
}
```

The underline smoothly slides and resizes as active tab changes.

---

## 10. Keyframes: Animate Through Multiple Values

Define a sequence of values to animate through in order. Creates complex multi-step animations.

**How they work:**
- Array of values: `[startValue, ...middleValues, endValue]`
- Animate through each value in sequence
- Each step gets equal time unless timing is customized

**Example:**
```jsx
<motion.div
  animate={{
    x: [0, 100, 50, 150, 0],
    rotate: [0, 90, 180, 270, 360]
  }}
  transition={{
    duration: 4,
    ease: "easeInOut"
  }}
/>
```

This element bounces around and spins, returning to start position.

---

## 11. Drag Animations

Make elements draggable with constraining and snapping capabilities.

**Key drag properties:**
- `drag`: Enable drag (true, "x", "y")
- `dragConstraints`: Limit drag movement
- `dragElastic`: Bounciness when dragging (0-1)
- `onDragEnd`: Callback when drag ends

**Example:**
```jsx
<motion.div
  drag
  dragConstraints={{ left: -100, right: 100, top: -50, bottom: 50 }}
  dragElastic={0.2}
  onDragEnd={(e, info) => {
    console.log("Dragged by", info.point);
  }}
/>
```

Constrain to axis only:
```jsx
<motion.div drag="x" dragConstraints={{ left: -200, right: 200 }} />
```

---

## 12. Scroll-based Animations

Trigger animations based on scrolling. Useful for parallax effects, scroll indicators, and reveal animations.

**Key hooks:**
- `useScroll()`: Track scroll position and velocity
- `useTransform()`: Transform values based on input range
- `useViewportScroll()`: Deprecated, use useScroll instead

**Example:**
```jsx
import { useScroll, useTransform, motion } from "framer-motion";

export function ParallaxSection() {
  const { scrollY } = useScroll();
  const y = useTransform(scrollY, [0, 300], [0, 100]);

  return (
    <motion.div style={{ y }}>
      This moves slower than scroll
    </motion.div>
  );
}
```

Reveal animation on scroll:
```jsx
const opacity = useTransform(scrollY, [300, 600], [0, 1]);
const scale = useTransform(scrollY, [300, 600], [0.8, 1]);

<motion.div style={{ opacity, scale }} />
```

---

## 13. useAnimation Hook: Manual Control

Manually trigger, stop, or sequence animations using the `useAnimation` hook.

**What it provides:**
- `start()`: Begin animation immediately
- `stop()`: Stop animation
- `set()`: Jump to state without animation

**Example - Sequence animations:**
```jsx
import { motion, useAnimation } from "framer-motion";

export function SequencedAnimation() {
  const controls = useAnimation();

  const handleClick = async () => {
    await controls.start({ x: 100 });
    await controls.start({ y: 100 });
    await controls.start({ x: 0, y: 0 });
  };

  return (
    <>
      <motion.div animate={controls} />
      <button onClick={handleClick}>Animate</button>
    </>
  );
}
```

Example - Conditional animation:
```jsx
const controls = useAnimation();

useEffect(() => {
  if (isVisible) {
    controls.start("visible");
  } else {
    controls.start("hidden");
  }
}, [isVisible, controls]);

<motion.div
  variants={variants}
  animate={controls}
/>
```

---

## 14. Accessibility and Reduced Motion

Respect user preferences for reduced motion. Some users have motion sensitivity.

**Implementation:**
Use `useReducedMotion()` hook to check if user prefers reduced animations.

**Example:**
```jsx
import { motion, useReducedMotion } from "framer-motion";

export function AnimatedComponent() {
  const shouldReduceMotion = useReducedMotion();

  return (
    <motion.div
      animate={{ x: 100 }}
      transition={{ duration: shouldReduceMotion ? 0 : 0.5 }}
    />
  );
}
```

Or skip animation entirely:
```jsx
{shouldReduceMotion ? (
  <div>No Animation Version</div>
) : (
  <motion.div animate={{ x: 100 }} />
)}
```

---

## 15. Performance Best Practices

**Do:**
- Animate `transform` and `opacity` properties only
- Use `transform: translateX()` instead of `left` or `margin`
- Use variants to prevent re-renders
- Memoize complex motion components

**Avoid:**
- Animating layout properties (width, height, padding)
- Animating `top`, `left`, `right`, `bottom`
- Creating huge variants objects inline
- Unnecessary re-renders due to state changes

**Example - Good performance:**
```jsx
<motion.div
  animate={{ x: 100, opacity: 0.5 }}
  transition={{ duration: 0.5 }}
/>
```

**Example - Poor performance:**
```jsx
<motion.div
  animate={{ left: 100, width: 200 }}
  transition={{ duration: 0.5 }}
/>
```

---

## 16. Common Gotchas and Solutions

**AnimatePresence not working:**
- Ensure `AnimatePresence` wraps the conditional element
- `exit` prop must be defined
- Component must actually unmount for exit animation to play

**Hover animations on nested elements:**
- Hover animations don't work when child hides parent in CSS
- Use `onMouseEnter` / `onMouseLeave` callbacks as alternative
- Parent must remain visible for hover events to propagate

**Layout and layoutId conflicts:**
- Don't mix `layout` and `layoutId` on same element
- `layoutId` is for shared layout between components
- `layout` is for automatic re-layout animations

**Exit animation not working:**
```jsx
// Wrong
<AnimatePresence>
  <motion.div exit={{ opacity: 0 }} />
</AnimatePresence>

// Correct
<AnimatePresence>
  {condition && <motion.div exit={{ opacity: 0 }} />}
</AnimatePresence>
```

---

## What You Can Build

After mastering these concepts, you can build:

- **Dropdowns and mega menus** - Smooth opening/closing with exit animations
- **Modals and drawers** - Proper lifecycle animations with overlay fades
- **Page transitions** - Elegant transitions between routes using layoutId
- **Interactive UI elements** - Buttons, toggles, and cards with hover/tap feedback
- **Scroll-triggered reveals** - Content appearing as user scrolls
- **Drag and drop interfaces** - Intuitive draggable list reordering
- **Complex animation sequences** - Using useAnimation for orchestrated effects

---

## Next Steps

1. Install Framer Motion: `npm install framer-motion`
2. Import components and hooks in your React project
3. Start with simple animations (initial/animate/exit)
4. Progress to variants and transitions
5. Combine concepts for complex interactions

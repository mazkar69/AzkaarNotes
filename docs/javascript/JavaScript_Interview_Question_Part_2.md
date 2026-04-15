# JavaScript Interview Questions — Part 2

> Asynchronous JS, Event Loop, DOM, Design Patterns, Polyfills, Security & Coding Challenges.

---

## Table of Contents

- [1. Asynchronous JavaScript](#1-asynchronous-javascript)
- [2. Promises](#2-promises)
- [3. async / await](#3-async--await)
- [4. Promise Static Methods](#4-promise-static-methods)
- [5. Event Loop & Microtask Queue](#5-event-loop--microtask-queue)
- [6. DOM & Events](#6-dom--events)
- [7. Error Handling](#7-error-handling)
- [8. Storage — localStorage, sessionStorage, Cookies](#8-storage--localstorage-sessionstorage-cookies)
- [9. Debouncing & Throttling](#9-debouncing--throttling)
- [10. Currying](#10-currying)
- [11. Function Composition](#11-function-composition)
- [12. Memoization](#12-memoization)
- [13. Design Patterns](#13-design-patterns)
- [14. Web APIs](#14-web-apis)
- [15. Modules](#15-modules)
- [16. Security](#16-security)
- [17. Polyfills](#17-polyfills)
- [18. Output-Based Questions](#18-output-based-questions)
- [19. Coding Challenges](#19-coding-challenges)

---

## 1. Asynchronous JavaScript

### Q: What is the difference between Synchronous and Asynchronous code?

| Feature | Synchronous | Asynchronous |
|---------|-------------|-------------|
| Execution | Line by line, blocking | Non-blocking |
| Example | `console.log()` | `setTimeout()`, `fetch()` |
| Stack | Stays in call stack | Offloaded to Web APIs |

```js
// Synchronous — blocks
console.log("1");
console.log("2");
console.log("3");
// Output: 1, 2, 3

// Asynchronous — non-blocking
console.log("1");
setTimeout(() => console.log("2"), 0);
console.log("3");
// Output: 1, 3, 2
```

---

### Q: What is the Call Stack?

A **LIFO (Last In, First Out)** data structure that tracks function execution.

```js
function first() { second(); console.log("first"); }
function second() { third(); console.log("second"); }
function third() { console.log("third"); }

first();
// Call Stack flow:
// 1. first() pushed → calls second()
// 2. second() pushed → calls third()
// 3. third() pushed → logs "third" → popped
// 4. second() logs "second" → popped
// 5. first() logs "first" → popped
// Output: third, second, first
```

---

### Q: What are Callbacks? What is Callback Hell?

```js
// Callback — function passed to another function
function fetchUser(id, callback) {
  setTimeout(() => callback({ id, name: "Azkar" }), 1000);
}

// Callback Hell — deeply nested callbacks
fetchUser(1, (user) => {
  fetchOrders(user.id, (orders) => {
    fetchProducts(orders[0].id, (products) => {
      fetchReviews(products[0].id, (reviews) => {
        // pyramid of doom — hard to read, debug, and handle errors
      });
    });
  });
});
```

**Problems:** Hard to read, error handling is painful, no easy way to run in parallel.

---

## 2. Promises

### Q: What is a Promise?

A Promise represents a **future value** — an operation that hasn't completed yet.

States: `pending` → `fulfilled` (resolved) or `rejected`

```js
const promise = new Promise((resolve, reject) => {
  const success = true;
  setTimeout(() => {
    if (success) resolve("Data loaded");
    else reject("Error occurred");
  }, 1000);
});

promise
  .then(data => console.log(data))    // "Data loaded"
  .catch(err => console.error(err))
  .finally(() => console.log("Done")); // always runs
```

---

### Q: How does Promise chaining work?

Each `.then()` returns a **new Promise**, enabling chaining.

```js
fetch("/api/user/1")
  .then(res => res.json())
  .then(user => fetch(`/api/orders/${user.id}`))
  .then(res => res.json())
  .then(orders => console.log(orders))
  .catch(err => console.error(err)); // catches any error in the chain
```

---

### Q: What is the difference between `.then()` `.catch()` and placing catch inside `.then()`?

```js
// Pattern 1: Separate catch — catches errors from ALL previous .then()
promise
  .then(onSuccess)
  .catch(onError);

// Pattern 2: Two arguments — catch only handles promise rejection, NOT .then() errors
promise
  .then(onSuccess, onError);
```

```js
// Example
Promise.resolve("ok")
  .then(data => { throw new Error("oops"); })
  .catch(err => console.log(err.message)); // "oops" ← caught

Promise.resolve("ok")
  .then(
    data => { throw new Error("oops"); },
    err => console.log("not caught here") // won't catch .then() error
  );
// Unhandled: Error: oops
```

---

### Q: Create a custom Promise implementation (simplified).

```js
class MyPromise {
  constructor(executor) {
    this.state = "pending";
    this.value = undefined;
    this.callbacks = [];

    const resolve = (value) => {
      if (this.state !== "pending") return;
      this.state = "fulfilled";
      this.value = value;
      this.callbacks.forEach(cb => cb.onFulfilled(value));
    };

    const reject = (reason) => {
      if (this.state !== "pending") return;
      this.state = "rejected";
      this.value = reason;
      this.callbacks.forEach(cb => cb.onRejected(reason));
    };

    try { executor(resolve, reject); }
    catch (err) { reject(err); }
  }

  then(onFulfilled, onRejected) {
    return new MyPromise((resolve, reject) => {
      const handle = () => {
        try {
          if (this.state === "fulfilled") {
            const result = onFulfilled ? onFulfilled(this.value) : this.value;
            resolve(result);
          }
          if (this.state === "rejected") {
            if (onRejected) resolve(onRejected(this.value));
            else reject(this.value);
          }
        } catch (err) { reject(err); }
      };

      if (this.state === "pending") {
        this.callbacks.push({ onFulfilled: () => handle(), onRejected: () => handle() });
      } else {
        queueMicrotask(handle);
      }
    });
  }

  catch(onRejected) { return this.then(null, onRejected); }

  static resolve(val) { return new MyPromise(res => res(val)); }
  static reject(val) { return new MyPromise((_, rej) => rej(val)); }
}
```

---

## 3. async / await

### Q: What is `async/await`?

Syntactic sugar over Promises — makes async code look synchronous.

```js
// With Promises
function getUser() {
  return fetch("/api/user")
    .then(res => res.json())
    .then(user => user);
}

// With async/await
async function getUser() {
  const res = await fetch("/api/user");
  const user = await res.json();
  return user;
}
```

---

### Q: How to handle errors with `async/await`?

```js
// try/catch
async function fetchData() {
  try {
    const res = await fetch("/api/data");
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    return data;
  } catch (err) {
    console.error("Fetch failed:", err.message);
  }
}

// Catch at call site
fetchData().catch(err => console.error(err));

// Utility wrapper (avoids try/catch boilerplate)
async function tryCatch(promise) {
  try {
    const data = await promise;
    return [data, null];
  } catch (err) {
    return [null, err];
  }
}

const [data, error] = await tryCatch(fetch("/api/data"));
if (error) console.error(error);
```

---

### Q: Can you use `await` at the top level?

```js
// ✅ In ES Modules (type: "module")
const data = await fetch("/api").then(r => r.json());

// ❌ In CommonJS or non-module scripts — wrap in async IIFE
(async () => {
  const data = await fetch("/api").then(r => r.json());
})();
```

---

### Q: Parallel vs Sequential execution with `async/await`.

```js
// ❌ Sequential — slow (one after another)
async function sequential() {
  const user = await fetchUser();     // 1s
  const orders = await fetchOrders(); // 1s
  // Total: ~2s
}

// ✅ Parallel — fast (both at same time)
async function parallel() {
  const [user, orders] = await Promise.all([
    fetchUser(),    // 1s
    fetchOrders()   // 1s
  ]);
  // Total: ~1s
}
```

---

## 4. Promise Static Methods

### Q: Explain `Promise.all`, `Promise.race`, `Promise.allSettled`, `Promise.any`.

```js
const p1 = Promise.resolve("one");
const p2 = new Promise(res => setTimeout(() => res("two"), 100));
const p3 = Promise.reject("error");
```

| Method | Resolves when | Rejects when | Result |
|--------|--------------|-------------|--------|
| `Promise.all` | ALL fulfilled | ANY rejects | Array of values |
| `Promise.allSettled` | ALL settled | Never rejects | Array of `{status, value/reason}` |
| `Promise.race` | FIRST settles | FIRST rejects | Single value |
| `Promise.any` | FIRST fulfills | ALL reject | Single value |

```js
// all — fails fast if any rejects
Promise.all([p1, p2])
  .then(console.log); // ["one", "two"]

Promise.all([p1, p3])
  .catch(console.log); // "error"

// allSettled — waits for all, never rejects
Promise.allSettled([p1, p2, p3])
  .then(console.log);
// [
//   { status: "fulfilled", value: "one" },
//   { status: "fulfilled", value: "two" },
//   { status: "rejected", reason: "error" }
// ]

// race — first to settle wins (resolve or reject)
Promise.race([p1, p2])
  .then(console.log); // "one" (p1 resolves first)

// any — first to fulfill wins (ignores rejections)
Promise.any([p3, p1, p2])
  .then(console.log); // "one" (first fulfilled)

// any — all rejected → AggregateError
Promise.any([p3])
  .catch(err => console.log(err.errors)); // ["error"]
```

---

## 5. Event Loop & Microtask Queue

### Q: How does the JavaScript Event Loop work?

```
┌──────────────────────────────┐
│         Call Stack            │  ← Executes sync code
└──────────┬───────────────────┘
           │
           ▼
┌──────────────────────────────┐
│       Microtask Queue         │  ← Promise.then, queueMicrotask, MutationObserver
│  (Highest priority)           │
└──────────┬───────────────────┘
           │
           ▼
┌──────────────────────────────┐
│       Macrotask Queue         │  ← setTimeout, setInterval, I/O, UI rendering
│  (Lower priority)             │
└──────────────────────────────┘
```

**Execution order:**
1. Execute all synchronous code (call stack)
2. Drain the **microtask queue** (all microtasks)
3. Execute **one macrotask**
4. Repeat from step 2

---

### Q: What is the output? (Classic Event Loop question)

```js
console.log("1");

setTimeout(() => console.log("2"), 0);

Promise.resolve().then(() => console.log("3"));

console.log("4");
```

**Output:** `1, 4, 3, 2`

**Explanation:**
1. `"1"` — sync, runs immediately
2. `setTimeout` → callback goes to **macrotask queue**
3. `Promise.then` → callback goes to **microtask queue**
4. `"4"` — sync, runs immediately
5. Call stack empty → drain microtasks → `"3"`
6. Execute macrotask → `"2"`

---

### Q: Another Event Loop question — complex.

```js
console.log("start");

setTimeout(() => console.log("timeout1"), 0);

Promise.resolve()
  .then(() => {
    console.log("promise1");
    setTimeout(() => console.log("timeout2"), 0);
  })
  .then(() => console.log("promise2"));

setTimeout(() => console.log("timeout3"), 0);

console.log("end");
```

**Output:** `start, end, promise1, promise2, timeout1, timeout3, timeout2`

---

### Q: What is `queueMicrotask()`?

Schedule a function to run as a **microtask** (same queue as Promise callbacks).

```js
console.log("1");
queueMicrotask(() => console.log("2"));
console.log("3");
// Output: 1, 3, 2
```

---

### Q: What is the difference between `setTimeout(fn, 0)` and `Promise.resolve().then(fn)`?

| Feature | `setTimeout(fn, 0)` | `Promise.then(fn)` |
|---------|---------------------|---------------------|
| Queue | Macrotask queue | Microtask queue |
| Priority | Lower | Higher |
| Min delay | ~4ms (browser) | Immediate (after sync) |

```js
setTimeout(() => console.log("timeout"), 0);
Promise.resolve().then(() => console.log("promise"));
console.log("sync");
// Output: sync, promise, timeout
```

---

### Q: What is `process.nextTick` in Node.js?

```js
// Node.js only — runs BEFORE microtasks and macrotasks
setTimeout(() => console.log("timeout"), 0);
Promise.resolve().then(() => console.log("promise"));
process.nextTick(() => console.log("nextTick"));
console.log("sync");
// Output: sync, nextTick, promise, timeout
```

---

## 6. DOM & Events

### Q: What is Event Delegation?

Attach a **single event listener to a parent** instead of multiple listeners on children. Uses event bubbling.

```js
// ❌ Bad — listener on every button
document.querySelectorAll(".btn").forEach(btn => {
  btn.addEventListener("click", handleClick);
});

// ✅ Good — single listener on parent
document.getElementById("button-container").addEventListener("click", (e) => {
  if (e.target.matches(".btn")) {
    console.log("Button clicked:", e.target.textContent);
  }
});
```

**Benefits:** Less memory, works with dynamically added elements, cleaner code.

---

### Q: What is Event Bubbling and Capturing?

Events flow in **3 phases**:

```
1. Capturing phase  →  window → document → ... → parent → target
2. Target phase     →  event on the target element
3. Bubbling phase   →  target → parent → ... → document → window
```

```js
// Bubbling (default) — inner fires first
parent.addEventListener("click", () => console.log("parent"));
child.addEventListener("click", () => console.log("child"));
// Click on child → "child", "parent"

// Capturing — outer fires first
parent.addEventListener("click", () => console.log("parent"), true);
child.addEventListener("click", () => console.log("child"), true);
// Click on child → "parent", "child"
```

---

### Q: `stopPropagation()` vs `preventDefault()` vs `stopImmediatePropagation()`?

| Method | Purpose |
|--------|---------|
| `stopPropagation()` | Stops event from bubbling/capturing further |
| `preventDefault()` | Prevents default browser behavior |
| `stopImmediatePropagation()` | Stops propagation AND other handlers on same element |

```js
// stopPropagation — stops bubbling
child.addEventListener("click", (e) => {
  e.stopPropagation();
  console.log("child"); // only this fires
});
parent.addEventListener("click", () => console.log("parent")); // won't fire

// preventDefault — prevent default action
form.addEventListener("submit", (e) => {
  e.preventDefault(); // prevents page reload
  // handle form data with JS
});

link.addEventListener("click", (e) => {
  e.preventDefault(); // prevents navigation
});
```

---

### Q: What is `DOMContentLoaded` vs `load` vs `beforeunload`?

| Event | Fires when |
|-------|-----------|
| `DOMContentLoaded` | HTML parsed, DOM ready (before images/CSS) |
| `load` | Everything loaded (images, CSS, scripts) |
| `beforeunload` | User about to leave the page |

```js
document.addEventListener("DOMContentLoaded", () => {
  console.log("DOM ready");
});

window.addEventListener("load", () => {
  console.log("Everything loaded");
});

window.addEventListener("beforeunload", (e) => {
  e.preventDefault();
  // Modern browsers show generic message
});
```

---

## 7. Error Handling

### Q: How does `try/catch/finally` work?

```js
try {
  JSON.parse("invalid json");
} catch (error) {
  console.error(error.message); // "Unexpected token i..."
  console.error(error.name);    // "SyntaxError"
  console.error(error.stack);   // full stack trace
} finally {
  console.log("Always runs"); // cleanup code
}
```

---

### Q: How to create Custom Errors?

```js
class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.name = "AppError";
    this.statusCode = statusCode;
  }
}

class ValidationError extends AppError {
  constructor(message) {
    super(message, 400);
    this.name = "ValidationError";
  }
}

class NotFoundError extends AppError {
  constructor(resource) {
    super(`${resource} not found`, 404);
    this.name = "NotFoundError";
  }
}

// Usage
try {
  throw new NotFoundError("User");
} catch (err) {
  if (err instanceof NotFoundError) {
    console.log(err.statusCode); // 404
  }
}
```

---

### Q: What are the different error types in JavaScript?

| Error Type | When |
|-----------|------|
| `SyntaxError` | Invalid syntax |
| `ReferenceError` | Accessing undeclared variable |
| `TypeError` | Wrong type operation (e.g., calling non-function) |
| `RangeError` | Value out of range (e.g., `new Array(-1)`) |
| `URIError` | Invalid URI functions |
| `EvalError` | Related to `eval()` |
| `AggregateError` | Multiple errors (e.g., `Promise.any` all reject) |

```js
// ReferenceError
console.log(x); // x is not defined

// TypeError
null.property;  // Cannot read properties of null
(5)();          // 5 is not a function

// RangeError
new Array(-1);  // Invalid array length

// SyntaxError
JSON.parse("{invalid}");
```

---

## 8. Storage — localStorage, sessionStorage, Cookies

### Q: Differences between localStorage, sessionStorage, and Cookies.

| Feature | localStorage | sessionStorage | Cookies |
|---------|-------------|---------------|---------|
| Capacity | ~5-10MB | ~5MB | ~4KB |
| Expiry | Permanent | Tab close | Configurable |
| Sent with requests | No | No | Yes (every HTTP request) |
| Scope | Same origin | Same tab + origin | Same origin + path |
| Access | JS only | JS only | JS + Server |

```js
// localStorage
localStorage.setItem("user", JSON.stringify({ name: "Azkar" }));
const user = JSON.parse(localStorage.getItem("user"));
localStorage.removeItem("user");
localStorage.clear(); // remove all

// sessionStorage — same API, clears when tab closes
sessionStorage.setItem("token", "abc123");

// Cookies
document.cookie = "name=Azkar; max-age=3600; path=/; Secure; SameSite=Strict";

// Read cookies (returns all as string)
console.log(document.cookie); // "name=Azkar; other=value"

// Delete cookie — set expiry in the past
document.cookie = "name=; max-age=0";
```

---

## 9. Debouncing & Throttling

### Q: What is Debouncing?

Delays execution until the user **stops** performing an action for a specified time. Useful for search input, resize events.

```js
function debounce(fn, delay) {
  let timer;
  return function(...args) {
    clearTimeout(timer);
    timer = setTimeout(() => fn.apply(this, args), delay);
  };
}

// Usage
const handleSearch = debounce((query) => {
  console.log("Searching:", query);
  // API call here
}, 300);

input.addEventListener("input", (e) => handleSearch(e.target.value));
```

---

### Q: What is Throttling?

Limits execution to **at most once per interval**. Useful for scroll, mousemove events.

```js
function throttle(fn, limit) {
  let inThrottle = false;
  return function(...args) {
    if (!inThrottle) {
      fn.apply(this, args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

// Usage
const handleScroll = throttle(() => {
  console.log("Scroll position:", window.scrollY);
}, 200);

window.addEventListener("scroll", handleScroll);
```

---

### Q: Debouncing vs Throttling comparison.

| Feature | Debounce | Throttle |
|---------|----------|----------|
| When it fires | After user stops | At regular intervals |
| Use case | Search input, form validation | Scroll, resize, mousemove |
| Example | Search only after user stops typing | Track scroll max once per 200ms |

---

## 10. Currying

### Q: What is Currying?

Transforming a function with multiple arguments into a **chain of functions** each taking a single argument.

```js
// Normal function
function add(a, b, c) { return a + b + c; }
add(1, 2, 3); // 6

// Curried version
function curriedAdd(a) {
  return function(b) {
    return function(c) {
      return a + b + c;
    };
  };
}
curriedAdd(1)(2)(3); // 6

// Arrow function version
const curriedAdd = a => b => c => a + b + c;
```

---

### Q: Implement a generic `curry()` utility.

```js
function curry(fn) {
  return function curried(...args) {
    if (args.length >= fn.length) {
      return fn.apply(this, args);
    }
    return function(...nextArgs) {
      return curried.apply(this, [...args, ...nextArgs]);
    };
  };
}

// Usage
function multiply(a, b, c) { return a * b * c; }
const curriedMultiply = curry(multiply);

curriedMultiply(2)(3)(4);    // 24
curriedMultiply(2, 3)(4);    // 24
curriedMultiply(2)(3, 4);    // 24
curriedMultiply(2, 3, 4);    // 24
```

---

### Q: What is Partial Application? How is it different from Currying?

| Feature | Currying | Partial Application |
|---------|---------|-------------------|
| Arguments | One at a time | Some fixed upfront |
| Returns | Chain of unary functions | Function with remaining args |

```js
// Partial application
function partial(fn, ...fixedArgs) {
  return function(...remainingArgs) {
    return fn(...fixedArgs, ...remainingArgs);
  };
}

function greet(greeting, name) {
  return `${greeting}, ${name}!`;
}

const hello = partial(greet, "Hello");
hello("Azkar"); // "Hello, Azkar!"
hello("Ali");   // "Hello, Ali!"
```

---

## 11. Function Composition

### Q: What is Function Composition?

Combining functions where the **output of one becomes the input of the next**.

```js
const add10 = x => x + 10;
const multiply2 = x => x * 2;
const subtract5 = x => x - 5;

// Manual composition
const result = subtract5(multiply2(add10(5))); // subtract5(multiply2(15)) → subtract5(30) → 25

// compose — right to left
function compose(...fns) {
  return (x) => fns.reduceRight((acc, fn) => fn(acc), x);
}

const transform = compose(subtract5, multiply2, add10);
transform(5); // 25

// pipe — left to right (more readable)
function pipe(...fns) {
  return (x) => fns.reduce((acc, fn) => fn(acc), x);
}

const transform2 = pipe(add10, multiply2, subtract5);
transform2(5); // 25
```

---

## 12. Memoization

### Q: What is Memoization?

Caching the **result of expensive function calls** and returning the cached result when the same inputs occur.

```js
function memoize(fn) {
  const cache = new Map();
  return function(...args) {
    const key = JSON.stringify(args);
    if (cache.has(key)) return cache.get(key);
    const result = fn.apply(this, args);
    cache.set(key, result);
    return result;
  };
}

// Memoized fibonacci
const fibonacci = memoize(function(n) {
  if (n <= 1) return n;
  return fibonacci(n - 1) + fibonacci(n - 2);
});

fibonacci(50); // instant (without memoization would take very long)
```

---

## 13. Design Patterns

### Q: What is the Module Pattern?

Encapsulates private data and exposes a public API.

```js
const Counter = (function() {
  let count = 0; // private

  return {
    increment() { count++; },
    decrement() { count--; },
    getCount() { return count; }
  };
})();

Counter.increment();
Counter.increment();
console.log(Counter.getCount()); // 2
// count is not accessible directly
```

---

### Q: What is the Singleton Pattern?

Ensures only **one instance** of a class exists.

```js
class Database {
  constructor() {
    if (Database.instance) return Database.instance;
    this.connection = "connected";
    Database.instance = this;
  }
}

const db1 = new Database();
const db2 = new Database();
console.log(db1 === db2); // true — same instance
```

---

### Q: What is the Observer Pattern (Pub/Sub)?

Objects **subscribe** to events and get **notified** when those events occur.

```js
class EventEmitter {
  constructor() {
    this.events = {};
  }

  on(event, callback) {
    if (!this.events[event]) this.events[event] = [];
    this.events[event].push(callback);
    return this; // for chaining
  }

  off(event, callback) {
    if (!this.events[event]) return;
    this.events[event] = this.events[event].filter(cb => cb !== callback);
  }

  emit(event, ...args) {
    if (!this.events[event]) return;
    this.events[event].forEach(cb => cb(...args));
  }

  once(event, callback) {
    const wrapper = (...args) => {
      callback(...args);
      this.off(event, wrapper);
    };
    this.on(event, wrapper);
  }
}

// Usage
const emitter = new EventEmitter();
emitter.on("userLogin", (user) => console.log(`${user} logged in`));
emitter.emit("userLogin", "Azkar"); // "Azkar logged in"
```

---

### Q: What is the Factory Pattern?

Creates objects **without specifying the exact class**.

```js
class Car {
  constructor(type) {
    this.type = type;
    this.wheels = 4;
  }
}

class Bike {
  constructor(type) {
    this.type = type;
    this.wheels = 2;
  }
}

class VehicleFactory {
  static create(type) {
    switch (type) {
      case "car": return new Car(type);
      case "bike": return new Bike(type);
      default: throw new Error(`Unknown type: ${type}`);
    }
  }
}

const car = VehicleFactory.create("car");
const bike = VehicleFactory.create("bike");
```

---

## 14. Web APIs

### Q: How does the Fetch API work?

```js
// GET
const res = await fetch("https://api.example.com/users");
const data = await res.json();

// POST
const res = await fetch("https://api.example.com/users", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ name: "Azkar" })
});

// Error handling — fetch doesn't throw on HTTP errors
const res = await fetch("/api/data");
if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`);
const data = await res.json();
```

---

### Q: What is AbortController?

Used to **cancel fetch requests** or other async operations.

```js
const controller = new AbortController();
const { signal } = controller;

// Start fetch with signal
fetch("/api/data", { signal })
  .then(res => res.json())
  .then(console.log)
  .catch(err => {
    if (err.name === "AbortError") console.log("Request cancelled");
    else throw err;
  });

// Cancel after 5 seconds
setTimeout(() => controller.abort(), 5000);

// Useful for search-as-you-type — cancel previous request
let controller;
async function search(query) {
  if (controller) controller.abort();
  controller = new AbortController();

  const res = await fetch(`/api/search?q=${query}`, {
    signal: controller.signal
  });
  return res.json();
}
```

---

### Q: What is IntersectionObserver?

Detects when an element **enters or leaves the viewport**. Used for lazy loading, infinite scroll, animations.

```js
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      console.log("Element is visible");
      entry.target.classList.add("visible");
      observer.unobserve(entry.target); // stop observing
    }
  });
}, {
  threshold: 0.5 // 50% visible
});

document.querySelectorAll(".lazy").forEach(el => observer.observe(el));
```

---

### Q: What are Web Workers?

Run JavaScript in a **background thread** — doesn't block the main thread.

```js
// main.js
const worker = new Worker("worker.js");

worker.postMessage({ data: [1, 2, 3, 4, 5] });

worker.onmessage = (event) => {
  console.log("Result:", event.data); // processed data
};

worker.onerror = (error) => console.error(error);

// Terminate when done
worker.terminate();
```

```js
// worker.js
self.onmessage = (event) => {
  const { data } = event.data;
  // Heavy computation
  const result = data.map(n => n * n);
  self.postMessage(result);
};
```

---

## 15. Modules

### Q: What is the difference between CommonJS and ES Modules?

| Feature | CommonJS (`require`) | ES Modules (`import`) |
|---------|---------------------|-----------------------|
| Syntax | `require()` / `module.exports` | `import` / `export` |
| Loading | Synchronous | Asynchronous |
| When evaluated | Runtime | Compile time (static) |
| Tree shaking | No | Yes |
| Top-level await | No | Yes |
| Environment | Node.js (default) | Browser + Node (`"type": "module"`) |

```js
// CommonJS
const fs = require("fs");
module.exports = { myFunction };

// ES Modules
import fs from "fs";
export { myFunction };
export default myFunction;
```

---

### Q: What are Dynamic Imports?

Load modules **on demand** — useful for code splitting and lazy loading.

```js
// Static import — loaded at compile time
import { heavy } from "./heavyModule.js";

// Dynamic import — loaded at runtime, returns a Promise
const module = await import("./heavyModule.js");
module.heavy();

// Conditional import
if (needsFeature) {
  const { feature } = await import("./feature.js");
  feature();
}
```

---

## 16. Security

### Q: What is XSS (Cross-Site Scripting)?

Attacker injects **malicious scripts** into a web page viewed by other users.

```js
// ❌ Vulnerable — inserting user input as HTML
element.innerHTML = userInput;

// ✅ Safe — use textContent
element.textContent = userInput;

// ✅ Sanitize if HTML is necessary
import DOMPurify from "dompurify";
element.innerHTML = DOMPurify.sanitize(userInput);
```

**Prevention:**
- Never use `innerHTML` with user input
- Use `textContent` or sanitize HTML
- Set `Content-Security-Policy` headers
- Encode output in templates

---

### Q: What is CSRF (Cross-Site Request Forgery)?

Tricks a logged-in user into making **unwanted requests** to a site where they're authenticated.

**Prevention:**
- Use CSRF tokens in forms
- Use `SameSite` cookie attribute
- Validate `Origin` / `Referer` headers

```js
// SameSite cookie
document.cookie = "session=abc; SameSite=Strict; Secure; HttpOnly";
```

---

## 17. Polyfills

### Q: Implement `Array.prototype.map()` polyfill.

```js
Array.prototype.myMap = function(callback, thisArg) {
  const result = [];
  for (let i = 0; i < this.length; i++) {
    if (i in this) { // handle sparse arrays
      result.push(callback.call(thisArg, this[i], i, this));
    }
  }
  return result;
};

[1, 2, 3].myMap(x => x * 2); // [2, 4, 6]
```

---

### Q: Implement `Array.prototype.filter()` polyfill.

```js
Array.prototype.myFilter = function(callback, thisArg) {
  const result = [];
  for (let i = 0; i < this.length; i++) {
    if (i in this && callback.call(thisArg, this[i], i, this)) {
      result.push(this[i]);
    }
  }
  return result;
};

[1, 2, 3, 4].myFilter(x => x > 2); // [3, 4]
```

---

### Q: Implement `Function.prototype.bind()` polyfill.

```js
Function.prototype.myBind = function(context, ...boundArgs) {
  const fn = this;
  return function(...args) {
    return fn.apply(context, [...boundArgs, ...args]);
  };
};

function greet(greeting, name) {
  return `${greeting}, ${this.title} ${name}`;
}

const bound = greet.myBind({ title: "Mr." }, "Hello");
bound("Azkar"); // "Hello, Mr. Azkar"
```

---

### Q: Implement `Function.prototype.call()` polyfill.

```js
Function.prototype.myCall = function(context, ...args) {
  context = context || globalThis;
  const sym = Symbol();
  context[sym] = this;
  const result = context[sym](...args);
  delete context[sym];
  return result;
};
```

---

### Q: Implement `Function.prototype.apply()` polyfill.

```js
Function.prototype.myApply = function(context, args = []) {
  context = context || globalThis;
  const sym = Symbol();
  context[sym] = this;
  const result = context[sym](...args);
  delete context[sym];
  return result;
};
```

---

### Q: Implement `Array.prototype.flat()` polyfill.

```js
Array.prototype.myFlat = function(depth = 1) {
  const result = [];

  function flatten(arr, d) {
    for (const item of arr) {
      if (Array.isArray(item) && d > 0) {
        flatten(item, d - 1);
      } else {
        result.push(item);
      }
    }
  }

  flatten(this, depth);
  return result;
};

[1, [2, [3, [4]]]].myFlat(2); // [1, 2, 3, [4]]
```

---

### Q: Implement a `Promise.all()` polyfill.

```js
function promiseAll(promises) {
  return new Promise((resolve, reject) => {
    const results = [];
    let completed = 0;

    if (promises.length === 0) return resolve([]);

    promises.forEach((promise, index) => {
      Promise.resolve(promise)
        .then(value => {
          results[index] = value;
          completed++;
          if (completed === promises.length) resolve(results);
        })
        .catch(reject);
    });
  });
}
```

---

## 18. Output-Based Questions

### Q1: What is the output?

```js
var a = 10;
{
  var a = 20;
}
console.log(a);
```

**Output:** `20` — `var` is function-scoped, both refer to the same variable.

---

### Q2: What is the output?

```js
console.log(typeof null);
console.log(typeof undefined);
console.log(typeof NaN);
console.log(typeof []);
```

**Output:** `object`, `undefined`, `number`, `object`

---

### Q3: What is the output?

```js
const arr = [1, 2, 3];
arr[10] = 11;
console.log(arr.length);
console.log(arr[5]);
```

**Output:** `11`, `undefined` — sparse array, length is highest index + 1.

---

### Q4: What is the output?

```js
console.log(1 + "2" + "2");
console.log(1 + +"2" + "2");
console.log(1 + -"1" + "2");
console.log(+"1" + "1" + "2");
console.log("A" - "B" + "2");
console.log("A" - "B" + 2);
```

**Output:**
```
"122"     → 1 + "2" = "12" + "2" = "122"
"32"      → 1 + 2(unary+) = 3 + "2" = "32"
"02"      → 1 + (-1) = 0 + "2" = "02"
"112"     → 1 + "1" = "11" + "2" = "112"
"NaN2"    → NaN + "2" = "NaN2"
NaN       → NaN + 2 = NaN
```

---

### Q5: What is the output?

```js
let x = {};
let y = {};
let z = x;

console.log(x == y);
console.log(x === y);
console.log(x == z);
console.log(x === z);
```

**Output:** `false`, `false`, `true`, `true` — objects are compared by reference.

---

### Q6: What is the output?

```js
const person = { name: "Azkar" };
const members = [person];
person = null;
console.log(members);
```

**Output:** `TypeError: Assignment to constant variable.` — `person` is `const`.

If it were `let`:

```js
let person = { name: "Azkar" };
const members = [person];
person = null;
console.log(members); // [{ name: "Azkar" }] — array still holds the reference
```

---

### Q7: What is the output?

```js
function foo() {
  return
  {
    message: "hello"
  }
}
console.log(foo());
```

**Output:** `undefined` — ASI (Automatic Semicolon Insertion) adds `;` after `return`.

**Fix:** Put `{` on the same line as `return`:

```js
function foo() {
  return {
    message: "hello"
  };
}
```

---

### Q8: What is the output?

```js
(function() {
  var a = b = 5;
})();

console.log(typeof a); // "undefined" — var is function-scoped
console.log(typeof b); // "number" — b is accidentally global (no var/let/const)
```

---

### Q9: What is the output?

```js
const a = {};
const b = { key: "b" };
const c = { key: "c" };

a[b] = 123;
a[c] = 456;

console.log(a[b]);
```

**Output:** `456` — Objects as keys are converted to string `"[object Object]"`, so both `b` and `c` become the same key.

---

### Q10: What is the output?

```js
async function async1() {
  console.log("async1 start");
  await async2();
  console.log("async1 end");
}

async function async2() {
  console.log("async2");
}

console.log("script start");
async1();
console.log("script end");
```

**Output:**
```
script start
async1 start
async2
script end
async1 end
```

`await` pauses `async1`, the code after `await` runs as a microtask.

---

## 19. Coding Challenges

### Q: Implement `deepEqual` — compare two values deeply.

```js
function deepEqual(a, b) {
  if (a === b) return true;
  if (a == null || b == null) return false;
  if (typeof a !== typeof b) return false;

  if (typeof a === "object") {
    const keysA = Object.keys(a);
    const keysB = Object.keys(b);
    if (keysA.length !== keysB.length) return false;
    return keysA.every(key => deepEqual(a[key], b[key]));
  }

  return false;
}

deepEqual({ a: 1, b: { c: 2 } }, { a: 1, b: { c: 2 } }); // true
deepEqual([1, 2, [3]], [1, 2, [3]]); // true
```

---

### Q: Implement `debounce` with leading & trailing options.

```js
function debounce(fn, delay, { leading = false, trailing = true } = {}) {
  let timer;
  let lastArgs;

  return function(...args) {
    const isFirstCall = !timer && leading;
    lastArgs = args;

    clearTimeout(timer);
    timer = setTimeout(() => {
      if (trailing && lastArgs) fn.apply(this, lastArgs);
      timer = null;
      lastArgs = null;
    }, delay);

    if (isFirstCall) fn.apply(this, args);
  };
}
```

---

### Q: Flatten a deeply nested object.

```js
function flattenObject(obj, prefix = "") {
  const result = {};

  for (const [key, value] of Object.entries(obj)) {
    const newKey = prefix ? `${prefix}.${key}` : key;
    if (typeof value === "object" && value !== null && !Array.isArray(value)) {
      Object.assign(result, flattenObject(value, newKey));
    } else {
      result[newKey] = value;
    }
  }
  return result;
}

flattenObject({
  a: 1,
  b: { c: 2, d: { e: 3 } },
  f: [4, 5]
});
// { "a": 1, "b.c": 2, "b.d.e": 3, "f": [4, 5] }
```

---

### Q: Implement `retry` — retry a failed async function N times.

```js
async function retry(fn, retries = 3, delay = 1000) {
  for (let i = 0; i <= retries; i++) {
    try {
      return await fn();
    } catch (err) {
      if (i === retries) throw err;
      await new Promise(res => setTimeout(res, delay));
    }
  }
}

// Usage
await retry(() => fetch("/api/data").then(r => {
  if (!r.ok) throw new Error("Failed");
  return r.json();
}), 3, 1000);
```

---

### Q: Implement `pipe` for async functions.

```js
function asyncPipe(...fns) {
  return (input) => fns.reduce(
    (chain, fn) => chain.then(fn),
    Promise.resolve(input)
  );
}

const process = asyncPipe(
  async (x) => x + 1,
  async (x) => x * 2,
  async (x) => x - 3
);

await process(5); // ((5 + 1) * 2) - 3 = 9
```

---

### Q: Implement a simple `EventEmitter` with `once`, `on`, `off`, `emit`.

> See the Observer Pattern in Section 13 above for the full implementation.

---

### Q: Convert a flat array to a tree structure.

```js
function arrayToTree(items, parentId = null) {
  return items
    .filter(item => item.parentId === parentId)
    .map(item => ({
      ...item,
      children: arrayToTree(items, item.id)
    }));
}

const arr = [
  { id: 1, name: "Root", parentId: null },
  { id: 2, name: "Child 1", parentId: 1 },
  { id: 3, name: "Child 2", parentId: 1 },
  { id: 4, name: "Grandchild", parentId: 2 }
];

console.log(JSON.stringify(arrayToTree(arr), null, 2));
```

---

### Q: Implement `groupBy`.

```js
function groupBy(arr, key) {
  return arr.reduce((groups, item) => {
    const groupKey = typeof key === "function" ? key(item) : item[key];
    (groups[groupKey] = groups[groupKey] || []).push(item);
    return groups;
  }, {});
}

const users = [
  { name: "Azkar", role: "admin" },
  { name: "Ali", role: "user" },
  { name: "Sara", role: "admin" }
];

groupBy(users, "role");
// { admin: [{name: "Azkar"...}, {name: "Sara"...}], user: [{name: "Ali"...}] }
```

---

### Q: Implement a `sleep` function.

```js
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function main() {
  console.log("start");
  await sleep(2000);
  console.log("after 2 seconds");
}
```

---

### Q: Implement `chunk` — split array into chunks.

```js
function chunk(arr, size) {
  const result = [];
  for (let i = 0; i < arr.length; i += size) {
    result.push(arr.slice(i, i + size));
  }
  return result;
}

chunk([1, 2, 3, 4, 5], 2); // [[1, 2], [3, 4], [5]]
```

---

### Q: Implement `deepClone` without `structuredClone`.

```js
function deepClone(obj, hash = new WeakMap()) {
  if (obj === null || typeof obj !== "object") return obj;
  if (obj instanceof Date) return new Date(obj);
  if (obj instanceof RegExp) return new RegExp(obj);
  if (hash.has(obj)) return hash.get(obj); // handle circular refs

  const clone = Array.isArray(obj) ? [] : {};
  hash.set(obj, clone);

  for (const key of Object.keys(obj)) {
    clone[key] = deepClone(obj[key], hash);
  }
  return clone;
}
```

---

> **← Back to [Part 1](JavaScript_Interview_Question_Part_1.md)** for Variables, Scope, Closures, Prototypes, ES6+, and more.

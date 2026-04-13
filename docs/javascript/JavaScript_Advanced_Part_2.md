

# JavaScript Advanced — Part 2

> Compilation, JS Engine, Event Loop, `this` Keyword & Memory Management.

---

## Table of Contents

- [Compilation vs Interpretation](#compilation-vs-interpretation)
- [How JavaScript Engine Works](#how-javascript-engine-works)
- [Browser Runtime Architecture](#browser-runtime-architecture)
- [Web APIs](#web-apis)
- [Event Loop, Callback Queue & Microtask Queue](#event-loop-callback-queue--microtask-queue)
- [`this` Keyword](#this-keyword)
- [Memory Management — Stack & Heap](#memory-management--stack--heap)

---

## Compilation vs Interpretation

| Approach | How It Works | Examples |
|----------|-------------|----------|
| **Compilation** | Entire source code is converted into machine code **before** execution → produces a standalone executable file | C, C++, Rust |
| **Interpretation** | Source code is translated and executed **line by line** at runtime — no separate executable is created | Old JavaScript, Python |
| **JIT Compilation** | Hybrid — code is compiled **during** execution, not ahead of time. Frequently executed code is optimized into machine code at runtime | Modern JavaScript |

> Modern JavaScript is **NOT** purely interpreted. JS engines like **V8** (Chrome/Node.js), **SpiderMonkey** (Firefox), and **JavaScriptCore** (Safari) use **Just-In-Time (JIT) compilation** for performance.

---

## How JavaScript Engine Works

When JavaScript code runs, the engine processes it in the following steps:

```
Step 1: Parsing
  Source Code → Tokenizer → Tokens → Parser → Abstract Syntax Tree (AST)

Step 2: Compilation
  AST → Compiler → Bytecode (low-level representation)

Step 3: Execution
  Bytecode → Interpreter executes it
           → JIT Compiler optimizes hot (frequently executed) code into Machine Code

Step 4: Optimization
  JIT monitors execution → re-compiles hot functions into optimized machine code
                         → de-optimizes if assumptions fail
```

```
┌─────────────────────────────────────────────────────┐
│                   JavaScript Engine (V8)            │
│                                                     │
│   Source Code                                       │
│       │                                             │
│       ▼                                             │
│   ┌────────┐    ┌─────────┐    ┌──────────────┐    │
│   │ Parser │───▶│   AST   │───▶│   Compiler   │    │
│   └────────┘    └─────────┘    └──────┬───────┘    │
│                                       │             │
│                                       ▼             │
│                                 ┌──────────┐        │
│                                 │ Bytecode │        │
│                                 └────┬─────┘        │
│                                      │              │
│                          ┌───────────┼──────────┐   │
│                          ▼                      ▼   │
│                   ┌─────────────┐    ┌──────────┐   │
│                   │ Interpreter │    │   JIT    │   │
│                   │ (Ignition)  │    │ Compiler │   │
│                   └─────────────┘    │(TurboFan)│   │
│                                      └──────────┘   │
│                                                     │
│             ┌──────────┐    ┌──────────┐            │
│             │Call Stack │    │   Heap   │            │
│             │ (Memory)  │    │ (Memory) │            │
│             └──────────┘    └──────────┘            │
└─────────────────────────────────────────────────────┘
```

After compilation, JavaScript creates the **GEC** (Global Execution Context) and pushes it into the **Call Stack**, then executes the code line by line.

---

## Browser Runtime Architecture

The browser provides much more than just the JS engine. Here's how all the pieces fit together:

```
┌──────────────────────────────────────────────────────────────────┐
│                          BROWSER                                 │
│                                                                  │
│  ┌────────────────────────────┐    ┌──────────────────────────┐  │
│  │     JavaScript Engine      │    │        Web APIs           │  │
│  │                            │    │  (Provided by Browser)    │  │
│  │  ┌──────────────────────┐  │    │                          │  │
│  │  │     Call Stack        │  │    │  • setTimeout / setInt.  │  │
│  │  │                       │  │    │  • DOM API               │  │
│  │  │  ┌─────────────────┐  │  │    │  • fetch / XMLHttpReq.   │  │
│  │  │  │   func_b()      │  │  │    │  • console              │  │
│  │  │  ├─────────────────┤  │  │    │  • Geolocation          │  │
│  │  │  │   func_a()      │  │  │    │  • localStorage         │  │
│  │  │  ├─────────────────┤  │  │    │  • History / Location   │  │
│  │  │  │     GEC         │  │  │    │                          │  │
│  │  │  └─────────────────┘  │  │    └───────────┬──────────────┘  │
│  │  └──────────────────────┘  │                  │               │
│  │                            │                  │               │
│  │  ┌──────────┐ ┌────────┐  │     callback     │               │
│  │  │   Heap   │ │ Memory │  │    completes      │               │
│  │  └──────────┘ └────────┘  │                  │               │
│  └────────────────────────────┘                  │               │
│                                                  ▼               │
│  ┌───────────────────────────────────────────────────────────┐   │
│  │               Microtask Queue (Higher Priority)           │   │
│  │  [ Promise.then() , MutationObserver, queueMicrotask() ] │   │
│  └──────────────────────────────┬────────────────────────────┘   │
│                                 │                                │
│  ┌──────────────────────────────┼────────────────────────────┐   │
│  │          Callback Queue (Macrotask / Task Queue)          │   │
│  │  [ setTimeout cb, setInterval cb, DOM events, I/O ]       │   │
│  └──────────────────────────────┬────────────────────────────┘   │
│                                 │                                │
│  ┌──────────────────────────────▼────────────────────────────┐   │
│  │                       EVENT LOOP                          │   │
│  │                                                           │   │
│  │  Continuously checks:                                     │   │
│  │  1. Is call stack empty?                                  │   │
│  │  2. Yes → Pick ALL tasks from Microtask Queue first       │   │
│  │  3. Then pick ONE task from Callback Queue                │   │
│  │  4. Push it into the Call Stack for execution             │   │
│  │  5. Repeat                                                │   │
│  └───────────────────────────────────────────────────────────┘   │
└──────────────────────────────────────────────────────────────────┘
```

---

## Web APIs

Web APIs are **NOT** part of JavaScript itself — they are provided by the **browser** (or by **C++ bindings** in Node.js).

| Environment | Provided By | Examples |
|-------------|-------------|---------|
| **Browser** | Browser Engine | `setTimeout`, `setInterval`, DOM API, `fetch`, `console`, `localStorage`, `location`, `history`, Geolocation |
| **Node.js** | C++ Bindings (libuv) | `setTimeout`, File System (`fs`), HTTP, Crypto, OS, Child Process |

> When JS calls `setTimeout(cb, 1000)`, it hands the timer to the **Web API**. JS does not wait — it continues executing the next line. After 1000ms, the Web API pushes the callback `cb` into the **Callback Queue**.

---

## Event Loop, Callback Queue & Microtask Queue

The **Event Loop** is the mechanism that coordinates the Call Stack, Microtask Queue, and Callback Queue.

### How It Works

1. JavaScript executes synchronous code — everything goes through the **Call Stack**
2. When an async operation is triggered (e.g., `setTimeout`, `fetch`), it's handed off to the **Web API**
3. Once the async operation completes, the callback is placed in a queue:
   - **Promises** (`.then`, `.catch`, `.finally`) → **Microtask Queue**
   - **setTimeout, DOM events, I/O** → **Callback Queue** (Macrotask Queue)
4. The **Event Loop** checks: is the Call Stack empty?
   - **Yes** → First, drain **ALL** microtasks from the Microtask Queue
   - Then, pick **ONE** task from the Callback Queue and push it to the Call Stack
5. Repeat

### Example

```js
console.log("Start");

setTimeout(function () {
  console.log("setTimeout");
}, 0);

Promise.resolve().then(function () {
  console.log("Promise");
});

console.log("End");
```

**Output:**

```
Start
End
Promise        ← Microtask Queue (higher priority)
setTimeout     ← Callback Queue (lower priority)
```

**Step-by-step:**

```
1. console.log("Start")      → Call Stack → prints "Start"
2. setTimeout(cb, 0)         → Handed to Web API → after 0ms → cb goes to Callback Queue
3. Promise.resolve().then()  → .then callback goes to Microtask Queue
4. console.log("End")        → Call Stack → prints "End"
5. Call Stack is empty        → Event Loop checks Microtask Queue first
6. Promise callback           → Call Stack → prints "Promise"
7. Microtask Queue empty      → Event Loop picks from Callback Queue
8. setTimeout callback        → Call Stack → prints "setTimeout"
```

> **Microtask Queue always has higher priority** than the Callback Queue. Even `setTimeout(cb, 0)` executes after all pending promises.

### Starvation

If microtasks keep adding more microtasks, the Callback Queue tasks will **never execute** — this is called **starvation**.

```js
// ⚠️ This will starve the callback queue
function recursive() {
  Promise.resolve().then(recursive);
}
recursive();
// setTimeout callbacks will never run!
```

---

## `this` Keyword

`this` is a special variable created for **every execution context**. Its value depends on **how** the function is called, not where it's defined.

### Rules for `this`

| How Function is Called | `this` Points To |
|----------------------|-----------------|
| **Method call** (`obj.method()`) | The object that owns the method |
| **Regular function call** (`func()`) | `undefined` (strict mode) / `window` (non-strict) |
| **Arrow function** | Inherits `this` from parent scope (**lexical this**) |
| **Event listener** | The DOM element the listener is attached to |
| **`new` keyword** | The newly created object |
| **`call`, `apply`, `bind`** | Whatever you explicitly pass |

### Method Call

```js
const jonas = {
  name: "Jonas",
  year: 1991,
  calcAge: function () {
    console.log(2026 - this.year);
    console.log(this);  // jonas object
  },
};

jonas.calcAge();  // 35 — 'this' points to jonas (the calling object)
```

### Regular Function Call

```js
const calcAge = function (birthYear) {
  console.log(2026 - birthYear);
  console.log(this);
};

calcAge(1991);
// Output: 35
// this → undefined (strict mode)
// this → window   (non-strict mode)
```

> In **non-strict mode**, when `this` is `undefined`, JavaScript replaces it with the global object (`window`). This behavior is called **This Substitution**.

### Arrow Function — Lexical `this`

Arrow functions do **NOT** get their own `this`. They inherit `this` from their **parent scope**.

```js
const jonas = {
  name: "Jonas",
  year: 1991,
  calcAge: function () {
    // Arrow function inside a method — inherits 'this' from calcAge
    const isMillenial = () => {
      console.log(this.year >= 1981 && this.year <= 1996);
    };
    isMillenial();  // true — 'this' is jonas (inherited from calcAge)
  },
};

jonas.calcAge();
```

### Arrow Function Pitfall — Do NOT Use as Methods

```js
const obj = {
  name: "Azkar",
  // ❌ Arrow function as method — 'this' is NOT obj, it's the parent scope (window/global)
  greet: () => {
    console.log(`Hello, ${this.name}`);
  },
};

obj.greet();  // Hello, undefined — 'this' is window, not obj
```

> Always use **regular functions** for object methods. Use **arrow functions** inside methods when you need the parent's `this`.

### `this` Inside `setTimeout`

```js
const jonas = {
  name: "Jonas",
  greet: function () {
    // ❌ Regular function — 'this' is undefined/window
    setTimeout(function () {
      console.log(`Hello, ${this.name}`);  // Hello, undefined
    }, 1000);

    // ✅ Arrow function — inherits 'this' from greet (which is jonas)
    setTimeout(() => {
      console.log(`Hello, ${this.name}`);  // Hello, Jonas
    }, 1000);
  },
};

jonas.greet();
```

### Important

> `this` does **NOT** point to the function itself, and also **NOT** to its variable environment. It is determined entirely by **how** the function is called.

---

## Memory Management — Stack & Heap

JavaScript has two types of memory for storing data:

| Memory | Stores | Characteristics |
|--------|--------|----------------|
| **Stack** | Primitives + References (addresses) | Fixed size, fast access, LIFO |
| **Heap** | Objects, Arrays, Functions | Dynamic size, slower access |

### Primitive Types — Stored in Stack

Primitive types: `Number`, `String`, `Boolean`, `null`, `undefined`, `Symbol`, `BigInt`

Each variable gets its **own copy** in the stack.

```js
let a = 10;
let b = a;   // b gets a COPY of a's value

b = 20;

console.log(a);  // 10 — unchanged
console.log(b);  // 20
```

```
Stack Memory:
┌──────────┬───────┐
│ Variable │ Value │
├──────────┼───────┤
│    a     │  10   │
│    b     │  20   │  ← separate copy, changing b doesn't affect a
└──────────┴───────┘
```

### Reference Types — Stored in Heap

Reference types: `Object`, `Array`, `Function`, `Date`, `RegExp`, etc.

The variable in the stack stores a **reference (address)** pointing to the actual object in the heap. Copying a reference means both variables point to the **same object**.

```js
let obj1 = { name: "Azkar", age: 25 };
let obj2 = obj1;   // obj2 gets a copy of the REFERENCE, not the object

obj2.age = 30;

console.log(obj1.age);  // 30 — CHANGED! Both point to the same object
console.log(obj2.age);  // 30
```

```
Stack Memory:                    Heap Memory:
┌──────────┬──────────┐         ┌──────────────────────────┐
│ Variable │ Address  │         │  Address: 0x001          │
├──────────┼──────────┤         │  { name: "Azkar",        │
│   obj1   │  0x001 ──┼────────▶│    age: 30 }             │
│   obj2   │  0x001 ──┼────────▶│                          │
└──────────┴──────────┘         └──────────────────────────┘

Both obj1 and obj2 point to the SAME object in heap!
```

### How to Create a True Copy (Shallow & Deep)

```js
const original = { name: "Azkar", age: 25, skills: ["JS", "Node"] };

// Shallow Copy — only the first level is copied
const shallow1 = { ...original };               // spread operator
const shallow2 = Object.assign({}, original);    // Object.assign

shallow1.name = "Changed";
console.log(original.name);  // "Azkar" ✅ — first level is independent

shallow1.skills.push("React");
console.log(original.skills);  // ["JS", "Node", "React"] ❌ — nested reference is shared!

// Deep Copy — everything is fully independent
const deep = JSON.parse(JSON.stringify(original));       // works for simple objects
const deep2 = structuredClone(original);                  // modern & recommended
```

| Method | Level | Handles Functions/Dates? |
|--------|-------|------------------------|
| Spread `{ ...obj }` | Shallow | N/A (first level only) |
| `Object.assign()` | Shallow | N/A (first level only) |
| `JSON.parse(JSON.stringify())` | Deep | ❌ Loses functions, Dates, undefined |
| `structuredClone()` | Deep | ✅ Handles most types (not functions) |

---

## Quick Reference

| Concept | Key Takeaway |
|---------|-------------|
| JS Engine | Parses → AST → Bytecode → JIT optimizes hot code to machine code |
| Web APIs | Not part of JS — provided by browser (`setTimeout`, DOM, `fetch`) or Node.js C++ bindings |
| Event Loop | Monitors Call Stack — drains Microtask Queue first, then picks one from Callback Queue |
| Microtask Queue | Promises, `queueMicrotask()`, MutationObserver — **higher priority** |
| Callback Queue | `setTimeout`, `setInterval`, DOM events — **lower priority** |
| `this` in method | Points to the calling object |
| `this` in regular function | `undefined` (strict) / `window` (non-strict) |
| `this` in arrow function | Inherited from parent scope (lexical `this`) |
| Primitives | Stored in Stack — copied by **value** |
| Reference Types | Stored in Heap — copied by **reference** (address) |

---

← [**Part 1**](JavaScript_Advanced_Part_1.md) &nbsp;&nbsp;|&nbsp;&nbsp; **Part 3** →
 
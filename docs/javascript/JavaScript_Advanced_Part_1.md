# JavaScript Advanced — Part 1

> Execution Context, Hoisting, Scope Chain, Closures & more.
> [For in-depth understanding of GEC, FEC and CallStack with Diagrams](https://www.freecodecamp.org/news/how-javascript-works-behind-the-scene-javascript-execution-context/)

---

## Table of Contents

- [Execution Context](#execution-context)
  - [Global Execution Context (GEC)](#global-execution-context-gec)
  - [Function Execution Context (FEC)](#function-execution-context-fec)
- [Hoisting](#hoisting)
- [Call Stack](#call-stack)
- [Window Object & `this` Keyword](#window-object--this-keyword)
- [Loosely Typed Language](#loosely-typed-language)
- [undefined vs not defined](#undefined-vs-not-defined)
- [Scope Chain & Lexical Environment](#scope-chain--lexical-environment)
- [let, const & Temporal Dead Zone](#let-const--temporal-dead-zone)
- [Block Scope & Shadowing](#block-scope--shadowing)
- [Closures](#closures)

---

## Execution Context

When JavaScript runs a program for the **first time**, it creates a **Global Execution Context (GEC)**. Every execution context has **two phases**:

| Phase | What Happens |
|-------|-------------|
| **1. Memory (Creation)** | JS scans the code — allocates memory for variables and functions (Hoisting) |
| **2. Code (Execution)** | JS executes the code line by line |

---

### Global Execution Context (GEC)

In the **Memory Phase**, JavaScript:

- Stores **variables** with the value `undefined`
- Stores **functions** with their **entire function body**
- Only variables and function declarations are stored — **not** loops, `console.log`, or any other logic

```js
console.log(age);  // undefined  (variable exists in memory but value is undefined)
console.log(greet);  // ƒ greet() { ... }  (full function body is stored)

var age = 25;

function greet() {
  console.log("Hello!");
}
```

In the **Code Phase**, JavaScript executes line by line. When it encounters a variable or function call, it looks into memory for the value.

---

### Function Execution Context (FEC)

When a **function is invoked**, JavaScript creates a new **Function Execution Context** inside the GEC. This FEC also goes through the same two phases — **Memory** and **Code**.

```js
var x = 10;

function double(n) {
  var result = n * 2;
  return result;
}

var output = double(x);
```

**Step-by-step:**

```
── GEC Memory Phase ──────────────────────
  x       → undefined
  double  → ƒ double(n) { ... }
  output  → undefined

── GEC Code Phase ────────────────────────
  x = 10
  double(x) is called → New FEC is created

    ── FEC Memory Phase ──────────────────
      n      → undefined
      result → undefined

    ── FEC Code Phase ────────────────────
      n = 10
      result = 20
      return result → FEC is destroyed

  output = 20
```

---

## Hoisting

Hoisting is the behavior where variable and function declarations are moved to the **top of their scope** during the memory phase — before the code executes.

```js
console.log(a);  // undefined
console.log(b);  // ReferenceError: Cannot access 'b' before initialization
console.log(c);  // ReferenceError: c is not defined

var a = 10;
let b = 20;
```

| Declaration | Hoisted? | Initial Value |
|-------------|----------|---------------|
| `var` | Yes | `undefined` |
| `let` | Yes (but in TDZ) | No access until assigned |
| `const` | Yes (but in TDZ) | No access until assigned |
| `function declaration` | Yes | Entire function body |
| Arrow / Expression function | Depends on `var`, `let`, `const` | Treated as variables |

> **Important:** Arrow functions and function expressions stored in variables follow variable hoisting rules — they are **not** hoisted with their body.

```js
sayHi();    // ✅ Works — function declaration is fully hoisted
sayHello(); // ❌ TypeError — sayHello is undefined (var hoisted, not the function)
sayBye();   // ❌ ReferenceError — cannot access before initialization (let)

function sayHi() {
  console.log("Hi");
}

var sayHello = function () {
  console.log("Hello");
};

const sayBye = () => {
  console.log("Bye");
};
```

> Always define **arrow functions** and **function expressions** at the top before calling them.

---

## Call Stack

JavaScript uses a **Call Stack** to manage execution contexts. It follows **LIFO** (Last In, First Out).

```
1. Program starts     → GEC is pushed to the stack
2. Function is called → FEC is pushed on top
3. Function returns   → FEC is popped off
4. Program ends       → GEC is popped off, program exits
```

**Example:**

```js
function first() {
  second();
  console.log("first");
}

function second() {
  console.log("second");
}

first();
```

```
Call Stack (bottom → top):

  [GEC]
  [GEC] → [first()]
  [GEC] → [first()] → [second()]    // second() executes
  [GEC] → [first()]                  // second() popped
  [GEC]                              // first() popped
  (empty)                            // GEC popped, program exits
```

When the last line of code is executed, JavaScript checks if there is anything in the call stack besides GEC. If not, GEC is also popped and the program exits.

---

## Window Object & `this` Keyword

When the GEC is created, JavaScript **automatically** creates:

1. **`window`** object (in browser) / **`global`** object (in Node.js)
2. **`this`** keyword — which points to the global object

> Even if the JavaScript file is **completely empty**, the GEC, `window` object, and `this` keyword are still created.

```js
// In Browser
console.log(this === window);  // true

// In Node.js
console.log(this === globalThis);  // true
```

Variables declared with `var` in the global scope are attached to the `window` object:

```js
var a = 10;
console.log(window.a);  // 10

let b = 20;
console.log(window.b);  // undefined — let is NOT attached to window
```

---

## Loosely Typed Language

JavaScript is a **loosely typed** (or weakly typed) language — variables are not bound to a specific data type.

```js
var x = 10;      // number
x = "hello";     // string — no error
x = true;        // boolean — still no error
```

---

## undefined vs not defined

These are **two different things** in JavaScript:

| Term | Meaning |
|------|---------|
| `undefined` | Variable exists in memory but **no value is assigned yet** (placeholder) |
| `not defined` | Variable **does not exist** in memory at all |

```js
var a;
console.log(a);  // undefined — declared but no value assigned
console.log(b);  // ReferenceError: b is not defined — never declared
```

> Setting `a = undefined` is valid syntax but **not a good practice**. Let JavaScript handle `undefined` itself.

---

## Scope Chain & Lexical Environment

**Scope** determines where variables and functions are accessible in the program.

**Lexical Environment** = Local Memory + Reference to Parent's Lexical Environment

```js
function outer() {
  var a = 10;

  function inner() {
    var b = 20;

    function deepInner() {
      console.log(a);  // 10 — found in outer's memory
      console.log(b);  // 20 — found in inner's memory
      console.log(c);  // ReferenceError: c is not defined
    }

    deepInner();
  }

  inner();
}

outer();
```

**How the Scope Chain works:**

```
deepInner() needs variable 'a'
  → Look in deepInner's local memory       ❌ Not found
  → Look in inner's memory (parent)        ❌ Not found
  → Look in outer's memory (grandparent)   ✅ Found (a = 10)
```

If the variable is **not found** even in the GEC memory → `ReferenceError: not defined`

> If a local variable has the **same name** as a parent variable, the **local one takes priority**.

```js
var x = "global";

function test() {
  var x = "local";
  console.log(x);  // "local" — local takes priority
}

test();
console.log(x);  // "global"
```

---

## let, const & Temporal Dead Zone

### let

- `let` variables are hoisted but stored in a **separate memory space** (not in the global/`window` object)
- They **cannot** be accessed before initialization — doing so throws a `ReferenceError`
- The time between hoisting and initialization is called the **Temporal Dead Zone (TDZ)**

```js
console.log(a);  // ReferenceError: Cannot access 'a' before initialization
let a = 10;      // TDZ ends here — 'a' is now accessible
```

```
── Temporal Dead Zone ──────────
  let a;           ← hoisted but uninitialized
  // any access to 'a' here throws ReferenceError
── TDZ Ends ────────────────────
  a = 10;          ← now accessible
```

### const

- Same behavior as `let` (block-scoped, TDZ applies)
- **Must** be initialized at the time of declaration
- **Cannot** be reassigned or redeclared

```js
const b;        // ❌ SyntaxError: Missing initializer in const declaration
const b = 30;   // ✅ Must assign a value immediately
b = 50;         // ❌ TypeError: Assignment to constant variable
```

### Error Types

| Error | When It Occurs | Example |
|-------|---------------|---------|
| **ReferenceError** | Accessing a variable that doesn't exist or is in TDZ | `console.log(x)` before `let x = 5` |
| **TypeError** | Performing invalid operation on a type | Reassigning a `const`, calling non-function |
| **SyntaxError** | Code structure is invalid — caught before execution | `const a;` or duplicate `let` declaration |

```js
// ReferenceError
console.log(a);   // ReferenceError: Cannot access 'a' before initialization
let a = 5;

// TypeError
const b = 10;
b = 20;            // TypeError: Assignment to constant variable

// SyntaxError
let c = 10;
let c = 20;        // SyntaxError: Identifier 'c' has already been declared
```

---

## Block Scope & Shadowing

### Block

A **block** is defined by curly braces `{}`. It groups multiple statements where JavaScript expects only one.

```js
// JavaScript accepts only ONE statement after if
if (true) console.log("single statement");

// To use multiple statements — wrap them in a block
if (true) {
  console.log("first");
  console.log("second");
}
```

### Block Scope

- `let` and `const` are **block-scoped** — accessible only inside the block `{}`
- `var` is **function-scoped** — ignores blocks and goes to the nearest function or global scope

```js
{
  var a = 10;
  let b = 20;
  const c = 30;
}

console.log(a);  // 10 — var is in global scope
console.log(b);  // ReferenceError — let is block-scoped
console.log(c);  // ReferenceError — const is block-scoped
```

### Shadowing

When a variable inside a block has the **same name** as one outside, the inner one **shadows** the outer one.

```js
var x = 100;

{
  var x = 200;   // shadows the outer x (same memory — var is not block-scoped)
  console.log(x);  // 200
}

console.log(x);  // 200 — outer x is also modified!
```

```js
let y = 100;

{
  let y = 200;   // shadows the outer y (different memory — let is block-scoped)
  console.log(y);  // 200
}

console.log(y);  // 100 — outer y is untouched
```

### Illegal Shadowing

You **cannot** shadow a `let` variable with a `var` in the same scope — it's illegal.

```js
let a = 10;

{
  var a = 20;  // ❌ SyntaxError: Identifier 'a' has already been declared
}
```

But shadowing `var` with `let` is perfectly valid:

```js
var a = 10;

{
  let a = 20;  // ✅ Valid
  console.log(a);  // 20
}
```

---

## Closures

A **closure** is a function bundled together with its **lexical environment**. The inner function remembers the variables of its outer function even after the outer function has returned.

```js
function outer() {
  var count = 0;

  function inner() {
    count++;
    console.log(count);
  }

  return inner;
}

var counter = outer();  // outer() is done, but...
counter();  // 1 — inner still remembers 'count'
counter();  // 2
counter();  // 3
```

> `inner` forms a **closure** with the variable `count` — it retains access to `count` even after `outer()` has finished executing and its execution context is destroyed.

### Closure with Example

```js
function greetMaker(greeting) {
  return function (name) {
    console.log(`${greeting}, ${name}!`);
  };
}

var sayHello = greetMaker("Hello");
sayHello("Azkar");   // Hello, Azkar!
sayHello("World");   // Hello, World!

var sayHi = greetMaker("Hi");
sayHi("Azkar");      // Hi, Azkar!
```

### Common Pitfall — `var` in Loops

```js
// ❌ Problem: var is function-scoped, all callbacks share the same 'i'
for (var i = 1; i <= 3; i++) {
  setTimeout(function () {
    console.log(i);
  }, i * 1000);
}
// Output: 4, 4, 4

// ✅ Fix 1: Use let (block-scoped — each iteration gets its own 'i')
for (let i = 1; i <= 3; i++) {
  setTimeout(function () {
    console.log(i);
  }, i * 1000);
}
// Output: 1, 2, 3

// ✅ Fix 2: Use closure with IIFE
for (var i = 1; i <= 3; i++) {
  (function (j) {
    setTimeout(function () {
      console.log(j);
    }, j * 1000);
  })(i);
}
// Output: 1, 2, 3
```

### Uses of Closures

| Use Case | Description |
|----------|-------------|
| **Module Design Pattern** | Encapsulate private variables and expose public methods |
| **Currying** | Transform a function with multiple args into a chain of single-arg functions |
| **Function like `once`** | Ensure a function runs only once |
| **Memoization** | Cache results of expensive function calls |
| **Maintaining state in async** | Preserve variable state across async operations |
| **setTimeout / setInterval** | Callbacks remember their surrounding variables |
| **Iterators** | Maintain internal state for `next()` calls |

---

## Quick Reference

| Concept | Key Takeaway |
|---------|-------------|
| Execution Context | Two phases — Memory (creation) & Code (execution) |
| Hoisting | `var` → `undefined`, functions → full body, `let`/`const` → TDZ |
| Call Stack | LIFO — GEC at bottom, FECs pushed/popped on function call/return |
| `window` / `this` | Created automatically with GEC, even for empty files |
| Scope Chain | Local → Parent → ... → GEC. First match wins |
| Temporal Dead Zone | Time between hoisting and initialization for `let`/`const` |
| Block Scope | `let`/`const` stay inside `{}`, `var` leaks out |
| Closures | Function + its lexical environment. Remembers outer variables |

---

**Next:** Part 2 →

# JavaScript Interview Questions — Part 1

> Comprehensive questions for **3–4 years experience** targeting top-level companies.

---

## Table of Contents

- [1. Variables & Scope](#1-variables--scope)
- [2. Data Types & Type Coercion](#2-data-types--type-coercion)
- [3. Functions](#3-functions)
- [4. Closures](#4-closures)
- [5. this Keyword](#5-this-keyword)
- [6. Prototypes & Inheritance](#6-prototypes--inheritance)
- [7. ES6+ Features](#7-es6-features)
- [8. Array Methods](#8-array-methods)
- [9. Object Methods](#9-object-methods)
- [10. Deep Copy vs Shallow Copy](#10-deep-copy-vs-shallow-copy)
- [11. Spread & Rest Operator](#11-spread--rest-operator)
- [12. Destructuring](#12-destructuring)
- [13. Map, Set, WeakMap, WeakSet](#13-map-set-weakmap-weakset)
- [14. Symbols](#14-symbols)
- [15. Generators & Iterators](#15-generators--iterators)
- [16. Proxy & Reflect](#16-proxy--reflect)
- [17. Short-Circuit & Nullish Coalescing](#17-short-circuit--nullish-coalescing)
- [18. Optional Chaining](#18-optional-chaining)
- [19. Tagged Template Literals](#19-tagged-template-literals)

---

## 1. Variables & Scope

### Q: What are the differences between `var`, `let`, and `const`?

| Feature | `var` | `let` | `const` |
|---------|-------|-------|---------|
| Scope | Function | Block | Block |
| Hoisting | Yes (initialized as `undefined`) | Yes (TDZ) | Yes (TDZ) |
| Re-declaration | Allowed | Not allowed | Not allowed |
| Re-assignment | Allowed | Allowed | Not allowed |
| Global object property | Yes (`window.x`) | No | No |

```js
var a = 1;
let b = 2;
const c = 3;

if (true) {
  var a = 10;   // same variable — function scoped
  let b = 20;   // new variable — block scoped
  // const c = 30; // new variable — block scoped
}

console.log(a); // 10
console.log(b); // 2
```

---

### Q: What is Hoisting?

JavaScript moves **declarations** (not initializations) to the top of their scope before execution.

```js
console.log(x); // undefined (var is hoisted)
var x = 5;

console.log(y); // ReferenceError (TDZ)
let y = 10;

greet(); // "Hello" (function declarations are fully hoisted)
function greet() { console.log("Hello"); }

sayHi(); // TypeError: sayHi is not a function
var sayHi = function() { console.log("Hi"); };
```

---

### Q: What is the Temporal Dead Zone (TDZ)?

The TDZ is the period between entering a scope and the point where `let`/`const` variables are declared. Accessing them during TDZ throws a `ReferenceError`.

```js
{
  // TDZ starts for `name`
  console.log(name); // ReferenceError
  let name = "Azkar"; // TDZ ends
  console.log(name); // "Azkar"
}
```

---

### Q: What are the different types of scope in JavaScript?

1. **Global Scope** — accessible everywhere
2. **Function Scope** — `var` lives here
3. **Block Scope** — `let`/`const` inside `{}`, `if`, `for`, etc.
4. **Module Scope** — variables in ES modules are scoped to that module

```js
var global = "I'm global";

function outer() {
  var funcScope = "I'm function scoped";

  if (true) {
    let blockScope = "I'm block scoped";
    console.log(blockScope); // ✅
  }
  // console.log(blockScope); // ❌ ReferenceError
}
```

---

### Q: What is the Scope Chain?

When a variable is accessed, JavaScript looks up the scope chain — from the current scope outward to the global scope — until it finds the variable or throws a `ReferenceError`.

```js
const a = "global";

function outer() {
  const b = "outer";

  function inner() {
    const c = "inner";
    console.log(a); // "global"  → found in global scope
    console.log(b); // "outer"   → found in outer scope
    console.log(c); // "inner"   → found in current scope
  }
  inner();
}
outer();
```

---

### Q: What is the difference between `var` in `for` loop vs `let`?

```js
// var — shares same variable across iterations
for (var i = 0; i < 3; i++) {
  setTimeout(() => console.log(i), 100);
}
// Output: 3, 3, 3

// let — creates new binding per iteration
for (let i = 0; i < 3; i++) {
  setTimeout(() => console.log(i), 100);
}
// Output: 0, 1, 2
```

---

## 2. Data Types & Type Coercion

### Q: What are the data types in JavaScript?

**Primitive types (7):**
| Type | Example |
|------|---------|
| `string` | `"hello"` |
| `number` | `42`, `3.14`, `NaN`, `Infinity` |
| `bigint` | `9007199254740991n` |
| `boolean` | `true`, `false` |
| `undefined` | `undefined` |
| `null` | `null` |
| `symbol` | `Symbol("id")` |

**Non-primitive (Reference):**
| Type | Example |
|------|---------|
| `object` | `{}`, `[]`, `new Date()`, `null` (bug) |
| `function` | `function() {}` |

---

### Q: What is the difference between Primitive and Reference types?

| Feature | Primitive | Reference |
|---------|-----------|-----------|
| Stored in | Stack | Heap (reference in stack) |
| Copy behavior | By value | By reference |
| Comparison | By value | By reference |
| Immutable | Yes | No |

```js
// Primitive — copy by value
let a = 10;
let b = a;
b = 20;
console.log(a); // 10 (unchanged)

// Reference — copy by reference
let obj1 = { name: "Azkar" };
let obj2 = obj1;
obj2.name = "Ali";
console.log(obj1.name); // "Ali" (changed!)
```

---

### Q: What is the `typeof` operator output for different values?

```js
typeof "hello"       // "string"
typeof 42            // "number"
typeof true          // "boolean"
typeof undefined     // "undefined"
typeof null          // "object"     ← known JS bug
typeof {}            // "object"
typeof []            // "object"     ← arrays are objects
typeof function(){}  // "function"
typeof Symbol("id")  // "symbol"
typeof 10n           // "bigint"
typeof NaN           // "number"     ← NaN is a number
```

---

### Q: What is the difference between `==` and `===`?

- `==` (Loose) — compares **values** after type coercion
- `===` (Strict) — compares **values AND types** with no coercion

```js
0 == false        // true  (false → 0)
0 === false       // false (different types)

"" == false       // true
"" === false      // false

null == undefined  // true  (special rule)
null === undefined // false

NaN == NaN         // false (NaN is not equal to anything)
NaN === NaN        // false
```

---

### Q: Explain Type Coercion with examples.

JavaScript automatically converts types when operators are used with mixed types.

```js
// String coercion (+ with string)
"5" + 3         // "53"    → number to string
"5" + true      // "5true"
"5" + null      // "5null"
"5" + undefined // "5undefined"

// Numeric coercion (-, *, /, %)
"5" - 3     // 2
"5" * "2"   // 10
true + 1    // 2
false + 1   // 1
null + 1    // 1  (null → 0)

// Boolean coercion
Boolean(0)          // false
Boolean("")         // false
Boolean(null)       // false
Boolean(undefined)  // false
Boolean(NaN)        // false
Boolean("0")        // true  ← non-empty string
Boolean([])         // true  ← empty array is truthy
Boolean({})         // true  ← empty object is truthy
```

---

### Q: What are falsy values in JavaScript?

There are exactly **8 falsy** values:

```js
false, 0, -0, 0n, "", null, undefined, NaN
```

Everything else is **truthy**, including `[]`, `{}`, `"0"`, `"false"`.

---

### Q: What is the difference between `null` and `undefined`?

| Feature | `null` | `undefined` |
|---------|--------|-------------|
| Meaning | Intentional empty value | Not yet assigned |
| Type | `object` (bug) | `undefined` |
| Default | Must be assigned | Default for uninitialized vars |
| Math | `Number(null) → 0` | `Number(undefined) → NaN` |

```js
let a;
console.log(a);        // undefined
let b = null;
console.log(b);        // null

null + 5;              // 5
undefined + 5;         // NaN
```

---

### Q: How to check if a value is `NaN`?

```js
// ❌ Wrong — NaN !== NaN
NaN === NaN;          // false

// ✅ Correct
Number.isNaN(NaN);    // true
Number.isNaN("hello"); // false (doesn't coerce)

// ⚠️ Legacy — coerces first
isNaN("hello");       // true (coerces to NaN, then checks)
isNaN("123");         // false
```

---

## 3. Functions

### Q: What are the different ways to define functions?

```js
// 1. Function Declaration (hoisted)
function greet() { return "Hello"; }

// 2. Function Expression (not hoisted)
const greet = function() { return "Hello"; };

// 3. Arrow Function
const greet = () => "Hello";

// 4. IIFE (Immediately Invoked Function Expression)
(function() { console.log("Runs immediately"); })();

// 5. Generator Function
function* gen() { yield 1; yield 2; }

// 6. Constructor Function
function Person(name) { this.name = name; }
```

---

### Q: What is the difference between Arrow Functions and Regular Functions?

| Feature | Regular Function | Arrow Function |
|---------|-----------------|----------------|
| `this` binding | Dynamic (caller) | Lexical (parent scope) |
| `arguments` object | Available | Not available |
| Use as constructor | Yes (`new`) | No |
| `prototype` property | Yes | No |
| Method in object | ✅ Recommended | ❌ Avoid |

```js
const obj = {
  name: "Azkar",
  // Regular — `this` refers to obj
  greet() {
    console.log(this.name); // "Azkar"
  },
  // Arrow — `this` refers to outer scope
  greetArrow: () => {
    console.log(this.name); // undefined
  }
};
```

---

### Q: What are Higher-Order Functions?

A function that **takes a function as an argument** or **returns a function**.

```js
// Takes function as argument
function operate(a, b, callback) {
  return callback(a, b);
}
operate(5, 3, (a, b) => a + b); // 8

// Returns a function
function multiplier(factor) {
  return (num) => num * factor;
}
const double = multiplier(2);
double(5); // 10
```

---

### Q: What are First-Class Functions?

Functions in JavaScript are **first-class citizens** — they can be:

```js
// Assigned to variables
const fn = function() { return "Hello"; };

// Passed as arguments
[1, 2, 3].map(n => n * 2);

// Returned from functions
function outer() { return function inner() {}; }

// Stored in data structures
const arr = [function() {}, function() {}];
```

---

### Q: What is an IIFE (Immediately Invoked Function Expression)?

A function that **runs as soon as it is defined**. Used to create private scope.

```js
(function() {
  var secret = "hidden";
  console.log("IIFE executed");
})();
// secret is not accessible here

// With arrow function
(() => {
  console.log("Arrow IIFE");
})();

// Named IIFE
(function init() {
  console.log("Initialization");
})();
```

---

### Q: What is a Pure Function?

A function that:
1. Always returns the **same output** for the same input
2. Has **no side effects** (doesn't modify external state)

```js
// ✅ Pure function
function add(a, b) { return a + b; }

// ❌ Impure — depends on external state
let tax = 0.18;
function calcPrice(price) { return price + price * tax; }

// ❌ Impure — modifies external state
let count = 0;
function increment() { count++; }
```

---

### Q: What is the `arguments` object?

A **array-like** object available inside regular functions (not arrow functions).

```js
function sum() {
  console.log(arguments);        // { 0: 1, 1: 2, 2: 3 }
  console.log(arguments.length); // 3

  // Convert to real array
  const args = Array.from(arguments);
  // or: const args = [...arguments];
  return args.reduce((a, b) => a + b, 0);
}

sum(1, 2, 3); // 6
```

---

### Q: What is a Callback function?

A function **passed as an argument** to another function, to be executed later.

```js
function fetchData(callback) {
  setTimeout(() => {
    const data = { id: 1, name: "Azkar" };
    callback(data);
  }, 1000);
}

fetchData((data) => {
  console.log(data); // { id: 1, name: "Azkar" }
});
```

**Callback Hell** — deeply nested callbacks:

```js
getUser(id, (user) => {
  getOrders(user.id, (orders) => {
    getDetails(orders[0].id, (details) => {
      // deeply nested — hard to read/maintain
    });
  });
});
```

> **Solution:** Use Promises or `async/await` (covered in Part 2).

---

## 4. Closures

### Q: What is a Closure?

A closure is a function that **remembers its outer scope** even after the outer function has returned.

```js
function outer() {
  let count = 0;
  return function inner() {
    count++;
    return count;
  };
}

const counter = outer();
console.log(counter()); // 1
console.log(counter()); // 2
console.log(counter()); // 3
// `count` is not accessible directly but `inner` remembers it
```

---

### Q: What are practical use cases of Closures?

**1. Data Privacy / Encapsulation:**

```js
function createBankAccount(initialBalance) {
  let balance = initialBalance;

  return {
    deposit(amount) { balance += amount; },
    withdraw(amount) { balance -= amount; },
    getBalance() { return balance; }
  };
}

const account = createBankAccount(1000);
account.deposit(500);
console.log(account.getBalance()); // 1500
// balance is not accessible directly
```

**2. Function Factory:**

```js
function createGreeter(greeting) {
  return function(name) {
    return `${greeting}, ${name}!`;
  };
}

const hello = createGreeter("Hello");
const hi = createGreeter("Hi");
console.log(hello("Azkar")); // "Hello, Azkar!"
console.log(hi("Ali"));      // "Hi, Ali!"
```

**3. Memoization:**

```js
function memoize(fn) {
  const cache = {};
  return function(...args) {
    const key = JSON.stringify(args);
    if (cache[key]) return cache[key];
    cache[key] = fn(...args);
    return cache[key];
  };
}

const expensiveAdd = memoize((a, b) => {
  console.log("Computing...");
  return a + b;
});

expensiveAdd(1, 2); // "Computing..." → 3
expensiveAdd(1, 2); // 3 (from cache, no log)
```

**4. setTimeout in Loop (Classic Question):**

```js
// Problem
for (var i = 0; i < 3; i++) {
  setTimeout(() => console.log(i), 100);
}
// Output: 3, 3, 3

// Fix with closure (IIFE)
for (var i = 0; i < 3; i++) {
  (function(j) {
    setTimeout(() => console.log(j), 100);
  })(i);
}
// Output: 0, 1, 2
```

---

### Q: What is the output?

```js
function createFunctions() {
  let functions = [];
  for (var i = 0; i < 3; i++) {
    functions.push(function() { return i; });
  }
  return functions;
}

const fns = createFunctions();
console.log(fns[0]()); // 3
console.log(fns[1]()); // 3
console.log(fns[2]()); // 3
// All return 3 because `var` is function-scoped, shared reference
```

**Fix:** Change `var` to `let` — block-scoped, new binding each iteration.

---

## 5. `this` Keyword

### Q: How does `this` work in different contexts?

```js
// 1. Global context
console.log(this); // window (browser) / global (Node) / undefined (strict mode)

// 2. Object method
const obj = {
  name: "Azkar",
  greet() { console.log(this.name); } // "Azkar"
};

// 3. Regular function
function show() { console.log(this); }
show(); // window (non-strict) / undefined (strict)

// 4. Arrow function — inherits from parent scope
const obj2 = {
  name: "Azkar",
  greet: () => { console.log(this.name); } // undefined (this = outer scope)
};

// 5. Event handler
button.addEventListener("click", function() {
  console.log(this); // the button element
});

// 6. Constructor function
function Person(name) {
  this.name = name; // `this` = newly created object
}
const p = new Person("Azkar");

// 7. Class
class User {
  constructor(name) { this.name = name; }
  greet() { console.log(this.name); }
}
```

---

### Q: What are `call()`, `apply()`, and `bind()`?

All three are used to **set the `this` context** of a function.

| Method | Invokes immediately? | Arguments |
|--------|---------------------|-----------|
| `call()` | Yes | Comma-separated |
| `apply()` | Yes | Array |
| `bind()` | No (returns new fn) | Comma-separated |

```js
function greet(greeting, punctuation) {
  console.log(`${greeting}, ${this.name}${punctuation}`);
}

const user = { name: "Azkar" };

// call — invoke with comma-separated args
greet.call(user, "Hello", "!");    // "Hello, Azkar!"

// apply — invoke with array of args
greet.apply(user, ["Hi", "."]);    // "Hi, Azkar."

// bind — returns a new function
const boundGreet = greet.bind(user, "Hey");
boundGreet("?");                   // "Hey, Azkar?"
```

---

### Q: What is the output?

```js
const obj = {
  name: "Azkar",
  getName: function() {
    return this.name;
  }
};

const getName = obj.getName;
console.log(getName()); // undefined — `this` is global/undefined
console.log(obj.getName()); // "Azkar" — `this` is obj

// Fix with bind
const boundGetName = obj.getName.bind(obj);
console.log(boundGetName()); // "Azkar"
```

---

### Q: Explain `this` in nested function vs arrow function.

```js
const obj = {
  name: "Azkar",
  greet() {
    // Regular nested function — loses `this`
    function inner() {
      console.log(this.name); // undefined
    }
    inner();

    // Arrow function — inherits `this` from greet()
    const innerArrow = () => {
      console.log(this.name); // "Azkar"
    };
    innerArrow();
  }
};
obj.greet();
```

---

## 6. Prototypes & Inheritance

### Q: What is the Prototype Chain?

Every object has an internal `[[Prototype]]` link. When accessing a property, JS walks up the chain until it finds it or reaches `null`.

```js
const obj = { name: "Azkar" };

console.log(obj.toString()); // found on Object.prototype
console.log(obj.hasOwnProperty("name")); // true

// Chain: obj → Object.prototype → null
```

---

### Q: What is the difference between `__proto__` and `prototype`?

| Feature | `__proto__` | `prototype` |
|---------|-------------|-------------|
| What | Internal link to parent prototype | Property on constructor functions |
| On | Every object | Only on functions |
| Purpose | Lookup chain | Blueprint for instances |

```js
function Person(name) {
  this.name = name;
}
Person.prototype.greet = function() {
  return `Hi, ${this.name}`;
};

const p = new Person("Azkar");
console.log(p.__proto__ === Person.prototype); // true
console.log(p.greet()); // "Hi, Azkar"
```

---

### Q: How does Prototypal Inheritance work?

```js
function Animal(name) {
  this.name = name;
}
Animal.prototype.speak = function() {
  return `${this.name} makes a sound`;
};

function Dog(name, breed) {
  Animal.call(this, name); // call parent constructor
  this.breed = breed;
}

// Set up inheritance
Dog.prototype = Object.create(Animal.prototype);
Dog.prototype.constructor = Dog;

Dog.prototype.bark = function() {
  return `${this.name} barks`;
};

const dog = new Dog("Rex", "Labrador");
console.log(dog.speak()); // "Rex makes a sound" (inherited)
console.log(dog.bark());  // "Rex barks"
```

---

### Q: How do ES6 Classes work? Are they different from prototypes?

Classes are **syntactic sugar** over prototypal inheritance.

```js
class Animal {
  constructor(name) {
    this.name = name;
  }
  speak() {
    return `${this.name} makes a sound`;
  }
}

class Dog extends Animal {
  constructor(name, breed) {
    super(name); // must call super() before `this`
    this.breed = breed;
  }
  bark() {
    return `${this.name} barks`;
  }
}

const dog = new Dog("Rex", "Lab");
console.log(dog instanceof Dog);    // true
console.log(dog instanceof Animal); // true
```

Under the hood, `Dog.prototype.__proto__ === Animal.prototype` is still true.

---

### Q: What is `Object.create()` and how is it used?

Creates a new object with the specified prototype.

```js
const personProto = {
  greet() {
    return `Hello, ${this.name}`;
  }
};

const user = Object.create(personProto);
user.name = "Azkar";
console.log(user.greet());  // "Hello, Azkar"
console.log(user.__proto__ === personProto); // true

// Create with no prototype
const bare = Object.create(null);
console.log(bare.toString); // undefined — no prototype chain
```

---

### Q: What are Static methods in a class?

Static methods belong to the **class itself**, not to instances.

```js
class MathUtils {
  static add(a, b) { return a + b; }
  static PI = 3.14159;
}

console.log(MathUtils.add(2, 3)); // 5
console.log(MathUtils.PI);        // 3.14159

const m = new MathUtils();
// m.add(2, 3); // TypeError: m.add is not a function
```

---

### Q: What are Private fields in a class?

```js
class User {
  #password;  // private field

  constructor(name, password) {
    this.name = name;
    this.#password = password;
  }

  #hashPassword() {   // private method
    return `hashed_${this.#password}`;
  }

  checkPassword(input) {
    return this.#hashPassword() === `hashed_${input}`;
  }
}

const user = new User("Azkar", "secret123");
console.log(user.name);      // "Azkar"
// console.log(user.#password); // SyntaxError
console.log(user.checkPassword("secret123")); // true
```

---

## 7. ES6+ Features

### Q: What is the difference between `for...in` and `for...of`?

| Feature | `for...in` | `for...of` |
|---------|-----------|-----------|
| Iterates over | **Keys** (enumerable properties) | **Values** (iterable objects) |
| Works on | Objects, Arrays | Arrays, Strings, Maps, Sets |

```js
const arr = ["a", "b", "c"];

for (let key in arr) console.log(key);   // "0", "1", "2" (indices)
for (let val of arr) console.log(val);   // "a", "b", "c" (values)

const obj = { x: 1, y: 2 };
for (let key in obj) console.log(key);   // "x", "y"
// for (let val of obj) {} // TypeError: obj is not iterable
```

---

### Q: What are Template Literals?

```js
const name = "Azkar";
const age = 25;

// String interpolation
console.log(`Hello, ${name}! Age: ${age}`);

// Multi-line strings
const html = `
  <div>
    <h1>${name}</h1>
    <p>Age: ${age}</p>
  </div>
`;

// Expressions inside
console.log(`Sum: ${2 + 3}`);       // "Sum: 5"
console.log(`Is adult: ${age >= 18 ? "Yes" : "No"}`);
```

---

### Q: What is the difference between `Object.freeze()` and `Object.seal()`?

| Feature | `Object.freeze()` | `Object.seal()` |
|---------|-------------------|-----------------|
| Add properties | ❌ No | ❌ No |
| Delete properties | ❌ No | ❌ No |
| Modify values | ❌ No | ✅ Yes |
| Deep freeze | ❌ No (shallow) | ❌ No (shallow) |

```js
// freeze — nothing can change
const frozen = Object.freeze({ name: "Azkar", age: 25 });
frozen.name = "Ali";     // silently fails (strict mode → TypeError)
frozen.email = "a@b.com"; // ignored
console.log(frozen);     // { name: "Azkar", age: 25 }

// seal — values can change, structure can't
const sealed = Object.seal({ name: "Azkar", age: 25 });
sealed.name = "Ali";      // ✅ works
sealed.email = "a@b.com"; // ❌ ignored
delete sealed.age;         // ❌ ignored
console.log(sealed);      // { name: "Ali", age: 25 }
```

---

## 8. Array Methods

### Q: Explain commonly used Array methods.

```js
const nums = [1, 2, 3, 4, 5];

// map — transforms each element, returns new array
nums.map(n => n * 2);           // [2, 4, 6, 8, 10]

// filter — returns elements that pass the test
nums.filter(n => n > 3);        // [4, 5]

// reduce — reduces to a single value
nums.reduce((acc, n) => acc + n, 0); // 15

// find — returns first matching element
nums.find(n => n > 3);          // 4

// findIndex — returns index of first match
nums.findIndex(n => n > 3);     // 3

// some — at least one passes
nums.some(n => n > 4);          // true

// every — all must pass
nums.every(n => n > 0);         // true

// includes — checks existence
nums.includes(3);               // true

// forEach — iterates (returns undefined)
nums.forEach(n => console.log(n));
```

---

### Q: What is the difference between `map()` and `forEach()`?

| Feature | `map()` | `forEach()` |
|---------|---------|-------------|
| Returns | New array | `undefined` |
| Chainable | Yes | No |
| Modifies original | No | No (but can via callback) |
| Use case | Transform data | Side effects (logging, etc.) |

```js
const arr = [1, 2, 3];

const doubled = arr.map(n => n * 2); // [2, 4, 6]
const result = arr.forEach(n => n * 2); // undefined
```

---

### Q: How do `flat()` and `flatMap()` work?

```js
// flat — flattens nested arrays
[1, [2, [3, [4]]]].flat();     // [1, 2, [3, [4]]]  (depth 1)
[1, [2, [3, [4]]]].flat(2);    // [1, 2, 3, [4]]    (depth 2)
[1, [2, [3, [4]]]].flat(Infinity); // [1, 2, 3, 4]  (all levels)

// flatMap — map + flat(1)
const sentences = ["hello world", "foo bar"];
sentences.flatMap(s => s.split(" "));
// ["hello", "world", "foo", "bar"]
```

---

### Q: How do `slice()` and `splice()` differ?

| Feature | `slice()` | `splice()` |
|---------|-----------|-----------|
| Modifies original | No | Yes |
| Returns | New array | Removed elements |
| Purpose | Extract portion | Add/remove elements |

```js
const arr = [1, 2, 3, 4, 5];

// slice(start, end) — non-destructive
arr.slice(1, 3);     // [2, 3]
console.log(arr);    // [1, 2, 3, 4, 5] (unchanged)

// splice(start, deleteCount, ...items) — destructive
arr.splice(1, 2, 10, 20); // returns [2, 3]
console.log(arr);          // [1, 10, 20, 4, 5]
```

---

### Q: Implement `Array.reduce()` from scratch (Polyfill).

```js
Array.prototype.myReduce = function(callback, initialValue) {
  let accumulator = initialValue;
  let startIndex = 0;

  if (accumulator === undefined) {
    if (this.length === 0) throw new TypeError("Reduce of empty array with no initial value");
    accumulator = this[0];
    startIndex = 1;
  }

  for (let i = startIndex; i < this.length; i++) {
    accumulator = callback(accumulator, this[i], i, this);
  }
  return accumulator;
};

[1, 2, 3].myReduce((acc, val) => acc + val, 0); // 6
```

---

## 9. Object Methods

### Q: Important Object static methods.

```js
const obj = { a: 1, b: 2, c: 3 };

// Keys, Values, Entries
Object.keys(obj);     // ["a", "b", "c"]
Object.values(obj);   // [1, 2, 3]
Object.entries(obj);  // [["a", 1], ["b", 2], ["c", 3]]

// From entries (reverse of entries)
Object.fromEntries([["a", 1], ["b", 2]]); // { a: 1, b: 2 }

// Assign — shallow merge
const target = { a: 1 };
Object.assign(target, { b: 2 }, { c: 3 });
console.log(target); // { a: 1, b: 2, c: 3 }

// hasOwnProperty — check own (not inherited) property
obj.hasOwnProperty("a");     // true
obj.hasOwnProperty("toString"); // false

// Object.is — strict comparison (handles NaN and ±0)
Object.is(NaN, NaN);   // true  (unlike ===)
Object.is(0, -0);      // false (unlike ===)
```

---

### Q: How to iterate over an object?

```js
const user = { name: "Azkar", age: 25, city: "Delhi" };

// 1. for...in
for (let key in user) {
  if (user.hasOwnProperty(key)) { // filter inherited properties
    console.log(`${key}: ${user[key]}`);
  }
}

// 2. Object.keys()
Object.keys(user).forEach(key => console.log(`${key}: ${user[key]}`));

// 3. Object.entries()
for (const [key, value] of Object.entries(user)) {
  console.log(`${key}: ${value}`);
}
```

---

## 10. Deep Copy vs Shallow Copy

### Q: What is the difference between Shallow Copy and Deep Copy?

| Feature | Shallow Copy | Deep Copy |
|---------|-------------|-----------|
| Nested objects | Shared reference | Independent copy |
| Top-level | Independent | Independent |

```js
const original = { name: "Azkar", address: { city: "Delhi" } };

// Shallow copy — nested objects are still shared
const shallow = { ...original };
shallow.address.city = "Mumbai";
console.log(original.address.city); // "Mumbai" ← affected!

// Deep copy — fully independent
const deep = structuredClone(original);
deep.address.city = "Kolkata";
console.log(original.address.city); // "Mumbai" ← not affected
```

---

### Q: What are the different ways to copy objects?

```js
const obj = { a: 1, b: { c: 2 } };

// Shallow copy methods
const copy1 = { ...obj };
const copy2 = Object.assign({}, obj);

// Deep copy methods
const deep1 = structuredClone(obj); // ✅ Best — modern, handles circular refs
const deep2 = JSON.parse(JSON.stringify(obj)); // ⚠️ Loses functions, Date, undefined, etc.
```

**`JSON.parse(JSON.stringify())` limitations:**

```js
const obj = {
  fn: () => "hello",     // ❌ lost
  date: new Date(),      // ❌ becomes string
  undef: undefined,      // ❌ lost
  regex: /test/g,        // ❌ becomes {}
  nan: NaN,              // ❌ becomes null
  infinity: Infinity,    // ❌ becomes null
};

const copy = JSON.parse(JSON.stringify(obj));
// { date: "2026-04-15T...", regex: {}, nan: null, infinity: null }
```

---

## 11. Spread & Rest Operator

### Q: What is the difference between Spread and Rest?

Both use `...` but serve opposite purposes.

```js
// REST — collects multiple elements into an array (in function params / destructuring)
function sum(...nums) { // rest
  return nums.reduce((a, b) => a + b, 0);
}
sum(1, 2, 3, 4); // 10

const [first, ...rest] = [1, 2, 3, 4];
// first = 1, rest = [2, 3, 4]

// SPREAD — expands array/object into individual elements
const arr = [1, 2, 3];
const newArr = [...arr, 4, 5]; // [1, 2, 3, 4, 5]

const obj = { a: 1 };
const newObj = { ...obj, b: 2 }; // { a: 1, b: 2 }
```

---

## 12. Destructuring

### Q: Explain Array and Object Destructuring.

```js
// Array destructuring
const [a, b, c] = [1, 2, 3];
const [first, , third] = [1, 2, 3]; // skip second
const [x = 10, y = 20] = [5];      // x=5, y=20 (default)

// Swap variables
let p = 1, q = 2;
[p, q] = [q, p]; // p=2, q=1

// Object destructuring
const { name, age } = { name: "Azkar", age: 25 };

// Rename
const { name: userName } = { name: "Azkar" }; // userName = "Azkar"

// Default values
const { role = "user" } = {};  // role = "user"

// Nested destructuring
const { address: { city } } = { address: { city: "Delhi" } };
console.log(city); // "Delhi"

// Function parameter destructuring
function greet({ name, age }) {
  console.log(`${name} is ${age}`);
}
greet({ name: "Azkar", age: 25 });
```

---

## 13. Map, Set, WeakMap, WeakSet

### Q: What are `Map` and `Set`? How are they different from plain Objects/Arrays?

**Map — key-value pairs (any type as key):**

```js
const map = new Map();
map.set("name", "Azkar");
map.set(1, "one");
map.set(true, "yes");

const objKey = { id: 1 };
map.set(objKey, "object as key");

console.log(map.get("name"));   // "Azkar"
console.log(map.get(objKey));   // "object as key"
console.log(map.size);          // 4
console.log(map.has("name"));   // true

map.delete("name");
map.forEach((val, key) => console.log(key, val));
```

| Feature | Object | Map |
|---------|--------|-----|
| Key types | String/Symbol only | Any type |
| Order | Not guaranteed | Insertion order |
| Size | `Object.keys().length` | `.size` |
| Iteration | Not directly iterable | `.forEach()`, `for...of` |
| Performance | Slower for frequent adds/deletes | Faster |

**Set — unique values only:**

```js
const set = new Set([1, 2, 3, 3, 2]);
console.log(set);      // Set { 1, 2, 3 }
console.log(set.size); // 3

set.add(4);
set.has(2);   // true
set.delete(1);

// Remove duplicates from array
const arr = [1, 2, 2, 3, 3, 3];
const unique = [...new Set(arr)]; // [1, 2, 3]
```

---

### Q: What are `WeakMap` and `WeakSet`?

They hold **weak references** — entries are garbage collected when the key object has no other references.

| Feature | Map/Set | WeakMap/WeakSet |
|---------|---------|-----------------|
| Keys | Any type | Objects only |
| Iterable | Yes | No |
| `.size` | Yes | No |
| Garbage collected | No | Yes |

```js
// WeakMap
let user = { name: "Azkar" };
const weakMap = new WeakMap();
weakMap.set(user, "metadata");
console.log(weakMap.get(user)); // "metadata"

user = null; // entry will be garbage collected

// Use case: store private data for DOM elements
const privateData = new WeakMap();
class Component {
  constructor(el) {
    privateData.set(el, { clicks: 0 });
  }
}
```

---

## 14. Symbols

### Q: What are Symbols and why are they used?

Symbols create **unique, immutable** identifiers — mainly used for object property keys that won't collide.

```js
const sym1 = Symbol("id");
const sym2 = Symbol("id");
console.log(sym1 === sym2); // false — always unique

// Use as object property key
const user = {
  name: "Azkar",
  [sym1]: 101
};

console.log(user[sym1]);        // 101
console.log(Object.keys(user)); // ["name"] — symbols are hidden
console.log(Object.getOwnPropertySymbols(user)); // [Symbol(id)]

// Global symbol registry
const globalSym = Symbol.for("app.id");
const sameSym = Symbol.for("app.id");
console.log(globalSym === sameSym); // true
```

---

### Q: What are Well-Known Symbols?

Built-in symbols used to customize object behavior.

```js
// Symbol.iterator — make object iterable
const range = {
  from: 1,
  to: 5,
  [Symbol.iterator]() {
    let current = this.from;
    const last = this.to;
    return {
      next() {
        return current <= last
          ? { value: current++, done: false }
          : { done: true };
      }
    };
  }
};

for (const num of range) console.log(num); // 1, 2, 3, 4, 5
```

---

## 15. Generators & Iterators

### Q: What are Generators?

Functions that can **pause and resume** execution using `yield`.

```js
function* idGenerator() {
  let id = 1;
  while (true) {
    yield id++;
  }
}

const gen = idGenerator();
console.log(gen.next()); // { value: 1, done: false }
console.log(gen.next()); // { value: 2, done: false }
console.log(gen.next()); // { value: 3, done: false }
```

---

### Q: Practical use of Generators.

```js
// Infinite sequence
function* fibonacci() {
  let a = 0, b = 1;
  while (true) {
    yield a;
    [a, b] = [b, a + b];
  }
}

const fib = fibonacci();
console.log(fib.next().value); // 0
console.log(fib.next().value); // 1
console.log(fib.next().value); // 1
console.log(fib.next().value); // 2
console.log(fib.next().value); // 3

// Take first n values
function* take(n, iterable) {
  let count = 0;
  for (const item of iterable) {
    if (count >= n) return;
    yield item;
    count++;
  }
}

console.log([...take(5, fibonacci())]); // [0, 1, 1, 2, 3]
```

---

## 16. Proxy & Reflect

### Q: What is a Proxy in JavaScript?

A Proxy wraps an object and lets you **intercept and customize** operations (get, set, delete, etc.).

```js
const user = { name: "Azkar", age: 25 };

const proxy = new Proxy(user, {
  get(target, prop) {
    return prop in target ? target[prop] : `Property "${prop}" not found`;
  },
  set(target, prop, value) {
    if (prop === "age" && typeof value !== "number") {
      throw new TypeError("Age must be a number");
    }
    target[prop] = value;
    return true;
  }
});

console.log(proxy.name);    // "Azkar"
console.log(proxy.email);   // 'Property "email" not found'
proxy.age = 30;             // ✅
// proxy.age = "thirty";    // ❌ TypeError
```

---

### Q: What is Reflect?

`Reflect` provides methods that mirror Proxy traps — useful for default behavior inside handlers.

```js
const handler = {
  get(target, prop, receiver) {
    console.log(`Accessing: ${prop}`);
    return Reflect.get(target, prop, receiver);
  },
  set(target, prop, value, receiver) {
    console.log(`Setting: ${prop} = ${value}`);
    return Reflect.set(target, prop, value, receiver);
  }
};

const obj = new Proxy({}, handler);
obj.name = "Azkar"; // "Setting: name = Azkar"
console.log(obj.name); // "Accessing: name" → "Azkar"
```

---

## 17. Short-Circuit & Nullish Coalescing

### Q: What is Short-Circuit Evaluation?

```js
// OR (||) — returns first truthy value
console.log(0 || "default");        // "default"
console.log("hello" || "default");  // "hello"

// AND (&&) — returns first falsy value
console.log(1 && 2 && 3);   // 3 (all truthy → last value)
console.log(0 && 2 && 3);   // 0 (first falsy)

// Common patterns
const name = user.name || "Guest";        // fallback for falsy
const isValid = data && data.isValid;     // safe access
```

---

### Q: What is Nullish Coalescing (`??`) and how is it different from `||`?

`??` returns the right-hand value **only if left is `null` or `undefined`**.

```js
// || treats 0, "", false as falsy → uses fallback
0 || "default"       // "default"
"" || "default"      // "default"
false || "default"   // "default"

// ?? only treats null/undefined as nullish
0 ?? "default"       // 0 ✅
"" ?? "default"      // "" ✅
false ?? "default"   // false ✅
null ?? "default"    // "default"
undefined ?? "default" // "default"
```

---

### Q: What is Nullish Assignment (`??=`)?

```js
let a = null;
let b = 0;
let c = "hello";

a ??= "default"; // a = "default" (was null)
b ??= "default"; // b = 0 (not null/undefined)
c ??= "default"; // c = "hello" (not null/undefined)
```

---

## 18. Optional Chaining

### Q: What is Optional Chaining (`?.`)?

Safely access deeply nested properties — returns `undefined` instead of throwing.

```js
const user = {
  name: "Azkar",
  address: {
    city: "Delhi"
  }
};

// Without optional chaining
const zip = user.address && user.address.zip; // undefined

// With optional chaining
const zip2 = user.address?.zip;         // undefined
const country = user.address?.country?.name; // undefined (no error)

// On methods
const len = user.getName?.();            // undefined (method doesn't exist)

// On arrays
const first = user.orders?.[0];          // undefined

// Combined with ??
const city = user.address?.city ?? "Unknown"; // "Delhi"
```

---

## 19. Tagged Template Literals

### Q: What are Tagged Template Literals?

A function called with a template literal — receives strings and values separately.

```js
function highlight(strings, ...values) {
  return strings.reduce((result, str, i) => {
    return result + str + (values[i] ? `<b>${values[i]}</b>` : "");
  }, "");
}

const name = "Azkar";
const role = "Developer";
const html = highlight`Hello, ${name}! You are a ${role}.`;
// "Hello, <b>Azkar</b>! You are a <b>Developer</b>."
```

---

> **Continue to [Part 2 →](JavaScript_Interview_Question_Part_2.md)** for Asynchronous JS, Event Loop, Promises, DOM Events, Design Patterns, Polyfills, Coding Challenges, and more.

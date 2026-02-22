# Basics of TypeScript

TypeScript is JavaScript with syntax for types. It is a superset of JavaScript that adds static typing.

To run TypeScript code in the browser, we need to compile it into JavaScript using the TypeScript compiler.

---

## Table of Contents

1. [Installation and Setup](#installation-and-setup)
2. [Type Basics](#type-basics)
3. [Type Any](#type-any)
4. [Type Union](#type-union)
5. [Type Arrays](#type-arrays)
6. [Type Tuples](#type-tuples)
7. [Type Object](#type-object)
8. [Type Enum](#type-enum)
9. [Type Literal](#type-literal)
10. [Type Aliases](#type-aliases)
11. [Functions](#functions)
12. [Void vs Never](#void-vs-never)
13. [Null and Undefined](#null-and-undefined)
14. [Type Unknown](#type-unknown)
15. [Configuration](#configuration)

---

## Installation and Setup

Install TypeScript globally via npm:

```sh
npm i -g typescript
```

### Compile a Single File

```sh
tsc calculator.ts
```

This generates a compiled `.js` file.

### Compile All Files in Project

```sh
tsc
```

Compiles all files based on `tsconfig.json` configuration.

### Initialize TypeScript Project

```sh
tsc --init
```

Creates a `tsconfig.json` configuration file.

### Watch Mode

```sh
tsc --watch
```

Automatically recompiles files when changes are detected.

---

## Type Basics

- TypeScript files use the `.ts` extension
- Running `tsc filename.ts` creates a compiled `.js` file

### Implicit Type (any)

When no type is assigned, TypeScript defaults to `any`:

```ts
let name;  // Type is 'any'
```

### Explicit Type Assignment

```ts
let userName: string;
let phone: number;
```

### Type Inference

TypeScript automatically infers types based on initial values:

```ts
let age = 25;       // Inferred as number
age = "hello";      // Error: Type 'string' is not assignable to type 'number'
```

### Function Parameters

```ts
function add(a: number, b = 5) {
    return a + b;
}

add(10);        // Valid
add("10");      // Error: Argument of type 'string' is not assignable
add(10, 6);     // Valid
add(10, '6');   // Error: Argument of type 'string' is not assignable
```

---

## Type Any

The `any` type accepts any kind of value. Using `any` defeats the purpose of TypeScript as it disables type checking.

```ts
let age: any = 30;
age = "30";    // Valid
age = [];      // Valid
age = {};      // Valid
```

---

## Type Union

Union types allow a variable to hold multiple types:

```ts
let age: string | number = 30;
age = "thirty";  // Valid
age = 30;        // Valid
```

---

## Type Arrays

### Inferred Array Type

```ts
let hobby = ["sports", "cooking"];  // Inferred as string[]
hobby.push(23);  // Error: Argument of type 'number' is not assignable
```

### Explicit Array Type

```ts
let cars: string[];
```

### Array with Multiple Types

```ts
let users: (string | number)[];
```

### Generic Array Syntax

```ts
let siteUser: Array<string | number>;
```

---

## Type Tuples

Tuples are arrays with a fixed length and specific types at each position:

```ts
let possibleResults: [number, number];

possibleResults = [1, -1];        // Valid
possibleResults = [25, "hello"];  // Error: Type 'string' is not assignable
possibleResults = [1, 2, 1];      // Error: Source has 3 elements but target allows only 2
```

---

## Type Object

### Inferred Object Type

```ts
const user = {
    name: "Azkar",
    age: 23
};
// Types inferred: name is string, age is number
```

### Explicit Object Type

```ts
const employee: {
    name: string;
    age: number | string;
    hobby: string[];
    salary: number;
    address: {
        city: string;
        zipCode: number;
    };
    role?: string;  // Optional property
} = {
    name: "Azkar",
    age: "25",
    hobby: ["music", "coding"],
    salary: 25000,
    address: {
        city: "Delhi",
        zipCode: 110031
    }
};
// Note: 'role' is optional, so it can be omitted
```

### Non-nullable Type

Using `{}` means any value except `null` or `undefined`:

```ts
let val: {} = "Any value except null or undefined";
```

### Record Type

`Record` ensures the variable must be an object:

```ts
let data: Record<string, any>;

data = "A string";  // Error
data = {
    name: "Azkar",
    age: 25
};  // Valid
```

---

## Type Enum

Enums define a set of named constants:

```ts
enum Role {
    Admin,   // Value: 0
    Editor,  // Value: 1
    Guest    // Value: 2
}

let userRole: Role;

userRole = Role.Admin;
console.log(userRole);  // Output: 0

userRole = 1;  // Valid (equals Role.Editor)
```

---

## Type Literal

Literal types restrict a variable to specific exact values:

### Single Literal

```ts
let userType: "admin";  // Can only store "admin"
```

### Union with Literals

```ts
let userType: "admin" | "superAdmin" | "editor";
```

### Literals in Tuples

```ts
let possibleResult: [1, 2, 3 | 4 | 5, string, "azkar"];

// Index 0: always 1
// Index 1: always 2
// Index 2: can be 3, 4, or 5
// Index 3: any valid string
// Index 4: always "azkar"
```

---

## Type Aliases

Type aliases create custom reusable types:

```ts
type Name = string;
type Role = "admin" | "editor" | "guest" | "reader";

type User = {
    name: Name;
    age: number | string;
    role: Role;
    address?: string;  // Optional
};
```

---

## Functions

### Return Type

```ts
function convertToNumber(num: string): number {
    return +num;
}
```

If no return type is specified, TypeScript infers it from the return value.

### Function Type

TypeScript has a built-in `Function` type:

```ts
function someCalculation(cb: Function) {
    // function body
    cb();
}
```

### Precise Function Type

Define exact parameter and return types:

```ts
type CallbackType = (num: number) => string;

const callbackFunction: CallbackType = (a: number) => {
    return String(a);
};

function someCalculation(cb: CallbackType, optionalArgs?: string) {
    const stringValue = cb(123);
}

// Second argument is optional; if omitted, it will be undefined
someCalculation(callbackFunction);
```

---

## Void vs Never

### Void

The function does not return anything:

```ts
function logMessage(msg: string): void {
    console.log(msg);
}
```

If a function has no return statement, TypeScript infers `void` automatically.

### Never

The function never completes execution (e.g., throws an error or runs infinitely):

```ts
function throwError(message: string): never {
    throw new Error(message);
}
```

Note: Both `void` and `never` can only be used with functions.

---

## Null and Undefined

These are special types in TypeScript:

### Null Type

```ts
let a: null;             // Can only store null
let b: null = null;      // Valid
let c: null = "a";       // Error
```

### Undefined Type

```ts
let x: undefined;                // Can only store undefined
let y: undefined = undefined;    // Valid
let z: undefined = 123;          // Error
```

### Union with Null

```ts
const name: string | null = null;  // Can be string or null
```

---

## Type Unknown

The `unknown` type is a safer alternative to `any`. You must check the type before using it:

```ts
function processData(user: any, car: unknown) {
    // 'any' allows direct access without type checking
    console.log(user.name);  // No error

    // 'unknown' requires type checking before access
    console.log(car.color);  // Error: Object is of type 'unknown'

    // Type guard required
    if (typeof car === "object" && car !== null && "color" in car) {
        console.log(car.color);  // Valid
    }
}
```

Key difference: `any` disables type checking entirely, while `unknown` requires type validation before use.

---

## Configuration

Initialize TypeScript configuration:

```sh
tsc --init
```

This creates a `tsconfig.json` file with various options:

```json
{
    "compilerOptions": {
        "target": "ES2022"
    }
}
```

| Option | Description |
|--------|-------------|
| `target` | Specifies the JavaScript version for output |

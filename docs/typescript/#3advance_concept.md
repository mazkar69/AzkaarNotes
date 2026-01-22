# Advanced TypeScript Concepts

This document covers advanced TypeScript features for building type-safe applications.

---

## Table of Contents

1. [Intersection Types](#intersection-types)
2. [Type Guards](#type-guards)
3. [Discriminated Unions](#discriminated-unions)
4. [Function Overloads](#function-overloads)
5. [Index Types](#index-types)
6. [Const Assertion](#const-assertion)
7. [Satisfies Keyword](#satisfies-keyword)
8. [Generic Types](#generic-types)

---

## Intersection Types

Intersection types combine multiple types into one using the `&` operator. The resulting type has all properties from all combined types.

### Example

```ts
type FileData = {
    path: string;
    content: string;
};

type Status = {
    isOpen: boolean;
    errorMessage: string;
};

type DatabaseData = {
    connectionURL: string;
    credentials: string;
};

// Intersection types: combines all properties
type AccessFileData = FileData & Status;
type AccessDatabaseData = DatabaseData & Status;

// AccessFileData has: path, content, isOpen, errorMessage
const file: AccessFileData = {
    path: "/home/user/file.txt",
    content: "Hello World",
    isOpen: true,
    errorMessage: ""
};

// AccessDatabaseData has: connectionURL, credentials, isOpen, errorMessage
const db: AccessDatabaseData = {
    connectionURL: "mongodb://localhost:27017",
    credentials: "admin:password",
    isOpen: false,
    errorMessage: "Connection failed"
};
```

---

## Type Guards

Type guards are techniques to narrow down the type of a variable within a conditional block. They help TypeScript understand which type you're working with.

### Using typeof

```ts
function processValue(value: string | number) {
    if (typeof value === "string") {
        // TypeScript knows value is string here
        console.log(value.toUpperCase());
    } else {
        // TypeScript knows value is number here
        console.log(value.toFixed(2));
    }
}

processValue("hello");  // Output: HELLO
processValue(42.5);     // Output: 42.50
```

### Using instanceof

The `instanceof` operator checks if an object is an instance of a class:

```ts
class Dog {
    bark() {
        console.log("Woof!");
    }
}

class Cat {
    meow() {
        console.log("Meow!");
    }
}

function makeSound(animal: Dog | Cat) {
    if (animal instanceof Dog) {
        animal.bark();  // TypeScript knows it's a Dog
    } else {
        animal.meow();  // TypeScript knows it's a Cat
    }
}

makeSound(new Dog());  // Output: Woof!
makeSound(new Cat());  // Output: Meow!
```

### Using in Operator

Check if a property exists in an object:

```ts
type Fish = { swim: () => void };
type Bird = { fly: () => void };

function move(animal: Fish | Bird) {
    if ("swim" in animal) {
        animal.swim();  // TypeScript knows it's a Fish
    } else {
        animal.fly();   // TypeScript knows it's a Bird
    }
}
```

### Custom Type Guard Function

Create reusable type guard functions using `is` keyword:

```ts
type User = { name: string; email: string };
type Admin = { name: string; email: string; permissions: string[] };

// Custom type guard
function isAdmin(user: User | Admin): user is Admin {
    return "permissions" in user;
}

function showUserInfo(user: User | Admin) {
    console.log(user.name);
    
    if (isAdmin(user)) {
        console.log("Permissions:", user.permissions);
    }
}
```

---

## Discriminated Unions

Discriminated unions use a common property (discriminant) to distinguish between different types. This makes type narrowing easier and safer.

### Example

```ts
type SuccessResponse = {
    status: "success";  // Discriminant property
    data: string;
};

type ErrorResponse = {
    status: "error";    // Discriminant property
    message: string;
};

type ApiResponse = SuccessResponse | ErrorResponse;

function handleResponse(response: ApiResponse) {
    switch (response.status) {
        case "success":
            // TypeScript knows this is SuccessResponse
            console.log("Data:", response.data);
            break;
        case "error":
            // TypeScript knows this is ErrorResponse
            console.log("Error:", response.message);
            break;
    }
}

handleResponse({ status: "success", data: "User created" });
handleResponse({ status: "error", message: "Invalid email" });
```

### Real-World Example: Shape Area

```ts
type Circle = {
    kind: "circle";
    radius: number;
};

type Rectangle = {
    kind: "rectangle";
    width: number;
    height: number;
};

type Square = {
    kind: "square";
    side: number;
};

type Shape = Circle | Rectangle | Square;

function calculateArea(shape: Shape): number {
    switch (shape.kind) {
        case "circle":
            return Math.PI * shape.radius ** 2;
        case "rectangle":
            return shape.width * shape.height;
        case "square":
            return shape.side ** 2;
    }
}

console.log(calculateArea({ kind: "circle", radius: 5 }));      // Output: 78.54
console.log(calculateArea({ kind: "rectangle", width: 4, height: 6 })); // Output: 24
console.log(calculateArea({ kind: "square", side: 4 }));        // Output: 16
```

---

## Function Overloads

Function overloads allow you to define multiple function signatures for the same function. This helps TypeScript understand different input/output combinations.

### Problem Without Overloads

```ts
function combine(a: string | number, b: string | number): string | number {
    if (typeof a === "string" && typeof b === "string") {
        return a + b;
    }
    return Number(a) + Number(b);
}

const result = combine("Hello", "World");
// result is string | number, but we know it's actually string
```

### Solution With Overloads

```ts
// Overload signatures
function combine(a: string, b: string): string;
function combine(a: number, b: number): number;

// Implementation signature
function combine(a: string | number, b: string | number): string | number {
    if (typeof a === "string" && typeof b === "string") {
        return a + b;
    }
    return Number(a) + Number(b);
}

const str = combine("Hello", "World");  // Type: string
const num = combine(10, 20);            // Type: number

console.log(str);  // Output: HelloWorld
console.log(num);  // Output: 30
```

### Another Example

```ts
// Overload signatures
function getValue(key: "name"): string;
function getValue(key: "age"): number;
function getValue(key: "active"): boolean;

// Implementation
function getValue(key: string): string | number | boolean {
    const data: Record<string, string | number | boolean> = {
        name: "Azkar",
        age: 25,
        active: true
    };
    return data[key];
}

const name = getValue("name");    // Type: string
const age = getValue("age");      // Type: number
const active = getValue("active"); // Type: boolean
```

---

## Index Types

Index types allow you to define objects with dynamic keys. The key and value types are specified using index signatures.

### Basic Index Type

```ts
type DataStore = {
    [key: string]: string;
};

const store: DataStore = {
    name: "Azkar",
    city: "Delhi",
    country: "India"
    // All keys must be strings, all values must be strings
};
```

### Mixed Index Type

```ts
type FlexibleStore = {
    [key: string]: string | number;
};

const data: FlexibleStore = {
    name: "Azkar",
    age: 25,
    score: 98.5
};
```

### Index Type with Required Properties

```ts
type UserStore = {
    id: number;                    // Required property
    [key: string]: string | number; // Dynamic properties
};

const user: UserStore = {
    id: 1,              // Required
    name: "Azkar",      // Dynamic
    age: 25             // Dynamic
};
```

### Keyof Operator

The `keyof` operator extracts keys from a type:

```ts
type User = {
    name: string;
    age: number;
    email: string;
};

type UserKeys = keyof User;  // "name" | "age" | "email"

function getProperty(user: User, key: keyof User) {
    return user[key];
}

const user: User = { name: "Azkar", age: 25, email: "azkar@email.com" };

console.log(getProperty(user, "name"));   // Output: Azkar
console.log(getProperty(user, "age"));    // Output: 25
// getProperty(user, "invalid");          // Error: not a valid key
```

---

## Const Assertion

The `as const` assertion makes values readonly and preserves literal types instead of widening them.

### Without as const

```ts
let roles = ["admin", "guest", "editor"];
// Type: string[]

roles.push("viewer");  // Allowed
const firstRole = roles[0];  // Type: string
```

### With as const

```ts
let roles = ["admin", "guest", "editor"] as const;
// Type: readonly ["admin", "guest", "editor"]

roles.push("viewer");  // Error: cannot modify readonly array
const firstRole = roles[0];  // Type: "admin" (literal type)
```

### Object with as const

```ts
const config = {
    apiUrl: "https://api.example.com",
    timeout: 5000,
    retries: 3
} as const;

// All properties are readonly with literal types
// config.apiUrl is type "https://api.example.com", not string
// config.timeout is type 5000, not number

config.timeout = 10000;  // Error: cannot assign to readonly property
```

### Use Case: Enum-like Constants

```ts
const STATUS = {
    PENDING: "pending",
    APPROVED: "approved",
    REJECTED: "rejected"
} as const;

type StatusType = typeof STATUS[keyof typeof STATUS];
// Type: "pending" | "approved" | "rejected"

function updateStatus(status: StatusType) {
    console.log("Status updated to:", status);
}

updateStatus(STATUS.APPROVED);  // Valid
updateStatus("pending");        // Valid
updateStatus("invalid");        // Error
```

---

## Satisfies Keyword

The `satisfies` keyword (TypeScript 4.9+) validates that a value matches a type while preserving the most specific type possible.

### Problem Without satisfies

```ts
type Colors = Record<string, string | number[]>;

const palette: Colors = {
    red: "#ff0000",
    green: [0, 255, 0],
    blue: "#0000ff"
};

// TypeScript doesn't know if red is string or number[]
palette.red.toUpperCase();  // Error: might be number[]
```

### Solution With satisfies

```ts
type Colors = Record<string, string | number[]>;

const palette = {
    red: "#ff0000",
    green: [0, 255, 0],
    blue: "#0000ff"
} satisfies Colors;

// TypeScript knows the exact types
palette.red.toUpperCase();     // Valid: TypeScript knows it's string
palette.green.map(n => n * 2); // Valid: TypeScript knows it's number[]
```

### Validating Configuration

```ts
type Config = {
    port: number;
    host: string;
    debug?: boolean;
};

const serverConfig = {
    port: 3000,
    host: "localhost",
    debug: true
} satisfies Config;

// Catches errors while keeping literal types
const invalidConfig = {
    port: "3000",  // Error: should be number
    host: "localhost"
} satisfies Config;
```

---

## Generic Types

Generics allow you to create reusable components that work with multiple types while maintaining type safety.

### Generic Array

```ts
const cars: Array<string> = ["alto", "ertiga", "i10", "swift"];
cars.push(123);  // Error: number is not assignable to string

const numbers: Array<number> = [1, 2, 3, 4, 5];
```

### Generic Type Alias

```ts
type DataStore<T> = {
    [key: string]: T;
};

// String values only
const stringStore: DataStore<string> = {
    name: "Azkar",
    city: "Delhi"
};

// Number values only
const numberStore: DataStore<number> = {
    age: 25,
    score: 98
};

// Object values
type User = { name: string; age: number };
const userStore: DataStore<User> = {
    user1: { name: "Azkar", age: 25 },
    user2: { name: "Max", age: 30 }
};
```

### Generic Functions

```ts
// Without generics: returns any
function mergeAny(a: any, b: any) {
    return [a, b];  // Type: any[]
}

// With generics: preserves types
function merge<T>(a: T, b: T): T[] {
    return [a, b];
}

const numbers = merge<number>(1, 2);      // Type: number[]
const strings = merge<string>("a", "b");  // Type: string[]

// TypeScript can infer the type
const inferred = merge(10, 20);  // Type: number[]
```

### Multiple Type Parameters

```ts
function pair<T, U>(first: T, second: U): [T, U] {
    return [first, second];
}

const result1 = pair<string, number>("age", 25);  // Type: [string, number]
const result2 = pair("name", "Azkar");            // Type: [string, string]
const result3 = pair(1, true);                    // Type: [number, boolean]
```

### Generic Constraints

Limit what types can be used with generics using `extends`:

```ts
// T must have a length property
function logLength<T extends { length: number }>(item: T): void {
    console.log(item.length);
}

logLength("Hello");       // Valid: string has length
logLength([1, 2, 3]);     // Valid: array has length
logLength({ length: 10 }); // Valid: object has length
logLength(123);           // Error: number doesn't have length
```

### Generic Interfaces

```ts
interface ApiResponse<T> {
    data: T;
    status: number;
    message: string;
}

type User = { id: number; name: string };
type Product = { id: number; title: string; price: number };

const userResponse: ApiResponse<User> = {
    data: { id: 1, name: "Azkar" },
    status: 200,
    message: "Success"
};

const productResponse: ApiResponse<Product> = {
    data: { id: 1, title: "Laptop", price: 999 },
    status: 200,
    message: "Success"
};
```

### Generic Classes

```ts
class DataCollection<T> {
    private items: T[] = [];

    add(item: T): void {
        this.items.push(item);
    }

    remove(item: T): void {
        const index = this.items.indexOf(item);
        if (index > -1) {
            this.items.splice(index, 1);
        }
    }

    getAll(): T[] {
        return [...this.items];
    }
}

// String collection
const names = new DataCollection<string>();
names.add("Azkar");
names.add("Max");
console.log(names.getAll());  // Output: ["Azkar", "Max"]

// Number collection
const scores = new DataCollection<number>();
scores.add(95);
scores.add(87);
console.log(scores.getAll());  // Output: [95, 87]
```

### Default Generic Type

```ts
interface Container<T = string> {
    value: T;
}

const stringContainer: Container = { value: "Hello" };        // Uses default: string
const numberContainer: Container<number> = { value: 42 };     // Explicit: number
```

---

## Summary

| Concept | Purpose |
|---------|---------|
| Intersection Types | Combine multiple types into one |
| Type Guards | Narrow down types in conditional blocks |
| Discriminated Unions | Use common property to distinguish types |
| Function Overloads | Multiple signatures for one function |
| Index Types | Objects with dynamic keys |
| Const Assertion | Make values readonly with literal types |
| Satisfies | Validate type while preserving specific type |
| Generics | Create reusable, type-safe components |


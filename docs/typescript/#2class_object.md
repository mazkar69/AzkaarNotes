# Classes and Interfaces in TypeScript

Classes are a JavaScript feature. TypeScript enhances them with type annotations and additional modifiers.

---

## Table of Contents

1. [Creating a Class](#creating-a-class)
2. [Access Modifiers](#access-modifiers)
3. [Readonly Properties](#readonly-properties)
4. [Getters and Setters](#getters-and-setters)
5. [Static Properties](#static-properties)
6. [Inheritance](#inheritance)
7. [Abstract Classes](#abstract-classes)
8. [Interfaces](#interfaces)

---

## Creating a Class

### Basic Class Structure

```ts
class User {
    public hobbies: string[] = [];
    public name: string;

    constructor(name: string) {
        this.name = name;
    }
}

const user = new User("Azkar");
```

### Shorthand Constructor (TypeScript Feature)

TypeScript allows defining properties directly in the constructor parameters:

```ts
class User {
    constructor(public name: string, public age: number) {}
}

const max = new User("Max", 36);
console.log(max.name);  // Output: Max
console.log(max.age);   // Output: 36
```

---

## Access Modifiers

| Modifier | Description |
|----------|-------------|
| `public` | Accessible from anywhere (default) |
| `private` | Accessible only inside the class |
| `protected` | Accessible inside the class and inherited classes |

### Example

```ts
class User {
    public name: string;      // Accessible everywhere
    private password: string; // Only inside this class
    protected role: string;   // Inside this class and child classes

    constructor(name: string, password: string) {
        this.name = name;
        this.password = password;
        this.role = "user";
    }

    private validatePassword(): boolean {
        return this.password.length > 8;
    }
}

const user = new User("Azkar", "secret123");
console.log(user.name);      // Valid
console.log(user.password);  // Error: 'password' is private
```

---

## Readonly Properties

The `readonly` modifier allows reading a property but prevents reassignment:

```ts
class User {
    readonly id: number;
    readonly hobbies: string[] = [];

    constructor(id: number) {
        this.id = id;
    }
}

const user = new User(101);

console.log(user.id);       // Valid: reading is allowed
user.id = 102;              // Error: cannot reassign readonly property

user.hobbies.push("coding"); // Valid: modifying array contents is allowed
user.hobbies = [];           // Error: cannot reassign readonly array
```

---

## Getters and Setters

Getters and setters provide controlled access to private properties.

### Rules

- A getter must return a value
- A setter must accept at least one argument
- Getters and setters cannot be private

```ts
class User {
    constructor(private fName: string, private lName: string) {}

    // Getter: must return something
    get fullName(): string {
        return `${this.fName} ${this.lName}`;
    }

    // Setter: must accept at least one argument
    set firstName(name: string) {
        this.fName = name;
    }
}

const user = new User("Mohd", "Azkar");

console.log(user.fullName);  // Output: Mohd Azkar

user.firstName = "Ahmad";
console.log(user.fullName);  // Output: Ahmad Azkar
```

---

## Static Properties

Static properties belong to the class itself, not to instances:

```ts
class User {
    static userCount: number = 0;
    static readonly ENTITY_ID: string = "USER";

    constructor(public name: string) {
        User.userCount++;
    }

    static getUserCount(): number {
        return User.userCount;
    }
}

// Access via class name, not instance
console.log(User.ENTITY_ID);     // Output: USER
console.log(User.getUserCount()); // Output: 0

const user1 = new User("Azkar");
const user2 = new User("Max");

console.log(User.getUserCount()); // Output: 2
```

---

## Inheritance

Use the `extends` keyword to inherit from a parent class:

```ts
class User {
    constructor(public name: string, protected role: string = "user") {}

    greet(): string {
        return `Hello, ${this.name}`;
    }
}

class Employee extends User {
    constructor(name: string, public jobTitle: string) {
        super(name, "employee");  // Call parent constructor
    }

    // Override parent method
    greet(): string {
        return `${super.greet()}, you are a ${this.jobTitle}`;
    }

    getRole(): string {
        return this.role;  // Can access protected property
    }
}

const emp = new Employee("Azkar", "Developer");

console.log(emp.greet());    // Output: Hello, Azkar, you are a Developer
console.log(emp.getRole());  // Output: employee
```

### Protected vs Private

| Modifier | Same Class | Child Class | Outside |
|----------|------------|-------------|---------|
| `private` | Yes | No | No |
| `protected` | Yes | Yes | No |

---

## Abstract Classes

Abstract classes cannot be instantiated directly. They are used as base classes for other classes.

```ts
abstract class UIElement {
    constructor(public id: string) {}

    // Abstract method: must be implemented by child classes
    abstract render(): void;

    // Regular method: inherited by child classes
    clone(): UIElement {
        return Object.create(this);
    }
}

class Button extends UIElement {
    constructor(id: string, public label: string) {
        super(id);
    }

    // Must implement abstract method
    render(): void {
        console.log(`Rendering button: ${this.label}`);
    }
}

// const element = new UIElement("e1");  // Error: cannot instantiate abstract class
const button = new Button("btn1", "Submit");
button.render();  // Output: Rendering button: Submit
```

---

## Interfaces

Interfaces define the shape of an object. They are a pure TypeScript feature and do not exist in compiled JavaScript.

### Interface vs Type

| Feature | Interface | Type |
|---------|-----------|------|
| Used for | Objects only | Any type (string, number, array, etc.) |
| Extendable after definition | Yes | No |
| Syntax | `interface Name {}` | `type Name = {}` |

### Basic Interface

```ts
interface User {
    name: string;
    age: number;
    email?: string;  // Optional property
}

const user: User = {
    name: "Azkar",
    age: 25
};
```

### Extending Interface (Adding Properties Later)

```ts
interface User {
    name: string;
}

// Add more properties to the same interface
interface User {
    age: number;
}

// User now has both name and age
const user: User = {
    name: "Azkar",
    age: 25
};
```

### Function Type with Interface

```ts
interface SumFn {
    (a: number, b: number): number;
}

const add: SumFn = (a, b) => {
    return a + b;
};

console.log(add(5, 3));  // Output: 8
```

### Implementing Interface in Class

A class can implement multiple interfaces using the `implements` keyword:

```ts
interface Printable {
    print(): void;
}

interface Saveable {
    save(): void;
}

class Document implements Printable, Saveable {
    constructor(public content: string) {}

    print(): void {
        console.log(`Printing: ${this.content}`);
    }

    save(): void {
        console.log(`Saving: ${this.content}`);
    }
}

const doc = new Document("Hello World");
doc.print();  // Output: Printing: Hello World
doc.save();   // Output: Saving: Hello World
```

### Interface Extending Interface

```ts
interface Person {
    name: string;
    age: number;
}

interface Employee extends Person {
    employeeId: number;
    department: string;
}

const emp: Employee = {
    name: "Azkar",
    age: 25,
    employeeId: 101,
    department: "Engineering"
};
```

### Key Points

- A class can only extend one class but can implement multiple interfaces
- Interfaces are compiled away and do not appear in JavaScript output
- Use interfaces to enforce a contract on classes or objects




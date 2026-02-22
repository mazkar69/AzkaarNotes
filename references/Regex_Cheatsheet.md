# Regex Cheatsheet

> Last Updated: February 22, 2026

## Table of Contents
- [Basic Patterns](#basic-patterns)
- [Character Classes](#character-classes)
- [Quantifiers](#quantifiers)
- [Anchors and Boundaries](#anchors-and-boundaries)
- [Groups and Alternation](#groups-and-alternation)
- [Lookahead and Lookbehind](#lookahead-and-lookbehind)
- [Common Patterns](#common-patterns)
- [JavaScript Usage](#javascript-usage)
- [Flags](#flags)

---

## Basic Patterns

| Pattern | Description | Example Match |
|---------|-------------|---------------|
| `.` | Any character except newline | `a.c` matches `abc`, `a1c` |
| `\d` | Any digit (0-9) | `\d\d` matches `42` |
| `\D` | Any non-digit | `\D` matches `a`, `!` |
| `\w` | Word character (a-z, A-Z, 0-9, _) | `\w+` matches `hello_123` |
| `\W` | Non-word character | `\W` matches `@`, ` ` |
| `\s` | Whitespace (space, tab, newline) | `\s` matches ` `, `\t` |
| `\S` | Non-whitespace | `\S+` matches `hello` |
| `\\` | Escape special character | `\.` matches literal `.` |

---

## Character Classes

| Pattern | Description | Example Match |
|---------|-------------|---------------|
| `[abc]` | Any of a, b, or c | `[aeiou]` matches vowels |
| `[^abc]` | Not a, b, or c | `[^0-9]` matches non-digits |
| `[a-z]` | Lowercase letter range | `[a-z]+` matches `hello` |
| `[A-Z]` | Uppercase letter range | `[A-Z]` matches `H` |
| `[0-9]` | Digit range | `[0-9]{3}` matches `123` |
| `[a-zA-Z0-9]` | Alphanumeric | same as `\w` minus `_` |

---

## Quantifiers

| Pattern | Description | Example |
|---------|-------------|---------|
| `*` | 0 or more | `ab*c` matches `ac`, `abc`, `abbc` |
| `+` | 1 or more | `ab+c` matches `abc`, `abbc` (not `ac`) |
| `?` | 0 or 1 (optional) | `colou?r` matches `color`, `colour` |
| `{n}` | Exactly n | `\d{4}` matches `2026` |
| `{n,}` | n or more | `\d{2,}` matches `12`, `123`, `1234` |
| `{n,m}` | Between n and m | `\d{2,4}` matches `12`, `123`, `1234` |
| `*?` | 0 or more (lazy) | `<.*?>` matches a single HTML tag |
| `+?` | 1 or more (lazy) | Matches as few as possible |

Greedy vs Lazy:
- Greedy (`*`, `+`) - matches as much as possible
- Lazy (`*?`, `+?`) - matches as little as possible

---

## Anchors and Boundaries

| Pattern | Description |
|---------|-------------|
| `^` | Start of string (or line with `m` flag) |
| `$` | End of string (or line with `m` flag) |
| `\b` | Word boundary |
| `\B` | Non-word boundary |

```
^hello        - string starts with "hello"
world$        - string ends with "world"
\bcat\b       - matches "cat" but not "category"
```

---

## Groups and Alternation

| Pattern | Description |
|---------|-------------|
| `(abc)` | Capturing group |
| `(?:abc)` | Non-capturing group |
| `(a\|b)` | Alternation (a or b) |
| `\1` | Backreference to group 1 |
| `(?<name>abc)` | Named capturing group |

```
(hello|hi) world       - matches "hello world" or "hi world"
(\d{2})-(\d{2})        - captures "12" and "34" from "12-34"
(?<year>\d{4})         - named group "year"
```

---

## Lookahead and Lookbehind

| Pattern | Description |
|---------|-------------|
| `(?=abc)` | Positive lookahead (followed by abc) |
| `(?!abc)` | Negative lookahead (not followed by abc) |
| `(?<=abc)` | Positive lookbehind (preceded by abc) |
| `(?<!abc)` | Negative lookbehind (not preceded by abc) |

```
\d+(?=px)              - matches digits followed by "px" (100 in "100px")
\d+(?!px)              - matches digits NOT followed by "px"
(?<=\$)\d+             - matches digits preceded by "$" (50 in "$50")
(?<!\$)\d+             - matches digits NOT preceded by "$"
```

---

## Common Patterns

### Email

```
^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$
```

### Phone Number (Indian)

```
^(\+91|91|0)?[6-9]\d{9}$
```

### URL

```
^https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)$
```

### Password (min 8 chars, 1 uppercase, 1 lowercase, 1 digit, 1 special)

```
^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$
```

### IP Address (IPv4)

```
^((25[0-5]|2[0-4]\d|[01]?\d\d?)\.){3}(25[0-5]|2[0-4]\d|[01]?\d\d?)$
```

### Date (YYYY-MM-DD)

```
^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$
```

### Slug (URL-friendly)

```
^[a-z0-9]+(?:-[a-z0-9]+)*$
```

### HTML Tag

```
<\/?([a-zA-Z][a-zA-Z0-9]*)\b[^>]*\/?>
```

### Remove Extra Whitespace

```
\s{2,}    ->  replace with single space
```

---

## JavaScript Usage

### Test (boolean)

```javascript
const pattern = /^[a-z]+$/i;
pattern.test("Hello");        // true
```

### Match (find matches)

```javascript
const str = "Order 123 and Order 456";
str.match(/\d+/g);            // ["123", "456"]
```

### Replace

```javascript
// Simple replace
"hello world".replace(/world/, "JS");    // "hello JS"

// Global replace
"aaa".replace(/a/g, "b");               // "bbb"

// With capture groups
"John Smith".replace(/(\w+) (\w+)/, "$2, $1");  // "Smith, John"

// With function
"hello".replace(/[aeiou]/g, (match) => match.toUpperCase());  // "hEllO"
```

### Split

```javascript
"one,two,,three".split(/,+/);   // ["one", "two", "three"]
```

### Named Groups

```javascript
const dateRegex = /(?<year>\d{4})-(?<month>\d{2})-(?<day>\d{2})/;
const match = "2026-02-22".match(dateRegex);

match.groups.year;    // "2026"
match.groups.month;   // "02"
match.groups.day;     // "22"
```

### matchAll (all matches with groups)

```javascript
const str = "price: $10, tax: $2";
const matches = [...str.matchAll(/\$(\d+)/g)];

matches[0][0];  // "$10"
matches[0][1];  // "10"
matches[1][0];  // "$2"
matches[1][1];  // "2"
```

---

## Flags

| Flag | Name | Description |
|------|------|-------------|
| `g` | Global | Match all occurrences, not just first |
| `i` | Case-insensitive | Ignore case |
| `m` | Multiline | `^` and `$` match line starts/ends |
| `s` | Dotall | `.` matches newline too |
| `u` | Unicode | Enable Unicode support |

```javascript
/hello/i.test("HELLO");     // true (case-insensitive)
"aa bb cc".match(/\b\w+/g); // ["aa", "bb", "cc"] (global)
```

# Cryptography — AES Encryption/Decryption (Node.js)

> **Purpose:** Symmetric encrypt and decrypt strings using AES-256-CTR via Node.js built-in `crypto` module. No external package needed.

---

## Algorithm

| Property | Value |
|----------|-------|
| Algorithm | `aes-256-ctr` |
| Key Length | 32 bytes (256-bit) |
| IV Length | 16 bytes |
| Encoding | Input: `utf8` → Output: `base64` |

---

## Code

```js
const crypto = require('crypto');

const ENC  = 'bf3c199c2470cb477d907b1e0917c17b'; // 32-char key (256-bit)
const IV   = '5183666c72eec9e4';                  // 16-char IV
const ALGO = 'aes-256-ctr';

const encrypt = (text) => {
    let cipher = crypto.createCipheriv(ALGO, ENC, IV);
    let encrypted = cipher.update(text, 'utf8', 'base64');
    encrypted += cipher.final('base64');
    return encrypted;
};

const decrypt = (text) => {
    let decipher = crypto.createDecipheriv(ALGO, ENC, IV);
    let decrypted = decipher.update(text, 'base64', 'utf8');
    return decrypted + decipher.final('utf8');
};

module.exports = { encrypt, decrypt };
```

---

## Usage

```js
const { encrypt, decrypt } = require('./cryptography');

const encrypted = encrypt("HelloWorld");
const decrypted = decrypt(encrypted);

console.log(encrypted); // e.g. "abc123base64=="
console.log(decrypted); // "HelloWorld"
```

---

## Store Keys in Environment Variables

> **Never hardcode keys in source code.** Move them to `.env`.

```env
CRYPTO_KEY=bf3c199c2470cb477d907b1e0917c17b
CRYPTO_IV=5183666c72eec9e4
```

```js
const ENC  = process.env.CRYPTO_KEY;
const IV   = process.env.CRYPTO_IV;
```

---

## Practical Use Cases

| Use Case | Example |
|----------|---------|
| Encrypt user tokens in DB | `encrypt(token)` before saving |
| Encrypt sensitive config values | Encrypt API keys stored in DB |
| URL-safe tokens | Encrypt IDs before sending in URL |
| Reversible data masking | Encrypt phone numbers in logs |

---

## Notes

- `aes-256-ctr` is a **stream cipher** — no padding needed, good for arbitrary-length strings
- The same key + IV always produces the same output for the same input (deterministic)
- For non-deterministic encryption (random output each time), use a **random IV** per encryption and store it alongside the ciphertext
- This is **symmetric** encryption — the same key encrypts and decrypts (keep it secret)
- For passwords, use **bcrypt** (hashing), not encryption — passwords should not be reversible

# Generate OTP — Node.js Utility

> **Purpose:** Generate a cryptographically random-looking 6-digit numeric OTP (One-Time Password) for SMS/email verification flows.

---

## Code

```js
const generateOTP = () =>
    Math.floor(100000 + Math.random() * 900000).toString();

export default generateOTP;
```

---

## How It Works

| Expression | Result |
|------------|--------|
| `Math.random() * 900000` | Random float: `0` to `899999.999...` |
| `+ 100000` | Shifts range to `100000` – `999999.999...` |
| `Math.floor(...)` | Integer: `100000` – `999999` |
| `.toString()` | Returns as string: `"100000"` – `"999999"` |

Always produces exactly **6 digits** — no leading zeros.

---

## Usage

```js
import generateOTP from "./generateOTP.js";

const otp = generateOTP();
console.log(otp); // e.g. "482319"
```

---

## Custom Length OTP

```js
const generateOTP = (length = 6) => {
    const min = Math.pow(10, length - 1);       // 100000 for 6 digits
    const max = Math.pow(10, length) - 1;       // 999999 for 6 digits
    return Math.floor(min + Math.random() * (max - min + 1)).toString();
};

export default generateOTP;
```

---

## Saving OTP in Database (Mongoose)

```js
import generateOTP from "./generateOTP.js";

const otp = generateOTP();
const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // Expires in 10 minutes

await OTPModel.create({ phone, otp, expiresAt });
```

### OTP Model Schema

```js
import mongoose from "mongoose";

const otpSchema = new mongoose.Schema({
    phone:     { type: String, required: true },
    otp:       { type: String, required: true },
    isUsed:    { type: Boolean, default: false },
    expiresAt: { type: Date, required: true },
}, { timestamps: true });

// Auto-delete documents after expiry (TTL index)
otpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export default mongoose.model("OTP", otpSchema);
```

---

## Verifying OTP

```js
const verifyOTP = async (phone, inputOtp) => {
    const record = await OTPModel.findOne({
        phone,
        otp: inputOtp,
        isUsed: false,
        expiresAt: { $gt: new Date() }, // Not expired
    });

    if (!record) {
        throw new Error("Invalid or expired OTP");
    }

    // Mark as used
    await OTPModel.updateOne({ _id: record._id }, { $set: { isUsed: true } });

    return true;
};
```

---

## Notes

- `Math.random()` is **not cryptographically secure** — acceptable for OTPs sent via SMS/email (the delivery channel is the security layer)
- For high-security use cases, use `crypto.randomInt(100000, 999999)` from Node's built-in `crypto` module
- Always set an **expiry time** (10 min is standard)
- Always **mark OTP as used** after verification to prevent replay attacks
- **Never log OTPs** in production


# Phone Number Validation, Country Flags, and Country Data — Complete Notes

## 1. Phone Number Validation (libphonenumber-js)

### ✅ Simple & Recommended Validation

```js
const phoneNumberObj = parsePhoneNumber("+" + countryCode + phoneNumber);
const isValid = phoneNumberObj && phoneNumberObj.isValid();
const isPossible = phoneNumberObj && phoneNumberObj.isPossible();
```

- `isValid()` → Fully valid according to country rules  
- `isPossible()` → Length + structure looks valid  
- No need to manually check lengths  

### Install:
```
npm install libphonenumber-js
```

---

## 2. Country Flags API Options

### **Option 1 — FlagsAPI (simple & fast)**
```
https://flagsapi.com/IN/flat/64.png
https://flagsapi.com/IN/shiny/64.png
```

### **Option 2 — FlagCDN / Flagpedia**
```
https://flagcdn.com/in.svg
https://flagcdn.com/48x36/in.png
```

### **Option 3 — API Ninjas (Flag API)**
```
https://api.api-ninjas.com/v1/country?name=india
```

---

## 3. Country Name + ISO Code + Dial Code + Flag (Dropdown Data)

### ✔ Method 1 — REST Countries API (Recommended for dynamic data)

#### URL:
```
https://restcountries.com/v3.1/all?fields=name,cca2,idd,flags
```

#### Sample Response:
```json
{
  "name": { "common": "India" },
  "cca2": "IN",
  "idd": { "root": "+9", "suffixes": ["1"] },
  "flags": {
    "png": "https://flagcdn.com/w320/in.png",
    "svg": "https://flagcdn.com/in.svg"
  }
}
```

#### Convert API response → dropdown list:

```js
const list = data.map((c) => ({
  name: c.name.common,
  code: c.cca2,
  dial: c.idd?.root ? c.idd.root + (c.idd.suffixes?.[0] || "") : "",
  flag: c.flags.png
}));
```

---


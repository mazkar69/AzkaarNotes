# HTTP Content-Types

## Most Used Content-Types (MERN Stack)

### 1. application/json

The standard for REST APIs. Used when sending or receiving JSON data.

**Used when:**
- REST APIs (Express, NestJS, Fastify, etc.)
- Sending/receiving structured data

**Example:**
```http
Content-Type: application/json
```
```json
{
  "email": "test@gmail.com",
  "password": "123456"
}
```

**Default for:** Axios, Fetch API, Express `express.json()`

---

### 2. application/x-www-form-urlencoded

Old-school form data without files. Data is URL-encoded as key-value pairs.

**Used when:**
- HTML `<form>` submit
- OAuth token exchange
- Legacy APIs

**Example:**
```http
Content-Type: application/x-www-form-urlencoded
```
```
email=test@gmail.com&password=123456
```

**Express setup:**
```js
app.use(express.urlencoded({ extended: true }))
```

---

### 3. multipart/form-data

Used for file uploads or sending form data along with files.

**Used when:**
- Uploading images, videos, or documents
- Sending form fields + files together

**Example:**
```http
Content-Type: multipart/form-data
```

**Frontend:**
```js
const fd = new FormData()
fd.append("image", file)
fd.append("name", "AzKaaR")
```

**Backend:** Use `multer` middleware in Express.

---

### 4. text/plain

Raw plain text with no formatting.

**Used when:**
- Sending simple text messages
- Webhooks
- Testing/debugging

**Example:**
```http
Content-Type: text/plain
```
```
Hello World
```

---

## Data and File Types

### 5. text/html

HTML page content.

**Used when:**
- Server-side rendering
- Returning an HTML response

```http
Content-Type: text/html
```

---

### 6. application/xml / text/xml

XML-based data exchange.

**Used when:**
- Legacy/old systems
- Payment gateway integrations
- Government APIs

```http
Content-Type: application/xml
```

---

### 7. application/pdf

PDF file responses.

**Used when:**
- Invoices
- Reports
- File downloads

```http
Content-Type: application/pdf
```

---

## Media Content-Types

### Images

| Content-Type    | Format |
|-----------------|--------|
| `image/jpeg`    | JPEG   |
| `image/png`     | PNG    |
| `image/webp`    | WebP   |
| `image/svg+xml` | SVG    |

### Video

| Content-Type | Format |
|--------------|--------|
| `video/mp4`  | MP4    |
| `video/webm` | WebM   |

### Audio

| Content-Type | Format |
|--------------|--------|
| `audio/mpeg` | MP3    |
| `audio/wav`  | WAV    |

**Used when:** Streaming, CDN delivery, file downloads.

---

## API and Special Purpose

### 8. application/octet-stream

Raw binary data with unknown or arbitrary file type.

**Used when:**
- File downloads
- Unknown file type
- Streaming binary blobs

```http
Content-Type: application/octet-stream
```

---

### 9. application/graphql

Used in GraphQL APIs for sending raw GraphQL queries.

```http
Content-Type: application/graphql
```

> Note: Most GraphQL APIs still use `application/json`.

---

### 10. application/zip

Compressed ZIP file responses.

**Used when:**
- ZIP file downloads
- Backups

```http
Content-Type: application/zip
```

---

## Charset / Encoding

You will often see a `charset` parameter appended to the Content-Type:

```http
Content-Type: application/json; charset=utf-8
```

- `charset=utf-8` specifies the character encoding
- Almost always UTF-8 in modern applications

---

## Quick Reference - How to Choose

| Situation          | Content-Type                        |
|--------------------|-------------------------------------|
| Sending API data   | `application/json`                  |
| Uploading files    | `multipart/form-data`               |
| HTML form submit   | `application/x-www-form-urlencoded` |
| Downloading a file | `application/octet-stream`          |
| Sending plain text | `text/plain`                        |
| Returning HTML     | `text/html`                         |
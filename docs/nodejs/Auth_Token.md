# Authentication Token Flow Documentation

## Overview

This document explains how access tokens and refresh tokens work in our cloud-drive backend, including implementation details and mobile app support.

## Table of Contents

1. [What Are Access & Refresh Tokens?](#what-are-access--refresh-tokens)
2. [Why Use Both Tokens?](#why-use-both-tokens)
3. [Token Flow Diagrams](#token-flow-diagrams)
4. [Implementation Details](#implementation-details)
5. [Mobile App Support](#mobile-app-support)
6. [Security Features](#security-features)
7. [API Endpoints Reference](#api-endpoints-reference)

---

## What Are Access & Refresh Tokens?

### Access Token

- **Type**: Short-lived JWT (JSON Web Token)
- **Lifespan**: Configured via `JWT_ACCESS_EXPIRES_IN` (typically 15-30 minutes)
- **Storage**: Client-side (memory/localStorage for web, secure storage for mobile)
- **Payload Structure**:
  ```json
  {
    "userId": "507f1f77bcf86cd799439011",
    "role": "user",
    "iat": 1234567890,
    "exp": 1234569690
  }
  ```
- **Purpose**: Proves user authentication for protected API routes
- **Usage**: Sent in `Authorization: Bearer <token>` header with every API request

### Refresh Token

- **Type**: Long-lived JWT token
- **Lifespan**: 7 days
- **Storage**: 
  - **Web**: httpOnly cookie (JavaScript cannot access)
  - **Mobile**: Secure storage (Keychain/Keystore)
- **Payload Structure**:
  ```json
  {
    "userId": "507f1f77bcf86cd799439011",
    "iat": 1234567890,
    "exp": 1235172690
  }
  ```
- **Purpose**: Obtain new access tokens without re-authentication
- **Security**: Hashed (SHA-256) before database storage

---

## Why Use Both Tokens?

### The Security Problem

If we only used long-lived access tokens:
- ❌ **High risk** if token is stolen (valid for days/weeks)
- ❌ **No revocation** mechanism without database lookup on every request
- ❌ **Performance impact** from constant database checks

### The Solution: Dual-Token System

| Aspect | Access Token | Refresh Token |
|--------|--------------|---------------|
| **Lifetime** | Short (15-30 min) | Long (7 days) |
| **Exposure** | Sent frequently | Sent rarely |
| **Theft Impact** | Limited damage window | Detectable via rotation |
| **Validation** | JWT signature only | JWT + database lookup |
| **Revocation** | Natural expiry | Database-backed |

**Benefits**:
- ✅ **Security**: Stolen access tokens expire quickly
- ✅ **Performance**: Most requests skip database (JWT-only validation)
- ✅ **Convenience**: Users stay logged in without constant re-authentication
- ✅ **Control**: Can revoke refresh tokens (logout, password reset)

---

## Token Flow Diagrams

### 1. Registration Flow

```
┌─────────┐
│  User   │
└────┬────┘
     │ POST /api/auth/register
     │ { name, email, password }
     ▼
┌─────────────────────────────┐
│  Backend                    │
│  1. Hash password (bcrypt)  │
│  2. Create user in DB       │
│  3. Generate verify token   │
│  4. Send verification email │
└────┬────────────────────────┘
     │
     ▼
┌─────────────────────────────┐
│  Response                   │
│  { userId, email }          │
│  Status: 201                │
└─────────────────────────────┘
```

**Note**: No tokens issued until email is verified and user logs in.

---

### 2. Login Flow

```
┌─────────┐
│  User   │
└────┬────┘
     │ POST /api/auth/login
     │ { email, password }
     ▼
┌──────────────────────────────────────┐
│  Backend (auth.service.ts)           │
│  1. Find user by email               │
│  2. Verify password (bcrypt)         │
│  3. Generate access token (JWT)      │
│  4. Generate refresh token (JWT)     │
│  5. Hash refresh token (SHA-256)     │
│  6. Store hash + metadata in DB      │
└────┬─────────────────────────────────┘
     │
     ▼
┌──────────────────────────────────────┐
│  Controller (auth.controller.ts)     │
│  Web: Set httpOnly cookie            │
│  Mobile: Include in response body    │
└────┬─────────────────────────────────┘
     │
     ▼
┌──────────────────────────────────────┐
│  Response                            │
│  {                                   │
│    accessToken: "eyJhbG...",         │
│    refreshToken: "eyJhbG..." (mobile)│
│    user: { id, name, email, ... }   │
│  }                                   │
└──────────────────────────────────────┘
     │
     ▼
┌──────────────────────────────────────┐
│  Client Storage                      │
│  Web: accessToken in memory          │
│       refreshToken in cookie         │
│  Mobile: Both in secure storage      │
└──────────────────────────────────────┘
```

**Database Storage** (RefreshToken collection):
```javascript
{
  userId: ObjectId("..."),
  tokenHash: "a3f5c89...",  // SHA-256 hash
  deviceInfo: "Mozilla/5.0...",
  ipAddress: "192.168.1.1",
  expiresAt: ISODate("2026-08-03T..."),
  isRevoked: false,
  createdAt: ISODate("2026-07-27T...")
}
```

---

### 3. Protected API Request Flow

```
┌─────────┐
│ Client  │
└────┬────┘
     │ GET /api/files
     │ Authorization: Bearer <accessToken>
     ▼
┌────────────────────────────────────┐
│  Middleware (auth.middleware.ts)   │
│  1. Extract token from header      │
│  2. Verify JWT signature           │
│  3. Check expiration               │
│  4. Decode payload                 │
└────┬───────────────────────────────┘
     │
     ├─── ✅ Valid
     │         │
     │         ▼
     │    ┌────────────────────────┐
     │    │  Attach to req.user:   │
     │    │  { userId, role }      │
     │    └────┬───────────────────┘
     │         │
     │         ▼
     │    ┌────────────────────────┐
     │    │  Route Handler         │
     │    │  Process request       │
     │    │  Access req.user data  │
     │    └────┬───────────────────┘
     │         │
     │         ▼
     │    ┌────────────────────────┐
     │    │  Response: 200         │
     │    │  { data: [...] }       │
     │    └────────────────────────┘
     │
     └─── ❌ Invalid/Expired
               │
               ▼
          ┌────────────────────────┐
          │  Response: 401         │
          │  "Invalid/expired      │
          │   access token"        │
          └────────────────────────┘
```

---

### 4. Token Refresh Flow (Token Rotation)

```
┌─────────┐
│ Client  │ Access token expired (401 from API)
└────┬────┘
     │ POST /api/auth/refresh
     │ Cookie: refreshToken (web)
     │ Body: { refreshToken } (mobile)
     ▼
┌────────────────────────────────────────┐
│  Backend (auth.service.ts)             │
│  1. Verify refresh token JWT           │
│  2. Hash token → lookup in DB          │
│  3. Check: not revoked, not expired    │
│  4. ✅ REVOKE old refresh token        │
│  5. Generate NEW access token          │
│  6. Generate NEW refresh token         │
│  7. Store new refresh token in DB      │
└────┬───────────────────────────────────┘
     │
     ▼
┌────────────────────────────────────────┐
│  Response                              │
│  {                                     │
│    accessToken: "new_eyJhbG...",       │
│    refreshToken: "new_eyJhbG..." (mob) │
│  }                                     │
│  Cookie: new refreshToken (web)        │
└────┬───────────────────────────────────┘
     │
     ▼
┌────────────────────────────────────────┐
│  Client                                │
│  Update stored tokens                  │
│  Retry failed request with new token   │
└────────────────────────────────────────┘
```

**Why Token Rotation?**

If a refresh token is stolen:
1. Attacker uses it → gets new tokens, old one revoked
2. Real user tries to refresh → fails (token already used)
3. System detects breach → can revoke all user sessions

---

### 5. Logout Flow

```
┌─────────┐
│ Client  │
└────┬────┘
     │ POST /api/auth/logout
     │ Cookie/Body: refreshToken
     ▼
┌────────────────────────────────────┐
│  Backend                           │
│  1. Hash refresh token             │
│  2. Mark as revoked in DB:         │
│     { isRevoked: true }            │
│  3. Clear cookie (web)             │
└────┬───────────────────────────────┘
     │
     ▼
┌────────────────────────────────────┐
│  Response: 200                     │
│  "Logged out successfully"         │
└────┬───────────────────────────────┘
     │
     ▼
┌────────────────────────────────────┐
│  Client                            │
│  Clear access token from memory    │
│  Clear refresh token from storage  │
└────────────────────────────────────┘
```

**Note**: Access token remains technically valid until natural expiration, but client discards it. Short lifespan minimizes risk.

---

## Implementation Details

### Files Structure

```
src/
├── utils/jwt.utils.ts          # Token generation & verification
├── services/auth.service.ts    # Authentication logic
├── controllers/auth.controller.ts  # Request handling
├── middleware/auth.middleware.ts   # Token validation
├── models/RefreshToken.model.ts    # Database schema
└── routes/auth.routes.ts       # API endpoints
```

### Key Functions

#### `jwt.utils.ts`

```typescript
// Generate access token (short-lived)
signAccessToken(userId: string, role: string): string
// Returns: JWT with { userId, role }, expires in 15-30 min

// Generate refresh token (long-lived)
signRefreshToken(userId: string): string
// Returns: JWT with { userId }, expires in 7 days

// Verify access token
verifyAccessToken(token: string): { userId, role }
// Throws if invalid/expired

// Verify refresh token
verifyRefreshToken(token: string): { userId }
// Throws if invalid/expired
```

#### `auth.service.ts`

```typescript
// Login: issue both tokens
login(input, deviceInfo, ip)
// Returns: { accessToken, refreshToken, user }

// Refresh: rotate tokens
refreshTokens(oldRefreshToken, deviceInfo, ip)
// 1. Validate old token
// 2. Revoke old token
// 3. Issue new pair
// Returns: { accessToken, refreshToken }

// Logout: revoke refresh token
logout(refreshToken)
// Marks token as revoked in DB
```

#### `auth.middleware.ts`

```typescript
// Protect routes
authenticate(req, res, next)
// 1. Extract token from Authorization header
// 2. Verify JWT
// 3. Attach req.user = { userId, role }
// 4. Call next() or return 401

// Role-based access
requireRole(...roles)
// Check if req.user.role matches allowed roles
```

### Environment Variables

```env
# JWT Secrets (use long random strings)
JWT_ACCESS_SECRET=your-secret-key-min-32-chars
JWT_REFRESH_SECRET=different-secret-key-min-32-chars

# Token Lifespans
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d
```

---

## Mobile App Support

### The Problem

Mobile apps (iOS/Android/React Native) **cannot use httpOnly cookies** because:
- No browser environment
- Native HTTP clients don't manage cookies the same way
- Need explicit token storage in app

### Current Implementation (Web Only)

**Controller** (`auth.controller.ts`):
```typescript
export async function login(req: Request, res: Response): Promise<void> {
  const result = await authService.login(req.body, getDeviceInfo(req), getClientIp(req));
  
  // ✅ Sets httpOnly cookie (web only)
  setRefreshCookie(res, result.refreshToken);
  
  // ❌ Refresh token NOT in response body
  ok(res, { 
    accessToken: result.accessToken, 
    user: result.user 
  });
}
```

**Problem**: Mobile apps receive access token but no refresh token!

---

### Required Changes for Mobile Support

#### ✅ Solution: Return Refresh Token in Response Body

The backend **already supports** reading refresh tokens from request body:

```typescript
// In refresh controller
const token = (req.cookies?.refreshToken as string | undefined) 
           ?? req.body?.refreshToken;  // ← Already checks body!
```

**Just need to return it in responses too!**

---

#### Change 1: Update `login` Controller

**File**: `src/controllers/auth.controller.ts`

```typescript
export async function login(req: Request, res: Response): Promise<void> {
  try {
    const result = await authService.login(req.body, getDeviceInfo(req), getClientIp(req));
    
    // Set cookie for web clients
    setRefreshCookie(res, result.refreshToken);
    
    // ✅ ALSO return in body for mobile clients
    ok(res, { 
      accessToken: result.accessToken,
      refreshToken: result.refreshToken,  // ← ADD THIS
      user: result.user 
    });
  } catch (err) {
    const e = err as Error & { status?: number };
    fail(res, e.message, e.status ?? 500);
  }
}
```

---

#### Change 2: Update `refresh` Controller

**File**: `src/controllers/auth.controller.ts`

```typescript
export async function refresh(req: Request, res: Response): Promise<void> {
  try {
    // Accept from cookie (web) OR body (mobile)
    const token = (req.cookies?.refreshToken as string | undefined) 
               ?? req.body?.refreshToken;
    
    if (!token) { 
      fail(res, 'No refresh token', 401); 
      return; 
    }
    
    const result = await authService.refreshTokens(token, getDeviceInfo(req), getClientIp(req));
    
    // Set cookie for web clients
    setRefreshCookie(res, result.refreshToken);
    
    // ✅ ALSO return in body for mobile clients
    ok(res, { 
      accessToken: result.accessToken,
      refreshToken: result.refreshToken  // ← ADD THIS
    });
  } catch (err) {
    const e = err as Error & { status?: number };
    fail(res, e.message, e.status ?? 500);
  }
}
```

---

### Mobile Client Implementation

#### iOS (Swift) - Keychain Storage

```swift
import KeychainSwift

class AuthManager {
    let keychain = KeychainSwift()
    
    // Store tokens after login
    func saveTokens(access: String, refresh: String) {
        keychain.set(access, forKey: "accessToken")
        keychain.set(refresh, forKey: "refreshToken")  // Secure storage
    }
    
    // API call with token
    func makeAuthenticatedRequest() {
        guard let token = keychain.get("accessToken") else { return }
        
        var request = URLRequest(url: url)
        request.setValue("Bearer \(token)", forHTTPHeaderField: "Authorization")
        // ... perform request
    }
    
    // Refresh tokens when access token expires
    func refreshTokens() async throws {
        guard let refreshToken = keychain.get("refreshToken") else { 
            throw AuthError.noRefreshToken 
        }
        
        let body = ["refreshToken": refreshToken]
        // POST to /api/auth/refresh
        let response = try await post("/api/auth/refresh", body: body)
        
        // Update stored tokens
        saveTokens(
            access: response.accessToken, 
            refresh: response.refreshToken
        )
    }
}
```

---

#### Android (Kotlin) - EncryptedSharedPreferences

```kotlin
import androidx.security.crypto.EncryptedSharedPreferences

class AuthManager(context: Context) {
    private val encryptedPrefs = EncryptedSharedPreferences.create(
        "auth_prefs",
        MasterKey.Builder(context).setKeyScheme(MasterKey.KeyScheme.AES256_GCM).build(),
        context,
        EncryptedSharedPreferences.PrefKeyEncryptionScheme.AES256_SIV,
        EncryptedSharedPreferences.PrefValueEncryptionScheme.AES256_GCM
    )
    
    // Store tokens
    fun saveTokens(accessToken: String, refreshToken: String) {
        encryptedPrefs.edit()
            .putString("access_token", accessToken)
            .putString("refresh_token", refreshToken)
            .apply()
    }
    
    // Get access token for API calls
    fun getAccessToken(): String? = encryptedPrefs.getString("access_token", null)
    
    // Refresh tokens
    suspend fun refreshTokens(): Boolean {
        val refreshToken = encryptedPrefs.getString("refresh_token", null) ?: return false
        
        val response = api.refreshTokens(RefreshRequest(refreshToken))
        saveTokens(response.accessToken, response.refreshToken)
        return true
    }
}
```

---

#### React Native - Expo SecureStore

```javascript
import * as SecureStore from 'expo-secure-store';

// Save tokens after login
async function saveTokens(accessToken, refreshToken) {
  await SecureStore.setItemAsync('accessToken', accessToken);
  await SecureStore.setItemAsync('refreshToken', refreshToken);
}

// API call with automatic token refresh
async function authenticatedFetch(url, options = {}) {
  let accessToken = await SecureStore.getItemAsync('accessToken');
  
  // Try request with current access token
  let response = await fetch(url, {
    ...options,
    headers: {
      ...options.headers,
      'Authorization': `Bearer ${accessToken}`,
    },
  });
  
  // If 401, refresh and retry
  if (response.status === 401) {
    const refreshToken = await SecureStore.getItemAsync('refreshToken');
    
    const refreshResponse = await fetch('/api/auth/refresh', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
    });
    
    const { accessToken: newAccess, refreshToken: newRefresh } = await refreshResponse.json();
    await saveTokens(newAccess, newRefresh);
    
    // Retry original request
    response = await fetch(url, {
      ...options,
      headers: {
        ...options.headers,
        'Authorization': `Bearer ${newAccess}`,
      },
    });
  }
  
  return response;
}

// Usage
const response = await authenticatedFetch('/api/files');
const files = await response.json();
```

---

### Alternative: Custom Header

Instead of request body, use a custom header:

**Backend**:
```typescript
const token = req.cookies?.refreshToken 
           ?? req.body?.refreshToken 
           ?? req.headers['x-refresh-token'];  // ← Add header support
```

**Mobile**:
```javascript
fetch('/api/auth/refresh', {
  method: 'POST',
  headers: { 
    'X-Refresh-Token': refreshToken 
  }
});
```

**Benefits**:
- Keeps tokens out of request body (cleaner logs)
- Standard pattern for bearer-style auth
- Easy to intercept in middleware

---

## Security Features

### 1. Token Hashing

**Code** (`auth.service.ts`):
```typescript
function hashToken(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex');
}
```

**Why?**
- Raw tokens never stored in database
- If DB is breached, tokens cannot be used
- Must have original JWT to authenticate

### 2. httpOnly Cookies (Web)

```typescript
res.cookie('refreshToken', token, {
  httpOnly: true,        // JavaScript cannot access
  secure: true,          // HTTPS only in production
  sameSite: 'strict',    // CSRF protection
  maxAge: 7 * 24 * 60 * 60 * 1000,
  path: '/api/auth',     // Limited scope
});
```

**Protection**: XSS attacks cannot steal refresh token.

### 3. Token Rotation

Every refresh invalidates the old token:

```typescript
// Revoke old
stored.isRevoked = true;
await stored.save();

// Issue new
const newRefreshToken = signRefreshToken(user._id.toString());
await RefreshToken.create({ ... });
```

**Protection**: Stolen tokens can only be used once, breach is detectable.

### 4. Device & IP Tracking

```typescript
await RefreshToken.create({
  userId: user._id,
  tokenHash: newTokenHash,
  deviceInfo: deviceInfo.substring(0, 200),  // User-Agent
  ipAddress: ip,
  expiresAt: getRefreshTokenExpiry(),
});
```

**Benefits**:
- Audit trail of login sessions
- Can revoke specific devices
- Detect suspicious activity (new location, etc.)

### 5. Automatic Token Cleanup

```typescript
// In RefreshToken.model.ts
refreshTokenSchema.index(
  { expiresAt: 1 }, 
  { expireAfterSeconds: 0 }  // MongoDB TTL index
);
```

**MongoDB automatically deletes** expired tokens, keeping DB clean.

### 6. Password Reset Invalidates All Sessions

```typescript
export async function resetPassword(input: ResetPasswordInput): Promise<void> {
  // ... update password ...
  
  // Invalidate ALL refresh tokens for this user
  await RefreshToken.updateMany(
    { userId: user._id }, 
    { isRevoked: true }
  ).exec();
}
```

**Security**: Forces re-login on all devices after password change.

### 7. Separate JWT Secrets

```typescript
// Access tokens use one secret
jwt.sign(payload, env.JWT_ACCESS_SECRET, { ... });

// Refresh tokens use different secret
jwt.sign(payload, env.JWT_REFRESH_SECRET, { ... });
```

**Protection**: Compromising one secret doesn't compromise both token types.

---

## API Endpoints Reference

### Authentication Endpoints

#### `POST /api/auth/register`

**Request**:
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "SecurePass123!"
}
```

**Response** (201):
```json
{
  "success": true,
  "message": "Registration successful. Please verify your email.",
  "data": {
    "userId": "507f1f77bcf86cd799439011",
    "email": "john@example.com"
  }
}
```

---

#### `POST /api/auth/login`

**Request**:
```json
{
  "email": "john@example.com",
  "password": "SecurePass123!"
}
```

**Response** (200):
```json
{
  "success": true,
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "507f1f77bcf86cd799439011",
      "name": "John Doe",
      "email": "john@example.com",
      "role": "user",
      "avatar": null,
      "isEmailVerified": true,
      "storageUsed": 0,
      "storageQuota": 10737418240
    }
  }
}
```

**Cookies**: `refreshToken` (httpOnly, secure, 7 days) - **Web only**

---

#### `POST /api/auth/refresh`

**Request (Web)**:
```
Cookie: refreshToken=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Request (Mobile)**:
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response** (200):
```json
{
  "success": true,
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

**Notes**:
- Old refresh token is **automatically revoked**
- New refresh token must be stored
- Set new cookie for web clients

---

#### `POST /api/auth/logout`

**Request (Web)**:
```
Cookie: refreshToken=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Request (Mobile)**:
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response** (200):
```json
{
  "success": true,
  "message": "Logged out successfully",
  "data": null
}
```

**Actions**:
- Marks refresh token as revoked in DB
- Clears cookie (web)
- Client should delete stored tokens

---

#### `GET /api/auth/me`

**Request**:
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Response** (200):
```json
{
  "success": true,
  "data": {
    "id": "507f1f77bcf86cd799439011",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "user",
    "avatar": null,
    "isEmailVerified": true,
    "storageUsed": 1048576,
    "storageQuota": 10737418240
  }
}
```

---

### Protected Endpoints

All file/folder/share endpoints require:

```
Authorization: Bearer <accessToken>
```

**Middleware**: `authenticate` in `auth.middleware.ts`

**Examples**:
- `GET /api/files` - List user files
- `POST /api/folders` - Create folder
- `GET /api/shares/:id` - Get share details

---

## Best Practices

### Client-Side Token Management

#### ✅ DO:
- Store access tokens in memory (web) or secure storage (mobile)
- Store refresh tokens in httpOnly cookies (web) or Keychain/Keystore (mobile)
- Implement automatic token refresh on 401 responses
- Clear all tokens on logout
- Use HTTPS in production

#### ❌ DON'T:
- Store refresh tokens in localStorage (XSS vulnerable)
- Store tokens in regular SharedPreferences/AsyncStorage (unencrypted)
- Include tokens in URL parameters
- Log tokens to console in production
- Share tokens between devices

---

### Server-Side Security

#### ✅ DO:
- Use strong, unique secrets (32+ characters)
- Hash refresh tokens before database storage
- Implement token rotation
- Track device info and IP addresses
- Set appropriate token expiry times
- Use MongoDB TTL indexes for cleanup
- Revoke all tokens on password change

#### ❌ DON'T:
- Use the same secret for access and refresh tokens
- Store raw tokens in database
- Make access tokens long-lived
- Skip token validation
- Allow unlimited refresh without re-authentication

---

## Troubleshooting

### "Invalid or expired access token"

**Cause**: Access token expired or invalid signature.

**Solution**: Call `/api/auth/refresh` to get new access token.

```javascript
// Auto-retry with token refresh
if (response.status === 401) {
  await refreshTokens();
  return retry(originalRequest);
}
```

---

### "Refresh token expired or not found"

**Cause**: 
- Refresh token older than 7 days
- Token was revoked (logout, password reset)
- Token not found in database

**Solution**: User must log in again.

```javascript
if (refreshFailed) {
  clearTokens();
  redirectToLogin();
}
```

---

### "No refresh token provided"

**Cause**: 
- Web: Cookie not sent (wrong domain/path)
- Mobile: Token not included in request body

**Solution**:
- Web: Check cookie settings (sameSite, domain)
- Mobile: Include `refreshToken` in request body

---

### Mobile app not receiving refresh token

**Cause**: Controller only sets cookie, doesn't return in body.

**Solution**: Apply the [mobile support changes](#required-changes-for-mobile-support) above.

---

## Summary

### Token Lifecycle

```
Register → Login → Access Token + Refresh Token
                         │
                         ├─→ Access Token → API Requests (15-30 min)
                         │                      │
                         │                      ├─→ Valid → Response
                         │                      └─→ Expired (401)
                         │                              │
                         └─→ Refresh Token ←───────────┘
                                  │
                                  ├─→ Rotate Tokens (7 days max)
                                  │        │
                                  │        └─→ New Access + Refresh
                                  │
                                  └─→ Expired → Re-login Required
```

### Key Takeaways

1. **Access tokens** are short-lived, sent with every request
2. **Refresh tokens** are long-lived, used only to get new access tokens
3. **Token rotation** provides security through single-use refresh tokens
4. **Web apps** use httpOnly cookies for refresh tokens
5. **Mobile apps** use secure storage and request body/headers
6. **Database hashing** protects tokens even if DB is compromised
7. **Automatic cleanup** via MongoDB TTL indexes keeps DB efficient

---

## Additional Resources

- **JWT Official**: https://jwt.io/
- **OWASP Token Best Practices**: https://cheatsheetseries.owasp.org/cheatsheets/JSON_Web_Token_for_Java_Cheat_Sheet.html
- **iOS Keychain**: https://developer.apple.com/documentation/security/keychain_services
- **Android EncryptedSharedPreferences**: https://developer.android.com/topic/security/data
- **Expo SecureStore**: https://docs.expo.dev/versions/latest/sdk/securestore/

---

**Last Updated**: 2026-07-27  
**Backend Version**: 1.0.0  
**Maintained By**: Cloud Drive Team

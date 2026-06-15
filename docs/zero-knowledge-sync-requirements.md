# Zero-knowledge sync requirements

Backend design for encrypted cross-device sync on top of the local-first case documentation module.

## 1. Decision

Build a thin zero-knowledge sync layer on top of the local-first app — a hybrid of Options A + B from the documentation doc, not a full custodial backend (Option C).

| Layer | Role |
| --- | --- |
| **Working store** | Local-first IndexedDB, unchanged. The app is fully usable with no account. |
| **Sync / backup / retrieval-from-anywhere** | Supabase, Sydney region (`ap-southeast-2`), storing only client-side-encrypted case blobs and files, plus authentication. The server holds ciphertext it cannot read. |

**Account and sync are opt-in.** Anonymous device-local use needs no account; signing in turns on encrypted cross-device sync.

**Why this and not the alternatives:** it fixes the retrieval-from-anywhere weakness of pure local-first while preserving the core promise — "we can't read your data, and we can't be compelled to hand over what we can't read." AU residency is built in; the breach/subpoena surface is minimal (ciphertext only); and it's managed, so ops stay near-zero.

## 2. Shape

```
┌──────────────────────────── User's device (trusted) ────────────────────────────┐
│  React app                                                                       │
│   • IndexedDB  ── plaintext working store (CaseFile, events, files)              │
│   • Crypto module ── derives keys, encrypts/decrypts in-browser                  │
│         │ encrypt before send / decrypt after fetch                              │
└─────────┼────────────────────────────────────────────────────────────────────────┘
          │  ciphertext only (TLS)
          ▼
┌──────────────────── Supabase · Sydney ap-southeast-2 (untrusted-by-design) ──────┐
│  Auth (GoTrue)   Postgres + RLS            Storage (encrypted file bytes)         │
│  account         encrypted case blobs,     per-user buckets, RLS by auth.uid()    │
│                  wrapped keys, salt        (holds ciphertext, never plaintext)    │
└───────────────────────────────────────────────────────────────────────────────────┘
```

The server is deliberately "dumb" about case content: it does auth, stores opaque ciphertext, and enforces "you can only touch your own rows." It can never read a case.

## 3. What the server stores

| Plaintext (operational metadata) | Ciphertext / opaque (never readable by us) |
| --- | --- |
| email (for auth), KDF salt + params | the entire CaseFile JSON (employer, events, witnesses, dismissal facts) |
| wrapped DEK ×2 (passphrase- and recovery-wrapped) + nonces | all uploaded documents (contracts, letters, payslips) |
| Supabase auth verifier (bcrypt of the auth hash, not the passphrase) | |
| **deadline date — deliberate, disclosed exception (see below)** | |
| row ids, `updated_at`, `schemaVersion`, blob sizes | |

**Never in plaintext on the server:** employer name, dismissal facts, event content, witness details, or any document contents. Metadata is minimised to what sync needs. (Residual: the email↔account link reveals that a user has a case file, not its contents — see §9.)

### The deadline-date exception (enables reminders)

The 21-day clock is the product's most safety-critical feature, and a "your window closes in N days" email is its most valuable nudge — but a zero-knowledge server can't send it if it can't see the deadline. So the dismissal/effective date (and the derived deadline) is stored in plaintext by deliberate, disclosed choice, scoped to that single datum, to drive server-side reminder emails.

A bare date reveals little ("this account has a deadline around then") and never the case facts; the safety upside is large. This is the **one intentional crack in pure zero-knowledge** and must be called out in the privacy copy.

## 4. Crypto design

**Primitives** (via `libsodium-wrappers`; WebCrypto PBKDF2+AES-GCM is the zero-dependency fallback, but it lacks Argon2id):

- **KDF:** Argon2id (memory-hard) for passphrase → master key.
- **AEAD:** XChaCha20-Poly1305 (or AES-256-GCM) for all encryption, random nonce per message.
- **Sub-key derivation:** HKDF for separating the encryption key from the auth hash.

**Key hierarchy** (data is encrypted with a random DEK that is wrapped by keys derived from the passphrase and from a recovery key — so changing the passphrase never re-encrypts the data):

```
passphrase ──Argon2id(salt)──▶ masterKey ──HKDF──▶ encKey   (wraps DEK)
                                          └─HKDF──▶ authHash (sent to Supabase as the "password")

DEK (random 32B, made once at signup) ── encrypts ──▶ all CaseFile JSON + files
   wrapped by encKey            ──▶ wrappedDEK_passphrase   (stored server-side)
   wrapped by recoveryKey       ──▶ wrappedDEK_recovery     (stored server-side)
```

**Pseudocode:**

```javascript
// derive
salt      = server.getSalt(email)               // per-user random, stored plaintext
masterKey = argon2id(passphrase, salt, params)  // 32 bytes
encKey    = hkdf(masterKey, "enc")
authHash  = hkdf(masterKey, "auth")             // what Supabase Auth sees as the password

// encrypt a case
nonce      = randomBytes(24)
ciphertext = aead_encrypt(JSON.stringify(caseFile), DEK, nonce)
// upsert { user_id, ciphertext, nonce, version, updated_at } to case_blobs
```

The encrypted backup file (local export) uses the same crypto module and DEK hierarchy as sync.

## 5. Flows

### Signup

1. User chooses email + passphrase (enforce strength).
2. Client: `salt = random`; `masterKey = Argon2id(passphrase, salt)`; derive `encKey`, `authHash`.
3. Client: `DEK = random(32)`. Compute `wrappedDEK_passphrase = AEAD(DEK, encKey)`.
4. Client: generate recovery key (high-entropy, shown once for the user to save); `wrappedDEK_recovery = AEAD(DEK, hkdf(recoveryKey,"enc"))`.
5. Create the Supabase Auth user with `password = authHash`. Store salt, both wrapped DEKs + nonces, KDF params in the user's profile row.
6. Store plaintext `effective_date` / derived `deadline_date` in profile (the §3 exception) when the user has one.
7. From now on, encrypt the local CaseFile with DEK and sync ciphertext.

### Login / retrieve-from-a-new-device

1. **Prelogin:** edge function returns salt + KDF params for the email. (Accepts a minor "email exists" oracle, which signup already exposes.)
2. Client derives `masterKey`, `encKey`, `authHash`; signs in to Supabase with `(email, authHash)`.
3. Fetch profile → `DEK = AEAD_decrypt(wrappedDEK_passphrase, encKey)`.
4. Fetch encrypted case blobs + files → decrypt with DEK → hydrate IndexedDB. Retrieval-from-anywhere solved.

### Sync write (save)

On debounced change (or explicit "back up now"):

- serialise CaseFile → AEAD-encrypt with DEK → upsert blob;
- encrypt each new/changed file with DEK + unique nonce → upload bytes to Storage;
- update plaintext deadline fields on profile when the effective date changes.

**Conflict handling:** last-write-wins on `updated_at` + `schemaVersion` (single-user, concurrent edits rare — acceptable for MVP).

### Passphrase change

User supplies current passphrase → unwrap DEK → derive new salt/`encKey`/`authHash` from the new passphrase → re-wrap DEK → update profile + update the Supabase Auth password to the new `authHash`. No case data is re-encrypted (only the wrapped DEK changes).

### Recovery (forgot passphrase)

User enters the recovery key → `DEK = AEAD_decrypt(wrappedDEK_recovery, hkdf(recoveryKey,"enc"))` → set a new passphrase (as in passphrase change). Supabase's email-based password reset is **not** used for the crypto — it cannot recover the encryption key. The recovery key is the only passphrase-loss escape hatch, so the UX must force the user to save it at signup.

## 6. Single passphrase, not two

The user types one passphrase. The client derives both the encryption key (stays on device) and the auth hash (sent to Supabase as the "password"). Supabase never sees the real passphrase — only the derived `authHash`, which it bcrypts as usual. This gives the Bitwarden/Proton zero-knowledge property without a second secret and without leaving Supabase Auth.

## 7. Supabase setup

**Region:** create the project in Sydney `ap-southeast-2`.

**Tables** (all with RLS `user_id = auth.uid()`):

| Table | Key columns |
| --- | --- |
| `profiles` | `user_id`, `kdf_salt`, `kdf_params`, `wrapped_dek_passphrase`, `wrapped_dek_recovery`, nonces, `effective_date`, `deadline_date`, `reminder_prefs`, `updated_at` |
| `case_blobs` | `id`, `user_id`, `ciphertext`, `nonce`, `schema_version`, `updated_at` |
| `files` | `id`, `user_id`, `storage_path`, `nonce`, `size`, `updated_at` |

**Storage:** one bucket; objects hold encrypted bytes only; Storage RLS scoped to `auth.uid()`.

**Edge Functions:** kept minimal — `prelogin(email)→{salt,params}`, and later the evaluator proxy (calls the model API with de-identified data; never reads case plaintext). Functions never have a path to decrypt user data.

**Reminder job:** scheduled function or cron reads `profiles.deadline_date` (plaintext) and sends reminder emails. Never reads `case_blobs`.

## 8. AI evaluator interaction

The evaluator does not read from this backend in plaintext. Per `ai-evaluator-requirements.md` §2: the client decrypts locally, de-identifies, and sends only that de-identified payload to the evaluator function for a consented, ephemeral, zero-retention round-trip. The encrypted store and the evaluator never share plaintext.

## 9. Threat model

### Protects against

- **Server breach / stolen database** → attacker gets ciphertext + wrapped keys; without a passphrase, Argon2id makes brute force expensive.
- **Insider / casual access** → staff cannot read cases; there is no decryption path server-side.
- **Subpoena / discovery** → we can only produce ciphertext we cannot decrypt.
- **Employer access** → no path; data is encrypted and not on employer systems.
- **Cross-border exposure** → only ciphertext ever leaves the device, and the store is in Sydney regardless.

### Does NOT protect against (be honest in security copy)

- **Compromised user device/browser** (malware, keylogger) — out of scope of any server design.
- **Weak passphrase under targeted brute force** — Argon2id raises the cost; enforce strength.
- **User mishandling the recovery key** — lost recovery key + lost passphrase = unrecoverable (the inherent zero-knowledge trade).
- **Browser-delivered-code risk** — because we serve the JS, a compromised server could in principle serve tampered code that captures keys. This is the known weakness of web E2E vs native apps. Mitigations: strict CSP, Subresource Integrity, locked/minimal dependencies, published build hashes, and a possible future signed desktop/native client for the most security-conscious users.
- **Metadata** — the email↔account linkage reveals existence, not content; and the **plaintext deadline date** (the deliberate reminders exception, §3) reveals roughly when a dispute arose. Both reveal fact-of-use, never case contents; optional alias-email support later.

## 10. MVP scope and sync-lite cuts

Zero-knowledge sync is **in the documentation MVP** (not deferred). The crypto is shared with the encrypted backup file, so the marginal cost over local-first-only is moderate — and durable retrieval-from-anywhere plus deadline-reminder emails are core for an unattended D2C tool. The local-first IndexedDB working store and the encrypted export/import backup file both remain (the file is an offline escape hatch alongside sync).

**Build it sync-lite** — keep these cuts:

- Last-write-wins conflict handling; no real-time or multi-device merge engine.
- DEK + per-message nonce, not per-file content keys.
- No native client yet (accept the browser-delivered-E2E caveat, §9).
- No server-side search / OCR / content analytics (inherent to zero-knowledge; runs client-side or not at all).

**Don't let the crypto gate validation.** Test export value with lawyers (hand-assembled examples) and documentation willingness (concierge users) in parallel — neither needs the backend.

## 11. Implementation checklist

| Status | Item |
| --- | --- |
| done | Client crypto module: Argon2id KDF, HKDF sub-keys, AEAD encrypt/decrypt, DEK wrap/unwrap (`src/case/crypto/`). |
| done | Choose crypto lib (`libsodium-wrappers-sumo`) and pin it. |
| not done | CSP + SRI configured for production. |
| done | Recovery-key generation + "save this" UX gate at signup. |
| not done | Supabase project in `ap-southeast-2`; tables + RLS policies; Storage bucket + policies. |
| done | `prelogin` edge function + `get_prelogin_kdf` RPC (service_role only). |
| done | Single-passphrase auth: derive `authHash`, sign in to Supabase with it. |
| done | Sync engine: debounced encrypt-and-upsert; hydrate-on-login; last-write-wins. |
| done | Passphrase-change and recovery flows (re-wrap DEK; do not re-encrypt data). |
| done | Security copy reflecting §9 (what it protects / does not). |
| not done | Plaintext deadline-date field + server-side reminder-email job (the disclosed exception, §3). |
| not done | Applied-crypto review before any real user data. |

## Related code (today)

| Concern | Location |
| --- | --- |
| **Supabase schema (tables, RLS, Storage)** | `supabase/migrations/20250614120000_zero_knowledge_sync.sql` |
| **Supabase local config** | `supabase/config.toml` |
| **Prelogin edge function** | `supabase/functions/prelogin/index.ts`, `supabase/migrations/20250614130000_prelogin_rpc.sql` |
| **Crypto module** | `src/case/crypto/` |
| **Sync engine** | `src/case/sync/engine.ts`, `src/case/sync/sync-engine-bridge.tsx`, `src/case/sync/lww.ts` |
| **Supabase config** | `src/config/supabase.ts`, `.env.example` |
| **Security / privacy copy (§9)** | `src/pages/legal/privacy-policy.tsx`, `src/case/components/privacy-security-card.tsx` |
| Local-first store | `src/case/storage.ts` |
| Encrypted backup file (v2 crypto; v1 import preserved) | `src/case/backup.ts` |
| Case schema + `updatedAt` | `src/case/types.ts`, `src/case/store.tsx` |
| Backup UX | `src/case/screens/settings-screen.tsx` |

/** Argon2id parameters persisted in profiles.kdf_params. */
export interface KdfParams {
    algorithm: "argon2id";
    opsLimit: number;
    memLimit: number;
    outputLength: number;
}

export interface AeadCiphertext {
    ciphertext: Uint8Array;
    nonce: Uint8Array;
}

/** Material produced at signup (before Supabase writes). */
export interface SignupCryptoBundle {
    salt: Uint8Array;
    kdfParams: KdfParams;
    dek: Uint8Array;
    encKey: Uint8Array;
    authHash: Uint8Array;
    wrappedDekPassphrase: AeadCiphertext;
    recoveryKey: string;
    wrappedDekRecovery: AeadCiphertext;
}

/** Result of unlocking an account with a passphrase. */
export interface PassphraseUnlock {
    dek: Uint8Array;
    encKey: Uint8Array;
    authHash: Uint8Array;
}

/** Result of re-wrapping after a passphrase change (no data re-encryption). */
export interface PassphraseRewrap {
    salt: Uint8Array;
    kdfParams: KdfParams;
    encKey: Uint8Array;
    authHash: Uint8Array;
    wrappedDekPassphrase: AeadCiphertext;
}

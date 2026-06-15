import _sodium from "libsodium-wrappers-sumo";

export type Sodium = typeof _sodium;

let ready: Promise<Sodium> | null = null;

/** Lazy-init libsodium sumo (Argon2id + XChaCha20). */
export function getSodium(): Promise<Sodium> {
    if (!ready) {
        ready = _sodium.ready.then(() => _sodium);
    }
    return ready;
}

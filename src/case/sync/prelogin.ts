import type { KdfParams } from "@/case/sync/database.types";

export interface PreloginRequest {
    email: string;
}

export interface PreloginSuccess {
    exists: true;
    kdfSalt: string;
    kdfParams: KdfParams;
}

export interface PreloginMissing {
    exists: false;
}

export type PreloginResponse = PreloginSuccess | PreloginMissing;

export class PreloginError extends Error {
    constructor(
        message: string,
        readonly status: number,
    ) {
        super(message);
        this.name = "PreloginError";
    }
}

/** Call the prelogin edge function before Supabase Auth sign-in. */
export async function fetchPreloginKdf(supabaseUrl: string, email: string, anonKey: string): Promise<PreloginResponse> {
    const url = `${supabaseUrl.replace(/\/$/, "")}/functions/v1/prelogin`;
    const res = await fetch(url, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${anonKey}`,
        },
        body: JSON.stringify({ email: email.trim().toLowerCase() } satisfies PreloginRequest),
    });

    let body: PreloginResponse | { error?: string };
    try {
        body = (await res.json()) as PreloginResponse | { error?: string };
    } catch {
        throw new PreloginError("Prelogin returned an invalid response", res.status);
    }

    if (!res.ok) {
        const message = "error" in body && typeof body.error === "string" ? body.error : "Prelogin failed";
        throw new PreloginError(message, res.status);
    }

    if ("exists" in body && body.exists === false) {
        return { exists: false };
    }

    if ("exists" in body && body.exists === true && body.kdfSalt && body.kdfParams) {
        return body as PreloginSuccess;
    }

    throw new PreloginError("Prelogin returned an unexpected payload", res.status);
}

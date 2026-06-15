import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";
import { jsonResponse, normalizeEmail } from "../_shared/cors.ts";
import { verifyRecoveryKey } from "../_shared/recovery-verify.ts";

interface RecoveryResetRequest {
    email?: string;
    recoveryKey?: string;
    authHashPassword?: string;
    kdfSalt?: string;
    kdfParams?: Record<string, unknown>;
    wrappedDekPassphrase?: string;
    wrappedDekPassphraseNonce?: string;
}

Deno.serve(async (req: Request) => {
    if (req.method === "OPTIONS") {
        return new Response("ok", {
            headers: {
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
                "Access-Control-Allow-Methods": "POST, OPTIONS",
            },
        });
    }

    if (req.method !== "POST") {
        return jsonResponse({ error: "Method not allowed" }, 405);
    }

    let payload: RecoveryResetRequest;
    try {
        payload = (await req.json()) as RecoveryResetRequest;
    } catch {
        return jsonResponse({ error: "Invalid JSON body" }, 400);
    }

    const email = normalizeEmail(payload.email);
    const recoveryKey = typeof payload.recoveryKey === "string" ? payload.recoveryKey.trim() : "";
    const authHashPassword = typeof payload.authHashPassword === "string" ? payload.authHashPassword : "";

    if (!email || !recoveryKey || !authHashPassword || !payload.kdfSalt || !payload.kdfParams || !payload.wrappedDekPassphrase || !payload.wrappedDekPassphraseNonce) {
        return jsonResponse({ error: "Missing required fields" }, 400);
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    if (!supabaseUrl || !serviceRoleKey) {
        return jsonResponse({ error: "Server misconfigured" }, 500);
    }

    const admin = createClient(supabaseUrl, serviceRoleKey, {
        auth: { persistSession: false, autoRefreshToken: false },
    });

    const { data: recoveryRow, error: recoveryError } = await admin.rpc("get_recovery_wrapped_dek", { target_email: email });
    if (recoveryError) {
        return jsonResponse({ error: "Could not verify recovery key" }, 500);
    }

    const row = Array.isArray(recoveryRow) ? recoveryRow[0] : recoveryRow;
    if (!row?.wrapped_dek_recovery_b64 || !row?.wrapped_dek_recovery_nonce_b64) {
        return jsonResponse({ error: "No account found for that email" }, 404);
    }

    const valid = await verifyRecoveryKey(
        recoveryKey,
        row.wrapped_dek_recovery_b64 as string,
        row.wrapped_dek_recovery_nonce_b64 as string,
    );
    if (!valid) {
        return jsonResponse({ error: "Recovery key is incorrect" }, 403);
    }

    const { data: userLookup, error: userError } = await admin.auth.admin.getUserByEmail(email);
    if (userError || !userLookup.user) {
        return jsonResponse({ error: "No account found for that email" }, 404);
    }

    const account = userLookup.user;

    const { error: profileError } = await admin
        .from("profiles")
        .update({
            kdf_salt: payload.kdfSalt,
            kdf_params: payload.kdfParams,
            wrapped_dek_passphrase: payload.wrappedDekPassphrase,
            wrapped_dek_passphrase_nonce: payload.wrappedDekPassphraseNonce,
        })
        .eq("user_id", account.id);

    if (profileError) {
        return jsonResponse({ error: profileError.message }, 500);
    }

    const { error: passwordError } = await admin.auth.admin.updateUserById(account.id, {
        password: authHashPassword,
    });

    if (passwordError) {
        return jsonResponse({ error: passwordError.message }, 500);
    }

    return jsonResponse({ ok: true });
});

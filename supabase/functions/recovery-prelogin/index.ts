import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";
import { corsHeaders, jsonResponse, normalizeEmail } from "../_shared/cors.ts";

interface RecoveryPreloginRequest {
    email?: string;
}

Deno.serve(async (req: Request) => {
    if (req.method === "OPTIONS") {
        return new Response("ok", { headers: corsHeaders });
    }

    if (req.method !== "POST") {
        return jsonResponse({ error: "Method not allowed" }, 405);
    }

    let payload: RecoveryPreloginRequest;
    try {
        payload = (await req.json()) as RecoveryPreloginRequest;
    } catch {
        return jsonResponse({ error: "Invalid JSON body" }, 400);
    }

    const email = normalizeEmail(payload.email);
    if (!email) {
        return jsonResponse({ error: "A valid email is required" }, 400);
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    if (!supabaseUrl || !serviceRoleKey) {
        return jsonResponse({ error: "Server misconfigured" }, 500);
    }

    const admin = createClient(supabaseUrl, serviceRoleKey, {
        auth: { persistSession: false, autoRefreshToken: false },
    });

    const { data, error } = await admin.rpc("get_recovery_wrapped_dek", { target_email: email });
    if (error) {
        console.error("recovery-prelogin: rpc failed", error.message);
        return jsonResponse({ error: "Could not look up account" }, 500);
    }

    const row = Array.isArray(data) ? data[0] : data;
    if (!row?.wrapped_dek_recovery_b64 || !row?.wrapped_dek_recovery_nonce_b64) {
        return jsonResponse({ exists: false });
    }

    return jsonResponse({
        exists: true,
        wrappedDekRecovery: row.wrapped_dek_recovery_b64 as string,
        wrappedDekRecoveryNonce: row.wrapped_dek_recovery_nonce_b64 as string,
    });
});

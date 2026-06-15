import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders: Record<string, string> = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
};

interface PreloginRequest {
    email?: string;
}

interface PreloginSuccess {
    exists: true;
    kdfSalt: string;
    kdfParams: Record<string, unknown>;
}

interface PreloginMissing {
    exists: false;
}

type PreloginResponse = PreloginSuccess | PreloginMissing;

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function jsonResponse(body: PreloginResponse | { error: string }, status = 200): Response {
    return new Response(JSON.stringify(body), {
        status,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
}

function normalizeEmail(raw: unknown): string | null {
    if (typeof raw !== "string") return null;
    const email = raw.trim().toLowerCase();
    if (!email || !EMAIL_PATTERN.test(email)) return null;
    return email;
}

Deno.serve(async (req: Request) => {
    if (req.method === "OPTIONS") {
        return new Response("ok", { headers: corsHeaders });
    }

    if (req.method !== "POST") {
        return jsonResponse({ error: "Method not allowed" }, 405);
    }

    let payload: PreloginRequest;
    try {
        payload = (await req.json()) as PreloginRequest;
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
        console.error("prelogin: missing Supabase environment variables");
        return jsonResponse({ error: "Server misconfigured" }, 500);
    }

    const admin = createClient(supabaseUrl, serviceRoleKey, {
        auth: { persistSession: false, autoRefreshToken: false },
    });

    const { data, error } = await admin.rpc("get_prelogin_kdf", { target_email: email });

    if (error) {
        console.error("prelogin: rpc failed", error.message);
        return jsonResponse({ error: "Could not look up account" }, 500);
    }

    const row = Array.isArray(data) ? data[0] : data;
    if (!row?.kdf_salt_b64 || !row?.kdf_params) {
        return jsonResponse({ exists: false });
    }

    return jsonResponse({
        exists: true,
        kdfSalt: row.kdf_salt_b64 as string,
        kdfParams: row.kdf_params as Record<string, unknown>,
    });
});

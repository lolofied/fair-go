import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { getSupabaseConfig } from "@/config/supabase";

let client: SupabaseClient | null = null;

export function getSupabaseClient(): SupabaseClient {
    const config = getSupabaseConfig();
    if (!config) {
        throw new Error("Encrypted sync is not configured on this deployment.");
    }

    if (!client) {
        client = createClient(config.url, config.anonKey, {
            auth: {
                persistSession: true,
                autoRefreshToken: true,
            },
        });
    }

    return client;
}

/** Reset the cached client (tests). */
export function resetSupabaseClient(): void {
    client = null;
}

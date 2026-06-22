import { handleSupportContactRequest } from "./support-contact";

const API_HOST = "us.i.posthog.com";
const ASSET_HOST = "us-assets.i.posthog.com";
const INGEST_PREFIX = "/ingest";
const SUPPORT_CONTACT_PATH = "/api/support";

interface Env {
    ASSETS: Fetcher;
    RESEND_API_KEY?: string;
    SUPPORT_TO_EMAIL?: string;
    SUPPORT_FROM_EMAIL?: string;
}

function stripIngestPrefix(pathname: string): string {
    if (pathname === INGEST_PREFIX) {
        return "/";
    }

    if (pathname.startsWith(`${INGEST_PREFIX}/`)) {
        return pathname.slice(INGEST_PREFIX.length);
    }

    return pathname;
}

function corsHeaders(request: Request): Headers {
    const headers = new Headers();
    const origin = request.headers.get("Origin");

    headers.set("Access-Control-Allow-Origin", origin ?? "*");
    headers.set("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
    headers.set("Access-Control-Allow-Headers", "*");
    headers.set("Access-Control-Max-Age", "86400");

    return headers;
}

function withCors(response: Response, request: Request): Response {
    const headers = new Headers(response.headers);

    for (const [key, value] of corsHeaders(request).entries()) {
        headers.set(key, value);
    }

    return new Response(response.body, {
        status: response.status,
        statusText: response.statusText,
        headers,
    });
}

async function retrieveAsset(request: Request, pathname: string, ctx: ExecutionContext): Promise<Response> {
    const cached = await caches.default.match(request);

    if (cached) {
        return cached;
    }

    const response = await fetch(`https://${ASSET_HOST}${pathname}`);

    ctx.waitUntil(caches.default.put(request, response.clone()));

    return response;
}

async function forwardRequest(request: Request, pathWithSearch: string): Promise<Response> {
    const ip = request.headers.get("CF-Connecting-IP") ?? "";
    const originHeaders = new Headers(request.headers);

    originHeaders.delete("cookie");
    originHeaders.set("X-Forwarded-For", ip);

    const originRequest = new Request(`https://${API_HOST}${pathWithSearch}`, {
        method: request.method,
        headers: originHeaders,
        body: request.method !== "GET" && request.method !== "HEAD" ? await request.arrayBuffer() : null,
        redirect: request.redirect,
    });

    return fetch(originRequest);
}

async function handlePostHogRequest(request: Request, ctx: ExecutionContext): Promise<Response> {
    if (request.method === "OPTIONS") {
        return new Response(null, {
            status: 204,
            headers: corsHeaders(request),
        });
    }

    const url = new URL(request.url);
    const pathWithSearch = stripIngestPrefix(url.pathname) + url.search;
    const response =
        pathWithSearch.startsWith("/static/") || pathWithSearch.startsWith("/array/")
            ? await retrieveAsset(request, pathWithSearch, ctx)
            : await forwardRequest(request, pathWithSearch);

    return withCors(response, request);
}

function isPostHogPath(pathname: string): boolean {
    return pathname === INGEST_PREFIX || pathname.startsWith(`${INGEST_PREFIX}/`);
}

export default {
    async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
        const { pathname } = new URL(request.url);

        if (isPostHogPath(pathname)) {
            return handlePostHogRequest(request, ctx);
        }

        if (pathname === SUPPORT_CONTACT_PATH) {
            return handleSupportContactRequest(request, env);
        }

        return env.ASSETS.fetch(request);
    },
};

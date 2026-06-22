/**
 * Capture Fair Go UI screenshots for blog and guide previews.
 * Requires: dev server on http://localhost:5173
 * Usage: node scripts/capture-guide-images.mjs
 */

import { mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const OUT_DIR = join(ROOT, "public/images");
const BASE_URL = process.env.FAIRGO_URL ?? "http://localhost:5173";

const CHECKER_KEY = "fairgo.checker.v1";
const DB_NAME = "fairgo.case.v1";

function daysAgoISO(n) {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() - n);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

const demoAnswers = {
    dismissed: "terminated",
    effective_date: daysAgoISO(5),
    employee_status: "employee",
    employment_type: "casual",
    casual_regular: true,
    casual_expectation: false,
    employer_size: "unsure",
    size_estimate: "15_plus",
    has_associated_entities: "yes",
    start_date: daysAgoISO(400),
    award_covered: "yes",
    eba_applies: "no",
    salary: 72_000,
    reason: "conduct",
    workplace_rights: ["complaint_or_inquiry"],
    protected_attributes: ["none"],
    decision_maker_aware: "yes",
    name: "Alex Worker",
    role: "Store manager",
    employer_legal_name: "Retail Co Pty Ltd",
    employer_abn: "12 345 678 901",
};

const now = new Date().toISOString();

const demoCaseFile = {
    profile: {
        employee: {
            name: "Alex Worker",
            role: "Store manager",
            employment_type: "casual",
            employee_status: "employee",
            casual_regular: true,
            casual_expectation: false,
            award_or_eba: "award",
            salary: 72_000,
        },
        employer: {
            legal_name: "Retail Co Pty Ltd",
            abn: "12 345 678 901",
            size_estimate: "15_plus",
            has_associated_entities: true,
        },
        dismissal: {
            kind: "terminated",
            effective_date: daysAgoISO(5),
            reason_category: "conduct",
            redundancy_claimed: false,
            days_remaining: 16,
        },
        candidateClaims: [
            {
                claimType: "unfair_dismissal",
                status: "likely",
                deadline: daysAgoISO(-16),
                supportingFacts: [],
                weakeningFacts: [],
                unmetGates: [],
            },
        ],
        flags: [],
    },
    events: [
        {
            id: "evt-1",
            type: "performance_meeting",
            title: "Performance review meeting",
            date: daysAgoISO(45),
            fields: { summary: "Discussed sales targets and customer complaints." },
            elementTags: ["ud_valid_reason", "ud_prior_warnings"],
            linkedDocumentIds: [],
            linkedWitnessIds: [],
            createdAt: now,
            updatedAt: now,
        },
        {
            id: "evt-2",
            type: "show_cause",
            title: "Show cause letter",
            date: daysAgoISO(8),
            fields: { summary: "Employer alleged serious misconduct." },
            elementTags: ["ud_notified_of_reason", "ud_opportunity_to_respond"],
            linkedDocumentIds: [],
            linkedWitnessIds: [],
            createdAt: now,
            updatedAt: now,
        },
    ],
    documents: [],
    witnesses: [],
    meta: {
        createdAt: now,
        updatedAt: now,
        schemaVersion: 1,
        seededFromChecker: true,
    },
};

const seedScript = ({ checkerState, caseFile, clearCase }) => {
    window.localStorage.clear();
    window.localStorage.setItem("fairgo.checker.v1", JSON.stringify(checkerState));

    return new Promise((resolve) => {
        if (clearCase) {
            const request = indexedDB.deleteDatabase("fairgo.case.v1");
            request.onsuccess = () => resolve(null);
            request.onerror = () => resolve(null);
            request.onblocked = () => resolve(null);
            return;
        }

        if (!caseFile) {
            resolve(null);
            return;
        }

        const request = indexedDB.open("fairgo.case.v1", 1);
        request.onupgradeneeded = () => {
            const db = request.result;
            if (!db.objectStoreNames.contains("meta")) db.createObjectStore("meta");
            if (!db.objectStoreNames.contains("files")) db.createObjectStore("files");
        };
        request.onsuccess = () => {
            const db = request.result;
            const tx = db.transaction("meta", "readwrite");
            tx.objectStore("meta").put(caseFile, "casefile");
            tx.oncomplete = () => {
                db.close();
                resolve(null);
            };
        };
        request.onerror = () => resolve(null);
    });
};

async function applySeed(page, seed) {
    await page.goto(`${BASE_URL}/`, { waitUntil: "domcontentloaded" });
    await page.evaluate(seedScript, seed);
    await page.waitForTimeout(300);
}

const CAPTURES = [
    {
        file: "guides/run-the-eligibility-check",
        url: "/",
        seed: { checkerState: { answers: {}, screen: "intro", history: [] }, clearCase: true },
        selector: "section:has(.fg-hero-title)",
        pad: 32,
    },
    {
        file: "guides/after-your-eligibility-check",
        url: "/case",
        seed: {
            checkerState: { answers: demoAnswers, screen: "result", history: [] },
            caseFile: demoCaseFile,
        },
        selector: "main",
        pad: 0,
    },
    {
        file: "guides/retrieve-a-saved-case",
        url: "/case/retrieve",
        seed: { checkerState: { answers: {}, screen: "intro", history: [] }, clearCase: true },
        selector: ".fg-shell-main",
        pad: 0,
        waitForText: "Retrieve",
    },
    {
        file: "guides/build-your-case-profile",
        url: "/case/profile",
        seed: {
            checkerState: { answers: demoAnswers, screen: "result", history: [] },
            caseFile: demoCaseFile,
        },
        selector: "main",
        pad: 0,
    },
    {
        file: "guides/add-events-and-evidence",
        url: "/case/events",
        seed: {
            checkerState: { answers: demoAnswers, screen: "result", history: [] },
            caseFile: demoCaseFile,
        },
        selector: "main",
        pad: 0,
    },
    {
        file: "guides/export-your-case-for-a-lawyer",
        url: "/case/export",
        seed: {
            checkerState: { answers: demoAnswers, screen: "result", history: [] },
            caseFile: demoCaseFile,
        },
        selector: "main .print\\:hidden",
        pad: 0,
    },
    {
        file: "guides/how-encrypted-sync-works",
        url: "/case/settings",
        seed: {
            checkerState: { answers: demoAnswers, screen: "result", history: [] },
            caseFile: demoCaseFile,
        },
        selector: "main",
        pad: 0,
    },
    {
        file: "blog/unfair-dismissal-time-limit",
        url: "/case",
        seed: {
            checkerState: { answers: demoAnswers, screen: "result", history: [] },
            caseFile: demoCaseFile,
        },
        selector: '[role="progressbar"], .rounded-full.bg-brand-secondary',
        pad: 24,
        fallbackSelector: "main",
    },
    {
        file: "blog/unfair-dismissal-eligibility",
        url: "/",
        seed: {
            checkerState: { answers: { dismissed: "terminated" }, screen: "employee_status", history: ["dismissed"] },
            clearCase: true,
        },
        selector: ".fg-shell-main",
        pad: 0,
        waitForText: "How were you engaged",
    },
    {
        file: "blog/how-to-lodge-unfair-dismissal",
        url: "/case/export",
        seed: {
            checkerState: { answers: demoAnswers, screen: "result", history: [] },
            caseFile: demoCaseFile,
        },
        selector: ".fg-shell-main",
        pad: 0,
        waitForText: "Export for your lawyer",
    },
    {
        file: "blog/unfair-dismissal-compensation",
        url: "/blog/unfair-dismissal-compensation",
        seed: { checkerState: { answers: {}, screen: "intro", history: [] }, clearCase: true },
        selector: '[role="img"][aria-label*="Typical unfair dismissal compensation"]',
        pad: 16,
        fallbackSelector: ".fg-guide-hero",
    },
];

async function captureOne(page, capture) {
    await applySeed(page, capture.seed);
    await page.goto(`${BASE_URL}${capture.url}`, { waitUntil: "networkidle" });
    await page.waitForTimeout(1000);

    if (capture.waitForText) {
        await page.getByText(new RegExp(capture.waitForText, "i")).first().waitFor({ state: "visible", timeout: 15_000 });
    }

    if (capture.beforeCapture) {
        await capture.beforeCapture(page);
        await page.waitForTimeout(500);
    }

    let locator = page.locator(capture.selector).first();
    if ((await locator.count()) === 0 && capture.fallbackSelector) {
        locator = page.locator(capture.fallbackSelector).first();
    }

    await locator.waitFor({ state: "visible", timeout: 15_000 });

    const box = await locator.boundingBox();
    if (!box) {
        throw new Error(`No bounding box for ${capture.file}`);
    }

    const pad = capture.pad ?? 0;
    const clip = {
        x: Math.max(0, box.x - pad),
        y: Math.max(0, box.y - pad),
        width: Math.min(1280, box.width + pad * 2),
        height: Math.min(720, box.height + pad * 2),
    };

    const outPath = join(OUT_DIR, `${capture.file}.png`);
    mkdirSync(dirname(outPath), { recursive: true });

    await page.screenshot({ path: outPath, clip });
    console.log(`  ✓ ${capture.file}.png`);
}

async function main() {
    mkdirSync(join(OUT_DIR, "guides"), { recursive: true });
    mkdirSync(join(OUT_DIR, "blog"), { recursive: true });

    const browser = await chromium.launch();
    const page = await browser.newPage({
        viewport: { width: 1280, height: 900 },
        deviceScaleFactor: 2,
    });

    console.log(`Capturing guide images from ${BASE_URL}…`);

    const only = process.env.CAPTURE_ONLY?.split(",").map((value) => value.trim()).filter(Boolean);
    const targets = only?.length ? CAPTURES.filter((capture) => only.includes(capture.file)) : CAPTURES;

    for (const capture of targets) {
        try {
            await captureOne(page, capture);
        } catch (error) {
            console.error(`  ✗ ${capture.file}: ${error instanceof Error ? error.message : error}`);
        }
    }

    await browser.close();
    console.log("Done.");
}

main().catch((error) => {
    console.error(error);
    process.exit(1);
});

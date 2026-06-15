import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { defineConfig } from "vite";

export default defineConfig({
    plugins: [react(), tailwindcss()],
    resolve: {
        alias: {
            "@": path.resolve(__dirname, "./src"),
        },
    },
    optimizeDeps: {
        include: ["libsodium-wrappers-sumo", "libsodium-sumo"],
    },
    server: {
        watch: {
            // Native file events can miss saves in some macOS/Cursor setups.
            usePolling: true,
            interval: 100,
        },
    },
});

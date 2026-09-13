import { defineConfig, type Plugin } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import crypto from "crypto";
import { mkdirSync, writeFileSync } from "fs";
import { componentTagger } from "lovable-tagger";
import { sentryVitePlugin } from "@sentry/vite-plugin";

// dist/version.json carries the id of the build that produced it, so a deploy
// can be confirmed from outside without trusting the host's own status.
function versionJsonPlugin(buildId: string): Plugin {
  return {
    name: "version-json",
    apply: "build",
    writeBundle({ dir }) {
      const outDir = dir || "dist";
      mkdirSync(outDir, { recursive: true });
      writeFileSync(path.join(outDir, "version.json"), JSON.stringify({ buildId }));
    },
  };
}

// Uploading source maps needs a token that only exists in CI, so local and
// preview builds simply skip the step instead of failing.
const sentryAuthToken = process.env.SENTRY_AUTH_TOKEN;
// One id per build, shared by version.json, the __APP_BUILD_ID__ the Sentry SDK
// reports as its release, and the release the source maps upload against. If
// these drift, Sentry has the maps but cannot match them to an event.
const buildId = crypto.randomUUID();

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(),
    mode === 'development' &&
    componentTagger(),
    versionJsonPlugin(buildId),
    // Last: it reads the finished bundle and its maps.
    ...(sentryAuthToken
      ? [
          sentryVitePlugin({
            org: process.env.SENTRY_ORG || "leo-tf",
            project: process.env.SENTRY_PROJECT || "",
            authToken: sentryAuthToken,
            // Off by default it would report build metrics to Sentry; nothing
            // here needs that, and it is data leaving the build for no return.
            telemetry: false,
            release: { name: buildId },
            sourcemaps: {
              // Uploaded, then removed from dist. Serving them would publish
              // the whole readable source to anyone who looks.
              filesToDeleteAfterUpload: ["./dist/**/*.js.map"],
            },
          }),
        ]
      : []),
  ].filter(Boolean),
  define: {
    __APP_BUILD_ID__: JSON.stringify(buildId),
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  // Pre-bundle lucide-react in dev so Vite serves one chunk instead of
  // hundreds of individual icon ESM modules. The "1.2 MB lucide" reading
  // we saw in dev was the un-bundled module tree, not the prod output.
  optimizeDeps: {
    include: ['lucide-react'],
  },
  build: {
    // Hidden: emitted for the upload, never referenced from the bundle.
    sourcemap: sentryAuthToken ? "hidden" : false,
    // Target evergreen browsers — shaves dozens of KB of legacy transforms/polyfills.
    target: 'es2020',
    assetsInlineLimit: 2048,
    reportCompressedSize: false,
    rollupOptions: {
      output: {
        assetFileNames: 'assets/[name]-[hash][extname]',
        chunkFileNames: 'assets/[name]-[hash].js',
        entryFileNames: 'assets/[name]-[hash].js',
        // Intentionally minimal manualChunks. Pinning heavy libs like @tiptap,
        // mermaid, cytoscape, katex, emoji-picker-react, or html2canvas as
        // shared vendor chunks makes Vite's modulepreload include them on every
        // page load even when only one route needs them. Letting Rollup split
        // per-route keeps the hot path lean.
        manualChunks: {
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
          'vendor-query': ['@tanstack/react-query'],
          'vendor-supabase': ['@supabase/supabase-js'],
          'vendor-dnd': [
            '@dnd-kit/core',
            '@dnd-kit/sortable',
            '@dnd-kit/utilities',
          ],
        },
      },
    },
  },
}));

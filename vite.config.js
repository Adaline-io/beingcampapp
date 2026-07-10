import { defineConfig, transformWithEsbuild } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/**
 * BeingCamp legacy loader.
 *
 * The original app was authored as ~20 sequential browser scripts that share a
 * single global scope (each ends with `Object.assign(window, {...})`). To keep
 * that design intact while getting a real, minified, no-runtime-Babel build, we
 * concatenate the ordered `src/legacy/NN-*.jsx` files into one ES module so
 * every top-level declaration is visible to its siblings — exactly like the
 * original global scope. New code should live in `src/` proper (services, lib,
 * components) and import from here; the legacy bundle is the design surface we
 * migrate away from screen-by-screen.
 */
const VIRTUAL_ID = 'virtual:beingcamp-app';
const RESOLVED_ID = '\0virtual:beingcamp-app.jsx';

function beingcampLegacy() {
  const dir = path.resolve(__dirname, 'src/legacy');
  const readOrdered = () =>
    fs
      .readdirSync(dir)
      .filter((f) => /^\d+.*\.jsx$/.test(f))
      .sort();

  return {
    name: 'beingcamp-legacy',
    enforce: 'pre',
    resolveId(id) {
      if (id === VIRTUAL_ID) return RESOLVED_ID;
    },
    async load(id) {
      if (id !== RESOLVED_ID) return;
      const files = readOrdered();
      let out = "import React from 'react';\n";
      out += "import ReactDOM from 'react-dom/client';\n";
      // A few legacy paths poke window.React; expose it defensively.
      out += "if (typeof window !== 'undefined') { window.React = React; window.ReactDOM = ReactDOM; }\n";
      for (const f of files) {
        let code = fs.readFileSync(path.join(dir, f), 'utf8');
        // The final mount lives in src/main.jsx — strip any legacy mount calls.
        code = code.replace(/ReactDOM\.createRoot\([^;]*\)\.render\([^;]*\);?/g, '');
        out += `\n/* ===================== ${f} ===================== */\n${code}\n`;
      }
      out += '\nexport { Root };\nexport default Root;\n';
      // Virtual (\0-prefixed) modules skip Vite's built-in esbuild JSX pass, so
      // transform the concatenated JSX → JS here.
      const result = await transformWithEsbuild(out, 'beingcamp-app.jsx', {
        loader: 'jsx',
        jsx: 'transform',
        jsxFactory: 'React.createElement',
        jsxFragment: 'React.Fragment',
      });
      return { code: result.code, map: result.map };
    },
    handleHotUpdate(ctx) {
      if (ctx.file.startsWith(dir)) {
        const mod = ctx.server.moduleGraph.getModuleById(RESOLVED_ID);
        if (mod) ctx.server.moduleGraph.invalidateModule(mod);
        ctx.server.ws.send({ type: 'full-reload' });
        return [];
      }
    },
  };
}

export default defineConfig({
  base: './',
  plugins: [
    beingcampLegacy(),
    // Installable, offline-capable web app. We keep the hand-written
    // public/manifest.webmanifest (linked from index.html) as the manifest.
    VitePWA({
      registerType: 'autoUpdate',
      injectRegister: 'auto',
      manifest: false,
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,webmanifest}'],
        navigateFallback: 'index.html',
        // New deploys take over immediately instead of waiting for every tab
        // to close — prevents users being stuck on a stale cached version.
        skipWaiting: true,
        clientsClaim: true,
        runtimeCaching: [
          {
            // Google Fonts stylesheets + font files
            urlPattern: /^https:\/\/fonts\.(googleapis|gstatic)\.com\/.*/i,
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'google-fonts',
              expiration: { maxEntries: 30, maxAgeSeconds: 60 * 60 * 24 * 365 },
            },
          },
        ],
      },
    }),
  ],
  esbuild: {
    // Classic JSX runtime to match the original app's React.createElement semantics.
    jsx: 'transform',
    jsxFactory: 'React.createElement',
    jsxFragment: 'React.Fragment',
  },
  build: {
    target: 'es2020',
    outDir: 'dist',
    sourcemap: true,
  },
});

import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "Axiom/**",
    "workshop/**",
    "scratch/**",
    "next-env.d.ts",
    // Root-level utility/migration scripts (CommonJS, not app code)
    "*.js",
    "add-gaps.js",
    "add-packs.js",
    "analyze-reorder.js",
    "append-agents.js",
    "append-freshness.js",
    "append-trace.js",
    "append-trace2.js",
    "check-duplicates.js",
    "find-duplicates.js",
    "replace-script.js",
  ]),
  {
    rules: {
      // Drizzle jsonb columns, catch blocks, and utility wrappers intentionally use `any`
      "@typescript-eslint/no-explicit-any": "warn",
      // Allow unused vars prefixed with _ (standard convention)
      "@typescript-eslint/no-unused-vars": ["warn", {
        argsIgnorePattern: "^_",
        varsIgnorePattern: "^_",
        caughtErrorsIgnorePattern: "^_",
      }],
    },
  },
]);

export default eslintConfig;

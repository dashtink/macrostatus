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
    "next-env.d.ts",
    // infra/ is a separate CDK app with its own toolchain/conventions —
    // not meant to be linted against the Next.js config, and cdk.out/ is
    // generated esbuild output, not source we wrote.
    "infra/**",
  ]),
]);

export default eslintConfig;

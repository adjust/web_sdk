import { defineConfig } from "eslint/config";
import { fixupConfigRules } from "@eslint/compat";
import globals from "globals";
import babelParser from "@babel/eslint-parser";
import stylistic from '@stylistic/eslint-plugin'
import typescriptEslint from "@typescript-eslint/eslint-plugin";
import tsParser from "@typescript-eslint/parser";
import jest from "eslint-plugin-jest";
import path from "node:path";
import { fileURLToPath } from "node:url";
import js from "@eslint/js";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const compat = new FlatCompat({
    baseDirectory: __dirname,
    recommendedConfig: js.configs.recommended,
    allConfig: js.configs.all
});

export default defineConfig([{
    extends: fixupConfigRules(compat.extends("eslint:recommended")),
    plugins: {
      '@stylistic': stylistic
    },
    languageOptions: {
        globals: {
            ...globals.browser,
            ...globals.node,
            ...globals.jest,
            Promise: true,
            __ADJUST__NAMESPACE: true,
            __ADJUST__SDK_VERSION: true,
            Utils: true,
        },

        parser: babelParser,
        ecmaVersion: 6,
        sourceType: "module",
    },

    rules: {
        quotes: ["error", "single"],
        "prefer-arrow-callback": "error",
        "prefer-object-spread": "error",
    },
}, {
    files: ["./src/**/*.ts"],

    extends: compat.extends(
        "eslint:recommended",
        "plugin:@typescript-eslint/eslint-recommended",
        "plugin:@typescript-eslint/recommended",
    ),

    plugins: {
        "@typescript-eslint": typescriptEslint,
    },

    languageOptions: {
        parser: tsParser,
        ecmaVersion: 5,
        sourceType: "script",

        parserOptions: {
            project: "./tsconfig.json",
        },
    },

    rules: {
        "@stylistic/eol-last": "error",
        "@typescript-eslint/no-restricted-types": "warn",
        "@typescript-eslint/explicit-module-boundary-types": "off",
        "@typescript-eslint/no-namespace": "warn",
    },
}, {
    files: ["./src/**/*.spec.*"],
    extends: compat.extends("plugin:jest/style"),

    plugins: {
        jest,
    },

    languageOptions: {
        globals: {
            ...globals.jest,
        },
    },

    rules: {
        "jest/prefer-to-have-length": "off",
        "jest/no-disabled-tests": "error",
        "jest/no-focused-tests": "error",
        "jest/no-identical-title": "error",
        "@typescript-eslint/no-var-requires": "off",
        "jest/prefer-to-be": "warn",
    },
}]);

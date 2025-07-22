/** @type {import("prettier").Config} */
const config = {
  plugins: ["prettier-plugin-tailwindcss"],
  semi: true,
  singleQuote: false,
  tabWidth: 2,
  trailingComma: "es5",
  printWidth: 80,
  bracketSpacing: true,
  bracketSameLine: false,
  arrowParens: "always",
  endOfLine: "lf",
  quoteProps: "as-needed",
  jsxSingleQuote: false,
  proseWrap: "preserve",
  htmlWhitespaceSensitivity: "css",
  embeddedLanguageFormatting: "auto",
  singleAttributePerLine: false,
};

module.exports = config; 
import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/**/*.ts", "src/**/*.js"],
  format: ["esm"],
  platform: "neutral",
  dts: true,
  sourcemap: true,
  splitting: false,
  bundle: false,
  clean: true,
});

import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "node:path";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@password-cluster/core": path.resolve(__dirname, "../../packages/core/src/index.ts"),
      "@password-cluster/protocol": path.resolve(__dirname, "../../packages/protocol/src/index.ts")
    }
  },
  server: {
    port: 5173
  }
});

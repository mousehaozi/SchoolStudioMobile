import { defineConfig } from "vite";
import uni from "@dcloudio/vite-plugin-uni";
// https://vitejs.dev/config/
export default defineConfig({
  plugins: [uni()],
  server: {
    host: "0.0.0.0",
    port: 8081,
    proxy: {
      "/api": {
        target: "http://192.168.0.121:8080",
        changeOrigin: true,
        secure: false,
        ws: true,
        rewrite: (path) => {
          if (path.startsWith("/api/v1")) return path;
          return path.replace(/^\/api/, "/api/v1");
        },
      },
    },
  },
});

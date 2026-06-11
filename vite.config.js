import { defineConfig, loadEnv } from "vite";
import uni from "@dcloudio/vite-plugin-uni";

import fs from 'fs';
import path from 'path';

function serveWechatVerifyPlugin() {
  return {
    name: 'serve-wechat-verify',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        if (req.url === '/MP_verify_rsUIbDjyLRUM9FbW.txt') {
          res.setHeader('Content-Type', 'text/plain');
          res.end('rsUIbDjyLRUM9FbW');
        } else {
          next();
        }
      });
    },
    writeBundle(options) {
      if (!options.dir) return;
      const filePath = path.join(options.dir, 'MP_verify_rsUIbDjyLRUM9FbW.txt');
      try {
        fs.writeFileSync(filePath, 'rsUIbDjyLRUM9FbW');
        console.log(`[WeChat Plugin] Wrote WeChat verification file to ${filePath}`);
      } catch (err) {
        console.error('[WeChat Plugin] Error writing verification file:', err);
      }
    }
  };
}

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd());

  return {
    plugins: [uni(), serveWechatVerifyPlugin()],
    server: {
      host: "0.0.0.0",
      port: 8081,
      proxy: {
        "/api": {
          target: env.VITE_PROXY_TARGET,
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
  };
});

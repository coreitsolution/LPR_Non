import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import svgr from 'vite-plugin-svgr';
import Icons from "unplugin-icons/vite"
import pkg from './package.json';
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    tailwindcss(),
    react(),
    svgr({
      svgrOptions: { exportType: "default", ref: true, svgo: false, titleProp: true },
      include: "**/*.svg",
    }),
    Icons({
      compiler: 'jsx',
      jsx: 'react',
    }),
  ],
  define: {
    __APP_VERSION__: JSON.stringify(pkg.version)
  },
})

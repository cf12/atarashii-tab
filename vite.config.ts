import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"
import { viteStaticCopy } from "vite-plugin-static-copy"

import packageJson from './package.json'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    viteStaticCopy({
      targets: [
        {
          src: "public/manifest.json",
          dest: "",
          transform: (content) => {
            return JSON.stringify({
              description: packageJson.description,
              version: packageJson.version,
              ...JSON.parse(content.toString()),
            })
          },
        },
      ],
    }),
  ],
})

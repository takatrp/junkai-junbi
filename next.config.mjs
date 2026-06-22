import path from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = path.dirname(fileURLToPath(import.meta.url));
const isGithubPages = process.env.GITHUB_PAGES === "true";

const nextConfig = {
  reactStrictMode: true,
  distDir: isGithubPages ? "out" : ".next-build",
  outputFileTracingRoot: projectRoot,
  ...(isGithubPages
    ? {
        output: "export",
        basePath: "/junkai-junbi",
        assetPrefix: "/junkai-junbi/",
        trailingSlash: true,
        images: {
          unoptimized: true
        }
      }
    : {})
};

export default nextConfig;

/** Origins allowed for CORS / Socket.IO (browser sends origin without paths). */
export function getAllowedOrigins() {
  const localhost = [
    "http://localhost:5173",
    "http://localhost:5174",
    "http://localhost:3000",
    "http://localhost:4173",
    "http://127.0.0.1:5173",
    "http://127.0.0.1:5174",
    "http://127.0.0.1:3000",
  ];

  const production = ["https://jansetu-alpha.vercel.app"];

  const fromEnv = [process.env.CORS, process.env.FRONTEND_URL]
    .filter(Boolean)
    .flatMap((v) => v.split(","))
    .map((v) => {
      const trimmed = v.trim();
      try {
        return new URL(trimmed).origin;
      } catch {
        return trimmed.replace(/\/$/, "");
      }
    });

  return [...new Set([...localhost, ...production, ...fromEnv])];
}

export function isOriginAllowed(origin) {
  if (!origin) return true;
  const normalized = origin.replace(/\/$/, "");
  const allowed = getAllowedOrigins();
  if (allowed.includes(normalized) || allowed.includes(origin)) return true;
  // Vercel preview deployments: https://<project>-<hash>.vercel.app
  if (/^https:\/\/[\w-]+\.vercel\.app$/.test(normalized)) return true;
  return false;
}

import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import fs from "node:fs";
import path from "node:path";

const reportsPath = path.resolve(__dirname, "data", "error-reports.json");

type ErrorReport = {
  cardId: string;
  resolved: boolean;
};

function readReports(): ErrorReport[] {
  try {
    const parsed = JSON.parse(fs.readFileSync(reportsPath, "utf8")) as ErrorReport[];
    return Array.isArray(parsed) ? parsed.filter((report) => report && typeof report.cardId === "string" && typeof report.resolved === "boolean") : [];
  } catch {
    return [];
  }
}

function writeReports(reports: ErrorReport[]) {
  fs.writeFileSync(reportsPath, `${JSON.stringify(reports, null, 2)}\n`);
}

function readRequestBody(request: import("node:http").IncomingMessage) {
  return new Promise<string>((resolve, reject) => {
    let body = "";
    request.setEncoding("utf8");
    request.on("data", (chunk) => {
      body += chunk;
    });
    request.on("end", () => resolve(body));
    request.on("error", reject);
  });
}

export default defineConfig({
  base: "./",
  plugins: [
    react(),
    {
      name: "error-reports-json-api",
      configureServer(server) {
        server.middlewares.use("/api/error-reports", async (request, response) => {
          response.setHeader("content-type", "application/json; charset=utf-8");

          if (request.method === "GET") {
            response.end(JSON.stringify({ reports: readReports() }));
            return;
          }

          if (request.method === "POST") {
            try {
              const body = JSON.parse((await readRequestBody(request)) || "{}") as { cardId?: unknown };
              const cardId = typeof body.cardId === "string" ? body.cardId.trim() : "";

              if (!cardId) {
                response.statusCode = 400;
                response.end(JSON.stringify({ error: "cardId is required" }));
                return;
              }

              const reports = readReports();
              const existing = reports.find((report) => report.cardId === cardId);

              if (!existing) {
                reports.push({ cardId, resolved: false });
                writeReports(reports);
              } else if (existing.resolved) {
                existing.resolved = false;
                writeReports(reports);
              }

              response.end(JSON.stringify({ reports }));
            } catch {
              response.statusCode = 400;
              response.end(JSON.stringify({ error: "Invalid JSON" }));
            }
            return;
          }

          response.statusCode = 405;
          response.end(JSON.stringify({ error: "Method not allowed" }));
        });
      },
    },
  ],
});

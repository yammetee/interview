import fs from "node:fs";
import path from "node:path";

const reportsPath = path.join(process.cwd(), "data", "error-reports.json");

function readReports() {
  try {
    const parsed = JSON.parse(fs.readFileSync(reportsPath, "utf8"));
    return Array.isArray(parsed)
      ? parsed.filter((report) => report && typeof report.cardId === "string" && typeof report.resolved === "boolean")
      : [];
  } catch {
    return [];
  }
}

export default function handler(request, response) {
  if (request.method === "GET") {
    response.status(200).json({ reports: readReports() });
    return;
  }

  if (request.method === "POST") {
    const cardId = typeof request.body?.cardId === "string" ? request.body.cardId.trim() : "";

    if (!cardId) {
      response.status(400).json({ error: "cardId is required" });
      return;
    }

    const reports = readReports();
    const existingReports = reports.filter((report) => report.cardId !== cardId);
    response.status(200).json({ reports: [...existingReports, { cardId, resolved: false }] });
    return;
  }

  response.status(405).json({ error: "Method not allowed" });
}

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const bacaJson = (namaFile) => {
  const filePath = path.join(__dirname, "../data", namaFile);

  if (!fs.existsSync(filePath)) {
    return [];
  }

  const isi = fs.readFileSync(filePath, "utf-8");
  return JSON.parse(isi || "[]");
};
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const tulisJson = (namaFile, data) => {
  const filePath = path.join(__dirname, "../data", namaFile);
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf-8");
};
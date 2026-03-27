import fs from "fs";
import path from "path";

export function bacaJson(namaFile) {
  const filePath = path.resolve("src/data", namaFile);

  if (!fs.existsSync(filePath)) {
    return [];
  }

  const isi = fs.readFileSync(filePath, "utf-8");
  if (!isi.trim()) {
    return [];
  }

  return JSON.parse(isi);
}
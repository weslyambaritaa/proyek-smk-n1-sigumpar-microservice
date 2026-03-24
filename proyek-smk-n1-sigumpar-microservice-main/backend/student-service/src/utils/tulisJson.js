import fs from "fs";
import path from "path";

export function tulisJson(namaFile, data) {
  const filePath = path.resolve("src/data", namaFile);
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf-8");
}
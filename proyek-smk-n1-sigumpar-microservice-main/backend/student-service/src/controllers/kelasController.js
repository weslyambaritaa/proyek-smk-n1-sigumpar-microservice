import { bacaJson } from "../utils/bacaJson.js";

export function getKelas(req, res) {
  const data = bacaJson("kelas.json");
  res.json(data);
}
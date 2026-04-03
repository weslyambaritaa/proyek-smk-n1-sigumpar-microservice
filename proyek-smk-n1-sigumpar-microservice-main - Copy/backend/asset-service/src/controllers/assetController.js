export const uploadAset = (req, res) => {
  if (!req.file) {
    return res.status(400).json({
      success: false,
      message: "File tidak ditemukan",
    });
  }

  const kategori = req.body.kategori;
  const fileUrl = `/uploads/${kategori}/${req.file.filename}`;

  res.status(201).json({
    success: true,
    message: "Upload file berhasil",
    data: {
      namaAsli: req.file.originalname,
      namaFile: req.file.filename,
      mimeType: req.file.mimetype,
      ukuran: req.file.size,
      kategori,
      fileUrl,
      uploadedBy: req.user?.preferred_username || req.user?.name || "unknown",
    },
  });
};
const { Pool } = require("pg")

const pool = new Pool({
  user: process.env.DB_USER,
  host: "localhost",
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: 5432
})

/*
GET
Melihat semua review wakasek
*/
const getAllReviewWakasek = async (req, res) => {
  try {

    const result = await pool.query(`
      SELECT rw.id,
             rw.perangkat_id,
             pp.nama_perangkat,
             rw.komentar
      FROM review_wakasek rw
      LEFT JOIN perangkat_pembelajaran pp
      ON rw.perangkat_id = pp.id
      ORDER BY rw.id DESC
    `)

    res.json({
      success: true,
      data: result.rows
    })

  } catch (error) {

    console.error(error)

    res.status(500).json({
      success: false,
      message: "Terjadi kesalahan server"
    })

  }
}


/*
POST
Menambahkan review wakasek
*/
const createReviewWakasek = async (req, res) => {

  try {

    const { perangkat_id, komentar } = req.body

    if (!perangkat_id || !komentar) {
      return res.status(400).json({
        success: false,
        message: "perangkat_id dan komentar wajib diisi"
      })
    }

    const result = await pool.query(
      `INSERT INTO review_wakasek (perangkat_id, komentar)
       VALUES ($1,$2)
       RETURNING *`,
      [perangkat_id, komentar]
    )

    res.status(201).json({
      success: true,
      message: "Review Wakasek berhasil ditambahkan",
      data: result.rows[0]
    })

  } catch (error) {

    console.error(error)

    res.status(500).json({
      success: false,
      message: "Terjadi kesalahan server"
    })

  }

}


module.exports = {
  getAllReviewWakasek,
  createReviewWakasek
}
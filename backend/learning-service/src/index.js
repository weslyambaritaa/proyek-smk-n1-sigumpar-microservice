const express = require("express")
const app = express()

const learningRoutes = require("./routes/learningRoutes")

app.use(express.json())

app.use("/learning", learningRoutes)

const PORT = process.env.PORT || 3006

app.listen(PORT, () => {
  console.log(`Learning Service running on port ${PORT}`)
})
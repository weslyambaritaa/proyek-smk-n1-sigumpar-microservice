const bcrypt = require("bcrypt");
const password = "admin123"; // ganti dengan password yang ingin Anda gunakan
bcrypt.hash(password, 10).then((hash) => console.log(hash));

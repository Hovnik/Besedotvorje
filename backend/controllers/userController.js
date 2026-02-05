const User = require("../models/User");
const bcrypt = require("bcrypt");

const loginUser = async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username) {
      return res.status(400).json({ error: "Uporabniško ime je obvezno" });
    }
    if (!password) {
      return res.status(400).json({ error: "Geslo je obvezno" });
    }

    // Search for the user in the database
    const user = await User.findOne({ username: username.toLowerCase() });

    if (!user) {
      return res
        .status(401)
        .json({ error: "Napačno uporabniško ime ali geslo" });
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);

    if (!isPasswordValid) {
      return res
        .status(401)
        .json({ error: "Napačno uporabniško ime ali geslo" });
    }

    // Successful login
    res.json({
      success: true,
      message: "Prijava uspešna",
      user: {
        username: user.username,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ error: "Napaka pri prijavi" });
  }
};

module.exports = {
  loginUser,
};

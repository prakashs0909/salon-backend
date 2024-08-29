const express = require("express");
const User = require("../models/User");
const router = express.Router();
const { body, validationResult } = require("express-validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const fetchuser = require("../middleware/fetchuser");
require('dotenv').config()

const jwt_secret = process.env.SECRET_KEY;

// Create an admin using: POST "/api/auth/createadmin"
router.post('/createadmin', async (req, res) => {
  try {
    const salt = await bcrypt.genSalt(10);
    const secPass = await bcrypt.hash("12345", salt);

    const user = new User({
      name: 'admin',
      email: 'admin@gmail.com',
      password: secPass,
      role: 'admin'
    });

    // Save the user (admin) to the database
    await user.save();

    const data = {
      user: {
        id: user._id,  // Ensure that the ID is retrieved after saving
        role: user.role,
      },
    };

    const authToken = jwt.sign(data, jwt_secret);

    // Send authToken as response
    res.json({ success: true, authToken });
  } catch (error) {
    console.log(error.message);
    res.status(500).send("Some error occurred");
  }
});

// Create a user using: POST "/api/auth/createuser"
router.post(
  "/createuser",
  [
    body("name", "Enter a valid name").isLength({ min: 3 }),
    body("email", "Enter a valid email").isEmail(),
    body("password", "Password must be at least five characters").isLength({ min: 5 }),
  ],
  async (req, res) => {
    let success = false;
    const result = validationResult(req);
    if (!result.isEmpty()) {
      return res.status(400).json({ errors: result.array() });
    }
    try {
      // Check whether the user already exists
      let user = await User.findOne({ email: req.body.email });
      if (user) {
        return res.status(400).json({ error: "Sorry, a user with this email already exists" });
      }

      const salt = await bcrypt.genSalt(10);
      const secPass = await bcrypt.hash(req.body.password, salt);

      // Create a new user
      user = new User({
        name: req.body.name,
        email: req.body.email,
        password: secPass,
        role: req.body.role,
      });

      await user.save();  // Save the user to the database

      const data = {
        user: {
          id: user._id,  // Ensure that the ID is retrieved after saving
          role: user.role,
        },
      };

      const authToken = jwt.sign(data, jwt_secret);
      success = true;
      res.json({ success, authToken });
    } catch (error) {
      console.log(error.message);
      res.status(500).send("Some error occurred");
    }
  }
);

// Authenticate a user using: POST "/api/auth/login"
router.post(
  "/login",
  [
    body("email", "Enter a valid email").isEmail(),
    body("password", "Password cannot be blank").exists(),
  ],
  async (req, res) => {
    let success = false;
    const result = validationResult(req);
    if (!result.isEmpty()) {
      return res.status(400).json({ errors: result.array() });
    }

    const { email, password } = req.body;

    try {
      let user = await User.findOne({ email });
      if (!user) {
        return res.status(400).json({ error: "Please try to log in with correct credentials" });
      }

      const passwordCompare = await bcrypt.compare(password, user.password);
      if (!passwordCompare) {
        return res.status(400).json({ error: "Please try to log in with correct credentials" });
      }

      const data = {
        user: {
          id: user._id,  // Ensure that the ID is retrieved correctly
          role: user.role,
        },
      };

      const authToken = jwt.sign(data, jwt_secret);
      success = true;
      res.json({ success, authToken });
    } catch (error) {
      console.log(error.message);
      res.status(500).send("Internal server error");
    }
  }
);

// Get user details using: POST "/api/auth/getuser"
router.post("/getuser", fetchuser, async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId).select("-password");
    res.send(user);
  } catch (error) {
    console.log(error.message);
    res.status(500).send("Internal server error");
  }
});

module.exports = router;

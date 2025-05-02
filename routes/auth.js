const express = require("express");
const User = require("../models/User");
const router = express.Router();
const { body, validationResult } = require("express-validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const fetchuser = require("../middleware/fetchuser");
require("dotenv").config();
const nodemailer = require("nodemailer");

const jwt_secret = process.env.SECRET_KEY;

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL,
    pass: process.env.EMAIL_PASSWORD,
  },
});

async function sendEmailWithRetry(mailOptions, retries = 3) {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      console.log(`Attempt ${attempt}: Sending email to ${mailOptions.to}`);
      const info = await transporter.sendMail(mailOptions);
      console.log("Email sent successfully:", info.response);
      return true;
    } catch (error) {
      console.error(`Attempt ${attempt} failed:`, error.message);
      if (attempt === retries) throw error;
    }
  }
}

// Create an admin using: POST "/api/auth/createadmin"
router.post("/createadmin", async (req, res) => {
  try {
    const salt = await bcrypt.genSalt(10);
    const secPass = await bcrypt.hash("12345", salt);

    const user = new User({
      name: "admin",
      email: "admin@gmail.com",
      password: secPass,
      role: "admin",
    });

    // Save the user (admin) to the database
    await user.save();

    const data = {
      user: {
        id: user._id, // Ensure that the ID is retrieved after saving
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
    body("password", "Password must be at least five characters").isLength({
      min: 5,
    }),
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
        return res
          .status(400)
          .json({ error: "User with this email already exists" });
      }

      const salt = await bcrypt.genSalt(10);
      const secPass = await bcrypt.hash(req.body.password, salt);

      // Create a new user
      user = new User({
        name: req.body.name,
        email: req.body.email,
        password: secPass,
        role: req.body.role,
        verified: false,
      });

      await user.save();

      const data = {
        user: {
          id: user._id,
          role: user.role,
        },
      };
      console.log("veri" , user.verified);

      if (user.verified === false) {
        const authToken = jwt.sign(data, jwt_secret);

        const verificationLink = `${req.protocol}://${req.get(
          "host"
        )}/api/auth/verify/${authToken}`;

        const mailOptions = {
          from: process.env.EMAIL,
          to: req.body.email,
          subject: "Email Verification",
          html: `<p>Hello ${user.name},</p>
                <p>Please verify your email by clicking the link below:</p>
                <a href="${verificationLink}">Verify Email</a>
                <p>If you do not verify the account, you will not be able to log in.</p>`,
        };

        try {
          await sendEmailWithRetry(mailOptions);
          success = true;
          res.json({ success, authToken });
        } catch (error) {
          console.error("Error sending email:", error);
          res
            .status(500)
            .json({ error: "Failed to send verification email. Please try again later." });
        }
      }
    } catch (error) {
      console.log(error.message);
      res.status(500).send("Some error occurred");
    }
  }
);

// Verify email using: GET "/api/auth/verify/:token"
router.get("/verify/:token", async (req, res) => {
  try {
    const { token } = req.params;

    const decoded = jwt.verify(token, jwt_secret);
    const userId = decoded.user.id;

    // Update the user's verification status
    const user = await User.findByIdAndUpdate(
      userId,
      { verified: true },
      { new: true }
    );
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // res.json({ success: true, message: "Email verified successfully" });
    res.redirect(`${process.env.FRONTEND_URL}/Mailverified/${token}`);
  } catch (error) {
    console.error("Error verifying email:", error);
    res.status(400).json({ error: "Invalid or expired token" });
  }
});

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
        return res.status(400).json({ error: "Invalid username and password" });
      }

      const passwordCompare = await bcrypt.compare(password, user.password);
      if (!passwordCompare) {
        return res.status(400).json({ error: "Invalid username and password" });
      }

      if (!user.verified) {
        return res.status(400).json({
          error:
            "Please verify your email before logging in. A new verification link has been sent to your email.",
          resendVerification: true,
        });
      }

      const data = {
        user: {
          id: user._id,
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

router.post("/resend-verification", async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    if (user.verified) {
      return res.status(400).json({ error: "User is already verified" });
    }

    const data = {
      user: {
        id: user._id,
        role: user.role,
      },
    };
    const authToken = jwt.sign(data, jwt_secret);

    const verificationLink = `${req.protocol}://${req.get(
      "host"
    )}/api/auth/verify/${authToken}`;

    const mailOptions = {
      from: process.env.EMAIL,
      to: req.body.email,
      subject: "Resend Email Verification",
      html: `<p>Hello ${user.name},</p>
             <p>Please verify your email by clicking the link below:</p>
             <a href="${verificationLink}">Verify Email</a>`,
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error("Error sending email:", error);
        return res
          .status(500)
          .json({ error: "Failed to resend verification email" });
      }
      res
        .status(200)
        .json({ message: "Verification email resent successfully" });
    });
  } catch (error) {
    console.error("Error resending verification email:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

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

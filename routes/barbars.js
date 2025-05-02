const express = require("express");
const router = express.Router();
const Barbars = require("../models/Barbars");
const { body, validationResult } = require("express-validator");

// Fetch all barbers: GET "/api/barbars/fetchallbarbars"
router.get("/fetchallbarbars", async (req, res) => {
  try {
    const barbars = await Barbars.find();
    res.json(barbars);
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Internal server error");
  }
});

// Add barbers: POST "/api/barbars/addbarbars"
router.post(
  "/addbarbars",
  [body("name", "Enter a valid name").isLength({ min: 2 })],
  async (req, res) => {
    try {
      const { name } = req.body;

      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const newBarbar = new Barbars({
        name,
      });

      const savedBarbar = await newBarbar.save();

      res.json(savedBarbar);
    } catch (error) {
      console.error(error.message);
      res.status(500).send("Internal server error");
    }
  }
);

// Update barbers: PUT "/api/barbars/updatebarbars"
router.put(
  "/updatebarbars/:id",
  [body("name", "Enter a valid name").isLength({ min: 2 })],
  async (req, res) => {
    try {
      const { name } = req.body;

      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const newBarbar = {};

      if (name) {
        newBarbar.name = name;
      }

      // Find the barber to be updated and update it
      let barber = await Barbars.findById(req.params.id);
      if (!barber) {
        return res.status(404).send("Not Found");
      }
      barber = await Barbars.findByIdAndUpdate(
        req.params.id,
        { $set: newBarbar },
        { new: true }
      );
      res.json(barber);
    } catch (error) {
      console.error(error.message);
      res.status(500).send("Internal server error");
    }
  }
);

// Delete barbers: DELETE "/api/barbars/deletebarbars"
router.delete("/deletebarbars/:id", async (req, res) => {
  try {
    // Find the barber to be deleted and delete it
    let barber = await Barbars.findById(req.params.id);
    if (!barber) {
      return res.status(404).send("Not Found");
    }
    barber = await Barbars.findByIdAndDelete(req.params.id);
    res.json({ Success: "Barber has been deleted", barber: barber });
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Internal server error");
  }
});

module.exports = router;
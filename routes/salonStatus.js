const express = require("express");
const router = express.Router();
const Salon = require("../models/SalonStatus"); 

// Get salon status
router.get("/status", async (req, res) => {
  try {
    const salon = await Salon.findOne();
    if (!salon) {
      return res.status(404).json({ message: "Salon status not found" });
    }
    res.json({ isSalonOpen: salon.isSalonOpen, closedDates: salon.closedDates });
  } catch (error) {
    console.error("Error fetching salon status and closed date:", error);
    res.status(500).send("Server Error");
  }
});

// Update salon status
router.put("/status", async (req, res) => {
  try {
    const { isSalonOpen } = req.body;
    if (typeof isSalonOpen !== "boolean") {
      return res.status(400).json({ message: "Invalid isSalonOpen value" });
    }
    const salon = await Salon.findOneAndUpdate({}, { isSalonOpen }, { new: true, upsert: true });
    res.json({ isSalonOpen: salon.isSalonOpen });
  } catch (error) {
    console.error("Error updating salon status:", error);
    res.status(500).send("Server Error");
  }
});
router.put("/closedDates", async (req, res) => {
  try {
    const { date } = req.body;
    if (!date) {
      return res.status(400).json({ message: "Date is required" });
    }

    const salon = await Salon.findOneAndUpdate(
      {},
      { $addToSet: { closedDates: date } }, // Add date to the array if it doesn't already exist
      { new: true, upsert: true }
    );
    res.json({ closedDates: salon.closedDates });
  } catch (error) {
    console.error("Error updating closed dates:", error);
    res.status(500).send("Server Error");
  }
});


// Remove a closed date and update isSalonOpen status
router.delete("/closedDates", async (req, res) => {
  try {
    const { date } = req.body;
    if (!date) {
      return res.status(400).json({ message: "Date is required" });
    }

    // Remove the date from the closedDates array
    const salon = await Salon.findOneAndUpdate(
      {},
      { $pull: { closedDates: date } },
      { new: true }
    );

    if (!salon) {
      return res.status(404).json({ message: "Salon status not found" });
    }

    // If no closed dates remain, set isSalonOpen to true
    const isSalonOpen = salon.closedDates.length === 0;
    salon.isSalonOpen = isSalonOpen;
    await salon.save();

    res.json({ closedDates: salon.closedDates, isSalonOpen: salon.isSalonOpen });
  } catch (error) {
    console.error("Error removing closed date and updating salon status:", error);
    res.status(500).send("Server Error");
  }
});

module.exports = router;
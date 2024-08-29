const express = require("express");
const router = express.Router();
// const History = require("../models/History");
const { body, validationResult } = require("express-validator");
const fetchuser = require("../middleware/fetchuser");
const Booking = require("../models/Booking");

// Fetch all appointments: GET "/api/appointments"
router.get("/fetchallappointments", async (req, res) => {
  try {
    const appointments = await Booking.find();
    res.json(appointments);
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Internal server error");
  }
});

// Fetch user appointments: GET "/api/appointments/fetchuserappointments" login required
router.get("/fetchuserappointments", fetchuser, async (req, res) => {
  try {
    const appointments = await Booking.find({ user: req.user.id });
    res.json(appointments);
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Internal server error");
  }
});

// checking appointment is booked or not: POST "/api/appointments/checkbooking" login required
router.post("/checkbooking", fetchuser, async (req, res) => {
  const { date, time } = req.body;
  try {
    const existingBookings = await Booking.find({ date, time });

    if (existingBookings.length > 0) {
      return res.status(200).json(existingBookings);
    }

    res.status(200).json([]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
});

// Booking an appointment: POST "/api/appointments/addbooking" login required
router.post(
  "/addbooking",
  fetchuser,
  [
    body("name", "Enter a valid name").isLength({ min: 3 }),
    body("date", "Enter a valid date").isDate(),
  ],
  async (req, res) => {
    try {
      const { name, date, time, service } = req.body;

      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const newBooking = new Booking({
        user: req.user.id,
        name,
        date,
        time,
        service,
      });

      const savedBooking = await newBooking.save();

      res.json(savedBooking);
    } catch (error) {
      console.error(error.message);
      res.status(500).send("Internal server error");
    }
  }
);

// Update appointment status: PATCH "/api/appointments/:id/status"
router.patch("/:id/status", async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  try {
    const updatedAppointment = await Booking.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    );

    if (!updatedAppointment) {
      return res.status(404).json({ message: "Appointment not found" });
    }

    res.json(updatedAppointment);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// Cancel an appointment : PATCH "/api/appointments/:id/cancel"
router.patch("/:id/cancel", async (req, res) => {
  try {
    const appointmentId = req.params.id;

    // Find the appointment by ID and update the status to "canceled"
    const updatedAppointment = await Booking.findByIdAndUpdate(
      appointmentId,
      { 
        status: "canceled",
        canceled: true 
      },
      { new: true }
    );

    if (!updatedAppointment) {
      return res.status(404).json({ message: "Appointment not found" });
    }

    res.json({ message: "Appointment canceled successfully", appointment: updatedAppointment });
  } catch (error) {
    console.error("Error canceling appointment:", error);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;

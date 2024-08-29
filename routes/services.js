const express = require("express");
const router = express.Router();
const Services = require("../models/Services");
const { body, validationResult } = require("express-validator");

// Fetch all services: GET "/api/services/fetchallservices"
router.get("/fetchallservices", async (req, res) => {
  try {
    const services = await Services.find();
    res.json(services);
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Internal server error");
  }
});

// Add services: POST "/api/services/addservices"
router.post(
  "/addservices",
  [
    body("name", "Enter a valid name").isLength({ min: 2 }),
    body("price", "Enter a valid date"),
    body("time", "Enter a valid date"),
  ],
  async (req, res) => {
    try {
      const { name, price, time } = req.body;

      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const newService = new Services({
        name,
        price,
        time,
      });

      const savedService = await newService.save();

      res.json(savedService);
    } catch (error) {
      console.error(error.message);
      res.status(500).send("Internal server error");
    }
  }
);

// update services: PUT "/api/services/updateservices"
router.put(
  "/updateservices/:id",
  [
    body("name", "Enter a valid name").isLength({ min: 2 }),
    body("price", "Enter a valid date"),
    body("time", "Enter a valid date"),
  ],
  async (req, res) => {
    try {
      const { name, price, time } = req.body;

      // create new service object
      const newService = {};
      if (name) {
        newService.name = name;
      }
      if (price) {
        newService.price = price;
      }
      if (time) {
        newService.time = time;
      }

      // finding services to update
      let service = await Services.findById(req.params.id);
      if (!service) {
        return res.status(401).send("Not Found");
      }

      service = await Services.findByIdAndUpdate(
        req.params.id,
        { $set: newService },
        { new: true }
      );
      res.json({ service });
    } catch (error) {
      console.error(error.message);
      res.status(500).send("Internal server error");
    }
  }
);

// delete services: DELETE "/api/services/deleteservices"
router.delete("/deleteservices/:id", async (req, res) => {
    try {
        // finding service to delete
    let service = await Services.findById(req.params.id);
      if (!service) {
        return res.status(401).send("Not Found");
      }

      service = await Services.findByIdAndDelete(req.params.id)
      res.json({"Success": "Service has been deleted", service: service})

    } catch (error) {
        console.error(error.message);
        res.status(500).send("Internal server error");
      }
});

module.exports = router;

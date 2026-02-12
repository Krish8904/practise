import express from "express";
import Booking from "../models/booking.js";
import addLog from "../utils/addLog.js";

const router = express.Router();

/**
 * @route   POST /api/bookings
 * @desc    Create a new call booking
 */
router.post("/", async (req, res) => {
  try {
    const { name, phone, topic, date, time } = req.body; // include topic

    // Simple validation
    if (!name || !phone || !date || !time) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const newBooking = new Booking({
      name,
      topic,
      phone,
      date,
      time,
    });

    const savedBooking = await newBooking.save();

    await addLog(`New call booking from ${name} (${phone}) on ${date} at ${time}`, "booking");

    res.status(201).json(savedBooking);
  } catch (err) {
    console.error("Booking Error:", err);
    res.status(500).json({ error: "Failed to create booking" });
  }
});

/**
 * @route   GET /api/bookings
 * @desc    Get all bookings for the dashboard (Sorted by newest first)
 */
router.get("/", async (req, res) => {
  try {
    const bookings = await Booking.find().sort({ createdAt: -1 });
    res.status(200).json(bookings);
  } catch (err) {
    console.error("Fetch Bookings Error:", err);
    res.status(500).json({ error: "Failed to fetch bookings" });
  }
});

// PUT route to update status
router.put("/:id", async (req, res) => {
  const updated = await Booking.findByIdAndUpdate(
    req.params.id,
    { status: "confirmed" },
    { new: true }
  );

  await addLog(`Booking confirmed for ${updated.name}`, "booking");

  res.json(updated);
});

/**
 * @route   DELETE /api/bookings/:id
 * @desc    Delete a specific booking by ID
 */
router.delete("/:id", async (req, res) => {
  try {
    const deletedBooking = await Booking.findByIdAndDelete(req.params.id);

    if (!deletedBooking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    await addLog(`Booking deleted for ${deletedBooking.name}`, "booking");

    res.status(200).json({ message: "Booking deleted successfully" });
  } catch (err) {
    console.error("Delete Error:", err);
    res.status(500).json({ error: "Internal Server Error during deletion" });
  }
});

export default router;
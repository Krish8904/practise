import mongoose from "mongoose";

const BookingSchema = new mongoose.Schema({
  name: { type: String, required: true },
  phone: { type: Number, required: true },
  topic: { type: String, required: false },
  date: { type: String, required: true },
  time: { type: String, required: true },
  status: { type: String, default: "pending" },
  createdAt: { type: Date, default: Date.now },
});

// Use ES Module export
const Booking = mongoose.model("Booking", BookingSchema);
export default Booking;
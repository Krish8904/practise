// models/InvoiceCounter.js
import mongoose from "mongoose";

const invoiceCounterSchema = new mongoose.Schema({
  company: { type: String, required: true, unique: true },
  count:   { type: Number, default: 0 },
});

export default mongoose.model("InvoiceCounter", invoiceCounterSchema);
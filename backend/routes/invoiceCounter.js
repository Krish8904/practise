// routes/invoiceCounter.js
import express from "express";
import InvoiceCounter from "../models/InvoiceCounter.js";

const router = express.Router();

// POST /api/invoice-number/:company
// Atomically increments the counter for the given company and returns the new invoice number.
router.post("/invoice-number/:company", async (req, res) => {
  try {
    const company = decodeURIComponent(req.params.company);

    const result = await InvoiceCounter.findOneAndUpdate(
      { company },
      { $inc: { count: 1 } },
      { upsert: true, new: true }
    );

    const invNum = `INV-${String(result.count).padStart(4, "0")}`;
    res.json({ invNum });
  } catch (err) {
    console.error("Invoice counter error:", err);
    res.status(500).json({ error: "Failed to generate invoice number" });
  }
});

export default router;
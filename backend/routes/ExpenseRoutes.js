import express from "express";
import mongoose from "mongoose";
import Expense from "../models/Expense.js"

const router = express.Router();

/* ───────── OBJECTID LOOKUP PIPELINE ───────── */

const lookupPipeline = [
  {
    $lookup: {
      from: "expensetypes",
      localField: "type",
      foreignField: "_id",
      as: "type",
    },
  },
  {
    $lookup: {
      from: "expensecountries",
      localField: "country",
      foreignField: "_id",
      as: "country",
    },
  },
  {
    $lookup: {
      from: "expensecurrencies",
      localField: "currency",
      foreignField: "_id",
      as: "currency",
    },
  },
  { $unwind: { path: "$type", preserveNullAndEmptyArrays: true } },
  { $unwind: { path: "$country", preserveNullAndEmptyArrays: true } },
  { $unwind: { path: "$currency", preserveNullAndEmptyArrays: true } },

  {
    $addFields: {
      typeLabel: "$type.label",
      countryLabel: "$country.label",
      countryCode: "$country.code",
      currencyLabel: "$currency.label",
      currencySymbol: "$currency.code",
    },
  },

  { $sort: { createdAt: -1 } },
];

/* ───────── GET ALL ───────── */

router.get("/", async (req, res) => {
  try {
    const expenses = await Expense.aggregate(lookupPipeline);
    res.json({ success: true, data: expenses });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

/* ───────── CREATE ───────── */

router.post("/", async (req, res) => {
  try {
    const doc = new Expense(req.body);
    const saved = await doc.save();

    const [resolved] = await Expense.aggregate([
      { $match: { _id: saved._id } },
      ...lookupPipeline,
    ]);

    res.status(201).json({ success: true, data: resolved });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});


/* ───────── UPDATE ───────── */

router.put("/:id", async (req, res) => {
  try {
    const updated = await Expense.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    if (!updated)
      return res.status(404).json({ success: false, message: "Not found" });

    const [resolved] = await Expense.aggregate([
      { $match: { _id: updated._id } },
      ...lookupPipeline,
    ]);

    res.json({ success: true, data: resolved });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

/* ───────── DELETE ───────── */

router.delete("/:id", async (req, res) => {
  try {
    const deleted = await Expense.findByIdAndDelete(req.params.id);
    if (!deleted)
      return res.status(404).json({ success: false, message: "Not found" });

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

export default router;
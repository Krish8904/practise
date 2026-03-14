import express from "express";
import LegalEntity from "../models/LegalEntity.js";

const router = express.Router();

/* ── GET all ── */
router.get("/", async (req, res) => {
  try {
    const entities = await LegalEntity.find().sort({ companyName: 1 }).lean();
    res.json({ success: true, data: entities });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

/* ── POST create (explicit only — does NOT upsert) ── */
router.post("/", async (req, res) => {
  try {
    const {
      companyName, country, localCurrency, foreignCurrency,
      countryName, localCurrencyCode, foreignCurrencyCode,
    } = req.body;

    if (!companyName?.trim())
      return res.status(400).json({ success: false, message: "companyName is required" });

    // Check for duplicate name
    const existing = await LegalEntity.findOne({ companyName: companyName.trim() }).lean();
    if (existing)
      return res.status(409).json({ success: false, message: `A legal entity named "${companyName.trim()}" already exists.` });

    const entity = await LegalEntity.create({
      companyName:         companyName.trim(),
      country:             country             || null,
      localCurrency:       localCurrency       || null,
      foreignCurrency:     foreignCurrency     || null,
      countryName:         countryName         || "",
      localCurrencyCode:   localCurrencyCode   || "",
      foreignCurrencyCode: foreignCurrencyCode || "",
    });

    res.status(201).json({ success: true, data: entity });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

/* ── PUT update by id ── */
router.put("/:id", async (req, res) => {
  try {
    const entity = await LegalEntity.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true }
    );
    if (!entity) return res.status(404).json({ success: false, message: "Not found" });
    res.json({ success: true, data: entity });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

/* ── DELETE by id ── */
router.delete("/:id", async (req, res) => {
  try {
    const entity = await LegalEntity.findByIdAndDelete(req.params.id);
    if (!entity) return res.status(404).json({ success: false, message: "Not found" });
    res.json({ success: true, message: "Legal entity deleted." });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

export default router;
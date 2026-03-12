import express from "express";
import LegalEntity from "../models/LegalEntity.js"

const router = express.Router();

/* ── GET all legal entities ── */
router.get("/", async (req, res) => {
  try {
    const entities = await LegalEntity.find().sort({ companyName: 1 }).lean();
    res.json({ success: true, data: entities });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

/* ── POST create / upsert by companyName ──
   Called automatically by the companies router after a new company is saved.
   Can also be called manually to update currencies / country. */
router.post("/", async (req, res) => {
  try {
    const { companyName, country, localCurrency, foreignCurrency,
            countryName, localCurrencyCode, foreignCurrencyCode } = req.body;

    if (!companyName?.trim())
      return res.status(400).json({ success: false, message: "companyName is required" });

    const entity = await LegalEntity.findOneAndUpdate(
      { companyName: companyName.trim() },
      {
        $set: {
          country:             country             || null,
          localCurrency:       localCurrency       || null,
          foreignCurrency:     foreignCurrency     || null,
          countryName:         countryName         || "",
          localCurrencyCode:   localCurrencyCode   || "",
          foreignCurrencyCode: foreignCurrencyCode || "",
        },
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

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

export default router;
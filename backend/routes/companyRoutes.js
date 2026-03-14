import express from "express";
import mongoose from "mongoose";
import Company from "../models/Company.js";
import LegalEntity from "../models/LegalEntity.js";

const router = express.Router();

const toObjectId = (val) => {
  if (!val || val === "") return null;
  if (mongoose.Types.ObjectId.isValid(val)) return new mongoose.Types.ObjectId(val);
  return null;
};

const sanitizeBody = (body) => ({
  ...body,
  category:         toObjectId(body.category),
  natureOfBusiness: (body.natureOfBusiness || []).filter(v => mongoose.Types.ObjectId.isValid(v)),
  channel:          (body.channel          || []).filter(v => mongoose.Types.ObjectId.isValid(v)),
  subcategory:      (body.subcategory      || []).filter(v => mongoose.Types.ObjectId.isValid(v)),
});

const lookupPipeline = [
  {
    $lookup: {
      from: "natureofbusinesses",
      localField: "natureOfBusiness",
      foreignField: "_id",
      as: "natureOfBusiness",
    },
  },
  {
    $lookup: {
      from: "channels",
      localField: "channel",
      foreignField: "_id",
      as: "channel",
    },
  },
  {
    $lookup: {
      from: "categories",
      localField: "category",
      foreignField: "_id",
      as: "categoryArr",
    },
  },
  {
    $lookup: {
      from: "subcategories",
      localField: "subcategory",
      foreignField: "_id",
      as: "subcategory",
    },
  },
  {
    $addFields: {
      natureOfBusiness: { $map: { input: "$natureOfBusiness", as: "n", in: "$$n.name" } },
      channel:          { $map: { input: "$channel",          as: "c", in: "$$c.name" } },
      category:         { $arrayElemAt: [{ $map: { input: "$categoryArr", as: "c", in: "$$c.name" } }, 0] },
      subcategory:      { $map: { input: "$subcategory",      as: "s", in: "$$s.name" } },
    },
  },
  { $unset: "categoryArr" },
  { $sort: { createdAt: -1 } },
];

/* ─────────────────────────────────────────────
   Helper: sync a saved company → LegalEntity
───────────────────────────────────────────── */
async function syncLegalEntity(savedDoc) {
  try {
    if (!savedDoc?.companyName) return;
    await LegalEntity.findOneAndUpdate(
      { companyName: savedDoc.companyName.trim() },
      {
        $set: {
          country:         savedDoc.country         || null,
          localCurrency:   savedDoc.localCurrency   || null,
          foreignCurrency: savedDoc.foreignCurrency || null,
        },
        $setOnInsert: {
          countryName:         "",
          localCurrencyCode:   "",
          foreignCurrencyCode: "",
        },
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
  } catch (err) {
    console.warn("LegalEntity sync warning:", err.message);
  }
}

/* ── GET all ── */
router.get("/", async (req, res) => {
  try {
    const companies = await Company.aggregate(lookupPipeline);
    res.json({ success: true, data: companies });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

/* ── POST single ── */
router.post("/", async (req, res) => {
  try {
    const company = new Company(sanitizeBody(req.body));
    const saved   = await company.save();

    await syncLegalEntity(saved);

    const [resolved] = await Company.aggregate([
      { $match: { _id: saved._id } },
      ...lookupPipeline,
    ]);
    res.status(201).json({ success: true, data: resolved });
  } catch (err) {
    console.error("Company save error:", err);
    res.status(400).json({ success: false, message: err.message });
  }
});

/* ── POST bulk ── */
router.post("/bulk", async (req, res) => {
  try {
    const { companies } = req.body;
    console.log("Received companies:", companies.length);

    const inserted = [];
    const errors   = [];

    for (const company of companies) {
      try {
        const doc   = new Company(sanitizeBody(company));
        const saved = await doc.save();
        inserted.push(saved._id);
        await syncLegalEntity(saved);
      } catch (err) {
        errors.push(`${company.companyName ?? "Unknown"}: ${err.message}`);
      }
    }

    console.log(`Inserted: ${inserted.length}, Failed: ${errors.length}`);

    res.status(201).json({
      success:       true,
      insertedCount: inserted.length,
      failedCount:   errors.length,
      errors,
    });
  } catch (err) {
    console.error("Bulk insert error:", err);
    res.status(400).json({ success: false, message: err.message });
  }
});

/* ── PUT full update ── */
router.put("/:id", async (req, res) => {
  try {
    const updated = await Company.findByIdAndUpdate(
      req.params.id,
      sanitizeBody(req.body),
      { new: true }
    );
    if (!updated) return res.status(404).json({ success: false, message: "Not found" });

    const [resolved] = await Company.aggregate([
      { $match: { _id: updated._id } },
      ...lookupPipeline,
    ]);
    res.json({ success: true, data: resolved });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

/* ── PATCH — legal entity assignment only ──
   Bypasses sanitizeBody intentionally; only touches
   legal-entity fields so ObjectId arrays are never corrupted. */
router.patch("/:id", async (req, res) => {
  try {
    const {
      legalEntityId,
      legalEntityName,
      country,
      countryName,
      localCurrency,
      localCurrencyCode,
      foreignCurrency,
      foreignCurrencyCode,
    } = req.body;

    const updated = await Company.findByIdAndUpdate(
      req.params.id,
      {
        $set: {
          legalEntityId:       toObjectId(legalEntityId),
          legalEntityName:     legalEntityName     ?? null,
          country:             toObjectId(country),
          countryName:         countryName         ?? null,
          localCurrency:       toObjectId(localCurrency),
          localCurrencyCode:   localCurrencyCode   ?? null,
          foreignCurrency:     toObjectId(foreignCurrency),
          foreignCurrencyCode: foreignCurrencyCode ?? null,
        },
      },
      { new: true }
    );

    if (!updated) return res.status(404).json({ success: false, message: "Company not found" });
    res.json({ success: true, data: updated });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

export default router;
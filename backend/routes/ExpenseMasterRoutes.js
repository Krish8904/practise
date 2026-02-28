import express from "express";
import ExpenseType from "../models/masters/ExpenseTypes.js"
import ExpenseCountry from "../models/masters/ExpenseCountry.js"
import ExpenseCurrency from "../models/masters/ExpenseCurrency.js";

const router = express.Router();

// Generic CRUD builder
const buildCRUD = (Model) => ({
  getAll: async (req, res) => {
    try {
      const items = await Model.find({ isActive: true }).sort({ order: 1 });
      res.json({ success: true, data: items });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  },
  create: async (req, res) => {
    try {
      const item = new Model(req.body);
      const saved = await item.save();
      res.status(201).json({ success: true, data: saved });
    } catch (err) {
      res.status(400).json({ success: false, message: err.message });
    }
  },
  update: async (req, res) => {
    try {
      const updated = await Model.findByIdAndUpdate(req.params.id, req.body, { new: true });
      if (!updated) return res.status(404).json({ success: false, message: "Not found" });
      res.json({ success: true, data: updated });
    } catch (err) {
      res.status(400).json({ success: false, message: err.message });
    }
  },
  remove: async (req, res) => {
    try {
      const deleted = await Model.findByIdAndUpdate(
        req.params.id,
        { isActive: false },
        { new: true }
      );
      if (!deleted) return res.status(404).json({ success: false, message: "Not found" });
      res.json({ success: true, data: deleted });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  }
});

// ── Expense Type ──
const typeCRUD = buildCRUD(ExpenseType);
router.get("/type", typeCRUD.getAll);
router.post("/type", typeCRUD.create);
router.put("/type/:id", typeCRUD.update);
router.delete("/type/:id", typeCRUD.remove);

// ── Expense Country ──
const countryCRUD = buildCRUD(ExpenseCountry);
router.get("/country", countryCRUD.getAll);
router.post("/country", countryCRUD.create);
router.put("/country/:id", countryCRUD.update);
router.delete("/country/:id", countryCRUD.remove);

// ── Expense Currency ──
const currencyCRUD = buildCRUD(ExpenseCurrency);
router.get("/currency", currencyCRUD.getAll);
router.post("/currency", currencyCRUD.create);
router.put("/currency/:id", currencyCRUD.update);
router.delete("/currency/:id", currencyCRUD.remove);

// ── Combined endpoint for forms ──
router.get("/all", async (req, res) => {
  try {
    const [types, countries, currencies] = await Promise.all([
      ExpenseType.find({ isActive: true }).sort({ order: 1 }),
      ExpenseCountry.find({ isActive: true }).sort({ order: 1 }),
      ExpenseCurrency.find({ isActive: true }).sort({ order: 1 }),
    ]);
    res.json({
      success: true,
      data: { types, countries, currencies }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

export default router;
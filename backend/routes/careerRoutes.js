import express from "express";
import Page from "../models/page.js";

const router = express.Router();

// 1. GET Career Page Data
router.get("/", async (req, res) => {
  try {
    const page = await Page.findOne({ pageName: "career" });
    if (!page) return res.status(404).json({ message: "Career page not found" });
    res.json(page);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 2. POST: Add a new job opening
router.post("/job", async (req, res) => {
  try {
    const { title, category, location, type, description } = req.body;
    const page = await Page.findOne({ pageName: "career" });

    if (!page) return res.status(404).json({ message: "Career page document not found" });

    // Ensure structure exists
    if (!page.sections) page.sections = {};
    if (!page.sections.jobCategories) page.sections.jobCategories = [];

    // Find if the category already exists
    let categorySection = page.sections.jobCategories.find(cat => cat.category === category);

    if (categorySection) {
      categorySection.jobs.push({ title, location, type, description });
    } else {
      // Create new category if it doesn't exist
      page.sections.jobCategories.push({
        category,
        jobs: [{ title, location, type, description }]
      });
    }

    // Since it's a Mixed type, we must tell Mongoose the data changed
    page.markModified('sections'); 
    await page.save();
    res.status(201).json(page);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 3. PUT: Update an existing job
router.put("/job/:catIndex/:jobIndex", async (req, res) => {
  try {
    const { catIndex, jobIndex } = req.params;
    const page = await Page.findOne({ pageName: "career" });

    // Update the specific job using the indexes
    page.sections.jobCategories[catIndex].jobs[jobIndex] = req.body;

    page.markModified('sections');
    await page.save();
    res.json({ message: "Job updated successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 4. DELETE: Remove a job opening
router.delete("/job/:catIndex/:jobIndex", async (req, res) => {
  try {
    const { catIndex, jobIndex } = req.params;
    const page = await Page.findOne({ pageName: "career" });

    // Remove the job from the array
    page.sections.jobCategories[catIndex].jobs.splice(jobIndex, 1);

    page.markModified('sections');
    await page.save();
    res.json({ message: "Job deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
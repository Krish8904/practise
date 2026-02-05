// backend/routes/pageRoutes.js
import express from "express";
import Page from "../models/page.js";
import addLog from "../utils/addLog.js";

const router = express.Router();

/**
 * @route   POST /api/pages
 * @desc    Create a new page
 */
router.post("/", async (req, res) => {
  try {
    const { pageName, sections } = req.body;

    // Validation
    if (!pageName || !sections) {
      return res.status(400).json({ message: "Page name and sections are required" });
    }

    // Check if page already exists
    const existingPage = await Page.findOne({ pageName });
    if (existingPage) {
      return res.status(400).json({ message: `Page '${pageName}' already exists` });
    }

    // Create new page
    const newPage = new Page({
      pageName,
      sections
    });

    await newPage.save();
    console.log(`✅ New page '${pageName}' created successfully`);
    res.status(201).json(newPage);

  } catch (err) {
    console.error("Create Page Error:", err);
    res.status(500).json({ message: "Failed to create page" });
  }
});

/**
 * @route   GET /api/pages
 * @desc    Get all pages for the dashboard list
 */
router.get("/", async (req, res) => {
  try {
    const pages = await Page.find({});
    res.json(pages);
  } catch (err) {
    console.error("Fetch Pages Error:", err);
    res.status(500).json({ message: "Failed to fetch pages" });
  }
});

/**
 * @route   GET /api/pages/:pageName
 * @desc    Get data for a specific page (e.g., /api/pages/home)
 */
router.get("/:pageName", async (req, res) => {
  try {
    // We use pageName as the identifier (e.g., "home")
    const page = await Page.findOne({ pageName: req.params.pageName });

    if (!page) {
      return res.status(404).json({ message: `Page '${req.params.pageName}' not found` });
    }

    res.json(page);
  } catch (err) {
    console.error("Fetch Single Page Error:", err);
    res.status(500).json({ message: "Failed to fetch page data" });
  }
});

/**
 * @route   PUT /api/pages/:pageName
 * @desc    Update the sections of a specific page
 */
router.put("/:pageName", async (req, res) => {
  try {
    const { pageName } = req.params;
    const { sections } = req.body;

    if (!sections) {
      return res.status(400).json({ message: "No sections data provided for update" });
    }

    // Get old page before update
    const oldPage = await Page.findOne({ pageName });
    if (!oldPage) {
      return res.status(404).json({ message: "Page not found" });
    }

    const oldSections = oldPage.sections || {};
    const newSections = sections || {};

    // Detect changes
    const oldKeys = Object.keys(oldSections);
    const newKeys = Object.keys(newSections);

    // Section Added
    const added = newKeys.filter(k => !oldKeys.includes(k));
    // Section Deleted
    const deleted = oldKeys.filter(k => !newKeys.includes(k));
    // Section Updated
    const updated = newKeys.filter(k => oldKeys.includes(k));

    // Update page
    oldPage.sections = newSections;
    await oldPage.save();

    // Logging logic
    if (added.length) {
      await addLog(
        `Section added to ${pageName} page`,
        "section"
      );
    } else if (deleted.length) {
      await addLog(
        `Section deleted from ${pageName} page`,
        "section"
      );
    } else if (updated.length) {
      await addLog(
        `Section updated in ${pageName} page`,

        "section"
      );
    }

    console.log(`✅ ${pageName} page updated successfully`);
    res.json(oldPage);

  } catch (err) {
    console.error("Update Page Error:", err);
    res.status(500).json({ message: "Internal Server Error during update" });
  }
});

/**
 * @route   POST /api/pages/:pageName/sections
 * @desc    Add a new section to an existing page
 */
router.post("/:pageName/sections", async (req, res) => {
  try {
    const { pageName } = req.params;
    const { sectionId, sectionData } = req.body;

    // Validation
    if (!sectionId || !sectionData) {
      return res.status(400).json({ message: "Section ID and data are required" });
    }

    // Find the page
    const page = await Page.findOne({ pageName });
    if (!page) {
      return res.status(404).json({ message: `Page '${pageName}' not found` });
    }

    // Check if section already exists
    if (page.sections[sectionId]) {
      return res.status(400).json({ message: `Section '${sectionId}' already exists` });
    }

    // Add new section
    page.sections[sectionId] = {
      ...sectionData,
      type: "custom", // Mark as custom section
      createdAt: new Date()
    };

    // Save the page
    await page.save();

    console.log(`✅ Section '${sectionId}' added to '${pageName}' page`);
    await addLog(`Added section '${sectionId}' to ${pageName} page`, "section");
    res.status(201).json(page);

  } catch (err) {
    console.error("Add Section Error:", err);
    res.status(500).json({ message: "Failed to add section" });
  }
});

/**
 * @route   DELETE /api/pages/:pageName/sections/:sectionId
 * @desc    Delete a section from a page
 */
router.delete("/:pageName/sections/:sectionId", async (req, res) => {
  try {
    const { pageName, sectionId } = req.params;

    // Find the page
    const page = await Page.findOne({ pageName });
    if (!page) {
      return res.status(404).json({ message: `Page '${pageName}' not found` });
    }

    // Check if section exists
    if (!page.sections[sectionId]) {
      return res.status(404).json({ message: `Section '${sectionId}' not found` });
    }

    // Only allow deletion of custom sections
    if (page.sections[sectionId].type !== "custom") {
      return res.status(403).json({ message: "Cannot delete built-in sections" });
    }

    // Delete the section
    delete page.sections[sectionId];
    await page.save();

    console.log(`✅ Section '${sectionId}' deleted from '${pageName}' page`);
    await addLog(`Deleted section '${sectionId}' from ${pageName} page`, "section");
    res.json({ message: "Section deleted successfully", page });

  } catch (err) {
    console.error("Delete Section Error:", err);
    res.status(500).json({ message: "Failed to delete section" });
  }
});

/**
 * @route   PUT /api/pages/:pageName/sections/:sectionId/position
 * @desc    Update the position/order of a section
 */
router.put("/:pageName/sections/:sectionId/position", async (req, res) => {
  try {
    const { pageName, sectionId } = req.params;
    const { position } = req.body;

    // Validation
    if (typeof position !== "number") {
      return res.status(400).json({ message: "Position must be a number" });
    }

    // Find the page
    const page = await Page.findOne({ pageName });
    if (!page) {
      return res.status(404).json({ message: `Page '${pageName}' not found` });
    }

    // Check if section exists
    if (!page.sections[sectionId]) {
      return res.status(404).json({ message: `Section '${sectionId}' not found` });
    }

    // Update position
    page.sections[sectionId].position = position;
    await page.save();

    console.log(`✅ Section '${sectionId}' position updated to ${position}`);
    await addLog(`Reordered section '${sectionId}' in ${pageName} page`, "section");
    res.json(page);

  } catch (err) {
    console.error("Update Position Error:", err);
    res.status(500).json({ message: "Failed to update section position" });
  }
});

/**
 * @route   PUT /api/pages/:pageName/sections/:sectionId/alignment
 * @desc    Update the alignment of a section
 */
router.put("/:pageName/sections/:sectionId/alignment", async (req, res) => {
  try {
    const { pageName, sectionId } = req.params;
    const { alignment } = req.body;

    // Validation
    const validAlignments = ["left", "center", "right"];
    if (!validAlignments.includes(alignment)) {
      return res.status(400).json({ message: "Alignment must be 'left', 'center', or 'right'" });
    }

    // Find the page
    const page = await Page.findOne({ pageName });
    if (!page) {
      return res.status(404).json({ message: `Page '${pageName}' not found` });
    }

    // Check if section exists
    if (!page.sections[sectionId]) {
      return res.status(404).json({ message: `Section '${sectionId}' not found` });
    }

    // Update alignment
    page.sections[sectionId].alignment = alignment;
    await page.save();

    console.log(`✅ Section '${sectionId}' alignment updated to ${alignment}`);
    await addLog(`Changed alignment of section '${sectionId}' in ${pageName} page`, "section");
    res.json(page);

  } catch (err) {
    console.error("Update Alignment Error:", err);
    res.status(500).json({ message: "Failed to update section alignment" });
  }
});

export default router;
import express from "express";
import Page from "../models/page.js";
import { adminLogin } from "../controllers/adminController.js";

const router = express.Router();

// Admin login route
router.post("/login", adminLogin);

// Dashboard stats route
router.get("/stats", async (req, res) => {
  try {
    console.log("Fetching pages for dashboard stats...");

    const pages = await Page.find({ pageName: { $in: ["services", "usecases", "career"] } });

    // Map pages by name
    const pageMap = {};
    pages.forEach(p => { pageMap[p.pageName] = p; });

    // Services count
    let servicesCount = 0;
    try {
      const servicesSection = pageMap.services?.sections?.services;
      if (servicesSection?.items && Array.isArray(servicesSection.items)) {
        servicesCount = servicesSection.items.length;
      }
    } catch (err) {
      console.warn("Error counting services:", err);
    }

    // Usecases count
    let useCasesCount = 0;
    try {
      const usecasesSection = pageMap.usecases?.sections?.usecases;
      if (usecasesSection?.items && Array.isArray(usecasesSection.items)) {
        useCasesCount = usecasesSection.items.length;
      }
    } catch (err) {
      console.warn("Error counting usecases:", err);
    }

    // Total jobs
    let totalJobs = 0;
    try {
      const jobCategoriesSection = pageMap.career?.sections?.jobCategoriesSection;
      const jobCategories = jobCategoriesSection?.jobCategories;
      if (Array.isArray(jobCategories)) {
        jobCategories.forEach(cat => {
          if (Array.isArray(cat.jobs)) totalJobs += cat.jobs.length;
        });
      }
    } catch (err) {
      console.warn("Error counting career jobs:", err);
    }

    console.log("Stats calculated:", { servicesCount, useCasesCount, totalJobs });

    res.json({
      openRoles: totalJobs,
      services: servicesCount,
      useCases: useCasesCount,
      totalVisitors: 1250,
      activeLeads: 12
    });
  } catch (err) {
    console.error(" Dashboard Stats Error:", err);
    console.error(err.stack);
    res.status(500).json({ error: "Failed to calculate dashboard statistics" });
  }
});

export default router;
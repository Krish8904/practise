import express from "express";
import multer from "multer";
import nodemailer from "nodemailer";
import Application from "../models/Application.js";
import Page from "../models/page.js";

const router = express.Router();

const storage = multer.memoryStorage();
const upload = multer({ storage });

let transporter = null;

const getTransporter = () => {
  if (!transporter) {
    console.log("🔍 Creating email transporter...");
    console.log("EMAIL_USER:", process.env.EMAIL_USER || "❌ UNDEFINED");
    console.log("EMAIL_PASS:", process.env.EMAIL_PASS ? `✅ SET (${process.env.EMAIL_PASS.length} chars)` : "❌ UNDEFINED");

    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      throw new Error("EMAIL_USER or EMAIL_PASS is not set in environment variables");
    }

    transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    // Verify connection
    transporter.verify((error, success) => {
      if (error) {
        console.error("❌ Email configuration error:", error);
      } else {
        console.log("✅ Email server is ready to send messages");
      }
    });
  }
  return transporter;
};


router.get("/", async (req, res) => {
  try {
    const page = await Page.findOne({ pageName: "career" });
    if (!page) return res.status(404).json({ message: "Career page not found" });
    res.json(page);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


router.post("/job", async (req, res) => {
  try {
    const { title, category, location, type, description } = req.body;
    const page = await Page.findOne({ pageName: "career" });
    if (!page) return res.status(404).json({ message: "Career page document not found" });

    if (!page.sections) page.sections = {};
    if (!page.sections.jobCategories) page.sections.jobCategories = [];

    let categorySection = page.sections.jobCategories.find(cat => cat.category === category);

    if (categorySection) {
      categorySection.jobs.push({ title, location, type, description });
    } else {
      page.sections.jobCategories.push({
        category,
        jobs: [{ title, location, type, description }]
      });
    }

    page.markModified('sections');
    await page.save();
    res.status(201).json(page);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put("/job/:catIndex/:jobIndex", async (req, res) => {
  try {
    const { catIndex, jobIndex } = req.params;
    const page = await Page.findOne({ pageName: "career" });

    page.sections.jobCategories[catIndex].jobs[jobIndex] = req.body;

    page.markModified('sections');
    await page.save();
    res.json({ message: "Job updated successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


router.delete("/job/:catIndex/:jobIndex", async (req, res) => {
  try {
    const { catIndex, jobIndex } = req.params;
    const page = await Page.findOne({ pageName: "career" });

    page.sections.jobCategories[catIndex].jobs.splice(jobIndex, 1);

    page.markModified('sections');
    await page.save();
    res.json({ message: "Job deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


router.post("/apply", upload.single("resume"), async (req, res) => {
  try {
    console.log(" Received application:", req.body);
    console.log(" Resume file:", req.file ? req.file.originalname : "No file");

    // 1️⃣ Save to MongoDB
    const newApp = new Application({
      ...req.body,
      resumePath: req.file ? req.file.originalname : null,
    });
    await newApp.save();
    console.log("✅ Application saved to database with ID:", newApp._id);

    // 2️⃣ Get transporter (creates it if needed)
    let emailTransporter;
    try {
      emailTransporter = getTransporter();
    } catch (err) {
      console.error("⚠️ Could not create email transporter:", err.message);
      return res.json({
        message: "Application received and saved. However, email notification could not be sent due to configuration issues.",
        applicationId: newApp._id
      });
    }

    // 3️⃣ Prepare email attachment
    const attachments = req.file
      ? [
        {
          filename: req.file.originalname,
          content: req.file.buffer,
        },
      ]
      : [];

    // 4️⃣ Send email with better formatting
    const emailContent = `
New Job Application Received!

APPLICANT INFORMATION:

Name: ${req.body.firstName} ${req.body.middleName || ""} ${req.body.lastName}
Email: ${req.body.email}
Phone: ${req.body.phone}

Cover Letter:

${req.body.coverLetter || "No cover letter provided"}

Resume: ${req.file ? "Attached" : "Not provided"}
Application ID: ${newApp._id}
Submitted: ${new Date().toLocaleString()}
    `;

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: process.env.EMAIL_USER,
      subject: `🎯 New Job Application: ${req.body.firstName} ${req.body.lastName}`,
      text: emailContent,
      attachments,
    };

    console.log(" Attempting to send email to:", process.env.EMAIL_USER);
    const info = await emailTransporter.sendMail(mailOptions);
    console.log("✅ Email sent successfully! Message ID:", info.messageId);

    res.json({
      message: "Thanks for applying, we'll contact you shortly.",
      applicationId: newApp._id
    });
  } catch (err) {
    console.error("❌ APPLY ERROR:", err);
    console.error("Error details:", err.message);

    // Provide specific error feedback
    if (err.message.includes("Invalid login")) {
      console.error("⚠️ Email authentication failed - check EMAIL_USER and EMAIL_PASS");
    } else if (err.message.includes("ECONNECTION")) {
      console.error("⚠️ Cannot connect to email server");
    }

    res.status(500).json({
      error: "Failed to submit application",
      details: process.env.NODE_ENV === "development" ? err.message : undefined
    });
  }
});

export default router;
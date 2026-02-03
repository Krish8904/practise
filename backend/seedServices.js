// backend/seedServices.js
import mongoose from "mongoose";
import dotenv from "dotenv";
import Page from "./models/page.js";

dotenv.config();

const seedServicesPage = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB connected");

    const servicesPage = {
      pageName: "services",
      sections: {
        hero: {
          mainText: "Your partner for strategy, engineering, & AI adoption",
          secondaryText:
            "From boardroom ambition to bottom-line results. We deliver AI where it drives real business value — secure, compliant, and operational from day one.",
          buttonText: "Plan a Free Quick Scan",
          position: 1,
        },
        services: {
          position: 2,

          items: [
            {
              title: "AI Strategy",
              desc: "Align AI initiatives with your business goals. We provide strategy roadmaps, feasibility studies, and measurable KPIs to maximize ROI.",
              img: "ai.webp",
              color: "border-blue-600",
            },
            {
              title: "Data Engineering",
              desc: "Build secure, scalable, and compliant data foundations. We ensure clean, governed, and accessible data for AI and analytics.",
              img: "dataeng.jpg",
              color: "border-green-600",
            },
            {
              title: "AI Copilots & Agents",
              desc: "Deploy production-ready AI agents and copilots to augment workflows, improve productivity, and enhance customer experience.",
              img: "aico.jpg",
              color: "border-purple-600",
            },
            {
              title: "Workflow Automation",
              desc: "Automate repetitive tasks with intelligent workflows. Reduce errors and accelerate business processes with AI-powered automation.",
              img: "workflow.jpg",
              color: "border-orange-600",
            },
            {
              title: "AI Governance",
              desc: "Ensure AI systems are privacy-compliant, secure, and EU-ready. We implement policies, monitoring, and audit-ready pipelines.",
              img: "aigo.jpg",
              color: "border-teal-600",
            },
            {
              title: "Analytics & Insights",
              desc: "Transform data into actionable insights. Dashboards, reports, and predictive analytics empower smarter decision-making.",
              img: "analytics.jpg",
              color: "border-pink-600",
            },
          ],
        },

        cta: {
          title: "Ready to transform your business with AI?",
          text: "Let’s plan a free quick scan to see how AI can drive measurable impact in your organization.",
          buttonText: "Schedule a Quick Scan",
          link: "/contact",
          position: 3,
        },
      },
    };

    // Delete old services page
    await Page.deleteOne({ pageName: "services" });

    // Insert new services page
    await Page.create(servicesPage);

    console.log("✅ Services page seeded successfully!");
    process.exit(0);
  } catch (err) {
    console.error("❌ Seeding failed:", err);
    process.exit(1);
  }
};

seedServicesPage();

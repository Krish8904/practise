// backend/seedUsecases.js
import mongoose from "mongoose";
import dotenv from "dotenv";
import Page from "./models/page.js"; // adjust path if needed

dotenv.config();

const seedUsecasesPage = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB connected");

    const usecasesPage = {
      pageName: "usecases",
      sections: {
        hero: {
          mainText: "Real Problems. Real Solutions.",
          secondaryText:
            "We help teams solve complex technical and strategic challenges — from early-stage products to large-scale platforms.",
          position: 1,
        },

        usecases: {
          position: 2,
          items: [
            {
              category: "Product Engineering",
              title: "Scaling a SaaS Platform for Growth",
              description:
                "A fast-growing SaaS company needed to scale their platform while maintaining performance, security, and developer velocity.",
              highlights: [
                "Re-architected frontend and backend workflows",
                "Improved performance and deployment pipelines",
                "Enabled faster feature delivery",
              ],
              outcome: [
                "Stronger alignment across teams and faster execution with clear business impact across leadership and delivery teams.",
                "The team gained confidence to iterate quickly without worrying about performance regressions or infrastructure limits.",
              ],
            },
            {
              category: "Data & Analytics",
              title: "Turning Disconnected Data Into Insight",
              description:
                "An organization struggled with fragmented data across multiple systems, limiting insight and reporting.",
              highlights: [
                "Unified data sources into a single analytics layer",
                "Designed executive dashboards",
                "Automated recurring reporting",
              ],
              outcome: [
                "Leadership gained real-time visibility into operations, enabling faster and more confident decisions.",
                "Decision-makers were able to act on insights instead of waiting on manual reports or fragmented data.",
              ],
            },
            {
              category: "Digital Transformation",
              title: "Modernizing Legacy Systems",
              description:
                "A mature business relied on outdated systems that slowed teams down and created operational risk.",
              highlights: [
                "Audited legacy infrastructure",
                "Introduced modern architecture and tooling",
                "Migrated systems without disrupting operations",
              ],
              outcome: [
                "A future-ready technology stack that reduced complexity and enabled long-term innovation.",
                "Teams experienced smoother workflows and reduced operational risk across critical systems.",
              ],
            },
            {
              category: "Strategy & Transformation",
              title: "Aligning Technology With Business Goals",
              description:
                "Leadership teams needed clarity on where to invest technically to support long-term business objectives.",
              highlights: [
                "Led discovery and strategy workshops",
                "Defined clear technical roadmaps",
                "Aligned delivery with measurable outcomes",
              ],
              outcome: [
                "Stronger alignment across teams and faster execution with clear business impact.",
                "Technical execution became clearly tied to business priorities, improving alignment across leadership and delivery teams.",
              ],
            },
          ],
        },


        cta: {
          mainText: "Built for Teams That Want Momentum",
          secondaryText:
            "We partner with teams that want to move with purpose — balancing speed, quality, and long-term thinking.",
          contactText: "Let’s Talk About Your Challenge",
          contactDescription:
            "If you’re facing a technical or strategic problem, we’d love to understand it and explore whether we’re the right partner.",
          buttons: [
            { label: "Contact Us", link: "/contact", type: "primary" },
            { label: "About Us", link: "/company", type: "secondary" },
          ],
          position: 3
        },
      },
    };

    // Remove existing usecases page if it exists
    await Page.deleteOne({ pageName: "usecases" });

    // Insert new usecases page
    await Page.create(usecasesPage);

    console.log("✅ Usecases page seeded successfully!");
    process.exit(0);
  } catch (err) {
    console.error("❌ Seeding failed:", err);
    process.exit(1);
  }
};

seedUsecasesPage();

// backend/seedHome.js
import mongoose from "mongoose";
import dotenv from "dotenv";
import Page from "./models/page.js"; // same style as seedCareer.js

dotenv.config();

const seedHomePage = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB connected");

    const homePage = {
      pageName: "home",
      sections: {
        hero: {
          mainText:
            "Subduxion discovers hidden value in your existing data with reliable applied AI.",
          secondaryText:
            "Partner with us to leverage applied AI that is compliant, secure, and designed for measurable impact.",
          buttons: [
            {
              label: "Get on a call",
              link: ""
            },
            {
              label: "Explore our Service",
              link: ""
            }
          ]
        },

        intro: {
          mainText: "",
          secondaryText:
            "Applied AI built on data sovereignty, privacy, security, and EU-ready governance.",
          image: "",
          button: {
            label: "",
            link: ""
          }
        },

        // Change this in your seedHome.js
        stats: {
          steps: [
            { label: "Years of experience", value: "20+", color: "blue-600" },
            { label: "Enterprise clients", value: "80+", color: "green-600" },
            { label: "System uptime", value: "99.99%", color: "purple-600" },
            { label: "AI governance ready", value: "EU", color: "orange-600" }
          ]
        },

        whatWeDo: {
          title: "What we do",
          items: [
            {
              heading: "AI Strategy",
              description:
                "Align AI initiatives with business goals and measurable outcomes hello ."
            },
            {
              heading: "Data Engineering",
              description:
                "Build scalable, secure data foundations for AI adoption."
            },
            {
              heading: "AI Copilots & Agents",
              description:
                "Deploy production-ready AI that augments teams and workflows."
            }
          ]
        },

        howWeWork: {
          title: "How we work",
          steps: [
            {
              title: "Discover",
              description: "Understand goals, data, and constraints."
            },
            {
              title: "Design",
              description: "Architect scalable and compliant solutions."
            },
            {
              title: "Build",
              description: "Develop and deploy production-ready systems."
            },
            {
              title: "Operate",
              description: "Monitor, optimize, and scale responsibly."
            }
          ]
        },

        cta: {
          mainText: "Ready to unlock value from your data?",
          secondaryText:
            "Let’s assess where AI can drive measurable impact in your organization.",
          button: {
            label: "Plan a free quick scan",
            link: ""
          }
        }
      }
    };

    // Remove existing home page if it exists
    await Page.deleteOne({ pageName: "home" });

    // Insert new home page
    await Page.create(homePage);

    console.log("✅ Home page seeded successfully!");
    process.exit(0);
  } catch (err) {
    console.error("❌ Seeding failed:", err);
    process.exit(1);
  }
};

seedHomePage();

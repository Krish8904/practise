
import mongoose from "mongoose";
import dotenv from "dotenv";
import Page from "./models/page.js"; 

dotenv.config();

async function seedCompany() {
  try {
    // Connect DB
    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB connected");

    const companyPage = {
      pageName: "company",
      sections: {
        hero: {
          mainText: "Serious About Building Things That Work",
          secondaryText:
            "We're a consulting and technology studio focused on solving real business problems — not shipping decks, buzzwords, or half-finished products."
        },
        position:1,

        section1: {
          position:2,
          left: {
            heading: "Why we exist",
            text:
              "We started this company after seeing the same pattern repeat: businesses spending months on strategy and tools that never made it to production. Our approach is different. We work closely with teams, cut through noise, and focus on execution — fast, pragmatic, and measurable."
          },
          right: {
            heading: "What we believe",
            points: [
              "Technology should drive outcomes, not complexity",
              "Speed matters — but clarity matters more",
              "Great products come from strong collaboration"
            ]
          },
        },

        section2: {
          mainText: "What Makes Us Different",
          cards: [
            {
              heading: "We Don’t Disappear",
              description:
                "No handoffs. No vanishing after delivery. We stay involved until the solution is live and delivering value."
            },
            {
              heading: "Engineers in the Room",
              description:
                "Strategy isn’t theoretical — it’s shaped with engineers, designers, and stakeholders from day one."
            },
            {
              heading: "Built for Scale",
              description:
                "Everything we design is built to grow with your business, not become technical debt six months later."
            }
          ],
          position:3,
        },

        section3: {
          mainText: "How We Operate",
          steps: [
            { heading: "Discover", description: "Understand your goals, constraints, and users." },
            { heading: "Design", description: "Shape clear, usable, and scalable solutions." },
            { heading: "Build", description: "Engineer with quality, speed, and reliability." },
            { heading: "Evolve", description: "Improve continuously based on real data." }
          ],
          position:4,
        },

        section4: {
          above: {
            mainText: "Built for Teams That Want Momentum",
            secondaryText:
              "We partner with startups, scale-ups, and enterprises that want to move faster, make smarter decisions, and build technology that lasts."
          },
          below: {
            mainText: "Let’s Talk About Your Challenge",
            secondaryText:
              "If you’re facing a technical or strategic problem, we’d love to understand it and explore how we can help."
          },
          button: {
            label: "Contact Us",
            link: "/contact"
          },
          position:5
        }

      }
    };

    await Page.findOneAndDelete({ pageName: "company" });
    await Page.create(companyPage);

    console.log("✅ Company page seeded successfully!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Seeding failed:", error);
    process.exit(1);
  }
}

seedCompany();

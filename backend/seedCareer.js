  // backend/seedCareer.js
  import mongoose from "mongoose";
  import dotenv from "dotenv";
  import Page from "./models/page.js"; // adjust path if needed

  dotenv.config();

  const seedCareerPage = async () => {
    try {
      await mongoose.connect(process.env.MONGO_URI);
      console.log("MongoDB connected");

      const careerPage = {
        pageName: "career",
        sections: {
          hero: {
            mainText: "Join Our Team at SubDuxion",
            secondaryText:
              "At SubDuxion, we empower businesses with applied AI, strategy, and engineering expertise. Explore our current openings, learn about our culture, and discover why SubDuxion is a great place to grow your career.",
            position: 1,
          },

          whyWorkWithUs: {
            title: "Why Work With Us",
            text:
              "We foster a collaborative, inclusive, and innovative work environment. Our team enjoys flexible schedules, ongoing learning opportunities, and a chance to work on projects that truly impact our clients.",
            bullets: [
              "Work on cutting-edge AI and business transformation projects.",
              "Flexible work options — remote or in-office.",
              "Professional development and mentorship programs.",
              "Inclusive, supportive, and collaborative culture.",
              "Competitive compensation and benefits.",
            ],
            position: 2,

          },


          jobCategoriesSection: {
            position: 3,  // position of this entire jobCategories section in the page
            jobCategories: [
              {
                category: "AI & Data Science",
                jobs: [
                  {
                    title: "AI Consultant",
                    location: "Remote / EU",
                    type: "Full-Time",
                    description:
                      "Guide clients in implementing AI solutions, from strategy to deployment, ensuring measurable business impact.",
                  },
                  {
                    title: "Machine Learning Engineer",
                    location: "London, UK",
                    type: "Full-Time",
                    description:
                      "Develop scalable ML pipelines, build predictive models, and optimize AI solutions for diverse client industries.",
                  },
                ],
              },
              {
                category: "Business Strategy",
                jobs: [
                  {
                    title: "Business Strategy Analyst",
                    location: "London, UK",
                    type: "Full-Time",
                    description:
                      "Analyze client operations, identify growth opportunities, and create actionable strategic roadmaps.",
                  },
                  {
                    title: "Innovation Consultant",
                    location: "Remote",
                    type: "Contract",
                    description:
                      "Work with leadership teams to foster innovation and apply best practices in AI-driven business transformation.",
                  },
                ],
              },
              {
                category: "Engineering & Development",
                jobs: [
                  {
                    title: "Frontend Developer (React)",
                    location: "Remote",
                    type: "Contract",
                    description:
                      "Build interactive dashboards, implement responsive UI/UX, and optimize front-end performance.",
                  },
                  {
                    title: "Backend Engineer",
                    location: "Remote / EU",
                    type: "Full-Time",
                    description:
                      "Design and maintain scalable APIs, manage databases, and support AI applications in production environments.",
                  },
                ],
              },
            ],
          },


          benefits: {
            title: "Employee Benefits",
            bullets: [
              "Health and wellness benefits",
              "Flexible working hours and remote options",
              "Training, workshops, and professional development",
              "Team events, retreats, and hackathons",
              "Recognition and career growth opportunities",
            ],
            position: 4
          },
          contactCTA: {
            title: "Can’t find a role that fits?",
            text: "We’re always looking for talented individuals. Reach out and tell us why you’d be a great fit for SubDuxion.",
            buttonText: "Submit Your Resume",
          },
          position: 5,
        },
      };

      // Remove existing career page if it exists
      await Page.deleteOne({ pageName: "career" });

      // Insert new career page
      await Page.create(careerPage);

      console.log("✅ Career page seeded successfully!");
      process.exit(0);
    } catch (err) {
      console.error("❌ Seeding failed:", err);
      process.exit(1);
    }
  };

  seedCareerPage();

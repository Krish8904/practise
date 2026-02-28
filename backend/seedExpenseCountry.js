import mongoose from "mongoose";
import dotenv from "dotenv";
import ExpenseCountry from "./models/masters/ExpenseCountry.js";

dotenv.config();

const seedData = [
  { label: "India", value: "IN", code: "IN", order: 1 },
  { label: "Russia", value: "RU", code: "RU", order: 2 },
  { label: "UAE", value: "AE", code: "AE", order: 3 },
  { label: "USA", value: "US", code: "US", order: 4 },
  { label: "UK", value: "GB", code: "GB", order: 5 },
  { label: "Germany", value: "DE", code: "DE", order: 6 },
  { label: "Singapore", value: "SG", code: "SG", order: 7 },
  { label: "Other", value: "OTHER", code: "OTHER", order: 8 },
];

async function seedExpenseCountry() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ Connected to MongoDB");

    await ExpenseCountry.deleteMany({});
    console.log("🗑️  Cleared existing Country records");

    const inserted = await ExpenseCountry.insertMany(seedData);
    console.log(`✅ Inserted ${inserted.length} Country records`);
    inserted.forEach((doc) => console.log(`   • ${doc.code} — ${doc.label}`));

    process.exit(0);
  } catch (err) {
    console.error("❌ Seed error:", err);
    process.exit(1);
  }
}

seedExpenseCountry();
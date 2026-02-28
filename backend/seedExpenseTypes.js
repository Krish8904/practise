import mongoose from "mongoose";
import dotenv from "dotenv";
import ExpenseTypes from "./models/masters/ExpenseTypes.js"; 

dotenv.config();

const seedData = [
  { label: "Purchase", value: "Purchase", order: 1 },
  { label: "Spend", value: "Spend", order: 2 },
  { label: "Transfer", value: "Transfer", order: 3 },
  { label: "Credit", value: "Credit", order: 4 },
  { label: "Debit", value: "Debit", order: 5 },
];

async function seedExpenseType() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ Connected to MongoDB");

    await ExpenseTypes.deleteMany({}); // ← fixed
    console.log("🗑️  Cleared existing Type records");

    const inserted = await ExpenseTypes.insertMany(seedData); // ← fixed
    console.log(`✅ Inserted ${inserted.length} Type records`);
    inserted.forEach((doc) => console.log(`   • ${doc.label}`));

    process.exit(0);
  } catch (err) {
    console.error("❌ Seed error:", err);
    process.exit(1);
  }
}

seedExpenseType();
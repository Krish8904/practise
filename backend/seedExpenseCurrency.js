import mongoose from "mongoose";
import dotenv from "dotenv";
import ExpenseCurrency from "./models/masters/ExpenseCurrency.js";

dotenv.config();

const seedData = [
  { label: "Indian Rupee", value: "INR", code: "₹", order: 1 },
  { label: "US Dollar", value: "USD", code: "$", order: 2 },
  { label: "Russian Ruble", value: "RUB", code: "₽", order: 3 },
  { label: "Tether (USDT)", value: "USDT", code: "₮", order: 4 },
  { label: "Euro", value: "EUR", code: "€", order: 5 },
  { label: "UAE Dirham", value: "AED", code: "د.إ", order: 6 },
  { label: "British Pound", value: "GBP", code: "£", order: 7 },
];

async function seedExpenseCurrency() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ Connected to MongoDB");

    await ExpenseCurrency.deleteMany({});
    console.log("🗑️  Cleared existing Currency records");

    const inserted = await ExpenseCurrency.insertMany(seedData);
    console.log(`✅ Inserted ${inserted.length} Currency records`);
    inserted.forEach((doc) => console.log(`   • ${doc.code} — ${doc.value} — ${doc.label}`));

    process.exit(0);
  } catch (err) {
    console.error("❌ Seed error:", err);
    process.exit(1);
  }
}

seedExpenseCurrency();
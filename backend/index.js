import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import bookings from './routes/bookings.js'
import careerRoutes from "./routes/careerRoutes.js";
import pageRoutes from "./routes/pageRoutes.js";
import adminRoutes from './routes/adminRoutes.js';
import logRoutes from "./routes/logRoutes.js";
import media from "./routes/media.js";
import nodemailer from "nodemailer";
import contactRoutes from "./routes/contactRoutes.js"
import companyRoutes from "./routes/companyRoutes.js"
import masterRoutes from "./routes/masterRoutes.js"
import expenseRoutes from "./routes/ExpenseRoutes.js"
import ExpenseMasterRoutes from "./routes/ExpenseMasterRoutes.js"

dotenv.config();

console.log("\n ENVIRONMENT VARIABLES CHECK:");
console.log("EMAIL_USER:", process.env.EMAIL_USER || "❌ UNDEFINED");
console.log("EMAIL_PASS:", process.env.EMAIL_PASS ? `✅ SET (${process.env.EMAIL_PASS.length} chars)` : "❌ UNDEFINED");
console.log("MONGO_URI:", process.env.MONGO_URI ? "✅ SET" : "❌ UNDEFINED");

const app = express();

// Middlewares
app.use(cors());

app.use('/uploads', express.static('uploads'));

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// REQUEST LOGGER
app.use((req, res, next) => {
  console.log(`\n INCOMING REQUEST: ${req.method} ${req.url}`);
  console.log("Body:", req.body);
  console.log("From:", req.ip);
  next();
});

// Test route
app.get("/", (req, res) => res.send("Backend API running"));

app.use("/api/pages", pageRoutes);

app.use('/api/career', careerRoutes);

// Admin routes for dashboard stats
app.use('/api/admin/', adminRoutes);

// Bookings routes
app.use("/api/bookings", bookings);

app.use("/api/logs", logRoutes);

app.use("/api/images", media);

app.use("/api/contact", contactRoutes);

app.use("/api/companies", companyRoutes);

app.use("/api/masters", masterRoutes);

app.use("/api/expenses", expenseRoutes);  

app.use("/api/expense-masters", ExpenseMasterRoutes);

// MongoDB connection
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => console.error("❌ MongoDB error:", err));

// Server start
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));
import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import bookings from './routes/bookings.js'
import careerRoutes from "./routes/careerRoutes.js";
import pageRoutes from "./routes/pageRoutes.js"; // This now includes GET, POST, and PUT
import adminRoutes from './routes/adminRoutes.js';
import logRoutes from "./routes/logRoutes.js";
import media from "./routes/media.js";

dotenv.config();

const app = express();

// Middlewares
app.use(cors());

app.use('/uploads', express.static('uploads'));

// IMPORTANT: Increased limits for large JSON payloads (like Base64 images or long text)
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Test route
app.get("/", (req, res) => res.send("Backend API running"));

// API Routes
// This maps /api/pages to pageRoutes.js (includes GET, POST, PUT)
app.use("/api/pages", pageRoutes);

// Career specific routes (if you have additional career-specific endpoints)
app.use('/api/career', careerRoutes);

// Admin routes for dashboard stats
app.use('/api/admin/', adminRoutes);

// Bookings routes
app.use("/api/bookings", bookings);

app.use("/api/logs", logRoutes);

app.use("/api/images", media);
// MongoDB connection
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => console.error("❌ MongoDB error:", err));

// Server start
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));
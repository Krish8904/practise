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

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// REQUEST LOGGER - ADD THIS
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
// MongoDB connection
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => console.error("❌ MongoDB error:", err));

// Server start
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));
// backend/models/page.js
import mongoose from "mongoose";

const pageSchema = new mongoose.Schema(
  {
    pageName: { type: String, required: true, unique: true },
    sections: {
      type: mongoose.Schema.Types.Mixed, 
      required: true
    }
  },
  {
    timestamps: true,
    strict: false 
  }
);

// ✅ Reuse existing model if already compiled
const Page = mongoose.models.Page || mongoose.model("Page", pageSchema);

export default Page;

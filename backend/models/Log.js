import mongoose from "mongoose";

const logSchema = new mongoose.Schema(
  {
    message: String,
    type: String, // page, section, inquiry, job
  },
  { timestamps: true }
);

const Log = mongoose.models.Log || mongoose.model("Log", logSchema);

export default Log;
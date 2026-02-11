import mongoose from "mongoose";

const applicationSchema = new mongoose.Schema(
  {
    firstName: String,
    middleName: String,
    lastName: String,
    email: String,
    phone: String,
    coverLetter: String,
    resumePath: String,
  },
  { timestamps: true }
);

export default mongoose.model(
  "Application",
  applicationSchema,
  "applications"
);
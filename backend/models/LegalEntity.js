import mongoose from "mongoose";

const legalEntitySchema = new mongoose.Schema(
  {
    companyName:     { type: String, required: true, unique: true, trim: true },
    country:         { type: mongoose.Schema.Types.ObjectId, ref: "Country", default: null },
    localCurrency:   { type: mongoose.Schema.Types.ObjectId, ref: "Currency", default: null },
    foreignCurrency: { type: mongoose.Schema.Types.ObjectId, ref: "Currency", default: null },
    // Denormalised labels — kept in sync on write so the form never needs extra lookups
    countryName:          { type: String, default: "" },
    localCurrencyCode:    { type: String, default: "" },
    foreignCurrencyCode:  { type: String, default: "" },
  },
  { timestamps: true }
);

export default mongoose.models.LegalEntity ||
  mongoose.model("LegalEntity", legalEntitySchema);
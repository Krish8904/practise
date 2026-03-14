import mongoose from "mongoose";

const companySchema = new mongoose.Schema(
  {
    companyId: { type: String, unique: true, index: true },

    companyName:   { type: String, required: true },
    companyEmail:  { type: String, required: true },
    website:       { type: String },
    countryCode:   { type: String, default: "+1" },
    companyMobile: { type: String, required: true },

    natureOfBusiness: [{ type: mongoose.Schema.Types.ObjectId, ref: "NatureOfBusiness" }],
    channel:          [{ type: mongoose.Schema.Types.ObjectId, ref: "Channel" }],
    category:         { type: mongoose.Schema.Types.ObjectId, ref: "Category", default: null },
    subcategory:      [{ type: mongoose.Schema.Types.ObjectId, ref: "Subcategory" }],

    firstName:           { type: String, required: true },
    middleName:          { type: String },
    lastName:            { type: String, required: true },
    personalEmail:       { type: String, required: true },
    personalCountryCode: { type: String, default: "+1" },
    personalMobile:      { type: String, required: true },
    gender:              { type: String },

    // ── Legal Entity assignment ──
    legalEntityId:       { type: mongoose.Schema.Types.ObjectId, ref: "LegalEntity", default: null },
    legalEntityName:     { type: String, default: null },
    country:             { type: mongoose.Schema.Types.ObjectId, default: null },
    countryName:         { type: String, default: null },
    localCurrency:       { type: mongoose.Schema.Types.ObjectId, default: null },
    localCurrencyCode:   { type: String, default: null },
    foreignCurrency:     { type: mongoose.Schema.Types.ObjectId, default: null },
    foreignCurrencyCode: { type: String, default: null },
  },
  { timestamps: true }
);

companySchema.pre("save", async function () {
  if (!this.isNew) return;
  const last = await mongoose.model("Company")
    .findOne({}, { companyId: 1 })
    .sort({ createdAt: -1 });
  let nextNumber = 1;
  if (last?.companyId) {
    const lastNumber = parseInt(last.companyId.replace("CMP", ""), 10);
    if (!isNaN(lastNumber)) nextNumber = lastNumber + 1;
  }
  this.companyId = `CMP${String(nextNumber).padStart(4, "0")}`;
});

export default mongoose.model("Company", companySchema);
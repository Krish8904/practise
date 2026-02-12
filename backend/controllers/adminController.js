import axios from "axios";

console.log(" adminController.js loaded");

const verifyCaptcha = async (token) => {
  console.log("🟢 Token:", token);
  console.log("🟢 Token length:", token?.length);
  console.log("🟢 Secret exists:", !!process.env.RECAPTCHA_SECRET);
  
  try {
    const response = await axios.post(
      "https://www.google.com/recaptcha/api/siteverify",
      null,
      {
        params: {
          secret: process.env.RECAPTCHA_SECRET,
          response: token,
        },
      }
    );

    console.log("🟢 Google response:", JSON.stringify(response.data, null, 2));
    return response.data.success;
  } catch (err) {
    console.error("⚠️ Captcha error:", err.message);
    console.error("⚠️ Full error:", err);
    return false;
  }
};

export const adminLogin = async (req, res) => {
  console.log("\n");
  console.log(" Full request body:", JSON.stringify(req.body, null, 2));
  console.log(" Email:", req.body.email);
  console.log(" Password:", req.body.password ? "***" : "MISSING");
  console.log(" Captcha token:", req.body.captchaToken ? "EXISTS" : "MISSING");

  try {
    const { email, password, captchaToken } = req.body;

    if (!captchaToken) {
      console.warn("⚠️ NO CAPTCHA TOKEN");
      return res.status(400).json({ message: "Captcha token required" });
    }

    const isHuman = await verifyCaptcha(captchaToken);
    
    console.log("Is human?", isHuman);

    if (!isHuman) {
      console.warn("❌ CAPTCHA FAILED");
      return res.status(400).json({ message: "Captcha failed"});
    }

    if (email === "admin@example.com" && password === "admin123") {
      console.log("LOGIN SUCCESS ✅\n");
      return res.status(200).json({ message: "Login success"});
    } else {
      console.warn("❌ INVALID CREDENTIALS\n");
      return res.status(401).json({ message: "Invalid credentials"});
    }
  } catch (err) {
    console.error("ERROR:", err.message);
    console.error(err.stack);
    res.status(500).json({ message: "Server error" });
  }
};
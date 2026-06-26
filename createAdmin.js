require("dotenv").config();

const mongoose = require("mongoose");
const User = require("./models/User");

async function createAdmin() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);

    const email = "admin@methlinkme.com";

    const existing = await User.findOne({ email });

    if (existing) {
      console.log("❌ Admin already exists.");
      process.exit(0);
    }

    const admin = new User({
      fullName: "MethLinkMe Admin",
      email,
      password: "Admin12345!",
      role: "admin",
      isVerified: true,
      isActive: true
    });

    await admin.save();

    console.log("=================================");
    console.log("✅ ADMIN CREATED SUCCESSFULLY");
    console.log("Email: admin@methlinkme.com");
    console.log("Password: Admin12345!");
    console.log("=================================");

    process.exit(0);

  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

createAdmin();
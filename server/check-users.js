const mongoose = require("mongoose");
require("dotenv").config();

async function checkUsers() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ Connected to MongoDB");
    
    const db = mongoose.connection.db;
    
    // সব collections দেখান
    const collections = await db.listCollections().toArray();
    console.log("📁 Collections:", collections.map(c => c.name));
    
    // সব user দেখান
    const users = await db.collection("users").find({}).toArray();
    console.log(`\n📊 Total users: ${users.length}`);
    
    if (users.length === 0) {
      console.log("\n⚠️ No users found in database!");
      console.log("Please register first from Auth page.");
      await mongoose.disconnect();
      return;
    }
    
    console.log("\n👤 All Users:");
    users.forEach((u, i) => {
      console.log(`  ${i+1}. ${u.name} | ${u.email} | Verified: ${u.verified} | Role: ${u.role}`);
    });
    
    // Verified users
    const verified = users.filter(u => u.verified === true);
    console.log(`\n✅ Verified users: ${verified.length}`);
    
    if (verified.length === 0) {
      console.log("\n⚠️ No verified users found!");
      console.log("Run this in MongoDB Shell (mongosh):");
      console.log("  use peerconnect");
      console.log("  db.users.updateMany({}, { $set: { verified: true } })");
    } else {
      console.log("\n✅ Verified users list:");
      verified.forEach((u, i) => {
        console.log(`  ${i+1}. ${u.name} (${u.email}) - ${u.university} - ${u.district}`);
      });
    }
    
    await mongoose.disconnect();
    console.log("\n✅ Done!");
    
  } catch (error) {
    console.error("❌ Error:", error.message);
  }
}

checkUsers();
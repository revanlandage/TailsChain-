const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 5000, // Timeout after 5 seconds instead of hanging
    });
    console.log(`\n==================================================`);
    console.log(`  🐾  TailsChain Database Service`);
    console.log(`==================================================`);
    console.log(`  ✅  Status: CONNECTED`);
    console.log(`  🌐  Host:   ${conn.connection.host}`);
    console.log(`==================================================\n`);
  } catch (err) {
    console.error(`\n==================================================`);
    console.error(`  ❌  MongoDB Connection Failure`);
    console.error(`==================================================`);
    console.error(`  Error message: ${err.message}`);
    
    const isAtlasError = err.message.includes("Could not connect to any servers in your MongoDB Atlas cluster") || 
                         err.name === "MongooseServerSelectionError";
                         
    if (isAtlasError) {
      console.error(`\n  👉  POSSIBLE CAUSE: IP Whitelist Blocked`);
      console.error(`      MongoDB Atlas blocks connections from unrecognized IP addresses.`);
      console.error(`      Your current internet connection's IP is likely not whitelisted.`);
      console.error(`\n  🛠️   HOW TO FIX IT:`);
      console.error(`      1. Log in to your MongoDB Atlas dashboard:`);
      console.error(`         https://cloud.mongodb.com/`);
      console.error(`      2. Navigate to: Security -> Network Access (left-hand menu)`);
      console.error(`      3. Click the "Add IP Address" button`);
      console.error(`      4. Select either:`);
      console.error(`         - "Add Current IP Address" (adds your exact local IP)`);
      console.error(`         - "Allow Access From Anywhere" (sets to 0.0.0.0/0 - recommended for dev)`);
      console.error(`      5. Click "Confirm" and wait ~1-2 minutes for Atlas to deploy the update.`);
      
      console.error(`\n  💡  ALTERNATIVE (Run Locally):`);
      console.error(`      If you prefer to run MongoDB on your own machine instead of the cloud:`);
      console.error(`      1. Make sure MongoDB Community Server is installed & running.`);
      console.error(`      2. In your BACKENDD/.env file, change MONGODB_URI to:`);
      console.error(`         MONGODB_URI=mongodb://127.0.0.1:27017/tailschain`);
    }
    console.error(`==================================================\n`);
    process.exit(1);
  }
};

module.exports = connectDB;


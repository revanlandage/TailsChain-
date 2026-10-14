const mongoose = require("mongoose");
const dotenv   = require("dotenv");
dotenv.config();

const Animal = require("./models/Animal");
const User   = require("./models/User");

const animals = [
  { name:"Bruno",   category:"dog",   breed:"Labrador Retriever", age:2, gender:"male",   vaccinated:true,  image:"https://images.unsplash.com/photo-1552053831-71594a27632d?w=500&h=350&fit=crop", weight:"28 kg", color:"Golden",       healthStatus:"Healthy",   shelterLocation:"Pune Animal Shelter",     description:"Bruno is an energetic Labrador who loves to play fetch and cuddle. Great with kids!" },
  { name:"Mia",     category:"cat",   breed:"Persian",            age:1, gender:"female", vaccinated:true,  image:"https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=500&h=350&fit=crop", weight:"4 kg",  color:"White",        healthStatus:"Healthy",   shelterLocation:"Mumbai Cat Rescue",       description:"Mia is calm and affectionate. She loves being pampered." },
  { name:"Rocky",   category:"dog",   breed:"German Shepherd",    age:3, gender:"male",   vaccinated:true,  image:"https://images.unsplash.com/photo-1589941013453-ec89f33b5e95?w=500&h=350&fit=crop", weight:"32 kg", color:"Black & Tan",  healthStatus:"Healthy",   shelterLocation:"Delhi Animal Shelter",    description:"Rocky is loyal and trained. He is great for families." },
  { name:"Luna",    category:"cat",   breed:"Siamese",            age:2, gender:"female", vaccinated:false, image:"https://images.unsplash.com/photo-1533743983669-94fa5c4338ec?w=500&h=350&fit=crop", weight:"3.5 kg",color:"Cream & Brown", healthStatus:"Healthy",   shelterLocation:"Bangalore Cat Rescue",    description:"Luna is playful and curious. She loves to explore." },
  { name:"Charlie", category:"dog",   breed:"Golden Retriever",   age:1, gender:"male",   vaccinated:true,  image:"https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=500&h=350&fit=crop", weight:"22 kg", color:"Golden",       healthStatus:"Excellent", shelterLocation:"Pune Animal Shelter",     description:"Charlie is a puppy full of energy. Perfect for first-time owners." },
  { name:"Tweety",  category:"other", breed:"Parrot",             age:1, gender:"male",   vaccinated:false, image:"https://images.unsplash.com/photo-1552728089-57bdde30beb3?w=500&h=350&fit=crop", weight:"0.3 kg",color:"Green & Red",  healthStatus:"Healthy",   shelterLocation:"Chennai Bird Sanctuary",   description:"Tweety is talkative and colorful. He can mimic words and loves music." },
  { name:"Daisy",   category:"dog",   breed:"Beagle",             age:2, gender:"female", vaccinated:true,  image:"https://images.unsplash.com/photo-1505628346881-b72b27e84530?w=500&h=350&fit=crop", weight:"10 kg", color:"Tricolor",     healthStatus:"Healthy",   shelterLocation:"Hyderabad Animal Shelter", description:"Daisy is sweet and gentle. Loves cuddles and long walks." },
  { name:"Oliver",  category:"cat",   breed:"Maine Coon",         age:3, gender:"male",   vaccinated:true,  image:"https://images.unsplash.com/photo-1573865526739-10659fec78a5?w=500&h=350&fit=crop", weight:"6 kg",  color:"Brown Tabby",  healthStatus:"Healthy",   shelterLocation:"Kolkata Cat Home",         description:"Oliver is a big fluffy Maine Coon with a gentle personality." },
];

const seedDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("✅ MongoDB Connected");

    await Animal.deleteMany({});
    await User.deleteMany({ role: "admin" });
    console.log("🗑️  Cleared existing data");

    await Animal.insertMany(animals);
    console.log(`🐾 ${animals.length} animals seeded`);

    const admin = await User.create({
      name:     "TailsChain Admin",
      email:    "admin@tailschain.com",
      password: "admin123",
      role:     "admin",
    });
    console.log(`👤 Admin created: ${admin.email} / password: admin123`);

    console.log("\n✅ Database seeded successfully!");
    process.exit(0);
  } catch (err) {
    console.error("❌ Seed error:", err.message);
    process.exit(1);
  }
};

seedDB();

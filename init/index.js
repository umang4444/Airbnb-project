const mongoose = require("mongoose");
const Listing = require("../models/listing");
const initData = require("./data");

const MONGO_URL = "mongodb://127.0.0.1:27017/wanderlust";

async function main() {
  await mongoose.connect(MONGO_URL);
  console.log("connected to db");
}

const initDB = async () => {
  await Listing.deleteMany({});
   initData.data = initData.data.map((obj) => ({...obj,owner: "6948227ab8e308af89a72eb6"}));
  await Listing.insertMany(initData.data);
  console.log("data was initialized");
};

main().then(initDB).catch(console.log);

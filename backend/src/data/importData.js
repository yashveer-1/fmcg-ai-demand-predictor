import fs from "fs";
import csv from "csv-parser";
import mongoose from "mongoose";
import Sales from "../models/schema.js";
import dotenv from "dotenv";

dotenv.config();

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected"));

const results = [];

fs.createReadStream("data.csv")
  .pipe(csv())
  .on("data", (data) => {
  console.log("ROW:", data);
  results.push({
    date: new Date(data.date),
    sku_id: data.sku_id,
    region: data.region,
    units_sold: Number(data.units_sold),
    price: Number(data.price),
    promotion: Number(data.promotion)
  });
})
.on("end", async () => {
  console.log("Total rows read:", results.length);

  await Sales.deleteMany({});
  await Sales.insertMany(results);

  console.log("Inserted:", results.length);
  mongoose.connection.close();
});

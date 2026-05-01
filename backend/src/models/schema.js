import mongoose from "mongoose";

const salesSchema = new mongoose.Schema({
  date: Date,
  sku_id: String,
  region: String,
  units_sold: Number,
  price: Number,
  promotion: Number
}); 


const Sales = mongoose.model("Sales", salesSchema);

export default Sales;
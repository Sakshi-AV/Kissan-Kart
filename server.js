require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));

mongoose.connect(process.env.MONGO_URI || "mongodb://127.0.0.1:27017/kissan_kart")
  .then(() => console.log("MongoDB connected"))
  .catch(err => console.error("MongoDB connection error:", err.message));

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  category: String,
  price: Number,
  unit: String,
  emoji: String,
  badge: String,
  description: String,
  stock: { type: Number, default: 50 },
  createdAt: { type: Date, default: Date.now }
});

const orderSchema = new mongoose.Schema({
  customer: {
    name: String,
    phone: String,
    address: String
  },
  items: [{
    productId: String,
    name: String,
    price: Number,
    quantity: Number
  }],
  total: Number,
  status: { type: String, default: "Placed" },
  createdAt: { type: Date, default: Date.now }
});

const Product = mongoose.model("Product", productSchema);
const Order = mongoose.model("Order", orderSchema);

const seedProducts = [
  { name: "Organic Tomatoes", category: "Vegetables", price: 42, unit: "kg", emoji: "🍅", badge: "Fresh today", description: "Naturally grown, juicy red tomatoes." },
  { name: "Alphonso Mangoes", category: "Fruits", price: 249, unit: "box", emoji: "🥭", badge: "Season pick", description: "Sweet, fragrant Ratnagiri-style mangoes." },
  { name: "Farm Fresh Milk", category: "Dairy", price: 68, unit: "litre", emoji: "🥛", badge: "Morning batch", description: "Fresh dairy delivered from local farms." },
  { name: "Baby Spinach", category: "Leafy", price: 55, unit: "bundle", emoji: "🥬", badge: "Just harvested", description: "Tender leafy greens packed at source." },
  { name: "Country Eggs", category: "Dairy", price: 96, unit: "12 pcs", emoji: "🥚", badge: "Protein pick", description: "Farm eggs with rich golden yolks." },
  { name: "Red Onions", category: "Vegetables", price: 38, unit: "kg", emoji: "🧅", badge: "Value", description: "Crisp onions for everyday cooking." },
  { name: "Banana Bunch", category: "Fruits", price: 49, unit: "bunch", emoji: "🍌", badge: "Local farm", description: "Naturally ripened, creamy bananas." },
  { name: "Coriander", category: "Leafy", price: 20, unit: "bundle", emoji: "🌿", badge: "Picked today", description: "Aromatic coriander straight from the farm." }
];

app.get("/api/products", async (req, res) => {
  try {
    const { category, search } = req.query;
    const query = {};
    if (category && category !== "All") query.category = category;
    if (search) query.name = { $regex: search, $options: "i" };
    const products = await Product.find(query).sort({ createdAt: -1 });
    res.json(products);
  } catch (e) { res.status(500).json({ message: e.message }); }
});

app.post("/api/orders", async (req, res) => {
  try {
    const { customer, items, total } = req.body;
    if (!customer?.name || !customer?.phone || !customer?.address || !items?.length) {
      return res.status(400).json({ message: "Customer details and cart items are required." });
    }
    const order = await Order.create({ customer, items, total });
    res.status(201).json({ message: "Order placed successfully", orderId: order._id });
  } catch (e) { res.status(500).json({ message: e.message }); }
});

app.get("/api/orders/:id", async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: "Order not found" });
    res.json(order);
  } catch (e) { res.status(400).json({ message: "Invalid order ID" }); }
});

app.post("/api/seed", async (_req, res) => {
  try {
    if (await Product.countDocuments() === 0) await Product.insertMany(seedProducts);
    res.json({ message: "Products ready" });
  } catch (e) { res.status(500).json({ message: e.message }); }
});

app.get("*", (_req, res) => res.sendFile(path.join(__dirname, "public/index.html")));

app.listen(PORT, () => console.log(`Kissan Kart running at http://localhost:${PORT}`));
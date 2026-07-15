// app.js
const express = require("express");
const path = require("path");
const bodyParser = require("body-parser");
const methodOverride = require("method-override");

const transactionRoutes = require("./routes/transactionRoutes");

const app = express();
const PORT = process.env.PORT || 3000;

// View engine setup
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());
app.use(methodOverride("_method")); // allows <input name="_method" value="PUT/DELETE">
app.use(express.static(path.join(__dirname, "public")));

// Routes
app.get("/", (req, res) => res.redirect("/transactions"));
app.use("/transactions", transactionRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).send("Page not found");
});

app.listen(PORT, () => {
  console.log(`UPI Fraud Detection app running at http://localhost:${PORT}`);
});

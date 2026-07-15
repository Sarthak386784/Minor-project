// routes/transactionRoutes.js
const express = require("express");
const router = express.Router();
const Transaction = require("../models/transactionModel");
const { detectFraud } = require("../utils/fraudDetector");

// READ ALL - list all transactions (with optional status filter)
router.get("/", (req, res) => {
  let transactions = Transaction.getAll();
  const { status } = req.query;

  if (status && status !== "All") {
    transactions = transactions.filter((t) => t.status === status);
  }

  const stats = {
    total: Transaction.getAll().length,
    genuine: Transaction.getAll().filter((t) => t.status === "Genuine").length,
    suspicious: Transaction.getAll().filter((t) => t.status === "Suspicious").length,
    fraud: Transaction.getAll().filter((t) => t.status === "Fraud").length
  };

  res.render("index", { transactions, stats, activeFilter: status || "All" });
});

// CREATE - show new transaction form
router.get("/new", (req, res) => {
  res.render("new");
});

// CREATE - handle form submission
router.post("/", (req, res) => {
  const { senderUPI, receiverUPI, amount, date } = req.body;

  const txnDraft = {
    senderUPI: senderUPI.trim(),
    receiverUPI: receiverUPI.trim(),
    amount: parseFloat(amount),
    date: date ? new Date(date).toISOString() : new Date().toISOString()
  };

  const allTxns = Transaction.getAll();
  const { status, reason } = detectFraud(txnDraft, allTxns);

  Transaction.create({ ...txnDraft, status, reason });
  res.redirect("/transactions");
});

// READ ONE - show single transaction details
router.get("/:id", (req, res) => {
  const txn = Transaction.getById(req.params.id);
  if (!txn) return res.status(404).send("Transaction not found");
  res.render("show", { txn });
});

// UPDATE - show edit form
router.get("/:id/edit", (req, res) => {
  const txn = Transaction.getById(req.params.id);
  if (!txn) return res.status(404).send("Transaction not found");
  res.render("edit", { txn });
});

// UPDATE - handle edit submission (re-runs fraud detection)
router.put("/:id", (req, res) => {
  const { senderUPI, receiverUPI, amount, date } = req.body;

  const txnDraft = {
    senderUPI: senderUPI.trim(),
    receiverUPI: receiverUPI.trim(),
    amount: parseFloat(amount),
    date: date ? new Date(date).toISOString() : new Date().toISOString()
  };

  const allTxns = Transaction.getAll().filter((t) => t.id !== req.params.id);
  const { status, reason } = detectFraud(txnDraft, allTxns);

  Transaction.update(req.params.id, { ...txnDraft, status, reason });
  res.redirect(`/transactions/${req.params.id}`);
});

// DELETE
router.delete("/:id", (req, res) => {
  Transaction.remove(req.params.id);
  res.redirect("/transactions");
});

module.exports = router;

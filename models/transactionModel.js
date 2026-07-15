// models/transactionModel.js
// A tiny file-based "database" using a JSON file.
// Keeps the project dependency-free (no MongoDB/MySQL setup required).

const fs = require("fs");
const path = require("path");
const { v4: uuidv4 } = require("uuid");

const DB_PATH = path.join(__dirname, "..", "data", "transactions.json");

function readAll() {
  const raw = fs.readFileSync(DB_PATH, "utf-8");
  return raw.trim() ? JSON.parse(raw) : [];
}

function writeAll(transactions) {
  fs.writeFileSync(DB_PATH, JSON.stringify(transactions, null, 2), "utf-8");
}

function getAll() {
  return readAll().sort((a, b) => new Date(b.date) - new Date(a.date));
}

function getById(id) {
  return readAll().find((t) => t.id === id);
}

function create(data) {
  const transactions = readAll();
  const newTxn = {
    id: uuidv4(),
    senderUPI: data.senderUPI,
    receiverUPI: data.receiverUPI,
    amount: data.amount,
    date: data.date || new Date().toISOString(),
    status: data.status,
    reason: data.reason,
    createdAt: new Date().toISOString()
  };
  transactions.push(newTxn);
  writeAll(transactions);
  return newTxn;
}

function update(id, data) {
  const transactions = readAll();
  const index = transactions.findIndex((t) => t.id === id);
  if (index === -1) return null;

  transactions[index] = {
    ...transactions[index],
    senderUPI: data.senderUPI,
    receiverUPI: data.receiverUPI,
    amount: data.amount,
    date: data.date,
    status: data.status,
    reason: data.reason,
    updatedAt: new Date().toISOString()
  };

  writeAll(transactions);
  return transactions[index];
}

function remove(id) {
  const transactions = readAll();
  const filtered = transactions.filter((t) => t.id !== id);
  writeAll(filtered);
  return filtered.length !== transactions.length;
}

module.exports = { getAll, getById, create, update, remove };

// utils/fraudDetector.js
// Simple rule-based UPI fraud detection engine.
// In a real system this would be a ML model, here we use explainable rules.

const HIGH_AMOUNT_THRESHOLD = 100000; // ₹1,00,000
const FREQUENCY_WINDOW_MS = 5 * 60 * 1000; // 5 minutes
const FREQUENCY_LIMIT = 3; // more than 3 txns in window from same sender = suspicious

// You can extend this blacklist with known fraudulent UPI IDs
const BLACKLISTED_UPI_IDS = [
  "fraud@upi",
  "scammer@ybl",
  "fake@oksbi"
];

/**
 * Analyze a transaction against existing transactions and return
 * { status: 'Genuine' | 'Suspicious' | 'Fraud', reason: string }
 */
function detectFraud(newTxn, allTxns) {
  const reasons = [];
  let status = "Genuine";

  const amount = parseFloat(newTxn.amount);

  // Rule 1: Blacklisted receiver UPI ID
  if (BLACKLISTED_UPI_IDS.includes(newTxn.receiverUPI.toLowerCase())) {
    status = "Fraud";
    reasons.push("Receiver UPI ID is blacklisted");
  }

  // Rule 2: High amount transaction
  if (amount >= HIGH_AMOUNT_THRESHOLD) {
    status = status === "Fraud" ? "Fraud" : "Suspicious";
    reasons.push(`Amount ₹${amount} exceeds high-risk threshold of ₹${HIGH_AMOUNT_THRESHOLD}`);
  }

  // Rule 3: High frequency of transactions from same sender in short window
  const now = new Date(newTxn.date).getTime();
  const recentFromSameSender = allTxns.filter((t) => {
    return (
      t.senderUPI === newTxn.senderUPI &&
      now - new Date(t.date).getTime() <= FREQUENCY_WINDOW_MS
    );
  });

  if (recentFromSameSender.length >= FREQUENCY_LIMIT) {
    status = status === "Fraud" ? "Fraud" : "Suspicious";
    reasons.push(
      `Sender made ${recentFromSameSender.length + 1} transactions within 5 minutes (possible fraud pattern)`
    );
  }

  // Rule 4: Sender and receiver same (self transaction irregularity)
  if (newTxn.senderUPI.toLowerCase() === newTxn.receiverUPI.toLowerCase()) {
    status = status === "Fraud" ? "Fraud" : "Suspicious";
    reasons.push("Sender and receiver UPI IDs are identical");
  }

  if (reasons.length === 0) {
    reasons.push("No fraud indicators detected");
  }

  return { status, reason: reasons.join("; ") };
}

module.exports = { detectFraud, HIGH_AMOUNT_THRESHOLD, BLACKLISTED_UPI_IDS };

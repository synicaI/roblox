import express from "express";

const app = express();
const PORT = process.env.PORT || 3000;

// === CONFIG ===
const SECRET_KEY = "DQOWHDIUQWHIQUWHDWQIUDHQWIUDHQWHDQWIUFHQIFQ";
const VALID_SCRIPT_KEYS = new Set([
  "1f5531ecdc71b76979960fb624e81154"
]);

const blacklisted = new Set();

// === HELPERS ===
function unauthorized(res) {
  res.status(200).send("Unauthorized!");
}

// === AUTH ENDPOINT ===
app.get("/v9/auth", (req, res) => {
  const {
    SECRET_KEY: secret,
    k,
    experienceId,
    t,
    t2,
    t3,
    t4
  } = req.query;

  // Basic validation
  if (secret !== SECRET_KEY) return unauthorized(res);
  if (!VALID_SCRIPT_KEYS.has(k)) return unauthorized(res);
  if (!experienceId || !t || !t2 || !t3 || !t4) return unauthorized(res);
  if (blacklisted.has(k)) return unauthorized(res);

  // SUCCESS → return empty body
  return res.status(200).send("");
});

// === BLACKLIST ENDPOINT ===
app.get("/auth/bl", (req, res) => {
  const { K, r, experienceId } = req.query;

  if (!K || !r) {
    return res.status(200).send("Invalid request");
  }

  blacklisted.add(K);

  console.log("Blacklisted:", {
    key: K,
    reason: r,
    experienceId
  });

  return res
    .status(200)
    .send("Key and user blacklisted successfully");
});

// === START SERVER ===
app.listen(PORT, () => {
  console.log(`Auth server running on port ${PORT}`);
});

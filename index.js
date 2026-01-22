import express from "express";

const app = express();
const PORT = process.env.PORT || 3000;

// ================= CONFIG =================
const SECRET_KEY = "DQOWHDIUQWHIQUWHDWQIUDHQWIUDHQWHDQWIUFHQIFQ";
const EXPIRATION_DATE = new Date("2026-02-25T00:00:00Z");

// Key database (use real DB later)
const keys = {
  "1f5531ecdc71b76979960fb624e81154": {
    hwid: null,
    expires: EXPIRATION_DATE
  }
};

const blacklisted = new Set();

// ================= HELPERS =================
function unauthorized(res) {
  return res.status(200).send("Unauthorized!");
}

// ================= AUTH =================
app.get("/v9/auth", (req, res) => {
  const {
    SECRET_KEY: secret,
    k,
    hwid,
    experienceId,
    t,
    t2,
    t3,
    t4
  } = req.query;

  // Basic checks
  if (secret !== SECRET_KEY) return unauthorized(res);
  if (!keys[k]) return unauthorized(res);
  if (!hwid) return unauthorized(res);
  if (!experienceId || !t || !t2 || !t3 || !t4) return unauthorized(res);

  const keyData = keys[k];

  // Expiration check
  if (new Date() > keyData.expires) {
    return unauthorized(res);
  }

  // HWID lock
  if (!keyData.hwid) {
    keyData.hwid = hwid;
    console.log(`HWID locked for key ${k}: ${hwid}`);
  } else if (keyData.hwid !== hwid) {
    return unauthorized(res);
  }

  return res.status(200).send("");
});

// ================= BLACKLIST =================
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

  return res.status(200).send(
    "Key and user blacklisted successfully"
  );
});

// ================= START =================
app.listen(PORT, () => {
  console.log(`Auth server running on ${PORT}`);
});

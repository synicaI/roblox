import express from "express";
const app = express();

// ================= CONFIG =================
const PORT = process.env.PORT || 8080;
const SECRET_KEY = "DQOWHDIUQWHIQUWHDWQIUDHQWIUDHQWHDQWIUFHQIFQ";

// ================= KEYS =================
const keys = {
  // Existing
  "a9c3f72b5e4d8190f1c7b2e3d6a98c41": { hwid: null, expires: null },
  "x972jsdjdinsdvbdozopnksd92ejd919": { hwid: null, expires: null }
};

// ================= HELPERS =================
function unauthorized(res, reason = "Unauthorized!") {
  console.log("AUTH FAIL:", reason);
  return res.status(200).send(reason);
}

// ================= AUTH ROUTE =================
app.get("/v9/auth", (req, res) => {
  const { SECRET_KEY: secret, k, hwid, experienceId } = req.query;

  console.log("==== AUTH ATTEMPT ====");
  console.log({ key: k, hwid, experienceId, time: new Date() });

  if (secret !== SECRET_KEY) return unauthorized(res, "Invalid secret key");
  if (!k || !keys[k]) return unauthorized(res, "Key not found");
  if (!hwid) return unauthorized(res, "HWID missing");
  if (!experienceId) return unauthorized(res, "ExperienceId missing");

  const keyData = keys[k];

  if (keyData.expires && new Date() > keyData.expires) return unauthorized(res, "Key expired");

  if (!keyData.hwid) {
    keyData.hwid = hwid;
    console.log(`HWID locked for key ${k}: ${hwid}`);
  } else if (keyData.hwid !== hwid) {
    return unauthorized(res, `HWID mismatch. Expected ${keyData.hwid}, got ${hwid}`);
  }

  console.log(`AUTH SUCCESS: key ${k} for HWID ${hwid}`);
  return res.status(200).send(""); // empty string = success
});

// ================= HWID RESET =================
app.get("/reset-hwid", (req, res) => {
  const { k, secret } = req.query;
  if (secret !== SECRET_KEY) return res.status(403).send("Forbidden");
  if (!k || !keys[k]) return res.status(404).send("Key not found");

  keys[k].hwid = null;
  console.log(`HWID RESET for key ${k}`);
  return res.status(200).send("HWID reset successfully");
});

// ================= START SERVER =================
app.listen(PORT, () => {
  console.log(`Auth server running on port ${PORT}`);
});

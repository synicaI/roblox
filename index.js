import express from "express";

const app = express();
app.use(express.json());

const PORT = 8080;
const SECRET_KEY = process.env.SECRET_KEY || "CHANGE_ME";

// =====================
// IN-MEMORY KEY STORE
// =====================
// key : { hwid: string | null }
const KEYS = {};

// =====================
// AUTH MIDDLEWARE
// =====================
function auth(req, res, next) {
  if (req.headers["x-secret"] !== SECRET_KEY) {
    return res.status(403).json({ error: "Forbidden" });
  }
  next();
}

// =====================
// DISCORD ROUTES
// =====================

// ADD KEY
app.post("/key/add", auth, (req, res) => {
  const { key } = req.body;
  if (!key) return res.status(400).json({ error: "Missing key" });

  if (!KEYS[key]) {
    KEYS[key] = { hwid: null };
  }

  res.json({ success: true });
});

// DELETE KEY
app.post("/key/delete", auth, (req, res) => {
  const { key } = req.body;
  if (!key) return res.status(400).json({ error: "Missing key" });

  delete KEYS[key];
  res.json({ success: true });
});

// RESET HWID
app.post("/key/reset", auth, (req, res) => {
  const { key } = req.body;
  if (!KEYS[key]) return res.status(404).json({ error: "Key not found" });

  KEYS[key].hwid = null;
  res.json({ success: true });
});

// LIST KEYS
app.get("/key/list", auth, (req, res) => {
  res.json({
    keys: Object.keys(KEYS).map(k => ({
      key: k,
      hwid: KEYS[k].hwid
    }))
  });
});

// =====================
// ROBLOX VERIFY
// =====================
app.post("/auth/verify", (req, res) => {
  const { key, hwid } = req.body;

  if (!KEYS[key]) {
    return res.json({ valid: false, reason: "Invalid key" });
  }

  // first execution → lock HWID
  if (KEYS[key].hwid === null) {
    KEYS[key].hwid = hwid;
    return res.json({ valid: true, first: true });
  }

  // HWID mismatch
  if (KEYS[key].hwid !== hwid) {
    return res.json({ valid: false, reason: "HWID mismatch" });
  }

  res.json({ valid: true });
});

app.listen(PORT, () => {
  console.log("Auth server running on", PORT);
});

import express from "express";
const app = express();

const PORT = process.env.PORT || 8080;
const SECRET_KEY = process.env.SECRET_KEY;

const keys = {
  "0001": { hwid: null, expires: null }
};

app.get("/v9/auth", (req, res) => {
  const { SECRET_KEY: secret, k, hwid, experienceId } = req.query;

  if (secret !== SECRET_KEY) return res.sendStatus(401);
  if (!k || !keys[k]) return res.sendStatus(401);
  if (!hwid) return res.sendStatus(403);
  if (!experienceId) return res.sendStatus(403);

  const key = keys[k];

  if (key.expires && Date.now() > key.expires) {
    return res.sendStatus(403);
  }

  if (!key.hwid) {
    key.hwid = hwid;
    return res.sendStatus(200);
  }

  if (key.hwid !== hwid) {
    return res.sendStatus(403);
  }

  return res.sendStatus(200);
});

app.listen(PORT);

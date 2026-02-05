import express from "express"
import bodyParser from "body-parser"

const app = express()
const PORT = 8080
const SECRET_KEY = "DQOWHDIUQWHIQUWHDWQIUDHQWIUDHQWHDQWIUFHQIFQ"

app.use(bodyParser.json())

// IN-MEMORY STORE
const keys = {}

// ─────────────────────────────
// ADD KEY
app.post("/key/add", (req, res) => {
    if (req.headers.authorization !== SECRET_KEY)
        return res.status(403).json({ error: "Forbidden" })

    const { key } = req.body
    if (!key) return res.status(400).json({ error: "No key" })

    if (!keys[key]) {
        keys[key] = { hwid: null }
    }

    res.json({ success: true })
})

// DELETE KEY
app.post("/key/delete", (req, res) => {
    if (req.headers.authorization !== SECRET_KEY)
        return res.status(403).json({ error: "Forbidden" })

    const { key } = req.body
    delete keys[key]

    res.json({ success: true })
})

// RESET HWID
app.post("/key/reset", (req, res) => {
    if (req.headers.authorization !== SECRET_KEY)
        return res.status(403).json({ error: "Forbidden" })

    const { key } = req.body
    if (!keys[key]) return res.status(404).json({ error: "Key not found" })

    keys[key].hwid = null
    res.json({ success: true })
})

// LIST KEYS
app.get("/key/list", (req, res) => {
    if (req.query.secret !== SECRET_KEY)
        return res.status(403).json({ error: "Forbidden" })

    res.json(keys)
})

// ROBLOX AUTH
app.post("/auth", (req, res) => {
    const { key, hwid } = req.body
    const entry = keys[key]

    if (!entry) {
        return res.json({ success: false, reason: "Invalid key" })
    }

    // FIRST EXECUTION → LOCK HWID
    if (entry.hwid === null) {
        entry.hwid = hwid
        return res.json({ success: true, first: true })
    }

    // HWID CHECK
    if (entry.hwid !== hwid) {
        return res.json({ success: false, reason: "HWID mismatch" })
    }

    res.json({ success: true })
})

app.listen(PORT, () => {
    console.log("Auth server running on", PORT)
})

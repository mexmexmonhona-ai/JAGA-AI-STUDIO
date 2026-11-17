const express = require("express");
const router = express.Router();
const db = require("../database");

router.get("/", (req, res) => {
  const clients = db.prepare(
    "SELECT * FROM clients ORDER BY id DESC"
  ).all();

  res.json({ success: true, clients });
});

router.post("/", (req, res) => {
  const { name, phone, telegram, instagram, notes } = req.body;

  if (!name || !name.trim()) {
    return res.status(400).json({
      success: false,
      message: "Mijoz ismi kiritilishi shart"
    });
  }

  const result = db.prepare(`
    INSERT INTO clients (name, phone, telegram, instagram, notes)
    VALUES (?, ?, ?, ?, ?)
  `).run(
    name.trim(),
    phone || "",
    telegram || "",
    instagram || "",
    notes || ""
  );

  res.status(201).json({
    success: true,
    message: "Mijoz saqlandi",
    id: result.lastInsertRowid
  });
});

router.delete("/:id", (req, res) => {
  const result = db.prepare(
    "DELETE FROM clients WHERE id = ?"
  ).run(req.params.id);

  res.json({
    success: result.changes > 0,
    message: result.changes > 0
      ? "Mijoz o'chirildi"
      : "Mijoz topilmadi"
  });
});

module.exports = router;
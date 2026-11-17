
const express = require("express");
const router = express.Router();
const db = require("../database");

// Barcha buyurtmalar
router.get("/", (req, res) => {
  const orders = db.prepare(`
    SELECT orders.*, clients.name AS client_name,
           clients.phone AS client_phone
    FROM orders
    JOIN clients ON clients.id = orders.client_id
    ORDER BY orders.id DESC
  `).all();

  res.json({ success: true, orders });
});

// Yangi buyurtma
router.post("/", (req, res) => {
  const {
    client_id,
    title,
    description,
    price,
    paid,
    deadline
  } = req.body;

  if (!client_id || !title || !title.trim()) {
    return res.status(400).json({
      success: false,
      message: "Mijoz va buyurtma nomi shart"
    });
  }

  const client = db.prepare(
    "SELECT id FROM clients WHERE id = ?"
  ).get(client_id);

  if (!client) {
    return res.status(404).json({
      success: false,
      message: "Mijoz topilmadi"
    });
  }

  const result = db.prepare(`
    INSERT INTO orders
    (client_id, title, description, price, paid, deadline)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(
    client_id,
    title.trim(),
    description || "",
    Math.max(0, Number(price) || 0),
    Math.max(0, Number(paid) || 0),
    deadline || null
  );

  res.status(201).json({
    success: true,
    message: "Buyurtma saqlandi",
    id: result.lastInsertRowid
  });
});

// Buyurtma holatini o'zgartirish
router.patch("/:id/status", (req, res) => {
  const allowed = ["new", "in_progress", "completed", "cancelled"];
  const { status } = req.body;

  if (!allowed.includes(status)) {
    return res.status(400).json({
      success: false,
      message: "Noto'g'ri buyurtma holati"
    });
  }

  const result = db.prepare(
    "UPDATE orders SET status = ? WHERE id = ?"
  ).run(status, req.params.id);

  res.json({
    success: result.changes > 0,
    message: result.changes > 0
      ? "Buyurtma holati yangilandi"
      : "Buyurtma topilmadi"
  });
});

module.exports = router;

const express = require("express");
const { db } = require("../config/database");

const router = express.Router();


//Board Member Access
router.get("/boardMemberAccess/:id", async (req, res) => {
  const id = req.params.id;
  const query = "SELECT level_of_access FROM board_members WHERE user_id = ?";
  db.query(query, [id], (err, result) => {
    if (err) {
      console.error("Database error:", err);
      return res.status(500).json({ message: "Database Error" });
    }
    res.json(result[0]);
  });
});
router.get("/clubAccess/:id", (req, res) => {
  const memberId = req.params.id;
  const query = "SELECT * FROM board_members WHERE user_id = ?";

  db.query(query, [memberId], (err, results) => {
    if (err) {
      console.error("Database error:", err);
      return res.status(500).json({ message: "Internal server error" });
    }

    if (results.length === 0) {
      return res.status(202).json({ message: "No Club Access" });
    }

    res.status(200).json(results[0]); // Send only the first (and only) result
  });
});
router.get("/association/boardMembers/:access", (req, res) => {
  const access = req.params.access;
  const levels = ['club','council','association'];

  const query = `SELECT user_id FROM board_members WHERE level_of_access IN ('${levels.slice(access-1).join("','")}')`;
  
  db.query(query, (err, results) => {
    res.json(results);
  });
});
//Update payment info for a user
router.post("/updatePayment", (req, res) => {
  const { user_id, paid, paid_date } = req.body;
  const query =
    "UPDATE members SET paid = ?, paid_date = ?, guest = 0 WHERE user_id = ?";
  db.query(query, [paid, paid_date, user_id], (err, result) => {
    if (err) {
      console.error("Database error:", err);
      return res.status(500).json({ message: "Database Error" });
    }
    return res.status(200).json({ message: "Payment Updated Successfully" });
  });
});

router.post("/guest/increment", (req, res) => {
  const {user_id, guest} = req.body;
  const query =
    "UPDATE members SET guest = ? WHERE user_id = ?";
  db.query(query, [guest, user_id], (err, result) => {
    if (err) {
      console.error("Database error:", err);
      return res.status(500).json({ message: "Database Error" });
    }
    return res.status(200).json({ message: "Meetings Incremented Successfully" });
  });
});

router.post("/send-messages", async (req, res) => {
  const { senderId } = req.body;
  const query = "SELECT * FROM boardmember WHERE member_id = ?";
  db.query(query, [senderId], (err, result) => {
    if (err) {
      console.error("Database error:", err);
      return res.status(500).json({ message: "Database Error" });
    }
    res.json(result);
  });
});


module.exports = router;
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

router.post("/user/guest", (req, res) => {
  const { user_id } = req.body;
  const ConstraintQuery =
    "UPDATE members SET guest=TRUE, paid=FALSE WHERE user_id = ?";
  db.query(ConstraintQuery, [user_id], (err, result) => {
    if (err) {
      console.error("Database error:", err);
      return res.status(500).json({ message: "Database Error" });
    }
    return res.status(200).json({ message: "guest Updated Successfully" });
  });
});
router.post("/user/member", (req, res) => {
  const today = new Date().toISOString().slice(0, 10);

  const { user_id } = req.body;
  const ConstraintQuery = `UPDATE members SET join_date=?, end_date=?, guest=FALSE, paid=TRUE WHERE user_id = ?`;
  db.query(ConstraintQuery, [today, "2025-06-30", user_id], (err, result) => {
    if (err) {
      console.error("Database error:", err);
      return res.status(500).json({ message: "Database Error" });
    }
    return res.status(200).json({ message: "guest Updated Successfully" });
  });
});

module.exports = router;
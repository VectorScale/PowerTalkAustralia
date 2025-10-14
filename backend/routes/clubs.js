const express = require("express");
const { db } = require("../config/database");

const router = express.Router();

router.get("/user/:id", (req, res) => {
  const userId = req.params.id;
  const query = "SELECT Club_id as club_id FROM `member's club` WHERE User_id = ?";

  db.query(query, [userId], (err, results) => {
    if (err) {
      console.error("Database error:", err);
      return res.status(500).json({ message: "Internal server error" });
    }

    if (results.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(results);
  });
});
router.get("/allClubs/", (req, res) => {
  const query = "SELECT club_id FROM club";

  db.query(query, (err, results) => {
    if (err) {
      console.error("Database error:", err);
      return res.status(500).json({ message: "Internal server error" });
    }

    if (results.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(results);
  });
});
router.get("/club/:id", (req, res) => {
  const clubId = req.params.id;
  const query = "SELECT club_name FROM club WHERE club_id = ?";

  db.query(query, [clubId], (err, results) => {
    if (err) {
      console.error("Database error:", err);
      return res.status(500).json({ message: "Internal server error" });
    }

    if (results.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(results[0]);
  });
});
router.get("/club_details/:id", (req, res) => {
  const clubId = req.params.id;
  const query = "SELECT * FROM club WHERE Club_id = ?";

  db.query(query, [clubId], (err, results) => {
    if (err) {
      console.error("Database error:", err);
      return res.status(500).json({ message: "Internal server error" });
    }

    if (results.length === 0) {
      return res.status(404).json({ message: "CLub not found" });
    }

    res.json(results); // Send only the first (and only) result
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

router.get("/clubBoard/:id", (req, res) => {
  const clubId = req.params.id;
  const query = "SELECT User_id FROM `member's club` WHERE Club_id = ?";

  db.query(query, [clubId], (err, results) => {
    if (err) {
      console.error("Database error:", err);
      return res.status(500).json({ message: "Internal server error" });
    }

    if (results.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(results);
  });
});
router.get("/notInClub/:id", (req, res) => {
  const clubId = req.params.id;
  const query =
    "select user_id from members where user_id not in (select User_id from `member's club` where Club_id = ?)";

  db.query(query, [clubId], (err, results) => {
    if (err) {
      console.error("Database error:", err);
      return res.status(500).json({ message: "Internal server error" });
    }

    if (results.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(results);
  });
});

router.get("/clubBoardMembers/:id", (req, res) => {
  const UserId = req.params.id;
  const query = "SELECT * FROM members WHERE user_id = ?";

  db.query(query, [UserId], (err, results) => {
    if (err) {
      console.error("Database error:", err);
      return res.status(500).json({ message: "Internal server error" });
    }

    if (results.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(results);
  });
});
router.get("/club/:clubName", (req, res) => {
  const clubName = req.params.clubName;
  const query = "SELECT * FROM club WHERE Club_name = ?";

  db.query(query, [clubName], (err, results) => {
    if (err) {
      console.error("Database error:", err);
      return res.status(500).json({ message: "Internal server error" });
    }

    if (results.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(results);
  });
});
router.get("/clubs", (req, res) => {
  const query = "SELECT Club_id, Club_name FROM club";
  db.query(query, (err, results) => {
    if (err) return res.status(500).json({ message: "Internal server error" });
    res.json(results);
  });
});
router.post("/send-message", async (req, res) => {
  const { senderId } = req.body;
  const query = "SELECT * FROM members WHERE user_id = ?";
  db.query(query, [senderId], (err, result) => {
    if (err) {
      console.error("Database error:", err);
      return res.status(500).json({ message: "Database Error" });
    }

    res.json(result);
  });
});

module.exports = router;
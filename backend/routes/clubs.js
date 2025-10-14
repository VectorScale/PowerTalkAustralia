const express = require("express");
const { db } = require("../config/database");

const router = express.Router();

router.get("/user/:id", (req, res) => {
  const userId = req.params.id;
  const query =
    "SELECT Club_id as club_id FROM `member's club` WHERE User_id = ?";

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
      return res.status(404).json({ message: "Club not found" });
    }

    res.json(results); // Send only the first (and only) result
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
//Despite being called board member, this route is used to assign a member to a club
router.post("/BoardMember", (req, res) => {
  var today = new Date();
  var dd = String(today.getDate()).padStart(2, "0");
  var mm = String(today.getMonth() + 1).padStart(2, "0");
  var yyyy = today.getFullYear();

  var join_date = yyyy + "-" + mm + "-" + dd;

  const { User_id, Club_id } = req.body;
  const query =
    "INSERT INTO `member's club` (User_id, Club_id, join_date) VALUES (?, ?, ?)";
  db.query(query, [User_id, Club_id, join_date], (err, result) => {
    if (err) {
      console.error("Database error:", err);
      return res.status(500).json({ message: "Database Error" });
    }
    return res.status(200).json({ message: "New Member Added Successfully" });
  });
});
router.get("/clubs", (req, res) => {
  const query = "SELECT club_id, club_name FROM club";
  db.query(query, (err, results) => {
    if (err) return res.status(500).json({ message: "Internal server error" });
    res.json(results);
  });
});

module.exports = router;
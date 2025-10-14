const express = require("express");
const { db } = require("../config/database");

const router = express.Router();

// Get profile
router.get("/:id", (req, res) => {
  const userId = req.params.id;
  const query = "SELECT * FROM members WHERE user_id = ?";
  
  db.query(query, [userId], (err, result) => {
    if (err) {
      console.error("Database error:", err);
      return res.status(500).json({ message: "Database Error" });
    }
    
    if (result.length > 0) {
      res.json(result[0]);
    } else {
      res.status(404).json({ message: "User not found" });
    }
  });
});

// Edit profile
router.post("/edit", (req, res) => {
  const {
    profile_id,
    first_name,
    last_name,
    email,
    phone_number,
    address,
    postcode,
    interests,
    pronouns,
    dob,
  } = req.body;
  
  const editProfileQuery = "UPDATE members SET first_name = ?, last_name = ?, email = ?, phone_number = ?, address = ?, postcode = ?, interests = ?, pronouns = ?, dob = ? WHERE user_id = ?";
  
  db.query(editProfileQuery, [first_name, last_name, email, phone_number, address, postcode, interests, pronouns, dob, profile_id], (err, result) => {
    if (err) {
      console.error("Database error:", err);
      return res.status(500).json({ message: "Database Error" });
    }
    return res.status(200).json({ message: "Profile Updated Successfully" });
  });
});

// Update data sharing preferences
router.post("/share", (req, res) => {
  const { profile_id, phone_private, address_private } = req.body;
  const editProfileQuery = "UPDATE members SET phone_private = ?, address_private = ? WHERE user_id = ?";
  
  db.query(editProfileQuery, [phone_private, address_private, profile_id], (err, result) => {
    if (err) {
      console.error("Database error:", err);
      return res.status(500).json({ message: "Database Error" });
    }
    return res.status(200).json({ message: "Profile Updated Successfully" });
  });
});

module.exports = router;
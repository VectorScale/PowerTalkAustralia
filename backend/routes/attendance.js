const express = require("express");
const { db } = require("../config/database");

const router = express.Router();

/**
 * POST /join - Register a user for a meeting and set attendance status
 * 
 * Creates a new meeting attendance record for a user. Used when a user
 * signs up for a meeting or updates their attendance intention.
 * 
 * @param {number} user_id - ID of the user joining the meeting
 * @param {number} meeting_id - ID of the meeting being joined  
 * @param {boolean} attended - Attendance status (true/false)
 * 
 * @returns {Object} Success message or database error
 * @throws {500} Database operation failure
 */
router.post("/join", (req, res) => {
   let { user_id, meeting_id, attended }= req.body;
  const query = "INSERT INTO meeting_attendance (user_id , meeting_id, attended) VALUES (?, ?, ?)";
  db.query(query, [ user_id, meeting_id, attended] , (err, result) => {
    if (err) {
      console.error("Database error:", err);
      return res.status(500).json({ message: "Database Error" });
    }
    return res.status(200).json({ message: "User Joined Successfully" });
  })
});
/**
 * DELETE /notjoin - Remove a user's meeting registration
 * 
 * Deletes a meeting attendance record when a user cancels their registration
 * or decides not to attend a meeting they previously signed up for.
 * 
 * @param {number} user_id - ID of the user to remove
 * @param {number} meeting_id - ID of the meeting to leave
 * 
 * @returns {Object} Success message or database error  
 * @throws {500} Database operation failure
 */
router.delete("/notjoin", (req, res) => {
   let { user_id, meeting_id }= req.body;
  const query = "DELETE FROM meeting_attendance WHERE user_id = ? AND meeting_id = ?";
  db.query(query, [ user_id , meeting_id] , (err, result) => {
    if (err) {
      console.error("Database error:", err);
      return res.status(500).json({ message: "Database Error" });
    }
    return res.status(200).json({ message: "User Deleted Successfully" });
  })
});
/**
 * GET /join_meeting/:id - Get all meeting registrations for a user
 * 
 * Retrieves complete meeting attendance history for a specific user.
 * Returns all meetings the user has registered for or attended.
 * 
 * @param {number} id - User ID to fetch attendance records for
 * 
 * @returns {Array} List of meeting attendance records
 * @throws {500} Database operation failure
 */
router.get("/join_meeting/:id" , (req, res) =>{
  let id = req.params.id;
  const query = "SELECT * FROM meeting_attendance WHERE user_id = ?"
   db.query(query, [id], (err, result) => {
    if (err) {
      console.error("Database error:", err);
      return res.status(500).json({ message: "Database Error" });
    }

      res.json(result);
    
  });
});

module.exports = router;
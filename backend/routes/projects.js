const express = require("express");
const { db } = require("../config/database");

const router = express.Router();

router.get("/project/:id", (req, res) => {
  const projectlevel = req.params.id;
  const query = "SELECT * FROM `development program` WHERE project_level = ?";

  db.query(query, [projectlevel], (err, result) => {
    if (err) {
      console.error("Database error:", err);
      return res.status(500).json({ message: "Internal server error" });
    }

    if (result.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json(result);
  });
});
router.post("/projects/", (req, res) => {
  const { program_level, user_id } = req.body;
  const query =
    "SELECT * FROM development_program WHERE program_level = ? AND user_id = ? ORDER BY project_number ASC";

  db.query(query, [program_level, user_id], (err, result) => {
    if (err) {
      console.error("Database error:", err);
      return res.status(500).json({ message: "Internal server error" });
    }

    if (result.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json(result);
  });
});
router.get("/projectss/:id/:level", (req, res) => {
  const projectlevel = req.params.level;
  const projectid = req.params.id;
  const query =
    "SELECT * FROM `development program` WHERE member_id= ? AND project_level = ?";

  db.query(query, [projectid, projectlevel], (err, result) => {
    if (err) {
      console.error("Database error:", err);
      return res.status(500).json({ message: "Internal server error" });
    }

    if (result.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json(result);
  });
});
router.post("/member/projects/1", async (req, res) => {
  const projectnames = [
    "Thoughts for the Day/Inspiration",
    "Closing Thought",
    "Issues of the Day",
    "Self-Introduction Speech\n4-7 minutes",
    "Oral Reading\n4-7 minutes",
    "Poetry Reading\n4-7 minutes",
    "Word Power Education\n10 minutes",
    "Speach to Inform\n5-8 minutes",
    "Speech Containing Gestures\n5-8 minutes",
    "Introduction of a Speaker",
    "Thanking a Speaker",
    "Trainee Evaluator",
    "Self=Evaluation",
  ];
  let { user_id, website_login, password } = req.body;
  console.log(user_id)
  for (const i = 0; i < projectnames.length; i++) {
    if (i == 2 || i == 11) {
      for (const j = 0; j < 3; j++) {
        const query =
          "INSERT INTO development_program (user_id, project_number, project_title, program_level) VALUES (?, ?, ?, ?)";
        db.query(query, [senderId, i, projectnames[i], 1], (err, result) => {
          if (err) {
            console.error("Database error:", err);
            return res.status(500).json({ message: "Database Error" });
          }
          console.log(result)
          res.json(result);
        });
      }
    } else {
      const query =
        "INSERT INTO development_program (user_id, project_number, project_title, program_level) VALUES (?, ?, ?, ?)";
      db.query(query, [user_id, i, projectnames[i], 1], (err, result) => {
        if (err) {
          console.error("Database error:", err);
          return res.status(500).json({ message: "Database Error" });
        }
        res.json(result);
      });
    }
  }
});
router.post("/member/projects/2", async (req, res) => {
  const projectnames = [
    "Issues of the day Leader",
    "Program Leader",
    "Speech to Persuade\n5-8 minutes",
    "Speech to inspire\n5-8 minutes",
    "Speech to Entertain\n5-8 minutes",
    "Research Speech\n5-8 minutes",
    "Current Event Speech\n5-8 minutes",
    "Speech Using Visual Aids\n5-8 minutes",
    "Impromptu Speech\n4-7 minutes",
    "Word Power Education\n20 minutes",
    "Assignment Evaluator",
    "General Evaluator\n8-10 minutes",
    "Committee Member",
  ];
  const { senderId } = req.body;
  for (const i = 0; i < projectnames.length; i++) {
    if (i == 10) {
      for (const j = 0; j < 3; j++) {
        const query =
          "INSERT INTO `development_program` (user_id, project_number, project_title, program_level) VALUES (?, ?, ?, ?)";
        db.query(query, [senderId, i, projectnames[i], 2], (err, result) => {
          if (err) {
            console.error("Database error:", err);
            return res.status(500).json({ message: "Database Error" });
          }
          res.json(result);
        });
      }
    } else if (i == 1 || i == 12) {
      for (const j = 0; j < 2; j++) {
        const query =
          "INSERT INTO `development_program` (user_id, project_number, project_title, program_level) VALUES (?, ?, ?, ?)";
        db.query(query, [senderId, i, projectnames[i], 2], (err, result) => {
          if (err) {
            console.error("Database error:", err);
            return res.status(500).json({ message: "Database Error" });
          }
          res.json(result);
        });
      }
    } else {
      const query =
        "INSERT INTO `development_program` (user_id, project_number, project_title, program_level) VALUES (?, ?, ?, ?)";
      db.query(query, [senderId, i, projectnames[i], 2], (err, result) => {
        if (err) {
          console.error("Database error:", err);
          return res.status(500).json({ message: "Database Error" });
        }
        res.json(result);
      });
    }
  }
});
router.post("/member/projects/3", async (req, res) => {
  const projectnames = [
    "Prepare a Written Report and Present Using a Microphone",
    "Present an Education Session\n20-30 minutes",
    "Program a Meeting at any Level",
    "Moderator or Discussion Leader",
    "General Evaluator",
    "Committee Chairman",
    "Club Elected Officer",
    "POWERtalk Australia Conference Delegate",
    "Speech Contest Judge",
    "Plus any six of the following eight speeches:",
    "Speech Using a Whiteboard\n8-10 minutes",
    "Biographical Speech\n8-10 minutes",
    "Review Assignment 6-9 minutes",
    "Be in Earnest Speech 5-8 minutes",
    "TV Talk 6-8 minutes",
    "Speech to Inspire, Using Technology 5-8 minutes",
    "Travelogue 7-10 minutes",
    "	Impromptu Speech 7-8 minutes",
  ];
  const { senderId } = req.body;
  for (const i = 0; i < projectnames.length; i++) {
    if (i == 1 || i == 2 || i == 4 || i == 5 || i == 6) {
      for (const j = 0; j < 2; j++) {
        const query =
          "INSERT INTO `development_program` (user_id, project_number, project_title, program_level) VALUES (?, ?, ?, ?)";
        db.query(query, [senderId, i, projectnames[i], 3], (err, result) => {
          if (err) {
            console.error("Database error:", err);
            return res.status(500).json({ message: "Database Error" });
          }
          res.json(result);
        });
      }
    } else {
      const query =
        "INSERT INTO `development_program` (user_id, project_number, project_title, program_level) VALUES (?, ?, ?, ?)";
      db.query(query, [senderId, i, projectnames[i], 3], (err, result) => {
        if (err) {
          console.error("Database error:", err);
          return res.status(500).json({ message: "Database Error" });
        }
        res.json(result);
      });
    }
  }
});
router.post("/member/projects/3a", async (req, res) => {
  const projectnames = [
    "Art Exhibition Review (Time 6-9 minutes)",
    "	Concert Review (Time 6-9 minutes)",
    "Film Review (Time 6-9 minutes)",
    "Play/Theatre Review (Time 6-9 minutes)",
    "Book Review (Time 6-9 minutes)",
    "Book Report (Time 3-5 minutes)",
    "Impact Speech (Time 5-8 minutes)",
    "	Special Occasion Speech (Time as programmed)",
    "Occupational or personal interest speech (5-7 minutes)",
    "Speech contest speech (Time 5-8 minutes)",
    "Extemporaneous Speech (Time 5-7 minutes)",
    "Moderator of a Dialogue Evaluation (Time 20-30 minutes)",
    "Assignment using a microphone (Time as programmed)",
    "Assignment using a microphone (Time as programmed)",
  ];
  const { senderId } = req.body;
  for (const i = 0; i < projectnames.length; i++) {
    const query =
      "INSERT INTO `development_program` (user_id, project_number, project_title, program_level) VALUES (?, ?, ?, ?)";
    db.query(query, [senderId, i, projectnames[i], 3.1], (err, result) => {
      if (err) {
        console.error("Database error:", err);
        return res.status(500).json({ message: "Database Error" });
      }
      res.json(result);
    });
  }
});
router.post("/member/projects/4", async (req, res) => {
  const projectnames = [
    "Prepare and present an education session at any level",
    "Prepare and present an education session at any level",
    "Present at any level an education session developed by someone else",
    "Interpretive Reading",
    "Delivering a Presentation with PowerPoint",
    "Research Speech\n5-8 minutes",
    "Current Event Speech\n5-8 minutes",
    "Speech Using Visual Aids\n5-8 minutes",
    "Impromptu Speech\n4-7 minutes",
    "Word Power Education\n20 minutes",
    "Assignment Evaluator",
    "General Evaluator\n8-10 minutes",
    "Committee Member",
  ];
  const { senderId } = req.body;
  for (const i = 0; i < projectnames.length; i++) {
    if (i == 10) {
      for (const j = 0; j < 3; j++) {
        const query =
          "INSERT INTO `development_program` (user_id, project_number, project_title, program_level) VALUES (?, ?, ?, ?)";
        db.query(query, [senderId, i, projectnames[i], 4], (err, result) => {
          if (err) {
            console.error("Database error:", err);
            return res.status(500).json({ message: "Database Error" });
          }
          res.json(result);
        });
      }
    } else if (i == 1 || i == 12) {
      for (const j = 0; j < 2; j++) {
        const query =
          "INSERT INTO `development_program` (user_id, project_number, project_title, program_level) VALUES (?, ?, ?, ?)";
        db.query(query, [senderId, i, projectnames[i], 4], (err, result) => {
          if (err) {
            console.error("Database error:", err);
            return res.status(500).json({ message: "Database Error" });
          }
          res.json(result);
        });
      }
    } else {
      const query =
        "INSERT INTO `development_program` (user_id, project_number, project_title, program_level) VALUES (?, ?, ?, ?)";
      db.query(query, [senderId, i, projectnames[i], 4], (err, result) => {
        if (err) {
          console.error("Database error:", err);
          return res.status(500).json({ message: "Database Error" });
        }
        res.json(result);
      });
    }
  }
});
router.post("/request-project", async (req, res) => {
  const { club_id, project_no } = req.body;
  const query =
    "INSERT INTO `program_requests` (project_id, club_id) VALUES (?, ?)";
  db.query(query, [project_no, club_id], (err, result) => {
    //need to change this to meeting
    console.log(club_id);
    console.log(project_no);
    if (err) {
      console.error("Database error:", err);
      return res.status(500).json({ message: "Database Error" });
    }
    return res.status(200).json({ message: "New Request Successful" });
  });
});

module.exports = router;
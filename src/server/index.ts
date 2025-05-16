// Express server setup for Streamline backend API

import express from "express";
import cors from "cors";

const app = express();
app.use(cors());
app.use(express.json());

// --- API endpoint for extension/backend sync (jobs/appliedJobs) ---
// POST /api/sync
app.post("/api/sync", (req, res) => {
  // TODO: Validate and authenticate the request (API key/token or session)
  // Expected body: { userId, appliedJobs, savedJobs, lastSync }
  const { userId, appliedJobs, savedJobs, lastSync } = req.body;

  // TODO: Save data to DB, update user dashboard, merge with backend state
  // For now, log and return success
  console.log(`[SYNC] Received sync from extension/user ${userId}:`);
  console.log("Applied jobs:", appliedJobs);
  console.log("Saved jobs:", savedJobs);

  res.json({ success: true, message: "Sync successful", serverTime: new Date().toISOString() });
});

// TODO: Add authentication, error handling, and more endpoints as needed

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Streamline backend API running on port ${PORT}`);
});
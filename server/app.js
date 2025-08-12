import express from "express";
import * as leaderboard from "./leaderboard.js";


const app = express();

// app.use((req, res, next) => {
//   if (["POST", "PUT", "PATCH"].includes(req.method)) {
//     express.json({ limit: "10mb" })(req, res, next);
//   } else {
//     next();
//   }
// });

app.use(express.json());
app.use("/api/leaderboard", leaderboard.router);

export default app;
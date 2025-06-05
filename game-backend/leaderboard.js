import express from "express";
import getClient from "./redis.js";


/**
 * A status object
 * @typedef {Object} Status
 * @property {number} status
 * @property {string} message
 *
 *
 * A leaderboard entry object
 * @typedef {Object} LeaderboardEntry
 * @property {string} value
 * @property {number} score
 *
 * 
 * Leaderboard entries object
 * @typedef {Object} LeaderboardEntries
 * @property {LeaderboardEntry[]} entries
 * 
 * 
 * Leaderboard object
 * @typedef {Object} Leaderboard
 * @property {LeaderboardEntries} leaderboard 
 */


/**
 * Add leaderboard entry
 * 
 * @param {string} key 
 * @param {number} score 
 * @param {string} member 
 * @returns {Promise<Status>}
 */

export async function addLeaderboardEntry(key, score, member) {
  const redis = await getClient();
  const date = new Date();

  //ZADD key score member, where member is a string that includes the member name and the date
  const result = await redis.zAdd(key,[{ value: member.toUpperCase() + "-" + date.toISOString(), score: score }]);

  if (result > 0) {
    return { status: 200, message: "ZADD success, added new leaderboard entry."};
  } else {
    return { status: 400, message: "ZADD failed..." };
  }  
}


/**
 * Get top scores
 * 
 * @param {string} key 
 * @param {number} count 
 * @returns {Promise<Leaderboard | Status>}
 */
export async function getLeaderboard(key, count) {
  const redis = await getClient();

  //ZRANGE key start stop [WITHSCORES] [REV]
  const result = await redis.zRangeWithScores(key, 0, count-1, { REV: 'true' });

  if (result.length === 0) {
    return { status: 404, message: "No leaderboard entries found." };
  }

  const leaderboard = {
    "leaderboard": result
  };

  return leaderboard;
}




export const router = express.Router();

/**
 * @typedef {import("express").Request} Request
 * @typedef {import("express").Response} Response
 * @typedef {import("express").NextFunction} NextFunction
 */

/**
 * @param {(req: Request, res: Response, next: NextFunction) => Promise<any>} fn
 * @returns
 */
function handler(fn) {
  /**
   * @param {Request} req
   * @param {Response} res
   * @param {NextFunction} next
   */
  return async (req, res, next) => {
    try {
      let nextCalled = false;
      const result = await fn(req, res, (...args) => {
        nextCalled = true;
        next(...args);
      });

      if (nextCalled) {
        return;
      } else if (result && isFinite(result.status)) {
        res.status(result.status).json(result);
      } else {
        res.json(result);
      }
    } catch (e) {
      console.log(e);
      res.status(500).json(e);
    }
  };
}


router.post(
  "/",
  handler(async (req) => {
    const { key, score, member } = req.body;

    return addLeaderboardEntry(key, score, member);
  }),
);

router.get(
  "/:key",
  handler(async (req) => {
    const { key } = req.params;
    const { count } = req.query;

    return getLeaderboard(key, count);
  }),
);

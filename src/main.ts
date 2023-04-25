import { createAgent } from "./agent";
import { getFeedback } from "./cli/feedback";
require("dotenv").config();

const name = process.env.AGENT_NAME || `Web game creator`;
const goal =
  process.env.AGENT_GOAL || `Build a website version of the "flappy bird" game`;
const temperature = Number(process.env.AGENT_TEMPERATURE) || 0;

// Run as CLI by default
createAgent({
  name,
  goal,
  temperature,
  getFeedback,
});

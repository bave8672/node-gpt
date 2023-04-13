import { createAgent } from "./agent";
const prompt = require("prompt-sync")({ sigint: true });
require("dotenv").config();

const goal = `
Your goal is to write a an LLM powered application that accepts a complex task from the user, and runs recursively and automatically in order to fulfil it.

The app should be able to run on a user's computer and utilise the tools on that computer, including the internet and programming APIs if necessary.

The app should be able to think long-term and adjust it's strategy based on information gained while poerforming actions.

You should build this as a node.js application in the "workspace directory". You should use the OpenAI API to access thair LLMs, and can also use any other node.js tools or libraries available on the internet.`;

async function main() {
  createAgent({
    name: "JS Auto-GPT Author",
    goal,
    temperature: 0.1,
    getFeedback: () =>
      prompt("Write feedback here, or leave blank to continue: "),
  });
}

main();

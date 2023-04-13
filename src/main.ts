import { createAgent } from "./agent";
const prompt = require("prompt-sync")({ sigint: true });
require("dotenv").config();

async function main() {
  createAgent({
    name: "JS Author",
    goal: "Write a leftpad javascript library and publish it to npm",
    temperature: 0.1,
    getFeedback: () => prompt("Write feedback here"),
  });
}

main();

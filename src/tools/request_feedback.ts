import { DynamicTool } from "langchain/tools";
import { Feedback } from "../agent";

export class GetHumanFeedback extends DynamicTool {
  constructor(getFeedback: () => Promise<Feedback>) {
    super({
      name: "Get human feedback",
      description:
        "Ask a question from a human operator, who may be able to provide things like API keys, perform physical tasks or clarify aspects of your goal",
      func: async (question) => {
        const feedback = await getFeedback();
        return feedback.text;
      },
    });
  }
}

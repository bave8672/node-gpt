import { OpenAIEmbeddings } from "langchain/embeddings/openai";
import {
  TextSplitter,
  RecursiveCharacterTextSplitter,
} from "langchain/text_splitter";
import { BaseMemory } from "./memory";
import { HNSWLib } from "langchain/vectorstores/hnswlib";
import { BaseRetriever } from "langchain/schema";

/**
 * In-memory index
 * Todo: save + read from file for long lived indices
 */
export class HNSWLibMemory implements BaseMemory {
  private readonly splitter: TextSplitter =
    new RecursiveCharacterTextSplitter();
  private readonly embedding = new OpenAIEmbeddings();
  private readonly store = HNSWLib.fromTexts([], [], this.embedding);

  constructor(
    private readonly opts: {
      name: string;
      k: number;
    }
  ) {}

  async add(text: string): Promise<void> {
    const documents = this.splitter.createDocuments([text]);
    (await this.store).addDocuments(await documents);
  }

  async getRelevant(query: string): Promise<string> {
    const documents = await (
      await this.store
    ).similaritySearch(query, this.opts.k);
    return documents.map((document) => document.pageContent).join();
  }

  async asRetriever(): Promise<BaseRetriever> {
    return (await this.store).asRetriever(this.opts.k);
  }

  async clear(): Promise<void> {
    // noop
  }
}

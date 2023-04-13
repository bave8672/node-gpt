import { PineconeClient } from "@pinecone-database/pinecone";
import { OpenAIEmbeddings } from "langchain/embeddings/openai";
import { PineconeStore } from "langchain/vectorstores/pinecone";
import { BaseMemory } from "./memory";
import {
  RecursiveCharacterTextSplitter,
  TextSplitter,
} from "langchain/text_splitter";

export class PineconeMemory implements BaseMemory {
  private readonly client = new PineconeClient();
  private readonly store: Promise<PineconeStore>;
  private readonly splitter: TextSplitter =
    new RecursiveCharacterTextSplitter();
  private readonly embedding = new OpenAIEmbeddings();

  constructor(
    private readonly opts: {
      apiKey: string;
      environment: string;
      name: string;
      k: number;
    }
  ) {
    this.client.init({
      apiKey: opts.apiKey,
      environment: opts.environment,
    });
    this.store = this.embedding
      .embedQuery("hello world")
      .then((vector) =>
        this.client.createIndex({
          createRequest: {
            name: opts.name,
            dimension: vector.length,
          },
        })
      )
      .then((index) => this.client.Index(index))
      .then((pineconeIndex) =>
        PineconeStore.fromExistingIndex(new OpenAIEmbeddings(), {
          pineconeIndex,
        })
      );
  }

  async add(text: string): Promise<void> {
    const documents = this.splitter.createDocuments([text]);
    (await this.store).addDocuments(await documents);
  }

  async getRelevant(query: string): Promise<string> {
    return (await this.store)
      .similaritySearch(query, this.opts.k)
      .then((documents) => documents.join());
  }

  async asRetriever() {
    return (await this.store).asRetriever(this.opts.k);
  }

  async clear(): Promise<void> {
    this.client.deleteIndex({ indexName: this.opts.name });
  }
}

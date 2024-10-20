import fs from "node:fs/promises";

import data from "./data.json";
import path from "node:path";

interface ImportedData {
  Activity: string;
  AuthorName: string;
  AuthorURL: string;
  AuxIndexS: any[];
  CanonicalURL: string;
  EndpointS: any[];
  GizmoCodeS: string[];
  ID: string;
  ModelS: string[];
  OwnPrompt: boolean;
  Prompt: string;
  PromptFeatureBitset: number;
  PromptHint: string;
  PromptTypeNo: number;
  RevisionTime: string;
  SystemS: number[];
  Teaser: string;
  Title: string;
  Topic: string;
  Usages: number;
  Views: number;
  Votes: number;
  ForkedFromPromptID?: string;
}

export type Data = {
  models: string[];
  title: string;
  prompt: string;
  prompt_hint: string;
  prompt_preview: string;
  topic: string;
  activity: string;
};

async function main() {
  const filteredData: Data[] = [];

  for (const x of (data as ImportedData[]).slice(0, 5_000)) {
    try {
      const promptDetailsRes = await fetch(
        `https://api.aiprm.com/api9/Prompts/${x.ID}?OperatorERID=user-sNHeXHKRJvjvhQUhUQOgLugA&SystemNo=1`,
      );
      const promptDetails = (await promptDetailsRes.json()) as {
        Activity: string;
        AuthorName: string;
        AuthorURL: string;
        AuxIndexS: any[];
        CanonicalURL: string;
        EndpointS: any[];
        GizmoCodeS: any[];
        ID: string;
        ModelS: string[];
        OwnPrompt: boolean;
        Prompt: string;
        PromptFeatureBitset: number;
        PromptHint: string;
        PromptTypeNo: number;
        RevisionTime: string;
        SystemS: number[];
        Teaser: string;
        Title: string;
        Topic: string;
        Usages: number;
        Views: number;
        Votes: number;
      };

      if (!promptDetails.Title) {
        console.log(`🟡 No title found in ${x.ID}`);
        return;
      }
      if (!promptDetails.Prompt) {
        console.log(`🟡 No prompt found in ${x.ID}`);
        return;
      }
      if (!promptDetails.Topic) {
        console.log(`🟡 No topic found in ${x.ID}`);
        return;
      }
      if (!promptDetails.Activity) {
        console.log(`🟡 No activity found in ${x.ID}`);
        return;
      }

      const n = {
        models: promptDetails.ModelS,
        title: promptDetails.Title,
        prompt: promptDetails.Prompt,
        prompt_hint: promptDetails.PromptHint,
        prompt_preview: promptDetails.Teaser,
        topic: promptDetails.Topic,
        activity: promptDetails.Activity,
      };
      const oldData = await fs.readFile(
        path.join(__dirname, "dx.json"),
        "utf8",
      );
      const jsonData = JSON.parse(oldData) as Data[];
      jsonData.push(n);
      await fs.writeFile(
        path.join(__dirname, "dx.json"),
        JSON.stringify(jsonData, null, 2),
        "utf8",
      );
      console.log(`🟢 Inserted ${x.ID}`);
    } catch (error) {
      console.error(`🔴 Error fetching prompt details for ID ${x.ID}:`, error);
    }
  }
}

main();

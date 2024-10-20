import fs from "node:fs/promises";
import path from "node:path";
import { Data } from "./loader";

async function main() {
  const jsonDataString = await fs.readFile(
    path.join(__dirname, "dx.json"),
    "utf8",
  );
  await fs.writeFile(
    path.join(__dirname, "backups", `prompts-${Date.now().toString()}.json`),
    jsonDataString,
    "utf8",
  );

  const prompts = JSON.parse(jsonDataString) as Data[];

  const modifiedPrompts: Data[] = [];
  for (const prompt of prompts) {
    // * Iteration 1
    // const newPrompt = prompt.prompt.split('"\n---\n')[1];
    // modifiedPrompts.push({ ...prompt, prompt: newPrompt });

    // * Iteration 2
    // const newPrompt = prompt.prompt.replace(
    //   "Please ignore all previous instructions. ",
    //   ""
    // );
    // modifiedPrompts.push({ ...prompt, prompt: newPrompt });

    // * Iteration 3
    // const newPrompt = prompt.prompt.replaceAll("[TARGETLANGUAGE]", "English");
    // modifiedPrompts.push({ ...prompt, prompt: newPrompt });
    // * Iteration 4
    const newPrompt = prompt.prompt
      .split(" this is important to Bold the Title")[0]
      .split(" Make headings bold and appropriate")[0];
    modifiedPrompts.push({ ...prompt, prompt: newPrompt });
  }

  await fs.writeFile(
    path.join(__dirname, "dx.json"),
    JSON.stringify(modifiedPrompts, null, 2),
    "utf8",
  );
}

main();

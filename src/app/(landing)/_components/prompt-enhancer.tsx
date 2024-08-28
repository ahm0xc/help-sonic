"use client";

import { type Dispatch, type SetStateAction, useRef, useState } from "react";
import { CopyIcon, RotateCcwIcon, SparklesIcon } from "lucide-react";
import { toast } from "sonner";
import { readStreamableValue } from "ai/rsc";
import { SignedIn, SignedOut, SignInButton } from "@clerk/nextjs";

import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Textarea } from "~/components/ui/textarea";
import { cn, getRandomItem } from "~/lib/utils";
import { generate } from "../_actions";
import { BAB_PROMPTS, RTF_PROMPTS, TAG_PROMPTS } from "~/config/prompts";
import {
  formatBABPrompt,
  formatRTFPrompt,
  formatTAGPrompt,
} from "~/helpers/prompt";

export default function PromptEnhancer() {
  const [selectedPromptEnhancer, setSelectedPromptEnhancer] = useState<
    "RTF" | "TAG" | "BAF"
  >("RTF");
  const [output, setOutput] = useState<string>("");
  const [isOutputLoading, setIsOutputLoading] = useState<boolean>(false);

  return (
    <div className="container" id="prompt-enhancer">
      <div className="border rounded-3xl p-10 grid grid-cols-2 gap-10">
        <section>
          <h4 className="text-2xl font-bold">Choose prompt Enhancer</h4>
          <div className="flex flex-row gap-4 mt-6">
            <button
              className={cn(
                "bg-secondary text-base px-3 py-1 font-medium rounded-full",
                selectedPromptEnhancer === "RTF" && "bg-blue-500 text-white",
              )}
              onClick={() => setSelectedPromptEnhancer("RTF")}
            >
              RTF
            </button>
            <button
              className={cn(
                "bg-secondary text-base px-3 py-1 font-medium rounded-full",
                selectedPromptEnhancer === "TAG" && "bg-blue-500 text-white",
              )}
              onClick={() => setSelectedPromptEnhancer("TAG")}
            >
              TAG
            </button>
            <button
              className={cn(
                "bg-secondary text-base px-3 py-1 font-medium rounded-full",
                selectedPromptEnhancer === "BAF" && "bg-blue-500 text-white",
              )}
              onClick={() => setSelectedPromptEnhancer("BAF")}
            >
              BAF
            </button>
          </div>
          <div className="mt-8">
            {selectedPromptEnhancer === "RTF" && (
              <RTFForm
                setOutput={setOutput}
                isOutputLoading={isOutputLoading}
                output={output}
                setIsOutputLoading={setIsOutputLoading}
              />
            )}
            {selectedPromptEnhancer === "TAG" && (
              <TAGForm
                setOutput={setOutput}
                isOutputLoading={isOutputLoading}
                output={output}
                setIsOutputLoading={setIsOutputLoading}
              />
            )}
            {selectedPromptEnhancer === "BAF" && (
              <BABForm
                setOutput={setOutput}
                isOutputLoading={isOutputLoading}
                output={output}
                setIsOutputLoading={setIsOutputLoading}
              />
            )}
          </div>
        </section>
        <section className="rounded-2xl border p-6">
          {isOutputLoading && !output && <OutputLoadingSkeleton />}
          {output && <OutputDisplay output={output} />}
          {!output && !isOutputLoading && <OutputEmptyPlaceholder />}
        </section>
      </div>
    </div>
  );
}

function OutputLoadingSkeleton() {
  return (
    <div className="flex flex-col gap-4">
      <div className="h-4 w-full bg-gray-300 animate-pulse rounded-lg"></div>
      <div className="h-4 w-full bg-gray-300 animate-pulse rounded-lg"></div>
      <div className="h-4 w-full bg-gray-300 animate-pulse rounded-lg"></div>
      <div className="h-4 w-full bg-gray-300 animate-pulse rounded-lg"></div>
      <div className="h-4 bg-gray-300 animate-pulse w-1/2 rounded-lg"></div>
    </div>
  );
}

function OutputDisplay({ output }: { output: string }) {
  function handleCopy() {
    navigator.clipboard.writeText(output);
    toast.success("Copied to clipboard");
  }
  return (
    <div>
      <div>
        <p className="text-lg whitespace-pre-wrap">{output}</p>
      </div>
      <div className="mt-4 flex items-center gap-2">
        <Button size="sm" variant="outline" onClick={handleCopy}>
          <CopyIcon className="h-3 w-3 mr-2" /> Copy
        </Button>
      </div>
    </div>
  );
}

function OutputEmptyPlaceholder() {
  return (
    <div>
      <p className="text-sm text-gray-500 italic">
        No output yet. Enhance your prompt to generate a new one.
      </p>
    </div>
  );
}

function RTFForm({
  output,
  setOutput,
  setIsOutputLoading,
  isOutputLoading,
}: {
  output: string;
  setOutput: Dispatch<SetStateAction<string>>;
  setIsOutputLoading: Dispatch<SetStateAction<boolean>>;
  isOutputLoading: boolean;
}) {
  const formRef = useRef<HTMLFormElement>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    try {
      const formData = new FormData(e.target as HTMLFormElement);
      const { role, task, format } = Object.fromEntries(formData.entries()) as {
        role: string;
        task: string;
        format: string;
      };

      if (!role || !task || !format) {
        toast.error("Please fill in all fields");
        return;
      }

      setOutput("");
      setIsOutputLoading(true);

      const randomRTFPrompt = getRandomItem(RTF_PROMPTS);
      const chosenPrompt = formatRTFPrompt(randomRTFPrompt.prompt, {
        role,
        task,
        format,
      });

      const { output } =
        await generate(`Enhance the prompt given bellow and just return the prompt:
-----------
${chosenPrompt}
        `);

      for await (const delta of readStreamableValue(output)) {
        isOutputLoading && setIsOutputLoading(false);
        setOutput((currentGeneration) => `${currentGeneration}${delta}`);
      }
    } catch (error) {
      console.error(error);
      toast.error("Error enhancing prompt");
    } finally {
      setIsOutputLoading(false);
    }
  }

  function clear() {
    formRef.current?.reset();
  }
  return (
    <div>
      <form onSubmit={handleSubmit} ref={formRef}>
        <div className="space-y-5">
          <div className="flex flex-col gap-2">
            <Label htmlFor="role">Role</Label>
            <Input
              type="text"
              id="role"
              name="role"
              placeholder="Facebook ad manager"
              autoComplete="off"
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="task">Task</Label>
            <Textarea
              id="task"
              name="task"
              placeholder="Design a compelling Facebook ad campaign to promote a new line of fitness apparel for a sports brand."
              rows={6}
              autoComplete="off"
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="format">Format</Label>
            <Textarea
              id="format"
              name="format"
              placeholder="Create a storyboard outlining the sequence of ad creatives, including ad copy, visuals and targeting strategies."
              rows={4}
              autoComplete="off"
            />
          </div>
          <SignedIn>
            <div className="flex items-center gap-3">
              <Button
                size="lg"
                className="bg-gradient-to-r from-purple-500 to-blue-500"
                type="submit"
              >
                <SparklesIcon className="h-4 w-4 mr-2" /> Enhance Prompt
              </Button>

              <Button size="lg" variant="outline" onClick={clear} type="button">
                <RotateCcwIcon className="h-4 w-4 mr-2" /> Clear
              </Button>
            </div>
          </SignedIn>
          <SignedOut>
            <SignInButton>
              <Button
                size="lg"
                className="bg-gradient-to-r from-purple-500 to-blue-500"
                type="button"
              >
                <SparklesIcon className="h-4 w-4 mr-2" /> Sign in to Enhance
                Prompt
              </Button>
            </SignInButton>
          </SignedOut>
        </div>
      </form>
    </div>
  );
}
function TAGForm({
  output,
  setOutput,
  setIsOutputLoading,
  isOutputLoading,
}: {
  output: string;
  setOutput: Dispatch<SetStateAction<string>>;
  setIsOutputLoading: Dispatch<SetStateAction<boolean>>;
  isOutputLoading: boolean;
}) {
  const formRef = useRef<HTMLFormElement>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    try {
      const formData = new FormData(e.target as HTMLFormElement);
      const { task, action, goal } = Object.fromEntries(formData.entries()) as {
        task: string;
        action: string;
        goal: string;
      };

      if (!task || !action || !goal) {
        toast.error("Please fill in all fields");
        return;
      }

      setOutput("");
      setIsOutputLoading(true);

      const randomTAGPrompt = getRandomItem(TAG_PROMPTS);
      const chosenPrompt = formatTAGPrompt(randomTAGPrompt.prompt, {
        task,
        action,
        goal,
      });

      const { output } =
        await generate(`Enhance the prompt given bellow and just return the prompt:
-----------
${chosenPrompt}
        `);

      for await (const delta of readStreamableValue(output)) {
        isOutputLoading && setIsOutputLoading(false);
        setOutput((currentGeneration) => `${currentGeneration}${delta}`);
      }
    } catch (error) {
      console.error(error);
      toast.error("Error enhancing prompt");
    } finally {
      setIsOutputLoading(false);
    }
  }

  function clear() {
    formRef.current?.reset();
  }
  return (
    <div>
      <form onSubmit={handleSubmit} ref={formRef}>
        <div className="space-y-5">
          <div className="flex flex-col gap-2">
            <Label htmlFor="task">Task</Label>
            <Input
              id="task"
              name="task"
              placeholder="Evaluate the performance of team members"
              autoComplete="off"
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="action">Action</Label>
            <Textarea
              id="action"
              name="action"
              placeholder="Direct manager and assess the strengths and weaknesses of team members."
              rows={6}
              autoComplete="off"
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="goal">Goal</Label>
            <Textarea
              id="goal"
              name="goal"
              placeholder="Goal is to improve team performance so that the average user satisfaction score moves from 6 to 7.5 in the next quarter."
              rows={4}
              autoComplete="off"
            />
          </div>
          <SignedIn>
            <div className="flex items-center gap-3">
              <Button
                size="lg"
                className="bg-gradient-to-r from-purple-500 to-blue-500"
                type="submit"
              >
                <SparklesIcon className="h-4 w-4 mr-2" /> Enhance Prompt
              </Button>

              <Button size="lg" variant="outline" onClick={clear} type="button">
                <RotateCcwIcon className="h-4 w-4 mr-2" /> Clear
              </Button>
            </div>
          </SignedIn>
          <SignedOut>
            <SignInButton>
              <Button
                size="lg"
                className="bg-gradient-to-r from-purple-500 to-blue-500"
                type="button"
              >
                <SparklesIcon className="h-4 w-4 mr-2" /> Sign in to Enhance
                Prompt
              </Button>
            </SignInButton>
          </SignedOut>
        </div>
      </form>
    </div>
  );
}
function BABForm({
  output,
  setOutput,
  setIsOutputLoading,
  isOutputLoading,
}: {
  output: string;
  setOutput: Dispatch<SetStateAction<string>>;
  setIsOutputLoading: Dispatch<SetStateAction<boolean>>;
  isOutputLoading: boolean;
}) {
  const formRef = useRef<HTMLFormElement>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    try {
      const formData = new FormData(e.target as HTMLFormElement);
      const { before, after, bridge } = Object.fromEntries(
        formData.entries(),
      ) as {
        before: string;
        after: string;
        bridge: string;
      };

      if (!before || !after || !bridge) {
        toast.error("Please fill in all fields");
        return;
      }

      setOutput("");
      setIsOutputLoading(true);

      const randomBABPrompt = getRandomItem(BAB_PROMPTS);
      const chosenPrompt = formatBABPrompt(randomBABPrompt.prompt, {
        before,
        after,
        bridge,
      });

      const { output } =
        await generate(`Enhance the prompt given bellow and just return the prompt:
-----------
${chosenPrompt}
        `);

      for await (const delta of readStreamableValue(output)) {
        isOutputLoading && setIsOutputLoading(false);
        setOutput((currentGeneration) => `${currentGeneration}${delta}`);
      }
    } catch (error) {
      console.error(error);
      toast.error("Error enhancing prompt");
    } finally {
      setIsOutputLoading(false);
    }
  }

  function clear() {
    formRef.current?.reset();
  }
  return (
    <div>
      <form onSubmit={handleSubmit} ref={formRef}>
        <div className="space-y-5">
          <div className="flex flex-col gap-2">
            <Label htmlFor="before">Before</Label>
            <Textarea
              id="before"
              name="before"
              placeholder="We're nowhere to be seen on SEO rankings"
              rows={6}
              autoComplete="off"
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="after">After</Label>
            <Textarea
              id="after"
              name="after"
              placeholder="We want to be in top 10 SEO ranking in our niche in 90 days"
              rows={4}
              autoComplete="off"
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="bridge">Bridge</Label>
            <Textarea
              id="bridge"
              name="bridge"
              placeholder="Develop a detailed plan for mentioning all the measures we should take also include list of top 20 keywords."
              rows={4}
              autoComplete="off"
            />
          </div>
          <SignedIn>
            <div className="flex items-center gap-3">
              <Button
                size="lg"
                className="bg-gradient-to-r from-purple-500 to-blue-500"
                type="submit"
              >
                <SparklesIcon className="h-4 w-4 mr-2" /> Enhance Prompt
              </Button>

              <Button size="lg" variant="outline" onClick={clear} type="button">
                <RotateCcwIcon className="h-4 w-4 mr-2" /> Clear
              </Button>
            </div>
          </SignedIn>
          <SignedOut>
            <SignInButton>
              <Button
                size="lg"
                className="bg-gradient-to-r from-purple-500 to-blue-500"
                type="button"
              >
                <SparklesIcon className="h-4 w-4 mr-2" /> Sign in to Enhance
                Prompt
              </Button>
            </SignInButton>
          </SignedOut>
        </div>
      </form>
    </div>
  );
}

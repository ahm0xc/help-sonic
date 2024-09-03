"use client";

import { type Dispatch, type SetStateAction, useRef, useState } from "react";
import {
  ChevronRightIcon,
  CopyIcon,
  RotateCcwIcon,
  SparklesIcon,
} from "lucide-react";
import { toast } from "sonner";
import { readStreamableValue } from "ai/rsc";
import { SignedIn, SignedOut, SignInButton } from "@clerk/nextjs";

import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Textarea } from "~/components/ui/textarea";
import { cn, getRandomItem } from "~/lib/utils";
import { generate } from "../_actions";
import { BAB_PROMPTS, TAG_PROMPTS } from "~/config/prompts";
import { formatBABPrompt, formatTAGPrompt } from "~/helpers/prompt";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { Checkbox } from "~/components/ui/checkbox";
import { Switch } from "~/components/ui/switch";

const PREDEFINED_ROLES = [
  {
    name: "Writer",
    description: "",
  },
  {
    name: "Rewriter",
    description:
      "A rewriter rewrites or reformulates texts. He changes the original text so that it takes on a new form and wording without losing the meaning of the text. He avoids plagiarism, improves readability or adapts the text to an audience.",
  },
  {
    name: "SEO Blog writer",
    description:
      "An SEO blog writer writes SEO-optimised texts on a specific topic using SEO best practice. They ensure that the texts are well-structured, readable and fulfil their intended purpose as SEO blog articles.",
  },
  {
    name: "Coder",
    description:
      "A Coder is a professional who writes, tests, and maintains the code that allows software programs and applications to function. They translate logical solutions and designs into a programming language, ensuring that the software performs its intended tasks efficiently.",
  },
  {
    name: "Social Media Manager",
    description:
      "A Social Media Manager is a professional who manages and creates content for social media platforms such as Facebook, Instagram, Twitter, LinkedIn, and TikTok.",
  },
  {
    name: "Email Marketer",
    description:
      "An Email Marketer is a professional who creates and sends email campaigns to promote products or services. They use email marketing software to design, schedule, and send email messages to a targeted audience.",
  },
  {
    name: "Copywriter",
    description:
      "A Copywriter is a professional who writes copy for various mediums such as websites, brochures, advertisements, and more.",
  },
];

const PREDEFINED_VOICE_TONES = [
  "Conversational",
  "Professional",
  "Inspirational",
  "Persuasive",
  "Urgent",
  "Bold",
  "Empathetic",
  "Minimalistic",
];

const PREDEFINED_WORD_COUNTS = [
  "None",
  "< 100",
  "600-1000",
  "1300-1800",
  "2000-2600",
  "3000+",
];

const PREDEFINED_PERSPECTIVE = [
  "None",
  "First Person Singular (I, Me)",
  "First Person Plural (We, Us)",
  "Second Person (You, Yours)",
  "Third Person (He, She)",
];

const PREDEFINED_DOCUMENTS = ["Nothing", "Email", "Newsletter"];

export default function PromptEnhancer() {
  const [selectedPromptEnhancer, setSelectedPromptEnhancer] = useState<
    "RTF" | "TAG" | "BAF"
  >("RTF");
  const [output, setOutput] = useState<string>("");
  const [isOutputLoading, setIsOutputLoading] = useState<boolean>(false);

  return (
    <div className="container scroll-m-10" id="prompt-enhancer">
      <div className="border rounded-3xl p-10 grid grid-cols-2 gap-10 bg-background shadow-xl">
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
    <div className="relative">
      <div>
        <p className="text-lg whitespace-pre-wrap">{output}</p>
      </div>
      <div
        aria-label="output-footer"
        className="flex items-end justify-between"
      >
        <div className="mt-4 flex items-center gap-2">
          <Button size="sm" variant="outline" onClick={handleCopy}>
            <CopyIcon className="h-3 w-3 mr-2" /> Copy
          </Button>
        </div>
        <div>
          <p className="text-sm text-foreground/80">
            {output.length} characters
          </p>
        </div>
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
  const [isUsingCustomRole, setIsUsingCustomRole] = useState(false);
  const [role, setRole] = useState<(typeof PREDEFINED_ROLES)[number]>(
    PREDEFINED_ROLES[0],
  );
  const [tone, setTone] = useState<string>(PREDEFINED_VOICE_TONES[0]);
  const [documentType, setDocumentType] = useState<string>(
    PREDEFINED_DOCUMENTS[0],
  );
  const [wordCount, setWordCount] = useState<string>(PREDEFINED_WORD_COUNTS[0]);
  const [perspective, setPerspective] = useState<string>(
    PREDEFINED_PERSPECTIVE[0],
  );
  const [isHumanizeResponseEnabled, setIsHumanizeResponseEnabled] =
    useState(true);
  const [isFaqIncluded, setIsFaqIncluded] = useState(false);
  const [isConclusionIncluded, setIsConclusionIncluded] = useState(false);
  const [isSourceIncluded, setIsSourceIncluded] = useState(false);
  const [isSEOBestPracticesIncluded, setIsSEOBestPracticesIncluded] =
    useState(false);
  const [isAdvanceOptionsExpanded, setIsAdvanceOptionsExpanded] =
    useState(false);
  const formRef = useRef<HTMLFormElement>(null);
  const roleInputRef = useRef<HTMLInputElement>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    try {
      const formData = new FormData(e.target as HTMLFormElement);
      const { task, format } = Object.fromEntries(formData.entries()) as {
        task: string;
        format: string;
      };

      if (!role || !task || !format) {
        toast.error("Please fill in all fields");
        return;
      }

      setOutput("");
      setIsOutputLoading(true);

      window.document.getElementById("prompt-enhancer")?.scrollIntoView({
        behavior: "smooth",
      });

      const { output } =
        await generate(`Your are a ai model that Enhance prompts given by the users with the following parameters and instructions:

        PROMPT PARAMETERS:
        - ROLE NAME: ${role.name}
        - ROLE DESCRIPTION: ${role.description}
        - TASK: ${task}
        - FORMAT: ${format}
        - TONE: ${tone}
        - DOCUMENT TYPE: ${documentType}
        - WORD COUNT: ${wordCount}
        - PERSPECTIVE: ${perspective}
        - HUMANIZE RESPONSE: ${isHumanizeResponseEnabled}

        INSTRUCTIONS FOR PROMPT ENHANCER:
        - fix grammatical mistakes
        - only return the prompt
        - if any parameter is not specified, ignore the line
        - change the prompt so that it doesn't look always the same but keep the core meaning
        - use synonyms to make the prompt more readable

        <prompt>Act as {Role}, now your task will be {Task} and the content you generate should be in {format/document type}, writing tone will be {tone} and {humanizer/"make sure the copy you generate it should be 8th grade English catagoies and do aim for simpler adverbs, and adverbial phrases professional tone"} the {document} you will genrate word count should be around {wordcount} and the writting perspective {perspective}</prompt>`);

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
          <div className="grid grid-cols-2 gap-6">
            <div className="flex flex-col gap-2">
              {isUsingCustomRole ? (
                <>
                  {" "}
                  <Label htmlFor="role">Role</Label>
                  <Input
                    type="text"
                    id="role"
                    name="role"
                    placeholder="Facebook ad manager"
                    autoComplete="off"
                    value={role.name}
                    onChange={(e) =>
                      setRole({ name: e.target.value, description: "" })
                    }
                    ref={roleInputRef}
                    required
                  />
                </>
              ) : (
                <>
                  <Label htmlFor="role">Role</Label>
                  <Select
                    defaultValue={PREDEFINED_ROLES[0].name}
                    required
                    onValueChange={(v) =>
                      setRole(
                        PREDEFINED_ROLES.find((x) => x.name === v) ||
                          PREDEFINED_ROLES[0],
                      )
                    }
                  >
                    <SelectTrigger
                      name="role"
                      id="role"
                      className="w-full !min-w-full"
                    >
                      <SelectValue placeholder="Role" className="w-full" />
                    </SelectTrigger>
                    <SelectContent>
                      {PREDEFINED_ROLES.map((role) => (
                        <SelectItem
                          key={`predefined-role//${role}`}
                          value={role.name}
                        >
                          {role.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </>
              )}
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="custom-role-checkbox"
                  onCheckedChange={(checked) => {
                    if (checked) {
                      setIsUsingCustomRole(true);
                      setRole({ name: "", description: "" });
                      setTimeout(() => {
                        roleInputRef.current?.focus();
                      }, 100);
                    } else {
                      setRole(PREDEFINED_ROLES[0]);
                      setIsUsingCustomRole(false);
                    }
                  }}
                />
                <label
                  htmlFor="custom-role-checkbox"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Use custom role
                </label>
              </div>
              <div className="mt-2">
                <Label htmlFor="document">Document</Label>
                <Select
                  defaultValue={PREDEFINED_DOCUMENTS[0]}
                  onValueChange={setDocumentType}
                  required
                >
                  <SelectTrigger
                    name="document"
                    id="document"
                    className="w-full !min-w-full"
                  >
                    <SelectValue placeholder="Document" className="w-full" />
                  </SelectTrigger>
                  <SelectContent>
                    {PREDEFINED_DOCUMENTS.map((document) => (
                      <SelectItem
                        key={`predefined-document//${document}`}
                        value={document}
                      >
                        {document}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="">
              <Label htmlFor="tone">Tone of Voice</Label>
              <Select
                defaultValue={PREDEFINED_VOICE_TONES[0]}
                onValueChange={setTone}
                required
              >
                <SelectTrigger
                  name="tone"
                  id="tone"
                  className="w-full !min-w-full"
                >
                  <SelectValue placeholder="Tone" className="w-full" />
                </SelectTrigger>
                <SelectContent>
                  {PREDEFINED_VOICE_TONES.map((tone) => (
                    <SelectItem
                      key={`predefined-voice-tone//${tone}`}
                      value={tone}
                    >
                      {tone}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="task">Task</Label>
            <Textarea
              id="task"
              name="task"
              placeholder="Design a compelling Facebook ad campaign to promote a new line of fitness apparel for a sports brand."
              rows={6}
              autoComplete="off"
              required
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
              required
            />
          </div>
          <div className="flex items-center space-x-2">
            <Switch
              className="data-[state=checked]:bg-gradient-to-r data-[state=checked]:from-purple-500 data-[state=checked]:to-blue-500"
              id="humanize-response"
              checked={isHumanizeResponseEnabled}
              onCheckedChange={setIsHumanizeResponseEnabled}
            />
            <Label htmlFor="humanize-response">Humanize response</Label>
          </div>

          <div className="my-4">
            <button
              type="button"
              className="text-sm text-blue-600 font-medium"
              onClick={() => setIsAdvanceOptionsExpanded((prev) => !prev)}
            >
              Advance options{" "}
              <ChevronRightIcon
                className={cn(
                  "w-4 h-4 inline-block",
                  isAdvanceOptionsExpanded && "rotate-90",
                )}
              />
            </button>
            {isAdvanceOptionsExpanded && (
              <>
                <div className="grid grid-cols-2 gap-6 mt-4">
                  <div
                    aria-label="word-count"
                    className={cn(
                      "",
                      role.name.toLowerCase() === "writer" && "hidden",
                      role.name.toLowerCase() === "coder" && "hidden",
                      role.name.toLowerCase() === "social media manager" &&
                        "hidden",
                    )}
                  >
                    <Label htmlFor="word-count">Word count</Label>
                    <Select
                      defaultValue={PREDEFINED_WORD_COUNTS[0]}
                      onValueChange={setWordCount}
                    >
                      <SelectTrigger
                        name="word-count"
                        id="word-count"
                        className="w-full !min-w-full"
                      >
                        <SelectValue
                          placeholder="Word count"
                          className="w-full"
                        />
                      </SelectTrigger>
                      <SelectContent>
                        {PREDEFINED_WORD_COUNTS.map((option) => (
                          <SelectItem
                            key={`predefined-word-count//${option}`}
                            value={option}
                          >
                            {option}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div
                    aria-label="perspective"
                    className={cn(
                      "",
                      role.name.toLowerCase() === "seo blog writer" && "hidden",
                      role.name.toLowerCase() === "coder" && "hidden",
                      role.name.toLowerCase() === "social media manager" &&
                        "hidden",
                    )}
                  >
                    <Label htmlFor="perspective">Perspective</Label>
                    <Select
                      defaultValue={PREDEFINED_PERSPECTIVE[0]}
                      onValueChange={setPerspective}
                    >
                      <SelectTrigger
                        name="perspective"
                        id="perspective"
                        className="w-full !min-w-full"
                      >
                        <SelectValue
                          placeholder="Perspective"
                          className="w-full"
                        />
                      </SelectTrigger>
                      <SelectContent>
                        {PREDEFINED_PERSPECTIVE.map((option) => (
                          <SelectItem
                            key={`predefined-perspective//${option}`}
                            value={option}
                          >
                            {option}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div
                    aria-label="keywords"
                    className={cn(
                      "flex flex-col gap-2",
                      role.name.toLowerCase() === "writer" && "hidden",
                      role.name.toLowerCase() === "rewriter" && "hidden",
                      role.name.toLowerCase() === "coder" && "hidden",
                    )}
                  >
                    <Label htmlFor="keywords">Keywords</Label>
                    <Input
                      type="keywords"
                      id="keywords"
                      name="keywords"
                      placeholder="Keywords"
                      autoComplete="off"
                    />
                  </div>
                </div>
                <div className="flex flex-col gap-3 mt-4">
                  <div />
                  <div
                    aria-label="faq"
                    className={cn(
                      "flex items-center space-x-2",
                      role.name.toLowerCase() === "writer" && "",
                      role.name.toLowerCase() === "coder" && "hidden",
                      role.name.toLowerCase() === "email marketer" && "hidden",
                    )}
                  >
                    <Checkbox
                      id="is-faq-included"
                      checked={isFaqIncluded}
                      onCheckedChange={(c) => setIsFaqIncluded(c as boolean)}
                      disabled={role.name === "SEO Blog writer"}
                    />
                    <label
                      htmlFor="is-faq-included"
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      Include FAQ
                    </label>
                  </div>
                  <div
                    aria-label="conclusion"
                    className={cn(
                      "flex items-center space-x-2",
                      role.name.toLowerCase() === "coder" && "hidden",
                    )}
                  >
                    <Checkbox
                      id="is-conclusion-included"
                      checked={isConclusionIncluded}
                      onCheckedChange={(c) =>
                        setIsConclusionIncluded(c as boolean)
                      }
                      disabled={role.name === "SEO Blog writer"}
                    />
                    <label
                      htmlFor="is-conclusion-included"
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      Include Conclusion
                    </label>
                  </div>
                  <div
                    aria-label="sources"
                    className={cn(
                      "flex items-center space-x-2",
                      role.name.toLowerCase() === "writer" && "",
                    )}
                  >
                    <Checkbox
                      id="is-sources-included"
                      checked={isSourceIncluded}
                      onCheckedChange={(c) => setIsSourceIncluded(c as boolean)}
                    />
                    <label
                      htmlFor="is-sources-included"
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      Include Sources under article
                    </label>
                  </div>
                  <div
                    aria-label="seo-best-practices"
                    className={cn(
                      "flex items-center space-x-2",
                      role.name.toLowerCase() === "writer" && "hidden",
                      role.name.toLowerCase() === "rewriter" && "hidden",
                      role.name.toLowerCase() === "coder" && "hidden",
                    )}
                  >
                    <Checkbox
                      id="is-seo-best-practices-included"
                      checked={isSEOBestPracticesIncluded}
                      onCheckedChange={(c) =>
                        setIsSEOBestPracticesIncluded(c as boolean)
                      }
                    />
                    <label
                      htmlFor="is-seo-best-practices-included"
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      Include SEO best practices
                    </label>
                  </div>
                </div>
              </>
            )}
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

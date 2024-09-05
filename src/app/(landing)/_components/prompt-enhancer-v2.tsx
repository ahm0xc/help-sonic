"use client";

import { useEffect, useState } from "react";
import { SignedIn, SignedOut, SignInButton } from "@clerk/nextjs";
import {
  ChevronRightIcon,
  CopyCheckIcon,
  CopyIcon,
  SparklesIcon,
} from "lucide-react";
import { readStreamableValue } from "ai/rsc";
import { toast } from "sonner";

import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { Checkbox } from "~/components/ui/checkbox";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { Switch } from "~/components/ui/switch";
import { Textarea } from "~/components/ui/textarea";
import { cn } from "~/lib/utils";
import { generate } from "../_actions";

export default function PromptEnhancerV2() {
  const [selectedPromptFramework, setSelectedPromptFramework] = useState("RTF");
  const [isHumanizeResponseEnabled, setIsHumanizeResponseEnabled] =
    useState(true);
  const [isAdvanceOptionsExpanded, setIsAdvanceOptionsExpanded] =
    useState(false);
  const [isOutputLoading, setIsOutputLoading] = useState(false);
  const [output, setOutput] = useState("");

  const [data, setData] = useState<{
    role: string | undefined;
    documentType: string | undefined;
    task: string | undefined;
    format: string | undefined;
    tone: string | undefined;
    wordCount: string | undefined;
    perspective: string | undefined;
    keywords: string | undefined;
    isFaqIncluded: boolean;
    isConclusionIncluded: boolean;
    isSourcesIncluded: boolean;
    isSeoBestPracticesIncluded: boolean;
  }>({
    role: undefined,
    documentType: undefined,
    task: undefined,
    format: undefined,
    tone: undefined,
    wordCount: undefined,
    perspective: undefined,
    keywords: undefined,
    isFaqIncluded: false,
    isConclusionIncluded: false,
    isSourcesIncluded: false,
    isSeoBestPracticesIncluded: false,
  });

  function resetAllStates() {
    setData({
      role: undefined,
      documentType: undefined,
      task: undefined,
      format: undefined,
      tone: undefined,
      wordCount: undefined,
      perspective: undefined,
      keywords: undefined,
      isFaqIncluded: false,
      isConclusionIncluded: false,
      isSourcesIncluded: false,
      isSeoBestPracticesIncluded: false,
    });
  }

  const FRAMEWORKS = [
    {
      name: "RTF",
      form: {
        elements: [
          {
            type: "select",
            label: "Role",
            name: "role",
            placeholder: "Select role",
            options: [
              "Writer",
              "Rewriter",
              "SEO Writer",
              "Coder",
              "Social Media Manager",
              "Email marketer",
              "Copywriter",
            ],
            defaultValue: "Writer",
            onChange: (value: string) => {
              setData((prev) => ({ ...prev, role: value }));
            },
          },
          {
            type: "select",
            label: "Document Type",
            name: "documentType",
            placeholder: "Select document type",
            options: ["None", "Blog", "CV", "Email", "Newsletter"],
            defaultValue: "None",
            onChange: (value: string) => {
              setData((prev) => ({ ...prev, documentType: value }));
            },
          },
          {
            type: "textarea",
            label: "Task",
            name: "task",
            placeholder:
              "Design a comprehensive marketing plan for a SaaS company",
            minRows: 4,
            onChange: (value: string) => {
              setData((prev) => ({ ...prev, task: value }));
            },
          },
          {
            type: "textarea",
            label: "Format",
            name: "format",
            placeholder:
              "Add bullet points, headings, and subheadings to the document",
            minRows: 3,
            onChange: (value: string) => {
              setData((prev) => ({ ...prev, format: value }));
            },
          },
        ],
      },
    },
  ];

  const ADVANCED_OPTIONS = [
    {
      availableInFramework: ["RTF"],
      type: "select",
      name: "Tone",
      placeholder: "Select tone",
      options: ["None", "Professional", "Casual", "Friendly", "Formal"],
      defaultValue: "None",
      onChange: (value: string) => {
        setData((prev) => ({ ...prev, tone: value }));
      },
      isVisible: (data: Record<string, any>) => {
        return true;
      },
    },
    {
      availableInFramework: ["RTF"],
      type: "select",
      name: "Word Count",
      placeholder: "Select word count",
      options: [
        "<100",
        "100-200",
        "200-300",
        "300-400",
        "400-500",
        "500-600",
        "600-700",
        "700-800",
        "800-900",
        "900-1000",
        ">1000",
      ],
      defaultValue: "200-300",
      onChange: (value: string) => {
        setData((prev) => ({ ...prev, wordCount: value }));
      },
      isVisible: (data: Record<string, any>) => {
        return true;
      },
    },
    {
      availableInFramework: ["RTF"],
      type: "select",
      name: "Perspective",
      placeholder: "Select word count",
      options: [
        "None",
        "First Person singular (I, me)",
        "First Person plural (We, us)",
        "Second Person (You, your)",
        "Third Person (He, she)",
      ],
      defaultValue: "None",
      onChange: (value: string) => {
        setData((prev) => ({ ...prev, perspective: value }));
      },
      isVisible: (data: Record<string, any>) => {
        return true;
      },
    },
    {
      availableInFramework: ["RTF"],
      type: "text-input",
      name: "keywords",
      placeholder: "Add keywords",
      defaultValue: "",
      onChange: (value: string) => {
        setData((prev) => ({ ...prev, keywords: value }));
      },
      isVisible: (data: Record<string, any>) => {
        return true;
      },
    },
    {
      availableInFramework: ["RTF"],
      type: "checkbox",
      name: "is-faq-included",
      label: "Include FAQs",
      defaultValue: false,
      onChange: (value: boolean) => {
        setData((prev) => ({ ...prev, isFaqIncluded: value }));
      },
      isVisible: (data: Record<string, any>) => {
        return true;
      },
    },
    {
      availableInFramework: ["RTF"],
      type: "checkbox",
      name: "is-conclusion-included",
      label: "Include Conclusion",
      defaultValue: false,
      onChange: (value: boolean) => {
        setData((prev) => ({ ...prev, isConclusionIncluded: value }));
      },
      isVisible: (data: Record<string, any>) => {
        return true;
      },
    },
    {
      availableInFramework: ["RTF"],
      type: "checkbox",
      name: "is-sources-included",
      label: "Include Sources under article",
      defaultValue: false,
      onChange: (value: boolean) => {
        setData((prev) => ({ ...prev, isSourcesIncluded: value }));
      },
      isVisible: (data: Record<string, any>) => {
        return true;
      },
    },
    {
      availableInFramework: ["RTF"],
      type: "checkbox",
      name: "is-seo-best-practices-included",
      label: "Include SEO best practices",
      defaultValue: false,
      onChange: (value: boolean) => {
        setData((prev) => ({ ...prev, isSeoBestPracticesIncluded: value }));
      },
      isVisible: (data: Record<string, any>) => {
        return true;
      },
    },
  ];

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    try {
      setOutput("");
      setIsOutputLoading(true);

      window.document.getElementById("prompt-enhancer")?.scrollIntoView({
        behavior: "smooth",
      });

      const { output } =
        await generate(`Your are a ai model that Enhance prompts given by the users with the following parameters and instructions:

        PROMPT PARAMETERS:
        - ROLE NAME: ${data.role}
        - ROLE DESCRIPTION: ${data.role}
        - TASK: ${data.task}
        - FORMAT: ${data.format}
        - TONE: ${data.tone}
        - DOCUMENT TYPE: ${data.documentType}
        - WORD COUNT: ${data.wordCount}
        - PERSPECTIVE: ${data.perspective}
        - HUMANIZE RESPONSE: ${isHumanizeResponseEnabled}

        INSTRUCTIONS FOR PROMPT ENHANCER:
        - fix grammatical mistakes
        - only return the prompt
        - if any parameter is not specified, ignore the line
        - change the prompt so that it doesn't look always the same but keep the core meaning
        - use synonyms to make the prompt more readable
        - enhance the given prompt below and only return the enhanced prompt
        - don't generate responses on the enhanced prompt

        PROMPT TO ENHANCE:
        ${PROMPTS[selectedPromptFramework.toLowerCase() as keyof typeof PROMPTS].prompt}
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

  useEffect(() => {
    resetAllStates();
    const defaultData = {
      ...FRAMEWORKS.find(
        (f) => f.name === selectedPromptFramework,
      )?.form.elements.reduce(
        (acc, el) => ({
          ...acc,
          [el.name]: el.defaultValue,
        }),
        {},
      ),
      ...ADVANCED_OPTIONS.reduce(
        (acc, opt) => ({
          ...acc,
          [opt.name.toLowerCase().replace(/\s/g, "")]: opt.defaultValue,
        }),
        {},
      ),
    };
    setData(defaultData as any);
  }, [selectedPromptFramework]);

  return (
    <div className="container max-w-7xl scroll-m-10" id="prompt-enhancer">
      <div className="grid grid-cols-2 gap-10 shadow-lg rounded-3xl p-8 border bg-background">
        <section>
          <div>
            <h4 className="text-xl font-bold">Choose prompt Enhancer</h4>
          </div>
          <div className="flex flex-row gap-4 mt-6">
            {FRAMEWORKS.map((framework) => (
              <button
                key={framework.name}
                className={cn(
                  "bg-secondary text-base px-3 py-1 font-medium rounded-full",
                  selectedPromptFramework === framework.name &&
                    "bg-blue-500 text-white",
                )}
                onClick={() => setSelectedPromptFramework(framework.name)}
              >
                {framework.name}
              </button>
            ))}
          </div>
          <div className="mt-6">
            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-2 gap-4">
                {FRAMEWORKS.find(
                  (frm) =>
                    frm.name.toLowerCase() ===
                    selectedPromptFramework.toLocaleLowerCase(),
                )?.form.elements.map((el) => {
                  switch (el.type) {
                    case "select": {
                      return (
                        <div key={el.name} className="col-span-1">
                          <Label htmlFor={el.name}>{el.label}</Label>
                          <Select
                            defaultValue={el.defaultValue}
                            onValueChange={(value) => el.onChange(value)}
                          >
                            <SelectTrigger
                              name={el.name}
                              id={el.name}
                              className="w-full"
                            >
                              <SelectValue placeholder={el.placeholder} />
                            </SelectTrigger>
                            <SelectContent>
                              {el.options?.map((option) => (
                                <SelectItem key={option} value={option}>
                                  {option}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      );
                    }
                    case "text-input": {
                      return (
                        <div key={el.name} className="col-span-2">
                          <Label htmlFor={el.name}>{el.label}</Label>
                          <Input
                            type={el.type}
                            id={el.name}
                            name={el.name}
                            placeholder={el.placeholder}
                            defaultValue={el.defaultValue}
                            onChange={(e) => el.onChange(e.target.value)}
                          />
                        </div>
                      );
                    }
                    case "textarea": {
                      return (
                        <div key={el.name} className="col-span-2">
                          <Label htmlFor={el.name}>{el.label}</Label>
                          <Textarea
                            id={el.name}
                            name={el.name}
                            placeholder={el.placeholder}
                            defaultValue={el.defaultValue}
                            rows={el.minRows}
                            onChange={(e) => el.onChange(e.target.value)}
                          />
                        </div>
                      );
                    }
                    default:
                      return null;
                  }
                })}
              </div>
              <div className="mt-4">
                <div className="flex items-center space-x-2">
                  <Switch
                    className="data-[state=checked]:bg-gradient-to-r data-[state=checked]:from-purple-500 data-[state=checked]:to-blue-500"
                    id="humanize-response"
                    checked={isHumanizeResponseEnabled}
                    onCheckedChange={setIsHumanizeResponseEnabled}
                  />
                  <Label htmlFor="humanize-response">
                    Humanize response{" "}
                    <Badge variant="secondary">Recommended</Badge>
                  </Label>
                </div>
                <div className="mt-4">
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
                  <div className="mt-4">
                    {isAdvanceOptionsExpanded && (
                      <div className="grid grid-cols-2 gap-4">
                        {ADVANCED_OPTIONS.filter(
                          (opt) => opt.type !== "checkbox",
                        ).map((opt) => {
                          switch (opt.type) {
                            case "select": {
                              return (
                                <div
                                  key={opt.name}
                                  className="col-span-1 space-y-1.5"
                                >
                                  <Label htmlFor={opt.name}>{opt.name}</Label>
                                  <Select
                                    defaultValue={opt.defaultValue as string}
                                  >
                                    <SelectTrigger>
                                      <SelectValue
                                        placeholder={opt.placeholder}
                                      />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {opt.options?.map((option) => (
                                        <SelectItem key={option} value={option}>
                                          {option}
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                </div>
                              );
                            }
                            case "text-input": {
                              return (
                                <div
                                  key={opt.name}
                                  className="col-span-2 space-y-1.5"
                                >
                                  <Label htmlFor={opt.name}>{opt.name}</Label>
                                  <Input
                                    type={opt.type}
                                    id={opt.name}
                                    name={opt.name}
                                    placeholder={opt.placeholder}
                                    defaultValue={opt.defaultValue as string}
                                  />
                                </div>
                              );
                            }
                            default:
                              return null;
                          }
                        })}
                      </div>
                    )}
                    {isAdvanceOptionsExpanded && (
                      <div className="grid gap-3 mt-6">
                        {ADVANCED_OPTIONS.filter(
                          (opt) => opt.type === "checkbox",
                        ).map((opt) => {
                          return (
                            <div
                              aria-label="conclusion"
                              className={cn("flex items-center space-x-2")}
                              key={opt.name}
                            >
                              <Checkbox
                                id={opt.name}
                                defaultChecked={opt.defaultValue as boolean}
                                onCheckedChange={(v) =>
                                  opt.onChange(v as never)
                                }
                              />
                              <Label
                                htmlFor={opt.name}
                                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                              >
                                {opt.label}
                              </Label>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <div className="mt-4">
                <SignedIn>
                  <div className="flex items-center gap-3">
                    <Button
                      size="lg"
                      className="bg-gradient-to-r from-purple-500 to-blue-500"
                      type="submit"
                    >
                      <SparklesIcon className="h-4 w-4 mr-2" /> Enhance Prompt
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
                      <SparklesIcon className="h-4 w-4 mr-2" /> Sign in to
                      Enhance Prompt
                    </Button>
                  </SignInButton>
                </SignedOut>
              </div>
            </form>
          </div>
        </section>
        <section className="">
          <div className="p-6 rounded-2xl border h-full overflow-y-auto">
            {isOutputLoading && !output && (
              <div className="p-5 rounded-xl bg-secondary/50 border">
                <div className="flex flex-col gap-2">
                  <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                  <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                  <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                </div>
              </div>
            )}
            {output && <OutputCard output={output} />}
          </div>
        </section>
      </div>
    </div>
  );
}

function OutputCard({ output }: { output: string }) {
  const [isCopied, setIsCopied] = useState(false);

  function handleCopy() {
    navigator.clipboard.writeText(output);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  }

  return (
    <div className="p-5 group rounded-xl bg-secondary/50 border text-[15px] relative ">
      <div className="">{output}</div>
      <div className="flex items-center gap-2 justify-between mt-3">
        <p className="text-muted-foreground text-xs">
          {new Date().toLocaleTimeString()}
        </p>
        <p className="text-muted-foreground text-xs">
          {output.length} characters
        </p>
      </div>
      <Button
        onClick={handleCopy}
        size="icon"
        variant="secondary"
        className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 h-8 w-8"
      >
        {isCopied ? <CopyCheckIcon size={14} /> : <CopyIcon size={14} />}
      </Button>
    </div>
  );
}

const PROMPTS = {
  rtf: {
    prompt: `Act as {Role}, now your task will be {Task} and the content you generate should be in {format/document type}, writing tone will be {tone} and {humanizer/"make sure the copy you generate it should be 8th grade English catagoies and do aim for simpler adverbs, and adverbial phrases professional tone"} the {document} you will genrate word count should be around {wordcount} and the writting perspective {perspective}`,
  },
};

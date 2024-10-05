"use client";

import { useEffect, useRef, useState } from "react";
import { SignedIn, SignedOut, SignInButton, useUser } from "@clerk/nextjs";
import {
  ChevronRightIcon,
  CopyCheckIcon,
  CopyIcon,
  SparklesIcon,
  TriangleAlertIcon,
} from "lucide-react";
import { readStreamableValue, StreamableValue } from "ai/rsc";
import { toast } from "sonner";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { Coins, Info, RocketLaunch } from "@phosphor-icons/react";

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
import { generate, saveHistory } from "../_actions";
import useUserSubscription from "~/hooks/use-user-subscription";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/components/ui/popover";
import { Alert, AlertDescription } from "~/components/ui/alert";
import decrementFreeToken from "~/actions";
import { useRouter } from "next/navigation";

const PREDEFINED_ROLES = [
  "SEO Blog Writer",
  "Rewriter",
  "Coder",
  "Fitness Coach",
  "None",
];

interface Data {
  role: string | undefined;
  documentType: string | undefined;
  task: string | undefined;
  format: string | undefined;
  tone: string | undefined;
  wordCount: string | undefined;
  perspective: string | undefined;
  keywords: string | undefined;
  programmingLanguage: string | undefined;
  projectDescription: string | undefined;
  targetAudience: string | undefined;
  isFaqIncluded: boolean;
  isConclusionIncluded: boolean;
  isSourcesIncluded: boolean;
  isSeoBestPracticesIncluded: boolean;
  age: string | undefined;
  height: string | undefined;
  weight: string | undefined;
  fitnessLevel: string | undefined;
  action: string | undefined;
  goal: string | undefined;
  context: string | undefined;
  result: string | undefined;
  example: string | undefined;
}

export default function PromptEnhancerV2({
  isSubscribed,
  freeTokens,
}: {
  isSubscribed: boolean;
  freeTokens: number;
}) {
  const [selectedPromptFramework, setSelectedPromptFramework] = useState("RTF");
  const [isHumanizeResponseEnabled, setIsHumanizeResponseEnabled] =
    useState(true);
  const [isAdvanceOptionsExpanded, setIsAdvanceOptionsExpanded] =
    useState(false);
  const [isUsingCustomRole, setIsUsingCustomRole] = useState(false);
  const [isOutputLoading, setIsOutputLoading] = useState(false);
  const [output, setOutput] = useState("");

  const [data, setData] = useState<Data>({
    role: PREDEFINED_ROLES[0],
    documentType: "None",
    task: undefined,
    format: undefined,
    tone: undefined,
    wordCount: undefined,
    perspective: undefined,
    keywords: undefined,
    programmingLanguage: undefined,
    projectDescription: undefined,
    targetAudience: undefined,
    isFaqIncluded: false,
    isConclusionIncluded: false,
    isSourcesIncluded: false,
    isSeoBestPracticesIncluded: false,
    age: undefined,
    height: undefined,
    weight: undefined,
    fitnessLevel: undefined,
    action: undefined,
    goal: undefined,
    context: undefined,
    result: undefined,
    example: undefined,
  });

  const roleInputRef = useRef<HTMLInputElement>(null);

  const { user } = useUser();

  const { data: histories } = useQuery({
    queryKey: ["histories"],
    queryFn: () => fetch("/api/history").then((res) => res.json()),
    enabled: !!user?.id,
  });

  const router = useRouter();

  function resetAllStates() {
    setData({
      role: PREDEFINED_ROLES[0],
      documentType: "None",
      task: undefined,
      format: undefined,
      tone: undefined,
      wordCount: undefined,
      perspective: undefined,
      keywords: undefined,
      programmingLanguage: undefined,
      projectDescription: undefined,
      targetAudience: undefined,
      isFaqIncluded: false,
      isConclusionIncluded: false,
      isSourcesIncluded: false,
      isSeoBestPracticesIncluded: false,
      age: undefined,
      height: undefined,
      weight: undefined,
      fitnessLevel: undefined,
      action: undefined,
      goal: undefined,
      context: undefined,
      result: undefined,
      example: undefined,
    });
  }

  const FRAMEWORKS = [
    {
      name: "RTF",
      description:
        "The RTF Prompt Framework (Role-Task-Format) is a structured approach for creating effective AI prompts, especially useful for developers and content creators.",
      form: {
        elements: [
          // {
          //   type: "select",
          //   label: "Role",
          //   name: "role",
          //   placeholder: "Select role",
          //   options: ["SEO Blog Writer", "Rewriter", "Coder", "Fitness Coach"],
          //   defaultValue: "SEO Blog Writer",
          //   onChange: (value: string) => {
          //     setData((prev) => ({ ...prev, role: value }));
          //   },
          // },
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
            type: "advance-options",
            // name: "advance-options",
            // onChange: () => {},
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
    {
      name: "TAG",
      description:
        "The TAG Prompt Framework emphasizes Task, Action, and Goal, ensuring that the prompt is well-defined and targeted for optimal results.",
      form: {
        elements: [
          {
            availableInFramework: ["TAG"],
            type: "text-input",
            label: "Task",
            name: "Task",
            placeholder: "Task",
            defaultValue: "",
            onChange: (value: string) => {
              setData((prev) => ({ ...prev, task: value }));
            },
            required: true,
          },
          {
            type: "textarea",
            label: "Action",
            name: "action",
            placeholder: "",
            minRows: 3,
            onChange: (value: string) => {
              setData((prev) => ({ ...prev, action: value }));
            },
            required: true,
          },
          {
            type: "textarea",
            label: "Goal",
            name: "goal",
            placeholder: "",
            minRows: 3,
            onChange: (value: string) => {
              setData((prev) => ({ ...prev, goal: value }));
            },
            required: true,
          },
        ],
      },
    },
    {
      name: "CARE",
      description:
        "The CARE prompt framework stands for Context, Action, Role, and Example—four key elements that guide the model in producing more accurate and relevant responses.",
      form: {
        elements: [
          {
            availableInFramework: ["CARE"],
            type: "textarea",
            label: "Context",
            name: "context",
            placeholder: "We are launching a new line of sustainable clothing",
            minRows: 3,
            onChange: (value: string) => {
              setData((prev) => ({ ...prev, context: value }));
            },
            required: true,
          },
          {
            availableInFramework: ["CARE"],
            type: "text-input",
            label: "Action",
            name: "action",
            placeholder:
              "Can you assist us in creating a targeted advertising campaign that emphasizes our environmental commitment",
            defaultValue: "",
            onChange: (value: string) => {
              setData((prev) => ({ ...prev, action: value }));
            },
            required: true,
          },
          {
            availableInFramework: ["CARE"],
            type: "textarea",
            label: "Result",
            name: "result",
            placeholder:
              "Our desired outcome is to drive product awaroness and sales, A good example of a similar successful initiative is Patagonia's",
            minRows: 3,
            onChange: (value: string) => {
              setData((prev) => ({ ...prev, action: value }));
            },
          },
          {
            availableInFramework: ["CARE"],
            type: "textarea",
            label: "Example",
            name: "example",
            placeholder:
              "Don't Buy This Jackot campaign, which highlighted their commitment to sustainability while enhancing their brand imago.",
            minRows: 3,
            onChange: (value: string) => {
              setData((prev) => ({ ...prev, goal: value }));
            },
            required: true,
          },
        ],
      },
    },
  ];

  const ADVANCED_OPTIONS = [
    {
      availableInFramework: ["RTF"],
      type: "select",
      name: "Tone of voice",
      placeholder: "Select tone",
      options: [
        "Auto",
        "Conversation",
        "Professional",
        "Inspirational",
        "Persuasive",
        "Urgent",
        "Bold",
        "Empathetic",
        "Minimalistic",
      ],
      defaultValue: "Auto",
      onChange: (value: string) => {
        setData((prev) => ({ ...prev, tone: value }));
      },
      isVisible: () => {
        return data.role === "SEO Blog Writer" || isUsingCustomRole;
      },
    },
    {
      availableInFramework: ["RTF"],
      type: "select",
      name: "Word Count",
      placeholder: "Select word count",
      options: ["Auto", "600 - 1000", "1,300 - 1,800", "2,000 - 2,600"],
      defaultValue: "Auto",
      onChange: (value: string) => {
        setData((prev) => ({ ...prev, wordCount: value }));
      },
      isVisible: () => {
        return (
          data.role === "SEO Blog Writer" ||
          data.role === "Rewriter" ||
          isUsingCustomRole
        );
      },
    },
    {
      availableInFramework: ["RTF"],
      type: "select",
      name: "Perspective",
      placeholder: "Select Perspective",
      options: [
        "Auto",
        "First Person singular (I, me)",
        "First Person plural (We, us)",
        "Second Person (You, your)",
        "Third Person (He, she)",
      ],
      defaultValue: "Auto",
      onChange: (value: string) => {
        setData((prev) => ({ ...prev, perspective: value }));
      },
      isVisible: () => {
        return (
          data.role === "SEO Blog Writer" ||
          data.role === "Rewriter" ||
          isUsingCustomRole
        );
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
      isVisible: () => {
        return data.role === "SEO Blog Writer" || isUsingCustomRole;
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
      isVisible: () => {
        return data.role === "SEO Blog Writer" || isUsingCustomRole;
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
      isVisible: () => {
        return data.role === "SEO Blog Writer" || isUsingCustomRole;
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
      isVisible: () => {
        return data.role === "SEO Blog Writer";
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
      isVisible: () => {
        return data.role === "Rewriter" || isUsingCustomRole;
      },
    },
    {
      availableInFramework: ["RTF"],
      type: "text-input",
      name: "Target Audience",
      placeholder: "The audience you want to target",
      defaultValue: "",
      onChange: (value: string) => {
        setData((prev) => ({ ...prev, targetAudience: value }));
      },
      isVisible: () => {
        return data.role === "Rewriter";
      },
    },
    {
      availableInFramework: ["RTF"],
      type: "text-input",
      name: "Programming Language",
      placeholder: "Python",
      defaultValue: "",
      onChange: (value: string) => {
        setData((prev) => ({ ...prev, programmingLanguage: value }));
      },
      isVisible: () => {
        return data.role === "Coder";
      },
    },
    {
      availableInFramework: ["RTF"],
      type: "text-input",
      name: "Project Description",
      placeholder: "",
      defaultValue: "",
      onChange: (value: string) => {
        setData((prev) => ({ ...prev, projectDescription: value }));
      },
      isVisible: () => {
        return data.role === "Coder";
      },
    },
    {
      availableInFramework: ["RTF"],
      type: "text-input",
      name: "Age",
      placeholder: "25",
      defaultValue: "",
      onChange: (value: string) => {
        setData((prev) => ({ ...prev, age: value }));
      },
      isVisible: () => {
        return data.role === "Fitness Coach";
      },
    },
    {
      availableInFramework: ["RTF"],
      type: "text-input",
      name: "Weight (KG)",
      placeholder: "88",
      defaultValue: "",
      onChange: (value: string) => {
        setData((prev) => ({ ...prev, weight: value }));
      },
      isVisible: () => {
        return data.role === "Fitness Coach";
      },
    },
    {
      availableInFramework: ["RTF"],
      type: "text-input",
      name: "Height (cm)",
      placeholder: "153",
      defaultValue: "",
      onChange: (value: string) => {
        setData((prev) => ({ ...prev, height: value }));
      },
      isVisible: () => {
        return data.role === "Fitness Coach";
      },
    },
    {
      availableInFramework: ["RTF"],
      type: "select",
      name: "Fitness Level",
      placeholder: "Select Fitness Level",
      options: ["None", "Beginner", "Intermediate", "Advanced"],
      defaultValue: "None",
      onChange: (value: string) => {
        setData((prev) => ({ ...prev, fitnessLevel: value }));
      },
      isVisible: () => {
        return data.role === "Fitness Coach";
      },
    },
  ];

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!isSubscribed && freeTokens < 0) {
      toast(
        "You have exceeded your free tokens. Please upgrade your plan to generate a prompt",
        {
          action: (
            <Button className="bg-blue-600 hover:bg-blue-500 block">
              <Link href="/pricing">Upgrade now</Link>
            </Button>
          ),
        },
      );
      return;
    }

    if (!data.task || !data.role || !data.role || !data.documentType) {
      toast.warning("Fill up the fields");
      return;
    }

    try {
      setOutput("");
      setIsOutputLoading(true);

      window.document.getElementById("prompt-enhancer")?.scrollIntoView({
        behavior: "smooth",
      });

      let outputStream: StreamableValue<string, any> | null = null;

      if (selectedPromptFramework.toLowerCase() === "rtf") {
        const { output } =
          await generate(`SYSTEM: You are a powerful prompt enhancer who writes a prompt by the user given information\n
INSTRUCTIONS:\n
- only return the enhanced prompt\n
- take the role and say like 'Act as {role}', 'Be {role}' or you can come up with something good
- ignore the values that aren't defined in the prompt\n
USER: Here are the details that the generated prompt should include\n
- task is: ${data.task}\n
- role is: ${data.role}\n
- document type is: ${data.documentType}\n
- format should be: ${data.format}\n
- word count is: ${data.wordCount}\n
- tone of voice is: ${data.tone}\n
- perspective is: ${data.perspective}\n
- keywords are: ${data.keywords}\n
- is FAQ included: ${data.isFaqIncluded}\n
- is conclusion included: ${data.isConclusionIncluded}\n
- is sources included: ${data.isSourcesIncluded}\n
- is SEO best practices included: ${data.isSeoBestPracticesIncluded}\n
- target audience is: ${data.targetAudience}\n
- programming language is: ${data.programmingLanguage}\n
- project description is: ${data.projectDescription}\n
- age is: ${data.age}\n
- weight is: ${data.weight}\n
- height is: ${data.height}\n
- fitness level is: ${data.fitnessLevel}`);
        outputStream = output;
      } else if (selectedPromptFramework.toLowerCase() === "rtf") {
        const { output } =
          await generate(`SYSTEM: You are a powerful prompt enhancer who writes a prompt by the user given information\n
INSTRUCTIONS:\n
- only return the enhanced prompt\n
- ignore the values that aren't defined in the prompt\n
USER: Here are the details that the generated prompt should include\n
- task is: ${data.task}\n
- action is: ${data.action}\n
- goal is: ${data.goal}\n`);
        outputStream = output;
      } else if (selectedPromptFramework.toLowerCase() === "care") {
        const { output } =
          await generate(`SYSTEM: You are a powerful prompt enhancer who writes a prompt by the user given information\n
INSTRUCTIONS:\n
- only return the enhanced prompt\n
- ignore the values that aren't defined in the prompt\n
USER: Here are the details that the generated prompt should include\n
- context: ${data.context}\n
- action: ${data.action}\n
- result: ${data.result}\n
- example: ${data.example}`);
        outputStream = output;
      } else {
        toast.error("Other frameworks aren't ready yet");
        return;
      }

      //       if (selectedPromptFramework.toLowerCase() === "rtf") {
      //         const getRoleSpecificInstructions = (): string | undefined => {
      //           if (data.role === "SEO Blog Writer") {
      //             return `
      // - research the topic {topic} thoroughly. (the topic comes from the field “Task”)
      // - write an article optimized according to SEO best practice with {word count} words and with the main keyword {keyword} from the {perspective} Perspective.
      // - add a conclusion to the article according to the 'INCLUDE CONCLUSION' parameter
      // - formulate a FAQ with 5 questions and answers according to the 'INCLUDE FAQS' parameter
      // - Below the text, place the links that you used as a source of information according to the 'INCLUDE SOURCES' parameter`;
      //           }
      //           if (data.role === "Rewriter") {
      //             return `
      // - Act as an experienced rewriter with a deep understanding of effective communication and audience engagement.
      // - Ensure the rewritten text is tailored for the {Target Audience}.
      // - Maintain the original meaning and intent while using alternative phrasing and sentence structures.
      // - Adjust the tone of voice to be {Tone of Voice} and use the {perspective} perspective
      // - Optimize the text according to SEO best practices, including the integration of relevant keywords according to the parameters
      // - Improve the readability to ensure the text is clear and engaging for the intended audience.
      // - Avoid any direct duplication of the original text to ensure uniqueness.`;
      //           }
      //           if (data.role === "Coder") {
      //             return `
      // - You are an experienced {Programming Language} developer tasked with creating a {project description, e.g., a management tool}. (the project description comes from the field “Task”)
      // - Be modular and extendable so that additional features can be easily added in the future
      // - Be modular and extendable so that additional features can be easily added in the future
      // - Be optimized for readability and maintainability, adhering to best practices such as PEP 8
      // - Include inline comments explaining each function and section of the code
      // - Include inline comments explaining each function and section of the code`;
      //           }
      //           if (data.role === "Fitness Coach") {
      //             return `
      // - You are an expert fitness coach, and your task is to create a personalized fitness plan for a
      // - {age}-year-old individual (according to the 'AGE' parameter)
      // - who weighs {weight} kg (according to the 'WEIGHT' parameter)
      // - is {height} cm tall (according to the 'HEIGHT' parameter)
      // - and has a fitness level of {fitness level} (according to the 'FITNESS LEVEL' parameter)
      // - The goal is to guide this individual toward a healthier lifestyle, improve their metabolism, and achieve a better overall fitness level.
      // - The plan should include A weekly workout schedule with a balance of cardio, strength training, and flexibility exercises
      // - A weekly workout schedule with a balance of cardio, strength training, and flexibility exercises
      // - Recommendations for daily activities and habits that promote a healthier lifestyle`;
      //           }
      //         };

      //         const { output } =
      //           await generate(`Your are a ai model that Enhance prompts given by the users with the following parameters and instructions:

      // PROMPT PARAMETERS (take only the ones that are defined):
      // - ROLE NAME: ${data.role}
      // - TASK: ${data.task}
      // - FORMAT: ${data.format}
      // - TONE: ${data.tone}
      // - DOCUMENT TYPE: ${data.documentType}
      // - WORD COUNT: ${data.wordCount}
      // - PERSPECTIVE: ${data.perspective}
      // - HUMANIZE RESPONSE: ${isHumanizeResponseEnabled}
      // - KEYWORDS: ${data.keywords}
      // - INCLUDE FAQS: ${data.isFaqIncluded}
      // - INCLUDE CONCLUSION: ${data.isConclusionIncluded}
      // - INCLUDE SOURCES: ${data.isSourcesIncluded}
      // - PROGRAMMING LANGUAGE: ${data.programmingLanguage}
      // - PROJECT DESCRIPTION: ${data.projectDescription}
      // - TARGET AUDIENCE: ${data.targetAudience}
      // - AGE: ${data.age}
      // - HEIGHT: ${data.height}
      // - WEIGHT: ${data.weight}
      // - FITNESS LEVEL: ${data.fitnessLevel}

      // INSTRUCTIONS FOR PROMPT ENHANCER:
      // - MUST: include all the defined parameters in the enhanced prompt as commands
      // - fix grammatical mistakes
      // - only return the prompt
      // - if any parameter is not specified, ignore the line
      // - change the prompt so that it doesn't look always the same but keep the core meaning
      // - use synonyms to make the prompt more readable
      // - enhance the given prompt below and only return the enhanced prompt
      // - don't generate responses on the enhanced prompt
      // ${getRoleSpecificInstructions()}

      // FINE TUNING:
      // | **Role**            | **Task**                                                  | **Output**                                            |
      // |---------------------|-----------------------------------------------------------|--------------------------------------------------------------------------|
      // "| **Code Rewriter**    | Rewrite the given code to a professional level.           | ""Act as a coder, take this code and rewrite it professionally: [insert code]"" |"
      // "| **Content Editor**   | Edit the following paragraph to be more engaging.         | ""As a content editor, enhance this text for readability: [insert paragraph]"" |"
      // "| **SEO Specialist**   | Optimize the provided blog for SEO.                       | ""Optimize the following blog post for SEO with best practices: [insert blog]"" |"
      // "| **UX Designer**      | Redesign the UI for better user experience.               | ""As a UX designer, create a more user-friendly version of this interface: [insert UI description]"" |"
      // "| **Data Analyst**     | Analyze the data and provide insights.                    | ""Analyze the data and give actionable insights: [insert dataset]""          |"
      // "| **Marketing Expert** | Create a marketing strategy for the given product.        | ""Develop a marketing plan for this product: [insert product description]""  |"
      // "| **Social Media Manager** | Create a content calendar for the next month.           | ""Plan a month-long content strategy for these topics: [insert topics]""      |"
      // "| **Copywriter**       | Write a compelling product description.                   | ""Create a captivating description for this product: [insert product details]"" |"
      // "| **Project Manager**  | Build a timeline for the project milestones.              | ""As a project manager, outline a timeline for these milestones: [insert milestones]"" |"
      // "| **Graphic Designer** | Design a logo for a modern brand.                         | ""Create a sleek and modern logo for this brand: [insert brand description]"" |"

      // This structure should offer flexibility for dynamic user input while providing clarity for each role's task.

      // PROMPT TO ENHANCE:
      // ${PROMPTS[selectedPromptFramework.toLowerCase() as keyof typeof PROMPTS].prompt}`);
      //         outputStream = output;
      //       }
      //       if (selectedPromptFramework.toLowerCase() === "tag") {
      //         const { output } =
      //           await generate(`Your are a ai model that Enhance prompts given by the users with the following parameters and instructions:
      // PROMPT PARAMETERS (take only the ones that are defined and necessary for the prompt):
      // - task: ${data.task}
      // - action: ${data.action}
      // - goal: ${data.goal}

      // INSTRUCTIONS FOR PROMPT ENHANCER:
      // - MUST: include all the defined parameters in the enhanced prompt as commands
      // - The task is to evaluate the performance of team members
      // - Act as a Direct manager and assess the strengths and weaknesses of team members.
      // - Goal is to improve team performance so that the average user satisfaction score moves from 6 to 7.5 in the next quarter.
      // - fix grammatical mistakes
      // - only return the prompt
      // - if any parameter is not specified, ignore the line
      // - change the prompt so that it doesn't look always the same but keep the core meaning
      // - use synonyms to make the prompt more readable
      // - enhance the given prompt below and only return the enhanced prompt
      // - don't generate responses on the enhanced prompt

      // PROMPT TO ENHANCE (replace the variables with {} with the corresponding parameters):
      // ${PROMPTS[selectedPromptFramework.toLowerCase() as keyof typeof PROMPTS].prompt}
      // `);

      //         outputStream = output;
      //       }
      //       if (selectedPromptFramework.toLowerCase() === "care") {
      //         const { output } =
      //           await generate(`Your are a ai model that Enhance prompts given by the users with the following parameters and instructions:
      // PROMPT PARAMETERS (take only the ones that are defined and necessary for the prompt):
      // - context: ${data.context}
      // - action: ${data.action}
      // - result: ${data.result}
      // - example: ${data.example}

      // INSTRUCTIONS FOR PROMPT ENHANCER:
      // - MUST: include all the defined parameters in the enhanced prompt as commands
      // - fix grammatical mistakes
      // - only return the prompt
      // - if any parameter is not specified, ignore the line
      // - change the prompt so that it doesn't look always the same but keep the core meaning
      // - use synonyms to make the prompt more readable
      // - enhance the given prompt below and only return the enhanced prompt
      // - don't generate responses on the enhanced prompt

      // PROMPT TO ENHANCE (replace the variables with {} with the corresponding parameters):
      // ${PROMPTS[selectedPromptFramework.toLowerCase() as keyof typeof PROMPTS].prompt}
      // `);

      //         outputStream = output;
      //       }

      if (!outputStream) {
        console.log("No output stream");
        return;
      }

      let INTERNAL_output = "";

      for await (const delta of readStreamableValue(outputStream)) {
        isOutputLoading && setIsOutputLoading(false);
        INTERNAL_output += delta;
        setOutput(INTERNAL_output);
      }

      const res = await saveHistory(INTERNAL_output, data);

      if (res?.error) {
        toast.error(res.error);
      }
    } catch (error) {
      console.error(error);
      toast.error("Error enhancing prompt");
    } finally {
      await decrementFreeToken();
      setIsOutputLoading(false);
    }

    router.refresh();
  }

  // useEffect(() => {
  //   resetAllStates();
  //   const defaultData = {
  //     ...FRAMEWORKS.find(
  //       (f) => f.name === selectedPromptFramework
  //     )?.form.elements.reduce((acc, el) => {
  //       return {
  //         ...acc,
  //         // @ts-expect-error
  //         [el.name]: el.defaultValue,
  //       };
  //     }, {}),
  //     ...ADVANCED_OPTIONS.reduce(
  //       (acc, opt) => ({
  //         ...acc,
  //         [opt.name.toLowerCase().replace(/\s/g, "")]: opt.defaultValue,
  //       }),
  //       {}
  //     ),
  //   };
  //   setData(defaultData as any);
  // }, [selectedPromptFramework]);

  return (
    <div className="container max-w-7xl scroll-m-10" id="prompt-enhancer">
      {/* {!userSubscriptionQuery?.data?.isSubscribed &&
        !userSubscriptionQuery.isLoading && (
          <div>
            <div className="m-3 bg-blue-50 border border-blue-100 p-6 rounded-xl space-y-2">
              <h4 className="text-lg font-medium text-blue-600">⚠️ Alert</h4>
              <p className="text-blue-800">
                Subscribe to any of the available plan to start using Help Sonic
              </p>
              <Button asChild className="bg-blue-600 hover:bg-blue-500">
                <Link href="/pricing">Check Plans</Link>
              </Button>
            </div>
          </div>
        )} */}
      <div className="grid grid-cols-2 gap-10 shadow-lg rounded-3xl p-8 border bg-background">
        <section>
          <div>
            <h4 className="text-xl font-bold">Choose prompt Enhancer</h4>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex flex-row gap-4 mt-6">
              {FRAMEWORKS.map((framework) => (
                <button
                  key={framework.name}
                  className={cn(
                    "bg-secondary text-base px-3 py-1 font-medium rounded-full",
                    selectedPromptFramework === framework.name &&
                      "bg-blue-500 text-white",
                  )}
                  onClick={() => {
                    resetAllStates();
                    setSelectedPromptFramework(framework.name);
                  }}
                >
                  {framework.name}
                </button>
              ))}
            </div>
            {/* <div>
              <Popover>
                <PopoverTrigger>
                  <button type="button">
                    <Info size={22} />
                  </button>
                </PopoverTrigger>
                <PopoverContent className="w-[400px]">
                  <p className="text-[15px] text-foreground/80">
                    {
                      FRAMEWORKS.find((x) => x.name === selectedPromptFramework)
                        ?.description
                    }
                  </p>
                </PopoverContent>
              </Popover>
            </div> */}
          </div>

          <div className="mb-3 mt-4">
            <p className="text-[13px] mb-2 font-medium">
              Framework Description
            </p>
            <p className="text-sm text-foreground/80">
              {
                FRAMEWORKS.find((x) => x.name === selectedPromptFramework)
                  ?.description
              }
            </p>
          </div>
          <div className="mt-6">
            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-2 gap-4">
                {/* custom fields */}
                {selectedPromptFramework === "RTF" && (
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
                          value={data.role}
                          onChange={(e) => {
                            resetAllStates();
                            setData((prev) => ({
                              ...prev,
                              role: e.target.value,
                            }));
                          }}
                          ref={roleInputRef}
                          required
                        />
                      </>
                    ) : (
                      <>
                        <Label htmlFor="role">Role</Label>
                        <Select
                          defaultValue={PREDEFINED_ROLES[0]}
                          required
                          onValueChange={(v) => {
                            resetAllStates();
                            setData((prev) => ({
                              ...prev,
                              role: v,
                            }));
                          }}
                        >
                          <SelectTrigger
                            name="role"
                            id="role"
                            className="w-full !min-w-full"
                          >
                            <SelectValue
                              placeholder="Role"
                              className="w-full"
                            />
                          </SelectTrigger>
                          <SelectContent>
                            {PREDEFINED_ROLES.map((role) => (
                              <SelectItem
                                key={`predefined-role//${role}`}
                                value={role}
                              >
                                {role}
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
                            setData((prev) => ({ ...prev, role: "" }));
                            setTimeout(() => {
                              roleInputRef.current?.focus();
                            }, 100);
                          } else {
                            setData((prev) => ({
                              ...prev,
                              role: PREDEFINED_ROLES[0],
                            }));
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
                  </div>
                )}
                {FRAMEWORKS.find(
                  (frm) =>
                    frm.name.toLowerCase() ===
                    selectedPromptFramework.toLowerCase(),
                )?.form.elements.map((el) => {
                  switch (el.type) {
                    case "advance-options": {
                      return (
                        <div className="mt-4 col-span-2">
                          <button
                            type="button"
                            className="text-sm text-blue-600 font-medium"
                            onClick={() =>
                              setIsAdvanceOptionsExpanded((prev) => !prev)
                            }
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
                                  if (!opt.isVisible()) return;

                                  switch (opt.type) {
                                    case "select": {
                                      return (
                                        <div
                                          key={opt.name}
                                          className="col-span-1 space-y-1.5"
                                        >
                                          <Label htmlFor={opt.name}>
                                            {opt.name}
                                          </Label>
                                          <Select
                                            defaultValue={
                                              opt.defaultValue as string
                                            }
                                            onValueChange={(v) =>
                                              opt.onChange(v as never)
                                            }
                                          >
                                            <SelectTrigger>
                                              <SelectValue
                                                placeholder={opt.placeholder}
                                              />
                                            </SelectTrigger>
                                            <SelectContent>
                                              {opt.options?.map((option) => (
                                                <SelectItem
                                                  key={option}
                                                  value={option}
                                                >
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
                                          <Label htmlFor={opt.name}>
                                            {opt.name}
                                          </Label>
                                          <Input
                                            type={opt.type}
                                            id={opt.name}
                                            name={opt.name}
                                            placeholder={opt.placeholder}
                                            defaultValue={
                                              opt.defaultValue as string
                                            }
                                            onChange={(e) =>
                                              opt.onChange(
                                                e.target.value as never,
                                              )
                                            }
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
                                  if (!opt.isVisible()) return;
                                  return (
                                    <div
                                      aria-label="conclusion"
                                      className={cn(
                                        "flex items-center space-x-2",
                                      )}
                                      key={opt.name}
                                    >
                                      <Checkbox
                                        id={opt.name}
                                        defaultChecked={
                                          opt.defaultValue as boolean
                                        }
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
                      );
                    }
                    case "select": {
                      return (
                        <div key={el.name} className="col-span-1">
                          <Label htmlFor={el.name}>{el.label}</Label>
                          <Select
                            defaultValue={el.defaultValue}
                            onValueChange={(value) => el.onChange?.(value)}
                          >
                            <SelectTrigger
                              name={el.name}
                              id={el.name}
                              className="w-full"
                            >
                              <SelectValue placeholder={el.placeholder} />
                            </SelectTrigger>
                            <SelectContent>
                              {/* @ts-expect-error */}
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
                            onChange={(e) => el.onChange?.(e.target.value)}
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
                            onChange={(e) => el.onChange?.(e.target.value)}
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
              </div>
              <div className="mt-4">
                <SignedIn>
                  <div className="space-y-2">
                    <Button
                      size="lg"
                      className="bg-gradient-to-r from-purple-500 to-blue-500"
                      type="submit"
                    >
                      <SparklesIcon className="h-4 w-4 mr-2" /> Enhance Prompt
                    </Button>
                    {!isSubscribed && (
                      <Alert className="mt-2">
                        {!isSubscribed && freeTokens > 0 ? (
                          <>
                            <Coins className="h-6 w-6" />
                            <AlertDescription>
                              You have {freeTokens} free generations left.
                            </AlertDescription>
                          </>
                        ) : null}
                        {!isSubscribed && freeTokens <= 0 && (
                          <>
                            <RocketLaunch className="h-4 w-4" />
                            <AlertDescription>
                              You are out of free credits please consider
                              subscribing to any of the plans to continue.
                            </AlertDescription>
                          </>
                        )}
                      </Alert>
                    )}
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
                  <Alert className="mt-2" variant="warning">
                    <TriangleAlertIcon className="h-4 w-4" />
                    <AlertDescription>
                      You must be logged in to generate prompts.
                    </AlertDescription>
                  </Alert>
                </SignedOut>
              </div>
            </form>
          </div>
        </section>
        <section className="h-[600px] relative">
          <div className="p-6 rounded-2xl border h-full overflow-y-auto space-y-4 relative">
            {isOutputLoading && !output && (
              <div className="p-5 rounded-xl bg-secondary/50 border">
                <div className="flex flex-col gap-2">
                  <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                  <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                  <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                </div>
              </div>
            )}
            {output &&
              !histories.some(
                (history: any) => history.response === output,
              ) && (
                <OutputCard
                  output={output}
                  className="bg-blue-500/10 border-blue-600/10 text-blue-800"
                />
              )}
            {histories?.map((history: any) => (
              <OutputCard key={history.id} output={history.response} />
            ))}
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-background to-transparent pointer-events-none" />
        </section>
      </div>
    </div>
  );
}

function OutputCard({
  output,
  className,
}: {
  output: string;
  className?: string;
}) {
  const [isCopied, setIsCopied] = useState(false);

  function handleCopy() {
    navigator.clipboard.writeText(output);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  }

  return (
    <div
      className={cn(
        "p-5 group rounded-xl bg-secondary/50 border text-[15px] relative",
        className,
      )}
    >
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
    prompt: `Act as {Role}, now your task will be {Task} and the content you generate should be in {format}.`,
  },
  tag: {
    prompt: `You are a proficient strategist in {task}. Your job is to {action}, with the goal of {goal}. Use the most relevant and current information to provide a thorough and accurate response. Ensure clarity and thoroughness in your output.`,
  },
  care: {
    prompt: `You are a {role}, skilled in your domain. Your task is to {task}, ensuring high-quality content that is accurate, clear, and relevant. Deliver the output in {format}, ensuring that it meets the highest standards. For instance, when asked to {specific task}, your response should be detailed yet concise.`,
  },
};

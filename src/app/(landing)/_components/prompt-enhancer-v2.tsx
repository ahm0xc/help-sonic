"use client";

import { useRef, useState } from "react";
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
import {
  Check,
  Checks,
  Coins,
  Eraser,
  Microphone,
  Pen,
  Play,
  RocketLaunch,
  Spinner,
  StarFour,
  Stop,
  User,
  X,
} from "@phosphor-icons/react";

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
import { Alert, AlertDescription } from "~/components/ui/alert";
import decrementFreeToken, { extractRTFFromText } from "~/actions";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import MemoizedSiriWave from "~/components/memoized-siri-wave";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "~/components/ui/tooltip";

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

  const [micStatus, setMicStatus] = useState("");
  const [isMicModalOpen, setIsMicModalOpen] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [finalTranscript, setFinalTranscript] = useState("");
  const [interimTranscript, setInterimTranscript] = useState("");
  const [isEditingVoiceInput, setIsEditingVoiceInput] = useState(false);
  const [editedVoiceInput, setEditedVoiceInput] = useState("");
  const [isExtractingRTFFromTranscript, setIsExtractingRTFFromTranscript] =
    useState(false);
  const [micModalType, setMicModalType] = useState<
    "voice-assistant" | "automatic-prompt"
  >("voice-assistant");
  // const [siriWaveConfig, setSiriWaveConfig] = useState<IReactSiriwaveProps>({
  //   theme: "ios9",
  //   // ratio: 1,
  //   speed: 0.2,
  //   amplitude: 1,
  //   color: "#000",
  //   cover: false,
  //   width: 300,
  //   height: 200,
  //   autostart: true,
  //   pixelDepth: 0.01,
  //   // lerpSpeed: 0.0001,
  // });

  // const { isSpeaking, volume: volumeLevel } = useVoice({
  //   enabled: isListening,
  // });

  const recognitionRef = useRef<any>(null);

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

  const { user, isSignedIn } = useUser();

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
            value: data.task,
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
            value: data.format,
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
            value: data.task,
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
            value: data.action,
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
            value: data.goal,
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
        "The CARE prompt framework stands for Context, Action, Result, and Example—four key elements that guide the model in producing more accurate and relevant responses.",
      form: {
        elements: [
          {
            availableInFramework: ["CARE"],
            type: "textarea",
            label: "Context",
            name: "context",
            placeholder: "We are launching a new line of sustainable clothing",
            minRows: 3,
            value: data.context,
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
            value: data.action,
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
            value: data.result,
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
            value: data.example,
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
      value: data.keywords,
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
      value: data.targetAudience,
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
      value: data.programmingLanguage,
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
      value: data.projectDescription,
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
      value: data.age,
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
      value: data.weight,
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
      value: data.height,
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

  // async function requestMicPermission() {
  //   try {
  //     await navigator.mediaDevices.getUserMedia({ audio: true });
  //   } catch (error) {
  //     console.error(error);
  //   }
  // }

  function handleOnMicClick() {
    if (!isSignedIn) {
      setIsMicModalOpen(true);
      return;
    }

    setMicModalType("voice-assistant");
    setIsEditingVoiceInput(false);
    if ("SpeechRecognition" in window || "webkitSpeechRecognition" in window) {
      setIsMicModalOpen(true);
      const SpeechRecognition =
        window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();

      recognitionRef.current.lang = "en-US";
      recognitionRef.current.interimResults = true;
      recognitionRef.current.continuous = true;

      recognitionRef.current.onresult = (event: any) => {
        let interimTranscript = "";
        let finalTranscript = "";

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcript + " ";
          } else {
            interimTranscript += transcript;
          }
        }

        setFinalTranscript((prev) => prev + finalTranscript);
        setInterimTranscript(interimTranscript);
      };

      recognitionRef.current.onstart = () => {
        setMicStatus("Listening...");
      };

      recognitionRef.current.onend = () => {
        setMicStatus("Not listening");
        setIsListening(false);
      };

      recognitionRef.current.onerror = (event: any) => {
        setMicStatus(`Recognition failed`);
        setIsMicModalOpen(false);
        toast.error(event.error, {
          description: "Please make sure you granted mic permissions",
        });
        console.error(event);
      };

      startListening();
    } else {
      toast.error("Speech recognition is not supported in this browser.");
    }
  }

  function stopListening() {
    setIsListening(false);
    recognitionRef.current?.stop();
  }

  function abortListening() {
    setIsListening(false);
    recognitionRef.current?.abort();
  }

  function startListening() {
    setIsListening(true);
    recognitionRef.current?.start();
  }

  async function handleVoiceSubmission() {
    setIsExtractingRTFFromTranscript(true);

    const obj = await extractRTFFromText(finalTranscript);

    if (!obj) {
      toast.error("Failed to extract RTF from transcript");
      setIsExtractingRTFFromTranscript(false);
      return;
    }

    setIsExtractingRTFFromTranscript(false);
    setFinalTranscript("");
    setIsMicModalOpen(false);
    abortListening();

    setSelectedPromptFramework("RTF");
    resetAllStates();

    setIsUsingCustomRole(true);
    setData((prev) => ({
      ...prev,
      role: obj.role,
    }));
    setData((prev) => ({
      ...prev,
      task: obj.task,
    }));
    setData((prev) => ({
      ...prev,
      format: obj.format,
    }));
  }

  async function handleAutomaticFormSubmission() {
    setIsExtractingRTFFromTranscript(true);

    const obj = await extractRTFFromText(editedVoiceInput);

    if (!obj) {
      toast.error("Failed to extract RTF from transcript");
      setIsExtractingRTFFromTranscript(false);
      return;
    }

    setIsExtractingRTFFromTranscript(false);
    setFinalTranscript("");
    setIsMicModalOpen(false);
    abortListening();

    setSelectedPromptFramework("RTF");
    resetAllStates();

    setIsUsingCustomRole(true);
    setData((prev) => ({
      ...prev,
      role: obj.role,
    }));
    setData((prev) => ({
      ...prev,
      task: obj.task,
    }));
    setData((prev) => ({
      ...prev,
      format: obj.format,
    }));
  }

  function showAutomaticPromptModal() {
    setMicModalType("automatic-prompt");
    setFinalTranscript("");
    setIsMicModalOpen(true);
    setIsEditingVoiceInput(true);
  }

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
- take the role and say like 'Act as {role}', 'Be {role}' or you can come up with something good\n
- ignore the values that aren't defined in the prompt\n
- never give back the answer, always return a generated prompt based on user needs that user can put on gpt and get back answer from there\n
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

      if (!outputStream) {
        console.log("No output stream");
        return;
      }

      document.querySelector("#prompt-outputs")?.scrollIntoView({
        behavior: "smooth",
      });

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

  return (
    <>
      <Dialog
        open={isMicModalOpen}
        onOpenChange={(bool) => {
          if (isListening) return;
          setIsMicModalOpen(bool);
        }}
      >
        {isSignedIn && (
          <DialogContent>
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium">
                  {micModalType === "voice-assistant"
                    ? "Voice assistant"
                    : "Automatic Prompt Input"}
                </h3>
                <p className="text-sm text-foreground/80 mt-0.5">
                  {micModalType === "voice-assistant"
                    ? "Automatically fill up fields from voice transcript"
                    : "Automatically detects the field input from text. This can be useful for creating prompts that are more personalized and engaging."}{" "}
                </p>
              </div>
              {micStatus && (
                <span className="text-xs font-medium italic">
                  <span className="not-italic">status: </span>
                  {micStatus}
                </span>
              )}
            </div>
            <div className="py-3">
              <div className="w-fit mx-auto">
                <MemoizedSiriWave
                  theme="ios"
                  // speed={0.2}
                  // amplitude={isSpeaking ? 2 : 0}
                  // curveDefinition={[{}]}
                  color="#000"
                  // cover={false}
                  width={300}
                  height={100}
                  // autostart
                  // pixelDepth={0.1}
                />
              </div>
            </div>
            <div className="mt-0">
              {isEditingVoiceInput ? (
                <div>
                  <Textarea
                    className="bg-secondary p-4 rounded-lg border"
                    rows={5}
                    value={editedVoiceInput}
                    onChange={(e) => setEditedVoiceInput(e.target.value)}
                  />
                </div>
              ) : (
                <div className="bg-secondary p-4 rounded-lg border">
                  {finalTranscript.length || interimTranscript.length ? (
                    <div className="text-sm font-medium">
                      {finalTranscript}
                      <i className="text-foreground/70 font-normal">
                        {interimTranscript}
                      </i>
                    </div>
                  ) : (
                    <i className="text-foreground/70 text-sm">
                      try saying somethings..
                    </i>
                  )}
                </div>
              )}
            </div>
            <div className="mt-6 flex items-center justify-end gap-3">
              {isEditingVoiceInput ? (
                <>
                  <Button
                    className="gap-1.5"
                    variant="outline"
                    size="sm"
                    onClick={
                      micModalType === "voice-assistant"
                        ? () => setIsEditingVoiceInput(false)
                        : () => {
                            setIsMicModalOpen(false);
                            setFinalTranscript("");
                          }
                    }
                  >
                    {" "}
                    <X size={16} /> Cancel
                  </Button>
                  <Button
                    className="gap-1.5"
                    size="sm"
                    disabled={isExtractingRTFFromTranscript}
                    onClick={() => {
                      if (micModalType === "automatic-prompt") {
                        handleAutomaticFormSubmission();
                      } else {
                        setFinalTranscript(editedVoiceInput);
                        setIsEditingVoiceInput(false);
                        setMicModalType("voice-assistant");
                      }
                    }}
                  >
                    {" "}
                    {isExtractingRTFFromTranscript ? (
                      <Spinner size={16} className="animate-spin" />
                    ) : (
                      <Check size={16} />
                    )}{" "}
                    Confirm
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    disabled={isListening || isExtractingRTFFromTranscript}
                    className="gap-1.5"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setFinalTranscript("");
                    }}
                  >
                    {" "}
                    <Eraser size={16} /> Clear
                  </Button>
                  <Button
                    disabled={isListening || isExtractingRTFFromTranscript}
                    className="gap-1.5"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setEditedVoiceInput(finalTranscript);
                      setIsEditingVoiceInput(true);
                    }}
                  >
                    {" "}
                    <Pen size={16} /> Edit
                  </Button>
                  <Button
                    disabled={isExtractingRTFFromTranscript}
                    variant="outline"
                    className="gap-1.5"
                    size="sm"
                    onClick={isListening ? stopListening : startListening}
                  >
                    {isListening ? <Stop size={16} /> : <Play size={16} />}{" "}
                    {isListening ? "Stop" : "Start"}
                  </Button>
                  <Button
                    disabled={
                      isListening ||
                      !finalTranscript.length ||
                      isExtractingRTFFromTranscript
                    }
                    className="gap-1.5"
                    size="sm"
                    onClick={handleVoiceSubmission}
                  >
                    {" "}
                    {isExtractingRTFFromTranscript ? (
                      <Spinner size={16} className="animate-spin" />
                    ) : (
                      <Checks size={16} />
                    )}{" "}
                    Submit
                  </Button>
                </>
              )}
            </div>
          </DialogContent>
        )}
        {!isSignedIn && <RestrictedModalContent />}
      </Dialog>
      <div className="container max-w-7xl scroll-m-10" id="prompt-enhancer">
        <div className="grid md:grid-cols-2 gap-10 shadow-lg rounded-3xl p-8 border bg-background">
          <section>
            <div className="flex justify-between items-center">
              <h4 className="text-xl font-bold">Choose prompt Enhancer</h4>
              <div className="flex gap-2 items-center">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      size="icon"
                      variant="outline"
                      className="min-h-9 min-w-9 rounded-full"
                      onClick={showAutomaticPromptModal}
                    >
                      <StarFour size={18} />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="max-w-md">
                      Automatically detects the field input from text. This can
                      be useful for creating prompts that are more personalized
                      and engaging.
                    </p>
                  </TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      size="icon"
                      variant="outline"
                      className="min-h-9 min-w-9 rounded-full"
                      onClick={handleOnMicClick}
                    >
                      <Microphone size={18} />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Automatically fill up fields from voice transcript</p>
                  </TooltipContent>
                </Tooltip>
              </div>
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
                          checked={isUsingCustomRole}
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
                                              value={opt.value}
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
                              value={el.value}
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
                              value={el.value}
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
                                You have {freeTokens} free generations left.{" "}
                                <Link
                                  href="/pricing"
                                  className="text-blue-500 underline"
                                >
                                  Get PRO
                                </Link>
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
          <section className="h-[600px] relative" id="prompt-outputs">
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
    </>
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

function RestrictedModalContent() {
  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle>
          <h3>Restricted</h3>
        </DialogTitle>
        <DialogDescription>
          This feature requires you to sign in
        </DialogDescription>
      </DialogHeader>
      <div className="flex flex-col items-center justify-center mt-10">
        <div>
          <img src="/restricted.png" className="w-full h-auto" alt="" />
        </div>
        <SignInButton>
          <Button
            className="rounded-lg gap-2 text-[17px] items-center mt-6"
            size="lg"
          >
            <User size={18} /> SIGN UP
          </Button>
        </SignInButton>
      </div>
    </DialogContent>
  );
}

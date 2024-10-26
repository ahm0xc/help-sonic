"use client";

import { parseAsInteger, useQueryState } from "nuqs";

import { Input } from "~/components/ui/input";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import type { Data } from "./page";
import { Badge } from "~/components/ui/badge";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Clipboard,
  X,
} from "@phosphor-icons/react";
import { cn } from "~/lib/utils";
import { useRef, useState } from "react";
import { Button } from "~/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "~/components/ui/tooltip";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/components/ui/dialog";
import { CopyIcon, Expand, ExpandIcon, Maximize2Icon } from "lucide-react";
import { ScrollArea } from "~/components/ui/scroll-area";

export const PROMPT_PER_PAGE = 10;

export default function Explorer({
  prompts,
  topics,
  activities,
}: {
  prompts: Data[];
  topics: string[];
  activities: string[];
}) {
  const containerRef = useRef<HTMLDivElement>(null);

  const [searchQuery, setSearchQuery] = useQueryState("q", {
    defaultValue: "",
    throttleMs: 300,
  });
  const [topic, setTopic] = useQueryState("topic", {
    defaultValue: "",
  });
  const [activity, setActivity] = useQueryState("activity", {
    defaultValue: "",
  });
  const [page, setPage] = useQueryState("page", parseAsInteger.withDefault(0));

  function nextPage() {
    containerRef.current?.scrollIntoView({
      behavior: "smooth",
    });
    setPage((p) => p + 1);
  }
  function prevPage() {
    containerRef.current?.scrollIntoView({
      behavior: "smooth",
    });
    setPage((p) => p - 1);
  }

  function clearFilters() {
    setPage(null);
    setTopic(null);
    setActivity(null);
    setSearchQuery(null);
  }

  const offset = page * PROMPT_PER_PAGE;

  const filteredPrompts = prompts
    .filter((p) => {
      if (!topic) return true;
      if (topic == "all") return true;
      return p.topic.includes(topic);
    })
    .filter((p) => {
      if (!activity) return true;
      if (activity == "all") return true;
      return p.activity.includes(activity);
    })
    .filter((p) => {
      return p.title.toLowerCase().includes(searchQuery.toLowerCase());
    });

  const promptsInCurrentPage = filteredPrompts.slice(
    offset,
    offset + PROMPT_PER_PAGE,
  );

  const hasNextPage = filteredPrompts.length - offset > PROMPT_PER_PAGE;
  const hasPreviousPage = offset > 0;
  const totalPage = Math.floor(filteredPrompts.length / PROMPT_PER_PAGE);

  return (
    <div ref={containerRef} id="explorer" className="scroll-my-10">
      <section>
        <div className="px-2 rounded-2xl h-16 bg-secondary border">
          <div className="flex items-center justify-between h-full">
            <div>
              <Input
                className="w-full min-w-full md:w-[300px] rounded-xl h-11"
                placeholder="Search prompts.."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setPage(0);
                }}
              />
            </div>
            <div className="flex items-center gap-3">
              <Select
                value={topic}
                onValueChange={(v) => {
                  setPage(0);
                  setTopic(v);
                }}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Select a Topic" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectItem value="all">All</SelectItem>
                    {topics.map((t) => (
                      <SelectItem value={t} key={`topic-filter-${t}`}>
                        {t}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
              <Select
                value={activity}
                onValueChange={(v) => {
                  setPage(0);
                  setActivity(v);
                }}
              >
                <SelectTrigger className="w-[280px]">
                  <SelectValue placeholder="Select a Activity" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectItem value="all">All</SelectItem>
                    {activities.map((a) => (
                      <SelectItem value={a} key={`activity-filter-${a}`}>
                        {a}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
              {(topic || activity || searchQuery) && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="outline"
                        className="rounded-full"
                        size="icon"
                        onClick={clearFilters}
                      >
                        <X className="size-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>clear filters</TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
            </div>
          </div>
        </div>
      </section>
      <section className="mt-10">
        <div className="grid grid-cols-2 gap-6">
          {promptsInCurrentPage.map((prompt) => {
            const topicArr = prompt.topic.split("-");
            topicArr.pop();
            const topic = topicArr.join(" ");
            const activity = prompt.activity;

            return (
              <div
                key={`prompt-${prompt.title}`}
                className="w-full p-6 rounded-2xl border bg-gradient-to-br from-secondary/80 to-secondary/40 relative"
              >
                <div className="flex items-center gap-2 absolute top-4 right-4">
                  <CopyButton text={prompt.prompt} />
                  <ExpandPromptButton prompt={prompt.prompt} />
                </div>
                <p className="text-lg">{prompt.title}</p>
                <p className="mt-1 text-xs text-foreground/60 capitalize">
                  {activity}/{topic}
                </p>
                {prompt.models.length ? (
                  <div className="flex flex-wrap gap-2 mt-1.5">
                    {prompt.models.slice(0, 4).map((model) => (
                      <Badge
                        key={`prompt-${prompt.title}/model-${model}`}
                        className="capitalize bg-blue-200 hover:bg-blue-200 text-blue-800"
                      >
                        {model}
                      </Badge>
                    ))}
                  </div>
                ) : null}
                <p className="mt-2.5 text-sm text-foreground/70 line-clamp-4">
                  {prompt.prompt_preview}..
                </p>
              </div>
            );
          })}
        </div>
      </section>
      <section className="my-6 flex justify-between items-center">
        <p className="text-sm text-foreground/80">
          Page {page + 1} of {totalPage + 1}
        </p>
        <div className="flex items-center justify-end gap-4">
          <Button
            onClick={prevPage}
            variant="outline"
            className="gap-2"
            disabled={!hasPreviousPage}
          >
            <ArrowLeft className="size-4" />
            Prev
          </Button>
          <Button
            onClick={nextPage}
            variant="outline"
            className="gap-2"
            disabled={!hasNextPage}
          >
            Next
            <ArrowRight className="size-4" />
          </Button>
        </div>
      </section>
    </div>
  );
}

function ExpandPromptButton({
  prompt,
  className,
}: {
  prompt: string;
  className?: string;
}) {
  const [copied, setCopied] = useState(false);

  const Icon = copied ? Check : CopyIcon;

  return (
    <Dialog>
      <DialogTrigger>
        <button
          type="button"
          className={cn(
            "text-xs gap-1 py-0.5 px-1 rounded-sm hover:bg-neutral-200/80 duration-200 flex items-center justify-center",
            className,
          )}
        >
          <Maximize2Icon className="size-3" />
        </button>
      </DialogTrigger>
      <DialogContent hasCloseButton className="max-w-xl">
        <DialogHeader>
          <DialogTitle>Prompt Preview</DialogTitle>
        </DialogHeader>
        <ScrollArea className="mt-4 h-[500px]">
          <p className="whitespace-pre-line">{prompt}</p>
        </ScrollArea>
        <DialogFooter>
          <DialogClose>
            <Button variant="outline">Close</Button>
          </DialogClose>
          <Button
            className="gap-2 items-center"
            onClick={() => {
              navigator.clipboard.writeText(prompt);
              setCopied(true);

              setTimeout(() => setCopied(false), 2000);
            }}
          >
            <Icon className="size-3" />
            <p>{copied ? "Copied" : "Copy"}</p>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function CopyButton({ text, className }: { text: string; className?: string }) {
  const [copied, setCopied] = useState(false);

  const Icon = copied ? Check : Clipboard;
  return (
    <button
      type="button"
      onClick={() => {
        navigator.clipboard.writeText(text);
        setCopied(true);

        setTimeout(() => setCopied(false), 2000);
      }}
      className={cn(
        "text-[10px] gap-1 py-0.5 px-1 rounded-sm hover:bg-neutral-200/80 duration-200 flex items-center justify-center",
        className,
      )}
    >
      <Icon className="size-3" />
      {/* <p>{copied ? "Copied" : "Copy prompt"}</p> */}
    </button>
  );
}

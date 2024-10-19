import React from "react";
import { ArrowDown } from "@phosphor-icons/react/dist/ssr";

import data from "~/../prompt-hub/dx.json";

import Footer from "~/app/(landing)/_components/footer";
import Header from "~/app/(landing)/_components/header";
import { Button } from "~/components/ui/button";
import Explorer from "./explorer";

export type Data = {
  models: string[];
  title: string;
  prompt: string;
  prompt_hint: string;
  prompt_preview: string;
  topic: string;
  activity: string;
};

export default function PromptHub() {
  const topics: string[] = [];
  const activities: string[] = [];

  (data as Data[]).forEach((prompt) => {
    const topicArr = prompt.topic.split("-");
    topicArr.pop();
    const topic = topicArr.join(" ");

    if (!topics.includes(topic)) {
      topics.push(topic);
    }

    const activity = prompt.activity;

    if (!activities.includes(activity)) {
      activities.push(activity);
    }
  });
  topics.sort();
  activities.sort();

  return (
    <div>
      <Header />
      <main className="min-h-screen max-w-[1340px] px-4 md:px-8 mx-auto">
        <div>
          <h1 className="text-6xl font-bold mt-24">
            Discover the best AI <br /> prompts with Helpsonic.
          </h1>
          <p className="text-lg mt-2 text-foreground.80">
            The most useful AI prompts — organized and categorized in one spot.
          </p>
          <div className="mt-6 flex items-center">
            <Button
              size="lg"
              className="items-center gap-2 text-lg h-12 rounded-xl px-5"
            >
              Explore <ArrowDown className="size-5" />
            </Button>
          </div>
        </div>
        <div className="mt-20">
          <Explorer
            prompts={data as Data[]}
            topics={topics}
            activities={activities}
          />
        </div>
      </main>
      <Footer />
    </div>
  );
}

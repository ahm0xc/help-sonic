import React from "react";
import { get } from "@vercel/edge-config";

import Header from "./_components/header";
import Hero from "./_components/hero";
import PromptEnhancerV2 from "./_components/prompt-enhancer-v2";
import Footer from "./_components/footer";

const HomePage: React.FC = async () => {
  const tutorialVideoId = (await get("tutorial_video_id")) as
    | string
    | undefined;

  return (
    <div className="relative">
      <div className="absolute inset-0 -z-10 h-full w-full bg-background bg-[linear-gradient(to_right,#f0f0f0_1px,transparent_1px),linear-gradient(to_bottom,#f0f0f0_1px,transparent_1px)] bg-[size:6rem_4rem]" />
      <Header />
      <Hero />
      <div className="pb-28">
        <PromptEnhancerV2 tutorialVideoId={tutorialVideoId} />
      </div>
      <Footer />
    </div>
  );
};

export default HomePage;

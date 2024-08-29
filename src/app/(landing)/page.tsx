import React from "react";

import Header from "./_components/header";
import Hero from "./_components/hero";
import PromptEnhancer from "./_components/prompt-enhancer";

const HomePage: React.FC = () => {
  return (
    <div className="relative">
      <div className="absolute inset-0 -z-10 h-full w-full bg-background bg-[linear-gradient(to_right,#f0f0f0_1px,transparent_1px),linear-gradient(to_bottom,#f0f0f0_1px,transparent_1px)] bg-[size:6rem_4rem]" />
      <Header />
      <Hero />
      <div className="pb-28">
        <PromptEnhancer />
      </div>
    </div>
  );
};

export default HomePage;

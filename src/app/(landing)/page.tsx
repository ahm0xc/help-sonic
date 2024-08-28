import React from "react";

import Header from "./_components/header";
import Hero from "./_components/hero";
import PromptEnhancer from "./_components/prompt-enhancer";

const HomePage: React.FC = () => {
  return (
    <div>
      <Header />
      <Hero />
      <div className="pb-28">
        <PromptEnhancer />
      </div>
    </div>
  );
};

export default HomePage;

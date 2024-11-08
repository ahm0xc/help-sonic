import Marquee from "react-fast-marquee";

const AI_LOGOS = [
  "anthropic",
  "gemeni",
  "groq",
  "meta-ai",
  "mistral",
  "openai",
  "x-ai",
];

export default function Hero() {
  return (
    <div className="container mx-auto px-4 py-28 pb-20">
      <div className="text-center mb-8">
        <div className="text-sm px-3 py-2 rounded-full bg-secondary max-w-fit mx-auto mb-4">
          Never think about prompt again!
        </div>
        <h2 className="text-4xl md:text-5xl font-bold mb-4">
          Answer a Few Questions to <br className="hidden md:block" />
          Get Your <br className="block md:hidden" />
          <span className="bg-gradient-to-r from-blue-600 to-purple-600 text-transparent bg-clip-text">
            Perfect Prompt!
          </span>
        </h2>
        <p className="text-gray-600 mb-4 text-sm">Works on 20+ AI bots</p>
        <Marquee
          className="max-w-xl mx-auto mt-10"
          gradientColor="white"
          gradient
          gradientWidth={100}
        >
          {[...AI_LOGOS, ...AI_LOGOS].map((logo, idx) => (
            <img
              key={`logo-cloud//${logo}-${idx}`}
              src={`/${logo}-logo.png`}
              alt={logo}
              className="h-6 mx-6"
            />
          ))}
        </Marquee>
      </div>
    </div>
  );
}

export default function Hero() {
  return (
    <div className="container mx-auto px-4 py-28 pb-20">
      <div className="text-center mb-8">
        <div className="text-sm px-3 py-2 rounded-full bg-secondary max-w-fit mx-auto mb-4">
          Never think about prompt again!
        </div>
        <h2 className="text-5xl font-bold mb-4">
          Answer a Few Questions to
          <br />
          Get Your{" "}
          <span className="bg-gradient-to-r from-blue-600 to-purple-600 text-transparent bg-clip-text">
            Perfect Prompt!
          </span>
        </h2>
        <p className="text-gray-600 mb-4">Works on 20+ AI bots</p>
        <div className="flex justify-center space-x-4 items-center">
          {["openai", "groq", "bard"].map((platform) => (
            <img
              key={platform}
              src={`/${platform.toLowerCase()}-logo.png`}
              alt={platform}
              className="h-6"
            />
          ))}
        </div>
      </div>
    </div>
  );
}

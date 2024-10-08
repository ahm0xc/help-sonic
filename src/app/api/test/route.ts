import { extractRTFFromText } from "~/actions";

export async function GET() {
  const text =
    "Build me an app that reminds me of my to-do tasks, and I can mark them complete.";
  const data = await extractRTFFromText(text);

  return new Response(JSON.stringify({ text, ...data }));
}

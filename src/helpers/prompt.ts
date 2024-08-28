export function formatRTFPrompt(
  prompt: string,
  { role, task, format }: { role: string; task: string; format: string },
) {
  return prompt
    .replace("{{role}}", role)
    .replace("{{task}}", task)
    .replace("{{format}}", format);
}

export function formatTAGPrompt(
  prompt: string,
  { task, action, goal }: { task: string; action: string; goal: string },
) {
  return prompt
    .replace("{{task}}", task)
    .replace("{{action}}", action)
    .replace("{{goal}}", goal);
}

export function formatBABPrompt(
  prompt: string,
  { before, after, bridge }: { before: string; after: string; bridge: string },
) {
  return prompt
    .replace("{{before}}", before)
    .replace("{{after}}", after)
    .replace("{{bridge}}", bridge);
}

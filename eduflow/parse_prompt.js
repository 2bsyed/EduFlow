const fs = require('fs');
const lines = fs.readFileSync("/Users/syed/.gemini/antigravity/brain/4ae289c3-5d58-4712-9a36-1d5f9f66a294/.system_generated/logs/transcript_full.jsonl", "utf8").trim().split("\n");
for (let i = lines.length - 1; i >= 0; i--) {
  try {
    const l = JSON.parse(lines[i]);
    if (l.type === "USER_INPUT") {
      console.log(l.content);
      break;
    }
  } catch (e) {}
}

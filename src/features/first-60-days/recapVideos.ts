// Chapter times for each recap day video, from ~/Movies/recaps/_kit (day{n}.json at render time).
// They belong to one exact video file: change them in the same commit as the video they describe.
import type { RecapChapter } from "@/components/first-60-days/RecapVideo";

export const RECAP_CHAPTERS: Record<string, RecapChapter[]> = {
  "recap-w1-d1": [
    ["Why this career", 0],
    ["Every life is worth planning for", 149],
    ["Our values", 245],
    ["Reconnect with your friends", 344],
    ["Protection first", 468],
    ["The close is only the start", 508],
  ],
  "recap-w1-d2": [
    ["The one-third rule", 0],
    ["Temporary vs permanent risk", 111],
    ["Three ways to manage risk", 167],
    ["How much cover is enough", 265],
    ["When to buy", 380],
    ["The financial planning pyramid", 576],
  ],
  "recap-w1-d3": [
    ["Autonomy, with responsibility", 0],
    ["Personal development", 109],
    ["Job security and passive income", 146],
    ["Lifetime value of a client", 421],
    ["Fulfilment", 497],
    ["The year-1 trap", 601],
  ],
  "recap-w1-d4": [
    ["The two mindsets", 0],
    ["Add the word yet", 52],
    ["Sales is a marathon", 106],
    ["The obstacle is the way", 234],
    ["Do what others won't", 369],
    ["Step out of your comfort zone", 451],
  ],
  "recap-w1-d5": [
    ["Why this career matters", 0],
    ["Come back to your why", 68],
    ["Pre-frame with your why", 154],
    ["The underdog advantage", 192],
    ["Who your friends buy from", 299],
    ["The moral compass", 449],
  ],
  "recap-w1-d6": [
    ["Why 1% a day beats heroics", 0],
    ["Systems beat goals", 53],
    ["The habit loop", 81],
    ["Identity-based habits", 164],
    ["Success habits: ASK", 247],
    ["Week 1 wrap-up", 451],
  ],
};

// Chapter times for each recap day video, from ~/Movies/recaps/_kit (day{n}.json at render time).
// They belong to one exact video file: change them in the same commit as the video they describe.
import type { RecapChapter } from "@/components/first-60-days/RecapVideo";

export const RECAP_CHAPTERS: Record<string, RecapChapter[]> = {
  "recap-w1-d1": [
    ["Why this career", 0],
    ["Every life is worth planning for", 140],
    ["Our values", 224],
    ["Reconnect with your friends", 313],
    ["Protection first", 427],
    ["The close is only the start", 463],
  ],
  "recap-w1-d2": [
    ["The one-third rule", 0],
    ["Temporary vs permanent risk", 107],
    ["Three ways to manage risk", 158],
    ["How much cover is enough", 247],
    ["When to buy", 351],
    ["The financial planning pyramid", 525],
  ],
  "recap-w1-d3": [
    ["Autonomy, with responsibility", 0],
    ["Personal development", 103],
    ["Job security and passive income", 136],
    ["Lifetime value of a client", 386],
    ["Fulfilment", 456],
    ["The year-1 trap", 550],
  ],
  "recap-w1-d4": [
    ["The two mindsets", 0],
    ["Add the word yet", 55],
    ["Sales is a marathon", 103],
    ["The obstacle is the way", 220],
    ["Do what others won't", 341],
    ["Step out of your comfort zone", 409],
  ],
  "recap-w1-d5": [
    ["Why this career matters", 0],
    ["Come back to your why", 67],
    ["Pre-frame with your why", 145],
    ["The underdog advantage", 180],
    ["Who your friends buy from", 277],
    ["The moral compass", 412],
  ],
  "recap-w1-d6": [
    ["Why 1% a day beats heroics", 0],
    ["Systems beat goals", 52],
    ["The habit loop", 77],
    ["Identity-based habits", 152],
    ["Success habits: ASK", 228],
    ["Week 1 wrap-up", 411],
  ],
};

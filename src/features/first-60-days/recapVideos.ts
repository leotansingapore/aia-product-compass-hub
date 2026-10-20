// Chapter times for each recap day video, from ~/Movies/recaps/_kit (day{n}.json at render time).
// They belong to one exact video file: change them in the same commit as the video they describe.
import type { RecapChapter } from "@/components/first-60-days/RecapVideo";

export const RECAP_CHAPTERS: Record<string, RecapChapter[]> = {
  "recap-w1-d1": [
    ["Why this career", 0],
    ["Every life is worth planning for", 137],
    ["Our values", 221],
    ["Reconnect with your friends", 311],
    ["Protection first", 424],
    ["The close is only the start", 460],
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
    ["Lifetime value of a client", 383],
    ["Fulfilment", 453],
    ["The year-1 trap", 547],
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
    ["Come back to your why", 66],
    ["Pre-frame with your why", 144],
    ["The underdog advantage", 179],
    ["Who your friends buy from", 276],
    ["The moral compass", 411],
  ],
  "recap-w1-d6": [
    ["Why 1% a day beats heroics", 0],
    ["Systems beat goals", 50],
    ["The habit loop", 76],
    ["Identity-based habits", 151],
    ["Success habits: ASK", 226],
    ["Week 1 wrap-up", 408],
  ],
  "recap-w2-d8": [
    ["Income that compounds", 0],
    ["Five factors of an ideal career", 46],
    ["Why year three matters", 95],
    ["What income guarantees really are", 150],
    ["Building your infrastructure", 237],
    ["Big rocks first", 293],
    ["Impact no one talks about", 349],
  ],
  "recap-w2-d10": [
    ["The formula for freedom", 0],
    ["Calculating a freedom number", 55],
    ["The pyramid and the income gap", 201],
    ["The client conversation frame", 302],
    ["Pay long-term first", 404],
  ],
};

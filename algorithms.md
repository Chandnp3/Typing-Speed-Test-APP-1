# Typing Speed Test Application — Core Algorithms

This document describes all algorithms used in the typing speed test application, what they are, and how they work.

---

## Words Per Minute (WPM)
* **What it is:** A metric to calculate the user's net typing speed using a standardized word size of 5 characters.
* **How it works:** Divides the total number of *correctly* typed characters by 5 (a "standard word"), then divides by the elapsed time in minutes.
* **Formula:** `WPM = (correctChars / 5) / elapsedMinutes`

---

## Raw Words Per Minute (Raw WPM)
* **What it is:** A metric for the user's raw motor speed, including mistakes.
* **How it works:** Divides *all* keystrokes (correct and incorrect) by 5 to get raw word count, then divides by elapsed minutes.
* **Formula:** `RawWPM = (totalKeystrokes / 5) / elapsedMinutes`

---

## Accuracy Percentage
* **What it is:** The percentage of correct keystrokes out of all keystrokes.
* **How it works:** Divides correctly typed characters by total keystrokes and multiplies by 100.
* **Formula:** `Accuracy = (correct / total) × 100`

---

## Burst WPM (Sliding Window Peak Speed)
* **What it is:** The peak WPM achieved in any 3-second window during the test. Measures the user's maximum short-burst typing speed, analogous to a sprint metric.
* **How it works:** For every timeline entry, the algorithm looks back up to 3 seconds in the timeline, computes the average WPM across that window, and tracks the maximum value found across all windows.
* **Why it matters:** Net WPM can be dragged down by slow periods. Burst WPM isolates your fastest streak.

---

## Consistency Score
* **What it is:** A 0–100% score measuring how stable the user's typing speed was throughout the test. A score of 100 means perfectly even speed; lower scores indicate erratic pacing.
* **How it works:**
  1. Collect all per-second WPM samples from the timeline.
  2. Compute the **coefficient of variation (CV)** = standard deviation / mean of those samples.
  3. Map CV to a score: `consistency = clamp((1 - CV) × 100, 0, 100)`.
* **Interpretation:** A CV of 0 (all samples equal) → 100%; a CV of 1 (huge spread) → 0%.

---

## Fisher-Yates Shuffle
* **What it is:** An algorithm to randomly rearrange an array in-place with uniform distribution, ensuring every permutation is equally likely.
* **How it works:** Iterates backward from the last element, swapping the current element with a randomly chosen element from the remaining unshuffled portion.
* **Use:** Applied on first-cycle word generation to guarantee every word is seen before repetition begins.

---

## Weighted Adaptive Word Pool
* **What it is:** A dynamic word-selection strategy that makes words you struggle with appear more frequently, adapting the test to your weaknesses.
* **How it works:**
  1. Every word starts with a **weight of 1.0**.
  2. When a word is completed with **any errors**, its weight increases by `+0.5` (max cap: 5.0).
  3. When a word is completed **perfectly**, its weight decreases by `−0.1` (floor: 0.5).
  4. Word selection uses **weighted random sampling** via a cumulative weight array and binary search.
* **First cycle:** Uses the classic Fisher-Yates shuffle buffer to ensure all words are seen once. Weighted selection activates from the second cycle onward.

---

## Weighted Random Selection (Cumulative Array + Binary Search)
* **What it is:** An O(log n) algorithm to pick a random item from a list where each item has a different probability weight.
* **How it works:**
  1. Build a cumulative weight array in a single O(n) pass.
  2. Generate a random float r ∈ [0, totalWeight).
  3. Binary-search the cumulative array to find the smallest index where `cumulative[i] >= r`.
* **Result:** Words with higher weights are proportionally more likely to be selected.

---

## Per-Word Accuracy Tracking
* **What it is:** A running count of the number of keystroke errors made on each individual word during a test.
* **How it works:** On every incorrect keystroke, `wordErrors[currentWord]` is incremented. On word completion, the error count is used to update the adaptive weight and to compute problem words.

---

## Per-Word Timing
* **What it is:** A record of how many milliseconds it took the user to complete each word (from first keystroke to space press).
* **How it works:** `wordStartTime` is set to `performance.now()` when a word begins. When space is pressed to advance, the elapsed ms is appended to the `wordTimes` array.

---

## Average Word Time
* **What it is:** The mean milliseconds spent per word across the whole test.
* **How it works:** Uses array reduction to sum all values in `wordTimes` and divides by the count.

---

## Problem Words
* **What it is:** The top-5 words that received the most errors during a test session.
* **How it works:** Converts the `wordErrors` map to a sorted list (descending by error count) and slices the first 5 entries.

---

## Extended Timeline Recording
* **What it is:** A per-second snapshot of all key metrics during typing (not just WPM).
* **How it works:** The `tick()` function (called every 250ms) appends one entry per elapsed second to the timeline array, containing: `{ second, wpm, raw, accuracy, errors }`. This enables multi-series chart rendering.

---

## Canvas Coordinate Scaling & Projection
* **What it is:** An algorithm to map raw timeline data (elapsed seconds and WPM) onto pixel dimensions of an HTML5 `<canvas>` element.
* **How it works:** Finds the maximum values for both axes, then maps any data point to canvas pixel coordinates by computing the ratio of the current value to the max and projecting across the drawable width/height.

---

## Stats Accumulation
* **What it is:** A utility to generate lifetime metrics (bests, averages) from local JSON user history logs.
* **How it works:** Uses array reduction to iterate through all logged scores, extracting the maximum WPM and calculating averages for accuracy and speed across the full history.

---

## SQL Dynamic Ranking
* **What it is:** A query algorithm to retrieve the exact global rank of a specific user among all leaderboard entries.
* **How it works:** Aggregates the best score per user via grouping, counts how many users have a best WPM strictly greater than the target user's best, and adds 1 to produce the rank.

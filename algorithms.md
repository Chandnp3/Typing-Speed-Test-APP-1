# Typing Speed Test Application - Core Algorithms

This document lists the main algorithms used in the typing speed test application, what they are, and how they work.

---

## Words Per Minute (WPM)
* **What it is:** A metric to calculate the user's typing speed using a standardized word size of 5 characters.
* **How it works:** It divides the total number of correctly typed characters by 5 to determine the standard words typed, and then divides that number by the elapsed time in minutes.

---

## Raw Words Per Minute (Raw WPM)
* **What it is:** A metric to calculate the raw motor speed of the user's typing, including any mistakes they made.
* **How it works:** It divides the total keystrokes (correct and incorrect) by 5 to determine raw words, and then divides by the elapsed time in minutes.

---

## Accuracy Percentage
* **What it is:** A metric that measures the percentage of correct keystrokes out of the user's total keystrokes.
* **How it works:** It divides the count of correctly typed characters by the total keystrokes recorded during the test, then multiplies the result by 100.

---

## Fisher-Yates Shuffle
* **What it is:** An algorithm to randomly rearrange the array of words in-place with a uniform distribution, making sure every possible order is equally likely.
* **How it works:** It iterates through the word list backward from the last element, swapping the current element with another randomly chosen element from the remaining unshuffled portion of the array.

---

## Shuffle Buffering and De-duplication Pool
* **What it is:** A strategy to prevent word repetition during typing tests.
* **How it works:** It maintains a pre-shuffled pool of words and serves them one by one. When all words in the pool have been served, it automatically reshuffles the entire array of words to start a fresh cycle.

---

## Canvas Coordinate Scaling & Projection
* **What it is:** An algorithm to map raw typing test data (elapsed seconds and real-time WPM) onto the pixel dimensions of a custom HTML5 `<canvas>` element.
* **How it works:** It finds the maximum values for both duration and speed in the timeline data, then maps any data point to canvas coordinates by calculating the ratio of the current point relative to the maximums and projecting it across the printable width and height of the chart area.

---

## Stats Accumulation
* **What it is:** A utility algorithm to generate lifetime metrics (bests, averages) from local JSON user history logs.
* **How it works:** It uses array reduction methods to iterate through all logged scores, extracting the maximum WPM value and calculating average figures for accuracy and speed across the entire set.

---

## SQL Dynamic Ranking
* **What it is:** A query algorithm to retrieve the exact ranking of a specific user against all other entries in the database.
* **How it works:** It aggregates the best scores per user using grouping, counts how many other users have a best WPM strictly greater than the target user's best WPM, and adds 1 to that count to compute the rank.

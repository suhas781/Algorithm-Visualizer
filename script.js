let speed = 200;
let array = [];
let paused = false;
let stopped = false;

const speedSlider = document.getElementById("speedRange");
const speedValue = document.getElementById("speedValue");
const statusDiv = document.getElementById("status");
const arrayContainer = document.getElementById("array-container");

// === Theme Toggle ===
document.getElementById("theme-toggle").addEventListener("click", () => {
  document.body.classList.toggle("light-mode");
});

// === Speed Slider ===
speedSlider.addEventListener("input", e => {
  speed = 1000 - e.target.value;
  speedValue.textContent = `${speed}ms`;
});

// === Utility Functions ===
function sleep(ms) {
  return new Promise(resolve => {
    const wait = () => {
      if (!paused) resolve();
      else setTimeout(wait, 100);
    };
    setTimeout(wait, ms);
  });
}

function updateStatus(text, color = "lime") {
  statusDiv.textContent = `Status: ${text}`;
  statusDiv.style.color = color;
}

function updateExplanation(text) {
  document.getElementById("explanation").innerText = text;
}

function renderArray(arr, highlight = [], sorted = []) {
  arrayContainer.innerHTML = "";
  arr.forEach((val, i) => {
    const bar = document.createElement("div");
    bar.className = "bar";
    bar.style.height = `${val * 3}px`;

    if (highlight.includes(i)) bar.classList.add("compare");
    if (sorted.includes(i)) bar.style.backgroundColor = "limegreen";

    arrayContainer.appendChild(bar);
  });
}

// === Main Array Handling ===
function generateArray(size = 30) {
  array = Array.from({ length: size }, () => Math.floor(Math.random() * 100));
  renderArray(array);
  updateStatus("Ready");
}

function parseCustomArray() {
  const input = document.getElementById("customArray").value.trim();
  if (input.length === 0) {
    generateArray(); return;
  }
  try {
    array = input.split(',').map(Number);
    if (array.some(isNaN)) throw Error();
    renderArray(array);
    updateStatus("Custom Array Loaded");
  } catch {
    alert("Invalid input. Please enter numbers separated by commas.");
    generateArray();
  }
}

// === Control Buttons ===
function startVisualization() {
  stopped = false;
  paused = false;
  updateStatus("Running...", "orange");
  parseCustomArray();

  const algo = document.getElementById("algorithmSelect").value;
  switch (algo) {
    case "bubble": bubbleSort(array); break;
    case "insertion": insertionSort(array); break;
    case "merge": mergeSort(array); break;
    case "quick": quickSort(array); break;
    case "bfs": bfs(); break;
    case "dfs": dfs(); break;
  }
}

function pauseVisualization() {
  paused = true;
  updateStatus("Paused", "gold");
}

function resumeVisualization() {
  if (paused) {
    paused = false;
    updateStatus("Resumed", "orange");
  }
}

function resetVisualization() {
  stopped = true;
  paused = false;
  generateArray();
  updateStatus("Reset to Default");
}

// === Sorting Algorithms ===

async function bubbleSort(arr) {
  updateExplanation("Bubble Sort: Repeatedly swap adjacent elements if they're in the wrong order.");
  let n = arr.length;
  for (let i = 0; i < n - 1; i++) {
    for (let j = 0; j < n - i - 1; j++) {
      if (stopped) return;
      renderArray(arr, [j, j + 1]);
      await sleep(speed);
      if (arr[j] > arr[j + 1]) {
        [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]];
        updateStatus(`Swapped ${arr[j]} and ${arr[j + 1]}`, "orange");
      } else {
        updateStatus(`Compared ${arr[j]} and ${arr[j + 1]}`, "gray");
      }
    }
  }
  renderArray(arr, [], [...Array(n).keys()]);
  updateStatus("Completed ✅", "lime");
}

async function insertionSort(arr) {
  updateExplanation("Insertion Sort: Insert elements into their correct sorted position.");
  for (let i = 1; i < arr.length; i++) {
    let key = arr[i], j = i - 1;
    while (j >= 0 && arr[j] > key) {
      if (stopped) return;
      arr[j + 1] = arr[j];
      renderArray(arr, [j, j + 1]);
      updateStatus(`Moving ${arr[j]} forward`, "orange");
      await sleep(speed);
      j--;
    }
    arr[j + 1] = key;
  }
  renderArray(arr, [], [...Array(arr.length).keys()]);
  updateStatus("Completed ✅", "lime");
}

async function mergeSort(arr) {
  updateExplanation("Merge Sort: Recursively divide, then merge sorted halves.");
  await mergeSortHelper(arr, 0, arr.length - 1);
  updateStatus("Completed ✅", "lime");
}

async function mergeSortHelper(arr, l, r) {
  if (l >= r || stopped) return;
  const mid = Math.floor((l + r) / 2);
  await mergeSortHelper(arr, l, mid);
  await mergeSortHelper(arr, mid + 1, r);
  await merge(arr, l, mid, r);
  renderArray(arr);
}

async function merge(arr, l, m, r) {
  let left = arr.slice(l, m + 1);
  let right = arr.slice(m + 1, r + 1);
  let i = 0, j = 0, k = l;
  while (i < left.length && j < right.length) {
    if (stopped) return;
    arr[k++] = (left[i] <= right[j]) ? left[i++] : right[j++];
    renderArray(arr, [k - 1]);
    await sleep(speed);
  }
  while (i < left.length) arr[k++] = left[i++];
  while (j < right.length) arr[k++] = right[j++];
}

async function quickSort(arr) {
  updateExplanation("Quick Sort: Choose pivot, partition, and sort recursively.");
  await quickSortHelper(arr, 0, arr.length - 1);
  updateStatus("Completed ✅", "lime");
}

async function quickSortHelper(arr, low, high) {
  if (low < high && !stopped) {
    let pi = await partition(arr, low, high);
    await quickSortHelper(arr, low, pi - 1);
    await quickSortHelper(arr, pi + 1, high);
  }
}

async function partition(arr, low, high) {
  let pivot = arr[high], i = low;
  for (let j = low; j < high; j++) {
    if (stopped) return;
    renderArray(arr, [j, high]);
    await sleep(speed);
    if (arr[j] < pivot) {
      [arr[i], arr[j]] = [arr[j], arr[i]];
      i++;
    }
  }
  [arr[i], arr[high]] = [arr[high], arr[i]];
  return i;
}

// === BFS / DFS (Mocked) ===
async function bfs() {
  updateExplanation("Breadth-First Search: Visit nodes level-by-level.");
  let queue = [0], visited = Array(10).fill(false);
  while (queue.length && !stopped) {
    let node = queue.shift();
    if (visited[node]) continue;
    visited[node] = true;
    renderArray(createArray(10), [node]);
    updateStatus(`Visited node ${node}`);
    await sleep(speed);
    queue.push(...[node + 1, node + 2].filter(n => n < 10 && !visited[n]));
  }
  updateStatus("BFS Complete ✅");
}

async function dfs() {
  updateExplanation("Depth-First Search: Visit nodes deeply before backtracking.");
  let stack = [0], visited = Array(10).fill(false);
  while (stack.length && !stopped) {
    let node = stack.pop();
    if (visited[node]) continue;
    visited[node] = true;
    renderArray(createArray(10), [node]);
    updateStatus(`Visited node ${node}`);
    await sleep(speed);
    stack.push(...[node + 2, node + 1].filter(n => n < 10 && !visited[n]));
  }
  updateStatus("DFS Complete ✅");
}

// === Init on load ===
generateArray();

let MY_HANDLE = null;






async function getUserSubmissions(handle) {
  const r = await fetch("https://codeforces.com/api/user.status?handle=" + handle)
  const d = await r.json()
  return d.result
}

async function mistakeAnalyzer(handle) {
  const submissions = await getUserSubmissions(handle)
  const wrongAnswers = submissions.filter(s => s.verdict === "WRONG_ANSWER")
  const tagMistakes = {}
  wrongAnswers.forEach(s => {
    s.problem.tags.forEach(tag => {
      if (tagMistakes[tag]) tagMistakes[tag]++
      else tagMistakes[tag] = 1
    })
  })
  const sorted = Object.entries(tagMistakes).sort((a, b) => b[1] - a[1])
  console.log("Your most mistaken tags:")
  sorted.forEach(([tag, count]) => {
    console.log(tag + " → " + count + " wrong answers")
  })
}

async function getSolvedProblems(handle) {
  const submissions = await getUserSubmissions(handle)
  const solved = submissions.filter(s => s.verdict === "OK")
  const solvedSet = new Set()
  solved.forEach(s => {
    solvedSet.add(s.problem.contestId + "/" + s.problem.index)
  })
  return solvedSet
}

async function recommendProblems(handle, tag, targetRating) {
  const r = await fetch("https://codeforces.com/api/problemset.problems")
  const d = await r.json()
  const allProblems = d.result.problems
  const solvedSet = await getSolvedProblems(handle)
  const recommendations = allProblems.filter(p => {
    const id = p.contestId + "/" + p.index
    const hasTag = p.tags.includes(tag)
    const inRating = p.rating >= targetRating && p.rating <= targetRating + 200
    const notSolved = !solvedSet.has(id)
    return hasTag && inRating && notSolved
  })
  recommendations.sort((a, b) => a.rating - b.rating)
  console.log("Recommended problems for tag: " + tag)
  recommendations.slice(0, 10).forEach(p => {
    console.log(p.contestId + p.index + " - " + p.name + " (rating: " + p.rating + ")")
  })
}

async function statsDashboard(handle) {
  const submissions = await getUserSubmissions(handle)
  const solvedSet = new Set()
  submissions.filter(s => s.verdict === "OK").forEach(s => {
    solvedSet.add(s.problem.contestId + "/" + s.problem.index)
  })
  console.log("=== STATS DASHBOARD ===")
  console.log("Total unique solved:", solvedSet.size)
  const total = submissions.length
  const accepted = submissions.filter(s => s.verdict === "OK").length
  console.log("Acceptance rate:", ((accepted / total) * 100).toFixed(1) + "%")
  const ratingBuckets = {}
  submissions.filter(s => s.verdict === "OK" && s.problem.rating).forEach(s => {
    const bucket = s.problem.rating
    if (ratingBuckets[bucket]) ratingBuckets[bucket]++
    else ratingBuckets[bucket] = 1
  })
  const sortedBuckets = Object.entries(ratingBuckets).sort((a, b) => a[0] - b[0])
  console.log("Solved by rating:")
  sortedBuckets.forEach(([rating, count]) => {
    console.log("  " + rating + " → " + count + " problems")
  })
  const tagCount = {}
  submissions.filter(s => s.verdict === "OK").forEach(s => {
    s.problem.tags.forEach(tag => {
      if (tagCount[tag]) tagCount[tag]++
      else tagCount[tag] = 1
    })
  })
  const sortedTags = Object.entries(tagCount).sort((a, b) => b[1] - a[1])
  console.log("Most solved tags:")
  sortedTags.slice(0, 5).forEach(([tag, count]) => {
    console.log("  " + tag + " → " + count)
  })
}

async function tagDrillMode(handle, tag, targetRating) {
  const r = await fetch("https://codeforces.com/api/problemset.problems")
  const d = await r.json()
  const allProblems = d.result.problems
  const solvedSet = await getSolvedProblems(handle)
  const drillProblems = allProblems.filter(p => {
    const id = p.contestId + "/" + p.index
    const hasTag = p.tags.includes(tag)
    const inRating = p.rating >= targetRating && p.rating <= targetRating + 400
    const notSolved = !solvedSet.has(id)
    return hasTag && inRating && notSolved && p.rating
  })
  drillProblems.sort((a, b) => a.rating - b.rating)
  console.log("=== TAG DRILL MODE ===")
  console.log("Tag:", tag, "| Rating range:", targetRating, "-", targetRating + 400)
  console.log("Total unsolved problems in queue:", drillProblems.length)
  console.log("--- Your drill queue ---")
  drillProblems.slice(0, 20).forEach((p, index) => {
    console.log(
      (index + 1) + ". " +
      p.contestId + p.index + " - " +
      p.name +
      " (rating: " + p.rating + ")" +
      " → https://codeforces.com/problemset/problem/" + p.contestId + "/" + p.index
    )
  })
}

function cpAlgorithmsLinker(weakTags) {
  const tagToUrl = {
    "math": "https://cp-algorithms.com/algebra/fundamentals.html",
    "implementation": "https://cp-algorithms.com/",
    "greedy": "https://cp-algorithms.com/",
    "strings": "https://cp-algorithms.com/string/string-hashing.html",
    "brute force": "https://cp-algorithms.com/",
    "number theory": "https://cp-algorithms.com/algebra/sieve-of-eratosthenes.html",
    "sortings": "https://cp-algorithms.com/sequences/sorting.html",
    "constructive algorithms": "https://cp-algorithms.com/",
    "dp": "https://cp-algorithms.com/dynamic_programming/intro-to-dp.html",
    "data structures": "https://cp-algorithms.com/data_structures/stack_queue_modification.html",
    "combinatorics": "https://cp-algorithms.com/combinatorics/binomial-coefficients.html",
    "graphs": "https://cp-algorithms.com/graph/breadth-first-search.html",
    "trees": "https://cp-algorithms.com/graph/lca.html",
    "binary search": "https://cp-algorithms.com/num_methods/binary_search.html",
    "two pointers": "https://cp-algorithms.com/sequences/squeeze.html",
    "dfs and similar": "https://cp-algorithms.com/graph/depth-first-search.html",
    "shortest paths": "https://cp-algorithms.com/graph/dijkstra.html",
    "geometry": "https://cp-algorithms.com/geometry/basic-geometry.html",
    "bitmasks": "https://cp-algorithms.com/algebra/bits.html",
    "divide and conquer": "https://cp-algorithms.com/sequences/divide-and-conquer-dp.html"
  }
  console.log("=== CP-ALGORITHMS LINKER ===")
  weakTags.forEach(tag => {
    const url = tagToUrl[tag] || "https://cp-algorithms.com/"
    console.log(tag + " → " + url)
  })
}

async function ratingPredictor(handle) {
  const r = await fetch("https://codeforces.com/api/user.rating?handle=" + handle)
  const d = await r.json()
  const contests = d.result
  if (contests.length === 0) {
    console.log("No contest history found")
    return
  }
  console.log("=== RATING PREDICTOR ===")
  console.log("Total contests participated:", contests.length)
  const last5 = contests.slice(-5)
  console.log("Last 5 contests:")
  last5.forEach(c => {
    const change = c.newRating - c.oldRating
    const sign = change >= 0 ? "+" : ""
    console.log("  " + c.contestName.slice(0, 40) + " → " + sign + change + " (" + c.newRating + ")")
  })
  const avgChange = last5.reduce((sum, c) => sum + (c.newRating - c.oldRating), 0) / last5.length
  const currentRating = contests[contests.length - 1].newRating
  const predicted = Math.round(currentRating + avgChange)
  console.log("Current rating:", currentRating)
  console.log("Avg change last 5 contests:", Math.round(avgChange))
  console.log("Predicted next rating:", predicted)
  console.log(predicted > currentRating ? "📈 Trending UP" : "📉 Trending DOWN")
}

function injectProblemNotes() {
  if (!window.location.pathname.includes("/problem/")) return;
  if (document.getElementById("cf-note-wrapper")) return;

  const match = location.pathname.match(
    /\/(?:contest|problemset\/problem|gym)\/(\d+)\/(?:problem\/)?([A-Z0-9]+)/
  );
  if (!match) return;

  const problemId = `${match[1]}${match[2]}`;

  const notes = JSON.parse(localStorage.getItem("cf_notes") || "{}");
  const existingNote = notes[problemId] || "";

  const titleEl =
    document.querySelector(".problem-statement .title");

  if (!titleEl) return;

  const titleText = titleEl.textContent.trim();
  titleEl.innerHTML = "";

  // ===== header row =====
  const headerRow = document.createElement("div");
  headerRow.id = "cf-note-wrapper";
  headerRow.style.cssText = `
    display:flex;
    align-items:center;
    justify-content:center;
    gap:12px;
    flex-wrap:wrap;
    width:100%;
  `;

  const titleSpan = document.createElement("span");
  titleSpan.textContent = titleText;
  titleSpan.style.cssText = `
    font-size:28px;
    font-weight:400;
  `;

  // ===== button =====
  const noteBtn = document.createElement("button");
  noteBtn.innerText = existingNote ? "✏️ Edit Note" : "📝 Add Note";
  noteBtn.style.cssText = `
    border:1px solid rgba(120,120,120,.25);
    background:rgba(255,255,255,.70);
    backdrop-filter:blur(8px);
    border-radius:999px;
    padding:7px 15px;
    font-size:13px;
    cursor:pointer;
    color:#333;
    box-shadow:0 2px 10px rgba(0,0,0,.05);
  `;

  // ===== note card =====
  const box = document.createElement("div");
  box.style.cssText = `
    display:${existingNote ? "block" : "none"};
    width:min(560px,92%);
    margin:14px auto 0 auto;
    padding:14px;
    border-radius:18px;
    border:1px solid rgba(120,120,120,.18);
    background:rgba(255,255,255,.63);
    backdrop-filter:blur(10px);
    box-shadow:0 8px 24px rgba(0,0,0,.05);
  `;

  const textarea = document.createElement("textarea");
  textarea.value = existingNote;
  textarea.placeholder = "Write your note...";
  textarea.style.cssText = `
    width:100%;
    min-height:150px;
    resize:vertical;
    padding:12px;
    box-sizing:border-box;
    border-radius:14px;
    border:1px solid rgba(120,120,120,.20);
    background:rgba(255,255,255,.75);
    font-size:14px;
    outline:none;
  `;

  // ===== actions =====
  const actions = document.createElement("div");
  actions.style.cssText = `
    display:flex;
    justify-content:flex-end;
    gap:8px;
    margin-top:10px;
  `;

  function makeBtn(text, danger = false) {
    const btn = document.createElement("button");
    btn.innerText = text;
    btn.style.cssText = `
      border:1px solid rgba(120,120,120,.20);
      background:${danger
        ? "rgba(255,240,240,.75)"
        : "rgba(255,255,255,.72)"};
      border-radius:999px;
      padding:7px 14px;
      cursor:pointer;
      font-size:13px;
      color:${danger ? "#b00020" : "#222"};
      backdrop-filter:blur(8px);
    `;
    return btn;
  }

  const saveBtn = makeBtn("Save");
  const deleteBtn = makeBtn("Delete", true);

  noteBtn.onclick = () => {
    box.style.display =
      box.style.display === "none" ? "block" : "none";
  };

  saveBtn.onclick = () => {
    const value = textarea.value.trim();

    if (!value) return;

    notes[problemId] = value;
    localStorage.setItem(
      "cf_notes",
      JSON.stringify(notes)
    );

    noteBtn.innerText = "✏️ Edit Note";
    saveBtn.innerText = "Saved ✓";
    setTimeout(() => (saveBtn.innerText = "Save"), 900);
  };

  deleteBtn.onclick = () => {
    delete notes[problemId];
    localStorage.setItem(
      "cf_notes",
      JSON.stringify(notes)
    );

    textarea.value = "";
    box.style.display = "none";
    noteBtn.innerText = "📝 Add Note";
  };

  actions.appendChild(saveBtn);
  actions.appendChild(deleteBtn);
  box.appendChild(textarea);
  box.appendChild(actions);

  headerRow.appendChild(titleSpan);
  headerRow.appendChild(noteBtn);

  titleEl.appendChild(headerRow);
  titleEl.appendChild(box);
}

function injectHideTagsButton() {
  // Guard Check: Only run when on the problemset overview page.
  // Do not show the button if viewing an individual problem item view page.
  if (!window.location.pathname.includes("/problemset") || window.location.pathname.includes("/problem/")) {
    return;
  }

  if (document.getElementById("cf-hide-tags-btn")) return;

  const rightMenu = document.querySelector("#header .lang-chooser");
  if (!rightMenu) return;

  const STORAGE_KEY = "cf_hide_tags";
  let hidden = localStorage.getItem(STORAGE_KEY) === "true";

  const btn = document.createElement("button");
  btn.id = "cf-hide-tags-btn";
  btn.style.cssText = `
    margin-right:8px;
    padding:6px 14px;
    cursor:pointer;
    font-size:13px;
    border:1px solid rgba(120,120,120,.18);
    border-radius:999px;
    background:rgba(230,230,230,.45);
    backdrop-filter:blur(8px);
    -webkit-backdrop-filter:blur(8px);
    color:#333;
    box-shadow:0 2px 10px rgba(0,0,0,.05);
    transition:all .18s ease;
  `;

  function isRatingTag(text) {
    return /^\*\s*\d+$/.test((text || "").trim());
  }

  function refreshBtn() {
    btn.innerText = hidden ? "Show Tags" : "Hide Tags";
    btn.style.background = hidden
      ? "rgba(210,210,210,.55)"
      : "rgba(230,230,230,.45)";
  }

  function applyTagsVisibility() {
    const tagElements = document.querySelectorAll(
      ".tag-box, .tag-boxes .tag-box, .problem-statement .tag-box, .problem-statement .tag-boxes .tag-box"
    );

    tagElements.forEach(el => {
      if (isRatingTag(el.textContent)) {
        el.style.setProperty("display", "", "important");
        return;
      }
      el.style.setProperty("display", hidden ? "none" : "", "important");
    });

    document.querySelectorAll("#pageContent .datatable a.notice").forEach(el => {
      if (isRatingTag(el.textContent)) {
        el.style.setProperty("display", "", "important");
        return;
      }
      el.style.setProperty("display", hidden ? "none" : "", "important");
    });

    refreshBtn();
  }

  btn.addEventListener("mouseenter", () => {
    btn.style.transform = "translateY(-1px)";
  });

  btn.addEventListener("mouseleave", () => {
    btn.style.transform = "translateY(0)";
  });

  btn.addEventListener("click", () => {
    hidden = !hidden;
    localStorage.setItem(STORAGE_KEY, String(hidden));
    applyTagsVisibility();
  });

  refreshBtn();
  applyTagsVisibility();
  rightMenu.insertBefore(btn, rightMenu.firstChild);
}





// on problem page — save the problem ID
function saveProblemForSubmit() {
  const match = location.pathname.match(/\/problem(?:set\/problem|\/(\d+))\/(\d+)\/([A-Z]\d*)/i);
  if (!match) return;
  const problemId = match[2] + match[3]; // e.g. "33A"
  localStorage.setItem('cf_last_problem', problemId);
}

// on submit page — auto fill the problem input
function autoFillSubmitPage() {
  const problemId = localStorage.getItem('cf_last_problem');
  if (!problemId) return;

  const input = document.querySelector('input[name="submittedProblemCode"]');
  if (!input) return;

  input.value = problemId;
  input.dispatchEvent(new Event('input', { bubbles: true })); // trigger CF's own listeners
}

// run based on current page
if (location.pathname.includes('/problemset/problem/') || location.pathname.includes('/contest/')) {
  saveProblemForSubmit();
}

if (location.pathname.includes('/problemset/submit')) {
  autoFillSubmitPage();
}

async function getStatsForHandle(handle) {
  const submissions = await getUserSubmissions(handle);
  const seenSolved = new Set();
  const seenAttempted = new Set();
  const ratingBuckets = {};
  const tagCount = {};
  const problemsByRating = {};
  const attemptedBuckets = {};
  const attemptedByRating = {};

  // first pass — find all solved problems
  submissions.forEach(s => {
    if (s.verdict === "OK") {
      seenSolved.add(s.problem.contestId + "/" + s.problem.index);
    }
  });

  // second pass — track all unique attempted problems
  submissions.forEach(s => {
    const id = s.problem.contestId + "/" + s.problem.index;

    if (s.verdict === "OK") {
      if (seenSolved.has(id) && !seenAttempted.has(id)) {
        // count solved ones in ratingBuckets
      }
      if (!ratingBuckets[s.problem.rating] && seenSolved.has(id)) {
        // handled below
      }
    }

    // track every unique problem attempted (any verdict)
    if (!seenAttempted.has(id) && s.problem.rating) {
      seenAttempted.add(id);
      const b = s.problem.rating;
      attemptedBuckets[b] = (attemptedBuckets[b] || 0) + 1;
      if (!attemptedByRating[b]) attemptedByRating[b] = [];
      attemptedByRating[b].push({
        id: s.problem.contestId + s.problem.index,
        name: s.problem.name,
        contestId: s.problem.contestId,
        index: s.problem.index,
        solved: seenSolved.has(id)
      });
    }
  });

  // third pass — solved stats and tags (unique solved only)
  const seenForStats = new Set();
  submissions.filter(s => s.verdict === "OK").forEach(s => {
    const id = s.problem.contestId + "/" + s.problem.index;
    if (seenForStats.has(id)) return;
    seenForStats.add(id);

    if (s.problem.rating) {
      const b = s.problem.rating;
      ratingBuckets[b] = (ratingBuckets[b] || 0) + 1;
      if (!problemsByRating[b]) problemsByRating[b] = [];
      problemsByRating[b].push({
        id: s.problem.contestId + s.problem.index,
        name: s.problem.name,
        contestId: s.problem.contestId,
        index: s.problem.index
      });
    }

    s.problem.tags.forEach(tag => {
      tagCount[tag] = (tagCount[tag] || 0) + 1;
    });
  });

  return {
    ratingBuckets,
    tagCount,
    total: seenForStats.size,
    problemsByRating,
    attemptedBuckets,
    attemptedByRating
  };
}

function buildBarChart(myData, theirData, theirHandle, ownerHandle, problemsByRating, theirProblemsByRating) {
  const allRatings = [...new Set([...Object.keys(myData), ...Object.keys(theirData)])].sort((a,b) => a-b);
  if (allRatings.length === 0) return '<p style="color:#aaa;">No rating data</p>';
  const maxVal = Math.max(...allRatings.map(r => Math.max(myData[r]||0, theirData[r]||0)));
  const W = 660, H = 280, padL = 45, padB = 35, padT = 30;
  const slotW = (W - padL) / allRatings.length;
  const hasCompare = theirHandle && Object.keys(theirData).length > 0;

  let svg = `<svg id="cf-bar-chart-svg" width="${W}" height="${H + padB + padT}" xmlns="http://www.w3.org/2000/svg" style="cursor:pointer;">`;
  svg += `<rect width="${W}" height="${H + padB + padT}" fill="white"/>`;

  const legendX = W / 2 - 60;
  svg += `<rect x="${legendX}" y="8" width="18" height="12" fill="#c8c8c8" stroke="#999" stroke-width="1"/>`;
  svg += `<text x="${legendX + 22}" y="19" font-size="11" fill="#555">Problems Solved (${ownerHandle || MY_HANDLE})</text>`;
  if (hasCompare) {
    svg += `<rect x="${legendX + 180}" y="8" width="18" height="12" fill="#4a90d9" stroke="#999" stroke-width="1"/>`;
    svg += `<text x="${legendX + 202}" y="19" font-size="11" fill="#555">${theirHandle}</text>`;
  }

  const gTop = padT + 10;
  for (let i = 0; i <= 4; i++) {
    const y = gTop + H - (i / 4) * H;
    const val = Math.round((i / 4) * maxVal);
    svg += `<line x1="${padL}" y1="${y}" x2="${W - 10}" y2="${y}" stroke="#e0e0e0" stroke-width="1"/>`;
    svg += `<text x="${padL - 6}" y="${y + 4}" font-size="11" text-anchor="end" fill="#999">${val}</text>`;
  }

  allRatings.forEach((r, i) => {
    const myVal = myData[r] || 0;
    const theirVal = theirData[r] || 0;
    const slotX = padL + i * slotW;
    const barW = hasCompare ? (slotW - 12) / 2 : slotW - 8;
    const myH = maxVal ? (myVal / maxVal) * H : 0;

    // clickable bar with data-rating attribute
    svg += `<rect 
      x="${slotX + 4}" y="${gTop + H - myH}" 
      width="${barW}" height="${myH}" 
      fill="#c8c8c8" stroke="#999" stroke-width="0.5"
      data-rating="${r}" class="cf-bar-clickable"
      style="cursor:pointer;"
    ><title>${ownerHandle || MY_HANDLE}: ${myVal} solved @ ${r} (click to see list)</title></rect>`;

    if (hasCompare) {
      const theirH = maxVal ? (theirVal / maxVal) * H : 0;
      svg += `<rect 
        x="${slotX + 4 + barW + 4}" y="${gTop + H - theirH}" 
        width="${barW}" height="${theirH}" 
        fill="#4a90d9" stroke="#3a7abf" stroke-width="0.5"
        data-rating-theirs="${r}" class="cf-bar-theirs-clickable"
        style="cursor:pointer;"
      ><title>${theirHandle}: ${theirVal} solved @ ${r} (click to see list)</title></rect>`;
    }

    svg += `<text x="${slotX + slotW/2}" y="${gTop + H + 18}" font-size="11" text-anchor="middle" fill="#666">${r}</text>`;
  });

  svg += `</svg>`;

  // popup div
  const popupId = 'cf-bar-popup';
  const wrapperHtml = `
    <div style="position:relative;">
      <div style="color:#aaa; font-size:11px; font-style:italic; margin-bottom:4px;">Click a bar to see problem list</div>
      ${svg}
      <div id="${popupId}" style="
        display:none;
        position:absolute;
        top:40px; left:50px;
        background:white;
        border:1px solid #ddd;
        border-radius:4px;
        padding:10px;
        max-height:260px;
        overflow-y:auto;
        z-index:999;
        width:320px;
        box-shadow:0 4px 12px rgba(0,0,0,0.1);
        font-size:12px;
      ">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
          <b id="cf-bar-popup-title"></b>
          <span id="cf-bar-popup-close" style="cursor:pointer; color:#888; font-size:14px;">✕</span>
        </div>
        <div id="cf-bar-popup-list"></div>
      </div>
    </div>
  `;

  // attach click handler after render via setTimeout
  setTimeout(() => {
    const svgEl = document.getElementById('cf-bar-chart-svg');
    const popup = document.getElementById(popupId);
    const popupTitle = document.getElementById('cf-bar-popup-title');
    const popupList = document.getElementById('cf-bar-popup-list');
    const closeBtn = document.getElementById('cf-bar-popup-close');

    if (!svgEl || !popup) return;

    svgEl.addEventListener('click', (e) => {
      // Use the element directly — closest('[data-rating]') wrongly matches data-rating-theirs
      const el = e.target;
      const isTheirBar = el.hasAttribute('data-rating-theirs');
      const isMyBar = el.hasAttribute('data-rating') && !isTheirBar;
      if (!isMyBar && !isTheirBar) return;

      let rating, problems, who;
      if (isTheirBar) {
        rating = el.getAttribute('data-rating-theirs');
        problems = theirProblemsByRating?.[rating] || [];
        who = theirHandle;
      } else {
        rating = el.getAttribute('data-rating');
        problems = problemsByRating?.[rating] || [];
        who = ownerHandle || MY_HANDLE;
      }

      popupTitle.innerText = `${who} — ${rating} rated — ${problems.length} solved`;

      if (problems.length === 0) {
        popupList.innerHTML = '<i style="color:#aaa;">No problems found</i>';
      } else {
        popupList.innerHTML = problems.map((p, i) => `
          <div style="padding:4px 0; border-bottom:1px solid #f0f0f0;">
            <span style="color:#888; margin-right:6px;">${i+1}.</span>
            <a href="/problemset/problem/${p.contestId}/${p.index}" target="_blank" 
               style="color:#0000cc;">${p.id} - ${p.name}</a>
          </div>
        `).join('');
      }

      popup.style.display = 'block';
    });

    closeBtn?.addEventListener('click', () => {
      popup.style.display = 'none';
    });

    // close on outside click
    document.addEventListener('click', (e) => {
      if (!popup.contains(e.target) && !e.target.hasAttribute('data-rating') && !e.target.hasAttribute('data-rating-theirs')) {
        popup.style.display = 'none';
      }
    });
  }, 500);

  return wrapperHtml;
}


function buildAttemptedBarChart(attemptedData, attemptedByRating, ownerHandle, theirAttemptedData, theirAttemptedByRating, theirHandle) {
  const theirData = theirAttemptedData || {};
  const hasTheirData = theirHandle && Object.keys(theirData).length > 0;
  const allRatings = [...new Set([...Object.keys(attemptedData), ...Object.keys(theirData)])].sort((a,b) => a-b);
  if (allRatings.length === 0) return '<p style="color:#aaa;">No attempted data</p>';
  const maxVal = Math.max(...allRatings.map(r => Math.max(attemptedData[r]||0, theirData[r]||0)));
  const W = 660, H = 280, padL = 45, padB = 35, padT = 30;
  const slotW = (W - padL) / allRatings.length;

  let svg = `<svg id="cf-attempted-chart-svg" width="${W}" height="${H + padB + padT}" xmlns="http://www.w3.org/2000/svg" style="cursor:pointer;">`;
  svg += `<rect width="${W}" height="${H + padB + padT}" fill="white"/>`;

  const legendX = W / 2 - 60;
 // main label on left
svg += `<rect x="10" y="8" width="18" height="12" fill="#9b59b6" stroke="#8e44ad" stroke-width="1"/>`;
svg += `<text x="32" y="19" font-size="11" fill="#555">Attempted (${ownerHandle || MY_HANDLE})</text>`;
// solved/unsolved on right side fixed
svg += `<rect x="${W - 150}" y="8" width="10" height="10" fill="#3498db"/>`;
svg += `<text x="${W - 136}" y="18" font-size="10" fill="#555">solved</text>`;
svg += `<rect x="${W - 90}" y="8" width="10" height="10" fill="#e74c3c"/>`;
svg += `<text x="${W - 76}" y="18" font-size="10" fill="#555">unsolved</text>`;
if (hasTheirData) {
  svg += `<rect x="${W/2 - 20}" y="8" width="12" height="10" fill="#4a90d9" stroke="#3a7abf" stroke-width="1"/>`;
  svg += `<text x="${W/2 - 4}" y="18" font-size="10" fill="#555">${theirHandle}</text>`;
}
  const gTop = padT + 10;
  for (let i = 0; i <= 4; i++) {
    const y = gTop + H - (i / 4) * H;
    const val = Math.round((i / 4) * maxVal);
    svg += `<line x1="${padL}" y1="${y}" x2="${W - 10}" y2="${y}" stroke="#e0e0e0" stroke-width="1"/>`;
    svg += `<text x="${padL - 6}" y="${y + 4}" font-size="11" text-anchor="end" fill="#999">${val}</text>`;
  }

  allRatings.forEach((r, i) => {
    const myVal = attemptedData[r] || 0;
    const theirVal = theirData[r] || 0;
    const slotX = padL + i * slotW;
    const barW = hasTheirData ? (slotW - 12) / 2 : slotW - 8;
    const myBarH = maxVal ? (myVal / maxVal) * H : 0;

    svg += `<rect 
      x="${slotX + 4}" y="${gTop + H - myBarH}" 
      width="${barW}" height="${myBarH}" 
      fill="#9b59b6" stroke="#8e44ad" stroke-width="0.5"
      data-rating-attempted="${r}" class="cf-attempted-bar-clickable"
      style="cursor:pointer;"
    ><title>${ownerHandle || MY_HANDLE}: ${myVal} attempted @ ${r} (click to see list)</title></rect>`;

    if (hasTheirData) {
      const theirBarH = maxVal ? (theirVal / maxVal) * H : 0;
      svg += `<rect 
        x="${slotX + 4 + barW + 4}" y="${gTop + H - theirBarH}" 
        width="${barW}" height="${theirBarH}" 
        fill="#4a90d9" stroke="#3a7abf" stroke-width="0.5"
        data-rating-attempted-theirs="${r}" class="cf-attempted-bar-theirs-clickable"
        style="cursor:pointer;"
      ><title>${theirHandle}: ${theirVal} attempted @ ${r} (click to see list)</title></rect>`;
    }

    svg += `<text x="${slotX + slotW/2}" y="${gTop + H + 18}" font-size="11" text-anchor="middle" fill="#666">${r}</text>`;
  });

  svg += `</svg>`;

  const popupId = 'cf-attempted-popup';
  const wrapperHtml = `
    <div style="position:relative;">
      <div style="color:#aaa; font-size:11px; font-style:italic; margin-bottom:4px;">Click a bar to see problem list</div>
      ${svg}
      <div id="${popupId}" style="
        display:none;
        position:absolute;
        top:40px; left:50px;
        background:white;
        border:1px solid #ddd;
        border-radius:4px;
        padding:10px;
        max-height:260px;
        overflow-y:auto;
        z-index:999;
        width:340px;
        box-shadow:0 4px 12px rgba(0,0,0,0.1);
        font-size:12px;
      ">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
          <b id="cf-attempted-popup-title"></b>
          <span id="cf-attempted-popup-close" style="cursor:pointer; color:#888; font-size:14px;">✕</span>
        </div>
        <div id="cf-attempted-popup-list"></div>
      </div>
    </div>
  `;

  setTimeout(() => {
    const svgEl = document.getElementById('cf-attempted-chart-svg');
    const popup = document.getElementById(popupId);
    const popupTitle = document.getElementById('cf-attempted-popup-title');
    const popupList = document.getElementById('cf-attempted-popup-list');
    const closeBtn = document.getElementById('cf-attempted-popup-close');

    if (!svgEl || !popup) return;

    svgEl.addEventListener('click', (e) => {
      const el = e.target;
      const isTheirBar = el.hasAttribute('data-rating-attempted-theirs');
      const isMyBar = el.hasAttribute('data-rating-attempted') && !isTheirBar;
      if (!isMyBar && !isTheirBar) return;

      let rating, problems, who;
      if (isTheirBar) {
        rating = el.getAttribute('data-rating-attempted-theirs');
        problems = theirAttemptedByRating?.[rating] || [];
        who = theirHandle;
      } else {
        rating = el.getAttribute('data-rating-attempted');
        problems = attemptedByRating?.[rating] || [];
        who = ownerHandle || MY_HANDLE;
      }

      popupTitle.innerText = `${who} — ${rating} rated — ${problems.length} attempted`;

      if (problems.length === 0) {
        popupList.innerHTML = '<i style="color:#aaa;">No problems found</i>';
      } else {
        popupList.innerHTML = problems.map((p, i) => `
          <div style="padding:5px 0; border-bottom:1px solid #f0f0f0; display:flex; align-items:center; gap:8px;">
            <span style="color:#888; min-width:20px;">${i+1}.</span>
            <div style="flex:1;">
              <a href="/problemset/problem/${p.contestId}/${p.index}" target="_blank" 
                 style="color:${p.solved ? '#27ae60' : '#e74c3c'}; font-weight:${p.solved ? 'normal' : 'bold'};">
                ${p.id} - ${p.name}
              </a>
            </div>
            <span style="font-size:10px; padding:2px 6px; border-radius:10px; background:${p.solved ? '#d4efdf' : '#fde8e8'}; color:${p.solved ? '#27ae60' : '#e74c3c'};">
              ${p.solved ? '✓ solved' : '✗ unsolved'}
            </span>
          </div>
        `).join('');
      }

      popup.style.display = 'block';
    });

    closeBtn?.addEventListener('click', () => {
      popup.style.display = 'none';
    });

    document.addEventListener('click', (e) => {
      if (!popup.contains(e.target) && !e.target.hasAttribute('data-rating-attempted') && !e.target.hasAttribute('data-rating-attempted-theirs')) {
        popup.style.display = 'none';
      }
    });
  }, 500);

  return wrapperHtml;
}



function buildDonut(tagCount, label) {
  const distinctColors = [
    "#e74c3c","#3498db","#2ecc71","#f39c12","#9b59b6",
    "#1abc9c","#e67e22","#e91e8c","#34495e","#27ae60",
    "#c0392b","#2980b9","#8e44ad","#f1c40f","#16a085"
  ];
  const entries = Object.entries(tagCount).sort((a,b) => b[1]-a[1]).slice(0, 15);
  if (entries.length === 0) return '<p style="color:#aaa;">No tag data</p>';
  const total = entries.reduce((s, [,v]) => s + v, 0);
  const cx = 130, cy = 130, r = 115, inner = 60;
  const legendX = 280;
  const svgH = Math.max(270, entries.length * 19 + 20);

  let svg = `<svg width="560" height="${svgH}" xmlns="http://www.w3.org/2000/svg">`;
  svg += `<rect width="560" height="${svgH}" fill="white"/>`;

  let angle = -Math.PI / 2;
  entries.forEach(([tag, count], i) => {
    const slice = (count / total) * 2 * Math.PI;
    const x1 = cx + r * Math.cos(angle);
    const y1 = cy + r * Math.sin(angle);
    const x2 = cx + r * Math.cos(angle + slice);
    const y2 = cy + r * Math.sin(angle + slice);
    const ix1 = cx + inner * Math.cos(angle);
    const iy1 = cy + inner * Math.sin(angle);
    const ix2 = cx + inner * Math.cos(angle + slice);
    const iy2 = cy + inner * Math.sin(angle + slice);
    const large = slice > Math.PI ? 1 : 0;
    const color = distinctColors[i % distinctColors.length];
    svg += `<path d="M${ix1},${iy1} L${x1},${y1} A${r},${r} 0 ${large},1 ${x2},${y2} L${ix2},${iy2} A${inner},${inner} 0 ${large},0 ${ix1},${iy1}" fill="${color}" stroke="white" stroke-width="2"><title>${tag}: ${count}</title></path>`;
    const ly = 10 + i * 19;
    svg += `<rect x="${legendX}" y="${ly}" width="13" height="13" fill="${color}"/>`;
    svg += `<text x="${legendX + 18}" y="${ly + 11}" font-size="12" fill="#444">${tag} : ${count}</text>`;
    angle += slice;
  });

  svg += `</svg>`;
  return svg;
}

async function injectCompareDashboard() {
  if (!location.pathname.includes('/profile/')) return;

  // whose profile is this
  const profileHandle = location.pathname.split('/profile/')[1]?.split('/')[0];
  const isMyProfile = profileHandle?.toLowerCase() === MY_HANDLE?.toLowerCase();
  const targetHandle = isMyProfile ? MY_HANDLE : profileHandle;

  const container = document.createElement('div');
  container.id = 'cf-compare-container';
  container.style.cssText = `
    margin: 20px 0;
    padding: 0;
    font-family: Verdana, Geneva, sans-serif;
    font-size: 12px;
  `;

  container.innerHTML = `
    <div class="roundbox" style="margin-bottom:10px; padding:15px;">
      <div class="caption titled" style="margin-bottom:12px;">→ 📊 Analysis Dashboard</div>
      <div style="display:flex; align-items:center; gap:8px; margin-bottom:12px;">
       <input id="cf-compare-input" placeholder="Enter handle to compare..." 
  style="padding:5px 12px; border:1px solid rgba(0,0,0,0.12); border-radius:20px; font-size:12px; width:200px; background:rgba(255,255,255,0.7); backdrop-filter:blur(10px); -webkit-backdrop-filter:blur(10px); box-shadow:inset 0 1px 3px rgba(0,0,0,0.06); outline:none;"/>
<input id="cf-compare-btn" type="button" value="Compare"
  style="padding:5px 16px; font-size:12px; cursor:pointer; border-radius:20px; border:1px solid rgba(0,0,0,0.12); background:rgba(255,255,255,0.7); backdrop-filter:blur(10px); -webkit-backdrop-filter:blur(10px); box-shadow:0 2px 8px rgba(0,0,0,0.08), inset 0 1px 0 rgba(255,255,255,0.9); font-weight:600; color:#333; transition:all 0.18s ease;"/>
      </div>
      <div id="cf-compare-body">
        <i style="color:#aaa;">Loading stats...</i>
      </div>
    </div>

    ${isMyProfile ? `
    <div class="roundbox" style="padding:15px;">
      <div class="caption titled" style="margin-bottom:12px;">→ 🎯 Weakness Analyzer & Practice</div>
      <div id="cf-weakest-alert-text" style="margin-bottom:12px;"></div>

      <div style="display:flex; align-items:center; gap:8px; margin-bottom:12px; flex-wrap:wrap;">
        <span style="color:#555;">Rating:</span>
       <select id="cf-rec-rating-select" style="padding:3px 6px; border:1px solid #aaa; border-radius:12px; font-size:12px; background:#f0f0f0;">
          ${[800,900,1000,1100,1200,1300,1400,1500,1600,1700,1800,1900,2000,2200,2400].map(r =>
            `<option value="${r}" ${r === 1200 ? 'selected' : ''}>${r}</option>`
          ).join('')}
        </select>

        <span style="color:#555;">Tag:</span>
        <select id="cf-rec-tag-select" style="padding:3px 6px; border:1px solid #ccc; font-size:12px; background:white; min-width:160px;">
          <option>Loading tags...</option>
        </select>

        <input id="cf-load-recs-btn" type="button" value="Recommend Problems"
  style="padding:3px 10px; font-size:12px; cursor:pointer; border-radius:12px; border:1px solid #aaa; background:#f0f0f0;"/>
        <span id="cf-weakest-tag-label" style="color:#888; font-style:italic;"></span>
      </div>

      <div id="cf-rec-output-box"></div>
    </div>
    ` : ''}
  `;

  document.querySelector('#pageContent')?.appendChild(container);

  // load stats for this profile
  let myStats;
  try {
    myStats = await getStatsForHandle(targetHandle);
  } catch (e) {
    console.error('[Dashboard] failed to load stats:', e);
    return;
  }

  const body = document.getElementById('cf-compare-body');
  body.innerHTML = `
    <div style="color:#777; margin-bottom:8px; font-style:italic;">
      ${isMyProfile ? 'Your stats — enter a handle above to compare' : `Stats for ${targetHandle}`}
    </div>
    <div id="cf-charts-area" style="display:flex; flex-wrap:wrap; gap:20px; align-items:flex-start;"></div>
  `;
  renderCharts(myStats, null, null);

  // weakness analyzer — only on my profile
  if (isMyProfile) {
    let weakestTag = 'math';
    let topWeakTags = [];
    let allTags = [];

    try {
      const subs = await getUserSubmissions(MY_HANDLE);

      const tagMistakes = {};
      const tagSet = new Set();

      subs.forEach(s => {
        if (s.problem?.tags?.length) {
          s.problem.tags.forEach(t => tagSet.add(t));
        }

        if (s.verdict === 'WRONG_ANSWER' && s.problem?.tags?.length) {
          s.problem.tags.forEach(t => {
            tagMistakes[t] = (tagMistakes[t] || 0) + 1;
          });
        }
      });

      allTags = [...tagSet].sort((a, b) => a.localeCompare(b));
      const sorted = Object.entries(tagMistakes).sort((a, b) => b[1] - a[1]);
      topWeakTags = sorted.slice(0, 4);

      if (sorted.length > 0) {
        weakestTag = sorted[0][0];
        const count = sorted[0][1];

        document.getElementById('cf-weakest-alert-text').innerHTML = `
          <div style="background:#fff3f3; border-left:3px solid #e74c3c; padding:8px 10px; border-radius:2px; color:#c0392b;">
            Your most mistaken tag is <b>${weakestTag}</b> with <b>${count}</b> wrong answers.
            Top mistakes: ${topWeakTags.map(([t, c]) => `${t}(${c})`).join(', ')}
          </div>
        `;

        document.getElementById('cf-weakest-tag-label').innerText = `Topic: ${weakestTag}`;
      } else {
        document.getElementById('cf-weakest-alert-text').innerHTML = `
          <div style="background:#fff8e8; border-left:3px solid #f39c12; padding:8px 10px; border-radius:2px; color:#8a6d3b;">
            No wrong-answer tag data found yet.
          </div>
        `;
      }

      const tagSelect = document.getElementById('cf-rec-tag-select');
      if (tagSelect) {
        const defaultTag = allTags.includes(weakestTag) ? weakestTag : (allTags[0] || weakestTag);
        tagSelect.innerHTML = allTags.length
          ? allTags.map(tag => `<option value="${tag}" ${tag === defaultTag ? 'selected' : ''}>${tag}</option>`).join('')
          : `<option value="${defaultTag}" selected>${defaultTag}</option>`;

        // keep "Topic:" label in sync whenever user changes the dropdown
        tagSelect.addEventListener('change', () => {
          document.getElementById('cf-weakest-tag-label').innerText = `Topic: ${tagSelect.value}`;
        });
      }
    } catch (e) {
      console.error('[Dashboard] weakest tag failed:', e);
      const tagSelect = document.getElementById('cf-rec-tag-select');
      if (tagSelect) {
        tagSelect.innerHTML = `<option value="math" selected>math</option>`;
        tagSelect.addEventListener('change', () => {
          document.getElementById('cf-weakest-tag-label').innerText = `Topic: ${tagSelect.value}`;
        });
      }
    }

    document.getElementById('cf-load-recs-btn').addEventListener('click', async () => {
      const rating = parseInt(document.getElementById('cf-rec-rating-select').value, 10);
      const selectedTag = document.getElementById('cf-rec-tag-select')?.value || weakestTag;
      const outputBox = document.getElementById('cf-rec-output-box');

      outputBox.innerHTML = `<i style="color:#aaa;">Fetching <b>${selectedTag}</b> problems at rating ${rating}…</i>`;

      try {
        const r = await fetch('https://codeforces.com/api/problemset.problems');
        const d = await r.json();
        const allProblems = d.result.problems;
        const allStats = d.result.problemStatistics || [];

        const statsMap = {};
        allStats.forEach(s => {
          statsMap[`${s.contestId}-${s.index}`] = s.solvedCount;
        });

        const solvedSet = await getSolvedProblems(MY_HANDLE);

        let matches = allProblems.filter(p =>
          p.rating === rating &&
          p.tags?.includes(selectedTag) &&
          !solvedSet.has(p.contestId + '/' + p.index)
        );

        matches.forEach(p => {
          p.solveCount = statsMap[`${p.contestId}-${p.index}`] || 0;
        });

        // same sort as before: solveCount descending
        matches.sort((a, b) => b.solveCount - a.solveCount);

        const top = matches.slice(0, 7);

        if (top.length === 0) {
          outputBox.innerHTML = `<span style="color:#888;">No unsolved ${selectedTag} problems at ${rating}. Try a different rating or tag.</span>`;
          return;
        }

        outputBox.innerHTML = `
          <table style="width:100%; border-collapse:collapse; margin-top:6px;">
            <tr style="background:#f0f0f0; border-bottom:1px solid #ccc;">
              <th style="padding:5px; text-align:left;">#</th>
              <th style="padding:5px; text-align:left;">Problem</th>
              <th style="padding:5px; text-align:center;">Solved by</th>
            </tr>
            ${top.map((p, i) => `
              <tr style="border-bottom:1px solid #eee; ${i % 2 === 0 ? 'background:#fafafa;' : ''}">
                <td style="padding:5px; color:#888;">${i + 1}</td>
                <td style="padding:5px;">
                  <a href="/problemset/problem/${p.contestId}/${p.index}" target="_blank"
                     style="color:#0000cc; font-weight:bold;">${p.contestId}${p.index} - ${p.name}</a>
                </td>
                <td style="padding:5px; text-align:center; color:#27ae60; font-weight:bold;">${p.solveCount.toLocaleString()}</td>
              </tr>
            `).join('')}
          </table>
        `;
      } catch (e) {
        console.error('[Dashboard] recommendation failed:', e);
        outputBox.innerHTML = `<span style="color:red;">Failed to fetch problems.</span>`;
      }
    });
  }

  // compare button
  document.getElementById('cf-compare-btn').addEventListener('click', async () => {
    const handle = document.getElementById('cf-compare-input').value.trim();
    if (!handle) return;

    body.innerHTML = `<i style="color:#aaa;">Loading ${handle}'s stats...</i>`;

    try {
      const theirStats = await getStatsForHandle(handle);
      body.innerHTML = `<div id="cf-charts-area" style="display:flex; flex-wrap:wrap; gap:20px; align-items:flex-start;"></div>`;
      renderCharts(myStats, theirStats, handle);
    } catch (e) {
      body.innerHTML = `<span style="color:red;">Failed to load: ${handle}</span>`;
    }
  });

  function renderCharts(myStats, theirStats, theirHandle) {
    const area = document.getElementById('cf-charts-area');
    if (!area) return;
    area.innerHTML = '';

    const barWrap = document.createElement('div');
    barWrap.innerHTML = `
      <div style="font-weight:bold; margin-bottom:6px;">Submitted Question Analysis</div>
      ${buildBarChart(myStats.ratingBuckets, theirStats ? theirStats.ratingBuckets : {}, theirHandle || '', targetHandle, myStats.problemsByRating, theirStats ? theirStats.problemsByRating : {})}
      <div style="font-weight:bold; margin:16px 0 6px 0;">Attempted Question Analysis</div>
      ${buildAttemptedBarChart(myStats.attemptedBuckets, myStats.attemptedByRating, targetHandle, theirStats ? theirStats.attemptedBuckets : {}, theirStats ? theirStats.attemptedByRating : {}, theirHandle || '')}
    `;
    area.appendChild(barWrap);

    const donutWrap = document.createElement('div');
    donutWrap.style.cssText = 'display:flex; gap:16px; flex-wrap:wrap;';
    donutWrap.innerHTML = `
      <div>
        <div style="font-weight:bold; margin-bottom:6px;">Tags — ${targetHandle}</div>
        ${buildDonut(myStats.tagCount, targetHandle)}
      </div>
      ${theirStats ? `
      <div>
        <div style="font-weight:bold; margin-bottom:6px;">Tags — ${theirHandle}</div>
        ${buildDonut(theirStats.tagCount, theirHandle)}
      </div>` : ''}
    `;
    area.appendChild(donutWrap);
  }
}

  // 6. Profile Comparison Workspace Module Controller Action Hook
  const compareBtn = document.getElementById('cf-compare-btn');
  if (compareBtn) {
    compareBtn.addEventListener('click', async () => {
      const handle = document.getElementById('cf-compare-input').value.trim();
      if (!handle) return;
      const body = document.getElementById('cf-compare-body');
      if (body) body.innerHTML = `<i style="color:#aaa; font-size:12px;">Loading ${handle}'s stats array parameters...</i>`;

      try {
        const theirStats = await getStatsForHandle(handle);
        if (body) {
          body.innerHTML = `<div id="cf-charts-area" style="display:flex; flex-wrap:wrap; gap:20px; align-items:flex-start;"></div>`;
          renderCharts(myStats, theirStats, handle);
        }
      } catch(e) {
        if (body) body.innerHTML = `<span style="color:red; font-size:12px;">Failed to load handle tracking configurations: ${handle}</span>`;
      }
    });
  }

function renderCharts(
  myStats,
  theirStats,
  theirHandle
) {
  const area =
    document.getElementById(
      "cf-charts-area"
    );

  if (!area) return;
  area.innerHTML = "";

  const barWrap =
    document.createElement("div");

  barWrap.innerHTML = `
    <div
      style="
        font-weight:bold;
        margin-bottom:6px;
      "
    >
      Problem Ratings
    </div>
    ${buildBarChart(
      myStats.ratingBuckets,
      theirStats
        ? theirStats.ratingBuckets
        : {},
      theirHandle || "",
      targetHandle
    )}
  `;

  area.appendChild(barWrap);

  const donutWrap =
    document.createElement("div");

  donutWrap.style.cssText =
    `
      display:flex;
      gap:16px;
      flex-wrap:wrap;
    `;

  donutWrap.innerHTML = `
    <div>
      <div
        style="
          font-weight:bold;
          margin-bottom:6px;
        "
      >
        Tags — ${targetHandle}
      </div>
      ${buildDonut(
        myStats.tagCount,
        targetHandle
      )}
    </div>

    ${
      theirStats
        ? `
      <div>
        <div
          style="
            font-weight:bold;
            margin-bottom:6px;
          "
        >
          Tags — ${theirHandle}
        </div>
        ${buildDonut(
          theirStats.tagCount,
          theirHandle
        )}
      </div>
    `
        : ""
    }
  `;

  area.appendChild(
    donutWrap
  );
}
/*function renderSolvedRatingList(
  container,
  rating,
  problems,
  label
) {
  const list =
    problems?.[rating] || [];

  if (!list.length) {
    container.innerHTML =
      `<div style="color:#888;">No solved problems at rating ${rating}</div>`;
    return;
  }

  container.innerHTML = `
    <div
      style="
        font-weight:bold;
        margin-bottom:10px;
      "
    >
      ${label} — Rating ${rating}
    </div>

    <div
      style="
        max-height:260px;
        overflow:auto;
      "
    >
      ${list
        .map(
          p => `
        <div
          style="
            padding:6px 0;
            border-bottom:1px solid #eee;
          "
        >
          <a
            href="/problemset/problem/${p.contestId}/${p.index}"
            target="_blank"
            style="
              color:#0000cc;
              font-weight:bold;
            "
          >
            ${p.contestId}${p.index}
            - ${p.name}
          </a>
        </div>
      `
        )
        .join("")}
    </div>
  `;
}*/


async function injectFamousSolversBox() {
  if (document.getElementById("cf-famous-solvers-box")) return;

  const match = location.pathname.match(
    /\/(?:contest|problemset\/problem|gym)\/(\d+)\/(?:problem\/)?([A-Z0-9]+)/
  );
  if (!match) return;

  const contestId = match[1];
  const problemIndex = match[2];

  const rightColumn =
    document.querySelector("#sidebar") ||
    document.querySelector(".roundbox.sidebox")?.parentNode;

  if (!rightColumn) return;

  const box = document.createElement("div");
  box.id = "cf-famous-solvers-box";
  box.className = "roundbox sidebox";
  box.style.marginTop = "15px";

  box.innerHTML = `
    <div class="caption titled">→ 👑 Famous Solver Box</div>
    <div id="cf-famous-solvers-list"
      style="padding:12px;font-size:13px;">
      <i style="color:#888;">Loading top C++ / Python solvers...</i>
    </div>
  `;

  rightColumn.insertBefore(
    box,
    rightColumn.children[1] || rightColumn.firstChild
  );

  const listDiv = document.getElementById("cf-famous-solvers-list");

  try {
    // contest standings
    const standRes = await fetch(
      `https://codeforces.com/api/contest.standings?contestId=${contestId}`
    );
    const standData = await standRes.json();

    if (standData.status !== "OK")
      throw new Error("Standings failed");

    const problems = standData.result.problems;
    const rows = standData.result.rows;

    const pIndex = problems.findIndex(
      p => p.index === problemIndex
    );

    if (pIndex === -1)
      throw new Error("Problem not found");

    // people who solved
    const solvers = rows
      .filter(r => r.problemResults?.[pIndex]?.points > 0)
      .map(r => ({
        handle: r.party.members[0].handle,
        rank: r.rank
      }))
      .slice(0, 30); // only top 30, fast

    const pickedCpp = [];
    const pickedPy = [];

    for (const user of solvers) {
      if (
        pickedCpp.length === 2 &&
        pickedPy.length === 1
      ) break;

      try {
        const res = await fetch(
          `https://codeforces.com/api/user.status?handle=${user.handle}`
        );
        const data = await res.json();

        if (data.status !== "OK") continue;

        const subs = data.result;

        const accepted = subs.find(s =>
          s.verdict === "OK" &&
          s.problem?.contestId == contestId &&
          s.problem?.index === problemIndex
        );

        if (!accepted) continue;

        const lang =
          accepted.programmingLanguage
            .toLowerCase();

        if (
          lang.includes("c++") &&
          pickedCpp.length < 2
        ) {
          pickedCpp.push({
            ...user,
            language: "C++",
            submissionId: accepted.id
          });
        } else if (
          (lang.includes("python") ||
            lang.includes("pypy")) &&
          pickedPy.length < 1
        ) {
          pickedPy.push({
            ...user,
            language: "Py",
            submissionId: accepted.id
          });
        }

      } catch {}
    }

    const finalList = [
      ...pickedCpp,
      ...pickedPy
    ];

    if (!finalList.length) {
      listDiv.innerHTML =
        "<span style='color:#888;'>No matching solvers found.</span>";
      return;
    }

    listDiv.innerHTML = "";

    finalList.forEach(solver => {
      const row = document.createElement("div");

      row.style.cssText = `
        margin-bottom:8px;
        display:flex;
        justify-content:space-between;
        align-items:center;
      `;

      row.innerHTML = `
        <div>
          <span style="font-weight:bold;">#${solver.rank}</span>
          &nbsp;
          <a href="/profile/${solver.handle}" target="_blank">
            ${solver.handle} (${solver.language})
          </a>
        </div>

        <a
          href="/contest/${contestId}/submission/${solver.submissionId}"
          target="_blank"
          style="
            color:#00a900;
            font-weight:bold;
            text-decoration:none;
            background:#f0f0f0;
            padding:2px 6px;
            border-radius:4px;
          "
        >
          View Code
        </a>
      `;

      listDiv.appendChild(row);
    });

    if (finalList.length < 3) {
      const note = document.createElement("div");
      note.style.cssText =
        "margin-top:8px;color:#888;font-size:11px;";
      note.innerText =
        `Only ${finalList.length}/3 matching solvers found.`;
      listDiv.appendChild(note);
    }

  } catch (err) {
    console.error("[FamousSolvers]", err);
    listDiv.innerHTML = `
      <span style="color:red;">
        Failed: ${err.message}
      </span>
    `;
  }
}
function getCurrentHandle() {
  const links = [...document.querySelectorAll('a[href*="/profile/"]')];

  for (const link of links) {
    const match = link.href.match(/\/profile\/([^/]+)/);
    if (match) return match[1];
  }

  return null;
}



async function injectIndiaRankToggle() {
  if (!location.pathname.includes('/standings')) return;
  if (document.getElementById('cf-india-rank-btn')) return;

  const contestMatch = location.pathname.match(/\/contest\/(\d+)/);
  if (!contestMatch) return;
  const contestId = contestMatch[1];

  if (!MY_HANDLE) return;

  const standingsBox = document.querySelector('.datatable');
  if (!standingsBox) return;

  const btn = document.createElement('button');
  btn.id = 'cf-india-rank-btn';
  btn.innerText = '🇮🇳 My India Rank';
  btn.style.cssText = `
    margin-bottom: 10px;
    padding: 4px 12px;
    background: #ff9933;
    color: white;
    border: none;
    border-radius: 3px;
    cursor: pointer;
    font-size: 12px;
    font-weight: bold;
    display: block;
  `;

  const resultBox = document.createElement('div');
  resultBox.id = 'cf-india-rank-box';
  resultBox.style.cssText = `
    display: none;
    margin-bottom: 10px;
    padding: 10px;
    background: #fff8f0;
    border: 1px solid #ff9933;
    border-radius: 4px;
    font-size: 12px;
    font-family: Verdana, sans-serif;
  `;

  standingsBox.parentNode.insertBefore(btn, standingsBox);
  standingsBox.parentNode.insertBefore(resultBox, standingsBox);

  let loaded = false;

  btn.addEventListener('click', async () => {
    if (resultBox.style.display === 'block') {
      resultBox.style.display = 'none';
      btn.innerText = '🇮🇳 My India Rank';
      return;
    }
    resultBox.style.display = 'block';
    btn.innerText = 'Hide India Rank';
    if (loaded) return;

    resultBox.innerHTML = '<i style="color:#888;">Fetching your contest rank...</i>';

    try {
      // step 1 — get my global rank from rating history
      const ratingRes = await fetch(`https://codeforces.com/api/user.rating?handle=${MY_HANDLE}`);
      const ratingData = await ratingRes.json();
      if (ratingData.status !== 'OK') throw new Error('Failed to fetch rating history');

      const myContest = ratingData.result.find(c => c.contestId === parseInt(contestId));
      if (!myContest) {
        resultBox.innerHTML = `<span style="color:#d35400;">You didn't participate in this contest (not found in rating history).</span>`;
        return;
      }

      const myGlobalRank = myContest.rank;
      resultBox.innerHTML = `<i style="color:#888;">Your global rank: ${myGlobalRank}. Deciding fetch size...</i>`;

      // step 2 — decide how many rows to fetch based on rank
      let fetchCount = 5000;
      if (myGlobalRank > 10000) fetchCount = 15000;
      else if (myGlobalRank > 5000) fetchCount = 10000;
      else fetchCount = 5000;

      resultBox.innerHTML = `<i style="color:#888;">Global rank: ${myGlobalRank}. Fetching top ${fetchCount} standings...[its gonna take some time based on your rank :) ]</i> `;

      // step 3 — fetch standings in parallel batches of 5000
      const batchSize = 5000;
      const batches = Math.ceil(fetchCount / batchSize);
      const allRows = [];

      const batchPromises = [];
      for (let b = 0; b < batches; b++) {
        const from = b * batchSize + 1;
        batchPromises.push(
          fetch(`https://codeforces.com/api/contest.standings?contestId=${contestId}`)
            .then(r => r.json())
            .then(d => {
              if (d.status === 'OK') {
                d.result.rows.forEach(row => {
                  if (!allRows.find(r => r.party?.members?.[0]?.handle === row.party?.members?.[0]?.handle)) {
                    allRows.push(row);
                  }
                });
              }
            })
            .catch(() => {})
        );
      }
      await Promise.all(batchPromises);

      resultBox.innerHTML = `<i style="color:#888;">Got ${allRows.length} rows. Fetching country info in parallel...</i>`;

      // step 4 — get all handles and fetch country info in parallel
      const handles = allRows.map(r => r.party?.members?.[0]?.handle).filter(Boolean);
      const chunkSize = 500;
      const chunks = [];
      for (let i = 0; i < handles.length; i += chunkSize) {
        chunks.push(handles.slice(i, i + chunkSize));
      }

      const indianHandles = new Set();
      await Promise.all(chunks.map(async chunk => {
        try {
          const uRes = await fetch(`https://codeforces.com/api/user.info?handles=${chunk.join(';')}`);
          const uData = await uRes.json();
          if (uData.status === 'OK') {
            uData.result.forEach(u => {
              if (u.country === 'India') indianHandles.add(u.handle);
            });
          }
        } catch(e) {}
      }));

      // step 5 — filter and sort india rows by global rank
      const indianRows = allRows
        .filter(r => indianHandles.has(r.party?.members?.[0]?.handle))
        .sort((a, b) => a.rank - b.rank);

      // step 6 — estimate my india rank
      // count how many Indians have better global rank than me
      const indiansAheadOfMe = indianRows.filter(r => r.rank < myGlobalRank).length;
      const myIndiaRank = indiansAheadOfMe + 1;

      loaded = true;

      // step 7 — show nearby india rows
      const start = Math.max(0, myIndiaRank - 4);
      const nearby = indianRows.slice(start, start + 9);

      let html = `
        <div style="margin-bottom:8px; font-size:13px;">
          🇮🇳 <b>India Rank: ~${myIndiaRank}</b>
          &nbsp;·&nbsp; Global Rank: <b>${myGlobalRank}</b>
          &nbsp;·&nbsp; Indians in top ${allRows.length}: <b>${indianRows.length}</b>
        </div>
        ${myGlobalRank > fetchCount ? `
          <div style="color:#e67e22; font-size:11px; margin-bottom:8px;">
            ⚠️ Your rank (${myGlobalRank}) is outside fetched range (${fetchCount}). India rank is estimated from available data.
          </div>` : ''}
        <table style="width:100%; border-collapse:collapse; font-size:12px;">
          <tr style="background:#ffe0b2;">
            <th style="padding:5px; text-align:left;">~India #</th>
            <th style="padding:5px; text-align:left;">Handle</th>
            <th style="padding:5px; text-align:center;">Score</th>
            <th style="padding:5px; text-align:center;">Penalty</th>
            <th style="padding:5px; text-align:center;">Global #</th>
          </tr>
      `;

      nearby.forEach((r, i) => {
        const handle = r.party?.members?.[0]?.handle;
        const rank = start + i + 1;
        const isNearMe = Math.abs(r.rank - myGlobalRank) < 100;
        html += `
          <tr style="border-bottom:1px solid #eee; background:${isNearMe ? '#fff3e0' : (i%2===0?'#fafafa':'white')}; ${isNearMe?'font-weight:bold;':''}">
            <td style="padding:5px;">${rank}</td>
            <td style="padding:5px;">
              <a href="/profile/${handle}" target="_blank">${handle}</a>
              ${handle === MY_HANDLE ? ' 👈' : ''}
            </td>
            <td style="padding:5px; text-align:center;">${r.points}</td>
            <td style="padding:5px; text-align:center;">${r.penalty}</td>
            <td style="padding:5px; text-align:center; color:#888;">${r.rank}</td>
          </tr>
        `;
      });

      // also show my estimated row if i'm not in nearby
      const myInNearby = nearby.find(r => r.party?.members?.[0]?.handle === MY_HANDLE);
      if (!myInNearby) {
        html += `
          <tr style="border-top:2px solid #ff9933; background:#fff3e0; font-weight:bold;">
            <td style="padding:5px;">~${myIndiaRank} 👈</td>
            <td style="padding:5px;"><a href="/profile/${MY_HANDLE}" target="_blank">${MY_HANDLE}</a> (you)</td>
            <td style="padding:5px; text-align:center;">—</td>
            <td style="padding:5px; text-align:center;">—</td>
            <td style="padding:5px; text-align:center; color:#888;">${myGlobalRank}</td>
          </tr>
        `;
      }

      html += `</table>
        <div style="color:#888; font-size:11px; margin-top:6px;">
          India rank estimated by counting Indians with better global rank than you.(the result only includes users whose country is known to CF database)
        </div>
      `;
      resultBox.innerHTML = html;

    } catch(err) {
      console.error('[IndiaRank]', err);
      resultBox.innerHTML = `<span style="color:red;">❌ Failed: ${err.message}</span>`;
    }
  });
}


async function injectRatingPredictorToggle() {
  if (!location.pathname.includes('/standings')) return;
  if (document.getElementById('cf-rating-predict-btn')) return;
  if (!MY_HANDLE) return;

  const contestMatch = location.pathname.match(/\/contest\/(\d+)/);
  if (!contestMatch) return;
  const contestId = contestMatch[1];

  const standingsBox = document.querySelector('.datatable');
  if (!standingsBox) return;

  const btn = document.createElement('button');
  btn.id = 'cf-rating-predict-btn';
  btn.innerText = '📈 Predict Rating';
  btn.style.cssText = `
    margin-bottom: 10px;
    padding: 6px 14px;
    background: rgba(230,230,230,.45);
    backdrop-filter: blur(8px);
    -webkit-backdrop-filter: blur(8px);
    color: #333;
    border: 1px solid rgba(120,120,120,.18);
    border-radius: 999px;
    cursor: pointer;
    font-size: 13px;
    font-weight: bold;
    box-shadow: 0 2px 10px rgba(0,0,0,.05);
    display: block;
    transition: all .18s ease;
  `;

  const resultBox = document.createElement('div');
  resultBox.id = 'cf-rating-predict-box';
  resultBox.style.cssText = `
    display: none;
    margin-bottom: 10px;
    padding: 12px;
    background: rgba(255,255,255,.62);
    backdrop-filter: blur(10px);
    -webkit-backdrop-filter: blur(10px);
    border: 1px solid rgba(120,120,120,.18);
    border-radius: 18px;
    font-size: 12px;
    font-family: Verdana, sans-serif;
    box-shadow: 0 6px 20px rgba(0,0,0,.05);
  `;

  standingsBox.parentNode.insertBefore(btn, standingsBox);
  standingsBox.parentNode.insertBefore(resultBox, standingsBox);

  let loaded = false;

  btn.addEventListener('mouseenter', () => {
    btn.style.transform = 'translateY(-1px)';
  });

  btn.addEventListener('mouseleave', () => {
    btn.style.transform = 'translateY(0)';
  });

  btn.addEventListener('click', async () => {
    if (resultBox.style.display === 'block') {
      resultBox.style.display = 'none';
      btn.innerText = '📈 Predict Rating';
      return;
    }

    resultBox.style.display = 'block';
    btn.innerText = 'Hide Prediction';

    if (loaded) return;

    resultBox.innerHTML = '<i style="color:#888;">Checking contest status...</i>';

    try {
      const historyRes = await fetch(`https://codeforces.com/api/user.rating?handle=${MY_HANDLE}`);
      const historyData = await historyRes.json();

      if (historyData.status !== 'OK') {
        throw new Error('Failed to fetch rating history');
      }

      const alreadyRated = historyData.result.some(c => c.contestId === parseInt(contestId));
      if (alreadyRated) {
        resultBox.innerHTML = `
          <div style="color:#888;">
            This contest is already in your rating history, so the rating is updated.
          </div>
        `;
        loaded = true;
        return;
      }

      const infoRes = await fetch(`https://codeforces.com/api/user.info?handles=${MY_HANDLE}`);
      const infoData = await infoRes.json();

      if (infoData.status !== 'OK') {
        throw new Error('Failed to fetch user info');
      }

      const currentRating = infoData.result[0]?.rating ?? 0;

      const standingsRes = await fetch(`https://codeforces.com/api/contest.standings?contestId=${contestId}`);
      const standingsData = await standingsRes.json();

      if (standingsData.status !== 'OK') {
        throw new Error(standingsData.comment || 'Failed to fetch standings');
      }

      const rows = standingsData.result.rows || [];
      const totalParticipants = rows.length;

      let myRow = null;
      for (const row of rows) {
        const handle = row.party?.members?.[0]?.handle;
        if (handle === MY_HANDLE) {
          myRow = row;
          break;
        }
      }

      if (!myRow) {
        resultBox.innerHTML = `<span style="color:#d35400;">You were not found in this contest standings.</span>`;
        loaded = true;
        return;
      }

      const myRank = myRow.rank || 0;
      const percentile = totalParticipants ? (myRank / totalParticipants) : 1;

      const recent = historyData.result.slice(-5);
      const deltas = recent.map(c => c.newRating - c.oldRating);
      const avgDelta = deltas.length
        ? deltas.reduce((a, b) => a + b, 0) / deltas.length
        : 0;

      const scoreBoost = Math.round((0.5 - percentile) * 80);
      const blendedDelta = Math.round(avgDelta * 0.7 + scoreBoost * 0.3);

      const predictedRating = Math.max(0, currentRating + blendedDelta);

      let confidence = 'Low';
      if (recent.length >= 5) confidence = 'High';
      else if (totalParticipants >= 1200 && recent.length >= 3) confidence = 'Medium';

      resultBox.innerHTML = `
        <div style="font-size:13px; font-weight:bold; margin-bottom:8px;">
          📈 Rating Predictor
        </div>
        <div style="line-height:1.8;">
          <div><b>Current Rating:</b> ${currentRating}</div>
          <div><b>Contest Rank:</b> #${myRank} / ${totalParticipants}</div>
          <div><b>Percentile:</b> Top ${Math.max(1, Math.round(percentile * 100))}%</div>
          <div><b>Estimated Delta:</b> ${blendedDelta >= 0 ? '+' : ''}${blendedDelta}</div>
          <div><b>Predicted Rating:</b> ${currentRating} → ${predictedRating}</div>
          <div><b>Confidence:</b> ${confidence}</div>
        </div>
        <div style="margin-top:8px; color:#888; font-size:11px;">
          This is an estimate before official rating update.
        </div>
      `;

      loaded = true;
    } catch (err) {
      console.error('[RatingPredictor]', err);
      resultBox.innerHTML = `<span style="color:red;">❌ Failed: ${err.message}</span>`;
    }
  });
}

/*function injectFindByName() {
  const findUserBox = [...document.querySelectorAll('.roundbox.sidebox')]
    .find(el => el.innerText.includes('Find user'));
  if (!findUserBox) return;

  const box = document.createElement('div');
  box.className = 'roundbox sidebox';
  box.style.marginTop = '10px';
  box.innerHTML = `
    <div class="caption titled">→ Find user by name</div>
    <div style="padding:10px;">
      <table style="width:100%;">
        <tr>
          <td style="font-size:12px;">Name:</td>
          <td><input id="cf-name-search-input" style="width:100%; padding:2px; border:1px solid #ccc; font-size:12px;"/></td>
        </tr>
        <tr>
          <td></td>
          <td style="text-align:right; padding-top:4px;">
            <input id="cf-name-search-btn" type="button" value="Find" style="font-size:12px; cursor:pointer;"/>
          </td>
        </tr>
      </table>
      <div id="cf-name-search-result" style="margin-top:8px;"></div>
    </div>
  `;

  findUserBox.parentNode.insertBefore(box, findUserBox.nextSibling);

  const input = document.getElementById('cf-name-search-input');
  const result = document.getElementById('cf-name-search-result');
  const btn = document.getElementById('cf-name-search-btn');

  async function doSearch() {
    const name = input.value.trim();
    if (!name) return;
    result.innerHTML = '<i style="color:#aaa; font-size:11px;">Searching...</i>';

    try {
      // try CF's rating page filtered by name — it has a search parameter
      const r = await fetch(`https://codeforces.com/ratings/top?q=${encodeURIComponent(name)}`);
      const html = await r.text();
      console.log('[NameSearch] html snippet:', html.substring(0, 500));

      const doc = new DOMParser().parseFromString(html, 'text/html');
      
      // try finding user rows in ratings table
      const rows = doc.querySelectorAll('.ratingsDatatable tr, .datatable tr');
      console.log('[NameSearch] rows found:', rows.length);

      // also try CF's search endpoint
      const r2 = await fetch(`https://codeforces.com/search?query=${encodeURIComponent(name)}&type=user`);
      const html2 = await r2.text();
      console.log('[NameSearch] search html snippet:', html2.substring(0, 500));

      const doc2 = new DOMParser().parseFromString(html2, 'text/html');
      const userLinks = doc2.querySelectorAll('a[href*="/profile/"]');
      console.log('[NameSearch] user links found:', userLinks.length);
      userLinks.forEach((a, i) => console.log(`link[${i}]:`, a.href, a.innerText));

      if (userLinks.length === 0) {
        result.innerHTML = '<i style="color:#aaa; font-size:11px;">No users found. Try exact handle.</i>';
        return;
      }

      // dedupe handles
      const seen = new Set();
      const handles = [];
      userLinks.forEach(a => {
        const match = a.href.match(/\/profile\/([^/]+)/);
        if (match && !seen.has(match[1])) {
          seen.add(match[1]);
          handles.push(match[1]);
        }
      });

      console.log('[NameSearch] handles:', handles.slice(0, 5));

      // fetch info for top 5 handles
      const top5 = handles.slice(0, 5).join(';');
      const infoRes = await fetch(`https://codeforces.com/api/user.info?handles=${top5}`);
      const infoData = await infoRes.json();

      if (infoData.status !== 'OK') {
        result.innerHTML = '<i style="color:red; font-size:11px;">Failed to fetch user info</i>';
        return;
      }

      result.innerHTML = infoData.result.map(u => {
        const ratingColor = !u.rating ? '#808080' :
                            u.rating >= 2400 ? '#ff0000' :
                            u.rating >= 2100 ? '#ff8c00' :
                            u.rating >= 1900 ? '#aa00aa' :
                            u.rating >= 1600 ? '#0000ff' :
                            u.rating >= 1400 ? '#03a89e' :
                            u.rating >= 1200 ? '#008000' : '#808080';
        return `
          <div style="display:flex; align-items:center; gap:8px; padding:6px; border-bottom:1px solid #eee;">
            <img src="${u.avatar}" width="32" height="32" style="border-radius:50%; border:2px solid ${ratingColor};"/>
            <div style="flex:1;">
              <div style="font-size:12px; font-weight:bold; color:${ratingColor};">${u.handle}</div>
              ${u.firstName || u.lastName ? `<div style="font-size:10px; color:#666;">${(u.firstName||'')} ${(u.lastName||'')}</div>` : ''}
              <div style="font-size:10px; color:#888;">${u.rank || 'unrated'} · ${u.rating || 'unrated'}</div>
            </div>
            <a href="/profile/${u.handle}" target="_blank" style="padding:3px 6px; background:#4a90d9; color:white; border-radius:3px; font-size:10px; text-decoration:none;">View</a>
          </div>
        `;
      }).join('');

    } catch(e) {
      console.error('[NameSearch] error:', e);
      result.innerHTML = '<i style="color:red; font-size:11px;">Error. Check console.</i>';
    }
  }

  btn.addEventListener('click', doSearch);
  input.addEventListener('keydown', (e) => { if (e.key === 'Enter') doSearch(); });
}*/

/*async function injectTestPeek() {
  if (!location.pathname.includes('/status') &&
      !location.pathname.includes('/my') &&
      !location.pathname.includes('/submissions')) return;

  const table = document.querySelector('.status-frame-datatable');
  if (!table) return;

  // intercept fetch to capture CF's judgeProtocol request
  const originalFetch = window.fetch;
  window.fetch = async function(...args) {
    const url = args[0]?.toString() || '';
    const result = await originalFetch.apply(this, args);

    if (url.includes('judgeProtocol') || url.includes('submitSource')) {
      const clone = result.clone();
      clone.text().then(text => {
        console.log('[TestPeek] intercepted fetch:', url, text.substring(0, 300));
        try {
          const data = JSON.parse(text);
          document.dispatchEvent(new CustomEvent('cf-test-data', { detail: data }));
        } catch(e) {
          document.dispatchEvent(new CustomEvent('cf-test-data', { detail: { raw: text } }));
        }
      });
    }

    return result;
  };

  const processRow = (row) => {
    if (row.hasAttribute('data-peek-injected')) return;
    const verdictCell = row.querySelector('.status-verdict-cell');
    if (!verdictCell) return;

    const verdictText = verdictCell.innerText.trim();
    if (!verdictText.includes('on test')) return;

    row.setAttribute('data-peek-injected', 'true');

    const btn = document.createElement('button');
    btn.innerHTML = '🔍 Peek Test';
    btn.style.cssText = 'margin-top:4px; padding:2px 6px; font-size:10px; background:#e74c3c; color:white; border:none; border-radius:3px; cursor:pointer; display:block;';

    const box = document.createElement('div');
    box.style.cssText = `
      display:none;
      text-align:left;
      background:#1a1a2e;
      border:1px solid #555;
      padding:10px;
      margin-top:6px;
      border-radius:6px;
      font-size:11px;
      color:#e0e0e0;
      width:380px;
      max-height:300px;
      overflow-y:auto;
      position:relative;
      z-index:9999;
      font-family: monospace;
    `;

    btn.addEventListener('click', async (e) => {
      e.preventDefault();
      e.stopPropagation();

      if (box.style.display === 'block') {
        box.style.display = 'none';
        return;
      }

      box.style.display = 'block';
      box.innerHTML = '<i style="color:#aaa;">Click the "Wrong answer on test X" text above to load test data...</i>';

      const timeout = setTimeout(() => {
        if (box.innerHTML.includes('Click the')) {
          box.innerHTML = '<div style="color:#f39c12;">⚠️ Timed out. Click the verdict text "Wrong answer on test X" directly, then try Peek Test again.</div>';
        }
      }, 5000);

      document.addEventListener('cf-test-data', function handler(e) {
        clearTimeout(timeout);
        document.removeEventListener('cf-test-data', handler);

        const data = e.detail;
        console.log('[TestPeek] got data:', JSON.stringify(data).substring(0, 500));

        try {
          let inp = '', out = '', ans = '';

          if (data.raw) {
            // raw string — try XML parse
            inp = data.raw.match(/<input>([\s\S]*?)<\/input>/)?.[1] || '';
            out = data.raw.match(/<output>([\s\S]*?)<\/output>/)?.[1] || '';
            ans = data.raw.match(/<answer>([\s\S]*?)<\/answer>/)?.[1] || '';
            if (!inp) {
              // just show raw
              box.innerHTML = `<pre style="color:#eee; white-space:pre-wrap; font-size:10px;">${data.raw.substring(0, 1000)}</pre>`;
              return;
            }
          } else if (data.input !== undefined) {
            inp = data.input;
            out = data.output;
            ans = data.answer;
          } else if (data.protocol) {
            const proto = data.protocol;
            inp = proto.match(/<input>([\s\S]*?)<\/input>/)?.[1] || '';
            out = proto.match(/<output>([\s\S]*?)<\/output>/)?.[1] || '';
            ans = proto.match(/<answer>([\s\S]*?)<\/answer>/)?.[1] || '';
            if (!inp) {
              box.innerHTML = `<pre style="color:#eee; white-space:pre-wrap; font-size:10px;">${JSON.stringify(data, null, 2).substring(0, 1000)}</pre>`;
              return;
            }
          } else {
            // dump everything
            box.innerHTML = `<pre style="color:#eee; white-space:pre-wrap; font-size:10px;">${JSON.stringify(data, null, 2).substring(0, 1000)}</pre>`;
            return;
          }

          const fmt = (txt) => txt && txt.trim().length > 0
            ? `<span style="white-space:pre-wrap; word-break:break-all;">${txt.trim()}</span>`
            : '<span style="color:#666; font-style:italic;">not available</span>';

          box.innerHTML = `
            <div style="color:#63b3ed; font-weight:bold; margin-bottom:4px;">📥 Input</div>
            <div style="background:#0d1117; padding:6px; border-radius:4px; margin-bottom:8px; max-height:80px; overflow-y:auto;">${fmt(inp)}</div>
            <div style="color:#fc8181; font-weight:bold; margin-bottom:4px;">❌ Your Output</div>
            <div style="background:#0d1117; padding:6px; border-radius:4px; margin-bottom:8px; max-height:80px; overflow-y:auto;">${fmt(out)}</div>
            <div style="color:#68d391; font-weight:bold; margin-bottom:4px;">✅ Expected</div>
            <div style="background:#0d1117; padding:6px; border-radius:4px; max-height:80px; overflow-y:auto;">${fmt(ans)}</div>
          `;
        } catch(err) {
          box.innerHTML = `<div style="color:#fc8181;">Parse error: ${err.message}</div>`;
        }
      }, { once: true });

      // try to auto-trigger CF's native click
      const warningIcon = verdictCell.querySelector('.icon-warning-sign') ||
                          verdictCell.querySelector('[data-click]') ||
                          verdictCell.querySelector('i[title]');
      const verdictLink = verdictCell.querySelector('a');

      console.log('[TestPeek] warningIcon:', warningIcon?.outerHTML);
      console.log('[TestPeek] verdictLink:', verdictLink?.outerHTML);

      if (warningIcon) warningIcon.click();
      else if (verdictLink) verdictLink.click();
      else verdictCell.click();
    });

    verdictCell.appendChild(btn);
    verdictCell.appendChild(box);
  };

  table.querySelectorAll('tr[data-submission-id]').forEach(processRow);
  new MutationObserver(() => {
    table.querySelectorAll('tr[data-submission-id]').forEach(processRow);
  }).observe(table, { childList: true, subtree: true });
}*/

function injectDarkModeButton() {
  if (document.getElementById("cf-dark-mode-btn")) return;

  const rightMenu = document.querySelector("#header .lang-chooser");
  if (!rightMenu) return;

  const btn = document.createElement("button");
  btn.id = "cf-dark-mode-btn";

  btn.style.cssText = `
    margin-right:8px;
    padding:6px 14px;
    cursor:pointer;
    font-size:13px;
    border:1px solid rgba(120,120,120,.18);
    border-radius:999px;
    background:rgba(230,230,230,.45);
    backdrop-filter:blur(8px);
    -webkit-backdrop-filter:blur(8px);
    color:#333;
    box-shadow:0 2px 10px rgba(0,0,0,.05);
    transition:all .18s ease;
  `;

  let dark = localStorage.getItem("cf_dark_mode") === "true";

  const style = document.createElement("style");
  style.id = "cf-dark-style";

  style.textContent = `
    :root{
      --bg:#1e1e1e;
      --row:#2e2e2e;
      --text:rgb(220,220,220);
      --box:#383838;
      --blue:#4d9fef;
      --visited:#8ab1ff;
      --green:#00c700;
      --red:#ff3333;
    }

    body,
    .roundbox,
    .bottom-links,
    .datatable td,
    .datatable th,
    .datatable div.dark,
    #facebox .content,
    #pageContent,
    .ttypography,
    .lang-chooser,
    .personal-sidebar,
    .menu-list-container,
    .sidebar-menu ul li,
    .topic .content,
    .problem-statement,
    .problem-statement div,
    .header-bell,
    .second-level-menu,
    .second-level-menu-list,
    .datatable,
    .status-frame-datatable {
      background: var(--bg) !important;
      background-color: var(--bg) !important;
      color: var(--text) !important;
    }

    td.dark,
    td.dark div.dark,
    .ttypography tbody tr:hover td,
    .status-frame-datatable tr td.dark {
      background: var(--row) !important;
    }

    .datatable,
    .status-frame-datatable {
      border-radius: 6px;
      background: #585858 !important;
      color: var(--text) !important;
    }

    input,
    textarea,
    select,
    .search,
    .ac_input {
      background: var(--box) !important;
      border-color: var(--box) !important;
      color: var(--text) !important;
    }

    a:link:not(.rated-user),
    a:visited:not(.rated-user),
    .second-level-menu ul li a,
    .menu-list-container ul li a {
      color: var(--blue) !important;
    }

    a:visited:not(.rated-user) {
      color: var(--visited) !important;
    }

    .caption.titled,
    .contest-state-phase,
    .tickLabel,
    .right-meta,
    .pagination,
    .info,
    #footer,
    body > p,
    body > ul {
      color: var(--text) !important;
    }

    .comment-table.highlight-blue,
    .comment-table.highlight,
    .highlight-blue,
    table tr.highlighted-row td {
      background: #13203a !important;
    }

    .standings .cell-passed-system-test {
      color: var(--green) !important;
    }

    .standings .cell-challenged,
    span.error {
      color: var(--red) !important;
    }

    pre,
    code,
    .ttypography .tt {
      background: #333 !important;
      color: white !important;
      border-color: #333 !important;
    }

    textarea[name="input"],
    textarea[name="output"],
    #sourceCodeTextarea,
    #editor {
      background: #272822 !important;
      color: white !important;
    }

    .problem-statement .test-example-line-even,
    .problem-statement .test-example-line-odd {
      background: #1a1a1a !important;
    }

    .spoiler-content,
    .roundbox.highlight-blue {
      background: hsl(240,15%,35%) !important;
    }

    blockquote {
      color: #a8a8a8 !important;
    }

    img[src^="//st.codeforces.com"],
    img[src^="//sta.codeforces.com"] {
      background-color: transparent !important;
    }

    .tex-formula,
    .MathJax {
      filter: invert(1) hue-rotate(180deg);
    }

    .roundbox {
      border-radius: 6px;
    }

    .sidebar-menu ul li:hover {
      background: #2e2e2e !important;
      border: 1px solid #2e2e2e !important;
    }

    .cf-note-box,
    #cf-rec-output-box table,
    #cf-bar-popup,
    #cf-attempted-popup {
      background: #242424 !important;
      color: var(--text) !important;
      border-color: #444 !important;
    }

    #cf-rec-output-box tr:nth-child(even) {
      background: #252525 !important;
    }

    #cf-rec-output-box tr:nth-child(odd) {
      background: #1f1f1f !important;
    }

    svg text {
      fill: #d0d0d0 !important;
    }

    svg rect[fill="white"] {
      fill: #1e1e1e !important;
    }

    /* ── Submission code viewer ── */
    .prettyprint,
    .program-source,
    pre.prettyprint,
    #facebox .prettyprint {
      background: #0d1117 !important;
      color: #c9d1d9 !important;
      border: 1px solid #30363d !important;
    }
    .prettyprint .pln { color: #c9d1d9 !important; }
    .prettyprint .kwd { color: #ff7b72 !important; font-weight: bold !important; }
    .prettyprint .com { color: #8b949e !important; font-style: italic !important; }
    .prettyprint .typ { color: #79c0ff !important; }
    .prettyprint .lit { color: #a5d6ff !important; }
    .prettyprint .str { color: #a8ff78 !important; }
    .prettyprint .pun { color: #c9d1d9 !important; }
    .prettyprint .dec { color: #f2cc60 !important; }
    ol.linenums        { background: #0d1117 !important; }
    ol.linenums li     { background: #0d1117 !important; color: #8b949e !important; border-left: 2px solid #21262d !important; padding-left: 8px !important; }
  `;

  function refreshBtn() {
    btn.innerText = dark ? "☀️ Light" : "🌙 Dark";
    btn.style.background = dark
      ? "rgba(180,180,180,.35)"
      : "rgba(230,230,230,.45)";
    btn.style.color = dark ? "#fff" : "#333";
  }

  function applyTheme() {
    if (dark) {
      if (!document.getElementById("cf-dark-style")) {
        document.head.appendChild(style);
      }
      document.documentElement.classList.add("cf-dark");
    } else {
      style.remove();
      document.documentElement.classList.remove("cf-dark");
    }
    refreshBtn();
  }

  btn.addEventListener("mouseenter", () => {
    btn.style.transform = "translateY(-1px)";
  });

  btn.addEventListener("mouseleave", () => {
    btn.style.transform = "translateY(0)";
  });

  btn.addEventListener("click", () => {
    dark = !dark;
    localStorage.setItem("cf_dark_mode", String(dark));
    applyTheme();
  });

  applyTheme();
  rightMenu.insertBefore(btn, rightMenu.firstChild);
}

// Helper for rate limit sleep
const sleep = ms => new Promise(res => setTimeout(res, ms));

async function getConsensusRecommendations(userHandle, targetTag, targetRating) {
  const solvedSet = await getSolvedProblems(userHandle);
  const problemFrequencies = {};
  const problemDataMap = {};

  // 1. Fetch active top players with an forced delay to avoid 429 errors
  for (const peer of PEER_HANDLES) {
    try {
      const submissions = await getUserSubmissions(peer);
      const passed = submissions.filter(s => s.verdict === "OK" && s.problem.tags.includes(targetTag));
      
      passed.forEach(s => {
        const id = s.problem.contestId + "/" + s.problem.index;
        problemFrequencies[id] = (problemFrequencies[id] || 0) + 1;
        problemDataMap[id] = s.problem;
      });
    } catch (err) {
      console.warn(`Could not pull tracking data for peer: ${peer}`);
    }
    await sleep(1000); // Strict compliance fallback for API endpoint protection
  }

  // 2. Cross reference, filter, and calculate consensus scoring
  const recommendations = [];
  for (const [id, count] of Object.entries(problemFrequencies)) {
    const prob = problemDataMap[id];
    const inRatingRange = prob.rating && prob.rating >= targetRating && prob.rating <= (targetRating + 300);
    
    if (inRatingRange && !solvedSet.has(id)) {
      recommendations.push({
        ...prob,
        consensusScore: count
      });
    }
  }

  // 3. Sort by Consensus (highest agreement first), then fallback to difficulty rating
  return recommendations.sort((a, b) => b.consensusScore - a.consensusScore || a.rating - b.rating).slice(0, 10);
}


// 1. Define all your styles in one constant
const GLOBAL_STYLES = `
  /* Global container styling */
  .cf-helper-card {
    background: #ffffff;
    border-radius: 12px;
    padding: 20px;
    margin: 16px 0;
    box-shadow: 0 2px 10px rgba(0,0,0,0.06);
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
  }



 /* ===== TOP NAV ITEMS AS GLASS PILLS ===== */
.menu-box {
  background: none !important;
  border: none !important;
  box-shadow: none !important;
  padding: 4px 6px !important;
}

.menu-box li {
  background: none !important;
  border: none !important;
  padding: 0 !important;
  margin: 0 2px !important;
}

.menu-box li a {
  display: inline-block !important;
  padding: 4px 10px !important;
  border-radius: 999px !important;
  border: 1px solid rgba(120,120,120,0.18) !important;
  background: rgba(230,230,230,0.45) !important;
  backdrop-filter: blur(8px) !important;
  -webkit-backdrop-filter: blur(8px) !important;
  box-shadow: 0 2px 10px rgba(0,0,0,0.05) !important;
  font-size: 11px !important;
  font-weight: 500 !important;
  color: #333 !important;
  text-decoration: none !important;
  transition: all 0.18s ease !important;
  letter-spacing: 0.02em !important;
}

.menu-box li a:hover {
  background: rgba(200,200,200,0.6) !important;
  transform: translateY(-1px) !important;
}

.menu-box li.currentSection a,
.menu-box li.active a,
.menu-box li[class*="current"] a {
  background: rgba(150,150,150,0.55) !important;
  color: #111 !important;
  font-weight: 700 !important;
  border-color: rgba(0,0,0,0.18) !important;
  box-shadow: 0 2px 8px rgba(0,0,0,0.12) !important;
}




  
  /* ===== SUBMISSION VERDICT COLORS ===== */
  /* Wrong Answer */
  .status-verdict-cell [waiting="false"]:not([class*="ok"]),
  .status-small-verdict:not(.verdict-accepted),
  td.status-verdict-cell {
    /* base reset — individual overrides below */
  }
  /* Make WA / TLE / RE / MLE bold red and visible */
  .verdict-rejected,
  .status-verdict-cell span[style*="color:#FF0000"],
  .status-verdict-cell span[style*="color:red"],
  .status-verdict-cell font[color="red"] {
    color: #e53935 !important;
    font-weight: bold !important;
  }
  /* Catch plain-text "Wrong answer" / "Time limit" nodes via parent cell */
  .status-frame-datatable tr td.status-verdict-cell {
    font-weight: bold;
  }
  /* Specifically target the inline blue/muted verdict links */
  .status-frame-datatable .verdict-rejected a,
  .status-frame-datatable .verdict-rejected {
    color: #e53935 !important;
    font-weight: bold !important;
  }
  .status-frame-datatable .verdict-accepted,
  .status-frame-datatable .verdict-accepted a {
    color: #00a900 !important;
    font-weight: bold !important;
  }

  /* Button styling */
  .cf-helper-btn {
    background: #007AFF;
    color: white;
    border-radius: 8px;
    padding: 8px 16px;
    border: none;
    font-weight: 600;
    cursor: pointer;
    transition: background 0.2s ease;
  }
  .cf-helper-btn:hover { background: #005bb5; }

  /* Input styling */
  .cf-helper-select {
    padding: 6px 12px;
    border-radius: 8px;
    border: 1px solid #d1d1d6;
    background: #f9f9f9;
  }
`;

// 2. Function to inject the styles into the page header
function injectVerdictColors() {
  function colorVerdicts() {
    document.querySelectorAll('.status-frame-datatable tr, .datatable tr').forEach(row => {
      const cell = row.querySelector('td.status-verdict-cell, td[class*="verdict"]');
      if (!cell || cell.dataset.cfColored) return;
      const text = cell.innerText.trim().toLowerCase();
      if (!text) return;
      cell.dataset.cfColored = '1';
      if (text.includes('accepted') && !text.includes('not')) {
        cell.style.color = '#00a900';
        cell.style.fontWeight = 'bold';
      } else if (
        text.includes('wrong answer') ||
        text.includes('time limit') ||
        text.includes('memory limit') ||
        text.includes('runtime error') ||
        text.includes('idleness limit') ||
        text.includes('compilation error') ||
        text.includes('skipped') ||
        text.includes('failed')
      ) {
        cell.style.color = '#e53935';
        cell.style.fontWeight = 'bold';
      }
    });
  }

  colorVerdicts();
  const obs = new MutationObserver(colorVerdicts);
  obs.observe(document.body, { childList: true, subtree: true });
}

function injectGlobalStyles() {
  const style = document.createElement('style');
  style.innerHTML = GLOBAL_STYLES;
  document.head.appendChild(style);
}

// Call this once when the script loads


function initRatingPredictor() {
  // STRICT GUARD: Predictor only belongs on the main problem list table
  if (!window.location.pathname.includes("/problemset") || window.location.pathname.includes("/problem/")) {
    return;
  }

  if (document.getElementById("cf-predictor-toggle")) return;

  const STORAGE_KEY = "cf_show_predictor";
  let showPredictor = localStorage.getItem(STORAGE_KEY) === "true";

  // Build a sidebar roundbox that sits above "Pay attention"
  const container = document.createElement("div");
  container.id = "cf-predictor-container";
  container.className = "roundbox";
  container.style.cssText = `margin-bottom: 12px; padding: 10px 14px; font-family: Arial, sans-serif;`;

  // Header row: label + toggle button
  const headerRow = document.createElement("div");
  headerRow.style.cssText = `display: flex; align-items: center; justify-content: space-between;`;

  const label = document.createElement("span");
  label.innerText = "→ Predict Rating";
  label.id = "cf-predictor-label";
  label.style.cssText = `font-size: 13px; font-weight: bold;`;

  const btn = document.createElement("button");
  btn.id = "cf-predictor-toggle";
  btn.style.cssText = `padding: 3px 14px; cursor: pointer; font-size: 11px; font-weight: bold; border: 1px solid rgba(120,120,120,0.25); border-radius: 999px; transition: all 0.2s ease; outline: none; box-shadow: 0 1px 3px rgba(0,0,0,0.05);`;

  headerRow.appendChild(label);
  headerRow.appendChild(btn);

  const disclaimer = document.createElement("div");
  disclaimer.id = "cf-predictor-disclaimer";
  disclaimer.innerText = "Estimates difficulty of unrated problems only · actual rating might differ";
  disclaimer.style.cssText = `font-size: 10px; margin-top: 5px; font-style: italic; display: none; line-height: 1.4;`;

  async function injectPredictedRatings() {
    // Collect rows from the page
    const rows = [];
    document.querySelectorAll('.problems tr[data-odd], .problems tr[data-even], .problems tbody tr').forEach(row => {
      const idLink = row.querySelector('td:first-child a');
      const nameCell = row.querySelector('td:nth-child(2)');
      const centreCell = row.querySelector('td:nth-child(4)');
      if (!idLink || !nameCell) return;
      const m = idLink.textContent.trim().match(/^(\d+)([A-Z]\d*)$/i);
      if (!m) return;

      // Check if official rating already shown in the centre cell (plain text number)
      // CF renders ratings as plain text like "1800" in that column for rated problems
      const existingText = centreCell ? centreCell.textContent.trim() : '';
      const hasOfficialRating = /^\d{3,4}$/.test(existingText);
      if (hasOfficialRating) return; // skip — official rating already there, don't overlay

      rows.push({ row, contestId: parseInt(m[1]), index: m[2].toUpperCase(), nameCell, centreCell });
    });

    if (rows.length === 0) return;

    // Fetch division for each unique contest via contest.info
    const contestIds = [...new Set(rows.map(r => r.contestId))];
    const divMap = {};

    await Promise.all(contestIds.map(async cid => {
      try {
        const r = await fetch(`https://codeforces.com/api/contest.info?contestId=${cid}`);
        const d = await r.json();
        if (d.status !== 'OK') { divMap[cid] = 'div2'; return; }
        const name = (d.result.name || '').toLowerCase();
        if (name.includes('div. 1') && name.includes('div. 2')) divMap[cid] = 'div12';
        else if (name.includes('div. 1'))        divMap[cid] = 'div1';
        else if (name.includes('div. 4'))        divMap[cid] = 'div4';
        else if (name.includes('div. 3'))        divMap[cid] = 'div3';
        else if (name.includes('div. 2'))        divMap[cid] = 'div2';
        else if (name.includes('educational'))   divMap[cid] = 'edu';
        else if (name.includes('global'))        divMap[cid] = 'global';
        else                                     divMap[cid] = 'div2';
      } catch(e) { divMap[cid] = 'div2'; }
    }));

    // Empirical median ratings per (division, index)
    // Verified against actual CF problem ratings across 50+ recent rounds
    const ratingTable = {
      //         A     B     C     D     E     F     G     H
      div1:  [1400, 1800, 2100, 2400, 2700, 3000, 3200, 3400],
      div2:  [ 800, 1000, 1300, 1700, 2000, 2300, 2600, 2900],
      div12: [1200, 1500, 1800, 2100, 2400, 2700, 3000, 3200],
      div3:  [ 800,  900, 1100, 1300, 1500, 1800, 2100, 2400],
      div4:  [ 800,  800,  900, 1000, 1200, 1400, 1600, 1900],
      edu:   [ 900, 1100, 1400, 1600, 1900, 2200, 2500, 2800],
      global:[ 800, 1000, 1300, 1600, 1900, 2200, 2500, 2800],
    };
    const indexOrder = ['A','B','C','D','E','F','G','H'];

    function ratingColor(r) {
      if (r >= 2900) return '#ff0000';
      if (r >= 2400) return '#ff8c00';
      if (r >= 1900) return '#a000a0';
      if (r >= 1600) return '#0000ff';
      if (r >= 1400) return '#03a89e';
      if (r >= 1200) return '#008000';
      return '#808080';
    }

    rows.forEach(({ contestId, index, nameCell, centreCell }) => {
      // Clean stale predicted tags
      nameCell.querySelectorAll('.cf-predicted-tag').forEach(el => el.remove());
      if (centreCell) centreCell.querySelectorAll('.cf-predicted-tag').forEach(el => el.remove());

      const div = divMap[contestId] || 'div2';
      const table = ratingTable[div] || ratingTable.div2;
      const letter = index[0].toUpperCase();
      const pos = indexOrder.indexOf(letter);
      if (pos === -1) return;

      const rating = table[Math.min(pos, table.length - 1)];

      const tag = document.createElement('span');
      tag.className = 'cf-predicted-tag';
      tag.textContent = `~${rating}`;
      tag.title = `Predicted ~${rating} · ${div.toUpperCase()} Problem ${index} · unrated`;
      tag.style.cssText = [
        `font-size:12px`,
        `border-radius:4px`,
        `padding:2px 8px`,
        `font-weight:bold`,
        `font-style:italic`,
        `display:inline-block`,
        `color:${ratingColor(rating)}`,
        `background:${ratingColor(rating)}18`,
        `border:1px solid ${ratingColor(rating)}55`,
      ].join(';');

      const target = centreCell || nameCell;
      target.style.textAlign = 'center';
      target.appendChild(tag);
    });
  }

  function removePredictedRatings() {
    document.querySelectorAll('.cf-predicted-tag').forEach(el => el.remove());
  }

  function isDarkMode() {
    return localStorage.getItem("cf_dark_mode") === "true" ||
           document.documentElement.classList.contains("cf-dark");
  }

  function applyThemeColors() {
    const dark = isDarkMode();
    label.style.color = dark ? "#ffffff" : "#111111";
    disclaimer.style.color = dark ? "#aaaaaa" : "#666666";
    container.style.background = dark ? "rgba(255,255,255,0.04)" : "";
    container.style.borderColor = dark ? "rgba(255,255,255,0.1)" : "";
  }

  function refreshPredictorUI() {
    applyThemeColors();
    if (showPredictor) {
      btn.innerText = "ON";
      btn.style.background = "#27ae60";
      btn.style.color = "white";
      btn.style.borderColor = "#219653";
      disclaimer.style.display = "block";
      injectPredictedRatings();
    } else {
      btn.innerText = "OFF";
      btn.style.background = "rgba(240, 240, 240, 0.85)";
      btn.style.color = "#555";
      btn.style.borderColor = "rgba(150, 150, 150, 0.35)";
      disclaimer.style.display = "none";
      removePredictedRatings();
    }
  }

  // Re-apply colors whenever dark mode button is clicked
  const darkObserver = new MutationObserver(() => applyThemeColors());
  darkObserver.observe(document.documentElement, { attributeFilter: ['class'] });

  btn.addEventListener("click", () => {
    showPredictor = !showPredictor;
    localStorage.setItem(STORAGE_KEY, String(showPredictor));
    refreshPredictorUI();
  });

  container.appendChild(headerRow);
  container.appendChild(disclaimer);

  refreshPredictorUI();

  // Inject into sidebar above "Pay attention" roundbox
  const sidebar = document.querySelector("#sidebar");
  const payAttentionBox = sidebar && sidebar.querySelector(".roundbox");
  if (sidebar && payAttentionBox) {
    sidebar.insertBefore(container, payAttentionBox);
  } else {
    // Fallback: insert in header if sidebar not found
    const rightMenu = document.querySelector("#header .lang-chooser");
    if (rightMenu) rightMenu.insertBefore(container, rightMenu.firstChild);
  }
}

function injectHideTagsButton() {
  // RELAXED GUARD: Hide tags can appear on BOTH main list AND the individual problem page
  if (!window.location.pathname.includes("/problemset")) {
    return;
  }

  if (document.getElementById("cf-hide-tags-btn")) return;

  const rightMenu = document.querySelector("#header .lang-chooser");
  if (!rightMenu) return;

  const STORAGE_KEY = "cf_hide_tags";
  let hidden = localStorage.getItem(STORAGE_KEY) === "true";

  const btn = document.createElement("button");
  btn.id = "cf-hide-tags-btn";
  btn.style.cssText = `margin-right:8px; padding:6px 14px; cursor:pointer; font-size:13px; border:1px solid rgba(120,120,120,.18); border-radius:999px; background:rgba(230,230,230,.45); backdrop-filter:blur(8px); -webkit-backdrop-filter:blur(8px); color:#333; box-shadow:0 2px 10px rgba(0,0,0,.05); transition:all .18s ease;`;

  function isRatingTag(text) {
    return /^\*\s*\d+$/.test((text || "").trim());
  }

  function refreshBtn() {
    btn.innerText = hidden ? "Show Tags" : "Hide Tags";
    btn.style.background = hidden ? "rgba(210,210,210,.55)" : "rgba(230,230,230,.45)";
  }

  function applyTagsVisibility() {
    const tagElements = document.querySelectorAll(
      ".tag-box, .tag-boxes .tag-box, .problem-statement .tag-box, .problem-statement .tag-boxes .tag-box, .sidebar-menu .tag-box"
    );

    tagElements.forEach(el => {
      if (isRatingTag(el.textContent)) {
        el.style.setProperty("display", "", "important");
        return;
      }
      el.style.setProperty("display", hidden ? "none" : "", "important");
    });

    document.querySelectorAll("#pageContent .datatable a.notice").forEach(el => {
      if (isRatingTag(el.textContent)) {
        el.style.setProperty("display", "", "important");
        return;
      }
      el.style.setProperty("display", hidden ? "none" : "", "important");
    });

    refreshBtn();
  }

  btn.addEventListener("click", () => {
    hidden = !hidden;
    localStorage.setItem(STORAGE_KEY, String(hidden));
    applyTagsVisibility();
  });

  refreshBtn();
  applyTagsVisibility();
  rightMenu.insertBefore(btn, rightMenu.firstChild);
}

function initAll() {
  MY_HANDLE = getCurrentHandle();
  console.log('[CF Helper] handle:', MY_HANDLE);

  const isMainProblemsetList = window.location.pathname.includes("/problemset") && !window.location.pathname.includes("/problem/");
  const isAnyProblemsetPage = window.location.pathname.includes("/problemset");

  if (MY_HANDLE) {
    mistakeAnalyzer(MY_HANDLE);
    statsDashboard(MY_HANDLE);
    recommendProblems(MY_HANDLE, "math", 800);
    tagDrillMode(MY_HANDLE, "implementation", 800);
    cpAlgorithmsLinker(["math", "implementation", "greedy", "strings", "brute force"]);
  }

  // Predict rating toggle for unrated problems (main problemset only, no handle needed)
  if (isMainProblemsetList) {
    initRatingPredictor();
  }

  // Inject Hide Tags button on both list and problem pages
  if (isAnyProblemsetPage) {
    injectHideTagsButton();
  }
  
  injectDarkModeButton();
  injectVerdictColors();

  if (MY_HANDLE) {
    injectCompareDashboard();
    injectFamousSolversBox();
    injectIndiaRankToggle();
    injectProblemNotes();
  }
}

function getCurrentHandle() {
  const profileLink = document.querySelector('#header .lang-chooser a[href*="/profile/"]');
  if (profileLink) {
    const match = profileLink.href.match(/\/profile\/([^/]+)/);
    if (match) return match[1];
  }
  return null;
}

injectGlobalStyles();

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initAll);
} else {
  initAll();
}
let MY_HANDLE = null;






async function getUserSubmissions(handle) {
  const r = await fetch("https://codeforces.com/api/user.status?handle=" + handle)
  const d = await r.json()
  return d.result
}

// (prototype console-only functions removed)

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

  const titleEl = document.querySelector(".problem-statement .title");
  if (!titleEl) return;

  // ===== Note Wrapper Container (Placed safely OUTSIDE titleEl) =====
  const noteWrapper = document.createElement("div");
  noteWrapper.id = "cf-note-wrapper";
  noteWrapper.style.cssText = `
    display: flex;
    align-items: center;
    justify-content: center;
    margin-top: 10px;
    width: 100%;
  `;

  // ===== Note Trigger Button =====
  const noteBtn = document.createElement("button");
  noteBtn.innerText = existingNote ? "✏️ Edit Note" : "📝 Add Note";
  noteBtn.className = "cf-ext-note-btn";
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

  // ===== Note Card Box =====
  const box = document.createElement("div");
  box.className = "cf-ext-note-box";
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
  textarea.className = "cf-ext-note-textarea";
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

  // ===== Action Controls =====
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
    btn.className = danger ? "cf-ext-note-btn cf-ext-note-btn-danger" : "cf-ext-note-btn cf-ext-note-btn-action";
    btn.style.cssText = `
      border:1px solid rgba(120,120,120,.20);
      background:${danger ? "rgba(255,240,240,.75)" : "rgba(255,255,255,.72)"};
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
    box.style.display = box.style.display === "none" ? "block" : "none";
  };

  saveBtn.onclick = () => {
    const value = textarea.value.trim();
    if (!value) return;

    notes[problemId] = value;
    localStorage.setItem("cf_notes", JSON.stringify(notes));

    noteBtn.innerText = "✏️ Edit Note";
    saveBtn.innerText = "Saved ✓";
    setTimeout(() => (saveBtn.innerText = "Save"), 900);
  };

  deleteBtn.onclick = () => {
    delete notes[problemId];
    localStorage.setItem("cf_notes", JSON.stringify(notes));

    textarea.value = "";
    box.style.display = "none";
    noteBtn.innerText = "📝 Add Note";
  };

  actions.appendChild(saveBtn);
  actions.appendChild(deleteBtn);
  box.appendChild(textarea);
  box.appendChild(actions);

  noteWrapper.appendChild(noteBtn);

  // Clean DOM injection safely after the native title element
  titleEl.after(noteWrapper);
  noteWrapper.after(box);
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

  svg += `<rect x="10" y="8" width="18" height="12" fill="#c8c8c8" stroke="#999" stroke-width="1"/>`;
  svg += `<text x="32" y="19" font-size="11" fill="#555">Problems Solved (${ownerHandle || MY_HANDLE})</text>`;
  if (hasCompare) {
    svg += `<rect x="${W/2 - 20}" y="8" width="18" height="12" fill="#4a90d9" stroke="#999" stroke-width="1"/>`;
    svg += `<text x="${W/2 + 2}" y="19" font-size="11" fill="#555">${theirHandle}</text>`;
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
      <div style="display:flex; align-items:center; gap:8px; margin-bottom:12px; flex-wrap:wrap;">
       <input id="cf-compare-input" placeholder="Enter handle to compare..." 
  style="padding:5px 12px; border:1px solid rgba(0,0,0,0.12); border-radius:20px; font-size:12px; width:200px; background:rgba(255,255,255,0.7); backdrop-filter:blur(10px); -webkit-backdrop-filter:blur(10px); box-shadow:inset 0 1px 3px rgba(0,0,0,0.06); outline:none;"/>
<input id="cf-compare-btn" type="button" value="Compare"
  style="padding:5px 16px; font-size:12px; cursor:pointer; border-radius:20px; border:1px solid rgba(0,0,0,0.12); background:rgba(255,255,255,0.7); backdrop-filter:blur(10px); -webkit-backdrop-filter:blur(10px); box-shadow:0 2px 8px rgba(0,0,0,0.08), inset 0 1px 0 rgba(255,255,255,0.9); font-weight:600; color:#333; transition:all 0.18s ease;"/>
        <div style="position:relative; display:inline-block;">
          <input id="cf-friends-btn" type="button" value="👥 Friends ▾"
            style="padding:5px 14px; font-size:12px; cursor:pointer; border-radius:20px; border:1px solid rgba(0,0,0,0.12); background:rgba(255,255,255,0.7); backdrop-filter:blur(10px); -webkit-backdrop-filter:blur(10px); box-shadow:0 2px 8px rgba(0,0,0,0.08); font-weight:600; color:#333; transition:all 0.18s ease; white-space:nowrap;"/>
          <div id="cf-friends-dropdown" style="
            display:none;
            position:absolute;
            top:34px; left:0;
            z-index:9999;
            background:white;
            border:1px solid rgba(0,0,0,0.12);
            border-radius:14px;
            box-shadow:0 6px 20px rgba(0,0,0,0.12);
            min-width:200px;
            max-height:260px;
            overflow-y:auto;
            font-size:12px;
            font-weight:normal;
          ">
            <div id="cf-friends-list"></div>
          </div>
        </div>
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
        // Fetch with retry (up to 3 attempts) to handle Codeforces API flakiness
        async function fetchWithRetry(url, attempts = 3) {
          for (let i = 0; i < attempts; i++) {
            try {
              const controller = new AbortController();
              const timeout = setTimeout(() => controller.abort(), 15000);
              const res = await fetch(url, { signal: controller.signal });
              clearTimeout(timeout);
              if (!res.ok) throw new Error(`HTTP ${res.status}`);
              return await res.json();
            } catch (err) {
              if (i === attempts - 1) throw err;
              await new Promise(r => setTimeout(r, 1500 * (i + 1)));
            }
          }
        }

        const d = await fetchWithRetry('https://codeforces.com/api/problemset.problems');
        const allProblems = d.result.problems;
        const allStats = d.result.problemStatistics || [];

        const statsMap = {};
        allStats.forEach(s => {
          statsMap[`${s.contestId}-${s.index}`] = s.solvedCount;
        });

        // Build solved set from user submissions (getSolvedProblems was missing — defined inline here)
        let solvedSet = new Set();
        if (MY_HANDLE) {
          try {
            const subData = await fetchWithRetry(
              `https://codeforces.com/api/user.status?handle=${encodeURIComponent(MY_HANDLE)}`
            );
            (subData.result || []).forEach(s => {
              if (s.verdict === 'OK') solvedSet.add(s.problem.contestId + '/' + s.problem.index);
            });
          } catch (subErr) {
            console.warn('[Dashboard] Could not load solved list, showing all matches:', subErr);
          }
        }

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

  // friends dropdown
  const friendsBtn      = document.getElementById('cf-friends-btn');
  const friendsDropdown = document.getElementById('cf-friends-dropdown');
  const friendsList     = document.getElementById('cf-friends-list');
  const compareInput    = document.getElementById('cf-compare-input');
  let friendsLoaded = false;

  function isDarkMode() {
    return localStorage.getItem('cf_dark_mode') === 'true' ||
           document.documentElement.classList.contains('cf-dark');
  }

  function applyDropdownTheme() {
    const dark = isDarkMode();
    friendsDropdown.style.background    = dark ? '#242424' : 'white';
    friendsDropdown.style.borderColor   = dark ? '#444'    : 'rgba(0,0,0,0.12)';
    friendsDropdown.style.color         = dark ? '#d4d4d4' : '#333';
    friendsBtn.style.background         = dark ? 'rgba(50,50,50,.75)' : 'rgba(255,255,255,0.7)';
    friendsBtn.style.color              = dark ? '#d4d4d4' : '#333';
    friendsBtn.style.borderColor        = dark ? 'rgba(200,200,200,.2)' : 'rgba(0,0,0,0.12)';
  }

  new MutationObserver(applyDropdownTheme)
    .observe(document.documentElement, { attributeFilter: ['class'] });

  friendsBtn.addEventListener('click', async () => {
    const isOpen = friendsDropdown.style.display === 'block';
    if (isOpen) {
      friendsDropdown.style.display = 'none';
      return;
    }

    applyDropdownTheme();
    friendsDropdown.style.display = 'block';
    if (friendsLoaded) return;

    const dark = isDarkMode();
    friendsList.innerHTML = `<div style="padding:10px 14px; color:${dark ? '#888' : '#aaa'}; font-style:italic;">Loading friends...</div>`;

    try {
      let handles = [];

      // Method 1: CF API with session cookie
      try {
        const res = await fetch('https://codeforces.com/api/user.friends?onlyOnline=false', {
          credentials: 'include'
        });
        const data = await res.json();
        if (data.status === 'OK' && Array.isArray(data.result) && data.result.length > 0) {
          handles = data.result;
        }
      } catch (_) {}

      // Method 2: scrape /friends page — only grab handles from the
      // friends table rows (.title a), NOT every rated-user link on the page
      if (handles.length === 0) {
        const pageRes = await fetch('https://codeforces.com/friends', { credentials: 'include' });
        const html = await pageRes.text();
        const doc = new DOMParser().parseFromString(html, 'text/html');

        // CF friends page: each friend is a <div class="user-field-value"><a ...>handle</a>
        // or inside a table with class "has-text-color", scoped to the friends list section
        const scraped = new Set();

        // Primary: .friendsTable or #pageContent .datatable rows
        doc.querySelectorAll('.friendsTable .title a, #pageContent .datatable tr td:first-child a').forEach(a => {
          const m = (a.href || a.getAttribute('href') || '').match(/\/profile\/([^\/?#]+)/);
          if (m && m[1]) scraped.add(m[1]);
        });

        // Fallback: any /profile/ link that's a direct child of a cell (not sidebar, not nav)
        if (scraped.size === 0) {
          doc.querySelectorAll('#pageContent a[href*="/profile/"]').forEach(a => {
            const m = (a.href || a.getAttribute('href') || '').match(/\/profile\/([^\/?#]+)/);
            if (m && m[1] && m[1] !== MY_HANDLE) scraped.add(m[1]);
          });
        }

        handles = [...scraped];
      }

      if (handles.length === 0) throw new Error('no_friends');

      handles = handles.sort((a, b) => a.toLowerCase().localeCompare(b.toLowerCase()));
      friendsLoaded = true;

      friendsList.innerHTML = handles.map(h => `
        <div class="cf-friend-row" data-handle="${h}" style="
          padding:8px 14px;
          cursor:pointer;
          border-bottom:1px solid ${dark ? '#333' : '#f0f0f0'};
          transition:background 0.1s;
          color:${dark ? '#d4d4d4' : '#333'};
        ">${h}</div>
      `).join('');

      friendsList.querySelectorAll('.cf-friend-row').forEach(item => {
        item.addEventListener('mouseenter', () => {
          item.style.background = isDarkMode() ? '#333' : '#f0f7ff';
        });
        item.addEventListener('mouseleave', () => {
          item.style.background = '';
        });
        item.addEventListener('click', () => {
          compareInput.value = item.dataset.handle;
          friendsDropdown.style.display = 'none';
          compareInput.focus();
        });
      });

    } catch (e) {
      // Show a clean inline message — no red error box, just a hint
      const dark2 = isDarkMode();
      if (e.message === 'no_friends') {
        friendsList.innerHTML = `<div style="padding:10px 14px; color:${dark2 ? '#888' : '#aaa'}; font-style:italic;">No friends found.<br>Add friends on Codeforces first.</div>`;
      } else {
        friendsList.innerHTML = `<div style="padding:10px 14px; color:${dark2 ? '#888' : '#aaa'}; font-size:11px;">Could not load friends.<br>Type a handle manually above.</div>`;
      }
    }
  });

  // close dropdown on outside click
  document.addEventListener('click', e => {
    if (friendsBtn && !friendsBtn.contains(e.target) &&
        friendsDropdown && !friendsDropdown.contains(e.target)) {
      friendsDropdown.style.display = 'none';
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

    /* ════════════════════════════════════════════════════════
       CORE DARK THEME  (ported from codeforces-darktheme-extension)
       ════════════════════════════════════════════════════════ */

    :root {
      --bg:       #1e1e1e;
      --row:      #2e2e2e;
      --text:     rgb(200, 200, 200);
      --box:      #383838;
      --blue:     #21b0fd;
      --visited:  #8ab1ff;
      --green:    #00c700;
      --red:      hsl(0, 100%, 64%);
    }

    /* --- backgrounds --- */
    body:not(.wysiwyg),
    .roundbox,
    .bottom-links,
    .datatable td:not(.dark),
    .datatable td:not(.dark) div.dark,
    .datatable th,
    .datatable > div.dark,
    #facebox .content,
    .talk-content div[id^='history-text-content'] {
      background: var(--bg) !important;
      background-color: var(--bg) !important;
    }

    .spoiler-content,
    .roundbox.highlight-blue {
      background-color: hsl(240, 15%, 35%) !important;
    }

    td.dark,
    td.dark div.dark,
    .ttypography tbody tr:hover td,
    .status-frame-datatable tr td.dark {
      background-color: var(--row) !important;
    }

    .datatable,
    .status-frame-datatable {
      color: var(--text) !important;
      border-radius: 5px;
      background-color: #585858 !important;
    }

    .comment-table.highlight-blue,
    .comment-table.highlight,
    .standings tr.highlighted-row td,
    table tr.highlighted-row td,
    .highlight-blue,
    .lang-chooser div[style^='background-color: #EAF4FF;'] {
      background-color: #13203a !important;
    }

    .datatable td.state[style^='background-color: rgb(221, 238, 255);'] {
      background-color: #4a4a4a !important;
    }
    .datatable td.state[style^='background-color: rgb(212, 237, 201);'] {
      background-color: #005a07 !important;
    }

    /* --- text colours --- */
    .info,
    .ttypography,
    .ttypography table,
    .ttypography h1,
    .ttypography h2,
    .ttypography h3,
    .ttypography h4,
    .ttypography h5,
    .ttypography h6,
    .right-meta,
    .tickLabel,
    .personal-sidebar,
    .roundbox,
    #footer,
    .pagination,
    #locationSelect,
    #pageContent,
    #pageContent > div:not(:first-child),
    body.notfoundpage h3,
    #facebox .content,
    .lang-chooser,
    .page-index.active,
    span#u_0_4,
    .menu-list-container ul li a,
    #header h3,
    body > p,
    body > ul {
      color: var(--text) !important;
    }

    blockquote { color: #a8a8a8 !important; }

    .caption.titled,
    .contest-state-phase { color: #91a5cd !important; }

    span.contest-state-regular,
    .countdown { color: #bababa !important; }

    /* --- links --- */
    a { text-decoration: none; }

    .second-level-menu ul li a:link,
    .second-level-menu ul li a:visited,
    span.verdict-unsuccessful-challenge,
    span.cell-rejected,
    a:not([href]):not(.rated-user),
    a:link:not(.rated-user) {
      color: var(--blue) !important;
    }
    a:visited:not(.rated-user) { color: var(--visited) !important; }

    a:link.notice { color: #bababa !important; }

    div ul.menu-list li a:link,
    div ul.menu-list li a:visited { color: white !important; }

    .fix-tag-topic-contrast span a { color: white !important; }
    .topic .content center a      { color: var(--text) !important; }
    .topic .title p               { color: rgb(94, 146, 255) !important; }
    .topic .content               { border-left-color: #999 !important; }
    .comment-table                { border-color: grey !important; }
    .verdict-rejected             { color: lightblue !important; }

    /* --- inputs --- */
    .search,
    .ac_input,
    input[name$='Difficulty'],
    input[type='text'],
    #title,
    #comment {
      background-color: var(--box) !important;
      border-color:     var(--box) !important;
      color:            var(--text) !important;
    }

    input[type='submit'],
    input[type='button'],
    input[type='file'] {
      color:        var(--text) !important;
      background:   #4f4f4f !important;
      border-color: #4f4f4f !important;
    }

    .miu-complete,
    .miu-comment,
    input[name^='tag'].ac_input,
    .send-talk-form table .wysiwyg {
      background: #fff !important;
      filter: invert(90%) hue-rotate(180deg);
    }
    .miu-comment .markItUp .markItUpButton8 a,
    .miu-complete .markItUp .markItUpButton12 a {
      filter: invert(90%) hue-rotate(180deg);
    }

    textarea[name='input'],
    textarea[name='output'],
    #sourceCodeTextarea {
      background-color: #272822 !important;
      color: white !important;
    }

    /* --- code / pre --- */
    pre { background-color: #333 !important; }

    body > pre,
    div.ttypography pre { color: var(--text) !important; }

    div.ttypography .tt,
    .search-help code {
      color: #fff !important;
      border-color: #333 !important;
      background-color: #333 !important;
    }

    /* desert.css: prettyprint syntax colours */
    pre.prettyprint           { display: block !important; background-color: #333 !important; }
    .prettyprint .nocode      { background-color: none !important; color: #000 !important; }
    .prettyprint .str         { color: #ffa0a0 !important; }
    .prettyprint .kwd         { color: #f0e68c !important; font-weight: bold !important; }
    .prettyprint .com         { color: #87ceeb !important; }
    .prettyprint .typ         { color: #98fb98 !important; }
    .prettyprint .lit         { color: #cd5c5c !important; }
    .prettyprint .pun         { color: #fff !important; }
    .prettyprint .pln         { color: #fff !important; }
    .prettyprint .tag         { color: #f0e68c !important; font-weight: bold !important; }
    .prettyprint .atn         { color: #bdb76b !important; font-weight: bold !important; }
    .prettyprint .atv         { color: #ffa0a0 !important; }
    .prettyprint .dec         { color: #98fb98 !important; }
    ol.linenums               { margin-top: 0 !important; margin-bottom: 0 !important; color: #aeaeae !important; }
    li.L0, li.L1, li.L2, li.L3, li.L5, li.L6, li.L7, li.L8 { list-style-type: none !important; }

    /* monokai: ACE editor */
    .ace-monokai              { background: #272822; color: #f8f8f2; }
    .ace-monokai .ace_gutter  { background: #2b2b2b; color: #8f908a; }
    .ace-monokai .ace_cursor  { color: #f8f8f0; }
    .ace-monokai .ace_marker-layer .ace_selection   { background: rgba(98,98,98,0.6); }
    .ace-monokai .ace_marker-layer .ace_active-line { background: #3e3d32; }
    .ace-monokai .ace_keyword  { color: #f92672; }
    .ace-monokai .ace_constant { color: #ae81ff; }
    .ace-monokai .ace_support  { color: #66d9ef; }
    .ace-monokai .ace_string   { color: #e6db74; }
    .ace-monokai .ace_comment  { color: #75715e; font-style: italic; }
    .ace-monokai .ace_variable { color: #fd971f; }

    /* --- math / formula --- */
    .tex-formula              { filter: invert(1) hue-rotate(180deg); }
    div.ttypography .MathJax  { -webkit-filter: invert(1) !important; filter: invert(1) !important; }

    /* --- standings --- */
    .standings .cell-accepted,
    .standings .cell-accepted-locked { color: rgb(78, 209, 253) !important; }
    .standings .cell-challenged      { color: var(--red) !important; }
    .standings .cell-passed-system-test { color: var(--green) !important; }

    /* --- problems table accepted/rejected row colours --- */
    .problems tr.rejected-problem td.act { background-color: #ffabab !important; }
    .problems tr.accepted-problem td.act { background-color: #b5fd95 !important; }
    .problems tr.rejected-problem td.id  { border-left-color: #ffabab !important; }
    .problems tr.accepted-problem td.id  { border-left-color: #b5fd95 !important; }

    /* --- diff view --- */
    div.diffHtmlTarget pre.prettyprint del[style^='background:#ff8080'] { background: #7b1313 !important; }
    div.diffHtmlTarget pre.prettyprint ins[style^='background:#80ff80'] { background: #004600 !important; }
    div.diffHtmlTarget pre.prettyprint ins[style^='background:#80ff80'] .lit { background: #ff9d9d !important; }

    /* --- user rank colours --- */
    span.user-legendary::first-letter,
    a.user-legendary::first-letter,
    span.user-admin, a.user-admin,
    span.user-black, a.user-black { color: #fff !important; }

    tr.user-blue td, span.user-blue, a.user-blue       { color: #757dff !important; }
    tr.user-red td, span.user-red, a.user-red,
    span.user-legendary, a.user-legendary              { color: var(--red) !important; }
    tr.user-cyan td, span.user-cyan, a.user-cyan       { color: #01bdb2 !important; }
    tr.user-violet td, span.user-violet, a.user-violet { color: #ce8aff !important; }
    tr.user-gray td, span.user-gray, a.user-gray       { color: #8c8c8c !important; }

    /* --- misc --- */
    div.alert-success { color: #0f5711 !important; background-color: #87df63 !important; }
    span.error        { color: var(--red) !important; }
    .roundbox         { border-radius: 5px; }
    .bottom-links     { border-bottom-left-radius: 5px !important; border-bottom-right-radius: 5px !important; }

    .roundbox-lt, .roundbox-lb, .roundbox-rt, .roundbox-rb,
    .datatable .lt, .datatable .lb, .datatable .rt, .datatable .rb,
    .datatable .ilt, .datatable .irt { display: none !important; }

    .sidebar-menu ul li       { border: none !important; }
    .sidebar-menu ul li:hover { border: 1px solid #2e2e2e !important; background-color: #2e2e2e !important; }

    .datatable td.state a[href$='standings'] { color: #8cc3f9 !important; }
    div.setting-name                          { color: #6c8bcc !important; }

    .delete-resource-link,
    .close { filter: invert(1); background-color: #e0e0e0 !important; }
    .close_image { opacity: 0.7 !important; }

    .problem-statement .test-example-line-even { background-color: #444 !important; }

    .datatable td.state[style^='back'] .notice { color: #cccccc !important; }

    div.ttypography .bordertable thead th:not(:last-child) { border-right-color: #000; }

    table tbody tr th a img[alt^='Sort'] { filter: invert(1); }

    #vote-list-filterDifficultyLowerBorder li a.vote-item:hover,
    #vote-list-filterDifficultyLowerBorder { filter: invert(1) hue-rotate(180deg); }

    a.red-link[href^='/contestRegistration'] {
      background-color: #9a0000 !important;
      color: var(--text) !important;
    }

    .personal-sidebar div ul.propertyLinks li:nth-child(2) span[style*='green'] { color: #00c700 !important; }
    .personal-sidebar div ul.propertyLinks li:nth-child(2) span:not([style*='green']) { color: #a8a8a8 !important; }

    img[src^='//st.codeforces.com']:not(.ajax-loading-gif),
    img[src^='//sta.codeforces.com']:not(.ajax-loading-gif),
    img[src$='/lightning-16x16.png'],
    img[src$='/ok-16x16.png'] { background-color: rgba(255,255,255,0) !important; }

    /* ══ LOGO ══
       JS swaps the img src to a base64 dark PNG (no file dependency).
       CSS just ensures no white box appears around it.               */

    /* Keep white bg for sidebar logos (not the main header logo) */
    ._logo_div img,
    .sidebox img[alt='Logo'] {
      background-color: white !important;
    }

    /* Main logo in dark mode: transparent bg, no blend tricks */
    html.cf-dark #header img[alt='Codeforces'],
    html.cf-dark #header .logo img {
      background-color: transparent !important;
      mix-blend-mode: normal !important;
      filter: none !important;
    }

    /* Clear ancestor containers so no white box bleeds through */
    html.cf-dark #header .logo,
    html.cf-dark #header .logo td,
    html.cf-dark #header .logo tr,
    html.cf-dark #header .logo table,
    html.cf-dark #header .logo div {
      background: transparent !important;
      background-color: transparent !important;
    }

    /* ══ SECOND-LEVEL NAV — selectedLava (reference ext uses lava images) ══ */
    .second-level-menu-list li { border-radius: 5px !important; }

    ul.second-level-menu-list li:hover a:hover,
    ul.second-level-menu-list li:hover a:link,
    li.selectedLava a:link { color: #014486 !important; }

    ul.second-level-menu-list:hover li:hover:not(.selectedLava) + .selectedLava a:link {
      color: var(--blue) !important;
    }

    /* All non-lava tab links — readable */
    html.cf-dark .second-level-menu li a,
    html.cf-dark .second-level-menu-list li a { color: #cccccc !important; }

    /* Active tab highlight */
    html.cf-dark .second-level-menu li.selected,
    html.cf-dark .second-level-menu li.active,
    html.cf-dark .second-level-menu li.chosen,
    html.cf-dark .second-level-menu-list li.selected,
    html.cf-dark .second-level-menu-list li.active,
    html.cf-dark .second-level-menu-list li.chosen,
    html.cf-dark .second-level-menu li[class*="select"],
    html.cf-dark .second-level-menu-list li[class*="select"] {
      background: #484848 !important;
      color: #ffffff !important;
    }
    html.cf-dark .second-level-menu li.selected a,
    html.cf-dark .second-level-menu li.active a,
    html.cf-dark .second-level-menu li.chosen a,
    html.cf-dark .second-level-menu-list li.selected a,
    html.cf-dark .second-level-menu-list li.active a,
    html.cf-dark .second-level-menu-list li.chosen a,
    html.cf-dark .second-level-menu li[class*="select"] a,
    html.cf-dark .second-level-menu-list li[class*="select"] a {
      color: #ffffff !important;
      font-weight: 600 !important;
    }
    html.cf-dark .second-level-menu li:hover,
    html.cf-dark .second-level-menu-list li:hover { background: #404040 !important; }
    html.cf-dark .second-level-menu li:hover a,
    html.cf-dark .second-level-menu-list li:hover a { color: #ffffff !important; }

    /* ══ HEADER ══ */
    #header {
      background: #1a1a1a !important;
      background-color: #1a1a1a !important;
      border-bottom: 1px solid #2e2e2e !important;
    }
    #header .logo a { display: inline-block !important; background: transparent !important; padding: 0 !important; }
    .second-level-menu, .second-level-menu-list, .second-level-menu ul {
      background: #1a1a1a !important;
      border-color: #2e2e2e !important;
    }
    .second-level-menu ul li { border-color: #333 !important; }
    #header .lang-chooser a { color: var(--blue) !important; }

    /* ══ SVG chart fixes ══ */
    svg rect[fill="white"]           { fill: #1e1e1e !important; }
    html.cf-dark svg text[fill="#555"]  { fill: #aaaaaa !important; }
    html.cf-dark svg text[fill="#666"]  { fill: #999999 !important; }
    html.cf-dark svg text[fill="#444"]  { fill: #bbbbbb !important; }
    html.cf-dark svg text[fill="#999"]  { fill: #666666 !important; }
    html.cf-dark svg line[stroke="#e0e0e0"] { stroke: #333333 !important; }

    /* ══ EXTENSION-SPECIFIC UI ELEMENTS ══ */

    html.cf-dark .cf-ext-note-btn { background: rgba(55,55,55,.92) !important; color: #d0d0d0 !important; border-color: rgba(255,255,255,.15) !important; }
    html.cf-dark .cf-ext-note-box { background: rgba(32,32,32,.97) !important; border-color: rgba(255,255,255,.12) !important; }
    html.cf-dark .cf-ext-note-textarea { background: rgba(24,24,24,.98) !important; color: #d0d0d0 !important; border-color: rgba(255,255,255,.10) !important; }
    html.cf-dark .cf-ext-note-btn-action { background: rgba(50,50,50,.92) !important; color: #d0d0d0 !important; border-color: rgba(255,255,255,.12) !important; }
    html.cf-dark .cf-ext-note-btn-danger { background: rgba(70,18,18,.92) !important; color: #ff8888 !important; border-color: rgba(255,80,80,.22) !important; }

    html.cf-dark #cf-compare-input { background: rgba(48,48,48,.92) !important; color: #d0d0d0 !important; border-color: rgba(255,255,255,.15) !important; }
    html.cf-dark #cf-compare-btn   { background: rgba(48,48,48,.92) !important; color: #d0d0d0 !important; border-color: rgba(255,255,255,.15) !important; box-shadow: none !important; }
    html.cf-dark #cf-friends-btn   { background: rgba(48,48,48,.92) !important; color: #d0d0d0 !important; border-color: rgba(255,255,255,.15) !important; box-shadow: none !important; }
    html.cf-dark #cf-friends-dropdown { background: #242424 !important; border-color: #444 !important; color: #d4d4d4 !important; }
    html.cf-dark .cf-friend-row       { border-bottom-color: #333 !important; color: #d4d4d4 !important; }
    html.cf-dark .cf-friend-row:hover { background: #333 !important; }
    html.cf-dark #cf-compare-panel,
    html.cf-dark #cf-compare-container .roundbox { background: var(--bg) !important; }

    html.cf-dark #cf-rec-output-box table { background: transparent !important; }
    html.cf-dark #cf-rec-output-box tr:first-child { background: #2a2a2a !important; }
    html.cf-dark #cf-rec-output-box tr:nth-child(even) { background: #252525 !important; }
    html.cf-dark #cf-rec-output-box tr:nth-child(odd)  { background: #1f1f1f !important; }
    html.cf-dark #cf-rec-output-box a { color: var(--blue) !important; }
    html.cf-dark #cf-rec-rating-select,
    html.cf-dark #cf-rec-tag-select   { background: var(--box) !important; color: var(--text) !important; border-color: #555 !important; }
    html.cf-dark #cf-load-recs-btn    { background: var(--box) !important; color: var(--text) !important; border-color: #555 !important; }

    html.cf-dark #cf-bar-popup,
    html.cf-dark #cf-attempted-popup  { background: #242424 !important; border-color: #444 !important; color: var(--text) !important; }
    html.cf-dark #cf-bar-popup a,
    html.cf-dark #cf-attempted-popup a { color: var(--blue) !important; }

    html.cf-dark #cf-weakest-alert-text > div { filter: brightness(0.75) saturate(0.9); }

    html.cf-dark #cf-predictor-container { background: rgba(255,255,255,0.04) !important; border-color: rgba(255,255,255,0.10) !important; }

    html.cf-dark #cf-rating-predict-box { background: rgba(28,28,28,.97) !important; border-color: rgba(255,255,255,.14) !important; color: var(--text) !important; }
    html.cf-dark #cf-india-rank-box     { background: rgba(38,22,4,.96) !important; border-color: #aa6600 !important; color: var(--text) !important; }
    html.cf-dark #cf-india-rank-box table tr:first-child { background: #3a2000 !important; }
    html.cf-dark #cf-india-rank-box table tr { border-bottom-color: #3a3a3a !important; }

    html.cf-dark #cf-famous-solvers-box { background: var(--bg) !important; }
    html.cf-dark #cf-famous-solvers-list a[style*="background:#f0f0f0"] { background: #333 !important; color: #00d400 !important; }

    html.cf-dark .tag-box { background: rgba(255,255,255,0.07) !important; color: #c8c8c8 !important; border-color: rgba(255,255,255,0.12) !important; }

    html.cf-dark .roundbox.sidebox  { border-color: #383838 !important; }
    html.cf-dark .caption.titled    { border-bottom-color: #383838 !important; }
  `;

  function refreshBtn() {
    btn.innerText = dark ? "☀️ Light" : "🌙 Dark";
    btn.style.background = dark
      ? "rgba(80,80,80,.55)"
      : "rgba(230,230,230,.45)";
    btn.style.color = dark ? "#e8e8e8" : "#333";
    btn.style.borderColor = dark ? "rgba(200,200,200,.2)" : "rgba(120,120,120,.18)";
  }

  // Dark logo embedded as base64 — no manifest web_accessible_resources needed
  const CF_DARK_LOGO = "data:image/png;base64,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";

  function fixLogoForDark() {
    // Find the logo img — try multiple selectors to cover all CF page variants
    const logoImgs = document.querySelectorAll(
      '#header a[href="/"] img[alt="Codeforces"], ' +
      '#header .logo img[alt="Codeforces"], ' +
      '#header img[alt="Codeforces"], ' +
      '#header ._logo_div img'
    );

    logoImgs.forEach(img => {
      if (dark) {
        if (!img.dataset.cfOrigSrc) img.dataset.cfOrigSrc = img.src;
        img.src = CF_DARK_LOGO;
        img.style.setProperty("background-color", "transparent", "important");
        img.style.removeProperty("mix-blend-mode");
        img.style.removeProperty("filter");
        // Clear ancestor backgrounds
        let p = img.parentElement;
        while (p && p.id !== 'header') {
          p.style.setProperty("background", "transparent", "important");
          p.style.setProperty("background-color", "transparent", "important");
          p = p.parentElement;
        }
      } else {
        if (img.dataset.cfOrigSrc) {
          img.src = img.dataset.cfOrigSrc;
          delete img.dataset.cfOrigSrc;
        }
        img.style.removeProperty("background-color");
        img.style.removeProperty("mix-blend-mode");
        img.style.removeProperty("filter");
        let p = img.parentElement;
        while (p && p.id !== 'header') {
          p.style.removeProperty("background");
          p.style.removeProperty("background-color");
          p = p.parentElement;
        }
      }
    });
  }

  function fixNavTabsForDark() {
    // CF second-level nav: could be <ul><li> or <table><td> structure
    // We style EVERY cell/item inside .second-level-menu or .second-level-menu-list

    function styleTabItem(el, isActive) {
      if (dark) {
        el.style.setProperty("background-color", isActive ? "#484848" : "transparent", "important");
        el.style.setProperty("color", "#ffffff", "important");
        el.querySelectorAll("a").forEach(a => {
          a.style.setProperty("color", "#ffffff", "important");
        });
      } else {
        el.style.removeProperty("background-color");
        el.style.removeProperty("color");
        el.querySelectorAll("a").forEach(a => a.style.removeProperty("color"));
      }
    }

    function isActiveEl(el) {
      const cls = (el.className || "").toLowerCase();
      return cls.includes("select") || cls.includes("activ") || cls.includes("chosen") ||
             el.getAttribute("aria-selected") === "true" ||
             el.querySelector("a.selected, a.active, a.chosen, a[class*='select']") !== null;
    }

    // Target li items
    document.querySelectorAll(
      ".second-level-menu li, .second-level-menu-list li"
    ).forEach(li => styleTabItem(li, isActiveEl(li)));

    // Target td items (CF sometimes uses a table layout for these tabs)
    document.querySelectorAll(
      ".second-level-menu td, .second-level-menu-list td"
    ).forEach(td => styleTabItem(td, isActiveEl(td)));

    // Also force the menu background itself
    document.querySelectorAll(".second-level-menu, .second-level-menu-list").forEach(menu => {
      if (dark) {
        menu.style.setProperty("background", "#1a1a1a", "important");
      } else {
        menu.style.removeProperty("background");
      }
    });
  }

  // ── Ported from reference ext: fix ACE editor theme ──
  function fixAceEditor() {
    const editor = document.getElementById('editor');
    if (!editor) return;
    if (dark) {
      editor.classList.remove('ace-chrome');
      editor.classList.add('ace-monokai');
      // Re-apply if CF resets it
      // FIX: The original observer modified classList inside a MutationObserver
      // that was watching classList — causing an infinite feedback loop that
      // completely froze the page whenever the ACE editor was present.
      // Fix: disconnect before mutating, then reconnect after, to break the loop.
      if (!editor._cfDarkObserver) {
        const obs = new MutationObserver(() => {
          if (!dark) { obs.disconnect(); editor._cfDarkObserver = null; return; }
          // Only act if the class is actually wrong (avoids unnecessary work)
          if (editor.classList.contains('ace-monokai') && !editor.classList.contains('ace-chrome')) return;
          obs.disconnect(); // Pause observer before mutating to prevent infinite loop
          editor.classList.remove('ace-chrome');
          editor.classList.add('ace-monokai');
          obs.observe(editor, { attributes: true, attributeFilter: ['class'] }); // Resume
        });
        obs.observe(editor, { attributes: true, attributeFilter: ['class'] });
        editor._cfDarkObserver = obs;
      }
    } else {
      if (editor._cfDarkObserver) { editor._cfDarkObserver.disconnect(); editor._cfDarkObserver = null; }
      editor.classList.remove('ace-monokai');
      editor.classList.add('ace-chrome');
    }
  }

  // ── Ported from reference ext: fix rgb(0,128,0) green and red font tags ──
  function fixColorContrast() {
    if (!dark) return;
    // FIX: Replaced the expensive document.querySelectorAll('*') + getComputedStyle
    // loop (which caused a full layout reflow on every element and froze the page
    // when the ACE editor was present) with a lightweight CSS rule that achieves
    // the same effect without touching the DOM at all.
    const contrastStyleId = 'cf-color-contrast-fix';
    if (!document.getElementById(contrastStyleId)) {
      const s = document.createElement('style');
      s.id = contrastStyleId;
      s.textContent = `
        html.cf-dark font[color="green"],
        html.cf-dark [style*="color: rgb(0, 128, 0)"],
        html.cf-dark [style*="color:rgb(0, 128, 0)"],
        html.cf-dark [style*="color: green"],
        html.cf-dark [style*="color:green"] {
          color: #00c700 !important;
        }
        html.cf-dark font[color="red"] {
          color: hsl(0, 100%, 64%) !important;
        }
        html.cf-dark .rtable span[style*="color: rgb(0, 0, 0)"],
        html.cf-dark .rtable span[style*="color:rgb(0, 0, 0)"] {
          color: rgb(200, 200, 200) !important;
        }
      `;
      document.head.appendChild(s);
    }
    // Still handle font[color="red"] attribute (not catchable by CSS alone in all browsers)
    document.querySelectorAll('font[color="red"]').forEach(el => {
      el.setAttribute('color', 'hsl(0, 100%, 64%)');
    });
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
    // JS-driven fixes that bypass CSS specificity and inline-style conflicts
    setTimeout(() => {
      fixLogoForDark();
      fixNavTabsForDark();
      fixAceEditor();
      if (document.readyState === 'complete') fixColorContrast();
      else window.addEventListener('load', fixColorContrast, { once: true });
    }, 50);
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

async function getSolvedProblems(handle) {
  const solvedSet = new Set();
  if (!handle) return solvedSet;
  try {
    const r = await fetch(`https://codeforces.com/api/user.status?handle=${encodeURIComponent(handle)}`);
    const d = await r.json();
    (d.result || []).forEach(s => {
      if (s.verdict === 'OK') solvedSet.add(s.problem.contestId + '/' + s.problem.index);
    });
  } catch (e) {
    console.warn('[getSolvedProblems] failed for', handle, e);
  }
  return solvedSet;
}

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
  if (!window.location.pathname.includes("/problemset") || window.location.pathname.includes("/problem/")) return;
  if (document.getElementById("cf-predict-rating-wrap")) return;

  let payAttentionBox = null;
  for (const rb of document.querySelectorAll('.roundbox')) {
    if (rb.textContent.includes('Pay attention')) { payAttentionBox = rb; break; }
  }
  if (!payAttentionBox) return;

  const STORAGE_KEY = "cf_predict_rating";
  let enabled = localStorage.getItem(STORAGE_KEY) === "true";

  const wrap = document.createElement("div");
  wrap.id = "cf-predict-rating-wrap";
  wrap.style.cssText = "display:flex;align-items:center;gap:8px;margin-bottom:8px;flex-wrap:wrap;";

  const btn = document.createElement("button");
  btn.id = "cf-helper-rating-predict-btn";
  btn.style.cssText = `
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
    white-space:nowrap;
  `;

  const note = document.createElement("span");
  note.style.cssText = "font-size:11px;color:#aaa;font-style:italic;display:none;line-height:1.4;";
  note.textContent = "predicted ratings based on recent contests — official rating may differ";

  function isDark() {
    return localStorage.getItem("cf_dark_mode") === "true" ||
           document.documentElement.classList.contains("cf-dark");
  }

  function refreshBtn() {
    const dark = isDark();
    btn.innerText = enabled ? "Predict Rating: ON" : "Predict Rating: OFF";
    btn.style.background  = enabled
      ? (dark ? "rgba(90,90,90,.75)"  : "rgba(210,210,210,.55)")
      : (dark ? "rgba(50,50,50,.55)"  : "rgba(230,230,230,.45)");
    btn.style.color       = dark ? "#d4d4d4" : "#333";
    btn.style.borderColor = dark ? "rgba(200,200,200,.2)" : "rgba(120,120,120,.18)";
    note.style.display    = enabled ? "inline" : "none";
  }

  new MutationObserver(refreshBtn)
    .observe(document.documentElement, { attributeFilter: ["class"] });

  function getDiv(name) {
    if (!name) return null;
    if (name.includes("Div. 4")) return 4;
    if (name.includes("Div. 3")) return 3;
    if (name.includes("Div. 2") && !name.includes("Div. 1")) return 2;
    if (name.includes("Div. 1") && !name.includes("Div. 2")) return 1;
    if (name.includes("Div. 1 + Div. 2") || name.includes("Div. 1+2")) return 2;
    return null;
  }

  async function applyPredictorVisibility() {
    document.querySelectorAll(".cf-predicted-rating").forEach(el => el.remove());
    refreshBtn();
    if (!enabled) return;

    // Show loading dots while fetching
    document.querySelectorAll("#pageContent .problems tbody tr").forEach(row => {
      const ratingCell = row.querySelector("td:nth-last-child(2)");
      if (!ratingCell || (ratingCell.textContent || "").trim()) return;
      const loader = document.createElement("span");
      loader.className = "cf-predicted-rating";
      loader.style.cssText = "color:#ccc;font-size:11px;";
      loader.textContent = "...";
      ratingCell.appendChild(loader);
    });

    try {
      const [contestRes, problemRes] = await Promise.all([
        fetch("https://codeforces.com/api/contest.list?gym=false"),
        fetch("https://codeforces.com/api/problemset.problems")
      ]);
      const contestData = await contestRes.json();
      const problemData = await problemRes.json();
      if (contestData.status !== "OK" || problemData.status !== "OK") return;

      // Map every contest id → div (including unrated recent ones)
      const contestMap = {};
      contestData.result.forEach(c => {
        contestMap[c.id] = { name: c.name, div: getDiv(c.name) };
      });

      // Pick last 4 finished contests per div
      const divContests = { 1: [], 2: [], 3: [], 4: [] };
      for (const c of contestData.result) {
        if (c.phase !== "FINISHED") continue;
        const div = getDiv(c.name);
        if (!div) continue;
        if (divContests[div].length < 4) divContests[div].push(c.id);
        if (divContests[1].length === 4 && divContests[2].length === 4 &&
            divContests[3].length === 4 && divContests[4].length === 4) break;
      }

      const refIds = new Set([
        ...divContests[1], ...divContests[2],
        ...divContests[3], ...divContests[4]
      ]);

      // Solve count for every problem
      const solveMap = {};
      (problemData.result.problemStatistics || []).forEach(s => {
        solveMap[`${s.contestId}${s.index.toUpperCase()}`] = s.solvedCount;
      });

      // Reference table: `${div}_${letter}` → [{solveCount, rating}]
      const refTable = {};
      problemData.result.problems.forEach(p => {
        if (!p.rating || !refIds.has(p.contestId)) return;
        const info = contestMap[p.contestId];
        if (!info || !info.div) return;
        const key    = `${info.div}_${p.index[0].toUpperCase()}`;
        const solves = solveMap[`${p.contestId}${p.index.toUpperCase()}`] || 0;
        if (!refTable[key]) refTable[key] = [];
        refTable[key].push({ solveCount: solves, rating: p.rating });
      });

      // Clear loading dots
      document.querySelectorAll(".cf-predicted-rating").forEach(el => el.remove());

      // Predict for each unrated row
      document.querySelectorAll("#pageContent .problems tbody tr").forEach(row => {
        const link = row.querySelector('td a[href*="/problem/"]');
        if (!link) return;

        const m = link.href.match(/\/problem\/(\d+)\/([A-Z0-9]+)/i);
        if (!m) return;
        const contestId = parseInt(m[1]);
        const index     = m[2].toUpperCase();
        const letter    = index[0];
        const pid       = `${contestId}${index}`;

        const ratingCell = row.querySelector("td:nth-last-child(2)");
        if (!ratingCell) return;
        if ((ratingCell.textContent || "").trim()) return;

        const solves = solveMap[pid];
        if (solves === undefined) return;

        const div  = contestMap[contestId]?.div;
        let pool   = div ? (refTable[`${div}_${letter}`] || []) : [];

        // Fall back to all divs for that letter if pool is empty
        if (pool.length === 0) {
          for (let d = 1; d <= 4; d++) {
            pool = pool.concat(refTable[`${d}_${letter}`] || []);
          }
        }
        if (pool.length === 0) return;

        // 5 nearest by solve count, weighted inverse-distance
        const nearest = [...pool]
          .sort((a, b) => Math.abs(a.solveCount - solves) - Math.abs(b.solveCount - solves))
          .slice(0, 5);

        let wSum = 0, wTotal = 0;
        nearest.forEach(p => {
          const w  = 1 / (Math.abs(p.solveCount - solves) + 1);
          wSum    += p.rating * w;
          wTotal  += w;
        });

        const predicted = Math.round((wSum / wTotal) / 100) * 100;
        if (!predicted) return;

        const tag = document.createElement("span");
        tag.className     = "cf-predicted-rating";
        tag.title         = `${solves} solvers → ~${predicted} (estimated)`;
        tag.style.cssText = "color:#aaa;font-style:italic;font-size:12px;cursor:default;";
        tag.textContent   = `~${predicted}`;
        ratingCell.appendChild(tag);
      });

    } catch (e) {
      document.querySelectorAll(".cf-predicted-rating").forEach(el => el.remove());
      console.error("[CF Helper] Prediction failed:", e);
    }
  }

  btn.addEventListener("mouseenter", () => btn.style.transform = "translateY(-1px)");
  btn.addEventListener("mouseleave", () => btn.style.transform = "translateY(0)");
  btn.addEventListener("click", () => {
    enabled = !enabled;
    localStorage.setItem(STORAGE_KEY, String(enabled));
    applyPredictorVisibility();
  });

  wrap.appendChild(btn);
  wrap.appendChild(note);
  payAttentionBox.parentNode.insertBefore(wrap, payAttentionBox);

  refreshBtn();
  if (enabled) applyPredictorVisibility();
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

  function isDark() {
    return localStorage.getItem("cf_dark_mode") === "true" ||
           document.documentElement.classList.contains("cf-dark");
  }

  function refreshBtn() {
    const dark = isDark();
    btn.innerText = hidden ? "Show Tags" : "Hide Tags";
    btn.style.background = hidden
      ? (dark ? "rgba(90,90,90,.75)"   : "rgba(210,210,210,.55)")
      : (dark ? "rgba(50,50,50,.55)"   : "rgba(230,230,230,.45)");
    btn.style.color        = dark ? "#d4d4d4" : "#333";
    btn.style.borderColor  = dark ? "rgba(200,200,200,.2)" : "rgba(120,120,120,.18)";
  }

  // re-apply whenever dark mode class toggles on <html>
  const _darkObserver = new MutationObserver(refreshBtn);
  _darkObserver.observe(document.documentElement, { attributeFilter: ["class"] });

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

  const path = window.location.pathname;
  const isSubmitPage   = path.includes('/problemset/submit') || path.endsWith('/submit');
  const isProfilePage  = path.includes('/profile/');
  const isStandingsPage = path.includes('/standings');
  const isProblemPage  = path.includes('/problem/');
  const isStatusPage   = path.includes('/status') || path.includes('/submissions') || path.includes('/my');
  const isMainProblemsetList = path.includes('/problemset') && !isProblemPage && !isSubmitPage;
  const isAnyProblemsetPage  = path.includes('/problemset') && !isSubmitPage;

  // Dark mode toggle runs everywhere (lightweight, just a button)
  injectDarkModeButton();

  // Submit page — only dark mode, nothing else (no API calls, no injection)
  if (isSubmitPage) return;

  // Rating predictor — main problemset list only
  if (isMainProblemsetList) {
    initRatingPredictor();
  }

  // Hide Tags button — problemset pages only
  if (isAnyProblemsetPage) {
    injectHideTagsButton();
  }

  // Verdict colours — status/submissions pages only
  if (isStatusPage || isStandingsPage) {
    injectVerdictColors();
  }

  // Profile-only features (dashboard, famous solvers, India rank, notes)
  if (MY_HANDLE) {
    if (isProfilePage) {
      injectCompareDashboard();
    }
    if (isProblemPage) {
      injectFamousSolversBox();
      injectProblemNotes();
    }
    if (isStandingsPage) {
      injectIndiaRankToggle();
    }
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

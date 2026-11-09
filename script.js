const EMAIL = "vargas.kennyron@gmail.com";
const roles = ["Python", "JavaScript", "HTML & CSS", "Java", "Git & GitHub"];
let ri = 0,
  ci = 0,
  del = false;
const typed = document.getElementById("typed");
function type() {
  const r = roles[ri];
  typed.textContent = r.substring(0, del ? ci - 1 : ci + 1);
  ci += del ? -1 : 1;
  let s = del ? 40 : 90;
  if (!del && ci === r.length) {
    s = 1800;
    del = true;
  } else if (del && ci === 0) {
    del = false;
    ri = (ri + 1) % roles.length;
    s = 400;
  }
  setTimeout(type, s);
}
setTimeout(type, 600);

/* Grade calculator: same logic as my Python project */
function letterFor(g) {
  return g >= 90 ? "A" : g >= 80 ? "B" : g >= 70 ? "C" : g >= 60 ? "D" : "F";
}
function computeGrade(rows) {
  let sum = 0,
    tw = 0;
  for (let i = 0; i < rows.length; i++) {
    const sRaw = String(rows[i].score).trim(),
      wRaw = String(rows[i].weight).trim();
    const s = Number(sRaw),
      w = Number(wRaw);
    if (
      sRaw === "" ||
      wRaw === "" ||
      !Number.isFinite(s) ||
      !Number.isFinite(w) ||
      w < 0
    )
      return {
        error:
          "Row " +
          (i + 1) +
          " needs a number for the score and a weight of 0 or more.",
      };
    sum += s * (w / 100);
    tw += w;
  }
  if (tw === 0)
    return { error: "Add at least one score with a weight above 0." };
  const final = sum / (tw / 100);
  return { final, totalWeight: tw, letter: letterFor(final) };
}
const gcRows = document.getElementById("gc-rows"),
  gcOut = document.getElementById("gc-out");
function addRow(s, w) {
  const d = document.createElement("div");
  d.className = "gc-row";
  d.innerHTML =
    '<input type="number" inputmode="decimal" step="any" min="0" aria-label="Score (%)" placeholder="e.g. 92"><input type="number" inputmode="decimal" step="any" min="0" aria-label="Weight (%)" placeholder="e.g. 30"><button type="button" class="x" aria-label="Remove assignment">×</button>';
  const i = d.querySelectorAll("input");
  i[0].value = s ?? "";
  i[1].value = w ?? "";
  d.querySelector(".x").onclick = () => {
    d.remove();
    calc();
  };
  d.addEventListener("input", calc);
  gcRows.appendChild(d);
}
function calc() {
  const all = [...gcRows.children].map((d) => {
    const i = d.querySelectorAll("input");
    return { score: i[0].value, weight: i[1].value };
  });
  const rows = all.filter(
    (r) => r.score.trim() !== "" && r.weight.trim() !== "",
  );
  if (!rows.length) {
    gcOut.textContent = "Enter a score and its weight to see your grade.";
    return;
  }
  const r = computeGrade(rows);
  if (r.error) {
    gcOut.innerHTML = '<span class="err">' + esc(r.error) + "</span>";
    return;
  }
  let n =
    '<span class="note">Total weight: ' + r.totalWeight.toFixed(2) + "%</span>";
  if (Math.abs(r.totalWeight - 100) > 1e-9)
    n +=
      '<span class="note">Weights don’t add up to 100%, so the grade is scaled to 100%.</span>';
  if (all.length > rows.length)
    n +=
      '<span class="note">Incomplete rows are ignored until you fill in both boxes.</span>';
  gcOut.innerHTML =
    '<span class="big">' +
    r.final.toFixed(2) +
    "% · " +
    r.letter +
    "</span>" +
    n;
}
addRow(92, 30);
addRow(85, 30);
addRow(78, 40);
calc();

/* Terminal */
const logs = document.getElementById("logs"),
  input = document.getElementById("in"),
  screen = document.getElementById("screen");
const cmds = {
  help: 'Try: <span class="c">whoami</span>, <span class="c">skills</span>, <span class="c">projects</span>, <span class="c">contact</span>, <span class="c">status</span>, <span class="c">grade 90:30 85:70</span> (score:weight), <span class="c">clear</span>',
  whoami: "Kennyron Vargas, a student who loves turning ideas into programs.",
  skills:
    "Python: loops, functions, lists<br>Web: HTML, CSS, DOM basics<br>JavaScript: events, arrays, small games<br>Java: classes and objects (intro)<br>Tools: Git, GitHub, VS Code",
  projects:
    "1. Grade Calculator (Python, Intro to CS)<br>2. Number Guessing Game (Python)<br>3. Class Quiz App (JavaScript)<br>4. My First Website (HTML &amp; CSS)",
  contact: "Email: " + EMAIL,
  status:
    'Status: <span class="g">learning every day</span> | Next goal: build a full web app',
};
function esc(t) {
  return String(t)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}
function gradeCmd(c) {
  const rows = c
    .slice(5)
    .split(/[\s,]+/)
    .filter(Boolean)
    .map((p) => {
      const [score, weight] = p.split(":");
      return { score: score ?? "", weight: weight ?? "" };
    });
  const r = computeGrade(rows);
  return r.error
    ? esc(r.error) + ' Example: <span class="c">grade 90:30 85:70</span>'
    : "Final: " +
        r.final.toFixed(2) +
        '% | Letter: <span class="g">' +
        r.letter +
        "</span> | Weight: " +
        r.totalWeight +
        "%";
}
function run(e) {
  e.preventDefault();
  const raw = input.value.trim(),
    c = raw.toLowerCase();
  input.value = "";
  if (!c) return;
  if (c === "clear") {
    logs.innerHTML = "";
    return;
  }
  const d = document.createElement("div");
  d.className = "row";
  const reply =
    c === "grade" || c.startsWith("grade ")
      ? gradeCmd(c)
      : cmds[c] ||
        'Command not found: <span class="p">' +
          esc(raw) +
          '</span>. Type <span class="c">help</span> to see the list.';
  d.innerHTML =
    '<span class="g">student@plv:~$</span> ' +
    esc(raw) +
    '<div class="out">' +
    reply +
    "</div>";
  logs.appendChild(d);
  screen.scrollTop = screen.scrollHeight;
}
function quick(n) {
  input.value = n;
  run(new Event("submit"));
}

/* Toast, email, tests */
let tt;
function toast(m) {
  const t = document.getElementById("toast");
  document.getElementById("tmsg").textContent = m;
  t.classList.add("on");
  clearTimeout(tt);
  tt = setTimeout(() => t.classList.remove("on"), 3000);
}
function copyEmail() {
  const fallback = () => {
    const a = document.createElement("textarea");
    a.value = EMAIL;
    document.body.appendChild(a);
    a.select();
    try {
      document.execCommand("copy")
        ? toast("Email copied to your clipboard.")
        : toast("Couldn’t copy. Email me at " + EMAIL);
    } catch (err) {
      toast("Couldn’t copy. Email me at " + EMAIL);
    }
    document.body.removeChild(a);
  };
  if (navigator.clipboard && navigator.clipboard.writeText)
    navigator.clipboard
      .writeText(EMAIL)
      .then(() => toast("Email copied to your clipboard."), fallback);
  else fallback();
}

/* Number guessing game: same logic as my Python project */
const GG_MIN = 1,
  GG_MAX = 100;
function checkGuess(secret, raw) {
  const t = String(raw).trim();
  if (!/^[+-]?\d+$/.test(t)) return { type: "invalid" };
  const g = parseInt(t, 10);
  if (g < GG_MIN || g > GG_MAX) return { type: "range", guess: g };
  if (g < secret) return { type: "low", guess: g };
  if (g > secret) return { type: "high", guess: g };
  return { type: "win", guess: g };
}
const ggForm = document.getElementById("gg-form"),
  ggIn = document.getElementById("gg-in"),
  ggBtn = document.getElementById("gg-go"),
  ggOut = document.getElementById("gg-out");
let ggSecret, ggTries, ggOver;
function ggSay(m, cls) {
  ggOut.textContent = m;
  ggOut.className = cls || "";
}
function ggNew(focus) {
  ggSecret = Math.floor(Math.random() * (GG_MAX - GG_MIN + 1)) + GG_MIN;
  ggTries = 0;
  ggOver = false;
  ggIn.value = "";
  ggIn.disabled = false;
  ggBtn.disabled = false;
  ggSay(
    "I have conceptualized an integer between " +
      GG_MIN +
      " and " +
      GG_MAX +
      ". Can you ascertain its value?",
  );
  if (focus) ggIn.focus();
}
ggForm.addEventListener("submit", (e) => {
  e.preventDefault();
  if (ggOver) return;
  const r = checkGuess(ggSecret, ggIn.value);
  if (r.type !== "invalid") ggTries++;
  if (r.type === "invalid")
    ggSay(
      "Invalid input detected. Kindly provide a valid integer representation.",
      "gg-err",
    );
  else if (r.type === "range")
    ggSay(
      "Please restrict your input within the prescribed boundaries (" +
        GG_MIN +
        " to " +
        GG_MAX +
        ").",
      "gg-err",
    );
  else if (r.type === "low")
    ggSay("Substantially low! Ascend your estimation.");
  else if (r.type === "high")
    ggSay("Exceedingly high! Descend your estimation.");
  else {
    ggOver = true;
    ggIn.disabled = true;
    ggBtn.disabled = true;
    ggSay(
      "Magnificent! You have successfully deciphered the number " +
        ggSecret +
        " in " +
        ggTries +
        " discrete iterations. Press New game to play again.",
      "gg-win",
    );
    return;
  }
  ggIn.value = "";
  ggIn.focus();
});
document.getElementById("gg-new").onclick = () => ggNew(true);
ggNew(false);

/* Class Quiz App */
const QUIZ = [
  {
    prompt:
      "Which keyword declares a block-scoped variable in modern JavaScript?",
    options: ["var", "let", "define", "static"],
    answer: 1,
  },
  {
    prompt: "What lets JavaScript handle async tasks without blocking?",
    options: [
      "Multiple OS threads",
      "The event loop, call stack, and task queue",
      "Running everything in order",
      "Extra CPU cores",
    ],
    answer: 1,
  },
  {
    prompt: "Which array method removes the last element?",
    options: ["shift()", "slice()", "pop()", "splice()"],
    answer: 2,
  },
];
function quizScore(qs, picks) {
  return qs.reduce((n, q, i) => n + (picks[i] === q.answer ? 1 : 0), 0);
}
function el(tag, cls, text) {
  const e = document.createElement(tag);
  if (cls) e.className = cls;
  if (text !== undefined) e.textContent = text;
  return e;
}
const qz = document.getElementById("qz");
let qzI, qzPick, qzPicks;
function qzStart() {
  qzI = 0;
  qzPick = null;
  qzPicks = [];
  qzDraw();
}
function qzDraw() {
  qz.innerHTML = "";
  if (qzI >= QUIZ.length) {
    const s = quizScore(QUIZ, qzPicks),
      p = Math.round((s / QUIZ.length) * 100);
    const again = el("button", "btn sm main", "Try again");
    again.type = "button";
    again.onclick = qzStart;
    qz.append(
      el("span", "big", s + " / " + QUIZ.length + " · " + p + "%"),
      again,
    );
    return;
  }
  const q = QUIZ[qzI],
    opts = [];
  const next = el(
    "button",
    "btn sm main",
    qzI === QUIZ.length - 1 ? "Finish" : "Next",
  );
  next.type = "button";
  next.disabled = qzPick === null;
  next.onclick = () => {
    qzPicks.push(qzPick);
    qzPick = null;
    qzI++;
    qzDraw();
  };
  qz.append(
    el(
      "p",
      "qz-q",
      "Question " + (qzI + 1) + " of " + QUIZ.length + ": " + q.prompt,
    ),
  );
  q.options.forEach((o, i) => {
    const b = el("button", "qz-opt", o);
    b.type = "button";
    b.setAttribute("aria-pressed", "false");
    b.onclick = () => {
      qzPick = i;
      opts.forEach((x, j) => x.setAttribute("aria-pressed", String(j === i)));
      next.disabled = false;
    };
    opts.push(b);
    qz.append(b);
  });
  qz.append(next);
}
qzStart();

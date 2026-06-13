# 🎭 Guess Who?

> **The classic mystery face game — reimagined for the browser. No login. No backend. Just two players and a bunch of faces.**

---

## 🕹️ Play It

Open `index.html` in any modern browser. That's it. No install, no server, no account.

Both players open the same file on their **own device**, keep their secret character hidden, and take turns asking yes/no questions out loud.

---

## 🎮 How to Play

```
Player 1                          Player 2
──────────────────────────────────────────────────
1. Open the page                  1. Open the page
2. Secretly pick a character      2. Secretly pick a character
3. Ask: "Do they have glasses?"   3. Answer: "Yes!"
4. Eliminate everyone without     4. (they do the same for you)
   glasses from your board
5. Keep narrowing it down...      5. Keep narrowing it down...
6. Hit 🎯 Guess! when ready       6. Hit 🎯 Guess! when ready
7. Ask opponent to confirm        7. Confirm or deny
8. Celebrate 🎉 or try again      8. Celebrate 🎉 or try again
```

---

## ✨ Features

| Feature | Details |
|---|---|
| 🎨 **24 unique characters** | Every character has a distinct look — no duplicates |
| 🖼️ **Pure CSS face art** | Characters drawn entirely with HTML divs and CSS |
| 💎 **Earrings & freckles** | Two new visual traits for extra deduction power |
| 💡 **Question Helper** | Ranks the 18–20 best yes/no questions by 50/50 balance |
| 🔍 **Trait filters** | Multi-select AND filters — combine any of 11 traits to highlight exact matches |
| ↩️ **Undo / Clear** | Made a mistake? Undo last elimination or clear the board |
| ⏱️ **Turn timer** | Optional 30-second countdown — auto-switches turns on expire |
| 💾 **Auto-save** | Game state saved to localStorage — resume where you left off |
| 🎉 **Confetti** | Canvas-based particle burst when you win |
| 📱 **Mobile-first** | Touch targets, responsive grid, no hover-only interactions |
| ♿ **Accessible** | ARIA roles, keyboard navigation, `prefers-reduced-motion` support |
| 🔌 **PWA-ready** | Install to home screen via `manifest.json` |

---

## 🧑‍🤝‍🧑 The Cast

24 characters across 3 age groups, diverse backgrounds, and a mix of visual features:

```
👓 Glasses        12 / 24   (50%)
🎩 Hat             9 / 24   (38%)
🧔 Facial hair     8 / 24   (33%)
💎 Earrings        8 / 24   (33%)
🟤 Freckles        6 / 24   (25%)
💇 Long hair       6 / 24   (25%)
🌀 Curly hair      6 / 24   (25%)
🪮 Short hair      9 / 24   (38%)
```

| Name | Age | Job | Distinguishing Look |
|---|---|---|---|
| Alice | Young | Artist | Curly blonde hair, earrings |
| Bob | Middle | Chef | Curly brown hair, beard, hat |
| Carlos | Young | Musician | Short black hair, mustache, hat |
| Diana | Middle | Doctor | Long red hair, glasses, earrings |
| Eve | Old | Teacher | Short gray hair, hat |
| Frank | Old | Engineer | Bald, beard, glasses |
| Grace | Young | Student | Long brown hair, glasses, freckles |
| Henry | Young | Athlete | Short blonde hair, hat, freckles |
| Iris | Middle | Writer | Long black hair, earrings |
| Jake | Young | Traveler | Short red hair, beard, freckles |
| Karen | Middle | Lawyer | Curly blonde hair, glasses, hat, earrings |
| Leo | Old | Retired | Bald, mustache |
| Maria | Young | Scientist | Curly black hair, glasses, earrings |
| Nathan | Old | Professor | Short gray hair, glasses, hat |
| Olivia | Young | Dancer | Long red hair, freckles |
| Peter | Middle | Journalist | Short brown hair, beard, glasses |
| Quinn | Young | Designer | Short blonde hair, glasses, earrings |
| Rosa | Old | Gardener | Curly gray hair, hat, earrings |
| Sam | Middle | Accountant | Short black hair, mustache, glasses |
| Tina | Young | Influencer | Long blonde hair, hat, freckles |
| Uma | Middle | Therapist | Curly brown hair, glasses, earrings |
| Victor | Old | Captain | Short black hair, beard, hat |
| Wendy | Middle | Architect | Long gray hair, glasses, freckles |
| Xavier | Old | Philosopher | Bald, glasses |

---

## 🗂️ File Structure

```
guess-who/
├── index.html     ← All HTML + character data (window.CHARACTERS)
├── style.css      ← Dark theme, CSS face art, animations, responsive layout
├── script.js      ← Game logic, localStorage, confetti, helper, timer
└── manifest.json  ← PWA manifest for home screen install
```

No build step. No dependencies. No bundler. Open `index.html` and go.

---

## 🧠 Smart Question Helper

The built-in helper panel ranks the 20 available yes/no questions by how evenly they split the remaining characters. A perfect 50/50 split scores 1.0 (gold). Questions that barely narrow the field score closer to 0.

> **Best question** → eliminates the most uncertainty regardless of the answer.

Click **💡 Helper** in the game header to open it. It updates live as you eliminate characters.

---

## 🛠️ Tech Stack

| | |
|---|---|
| **HTML** | Semantic structure, embedded character data as `window.CHARACTERS` |
| **CSS** | Custom properties, CSS art faces (pure divs), grid layout, keyframe animations |
| **JavaScript** | Vanilla ES2020, no frameworks, no dependencies |
| **Storage** | `localStorage` for game state persistence |
| **Canvas** | `requestAnimationFrame` confetti particles on win |

---

## 🚀 Deploy

Since it's just static files, you can host it anywhere:

```bash
# GitHub Pages — just push to main and enable Pages in repo settings

# Or serve locally with any static server:
npx serve .
python -m http.server 8080
```

---

## 🎯 Design Constraints

This was built with a strict set of rules:

- ❌ No backend
- ❌ No WebSockets
- ❌ No accounts or rooms
- ❌ No frameworks
- ❌ No build tools
- ✅ Two players, same URL, verbal coordination
- ✅ Each phase (HTML → CSS → JS → improvements) kept under 1000 lines

---

## 📄 License

MIT — do whatever you want with it.

---

<div align="center">
  <strong>Made with 🎭 pure HTML, CSS, and JavaScript</strong>
</div>

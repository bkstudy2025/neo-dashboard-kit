# Contributing — Sharing & Submitting Cards & Modules

🇬🇧 English · [🇩🇪 Deutsch](../de/mitmachen.md) · [← Overview](README.md)

You built a card or module (see **[Development](development.md)**) and want to
**give it to your community**? Here's the full path — from finished code to a
click on the user's screen.

> An extension is **a single `.js` file** that registers itself. There is **no**
> build step for the user and **no** core change.

---

## Which path is right?

| You want to… | Path | Visibility | For whom |
|---|---|---|---|
| share **freely** with everyone | **Submit via Discussions** | in the editor store, for all | Community / open source |
| offer **Premium** (Patreon) | **Share the code** | only those who get the code | paying supporters |
| ship a large standalone project | **HACS** (own repo) | installable via HACS | advanced |

The first two are the important ones — both are explained step by step below.

---

## Path 1 — Submit via Discussions (recommended)

This is the **main way** to get your card/module into the public **Store**
(Editor → *Extensions* → *Install card or module* → **Store**), visible to
**all** users and with an **update indicator**. You **don't need a fork or a
pull request** — you propose it, and a maintainer reviews and adds it.

### Step by step

1. **Open a proposal** in the
   [**Community Cards & Modules**](https://github.com/bkstudy2025/neo-dashboard-kit/discussions/new?category=community-cards-modules)
   Discussions category and fill in the submission form: name, type
   (card/module), description, screenshot, standalone code (or a public
   repo/gist link), HA version, required entities/domains, and the security &
   license confirmation. Template & API for the code:
   [Development](development.md) — **standalone** (no imports from the bundle),
   guarded with `neo-dashboard-ready`.
2. **A maintainer reviews** the code (readable, no secrets, MIT-compatible),
   adjusts it if needed, and **adopts it into the repo** as
   `store/modules/<id>.js` plus a matching `store/index.json` entry.
3. After the maintainer merges to `main`, it appears **automatically in the
   Store** for all users (click **"Refresh store"**; jsDelivr caches `@main`
   for a few hours).

> **Discussions are a proposal channel, not an install source.** Nothing is
> installed automatically from a Discussion. Only a **maintainer review and
> merge** turns a proposal into a Store entry.

<details>
<summary><b>Advanced alternative (experienced devs): Fork + Pull Request</b></summary>

If you're comfortable with Git, you may instead open a PR directly — the
maintainer still reviews and merges it. The Store result is the same.

1. **Fork** `https://github.com/bkstudy2025/neo-dashboard-kit`.
2. **Add the file** as a standalone `store/modules/<your-id>.js` (example:
   `store/modules/neo-weather-card.js`).
3. **Catalog entry** in `store/index.json`:
   ```json
   {
     "id": "neo-weather-card",
     "kind": "card",
     "name": "Weather Card",
     "description": "Short description of what it shows.",
     "target": "neo-weather-card",
     "author": "Community",
     "version": "1.0.0",
     "icon": "⛅",
     "url": "https://cdn.jsdelivr.net/gh/bkstudy2025/neo-dashboard-kit@main/store/modules/neo-weather-card.js",
     "homepage": "https://github.com/<your-name>/neo-dashboard-kit/tree/main/store"
   }
   ```
4. **Open a Pull Request** → it gets reviewed and merged.

**The `index.json` fields**

| Field | Required | Purpose |
|---|---|---|
| `id` | ✅ | unique, **must** match the `id`/`type` in the code |
| `kind` | – | `"card"` or `"module"` (controls the store badge) |
| `name`, `description`, `icon` | ✅/– | display in the store |
| `target` | ✅ | which card(s): type · list · `"*"` (all). For **cards** = its own `id` |
| `author` | – | badge: `Community` / `Premium` / … |
| `version` | ✅ | compared to the installed one → shows **"⬆ Update"** when newer |
| `url` | ✅ | jsDelivr link to the file (pattern above) |
| `homepage` | – | link for the **Info** button (docs/repo) |

> **Shipping updates:** bump `version` **in the code** (`registerCard`/
> `registerModule` meta) **and** in `store/index.json` → the store shows
> "⬆ Update" for everyone, *Update* reloads the file.

More details: [`store/README.md`](../../store/README.md).

</details>

---

## Path 2 — Premium via Patreon (code only)

Premium cards do **not** belong in the public store. You hand your supporters
only the **code** — they paste it via **Paste code**.

### For you (the author)

1. Build the card as usual (one `.js` file, `author: "Premium"`):
   ```js
   registerCard("neo-premium-xyz", PremiumCard, {
     name: "XYZ (Premium)", icon: "💎",
     version: "1.2.0", author: "Premium",
   });
   ```
2. **Publish the raw file contents** to your supporters, e.g.:
   - as a Patreon post (code in an attachment / code block), or
   - as a file in a **private** GitHub repo / Gist for Patreons only.
3. **Update:** bump `version`, post the new code — supporters paste it again
   (overwrites the old version, no reload needed).

> A **good id** matters (`neo-premium-…`) so that re-pasting *replaces* the old
> version instead of duplicating it.

### For your supporters (this is in the announcement below)

1. Open the editor → **Extensions** → **Install card or module** →
   **Paste code** tab.
2. Paste the code you provided → **Add**.
3. Done — the premium card appears in the card-type picker (category *Premium*).
   With **Neo Dashboard Tools** it is stored server-side and loads on every
   start automatically.

> Without *Neo Dashboard Tools*, pasted code loads **for the current session
> only**. For permanent premium cards, install the integration.

---

## Path 3 — Your own HACS repo (advanced)

For large, standalone projects: publish your card as its own **HACS frontend
repo** (own `hacs.json`, release tags). Users install it via HACS as an extra
resource. It hooks into `window.NeoDashboard` exactly the same way. This is only
needed for advanced cases — most people are well served by Path 1 or 2.

---

## How your users install (to share)

**From the store (Path 1):**
> Editor → *Extensions* → *Install card or module* → **Store** → find the
> card/module → **Install**. Updates show up there as "⬆ Update".

**Via code (Path 2 / Premium):**
> Editor → *Extensions* → *Install card or module* → **Paste code** →
> paste the code → **Add**.

---

## 📋 Announcement template (copy for your community)

```text
🎉 New Neo Dashboard card: "<Name>"

How to install it:
1. Edit your dashboard → open a Neo Card (or add a new one).
2. "Extensions" section → "Install card or module".

▶ From the store (free):
   "Store" tab → search "<Name>" → Install. Done!

▶ Premium (Patreon):
   "Paste code" tab → paste the code from this post → Add.
   (Recommended: the "Neo Dashboard Tools" integration so it persists.)

Updates: the store shows "⬆ Update" automatically. For Premium I post the
new code — just paste it again.
```

---

## Checklist before sharing

- [ ] Standalone file, guarded with `neo-dashboard-ready`.
- [ ] Unique `id`/`type` (prefix `neo-…`), matching in code **and** `index.json`.
- [ ] `version` set (in the code **and**, for the store, in `index.json`).
- [ ] `author` correct (`Community` / `Premium`).
- [ ] Colors only via `--neo-*` tokens, card wrapped in `.neo-card`.
- [ ] Tested in Home Assistant (add, editor, update/remove).
- [ ] Store path: propose in **Discussions** (a maintainer adopts it into
      `store/modules/<id>.js` + `index.json`); Fork + PR only as an optional
      advanced alternative.

See also: [Development](development.md) · [Modules & Store](modules.md) ·
[`CONTRIBUTING.md`](../../CONTRIBUTING.md)

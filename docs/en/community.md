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
| share **freely** with everyone | **Discussion or Pull Request** | in the editor store, for all | Community / open source |
| offer **Premium** (Patreon) | **Share the code** | only those who get the code | paying supporters |
| ship a large standalone project | **HACS** (own repo) | installable via HACS | advanced |

The first two are the important ones — both are explained step by step below.

---

## Path 1 — Into the public Store (community)

> **Release note:** The official store starts **empty on purpose** — the first
> release focuses on the standard cards. The store is fully functional;
> **official community modules will be curated in after the release.** Your
> proposals are welcome already! 💛

There are **two** ways to get your card/module into the official **Store**
(Editor → *Extensions* → *Install card or module* → **Store**) — pick whichever
suits you. Both are welcome. 🙌

### Path 1a — Discussion (propose an idea/module)

Great if you want feedback or aren't ready to open a pull request.

1. Open a proposal in the
   [**Community Cards & Modules**](https://github.com/bkstudy2025/neo-dashboard-kit/discussions/new?category=community-cards-modules)
   category with name, type (card/module), description, screenshot and code (or
   a public repo/gist link).
2. A maintainer reviews it, gives feedback, and adopts accepted entries.

### Path 1b — Pull Request (submit a finished module)

The fastest path when your module is ready and you're comfortable with Git.

1. **Add the file:** `store/modules/<id>.js` (standalone, no imports from the
   bundle, guarded with `neo-dashboard-ready`). Template & API:
   [Development](development.md).
2. **Catalog entry** in `store/index.json`:
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
     "homepage": "https://github.com/bkstudy2025/neo-dashboard-kit"
   }
   ```
   - **`id`** = lowercase **kebab-case**, identical to the `id`/`type` in the code.
   - Set **`version`** (SemVer, e.g. `1.0.0`); bump it on updates.
   - Set **`target`** (card = its own `id`; module = target card(s) or `"*"`).
   - Add a screenshot/description to the PR if you can.
3. **Open a Pull Request.** CI **validates** the catalog **and** the module file
   automatically (see below) — a green check makes review easy.

> After it merges to `main`, your entry appears **automatically in the Store**
> for all users (click **"Refresh store"**; jsDelivr caches `@main` for a few
> hours) — with **no HACS release** and **no new bundle**.

### What the maintainer reviews

To keep the store safe and clean, the maintainer checks for:

- **readable code** (not minified/obfuscated);
- **no external requests without a reason** (no foreign CDN, no tracking);
- **no `eval` / `new Function` / `document.write` / `XMLHttpRequest`**;
- **no secrets/tokens/private links**;
- **no Premium/paywalled modules** in the community store (Premium → Path 2).

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
- [ ] Store path: propose via **Discussion** **or** submit a **Pull Request**
      (`store/modules/<id>.js` + `index.json` entry). For a PR: `id` kebab-case,
      `version`/`target` set — CI checks the rest.

See also: [Development](development.md) · [Modules & Store](modules.md) ·
[`CONTRIBUTING.md`](../../CONTRIBUTING.md)

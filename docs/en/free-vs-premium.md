# Free vs Premium — Strategy

> 🇩🇪 Deutsche Version: [`docs/de/free-vs-premium.md`](../de/free-vs-premium.md)

This document defines what belongs in the **public Community Store** and what is
distributed as **Premium**. It is the single source of truth for curation
decisions.

## Principles

- The **Free / Community Store is curated.** Only small, universal, low-risk
  modules are listed.
- **Premium is not distributed through the public Store.** It is shared via
  Patreon / private code distribution and installed through the editor's
  **"Paste code"**.
- **No Premium files in the public repository.**
- **No secret tokens** anywhere in the repo.
- **No external tracking scripts** in any module.

## Free / Community Store

Small, universal building blocks that work on top of existing Neo cards:

- Small universal modules
- Style modules
- Extra-info modules
- Simple badges
- **No** large multi-entity dashboards
- **No** Premium features in the public Store

### Recommended free modules

| Module | Purpose |
|---|---|
| Neo Mini Badge | Small secondary badge on a card |
| Neo Glow Frame | State-aware glow / border effect |
| Neo Accent Wash | Always-on or state-aware accent gradient |
| Neo Status Dot | Small status indicator dot |
| Neo Secondary Info | Secondary line / extra info |
| Neo Battery Ring | Battery level ring indicator |
| Neo Last Changed | "Last changed" relative time |
| Neo Presence Chip | Presence/occupancy chip |
| Neo Warning Banner | Inline warning banner |
| Neo Attribute Line | Render a chosen attribute as a line |

> ✅ Already in the store: **Neo Mini Badge**, **Neo Glow Frame**,
> **Neo Accent Wash**. The rest are the curated backlog for the Free store.

## Premium / Patreon

Larger or more complex building blocks:

- Larger cards or complex modules
- Multiple entities
- Ready-made dashboard building blocks
- Convenience logic
- Advanced visualisations

### Recommended Premium modules / cards

| Card / Module | Why Premium |
|---|---|
| Neo Weather Pro | Rich multi-data weather |
| Neo Calendar Pro | Full calendar view |
| Neo Camera Pro | Advanced camera card |
| Neo Room Overview | Multi-entity room dashboard |
| Neo Energy Flow | Energy flow visualisation |
| Neo Media Dashboard | Full media control surface |
| Neo Security Panel | Alarm / security dashboard |
| Neo Vacuum Pro | Advanced vacuum control |
| Neo Climate Scheduler | Scheduling + convenience logic |
| Neo Scene Composer | Scene building UI |
| Neo Graph / History Pro | History / graph visualisations |
| Neo Device Health Center | Multi-entity device health overview |

## How distribution works

| | Free / Community | Premium |
|---|---|---|
| Where | Public Store (`store/index.json`) | Patreon / private code |
| Install | Store → Install | Editor → **Paste code** |
| In public repo? | ✅ Yes (curated) | ❌ No |
| Review | Maintainer-curated | Author-controlled |

See also: [Community / Mitmachen](../en/community.md) and the
[Maintainer Store workflow](../Neo-Dashboard-Community-Store-Workflow.md).

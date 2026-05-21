# Portfolio update routine

A shared demo of Claude Code Routines for the Primary team. Anyone in `#routines-session` can run `/portco-update [text]` and a Claude Routine will identify the portfolio company, classify the update, write a row to a shared Notion database, and post a confirmation back in the channel.

## Architecture (3 sentences)

Slack slash commands have to respond within 3 seconds, but a routine takes 20 to 60 seconds, so a thin Cloudflare Worker sits in front: it verifies Slack's signature, immediately acks the user, and fires the payload at the routine's API trigger. The routine reads `data/portfolio.md` and `data/update-types.md` from this repo, extracts structured fields from the raw text, writes to Notion via MCP, and posts the final confirmation to Slack using a bot token (no Slack MCP, for reliability). Everyone in the demo shares one repo, one Slack app, one Worker, one routine, and one Notion database.

## How to use

In `#routines-session` (or anywhere the Portco Update Bot is invited):

```
/portco-update Latchel just hit $10M ARR per their CEO on LinkedIn
/portco-update Inspiren announced their Series B led by Insight, $35M
/portco-update Heard Ollie is about to launch a cat food line next month
```

The bot will reply ephemerally with "processing..." and then post a structured confirmation in-channel about 20 to 60 seconds later.

## Repo layout

- `data/` canonical reference data the routine reads at runtime (portfolio list, update taxonomy)
- `prompts/portco-update.md` the routine's prompt
- `slack-bridge/` the Cloudflare Worker (Slack signature verification + fire-and-forget to routine)
- `docs/` setup and architecture documentation

## Setup docs

- [docs/setup-notion-db.md](docs/setup-notion-db.md) create the shared Notion database
- [docs/setup-routine.md](docs/setup-routine.md) create the routine in claude.ai
- [docs/architecture.md](docs/architecture.md) why the Worker exists and how the pieces fit

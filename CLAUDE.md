# Claude context for this repo

This repo backs a shared demo routine for Primary Venture Partners. The routine processes raw text submitted via a Slack slash command (`/portco-update [text]`), identifies the portfolio company being discussed, classifies the update, and writes a structured row to a shared Notion database.

## What every routine run should do

1. Read `data/portfolio.md` for the canonical list of portfolio companies and matching guidance.
2. Read `data/update-types.md` for the update-type taxonomy.
3. Extract from the raw text: company (fuzzy-matched against the portfolio list), update type (from the taxonomy), a tight 1-2 sentence summary in your own words, and an importance score (1 to 5).
4. Write a row to the Notion database "Portfolio Updates" via the Notion MCP connector.
5. Post a confirmation to Slack using the bot token in the routine's environment (see `prompts/portco-update.md` for exact formats).

## Output destinations

- **Notion database**: "Portfolio Updates" (one row per submission)
- **Slack channel**: post to the `channel_id` provided in the payload (the demo channel is `#routines-session`)

## Style

- Summaries are 1-2 sentences, factual, no marketing language.
- No hype words (revolutionary, game-changing, leading, etc.).
- Prefer concrete numbers and verbs from the source text over paraphrase.
- If a number or fact isn't in the source, do not invent it.
- If no portfolio company can be confidently matched, classify as UNKNOWN and ask the submitter to clarify (do not write a row).

## What not to do

- Do not write to Notion if the company is UNKNOWN.
- Do not post a success confirmation if the Notion write failed.
- Do not use em dashes in any output.
- Do not invent details not present in the raw text.

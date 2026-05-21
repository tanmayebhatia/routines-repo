# Create the routine

The routine processes one `/portco-update` submission per invocation. It is triggered by the Cloudflare Worker via an API call (no schedule, no GitHub trigger).

## Prerequisites

- The Notion database "Portfolio Updates" exists (see `setup-notion-db.md`).
- The Slack app "Portco Update Bot" is installed in the Primary workspace and the bot is invited to `#routines-session`.
- The Slack bot has the `chat:write` scope (the routine posts via `chat.postMessage`). If not, add the scope at api.slack.com/apps → OAuth & Permissions → Bot Token Scopes, then reinstall the app to the workspace.
- You have the Slack bot's "Bot User OAuth Token" (`xoxb-...`) ready (api.slack.com/apps → OAuth & Permissions → Bot User OAuth Token).

## Steps

1. Go to `claude.ai/code/routines` and create a new routine.
2. **Name**: `Portfolio Update Processor`.
3. **Repository**: `tanmayebhatia/routines-repo` (branch `main`). Confirm the routine has read access to the repo so it can load `data/portfolio.md`, `data/update-types.md`, and `prompts/portco-update.md` at runtime.
4. **Prompt**: paste the full contents of `prompts/portco-update.md` from this repo. (Or reference it: "Follow the instructions in prompts/portco-update.md in this repo.")
5. **Trigger**: API only. Disable any schedule and GitHub triggers.
6. **Connectors**: keep only **Notion** and remove all others (Google Drive, Affinity, Lovelace, Gmail, Google Calendar, Slack). The routine posts to Slack directly via the bot token, not through the Slack MCP connector, so the Slack MCP is unnecessary and adds surface area.
7. **Environment**: create a **Custom environment** with one secret:
   - `SLACK_BOT_TOKEN` = the `xoxb-...` token from your Slack app's OAuth page.

   The routine reads this token to call `https://slack.com/api/chat.postMessage`.

8. Save the routine.

## After saving

The routine page should now show:

- An **API trigger URL** (something like `https://...routines.anthropic.com/trigger/...`). Copy this; you will paste it into `slack-bridge/wrangler.toml` as `ROUTINE_ENDPOINT`.
- A **bearer token** for the API trigger. Copy this; you will store it as a Cloudflare Worker secret named `ROUTINE_BEARER_TOKEN` via `wrangler secret put ROUTINE_BEARER_TOKEN`.

## Verifying

1. Click "Run" in the routine UI with a hand-crafted test payload:

```json
{
  "text": "Etched just closed a $120M Series A led by Sequoia",
  "user_name": "tanmay",
  "channel_id": "<your test channel id, can be #routines-session>",
  "response_url": ""
}
```

2. Watch the routine logs. You should see:
   - It reads `data/portfolio.md` and `data/update-types.md`.
   - It writes one row to the Notion "Portfolio Updates" database.
   - It calls `chat.postMessage` and gets `ok: true`.
   - A confirmation appears in your test channel.

If anything fails, the routine should still post the error to Slack (per `prompts/portco-update.md`).

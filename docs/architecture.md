# Architecture

```
┌──────────────┐     POST (form-encoded)       ┌──────────────────────┐
│  Slack       │ ───────────────────────────▶  │  Cloudflare Worker   │
│  /portco-    │                                │  routines-slack-     │
│  update      │ ◀─── 200 ephemeral ack ──────  │  bridge              │
└──────────────┘     within 3 seconds          └──────────┬───────────┘
                                                          │
                                                          │ fire-and-forget
                                                          │ POST (JSON, bearer)
                                                          ▼
┌──────────────┐                                 ┌──────────────────────┐
│  Slack       │ ◀── chat.postMessage (bot ──── │  Routine             │
│  channel     │     token from env)             │  (Anthropic cloud)   │
│              │                                  │                      │
│  + Notion DB │ ◀── Notion MCP write ─────────  │                      │
└──────────────┘                                 └──────────────────────┘
```

## Why the Cloudflare Worker exists

Slack slash commands require a response within 3 seconds, or the user sees "operation_timeout" in the channel. The routine takes 20 to 60 seconds because it loads repo files, reasons about the text, writes to Notion, and posts to Slack.

The Worker bridges the gap. It:

1. Verifies the Slack request signature (HMAC-SHA256 over `v0:{timestamp}:{body}` using the app's signing secret).
2. Rejects requests older than 5 minutes (replay protection).
3. Parses the URL-encoded form body Slack sent.
4. Uses `ctx.waitUntil` to fire a fire-and-forget POST at the routine's API trigger (bearer-token auth) with a JSON payload containing `text`, `user_name`, `channel_id`, and `response_url`.
5. Returns an immediate ephemeral ack ("Got it, processing your update...") to Slack within milliseconds.

## Why the routine uses a Slack bot token, not Slack MCP

The routine could post back via the Slack MCP connector, but in practice that path has more moving parts (MCP auth state, channel permissions, account attribution) and was less reliable in early tests. Calling `https://slack.com/api/chat.postMessage` directly with a bot token stored as an env secret is one fetch call, well-documented, and clearly auditable.

## Shared resources

Every demo participant uses the same:

- Slack app (`Portco Update Bot`)
- Slack channel (`#routines-session`)
- Cloudflare Worker (`routines-slack-bridge`)
- Routine (`Portfolio Update Processor`)
- Notion database (`Portfolio Updates`)
- GitHub repo (`tanmayebhatia/routines-repo`)

This is deliberate. Attendees only need Slack to participate; everything else is set up once.

## Failure modes worth knowing about

- **Worker can't reach routine**: ack still returns to Slack, but no confirmation arrives. Check `wrangler tail` for the error.
- **Routine can't write to Notion**: per `prompts/portco-update.md`, the routine posts an error message to Slack instead of a success confirmation.
- **Routine can't post to Slack via `chat.postMessage`**: it falls back to POSTing the same message to the `response_url` from the original Slack payload (works for 30 min, max 5 responses).
- **Slack signature fails**: Worker returns 401, no routine triggered, no message in channel. Usually means the signing secret in the Worker doesn't match the Slack app's signing secret.

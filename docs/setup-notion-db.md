# Create the Notion database

The routine writes one row per submission to a Notion database it can reach via the Notion MCP connector. You need to create this database once, then share it with the Notion account/workspace connected to your MCP.

## Steps

1. In Notion, create a new page in whatever workspace your Notion MCP connector is authenticated against.
2. On that page, insert a full-page database (`/database - full page`).
3. Name the database exactly: **Portfolio Updates** (the routine looks it up by this name).
4. Configure the columns. The default "Name" column should be renamed to **Company**. Add the rest.

| Column       | Type    | Notes                                                                          |
|--------------|---------|--------------------------------------------------------------------------------|
| Company      | Title   | The matched portfolio company name (rename the default Name column to this).   |
| Type         | Select  | Options: Fundraise, Risk, Metrics, Press, Impact Work, General Update.         |
| Summary      | Text    | 1-2 sentence summary written by the routine.                                   |
| Submitted by | Text    | Slack `user_name` of the submitter.                                            |
| Raw text     | Text    | The original `/portco-update` text, unmodified.                                |
| Importance   | Number  | Integer 1 to 5.                                                                |
| Date         | Date    | The routine sets this to today's date at write time.                           |

5. Pre-create the 6 Select options on **Type** so the routine doesn't have to (Fundraise, Risk, Metrics, Press, Impact Work, General Update).
6. Share the database with your Notion MCP connector. To find the right account: open claude.ai → Settings → Connectors → Notion. The connected account's email is shown there. In Notion, click "Share" on the database page and invite that email with "Can edit" access. If your MCP uses an integration (not personal account), use Notion's "Connections" menu on the database to add the integration instead.
7. Copy the database URL. You don't strictly need it in the routine prompt (it looks up by name) but keep it handy for debugging.

## Quick sanity check

Open the database and manually add one test row. If you can see it and edit it, the routine should be able to as well (assuming MCP has edit access).

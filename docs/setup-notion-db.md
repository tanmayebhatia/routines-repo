# Notion database (already created)

The routine writes one row per submission to a Notion database via the Notion MCP connector. This database exists; it does not need to be created. This doc just records its identity and schema for future readers.

## Identity

- **Workspace**: primaryteam
- **Database title**: Routines Session
- **Primary view (table)**: Portfolio Updates
- **Database URL**: https://www.notion.so/primaryteam/3676278e8af28065a62bf3e6c352e577?v=3676278e8af280ca8b2a000cc0e9408a
- **Data source URL (used by the routine)**: `collection://3676278e-8af2-8069-990f-000bb24f2b1d`

The routine addresses the database by its data source URL, never by name, so the database title is not load-bearing.

## Schema

| Column         | Type    | Notes                                                                          |
|----------------|---------|--------------------------------------------------------------------------------|
| Company        | Title   | The matched portfolio company name.                                            |
| Type           | Select  | Options (exact case): Fundraise, Risk, Metrics, Press, Impact Work, General Update. |
| Summary        | Text    | 1-2 sentence summary written by the routine.                                   |
| Submitted By   | Text    | Slack `user_name` of the submitter (note: capital B).                          |
| Raw text       | Text    | The original `/portco-update` text, unmodified.                                |
| Importance     | Number  | Integer 1 to 5.                                                                |
| Date           | Date    | Routine sets this to today's date (UTC) at write time.                         |

Column names are case- and spacing-sensitive for the MCP write call. If a column gets renamed, update `prompts/portco-update.md` to match.

## Connector access

The database must be shared with the Notion account that backs the Notion MCP connector on your Claude account. To check: claude.ai → Settings → Connectors → Notion shows the connected account; that account must have edit access to this database. This was already set up before the demo.

## Sanity check

Open the database in Notion and confirm you can manually add a row. The routine writes the same way through MCP.

# Primary portfolio (demo subset)

This is the canonical list of portfolio companies for the routine to match against. Only companies listed here count as matches; anything else is UNKNOWN.

| Company  | Sector             | Stage    | Lead partner | Notes / aliases                                 |
|----------|--------------------|----------|--------------|-------------------------------------------------|
| Etched   | AI infrastructure  | Series A | Brad         | Transformer ASIC chips. Founders: Gavin, Chris. |
| Inspiren | Healthcare / SaaS  | Series A | Ben          | AI nurse-assist platform for senior living.     |
| Ollie    | Consumer / Pets    | Series C | Brian        | Fresh dog food, DTC. Sometimes "Ollie Pets".    |

## Match guidance

The routine should try to identify the portfolio company being discussed by checking, in order:

1. **Exact company name** ("Etched", "Inspiren", "Ollie") including obvious case variations.
2. **Founder names** listed in the Notes column.
3. **Product or domain references** that uniquely point to one company (e.g. "transformer chip startup" → Etched, "senior living AI" → Inspiren, "fresh dog food" → Ollie).
4. **Aliases** listed in the Notes column.

If two or more companies plausibly match, do not guess: treat as UNKNOWN.

If no company in this list is a confident match, return UNKNOWN. Do not write a Notion row in that case; instead ask the submitter to clarify (see `prompts/portco-update.md` for the exact format).

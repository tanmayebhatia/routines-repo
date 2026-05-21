// Slack -> Routine bridge.
// Slack slash commands must be acked within 3 seconds, but the routine takes
// 20 to 60 seconds. We verify Slack's signature, fire-and-forget the payload
// at the routine via ctx.waitUntil, and return an immediate ephemeral ack.

export default {
  async fetch(request, env, ctx) {
    if (request.method !== "POST") {
      return new Response("Method Not Allowed", { status: 405 });
    }

    const timestamp = request.headers.get("x-slack-request-timestamp");
    const signature = request.headers.get("x-slack-signature");
    const rawBody = await request.text();

    if (!timestamp || !signature) {
      return new Response("Missing Slack signature headers", { status: 401 });
    }

    // Replay protection: reject anything older than 5 minutes.
    const now = Math.floor(Date.now() / 1000);
    if (Math.abs(now - Number(timestamp)) > 60 * 5) {
      return new Response("Stale request", { status: 401 });
    }

    const valid = await verifySlackSignature(
      env.SLACK_SIGNING_SECRET,
      timestamp,
      rawBody,
      signature,
    );
    if (!valid) {
      return new Response("Bad signature", { status: 401 });
    }

    const form = new URLSearchParams(rawBody);
    const text = form.get("text") || "";
    const user_name = form.get("user_name") || "unknown";
    const channel_id = form.get("channel_id") || "";
    const response_url = form.get("response_url") || "";

    // Fire-and-forget: kick off the routine, return to Slack within 3s.
    ctx.waitUntil(triggerRoutine(env, { text, user_name, channel_id, response_url }));

    const ackText = text
      ? `Got it, processing your update: "${text}". I'll post the result in this channel shortly.`
      : "Got it, processing your update. I'll post the result in this channel shortly.";

    return Response.json({
      response_type: "ephemeral",
      text: ackText,
    });
  },
};

// The routines API only accepts a single `text` field, treated as freeform
// string. We JSON-stringify our multi-field payload into it; the routine
// prompt parses it back out.
async function triggerRoutine(env, payload) {
  try {
    const res = await fetch(env.ROUTINE_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${env.ROUTINE_BEARER_TOKEN}`,
        "anthropic-beta": "experimental-cc-routine-2026-04-01",
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({ text: JSON.stringify(payload) }),
    });
    if (!res.ok) {
      console.error("Routine trigger failed", res.status, await res.text());
    }
  } catch (err) {
    console.error("Routine trigger threw", err);
  }
}

// Slack signing spec: basestring is `v0:{timestamp}:{rawBody}`, HMAC-SHA256
// with the signing secret, hex-encoded, compared against the `v0=...` header.
async function verifySlackSignature(secret, timestamp, body, signatureHeader) {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    enc.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const sigBytes = await crypto.subtle.sign("HMAC", key, enc.encode(`v0:${timestamp}:${body}`));
  const hex = [...new Uint8Array(sigBytes)].map((b) => b.toString(16).padStart(2, "0")).join("");
  const expected = `v0=${hex}`;
  return timingSafeEqual(expected, signatureHeader);
}

function timingSafeEqual(a, b) {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

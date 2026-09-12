# Relay

Relay is not a task manager. It is a **re-entry system** for work that gets interrupted.

Most planning tools help collect more. Relay asks for up to three promises, then makes each one carry the information tomorrow-you actually needs: the visible outcome, the first physical move, and what “enough” looks like. When the day ends, unfinished promises are handed forward with their re-entry cue intact.

## Run it on an iPad

Relay is a static web app. The best option is to host this folder on any static host that gives you an HTTPS URL (GitHub Pages, Cloudflare Pages, Netlify, or Vercel all work), then open that URL in Chrome on your iPad. Use Chrome’s **Share → Add to Home Screen** to make it easy to return to. HTTPS enables the included offline cache after the first visit.

For a quick home-Wi-Fi preview, on a computer in this folder run:

```sh
python3 -m http.server 8000 --bind 0.0.0.0
```

Then open `http://YOUR-COMPUTER-IP:8000` in Chrome on the iPad. This preview works, but it cannot use the offline cache because it is plain HTTP.

## The daily ritual

1. Write the one thread you do not want to lose.
2. Add no more than three promises. A promise must include an outcome, a first physical move, and a definition of enough.
3. Select the promise you are about to touch, then start the 20-minute session.
4. Put new distractions in **Loose ends** rather than changing the plan mid-stream.
5. At the end, choose **Prepare tomorrow’s handoff**. Relay carries incomplete promises into tomorrow without stripping away the context required to restart.

## Privacy

Everything is saved only in the browser’s local storage. Relay has no account, sync, analytics, or server database. Clearing site data removes your pages.

## Capture from the work itself

Relay now includes a small Chrome extension in [`extension/`](extension/). It is deliberately different from a full OAuth integration: it captures the exact page you are already working in, plus your re-entry cue, and sends it into Relay as a source-linked promise. This works today for Slack, Linear, GitHub, Figma, Google Docs, Notion, and any other web app—without asking for access to an entire workspace.

### Install Relay Capture in desktop Chrome

1. Run Relay locally or deploy it to an HTTPS URL.
2. In desktop Chrome, open `chrome://extensions` and enable **Developer mode**.
3. Choose **Load unpacked** and select this repository’s `extension` folder.
4. Open the Relay Capture extension’s **Details → Extension options** and set your Relay URL. Use `http://localhost:8000` locally or your deployed HTTPS Relay URL.
5. While viewing a Slack thread, Linear issue, GitHub pull request, Figma file, or document, click the Relay extension icon. Enter the first move and “enough” threshold, then choose **Open in Relay**.

Relay opens a prefilled promise with the source link attached. Selecting that promise later gives you the original first move and an **Open source** link, so you return to the exact work surface rather than reconstructing it from memory.

## Integration roadmap

The capture extension is the first integration because it is private, works across tools, and proves the re-entry behavior before Relay requests broad workspace access. The next production connectors should be Slack and Linear: Relay can then draft “what changed since you last touched this?” summaries from related messages and issue activity, always retaining direct source links and requiring user confirmation for handoffs.

## Start the direct Slack and Linear connections

Relay now includes a small Node server that serves the app and owns the OAuth exchange. Browser code never receives OAuth client secrets or provider access tokens. The starter server keeps connected tokens only in memory for the current development session; that is intentional for local testing and means reconnecting is required after a server restart.

1. Copy `.env.example` to `.env` and fill in the Slack and Linear OAuth client IDs and secrets you create.
2. In each provider’s OAuth app settings, configure these redirect URLs:

   ```text
   http://localhost:8000/auth/slack/callback
   http://localhost:8000/auth/linear/callback
   ```

3. Export the values in your shell (or load `.env` with your preferred local environment tool) and start Relay:

   ```sh
   export SLACK_CLIENT_ID="..."
   export SLACK_CLIENT_SECRET="..."
   export LINEAR_CLIENT_ID="..."
   export LINEAR_CLIENT_SECRET="..."
   npm start
   ```

4. Open `http://localhost:8000`, choose **Connect sources**, then authorize Slack or Linear.

The server validates the OAuth state, exchanges the authorization code server-side, verifies the connected workspace, and exposes only connection metadata to the browser. It does not persist provider tokens to disk. The next production step is encrypted token storage plus a webhook/event pipeline; that should be added only after we connect and validate your real workspaces.

## Google Calendar sync

Relay can read your primary Google Calendar for the currently open daily page. It is deliberately a **read-only context layer**: Relay displays commitments already occupying the day so you can make realistic promises, but it does not create, edit, or delete calendar events.

1. Create a Google OAuth web application and add this authorized redirect URL:

   ```text
   http://localhost:8000/auth/google/callback
   ```

2. Set `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` alongside the other values in `.env.example`.
3. Start Relay with `npm start`, open **Connect sources**, and choose **Connect Calendar**.

After authorization, Relay fetches the selected day’s events from your primary calendar and shows their start times beside the work handoff. Calendar access tokens remain server-side in memory during development and are never exposed to the browser.

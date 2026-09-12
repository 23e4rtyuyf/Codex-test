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

# Daybook

Daybook is not a project-management board or a habit tracker. It is one quiet, date-specific page: a reason for the day, a deliberately short list, a place to park interruptions, and a closing note. Everything stays in the browser on the device you use it on.

## Use it on an iPad in Chrome

Daybook must be opened from a URL; Chrome cannot run the files directly from this repository on an iPad.

1. Put this folder on a computer, then run the command below from the folder.
2. Keep the computer and iPad on the same Wi-Fi network.
3. Find the computer's local IP address (for example, `192.168.1.20`) and open `http://192.168.1.20:8000` in Chrome on the iPad.
4. In Chrome, use the **Share** button and choose **Add to Home Screen** if it is available. This makes launch easier, but offline caching requires an HTTPS deployment (the local network URL is plain HTTP).

```sh
python3 -m http.server 8000 --bind 0.0.0.0
```

For the best iPad experience, upload these static files to any static host (for example, GitHub Pages, Cloudflare Pages, Netlify, or Vercel) and open the resulting HTTPS URL in Chrome. That HTTPS URL enables Daybook's offline cache after the first visit. No build command or server-side environment variables are needed.

## A useful first five minutes

1. Write a single sentence under **The point of today**. It is a direction, not another metric.
2. Keep **Doing** to a few concrete, finishable items. Use the check circle rather than making more lists.
3. When an interruption or loose thought arrives, add it to **Not for now** instead of abandoning the task in front of you.
4. Start a 25-minute session only when you know what you are about to work on.
5. At the end, write a closing note. Moving to another date preserves the page you just made.

## Data and privacy

Tasks, intentions, parking-lot entries, closing notes, and theme preferences are stored in this browser's `localStorage`. They are not synced, sent to a server, or shared between devices. Clearing Chrome's site data will erase them.

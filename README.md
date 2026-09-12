# Daybook

A private, local-first daily planner with a deliberately quiet editorial interface. It runs entirely in the browser and stores its data in `localStorage`—there is no account, build step, or service dependency.

## Run locally

Open `index.html` in a modern browser, or serve this folder:

```sh
python3 -m http.server 8000
```

Then open `http://localhost:8000`.

## What it does

- Capture a task with the button or `Cmd/Ctrl + K`.
- Mark items complete or remove completed items; the list persists locally.
- Start, pause, or reset a 25-minute focus timer.
- Add calendar items and switch between paper and dark reading modes.

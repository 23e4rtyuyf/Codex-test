const origin = document.querySelector('#origin');
chrome.storage.sync.get('relayOrigin', ({ relayOrigin = 'http://localhost:8000' }) => { origin.value = relayOrigin; });
document.querySelector('#save').onclick = async () => { try { const url = new URL(origin.value); await chrome.storage.sync.set({ relayOrigin: url.origin }); document.querySelector('#status').textContent = 'Saved.'; } catch { document.querySelector('#status').textContent = 'Enter a complete URL, including https://'; } };

const $ = selector => document.querySelector(selector);
let tab;
chrome.tabs.query({ active: true, currentWindow: true }, ([activeTab]) => {
  tab = activeTab;
  $('#pageTitle').textContent = activeTab?.title || 'Untitled page';
});
$('#send').onclick = async () => {
  if (!tab?.url) return;
  const { relayOrigin = 'http://localhost:8000' } = await chrome.storage.sync.get('relayOrigin');
  const params = new URLSearchParams({ capture: tab.url, title: tab.title || '', cue: $('#cue').value.trim(), proof: $('#proof').value.trim() });
  chrome.tabs.create({ url: `${relayOrigin.replace(/\/$/, '')}/?${params}` });
};

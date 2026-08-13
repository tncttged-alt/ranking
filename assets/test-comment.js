(() => {
  const form = document.getElementById('commentForm');
  const result = document.getElementById('result');
  const api = document.body.dataset.commentsApi || '';

  function show(msg){ result.textContent = typeof msg === 'string' ? msg : JSON.stringify(msg, null, 2); }

  form.addEventListener('submit', async (ev)=>{
    ev.preventDefault();
    const name = document.getElementById('name').value || '匿名';
    const text = document.getElementById('text').value || '';
    const useShort = document.getElementById('useShort').checked;
    if (!api) return show('data-comments-api が設定されていません');

    show('送信中...');
    try {
      const headers = { 'Content-Type': 'application/json' };
      if (useShort) headers['x-short-circuit'] = '1';
      const res = await fetch(api, { method: 'POST', headers, body: JSON.stringify({ path: window.location.pathname, name, text, time: Date.now() }) });
      const body = await res.text();
      show({ status: res.status, body });
    } catch (e) {
      show('送信エラー: ' + (e && e.message ? e.message : e));
    }
  });
})();

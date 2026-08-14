(function(){
  function el(id){return document.getElementById(id)}

  function renderRelated(){
    const box = el('related');
    const list = window.relatedArticles || [];
    if (!list || !list.length){ box.style.display='none'; return }
    box.innerHTML = '<h3>関連記事</h3><ul>' + list.map(a=>`<li><a href="${a.url}">${a.title}</a></li>`).join('') + '</ul>';
  }

  function storageKey(){ return 'comments:' + window.location.pathname }

  function loadComments(){
    const raw = localStorage.getItem(storageKey()) || '[]';
    try{ return JSON.parse(raw) }catch(e){ return [] }
  }

  function saveComments(arr){ localStorage.setItem(storageKey(), JSON.stringify(arr)) }

  function renderComments(){
    const out = el('comments-list');
    const comments = loadComments();
    if (!comments.length){ out.innerHTML='<p>まだコメントはありません。</p>'; return }
    const last = comments.slice(-5).reverse();
    out.innerHTML = last.map(c=>`<div class="comment-item"><div class="comment-meta">${escapeHTML(c.name)} • ${new Date(c.time).toLocaleString()}</div><div class="comment-text">${escapeHTML(c.text)}</div></div>`).join('');
    if (comments.length>5){ out.innerHTML += `<div><a href="/rankings/comments.html">コメントをさらに表示</a></div>` }
  }

  function escapeHTML(s){ return String(s).replace(/[&<>"']/g, function(m){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m] }) }

  function initForm(){
    const form = el('commentForm');
    if (!form) return;
    form.addEventListener('submit', (ev)=>{
      ev.preventDefault();
      const name = el('comment-name').value || '匿名';
      const text = el('comment-text').value || '';
      if (!text) return alert('コメントを入力してください');
      const cs = loadComments();
      cs.push({ name, text, time: Date.now() });
      saveComments(cs);
      renderComments();
      el('comment-text').value='';
    });
  }

  document.addEventListener('DOMContentLoaded', ()=>{
    renderRelated();
    renderComments();
    initForm();
  });
})();

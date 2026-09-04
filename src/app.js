(function () {
  'use strict';

  var TITLE = '혁신의숲 FAQ 아카이브';
  var CLOSE = '<' + '/script>';
  var MAX_DOC = 16 * 1024 * 1024;

  var data = JSON.parse(document.getElementById('faq-data').textContent);

  var $ = function (id) { return document.getElementById(id); };
  var esc = function (s) {
    return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;')
      .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  };
  var stripScripts = function (h) {
    return String(h).replace(/<script[\s\S]*?<\/script>/gi, '')
      .replace(/ on[a-z]+="[^"]*"/gi, '');
  };
  var textOf = function (h) {
    var d = document.createElement('div');
    d.innerHTML = stripScripts(h);
    return (d.textContent || '').replace(/\s+/g, ' ').trim();
  };
  var mb = function (n) { return (n / 1048576).toFixed(2) + 'MB'; };
  var byId = function (id) {
    for (var i = 0; i < data.articles.length; i++) {
      if (data.articles[i].id === id) return data.articles[i];
    }
    return null;
  };
  var inCat = function (cat) {
    return data.articles.filter(function (a) { return a.cat === cat; });
  };

  /* ---------------- theme ---------------- */
  var root = document.documentElement;
  try {
    var saved = localStorage.getItem('if-faq-theme');
    if (saved) root.setAttribute('data-theme', saved);
  } catch (e) {}
  $('themeBtn').addEventListener('click', function () {
    var cur = root.getAttribute('data-theme');
    if (!cur) cur = matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    var next = cur === 'dark' ? 'light' : 'dark';
    root.setAttribute('data-theme', next);
    try { localStorage.setItem('if-faq-theme', next); } catch (e) {}
  });

  /* ---------------- sidebar (article pages only) ---------------- */
  function renderNav() {
    var h = '';
    data.cats.forEach(function (cat) {
      var items = inCat(cat);
      if (!items.length) return;
      h += '<div class="nav-group" data-cat="' + esc(cat) + '">' +
        '<div class="nav-cat"><span>' + esc(cat) + '</span>' +
        '<span class="nav-count">' + items.length + '</span></div><ul>';
      items.forEach(function (a) {
        h += '<li><a class="nav-link" href="#' + a.id + '" data-q="' +
          esc(a.title + ' ' + cat) + '"><span class="nav-emoji">' +
          esc(a.emoji || '·') + '</span><span>' + esc(a.title) + '</span></a></li>';
      });
      h += '</ul></div>';
    });
    $('nav').innerHTML = h;
  }

  /* ---------------- home ---------------- */
  function renderHome() {
    var h = '';
    var bestArts = data.best.map(byId).filter(Boolean);
    if (bestArts.length) {
      h += '<div class="best-head" id="bestHead"><h2>💡 자주 물어보는 질문 BEST</h2></div>' +
        '<div class="best-grid" id="bestGrid">';
      bestArts.forEach(function (a, i) {
        h += '<a class="best-card" href="#' + a.id + '">' +
          '<span class="best-rank">BEST ' + (i + 1) + '</span>' +
          '<span class="best-emoji">' + esc(a.emoji) + '</span>' +
          '<span class="best-title">' + esc(a.title) + '</span>' +
          '<span class="best-desc">' + esc(a.summary) + '</span></a>';
      });
      h += '</div>';
    }
    h += '<div class="home-cats">';
    data.cats.forEach(function (cat) {
      var items = inCat(cat);
      if (!items.length) return;
      h += '<section class="cat-block" data-cat="' + esc(cat) + '">' +
        '<div class="cat-head"><h2 class="cat-title">' + esc(cat) + '</h2>' +
        '<span class="cat-meta">' + items.length + '개의 아티클</span></div><ul class="rows">';
      items.forEach(function (a) {
        h += '<li class="row-item" data-q="' + esc(a.title + ' ' + cat) + '">' +
          '<a class="row" href="#' + a.id + '"><span class="row-emoji">' + esc(a.emoji || '📄') + '</span>' +
          '<span class="row-main"><span class="row-title">' + esc(a.title) + '</span>' +
          '<span class="row-desc">' + esc(a.summary) + '</span></span>' +
          '<span class="row-go">&#8250;</span></a></li>';
      });
      h += '</ul></section>';
    });
    h += '</div><div class="no-result" id="noResult" hidden>검색 결과가 없습니다.</div>';
    $('home').innerHTML = h;
  }

  /* ---------------- article ---------------- */
  function renderDoc(a) {
    var idx = data.articles.indexOf(a);
    var prev = data.articles[idx - 1], next = data.articles[idx + 1];
    var pg = '<nav class="pager">';
    pg += prev
      ? '<a class="pg pg-prev" href="#' + prev.id + '"><span class="pg-dir">&#8592; 이전 문의</span>' +
        '<span class="pg-t">' + esc(prev.emoji + ' ' + prev.title) + '</span></a>'
      : '<span class="pg pg-empty"></span>';
    pg += next
      ? '<a class="pg pg-next" href="#' + next.id + '"><span class="pg-dir">다음 문의 &#8594;</span>' +
        '<span class="pg-t">' + esc(next.emoji + ' ' + next.title) + '</span></a>'
      : '<span class="pg pg-empty"></span>';
    pg += '</nav>';

    $('doc').innerHTML =
      '<div class="crumb"><a href="#">혁신의숲 FAQ</a><span class="crumb-sep">/</span>' +
      '<span>' + esc(a.cat) + '</span></div>' +
      '<header class="doc-head"><span class="doc-emoji">' + esc(a.emoji || '📄') + '</span>' +
      '<h1 class="doc-title">' + esc(a.title) + '</h1></header>' +
      '<div class="doc-tools"><span class="chip">' + esc(a.cat) + '</span>' +
      (adminMode ? '<button class="btn btn-sm" id="editThis" type="button">✎ 이 문의 수정</button>' : '') +
      '</div><div class="doc-body">' + stripScripts(a.html) + '</div>' + pg +
      '<a class="back" href="#">&#8592; 전체 목록으로</a>';

    if (adminMode) $('editThis').addEventListener('click', function () { openEditor(a.id); });
  }

  /* ---------------- routing ---------------- */
  var views = ['home', 'doc', 'admin'];
  function show(name) {
    views.forEach(function (v) { $(v).hidden = (v !== name); });
    var solo = (name === 'home');
    $('wrap').classList.toggle('solo', solo);
    $('side').hidden = solo;
  }
  function route() {
    var id = location.hash.slice(1);
    if (id === 'admin') {
      if (!capReady) { location.hash = ''; return; }
      setAdmin(true);
      renderAdmin(); show('admin');
      document.title = '관리자 · ' + TITLE;
    } else {
      var a = byId(id);
      if (a) { renderDoc(a); show('doc'); document.title = a.title + ' · ' + TITLE; }
      else { show('home'); document.title = TITLE; }
    }
    var links = document.querySelectorAll('.nav-link');
    for (var i = 0; i < links.length; i++) {
      links[i].classList.toggle('on', links[i].getAttribute('href') === '#' + id);
    }
    doSearch();
    window.scrollTo(0, 0);
  }

  /* ---------------- search ---------------- */
  function doSearch() {
    var v = $('q').value.trim().toLowerCase(), on = v.length > 0, hit = 0;
    var links = document.querySelectorAll('.nav-link');
    for (var i = 0; i < links.length; i++) {
      var m = !on || links[i].dataset.q.toLowerCase().indexOf(v) > -1;
      links[i].parentElement.hidden = !m;
    }
    var rows = document.querySelectorAll('.row-item');
    for (var j = 0; j < rows.length; j++) {
      var mm = !on || rows[j].dataset.q.toLowerCase().indexOf(v) > -1;
      rows[j].hidden = !mm;
      if (mm) hit++;
    }
    var groups = document.querySelectorAll('.nav-group');
    for (var k = 0; k < groups.length; k++) {
      groups[k].hidden = !groups[k].querySelector('li:not([hidden])');
    }
    var blocks = document.querySelectorAll('.cat-block');
    for (var l = 0; l < blocks.length; l++) {
      blocks[l].hidden = !blocks[l].querySelector('.row-item:not([hidden])');
    }
    $('navEmpty').hidden = !!document.querySelector('.nav-group:not([hidden])');
    if ($('noResult')) $('noResult').hidden = hit > 0;
    if ($('bestGrid')) { $('bestGrid').hidden = on; $('bestHead').hidden = on; }
  }
  $('q').addEventListener('input', function () {
    if (location.hash && location.hash !== '#') { location.hash = ''; return; }
    doSearch();
  });

  /* ================= admin ================= */
  var capReady = false;   // the artifact capability resolved in this view
  var adminMode = false;  // operator explicitly turned admin controls on
  var artifactCap = null;
  var downloadsCap = null;
  var pendingDel = null;   // id awaiting the inline delete confirmation

  // the sandbox blocks alert()/confirm()/prompt(), so all feedback happens in-page
  function msg(text, kind) {
    var m = $('admMsg');
    if (!m) return;
    m.hidden = false;
    m.className = 'adm-msg' + (kind ? ' ' + kind : '');
    m.textContent = text;
  }

  function setAdmin(on) {
    adminMode = on;
    $('admBanner').hidden = !on;
    document.body.classList.toggle('has-banner', on);
  }

  function goAdmin() {
    if (!capReady) return;
    if (location.hash.slice(1) === 'admin') {
      // already on the admin route (e.g. inside the editor) — re-render the list in place
      setAdmin(true);
      renderAdmin();
      show('admin');
      window.scrollTo(0, 0);
    } else {
      location.hash = 'admin';
    }
  }

  function exitAdmin() {
    setAdmin(false);
    if (location.hash && location.hash !== '#') location.hash = '';
    else route();
  }

  function docSize() {
    try { return buildDoc().length; } catch (e) { return 0; }
  }

  function renderAdmin() {
    var size = docSize();
    var h = '<div class="adm-head"><div>' +
      '<h1 class="adm-h">FAQ 관리자</h1>' +
      '<p class="adm-sub">문의를 추가·수정·삭제하고 순서를 바꾼 뒤 저장하면 새 버전이 발행돼 모든 사람에게 반영됩니다.</p>' +
      '</div><div class="adm-actions">' +
      '<button class="btn btn-primary" id="admSave" type="button">저장하고 발행</button>' +
      '<button class="btn" id="admNew" type="button">+ 새 문의 추가</button>' +
      (downloadsCap ? '<button class="btn" id="admExport" type="button">⬇ 내용 내려받기</button>' : '') +
      '<a class="btn" href="#">FAQ 화면으로</a>' +
      '<button class="btn" id="admExit" type="button">관리자 모드 끄기</button>' +
      '</div></div>' +
      '<div class="adm-msg" id="admMsg" hidden></div>' +
      '<p class="adm-note"><b>편집 권한</b>이 있는 계정에서만 실제로 저장됩니다 — 권한이 없으면 저장 단계에서 거부돼요. ' +
      '저장은 페이지를 새 버전으로 발행하는 방식이라 몇 초 걸리고, 저장되면 열려 있는 모든 화면이 새 버전으로 바뀝니다.<br>' +
      '현재 문서 크기 <b>' + mb(size) + '</b> / 상한 16MB — 이미지를 넣을수록 커집니다.</p>';

    data.cats.forEach(function (cat) {
      var items = inCat(cat);
      h += '<section class="adm-cat"><div class="adm-cat-h"><h3>' + esc(cat) + '</h3>' +
        '<span>' + items.length + '개</span></div><ul class="adm-list">';
      items.forEach(function (a, i) {
        var isBest = data.best.indexOf(a.id) > -1;
        if (pendingDel === a.id) {
          h += '<li class="adm-item is-del" data-id="' + a.id + '">' +
            '<span class="adm-em">🗑</span>' +
            '<span class="adm-t">「' + esc(a.title) + '」 을(를) 삭제할까요?</span>' +
            '<span class="adm-btns">' +
            '<button class="btn btn-sm btn-danger" data-act="del-yes">삭제</button>' +
            '<button class="btn btn-sm" data-act="del-no">취소</button>' +
            '</span></li>';
          return;
        }
        h += '<li class="adm-item' + (isBest ? ' is-best' : '') + '" data-id="' + a.id + '">' +
          '<span class="adm-em">' + esc(a.emoji || '📄') + '</span>' +
          '<span class="adm-t">' + esc(a.title) + '</span>' +
          (isBest ? '<span class="adm-badge">BEST</span>' : '') +
          '<span class="adm-btns">' +
          '<button class="icon-btn' + (isBest ? ' on' : '') + '" data-act="best" title="BEST 지정">★</button>' +
          '<button class="icon-btn" data-act="up" title="위로"' + (i === 0 ? ' disabled' : '') + '>↑</button>' +
          '<button class="icon-btn" data-act="down" title="아래로"' + (i === items.length - 1 ? ' disabled' : '') + '>↓</button>' +
          '<button class="icon-btn" data-act="edit" title="수정">✎</button>' +
          '<button class="icon-btn" data-act="del" title="삭제">🗑</button>' +
          '</span></li>';
      });
      h += '</ul></section>';
    });
    $('admin').innerHTML = h;

    $('admNew').addEventListener('click', function () { openEditor(null); });
    $('admExit').addEventListener('click', exitAdmin);
    $('admSave').addEventListener('click', function () { publish(msg, 'admSave'); });

    if (downloadsCap) {
      $('admExport').addEventListener('click', function () {
        var m = $('admMsg');
        m.hidden = false;
        m.className = 'adm-msg';
        m.textContent = '내려받기를 준비하는 중…';
        downloadsCap.save({ filename: 'data.json', data: JSON.stringify(data) })
          .then(function () {
            m.className = 'adm-msg ok';
            m.textContent = 'data.json 을 내려받았습니다. 공개 사이트에 반영하려면 이 파일을 저장소 폴더에 덮어쓰고 반영 스크립트를 실행하세요.';
          })
          .catch(function (e) {
            var c = e && e.code;
            m.className = 'adm-msg err';
            if (c === 'declined') m.textContent = '내려받기를 취소했습니다.';
            else if (c === 'rate_limited') m.textContent = '잠시 후 다시 시도해 주세요.';
            else m.textContent = '내려받기를 할 수 없습니다.';
          });
      });
    }
  }

  // one delegated listener for the whole admin list — renderAdmin() only swaps innerHTML,
  // so attaching inside it would stack a new listener on every re-render
  $('admin').addEventListener('click', function (ev) {
    var b = ev.target.closest('button[data-act]');
    if (!b) return;
    var row = b.closest('.adm-item');
    if (!row) return;
    var id = row.dataset.id;
    var act = b.dataset.act;
    if (act === 'edit') return openEditor(id);
    if (act === 'del') { pendingDel = id; return renderAdmin(); }
    if (act === 'del-no') { pendingDel = null; return renderAdmin(); }
    if (act === 'del-yes') return delArticle(id);
    if (act === 'best') return toggleBest(id);
    if (act === 'up' || act === 'down') return move(id, act === 'up' ? -1 : 1);
  });

  function move(id, dir) {
    var a = byId(id);
    var sib = inCat(a.cat);
    var i = sib.indexOf(a), j = i + dir;
    if (j < 0 || j >= sib.length) return;
    var gi = data.articles.indexOf(sib[i]), gj = data.articles.indexOf(sib[j]);
    data.articles[gi] = sib[j];
    data.articles[gj] = sib[i];
    renderAdmin(); renderNav(); renderHome();
  }

  function toggleBest(id) {
    var i = data.best.indexOf(id);
    if (i > -1) data.best.splice(i, 1);
    else {
      if (data.best.length >= 3) {
        renderAdmin();
        msg('BEST는 최대 3개까지 지정할 수 있습니다. 먼저 하나를 해제해 주세요.', 'err');
        return;
      }
      data.best.push(id);
    }
    renderAdmin(); renderHome();
  }

  function delArticle(id) {
    var a = byId(id);
    if (!a) return;
    data.articles.splice(data.articles.indexOf(a), 1);
    var bi = data.best.indexOf(id);
    if (bi > -1) data.best.splice(bi, 1);
    pendingDel = null;
    renderAdmin(); renderNav(); renderHome();
    msg('「' + a.title + '」 을(를) 지웠습니다. 아직 저장 전이라 새로고침하면 되돌아옵니다. ' +
        '확정하려면 위의 [저장하고 발행] 을 누르세요.', 'ok');
  }

  /* ---------------- images ---------------- */
  function fileToImage(file, cb, onErr) {
    if (!file || !/^image\//.test(file.type)) {
      if (onErr) onErr('이미지 파일만 넣을 수 있습니다.');
      return;
    }
    var fr = new FileReader();
    fr.onload = function () {
      var img = new Image();
      img.onload = function () {
        var maxW = 1400, w = img.naturalWidth, h = img.naturalHeight;
        if (w > maxW) { h = Math.round(h * maxW / w); w = maxW; }
        var c = document.createElement('canvas');
        c.width = w; c.height = h;
        c.getContext('2d').drawImage(img, 0, 0, w, h);
        var out;
        try {
          var png = c.toDataURL('image/png');
          var jpg = c.toDataURL('image/jpeg', 0.85);
          out = png.length <= jpg.length ? png : jpg;
        } catch (e) { out = fr.result; }
        if (out.length > fr.result.length) out = fr.result;
        cb(out, Math.round(out.length * 0.75 / 1024));
      };
      img.onerror = function () { if (onErr) onErr('이미지를 읽을 수 없습니다.'); };
      img.src = fr.result;
    };
    fr.readAsDataURL(file);
  }

  /* ---------------- inline color / size ---------------- */
  var curBody = null, lastRange = null;

  document.addEventListener('selectionchange', function () {
    if (!curBody || !curBody.isConnected) return;
    var s = window.getSelection();
    if (s && s.rangeCount && curBody.contains(s.anchorNode)) {
      lastRange = s.getRangeAt(0).cloneRange();
    }
  });

  function setClass(el, prefix, cls) {
    var keep = (el.className || '').split(/\s+/).filter(function (c) {
      return c && c.indexOf(prefix) !== 0;
    });
    if (cls !== 'none') keep.push(cls);
    el.className = keep.join(' ');
    if (!el.className) el.removeAttribute('class');
    // imported content carries inline colours that would beat our classes
    if (el.style) {
      if (prefix === 'b-') el.style.removeProperty('background-color');
      if (prefix === 'c-') el.style.removeProperty('color');
      if (prefix === 's-') el.style.removeProperty('font-size');
      if (!el.getAttribute('style')) el.removeAttribute('style');
    }
  }

  // strip this kind of styling from everything inside, so re-applying replaces
  // the previous choice instead of wrapping another layer around it
  function cleanInside(root, prefix) {
    var els = root.querySelectorAll('*');
    for (var i = 0; i < els.length; i++) {
      var el = els[i];
      if (!el.parentNode) continue;
      setClass(el, prefix, 'none');
      if (el.tagName === 'SPAN' && el.attributes.length === 0) {
        while (el.firstChild) el.parentNode.insertBefore(el.firstChild, el);
        el.parentNode.removeChild(el);
      }
    }
  }

  function applyStyle(prefix, cls) {
    if (!lastRange || lastRange.collapsed) return false;
    var sel = window.getSelection();
    sel.removeAllRanges();
    sel.addRange(lastRange);
    var range = sel.getRangeAt(0);

    var holder = document.createElement('div');
    holder.appendChild(range.extractContents());
    cleanInside(holder, prefix);

    var blocks = holder.querySelectorAll('p,h2,h3,h4,li,blockquote');
    var anchor = null, out, i;
    if (blocks.length) {
      for (i = 0; i < blocks.length; i++) setClass(blocks[i], prefix, cls);
      out = document.createDocumentFragment();
      while (holder.firstChild) out.appendChild(holder.firstChild);
      anchor = out.lastChild;
      range.insertNode(out);
    } else if (cls === 'none') {
      out = document.createDocumentFragment();
      while (holder.firstChild) out.appendChild(holder.firstChild);
      anchor = out.lastChild;
      range.insertNode(out);
    } else {
      var span = document.createElement('span');
      while (holder.firstChild) span.appendChild(holder.firstChild);
      setClass(span, prefix, cls);
      range.insertNode(span);
      anchor = span;
    }

    if (anchor) {
      try {
        var r = document.createRange();
        r.selectNodeContents(anchor);
        sel.removeAllRanges();
        sel.addRange(r);
        lastRange = r.cloneRange();
      } catch (e) {}
    }
    curBody.focus();
    return true;
  }

  function insertImage(dataUrl, body, ta, htmlMode) {
    var tag = '<figure><img src="' + dataUrl + '" alt=""></figure><p></p>';
    if (htmlMode) { ta.value += '\n' + tag; return; }
    body.focus();
    if (!document.execCommand('insertHTML', false, tag)) body.innerHTML += tag;
  }

  /* ---------------- editor ---------------- */
  function openEditor(id) {
    var a = id ? byId(id) : null;
    var isNew = !a;
    var opts = data.cats.map(function (c) {
      return '<option value="' + esc(c) + '"' + (a && a.cat === c ? ' selected' : '') + '>' + esc(c) + '</option>';
    }).join('');

    $('admin').innerHTML =
      '<div class="adm-head"><div><h1 class="adm-h">' + (isNew ? '새 문의 추가' : '문의 수정') + '</h1>' +
      '<p class="adm-sub">' + (isNew ? '카테고리를 고르고 제목과 본문을 작성하세요.' : esc(a.cat)) + '</p></div>' +
      '<div class="adm-actions"><button class="btn" id="edCancel" type="button">취소</button></div></div>' +

      '<div class="ed-field"><label class="ed-label" for="edCat">카테고리</label>' +
      '<select class="ed-sel" id="edCat">' + opts + '</select></div>' +

      '<div class="ed-2">' +
      '<div class="ed-field"><label class="ed-label" for="edEmoji">이모지</label>' +
      '<input class="ed-in" id="edEmoji" maxlength="8" value="' + esc(a ? a.emoji : '📄') + '"></div>' +
      '<div class="ed-field"><label class="ed-label" for="edTitle">제목</label>' +
      '<input class="ed-in" id="edTitle" value="' + esc(a ? a.title : '') + '" placeholder="예: 구독 해지나 환불은 어떻게 하나요?"></div>' +
      '</div>' +

      '<div class="ed-field"><label class="ed-label">본문</label>' +
      '<div class="ed-bar">' +
      '<button type="button" data-cmd="bold"><b>굵게</b></button>' +
      '<button type="button" data-cmd="h2">제목</button>' +
      '<button type="button" data-cmd="h3">소제목</button>' +
      '<button type="button" data-cmd="p">본문</button>' +
      '<button type="button" data-cmd="ul">목록</button>' +
      '<button type="button" data-cmd="link">링크</button>' +
      '<button type="button" data-cmd="hr">구분선</button>' +
      '<button type="button" data-cmd="img" class="is-img">🖼 이미지 넣기</button>' +
      '<select class="ed-mini" id="edColor" title="글자 색">' +
      '<option value="" selected>색상</option>' +
      '<option value="none">기본색</option>' +
      '<option value="c-accent">초록</option>' +
      '<option value="c-red">빨강</option>' +
      '<option value="c-blue">파랑</option>' +
      '<option value="c-amber">주황</option>' +
      '<option value="c-muted">회색</option>' +
      '</select>' +
      '<select class="ed-mini" id="edBg" title="글자 배경색">' +
      '<option value="" selected>배경</option>' +
      '<option value="none">없음</option>' +
      '<option value="b-grey">회색</option>' +
      '<option value="b-green">초록</option>' +
      '<option value="b-yellow">노랑</option>' +
      '<option value="b-blue">파랑</option>' +
      '<option value="b-red">빨강</option>' +
      '</select>' +
      '<select class="ed-mini" id="edSize" title="글자 크기">' +
      '<option value="" selected>크기</option>' +
      '<option value="none">보통</option>' +
      '<option value="s-sm">작게</option>' +
      '<option value="s-lg">크게</option>' +
      '<option value="s-xl">더 크게</option>' +
      '</select>' +
      '<button type="button" data-cmd="clear">서식 지우기</button>' +
      '<button type="button" data-cmd="html" id="edHtmlBtn">HTML 편집</button>' +
      '</div>' +
      '<div class="ed-link" id="edLink" hidden>' +
      '<input class="ed-in" id="edLinkUrl" placeholder="https://..." autocomplete="off">' +
      '<button class="btn btn-sm btn-primary" id="edLinkOk" type="button">적용</button>' +
      '<button class="btn btn-sm" id="edLinkNo" type="button">취소</button>' +
      '</div>' +
      '<div class="ed-body doc-body" id="edBody" contenteditable="true"></div>' +
      '<textarea class="ed-ta" id="edHtml" hidden spellcheck="false"></textarea>' +
      '<p class="ed-hint">이미지는 <b>🖼 이미지 넣기</b> 버튼으로 넣거나, 캡처한 화면을 본문에 <b>바로 붙여넣기(Ctrl+V)</b> 하면 됩니다. ' +
      '가로 1400px로 자동 축소돼 문서에 함께 저장됩니다.</p></div>' +

      '<div class="ed-foot">' +
      '<button class="btn btn-primary" id="edSave" type="button">저장하고 발행</button>' +
      '<button class="btn" id="edBack" type="button">목록으로</button>' +
      '<span class="ed-spacer"></span>' +
      (isNew ? '' : '<button class="btn btn-danger" id="edDel" type="button">이 문의 삭제</button>') +
      '<span class="ed-status" id="edStatus"></span></div>';

    var body = $('edBody'), ta = $('edHtml'), htmlMode = false, st = $('edStatus');
    body.innerHTML = a ? stripScripts(a.html) : '<p></p>';
    curBody = body;
    lastRange = null;

    function pick(sel, prefix) {
      sel.addEventListener('change', function () {
        var cls = sel.value;
        sel.selectedIndex = 0;
        if (!cls || htmlMode) return;
        if (!applyStyle(prefix, cls)) {
          st.className = 'ed-status err';
          st.textContent = '먼저 바꿀 글자를 드래그해서 선택해 주세요.';
        } else {
          st.className = 'ed-status';
          st.textContent = '';
        }
      });
    }
    pick($('edColor'), 'c-');
    pick($('edBg'), 'b-');
    pick($('edSize'), 's-');

    body.addEventListener('paste', function (ev) {
      var items = (ev.clipboardData || {}).items || [];
      for (var i = 0; i < items.length; i++) {
        if (items[i].type && items[i].type.indexOf('image/') === 0) {
          ev.preventDefault();
          fileToImage(items[i].getAsFile(), function (url, kb) {
            insertImage(url, body, ta, false);
            st.className = 'ed-status ok';
            st.textContent = '이미지를 넣었습니다 (약 ' + kb + 'KB).';
          }, function (m) {
            st.className = 'ed-status err';
            st.textContent = m;
          });
          return;
        }
      }
    });

    // Clicking the toolbar must not steal the selection the operator just made.
    var bar = $('admin').querySelector('.ed-bar');
    bar.addEventListener('mousedown', function (ev) {
      var s = window.getSelection();
      if (s && s.rangeCount && !s.isCollapsed && body.contains(s.anchorNode)) {
        lastRange = s.getRangeAt(0).cloneRange();
      }
      // buttons: keep focus in the editor entirely. selects must stay clickable.
      if (ev.target.closest('button')) ev.preventDefault();
    });

    function ensureSel() {
      var s = window.getSelection();
      if (!(s && s.rangeCount && body.contains(s.anchorNode)) && lastRange) {
        s.removeAllRanges();
        s.addRange(lastRange);
      }
      body.focus();
    }

    var BLOCKS = { P: 1, H1: 1, H2: 1, H3: 1, H4: 1, H5: 1, H6: 1, BLOCKQUOTE: 1, DIV: 1 };
    function setBlock(tag) {
      ensureSel();
      var s = window.getSelection();
      if (!s.rangeCount) return;
      var node = s.getRangeAt(0).commonAncestorContainer;
      if (node.nodeType === 3) node = node.parentNode;
      var el = node;
      while (el && el !== body && !BLOCKS[el.tagName]) el = el.parentNode;
      if (!el || el === body) { document.execCommand('formatBlock', false, tag); return; }
      if (el.tagName === tag.toUpperCase()) return;
      var nw = document.createElement(tag);
      nw.innerHTML = el.innerHTML;
      if (el.id) nw.id = el.id;
      el.parentNode.replaceChild(nw, el);
      var r = document.createRange();
      r.selectNodeContents(nw);
      s.removeAllRanges();
      s.addRange(r);
      lastRange = r.cloneRange();
      body.focus();
    }

    bar.addEventListener('click', function (ev) {
      var b = ev.target.closest('button[data-cmd]');
      if (!b) return;
      var c = b.dataset.cmd;
      if (c === 'html') {
        htmlMode = !htmlMode;
        if (htmlMode) { ta.value = body.innerHTML; ta.hidden = false; body.hidden = true; $('edHtmlBtn').textContent = '서식 편집'; }
        else { body.innerHTML = stripScripts(ta.value); ta.hidden = true; body.hidden = false; $('edHtmlBtn').textContent = 'HTML 편집'; }
        return;
      }
      if (c === 'img') {
        var inp = document.createElement('input');
        inp.type = 'file'; inp.accept = 'image/*';
        inp.addEventListener('change', function () {
          fileToImage(inp.files[0], function (url, kb) {
            insertImage(url, body, ta, htmlMode);
            st.className = 'ed-status ok';
            st.textContent = '이미지를 넣었습니다 (약 ' + kb + 'KB).';
          }, function (m) {
            st.className = 'ed-status err';
            st.textContent = m;
          });
        });
        inp.click();
        return;
      }
      if (htmlMode) return;
      ensureSel();
      if (c === 'bold') document.execCommand('bold');
      else if (c === 'h2') setBlock('h2');
      else if (c === 'h3') setBlock('h3');
      else if (c === 'p') setBlock('p');
      else if (c === 'ul') document.execCommand('insertUnorderedList');
      else if (c === 'hr') document.execCommand('insertHorizontalRule');
      else if (c === 'clear') {
        document.execCommand('removeFormat');
        applyStyle('c-', 'none');
        applyStyle('b-', 'none');
        applyStyle('s-', 'none');
      }
      else if (c === 'link') {
        if (!lastRange || lastRange.collapsed) {
          st.className = 'ed-status err';
          st.textContent = '먼저 링크를 걸 글자를 드래그해서 선택해 주세요.';
          return;
        }
        $('edLink').hidden = false;
        $('edLinkUrl').value = '';
        $('edLinkUrl').focus();
      }
    });

    $('edLinkNo').addEventListener('click', function () { $('edLink').hidden = true; });
    $('edLinkOk').addEventListener('click', function () {
      var u = $('edLinkUrl').value.trim();
      $('edLink').hidden = true;
      if (!u) return;
      if (!/^[a-z][a-z0-9+.-]*:/i.test(u) && u.charAt(0) !== '#') u = 'https://' + u;
      ensureSel();
      document.execCommand('createLink', false, u);
      st.className = 'ed-status ok';
      st.textContent = '링크를 걸었습니다.';
    });

    $('edCancel').addEventListener('click', function () { renderAdmin(); });
    $('edBack').addEventListener('click', function () { renderAdmin(); });
    if (!isNew) {
      $('edDel').addEventListener('click', function () {
        pendingDel = a.id;   // confirm on the list, where the row shows what will go
        renderAdmin();
      });
    }

    $('edSave').addEventListener('click', function () {
      var title = $('edTitle').value.trim();
      if (!title) { st.className = 'ed-status err'; st.textContent = '제목을 입력해 주세요.'; return; }
      var html = htmlMode ? stripScripts(ta.value) : body.innerHTML;
      var target = a;
      if (isNew) {
        target = { id: 'a' + Date.now().toString(36), cat: '', emoji: '', title: '', summary: '', html: '' };
        data.articles.push(target);
      }
      var newCat = $('edCat').value;
      if (target.cat !== newCat) {
        data.articles.splice(data.articles.indexOf(target), 1);
        var last = -1;
        data.articles.forEach(function (x, i) { if (x.cat === newCat) last = i; });
        data.articles.splice(last + 1, 0, target);
      }
      target.cat = newCat;
      target.emoji = $('edEmoji').value.trim();
      target.title = title;
      target.html = html;
      target.summary = textOf(html).slice(0, 120);
      renderNav(); renderHome();
      publish(function (t, k) {
        st.className = 'ed-status' + (k ? ' ' + k : '');
        st.textContent = t;
      }, 'edSave');
    });
  }

  /* ---------------- publish ---------------- */
  function buildDoc() {
    var style = $('app-style').textContent;
    var shell = $('app-shell').textContent;
    var app = $('app-js').textContent;
    var json = JSON.stringify(data).replace(/</g, '\\u003c');
    return '<!doctype html>\n<html lang="ko">\n<head>\n<meta charset="utf-8">\n' +
      '<meta name="viewport" content="width=device-width,initial-scale=1">\n' +
      '<title>' + TITLE + '</title>\n' +
      '<style id="app-style">' + style + '</style>\n</head>\n<body>\n' +
      shell + '\n' +
      '<script id="app-shell" type="text/plain">' + shell + CLOSE + '\n' +
      '<script id="faq-data" type="application/json">' + json + CLOSE + '\n' +
      '<script id="app-js">' + app + CLOSE + '\n</body>\n</html>';
  }

  // `say(text, kind)` reports progress wherever the caller wants it
  function publish(say, btnId) {
    var btn = btnId ? $(btnId) : null;
    if (!artifactCap) return say('이 화면에서는 저장할 수 없습니다.', 'err');
    var doc;
    try { doc = buildDoc(); }
    catch (e) { return say('문서를 만드는 중 오류가 발생했습니다.', 'err'); }
    if (doc.length > MAX_DOC) {
      return say('문서가 너무 큽니다 (' + mb(doc.length) + ' / 상한 16MB). 이미지를 줄여 주세요.', 'err');
    }
    say('저장하는 중… (' + mb(doc.length) + ' 발행)');
    if (btn) btn.disabled = true;
    artifactCap.publish(doc).then(function () {
      say('저장 완료 — 새 버전이 발행되었습니다.', 'ok');
    }).catch(function (e) {
      var code = e && e.code;
      if (btn) btn.disabled = false;
      if (code === 'not_writer' || code === 'not_granted') {
        say('편집 권한이 없는 계정입니다. 이 페이지의 편집 권한을 받은 뒤 다시 시도해 주세요.', 'err');
      } else if (code === 'conflict') {
        say('다른 사람이 먼저 저장했습니다. 화면이 최신 버전으로 바뀌면 다시 수정해 주세요.', 'err');
      } else {
        say('저장에 실패했습니다. 잠시 후 다시 시도해 주세요.', 'err');
      }
    });
  }

  /* ---------------- boot ---------------- */
  renderNav();
  renderHome();
  route();
  addEventListener('hashchange', route);

  $('admHome').addEventListener('click', goAdmin);
  $('admOff').addEventListener('click', exitAdmin);

  // hidden entry: tap the "자주 물어보는 질문 BEST" heading 7 times in quick succession
  var taps = 0, tapTimer = null;
  $('home').addEventListener('click', function (ev) {
    if (!ev.target.closest('.best-head h2')) return;
    taps++;
    clearTimeout(tapTimer);
    tapTimer = setTimeout(function () { taps = 0; }, 1200);
    if (taps >= 7) {
      taps = 0;
      clearTimeout(tapTimer);
      goAdmin();
    }
  });

  if (window.claude && claude.use) {
    claude.use('artifact').then(function (cap) {
      if (!cap) return;
      artifactCap = cap;
      capReady = true;
      if (location.hash.slice(1) === 'admin') route();
    }).catch(function () {});

    claude.use('downloads').then(function (cap) {
      if (!cap) return;
      downloadsCap = cap;
      // the admin list may already be on screen — re-render so the button appears
      if (adminMode && location.hash.slice(1) === 'admin') renderAdmin();
    }).catch(function () {});
  }
})();

(function () {
  'use strict';

  var GITHUB_USER = 'surane-g';
  // Optional: paste a Formspree endpoint (https://formspree.io) to send messages without opening an email app.
  var FORM_ENDPOINT = '';

  var root = document.documentElement;
  document.getElementById('year').textContent = new Date().getFullYear();

  /* ---- Theme toggle ---- */
  document.getElementById('themeBtn').addEventListener('click', function () {
    var current = root.getAttribute('data-theme') ||
      (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    var next = current === 'dark' ? 'light' : 'dark';
    root.setAttribute('data-theme', next);
    try { localStorage.setItem('theme', next); } catch (e) {}
  });

  /* ---- Mobile menu ---- */
  var menuBtn = document.getElementById('menuBtn');
  var navLinks = document.getElementById('navLinks');
  menuBtn.addEventListener('click', function () {
    var open = navLinks.classList.toggle('open');
    menuBtn.setAttribute('aria-expanded', String(open));
  });
  navLinks.addEventListener('click', function (e) {
    if (e.target.tagName === 'A') {
      navLinks.classList.remove('open');
      menuBtn.setAttribute('aria-expanded', 'false');
    }
  });

  /* ---- Highlight current section in nav ---- */
  var links = navLinks.querySelectorAll('a');
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) {
          links.forEach(function (l) {
            l.classList.toggle('current', l.getAttribute('href') === '#' + en.target.id);
          });
        }
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    document.querySelectorAll('main section[id]').forEach(function (s) { io.observe(s); });
  }

  /* ---- Project filter ---- */
  var filterBtns = document.querySelectorAll('.chip-btn');
  var projects = document.querySelectorAll('.project');
  filterBtns.forEach(function (btn) {
    btn.addEventListener('click', function () {
      var f = btn.dataset.filter;
      filterBtns.forEach(function (b) {
        var on = b === btn;
        b.classList.toggle('active', on);
        b.setAttribute('aria-pressed', String(on));
      });
      projects.forEach(function (p) {
        p.hidden = !(f === 'all' || p.dataset.type.split(' ').indexOf(f) !== -1);
      });
    });
  });

  /* ---- Live GitHub repositories ---- */
  var status = document.getElementById('ghStatus');
  var list = document.getElementById('repos');
  fetch('https://api.github.com/users/' + GITHUB_USER + '/repos?sort=updated&per_page=30')
    .then(function (r) { if (!r.ok) throw new Error(r.status); return r.json(); })
    .then(function (repos) {
      repos = repos.filter(function (r) { return !r.fork; }).slice(0, 6);
      if (!repos.length) { status.textContent = 'No public repositories yet. Check back soon.'; return; }
      status.hidden = true;
      repos.forEach(function (r) {
        var li = document.createElement('li');
        var a = document.createElement('a');
        a.href = r.html_url; a.target = '_blank'; a.rel = 'noopener';
        var h = document.createElement('h3'); h.textContent = r.name;
        var p = document.createElement('p'); p.textContent = r.description || 'No description yet.';
        var m = document.createElement('div'); m.className = 'meta';
        var parts = [];
        if (r.language) parts.push(r.language);
        parts.push('★ ' + r.stargazers_count);
        parts.push('Updated ' + new Date(r.pushed_at).toLocaleDateString(undefined, { month: 'short', year: 'numeric' }));
        m.textContent = parts.join('   ');
        a.append(h, p, m); li.appendChild(a); list.appendChild(li);
      });
    })
    .catch(function () {
      status.innerHTML = 'Could not load repositories right now. See them on <a href="https://github.com/' + GITHUB_USER + '" target="_blank" rel="noopener">github.com/' + GITHUB_USER + '</a>.';
    });

  /* ---- Contact form ---- */
  var form = document.getElementById('contactForm');
  var note = document.getElementById('formNote');
  function setErr(name, msg) { form.querySelector('[data-for="' + name + '"]').textContent = msg; }

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var d = { name: form.name.value.trim(), email: form.email.value.trim(), message: form.message.value.trim() };
    var ok = true;
    setErr('name', ''); setErr('email', ''); setErr('message', '');
    if (!d.name) { setErr('name', 'Enter your name.'); ok = false; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(d.email)) { setErr('email', 'Enter a valid email address.'); ok = false; }
    if (d.message.length < 10) { setErr('message', 'Write a message of at least 10 characters.'); ok = false; }
    if (!ok) return;

    if (FORM_ENDPOINT) {
      note.textContent = 'Sending…';
      fetch(FORM_ENDPOINT, { method: 'POST', headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' }, body: JSON.stringify(d) })
        .then(function (r) { if (!r.ok) throw new Error(); form.reset(); note.textContent = 'Message sent. Thank you!'; })
        .catch(function () { note.textContent = 'Could not send. Email me directly at surane081103@gmail.com.'; });
    } else {
      var subject = encodeURIComponent('Portfolio message from ' + d.name);
      var body = encodeURIComponent(d.message + '\n\n' + d.name + '\n' + d.email);
      window.location.href = 'mailto:surane081103@gmail.com?subject=' + subject + '&body=' + body;
      note.textContent = 'Opening your email app with the message ready to send.';
    }
  });
})();

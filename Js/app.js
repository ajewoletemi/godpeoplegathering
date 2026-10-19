/* GOD PEOPLE GATHERING — app.js
   Offline-capable Bible reading, study, quiz + revival notes
*/

(function () {
  'use strict';

  // ========== THEME ==========
  function initTheme() {
    const btn = document.getElementById('theme-toggle');
    if (!btn) return;
    const root = document.documentElement;
    const saved = localStorage.getItem('gpg_theme') || 'light';
    root.setAttribute('data-theme', saved);
    btn.textContent = saved === 'dark' ? '☀️' : '🌙';
    btn.addEventListener('click', () => {
      const next = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
      root.setAttribute('data-theme', next);
      localStorage.setItem('gpg_theme', next);
      btn.textContent = next === 'dark' ? '☀️' : '🌙';
    });
  }

  // ========== AUTH UI (simple guest/auth hide) ==========
  function initAuthUI() {
    const user = localStorage.getItem('gpg_user');
    document.querySelectorAll('[data-auth]').forEach(el => {
      el.classList.toggle('hidden', !user);
    });
    document.querySelectorAll('[data-guest]').forEach(el => {
      el.classList.toggle('hidden', !!user);
    });
  }
  window.logout = function () {
    localStorage.removeItem('gpg_user');
    location.href = 'index.html';
  };

  // ========== TABS ==========
  function initTabs() {
    document.querySelectorAll('.tab-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
        document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
        btn.classList.add('active');
        const tab = document.getElementById(btn.dataset.tab);
        if (tab) tab.classList.add('active');
      });
    });
  }

  // ========== BIBLE DATA (World English Bible via bible-api.com + offline cache) ==========
  const BOOKS = [
    { name: 'Genesis', chapters: 50 }, { name: 'Exodus', chapters: 40 },
    { name: 'Leviticus', chapters: 27 }, { name: 'Numbers', chapters: 36 },
    { name: 'Deuteronomy', chapters: 34 }, { name: 'Joshua', chapters: 24 },
    { name: 'Judges', chapters: 21 }, { name: 'Ruth', chapters: 4 },
    { name: '1 Samuel', chapters: 31 }, { name: '2 Samuel', chapters: 24 },
    { name: '1 Kings', chapters: 22 }, { name: '2 Kings', chapters: 25 },
    { name: '1 Chronicles', chapters: 29 }, { name: '2 Chronicles', chapters: 36 },
    { name: 'Ezra', chapters: 10 }, { name: 'Nehemiah', chapters: 13 },
    { name: 'Esther', chapters: 10 }, { name: 'Job', chapters: 42 },
    { name: 'Psalms', chapters: 150 }, { name: 'Proverbs', chapters: 31 },
    { name: 'Ecclesiastes', chapters: 12 }, { name: 'Song of Solomon', chapters: 8 },
    { name: 'Isaiah', chapters: 66 }, { name: 'Jeremiah', chapters: 52 },
    { name: 'Lamentations', chapters: 5 }, { name: 'Ezekiel', chapters: 48 },
    { name: 'Daniel', chapters: 12 }, { name: 'Hosea', chapters: 14 },
    { name: 'Joel', chapters: 3 }, { name: 'Amos', chapters: 9 },
    { name: 'Obadiah', chapters: 1 }, { name: 'Jonah', chapters: 4 },
    { name: 'Micah', chapters: 7 }, { name: 'Nahum', chapters: 3 },
    { name: 'Habakkuk', chapters: 3 }, { name: 'Zephaniah', chapters: 3 },
    { name: 'Haggai', chapters: 2 }, { name: 'Zechariah', chapters: 14 },
    { name: 'Malachi', chapters: 4 },
    { name: 'Matthew', chapters: 28 }, { name: 'Mark', chapters: 16 },
    { name: 'Luke', chapters: 24 }, { name: 'John', chapters: 21 },
    { name: 'Acts', chapters: 28 }, { name: 'Romans', chapters: 16 },
    { name: '1 Corinthians', chapters: 16 }, { name: '2 Corinthians', chapters: 13 },
    { name: 'Galatians', chapters: 6 }, { name: 'Ephesians', chapters: 6 },
    { name: 'Philippians', chapters: 4 }, { name: 'Colossians', chapters: 4 },
    { name: '1 Thessalonians', chapters: 5 }, { name: '2 Thessalonians', chapters: 3 },
    { name: '1 Timothy', chapters: 6 }, { name: '2 Timothy', chapters: 4 },
    { name: 'Titus', chapters: 3 }, { name: 'Philemon', chapters: 1 },
    { name: 'Hebrews', chapters: 13 }, { name: 'James', chapters: 5 },
    { name: '1 Peter', chapters: 5 }, { name: '2 Peter', chapters: 3 },
    { name: '1 John', chapters: 5 }, { name: '2 John', chapters: 1 },
    { name: '3 John', chapters: 1 }, { name: 'Jude', chapters: 1 },
    { name: 'Revelation', chapters: 22 }
  ];

  const CACHE_KEY = 'gpg_bible_cache';
  const OFFLINE_KEY = 'gpg_offline_enabled';

  function getCache() {
    try { return JSON.parse(localStorage.getItem(CACHE_KEY) || '{}'); }
    catch { return {}; }
  }
  function setCache(obj) {
    try { localStorage.setItem(CACHE_KEY, JSON.stringify(obj)); } catch (e) { console.warn('Cache full', e); }
  }

  function isOfflineEnabled() {
    return localStorage.getItem(OFFLINE_KEY) === '1';
  }

  function initBibleReader() {
    const bookSelect = document.getElementById('book-select');
    const chapterSelect = document.getElementById('chapter-select');
    const loadBtn = document.getElementById('load-chapter-btn');
    const textEl = document.getElementById('bible-text');
    if (!bookSelect || !chapterSelect || !loadBtn || !textEl) return;

    // Populate books
    bookSelect.innerHTML = BOOKS.map((b, i) =>
      `<option value="${i}">${b.name}</option>`
    ).join('');

    function fillChapters() {
      const idx = parseInt(bookSelect.value, 10) || 0;
      const ch = BOOKS[idx].chapters;
      chapterSelect.innerHTML = Array.from({ length: ch }, (_, i) =>
        `<option value="${i + 1}">${i + 1}</option>`
      ).join('');
    }
    fillChapters();
    bookSelect.addEventListener('change', fillChapters);

    async function loadChapter() {
      const idx = parseInt(bookSelect.value, 10) || 0;
      const book = BOOKS[idx].name;
      const chapter = chapterSelect.value;
      const key = `${book}|${chapter}`;
      textEl.innerHTML = '<p style="text-align:center;color:var(--text-muted);">Loading…</p>';

      const cache = getCache();
      if (cache[key]) {
        renderChapter(book, chapter, cache[key]);
        return;
      }

      // Try network
      try {
        const res = await fetch(`https://bible-api.com/${encodeURIComponent(book)}+${chapter}?translation=web`);
        if (!res.ok) throw new Error('Network error');
        const data = await res.json();
        const verses = (data.verses || []).map(v => ({ num: v.verse, text: v.text.trim() }));
        cache[key] = verses;
        setCache(cache);
        renderChapter(book, chapter, verses);
      } catch (err) {
        if (cache[key]) {
          renderChapter(book, chapter, cache[key]);
        } else {
          textEl.innerHTML = `
            <p style="text-align:center;color:var(--error);">
              Unable to load chapter. ${navigator.onLine ? 'API error.' : 'You are offline and this chapter is not cached yet.'}<br>
              Enable Offline Mode and read some chapters while online so they become available offline.
            </p>`;
        }
      }
    }

    function renderChapter(book, chapter, verses) {
      textEl.innerHTML = `
        <h3 style="margin-bottom:1rem;color:var(--primary);">${book} ${chapter}</h3>
        ${verses.map(v => `
          <p class="verse"><span class="verse-num">${v.num}</span> ${v.text}</p>
        `).join('')}`;
    }

    loadBtn.addEventListener('click', loadChapter);

    // Offline button
    const offlineBtn = document.getElementById('offline-btn');
    const offlineStatus = document.getElementById('offline-status');
    if (offlineBtn) {
      function updateOfflineUI() {
        const on = isOfflineEnabled();
        offlineBtn.textContent = on ? 'Offline Mode: ON' : 'Enable Offline Mode';
        offlineBtn.style.background = on ? 'var(--success)' : '';
        if (offlineStatus) {
          const cache = getCache();
          const count = Object.keys(cache).length;
          offlineStatus.textContent = on
            ? `${count} chapter(s) cached — works offline`
            : (count ? `${count} chapter(s) already cached` : 'Turn on to keep chapters you read');
        }
      }
      updateOfflineUI();
      offlineBtn.addEventListener('click', () => {
        const next = !isOfflineEnabled();
        localStorage.setItem(OFFLINE_KEY, next ? '1' : '0');
        updateOfflineUI();
        if (next) {
          alert('Offline Mode enabled. Chapters you read while online will be saved and available without internet.');
        }
      });
    }
  }

  // ========== BIBLE STUDY (local, always offline) ==========
  const STUDY_WEEKS = [
    {
      title: 'Week 1 — Creation & Covenant',
      days: [
        { day: 'Day 1', ref: 'Genesis 1–2', focus: 'God creates and rests. Humanity made in His image.' },
        { day: 'Day 2', ref: 'Genesis 3', focus: 'The fall and the first promise of a Redeemer.' },
        { day: 'Day 3', ref: 'Genesis 6–9', focus: 'Noah and the covenant of the rainbow.' },
        { day: 'Day 4', ref: 'Genesis 12 & 15', focus: 'Abraham called; the covenant of promise.' },
        { day: 'Day 5', ref: 'Genesis 22', focus: 'Abraham and Isaac — God provides the lamb.' },
        { day: 'Day 6', ref: 'Exodus 12', focus: 'The Passover — blood that saves.' },
        { day: 'Day 7', ref: 'Review', focus: 'Reflect: How has God kept covenant with you?' }
      ]
    },
    {
      title: 'Week 2 — The Word Became Flesh',
      days: [
        { day: 'Day 1', ref: 'John 1:1–18', focus: 'The Word was God and became flesh.' },
        { day: 'Day 2', ref: 'Luke 1–2', focus: 'Birth of John and Jesus; joy of the humble.' },
        { day: 'Day 3', ref: 'Matthew 3–4', focus: 'Baptism and temptation of Jesus.' },
        { day: 'Day 4', ref: 'John 3', focus: 'You must be born again; John 3:16.' },
        { day: 'Day 5', ref: 'John 14–16', focus: 'The Holy Spirit promised as Helper.' },
        { day: 'Day 6', ref: 'Acts 1–2', focus: 'The Spirit poured out at Pentecost.' },
        { day: 'Day 7', ref: 'Review', focus: 'Have you received the promise of the Father?' }
      ]
    },
    {
      title: 'Week 3 — Walking in the Spirit',
      days: [
        { day: 'Day 1', ref: 'Acts 8–10', focus: 'The Spirit falls on Samaritans and Gentiles.' },
        { day: 'Day 2', ref: '1 Corinthians 12–14', focus: 'Gifts of the Spirit for the body.' },
        { day: 'Day 3', ref: 'Galatians 5', focus: 'Fruit of the Spirit vs works of the flesh.' },
        { day: 'Day 4', ref: 'Ephesians 1–2', focus: 'Sealed with the Spirit; saved by grace.' },
        { day: 'Day 5', ref: 'Romans 8', focus: 'Life in the Spirit; no condemnation.' },
        { day: 'Day 6', ref: 'Joel 2 & Acts 2', focus: 'The last-days outpouring.' },
        { day: 'Day 7', ref: 'Review', focus: 'Ask the Father for the Holy Spirit (Luke 11:13).' }
      ]
    },
    {
      title: 'Week 4 — Power to Witness',
      days: [
        { day: 'Day 1', ref: 'Acts 1:8 & 4', focus: 'Power to be witnesses; boldness after prayer.' },
        { day: 'Day 2', ref: 'Mark 16:15–20', focus: 'Signs that follow those who believe.' },
        { day: 'Day 3', ref: '1 Corinthians 2', focus: 'Demonstration of the Spirit and of power.' },
        { day: 'Day 4', ref: '2 Timothy 1', focus: 'Fan into flame the gift of God.' },
        { day: 'Day 5', ref: 'Jude & 2 Peter 1', focus: 'Keep yourselves in the love of God.' },
        { day: 'Day 6', ref: 'Revelation 2–3', focus: 'What the Spirit says to the churches.' },
        { day: 'Day 7', ref: 'Review', focus: 'Where is God sending you as a witness this week?' }
      ]
    }
  ];

  function initBibleStudy() {
    const grid = document.getElementById('study-grid');
    if (!grid) return;

    // Rotate week by week of year
    const weekIndex = Math.floor((new Date().getTime() / 86400000) / 7) % STUDY_WEEKS.length;
    const week = STUDY_WEEKS[weekIndex];

    grid.innerHTML = `
      <div class="card" style="grid-column:1/-1; margin-bottom:1rem;">
        <h3 style="color:var(--primary);">${week.title}</h3>
        <p style="color:var(--text-muted); font-size:0.9rem;">This week’s rotational study (works fully offline).</p>
      </div>
      ${week.days.map(d => `
        <div class="card">
          <div class="card-header">
            <div class="card-icon">📖</div>
            <h3>${d.day}</h3>
          </div>
          <p style="font-weight:600; color:var(--primary); margin-bottom:0.4rem;">${d.ref}</p>
          <p style="color:var(--text-muted); font-size:0.95rem;">${d.focus}</p>
        </div>
      `).join('')}`;
  }

  // ========== BIBLE QUIZ (local, always offline) ==========
  const QUIZ_BANK = [
    { q: 'Who was the first man created by God?', a: 'Adam', options: ['Noah', 'Adam', 'Abraham', 'Moses'] },
    { q: 'How many days did God take to create the world (before resting)?', a: '6', options: ['5', '6', '7', '3'] },
    { q: 'Who built the ark?', a: 'Noah', options: ['Moses', 'Noah', 'David', 'Solomon'] },
    { q: 'What was the sign of God’s covenant with Noah?', a: 'Rainbow', options: ['Rainbow', 'Star', 'Dove', 'Fire'] },
    { q: 'To which land did God call Abraham?', a: 'Canaan', options: ['Egypt', 'Babylon', 'Canaan', 'Assyria'] },
    { q: 'Who was sold into Egypt by his brothers?', a: 'Joseph', options: ['Benjamin', 'Joseph', 'Judah', 'Reuben'] },
    { q: 'Who led Israel out of Egypt?', a: 'Moses', options: ['Joshua', 'Aaron', 'Moses', 'Caleb'] },
    { q: 'What did Moses receive on Mount Sinai?', a: 'The Ten Commandments', options: ['Manna', 'The Ten Commandments', 'A sword', 'Gold'] },
    { q: 'Who was the mother of Jesus?', a: 'Mary', options: ['Elizabeth', 'Mary', 'Martha', 'Ruth'] },
    { q: 'In which town was Jesus born?', a: 'Bethlehem', options: ['Nazareth', 'Jerusalem', 'Bethlehem', 'Capernaum'] },
    { q: 'Who baptized Jesus?', a: 'John the Baptist', options: ['Peter', 'John the Baptist', 'Paul', 'Andrew'] },
    { q: 'How many disciples did Jesus choose?', a: '12', options: ['7', '10', '12', '70'] },
    { q: 'What is the shortest verse in the Bible (English)?', a: 'Jesus wept.', options: ['God is love.', 'Jesus wept.', 'Pray always.', 'Rejoice always.'] },
    { q: 'Who denied Jesus three times?', a: 'Peter', options: ['Judas', 'Thomas', 'Peter', 'John'] },
    { q: 'On which day did the Holy Spirit come at Pentecost?', a: 'The day of Pentecost', options: ['Passover', 'The day of Pentecost', 'Tabernacles', 'Atonement'] },
    { q: 'Who wrote most of the New Testament letters?', a: 'Paul', options: ['Peter', 'John', 'Paul', 'James'] },
    { q: 'What does “Gospel” mean?', a: 'Good news', options: ['Law', 'Good news', 'Prophecy', 'History'] },
    { q: 'According to Acts 1:8, the Holy Spirit gives power to be what?', a: 'Witnesses', options: ['Teachers', 'Witnesses', 'Kings', 'Priests'] },
    { q: 'Who asked the Father for the Holy Spirit according to Luke 11:13?', a: 'Those who ask Him', options: ['Only apostles', 'Those who ask Him', 'Only Jews', 'Angels'] },
    { q: 'What is the fruit of the Spirit listed in Galatians 5?', a: 'Love, joy, peace…', options: ['Miracles only', 'Love, joy, peace…', 'Wealth', 'Power alone'] }
  ];

  function initQuiz() {
    const container = document.getElementById('quiz-container');
    if (!container) return;

    let score = 0;
    let answered = 0;
    let currentBatch = [];

    function shuffle(arr) {
      return arr.slice().sort(() => Math.random() - 0.5);
    }

    function loadBatch() {
      currentBatch = shuffle(QUIZ_BANK).slice(0, 5);
      answered = 0;
      score = 0;
      renderBatch();
    }

    function renderBatch() {
      container.innerHTML = `
        <p style="margin-bottom:1rem; color:var(--text-muted);">Answer these 5 questions (works offline). Score: <strong id="quiz-score">0</strong>/5</p>
        ${currentBatch.map((item, i) => `
          <div class="quiz-card" data-idx="${i}">
            <p style="font-weight:600; margin-bottom:0.75rem;">${i + 1}. ${item.q}</p>
            <div class="quiz-options">
              ${shuffle(item.options).map(opt => `
                <button type="button" class="btn quiz-opt" data-answer="${opt}" style="margin:0.3rem 0.3rem 0.3rem 0; display:inline-block;">${opt}</button>
              `).join('')}
            </div>
            <p class="quiz-feedback" style="margin-top:0.5rem; font-size:0.9rem;"></p>
          </div>
        `).join('')}
        <button type="button" id="next-quiz-batch" class="btn btn-primary" style="margin-top:1rem; display:none;">Load next 5 questions</button>
      `;

      container.querySelectorAll('.quiz-card').forEach(card => {
        const idx = parseInt(card.dataset.idx, 10);
        const item = currentBatch[idx];
        const feedback = card.querySelector('.quiz-feedback');
        card.querySelectorAll('.quiz-opt').forEach(btn => {
          btn.addEventListener('click', () => {
            if (card.dataset.done) return;
            card.dataset.done = '1';
            answered++;
            const correct = btn.dataset.answer === item.a;
            if (correct) {
              score++;
              feedback.textContent = '✓ Correct!';
              feedback.style.color = 'var(--success)';
            } else {
              feedback.textContent = `✗ Correct answer: ${item.a}`;
              feedback.style.color = 'var(--error)';
            }
            document.getElementById('quiz-score').textContent = score;
            card.querySelectorAll('.quiz-opt').forEach(b => {
              b.disabled = true;
              if (b.dataset.answer === item.a) b.style.background = 'var(--success)';
            });
            if (answered === currentBatch.length) {
              document.getElementById('next-quiz-batch').style.display = 'inline-block';
            }
          });
        });
      });

      const nextBtn = document.getElementById('next-quiz-batch');
      if (nextBtn) nextBtn.addEventListener('click', loadBatch);
    }

    loadBatch();
  }

  // ========== REVIVAL NOTES (save + submit via mailto) ==========
  // Replace with your preferred email address (GitHub / personal)
  const NOTES_EMAIL = 'your-github-email@example.com';  // ← CHANGE THIS

  function initRevivalNotes() {
    // Restore saved notes
    ['notes-thu', 'notes-fri', 'notes-sat'].forEach(id => {
      const el = document.getElementById(id);
      if (!el) return;
      const saved = localStorage.getItem('gpg_' + id);
      if (saved) el.value = saved;
      el.addEventListener('input', () => {
        localStorage.setItem('gpg_' + id, el.value);
      });
    });

    document.querySelectorAll('.notes-submit').forEach(btn => {
      btn.addEventListener('click', () => {
        const day = btn.dataset.day || 'Revival note';
        const taId = btn.dataset.textarea;
        const ta = document.getElementById(taId);
        const text = (ta && ta.value.trim()) || '';
        if (!text) {
          alert('Please write something in the notes box first.');
          return;
        }
        const subject = encodeURIComponent(`GPG Revival Notes – ${day}`);
        const body = encodeURIComponent(
          `Day: ${day}\n\nMy notes & experience:\n\n${text}\n\n— Sent from GOD PEOPLE GATHERING`
        );
        // Opens the user’s email client with the note ready to send
        window.location.href = `mailto:${NOTES_EMAIL}?subject=${subject}&body=${body}`;
      });
    });
  }

  // ========== INIT ==========
  document.addEventListener('DOMContentLoaded', () => {
    initTheme();
    initAuthUI();
    initTabs();
    initBibleReader();
    initBibleStudy();
    initQuiz();
    initRevivalNotes();
  });
})();

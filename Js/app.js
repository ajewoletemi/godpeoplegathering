/* GOD PEOPLE GATHERING — Bible School + site logic
   Works with the light-theme HTML (godpeoplegathering.onrender.com)
   - Populates all 66 books
   - Loads WEB via bible-api.com + localStorage cache
   - Offline mode
   - Bible Study & Bible Quiz tabs fully functional
*/

(function () {
  'use strict';

  /* ========== AUTH (shared across pages) ========== */
  const AUTH_KEY = 'gpg_users';
  const SESSION_KEY = 'gpg_session';

  function getUsers() {
    try { return JSON.parse(localStorage.getItem(AUTH_KEY) || '[]'); } catch { return []; }
  }
  function saveUsers(users) { localStorage.setItem(AUTH_KEY, JSON.stringify(users)); }
  function getSession() {
    try { return JSON.parse(localStorage.getItem(SESSION_KEY) || 'null'); } catch { return null; }
  }
  function setSession(user) {
    if (user) localStorage.setItem(SESSION_KEY, JSON.stringify({ email: user.email, name: user.name }));
    else localStorage.removeItem(SESSION_KEY);
    updateNavAuth();
  }
  function signup(name, email, password) {
    const users = getUsers();
    if (users.find(u => u.email.toLowerCase() === email.toLowerCase()))
      return { ok: false, message: 'An account with this email already exists.' };
    if (password.length < 6) return { ok: false, message: 'Password must be at least 6 characters.' };
    users.push({ name, email, password });
    saveUsers(users);
    setSession({ name, email });
    return { ok: true, message: 'Welcome to GOD PEOPLE GATHERING!' };
  }
  function login(email, password) {
    const users = getUsers();
    const user = users.find(u => u.email.toLowerCase() === email.toLowerCase() && u.password === password);
    if (!user) return { ok: false, message: 'Invalid email or password.' };
    setSession(user);
    return { ok: true, message: 'Welcome back!' };
  }
  window.logout = function () {
    setSession(null);
    window.location.href = 'index.html';
  };
  function updateNavAuth() {
    const session = getSession();
    document.querySelectorAll('[data-auth]').forEach(el => el.classList.toggle('hidden', !session));
    document.querySelectorAll('[data-guest]').forEach(el => el.classList.toggle('hidden', !!session));
    document.querySelectorAll('[data-member-name]').forEach(el => {
      if (session) el.textContent = session.name;
    });
    const welcome = document.getElementById('member-welcome');
    if (welcome) {
      if (session) {
        welcome.classList.remove('hidden');
        welcome.textContent = 'Welcome back, ' + session.name + '!';
      } else {
        welcome.classList.add('hidden');
      }
    }
  }

  /* ========== THEME TOGGLE ========== */
  function initTheme() {
    const root = document.documentElement;
    const saved = localStorage.getItem('gpg_theme') || 'light';
    root.setAttribute('data-theme', saved);
    const btn = document.getElementById('theme-toggle') || document.querySelector('.theme-toggle');
    if (btn) {
      btn.textContent = saved === 'dark' ? '☀️' : '🌙';
      btn.addEventListener('click', function () {
        const next = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
        root.setAttribute('data-theme', next);
        localStorage.setItem('gpg_theme', next);
        btn.textContent = next === 'dark' ? '☀️' : '🌙';
      });
    }
  }

  /* ========== NAV ========== */
  function initNav() {
    const toggle = document.querySelector('.menu-toggle');
    const links = document.querySelector('.nav-links');
    if (toggle && links) {
      toggle.addEventListener('click', function () { links.classList.toggle('open'); });
      links.querySelectorAll('a').forEach(a => a.addEventListener('click', () => links.classList.remove('open')));
    }
    updateNavAuth();
  }

  /* ========== BIBLE DATA (66 books – World English Bible) ========== */
  const BOOKS = [
    { id: 'Genesis', chapters: 50 }, { id: 'Exodus', chapters: 40 }, { id: 'Leviticus', chapters: 27 },
    { id: 'Numbers', chapters: 36 }, { id: 'Deuteronomy', chapters: 34 }, { id: 'Joshua', chapters: 24 },
    { id: 'Judges', chapters: 21 }, { id: 'Ruth', chapters: 4 }, { id: '1 Samuel', chapters: 31 },
    { id: '2 Samuel', chapters: 24 }, { id: '1 Kings', chapters: 22 }, { id: '2 Kings', chapters: 25 },
    { id: '1 Chronicles', chapters: 29 }, { id: '2 Chronicles', chapters: 36 }, { id: 'Ezra', chapters: 10 },
    { id: 'Nehemiah', chapters: 13 }, { id: 'Esther', chapters: 10 }, { id: 'Job', chapters: 42 },
    { id: 'Psalms', chapters: 150 }, { id: 'Proverbs', chapters: 31 }, { id: 'Ecclesiastes', chapters: 12 },
    { id: 'Song of Solomon', chapters: 8 }, { id: 'Isaiah', chapters: 66 }, { id: 'Jeremiah', chapters: 52 },
    { id: 'Lamentations', chapters: 5 }, { id: 'Ezekiel', chapters: 48 }, { id: 'Daniel', chapters: 12 },
    { id: 'Hosea', chapters: 14 }, { id: 'Joel', chapters: 3 }, { id: 'Amos', chapters: 9 },
    { id: 'Obadiah', chapters: 1 }, { id: 'Jonah', chapters: 4 }, { id: 'Micah', chapters: 7 },
    { id: 'Nahum', chapters: 3 }, { id: 'Habakkuk', chapters: 3 }, { id: 'Zephaniah', chapters: 3 },
    { id: 'Haggai', chapters: 2 }, { id: 'Zechariah', chapters: 14 }, { id: 'Malachi', chapters: 4 },
    { id: 'Matthew', chapters: 28 }, { id: 'Mark', chapters: 16 }, { id: 'Luke', chapters: 24 },
    { id: 'John', chapters: 21 }, { id: 'Acts', chapters: 28 }, { id: 'Romans', chapters: 16 },
    { id: '1 Corinthians', chapters: 16 }, { id: '2 Corinthians', chapters: 13 }, { id: 'Galatians', chapters: 6 },
    { id: 'Ephesians', chapters: 6 }, { id: 'Philippians', chapters: 4 }, { id: 'Colossians', chapters: 4 },
    { id: '1 Thessalonians', chapters: 5 }, { id: '2 Thessalonians', chapters: 3 }, { id: '1 Timothy', chapters: 6 },
    { id: '2 Timothy', chapters: 4 }, { id: 'Titus', chapters: 3 }, { id: 'Philemon', chapters: 1 },
    { id: 'Hebrews', chapters: 13 }, { id: 'James', chapters: 5 }, { id: '1 Peter', chapters: 5 },
    { id: '2 Peter', chapters: 3 }, { id: '1 John', chapters: 5 }, { id: '2 John', chapters: 1 },
    { id: '3 John', chapters: 1 }, { id: 'Jude', chapters: 1 }, { id: 'Revelation', chapters: 22 }
  ];

  const CACHE_KEY = 'gpg_bible_cache';
  const OFFLINE_KEY = 'gpg_offline_mode';

  function getCache() {
    try { return JSON.parse(localStorage.getItem(CACHE_KEY) || '{}'); } catch { return {}; }
  }
  function saveCache(cache) {
    try { localStorage.setItem(CACHE_KEY, JSON.stringify(cache)); } catch (e) { /* quota */ }
  }
  function cacheKey(book, chapter) {
    return book + '|' + chapter;
  }

  function populateBookSelect(selectEl) {
    if (!selectEl) return;
    selectEl.innerHTML = '<option value="">Select a book...</option>' +
      BOOKS.map(b => '<option value="' + b.id + '">' + b.id + '</option>').join('');
  }

  function populateChapterSelect(bookSelect, chapterSelect) {
    if (!bookSelect || !chapterSelect) return;
    const book = BOOKS.find(b => b.id === bookSelect.value);
    if (!book) {
      chapterSelect.innerHTML = '<option value="">Select chapter...</option>';
      return;
    }
    chapterSelect.innerHTML = '<option value="">Select chapter...</option>' +
      Array.from({ length: book.chapters }, function (_, i) {
        return '<option value="' + (i + 1) + '">' + (i + 1) + '</option>';
      }).join('');
  }

  async function fetchChapterFromApi(book, chapter) {
    const url = 'https://bible-api.com/' + encodeURIComponent(book) + '+' + chapter + '?translation=web';
    const res = await fetch(url);
    if (!res.ok) throw new Error('API ' + res.status);
    const data = await res.json();
    if (data.verses && data.verses.length) {
      return data.verses.map(function (v) {
        return { verse: v.verse, text: (v.text || '').trim() };
      });
    }
    if (data.text) {
      return [{ verse: 1, text: data.text.trim() }];
    }
    throw new Error('Empty response');
  }

  async function loadChapter(book, chapter) {
    const container = document.getElementById('bible-text');
    if (!container) return;
    if (!book || !chapter) {
      container.innerHTML = '<p class="placeholder">Select a book and chapter, then click Read Chapter.</p>';
      return;
    }

    container.innerHTML = '<p style="text-align:center;color:var(--text-muted);">Loading Scripture...</p>';

    const key = cacheKey(book, chapter);
    const cache = getCache();

    // 1. Try local cache first (works offline)
    if (cache[key]) {
      renderVerses(container, cache[key], book, chapter);
      return;
    }

    // 2. Network
    try {
      const verses = await fetchChapterFromApi(book, chapter);
      cache[key] = verses;
      saveCache(cache);
      renderVerses(container, verses, book, chapter);
    } catch (err) {
      container.innerHTML =
        '<p style="color:var(--error);">Unable to load this chapter. ' +
        (navigator.onLine ? 'Please try another book/chapter or check your connection.' : 'You are offline and this chapter is not cached yet. Enable Offline Mode and load some chapters while online first.') +
        '</p>';
    }
  }

  function renderVerses(container, verses, book, chapter) {
    container.innerHTML =
      '<div class="bible-header" style="margin-bottom:1rem;font-weight:600;color:var(--primary);">' +
      book + ' ' + chapter + '</div>' +
      verses.map(function (v) {
        return '<div class="verse"><span class="verse-num">' + v.verse + '</span> ' + escapeHtml(v.text) + '</div>';
      }).join('');
  }

  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  /* ========== OFFLINE MODE ========== */
  function isOfflineMode() {
    return localStorage.getItem(OFFLINE_KEY) === '1';
  }

  function updateOfflineUI() {
    const btn = document.getElementById('offline-btn');
    const icon = document.getElementById('offline-icon');
    const label = document.getElementById('offline-label');
    const status = document.getElementById('offline-status');
    if (!btn) return;

    const on = isOfflineMode();
    if (icon) icon.textContent = on ? '📴' : '📡';
    if (label) label.textContent = on ? 'Offline Mode Active' : 'Enable Offline Mode';
    btn.classList.toggle('active', on);

    if (status) {
      const cache = getCache();
      const count = Object.keys(cache).length;
      if (on) {
        status.textContent = count
          ? count + ' chapter(s) cached. They will load offline. Keep reading online to cache more.'
          : 'Offline mode on. Read chapters while online — they will be saved for offline use.';
      } else {
        status.textContent = count ? count + ' chapter(s) already cached.' : '';
      }
    }
  }

  function initOffline() {
    const btn = document.getElementById('offline-btn');
    if (!btn) return;
    updateOfflineUI();
    btn.addEventListener('click', function () {
      const next = !isOfflineMode();
      localStorage.setItem(OFFLINE_KEY, next ? '1' : '0');
      updateOfflineUI();
      if (next) {
        // Optional: pre-cache a few popular chapters
        preCachePopular();
      }
    });
  }

  async function preCachePopular() {
    const popular = [
      ['Genesis', 1], ['John', 3], ['Psalms', 23], ['Romans', 8],
      ['Matthew', 5], ['John', 1], ['Isaiah', 53], ['Revelation', 21]
    ];
    const status = document.getElementById('offline-status');
    for (let i = 0; i < popular.length; i++) {
      const [book, ch] = popular[i];
      const key = cacheKey(book, ch);
      const cache = getCache();
      if (cache[key]) continue;
      if (status) status.textContent = 'Caching ' + book + ' ' + ch + '...';
      try {
        const verses = await fetchChapterFromApi(book, ch);
        cache[key] = verses;
        saveCache(cache);
      } catch (e) { /* skip */ }
    }
    updateOfflineUI();
  }

  /* ========== TABS ========== */
  function initTabs() {
    document.querySelectorAll('.tab-btn').forEach(function (btn) {
      btn.addEventListener('click', function () {
        const tab = btn.getAttribute('data-tab');
        document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
        document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
        btn.classList.add('active');
        const el = document.getElementById(tab);
        if (el) el.classList.add('active');

        if (tab === 'study-tab') renderWeeklyStudy();
        if (tab === 'quiz-tab') renderQuiz();
      });
    });
  }

  /* ========== WEEKLY ROTATIONAL BIBLE STUDY ========== */
  const WEEKLY_STUDIES = {
    0: [
      { title: 'Creation & Purpose', text: 'God created the heavens and the earth and made mankind in His image. Reflect on Genesis 1–2 and your purpose in Him.', ref: 'Genesis 1–2' },
      { title: 'The Fall & Promise', text: 'Sin entered the world, yet God promised a Redeemer. See the first gospel in Genesis 3:15.', ref: 'Genesis 3' },
      { title: 'Noah & the Rainbow', text: 'God judged the earth but saved Noah and established the covenant of the rainbow.', ref: 'Genesis 6–9' },
      { title: 'Abraham’s Call', text: 'Leave your country. God promises land, seed, and blessing to all nations through Abraham.', ref: 'Genesis 12, 15, 17' },
      { title: 'Joseph & Providence', text: 'What others meant for evil, God meant for good. Trust His sovereignty in every season.', ref: 'Genesis 37–50' },
      { title: 'Moses & the Exodus', text: 'God delivers His people with a mighty hand and gives the Law at Sinai.', ref: 'Exodus 1–20' },
      { title: 'Rest & the Sabbath', text: 'God invites His people into rest. Jesus is our true Sabbath rest.', ref: 'Exodus 20:8–11; Hebrews 4' }
    ],
    1: [
      { title: 'David the Shepherd King', text: 'A man after God’s heart. From pasture to throne — and the everlasting covenant.', ref: '1 Samuel 16; 2 Samuel 7' },
      { title: 'Solomon’s Wisdom', text: 'Ask for wisdom. God grants it — and warns that faithfulness sustains the kingdom.', ref: '1 Kings 3, 9' },
      { title: 'Elijah on Carmel', text: 'If the LORD is God, follow Him. Fire falls; the people return to the covenant.', ref: '1 Kings 18' },
      { title: 'Isaiah’s Vision', text: 'Holy, holy, holy. A vision of God leads to confession, cleansing, and commission.', ref: 'Isaiah 6' },
      { title: 'Jeremiah’s New Covenant', text: 'The law written on hearts. Full forgiveness is coming.', ref: 'Jeremiah 31:31–34' },
      { title: 'Daniel’s Faithfulness', text: 'In exile, Daniel remains faithful. God is still on the throne of the nations.', ref: 'Daniel 1–6' },
      { title: 'The Suffering Servant', text: 'He was pierced for our transgressions. The gospel in the Old Testament.', ref: 'Isaiah 53' }
    ],
    2: [
      { title: 'The Birth of the King', text: 'The Word became flesh. God with us.', ref: 'Luke 1–2; John 1' },
      { title: 'Baptism & Temptation', text: 'Jesus identifies with us and overcomes the tempter with the Word.', ref: 'Matthew 3–4' },
      { title: 'Sermon on the Mount', text: 'The kingdom ethic: blessed are the poor in spirit…', ref: 'Matthew 5–7' },
      { title: 'Miracles & Authority', text: 'Jesus heals, calms storms, and forgives sins — showing who He is.', ref: 'Mark 2–5' },
      { title: 'The Cross', text: 'It is finished. The once-for-all sacrifice for sin.', ref: 'John 19; Isaiah 53' },
      { title: 'The Resurrection', text: 'He is risen! Death is defeated.', ref: 'Matthew 28; 1 Corinthians 15' },
      { title: 'The Ascension & Promise', text: 'Jesus returns to the Father and promises the Holy Spirit.', ref: 'Acts 1' }
    ],
    3: [
      { title: 'Pentecost', text: 'The Spirit is poured out. The church is born in power.', ref: 'Acts 2' },
      { title: 'The Early Church', text: 'Devoted to the apostles’ teaching, fellowship, breaking of bread, and prayer.', ref: 'Acts 2:42–47' },
      { title: 'Paul’s Conversion', text: 'From persecutor to apostle — grace that transforms.', ref: 'Acts 9' },
      { title: 'Justification by Faith', text: 'The righteous shall live by faith. The heart of the gospel.', ref: 'Romans 3–5' },
      { title: 'Life in the Spirit', text: 'Walk by the Spirit. The fruit of the Spirit.', ref: 'Galatians 5; Romans 8' },
      { title: 'The Body of Christ', text: 'One body, many members. Love is the more excellent way.', ref: '1 Corinthians 12–13' },
      { title: 'The Blessed Hope', text: 'Christ will return. Be ready. Live in light of eternity.', ref: '1 Thessalonians 4–5; Revelation 21–22' }
    ]
  };

  function getWeekIndex() {
    const epoch = new Date(2024, 0, 1).getTime();
    const days = Math.floor((Date.now() - epoch) / (1000 * 60 * 60 * 24));
    return Math.floor(days / 7) % 4;
  }

  function renderWeeklyStudy() {
    const grid = document.getElementById('study-grid');
    if (!grid) return;
    const week = WEEKLY_STUDIES[getWeekIndex()] || WEEKLY_STUDIES[0];
    grid.innerHTML = week.map(function (s) {
      return '<div class="study-card"><h4>' + escapeHtml(s.title) + '</h4><p>' + escapeHtml(s.text) +
        '</p><p style="margin-top:0.75rem;font-size:0.9rem;"><strong style="color:var(--primary)">Key Passage:</strong> ' +
        escapeHtml(s.ref) + '</p></div>';
    }).join('');
  }

  /* ========== ENDLESS ROTATIONAL QUIZ ========== */
  const QUIZ_BANK = [
    { q: 'Who built the ark according to God\'s command?', options: ['Abraham', 'Noah', 'Moses', 'David'], answer: 1 },
    { q: 'What covenant sign did God give Noah?', options: ['Circumcision', 'The rainbow', 'The Sabbath', 'The Passover'], answer: 1 },
    { q: 'To whom did God promise descendants as numerous as the stars?', options: ['Moses', 'Elijah', 'Abraham', 'Solomon'], answer: 2 },
    { q: 'Who led the Israelites out of Egypt?', options: ['Joshua', 'Aaron', 'Moses', 'Caleb'], answer: 2 },
    { q: 'Which prophet was taken up to heaven in a whirlwind?', options: ['Elisha', 'Elijah', 'Isaiah', 'Jeremiah'], answer: 1 },
    { q: 'Who was known as a man after God\'s own heart?', options: ['Saul', 'Solomon', 'David', 'Samuel'], answer: 2 },
    { q: 'Who asked God for wisdom and received great riches as well?', options: ['David', 'Solomon', 'Hezekiah', 'Josiah'], answer: 1 },
    { q: 'What is the New Covenant centered on?', options: ['The Law of Moses', 'The sacrifice of Jesus Christ', 'Temple worship', 'Animal sacrifices'], answer: 1 },
    { q: 'Jesus said, "I am the way, the truth, and the ___."', options: ['light', 'life', 'door', 'shepherd'], answer: 1 },
    { q: 'According to John 3:16, whoever believes in Him should not perish but have ___ life.', options: ['happy', 'long', 'eternal', 'peaceful'], answer: 2 },
    { q: 'Where was Jesus born?', options: ['Nazareth', 'Jerusalem', 'Bethlehem', 'Capernaum'], answer: 2 },
    { q: 'How many days was Jesus in the tomb before rising?', options: ['One', 'Two', 'Three', 'Seven'], answer: 2 },
    { q: 'Who denied Jesus three times before the rooster crowed?', options: ['Judas', 'Thomas', 'Peter', 'John'], answer: 2 },
    { q: 'What did Jesus turn water into at the wedding in Cana?', options: ['Oil', 'Wine', 'Milk', 'Honey'], answer: 1 },
    { q: 'Who was thrown into the lions\' den?', options: ['Joseph', 'Daniel', 'Jonah', 'Paul'], answer: 1 },
    { q: 'Who was swallowed by a great fish?', options: ['Noah', 'Jonah', 'Peter', 'Job'], answer: 1 },
    { q: 'What is the first book of the Bible?', options: ['Exodus', 'Genesis', 'Matthew', 'Psalms'], answer: 1 },
    { q: 'What is the last book of the Bible?', options: ['Jude', 'Malachi', 'Revelation', 'Acts'], answer: 2 },
    { q: 'Who baptized Jesus?', options: ['Peter', 'John the Baptist', 'Paul', 'Andrew'], answer: 1 },
    { q: 'How many disciples did Jesus choose as apostles?', options: ['7', '10', '12', '70'], answer: 2 },
    { q: 'What fruit of the Spirit is listed first in Galatians 5?', options: ['Joy', 'Peace', 'Love', 'Patience'], answer: 2 },
    { q: 'Who wrote most of the New Testament letters?', options: ['Peter', 'John', 'Paul', 'James'], answer: 2 },
    { q: 'What does "Emmanuel" mean?', options: ['God saves', 'God with us', 'God is love', 'Prince of Peace'], answer: 1 },
    { q: 'Which river did the Israelites cross into the Promised Land?', options: ['Nile', 'Jordan', 'Euphrates', 'Tigris'], answer: 1 },
    { q: 'Who was the mother of Jesus?', options: ['Martha', 'Mary', 'Elizabeth', 'Ruth'], answer: 1 },
    { q: 'What is the greatest commandment according to Jesus?', options: ['Keep the Sabbath', 'Love the Lord your God', 'Do not steal', 'Honor your parents'], answer: 1 },
    { q: 'Who interpreted Pharaoh\'s dreams in Egypt?', options: ['Moses', 'Daniel', 'Joseph', 'Aaron'], answer: 2 },
    { q: 'How many days and nights did it rain during the flood?', options: ['7', '40', '3', '12'], answer: 1 },
    { q: 'What did God create on the first day?', options: ['Animals', 'Light', 'Man', 'The sun'], answer: 1 },
    { q: 'Who is called the "Father of faith"?', options: ['Moses', 'Abraham', 'David', 'Noah'], answer: 1 }
  ];

  const QUIZ_INDEX_KEY = 'gpg_quiz_index';
  let currentQuizBatch = [];

  function getQuizIndex() {
    return parseInt(localStorage.getItem(QUIZ_INDEX_KEY) || '0', 10) || 0;
  }
  function setQuizIndex(i) {
    localStorage.setItem(QUIZ_INDEX_KEY, String(i % QUIZ_BANK.length));
  }

  function renderQuiz() {
    const container = document.getElementById('quiz-container');
    if (!container) return;

    let start = getQuizIndex();
    currentQuizBatch = [];
    for (let i = 0; i < 5; i++) {
      currentQuizBatch.push(QUIZ_BANK[(start + i) % QUIZ_BANK.length]);
    }

    container.innerHTML = currentQuizBatch.map(function (item, i) {
      return '<div class="quiz-question">' +
        '<p><strong>Q' + (i + 1) + '.</strong> ' + escapeHtml(item.q) + '</p>' +
        item.options.map(function (opt, j) {
          return '<label class="quiz-option"><input type="radio" name="q' + i + '" value="' + j + '"> ' +
            escapeHtml(opt) + '</label>';
        }).join('') +
        '</div>';
    }).join('');

    const result = document.getElementById('quiz-result');
    if (result) {
      result.style.display = 'none';
      result.innerHTML = '';
      result.className = 'quiz-result';
    }
  }

  function submitQuiz() {
    let score = 0;
    currentQuizBatch.forEach(function (item, i) {
      const selected = document.querySelector('input[name="q' + i + '"]:checked');
      if (selected && parseInt(selected.value, 10) === item.answer) score++;
    });
    const result = document.getElementById('quiz-result');
    if (!result) return;
    result.style.display = 'block';
    const pct = Math.round((score / currentQuizBatch.length) * 100);
    if (pct >= 70) {
      result.className = 'quiz-result correct';
      result.innerHTML = 'Well done! You scored ' + score + '/' + currentQuizBatch.length +
        ' (' + pct + '%). Keep going — click Next Batch for more!';
    } else {
      result.className = 'quiz-result incorrect';
      result.innerHTML = 'You scored ' + score + '/' + currentQuizBatch.length +
        ' (' + pct + '%). Review the Bible Study, then try the next batch!';
    }
  }

  function nextQuizBatch() {
    setQuizIndex(getQuizIndex() + 5);
    renderQuiz();
  }

  /* ========== DAILY AFFIRMATION & VERSE (for index page) ========== */
  const AFFIRMATIONS = [
    "God's love for you is everlasting and unchanging.",
    "You are fearfully and wonderfully made in His image.",
    "The Lord is your strength and your shield today.",
    "Walk by faith, not by sight — He goes before you.",
    "His mercies are new every morning. Great is His faithfulness.",
    "You are more than a conqueror through Him who loves you.",
    "The joy of the Lord is your strength.",
    "Cast all your anxiety on Him because He cares for you.",
    "Be still and know that He is God.",
    "Nothing can separate you from the love of God in Christ Jesus."
  ];

  function getTodayKey() {
    const d = new Date();
    return d.getFullYear() + '-' + (d.getMonth() + 1) + '-' + d.getDate();
  }
  function hashCode(str) {
    let h = 0;
    for (let i = 0; i < str.length; i++) h = ((h << 5) - h) + str.charCodeAt(i) | 0;
    return h;
  }
  function getDailyAffirmation() {
    const key = getTodayKey();
    const idx = Math.abs(hashCode(key + 'affirm')) % AFFIRMATIONS.length;
    return AFFIRMATIONS[idx];
  }

  const VERSE_REFS = [
    'John 3:16', 'Psalm 23:1', 'Philippians 4:13', 'Romans 8:28', 'Isaiah 40:31',
    'Jeremiah 29:11', 'Proverbs 3:5-6', 'Matthew 6:33', '2 Timothy 1:7', 'Psalm 46:10',
    'John 14:6', 'Romans 12:2', 'Ephesians 2:8-9', 'Hebrews 11:1', '1 John 4:8'
  ];

  async function getDailyVerse() {
    const today = getTodayKey();
    if (localStorage.getItem('gpg_verse_date') === today) {
      try { return JSON.parse(localStorage.getItem('gpg_daily_verse')); } catch {}
    }
    const idx = Math.abs(hashCode(today + 'verse')) % VERSE_REFS.length;
    const ref = VERSE_REFS[idx];
    try {
      const res = await fetch('https://bible-api.com/' + encodeURIComponent(ref) + '?translation=web');
      if (!res.ok) throw new Error('API');
      const data = await res.json();
      const verse = { reference: data.reference, text: (data.text || '').trim().replace(/\n+/g, ' ') };
      localStorage.setItem('gpg_verse_date', today);
      localStorage.setItem('gpg_daily_verse', JSON.stringify(verse));
      return verse;
    } catch {
      return { reference: 'John 3:16', text: 'For God so loved the world, that he gave his one and only Son, that whoever believes in him should not perish, but have eternal life.' };
    }
  }

  /* ========== FORMS (login / signup) ========== */
  function initForms() {
    const signupForm = document.getElementById('signup-form');
    if (signupForm) {
      signupForm.addEventListener('submit', function (e) {
        e.preventDefault();
        const result = signup(
          document.getElementById('signup-name').value.trim(),
          document.getElementById('signup-email').value.trim(),
          document.getElementById('signup-password').value
        );
        const msg = document.getElementById('signup-message');
        if (msg) msg.textContent = result.message;
        if (result.ok) setTimeout(function () { window.location.href = 'index.html'; }, 1000);
      });
    }
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
      loginForm.addEventListener('submit', function (e) {
        e.preventDefault();
        const result = login(
          document.getElementById('login-email').value.trim(),
          document.getElementById('login-password').value
        );
        const msg = document.getElementById('login-message');
        if (msg) msg.textContent = result.message;
        if (result.ok) setTimeout(function () { window.location.href = 'index.html'; }, 1000);
      });
    }
  }

  /* ========== INIT ========== */
  document.addEventListener('DOMContentLoaded', function () {
    initTheme();
    initNav();
    initForms();
    initTabs();
    initOffline();

    // Daily affirmation / verse (index page)
    const affirmEl = document.getElementById('daily-affirmation');
    if (affirmEl) affirmEl.textContent = getDailyAffirmation();

    const verseEl = document.getElementById('daily-verse');
    const verseRefEl = document.getElementById('daily-verse-ref');
    if (verseEl) {
      getDailyVerse().then(function (v) {
        verseEl.textContent = '"' + v.text + '"';
        if (verseRefEl) verseRefEl.textContent = '— ' + v.reference;
      });
    }

    // Bible reader controls
    const bookSelect = document.getElementById('book-select');
    const chapterSelect = document.getElementById('chapter-select');
    if (bookSelect && chapterSelect) {
      populateBookSelect(bookSelect);
      populateChapterSelect(bookSelect, chapterSelect);

      bookSelect.addEventListener('change', function () {
        populateChapterSelect(bookSelect, chapterSelect);
      });

      const loadBtn = document.getElementById('load-chapter-btn');
      if (loadBtn) {
        loadBtn.addEventListener('click', function () {
          loadChapter(bookSelect.value, chapterSelect.value);
        });
      }
    }

    // Quiz buttons
    const checkBtn = document.getElementById('check-quiz-btn');
    if (checkBtn) checkBtn.addEventListener('click', submitQuiz);
    const nextBtn = document.getElementById('next-quiz-btn');
    if (nextBtn) nextBtn.addEventListener('click', nextQuizBatch);

    // Pre-render study/quiz if their containers exist and tab is active
    if (document.getElementById('study-grid') && document.getElementById('study-tab')?.classList.contains('active')) {
      renderWeeklyStudy();
    }
    if (document.getElementById('quiz-container') && document.getElementById('quiz-tab')?.classList.contains('active')) {
      renderQuiz();
    }
  });
})();

/* GOD PEOPLE GATHERING — Bible School (app.js)
   Compatible with the current bible-school.html
   Bible text: World English Bible via bible-api.com (public domain)
*/

const QUIZ_INDEX_KEY = 'gpg_quiz_index';
const OFFLINE_KEY = 'gpg_offline_mode';
const THEME_KEY = 'gpg_theme';

/* ========== BIBLE BOOKS (66) ========== */
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
  chapterSelect.innerHTML = Array.from({ length: book.chapters }, function(_, i) {
    return '<option value="' + (i + 1) + '">' + (i + 1) + '</option>';
  }).join('');
}

async function loadChapter(book, chapter) {
  const container = document.getElementById('bible-text');
  if (!container) return;

  if (!book || !chapter) {
    container.innerHTML = '<p class="placeholder">Select a book and chapter, then click Read Chapter.</p>';
    return;
  }

  container.innerHTML = '<p style="text-align:center;color:var(--text-muted,#94a3b8);">Loading Scripture...</p>';

  try {
    const res = await fetch(
      'https://bible-api.com/' + encodeURIComponent(book) + '+' + chapter + '?translation=web'
    );
    if (!res.ok) throw new Error('Failed to fetch');
    const data = await res.json();

    if (data.verses && data.verses.length) {
      container.innerHTML = data.verses.map(function(v) {
        return '<div class="verse"><span class="verse-num">' + v.verse + '</span> ' +
               v.text.trim() + '</div>';
      }).join('');
    } else {
      container.innerHTML = '<p>' + (data.text || 'No text available for this chapter.') + '</p>';
    }
  } catch (err) {
    container.innerHTML = '<p style="color:#ef4444;">Unable to load this chapter. Please check your connection or try another.</p>';
  }
}

/* ========== 4-WEEK ROTATIONAL BIBLE STUDY ========== */
const WEEKLY_STUDIES = {
  0: [ // Week A
    { title: 'Creation & Purpose', text: 'God created the heavens and the earth and made mankind in His image. Reflect on Genesis 1–2 and your purpose in Him.', ref: 'Genesis 1–2' },
    { title: 'The Fall & Promise', text: 'Sin entered the world, yet God promised a Redeemer. See the first gospel in Genesis 3:15.', ref: 'Genesis 3' },
    { title: 'Noah & the Rainbow', text: 'God judged the earth but saved Noah and established the covenant of the rainbow.', ref: 'Genesis 6–9' },
    { title: 'Abraham’s Call', text: 'Leave your country. God promises land, seed, and blessing to all nations through Abraham.', ref: 'Genesis 12, 15, 17' },
    { title: 'Joseph & Providence', text: 'What others meant for evil, God meant for good. Trust His sovereignty in every season.', ref: 'Genesis 37–50' },
    { title: 'Moses & the Exodus', text: 'God delivers His people with a mighty hand and gives the Law at Sinai.', ref: 'Exodus 1–20' },
    { title: 'Rest & the Sabbath', text: 'God invites His people into rest. Jesus is our true Sabbath rest.', ref: 'Exodus 20:8–11; Hebrews 4' }
  ],
  1: [ // Week B
    { title: 'David the Shepherd King', text: 'A man after God’s heart. From pasture to throne — and the everlasting covenant.', ref: '1 Samuel 16; 2 Samuel 7' },
    { title: 'Solomon’s Wisdom', text: 'Ask for wisdom. God grants it — and warns that faithfulness sustains the kingdom.', ref: '1 Kings 3, 9' },
    { title: 'Elijah on Carmel', text: 'If the LORD is God, follow Him. Fire falls; the people return to the covenant.', ref: '1 Kings 18' },
    { title: 'Isaiah’s Vision', text: 'Holy, holy, holy. A vision of God leads to confession, cleansing, and commission.', ref: 'Isaiah 6' },
    { title: 'Jeremiah’s New Covenant', text: 'The law written on hearts. Full forgiveness is coming.', ref: 'Jeremiah 31:31–34' },
    { title: 'Daniel’s Faithfulness', text: 'In exile, Daniel remains faithful. God is still on the throne of the nations.', ref: 'Daniel 1–6' },
    { title: 'The Suffering Servant', text: 'He was pierced for our transgressions. The gospel in the Old Testament.', ref: 'Isaiah 53' }
  ],
  2: [ // Week C
    { title: 'The Birth of the King', text: 'The Word became flesh. God with us.', ref: 'Luke 1–2; John 1:1–14' },
    { title: 'The Baptism & Temptation', text: 'Jesus identifies with us and overcomes the enemy by the Word.', ref: 'Matthew 3–4' },
    { title: 'The Sermon on the Mount', text: 'The kingdom ethic: blessed are the poor in spirit…', ref: 'Matthew 5–7' },
    { title: 'Miracles & Authority', text: 'Jesus heals, calms storms, and forgives sins — showing who He is.', ref: 'Mark 2–5' },
    { title: 'The Cross', text: 'It is finished. The once-for-all sacrifice for sin.', ref: 'John 19; Isaiah 53' },
    { title: 'The Resurrection', text: 'He is risen! Death is defeated.', ref: 'Matthew 28; 1 Corinthians 15' },
    { title: 'The Ascension & Promise', text: 'Jesus returns to the Father and promises the Holy Spirit.', ref: 'Acts 1' }
  ],
  3: [ // Week D
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
  grid.innerHTML = week.map(function(s) {
    return '<div class="study-card">' +
      '<h4>' + s.title + '</h4>' +
      '<p>' + s.text + '</p>' +
      '<p style="margin-top:0.75rem;font-size:0.9rem;"><strong>Key Passage:</strong> ' + s.ref + '</p>' +
      '</div>';
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
  { q: 'What did God create on the first day?', options: ['Animals', 'Light', 'Man', 'Trees'], answer: 1 },
  { q: 'Who was the mother of Jesus?', options: ['Elizabeth', 'Mary', 'Martha', 'Sarah'], answer: 1 },
  { q: 'Which apostle is known as "the disciple whom Jesus loved"?', options: ['Peter', 'James', 'John', 'Andrew'], answer: 2 },
  { q: 'What is the shortest verse in the Bible (English)?', options: ['God is love', 'Jesus wept', 'Pray always', 'Rejoice always'], answer: 1 },
  { q: 'Who wrote most of the New Testament letters?', options: ['Peter', 'John', 'Paul', 'James'], answer: 2 }
];

let currentQuizBatch = [];

function getNextQuizIndex() {
  return parseInt(localStorage.getItem(QUIZ_INDEX_KEY) || '0', 10) || 0;
}

function saveQuizIndex(idx) {
  localStorage.setItem(QUIZ_INDEX_KEY, String(idx));
}

function renderQuiz() {
  const container = document.getElementById('quiz-container');
  if (!container) return;

  let start = getNextQuizIndex();
  currentQuizBatch = [];
  for (let i = 0; i < 5; i++) {
    const idx = (start + i) % QUIZ_BANK.length;
    currentQuizBatch.push(QUIZ_BANK[idx]);
  }
  // Do not advance index yet — only advance when user clicks "Next Batch"

  container.innerHTML = currentQuizBatch.map(function(item, i) {
    return '<div class="quiz-question">' +
      '<p><strong>Q' + (i + 1) + '.</strong> ' + item.q + '</p>' +
      item.options.map(function(opt, j) {
        return '<label class="quiz-option"><input type="radio" name="q' + i + '" value="' + j + '"> ' + opt + '</label>';
      }).join('') +
      '</div>';
  }).join('');

  // Clear previous result
  const result = document.getElementById('quiz-result');
  if (result) {
    result.innerHTML = '';
    result.className = 'quiz-result';
  }
}

function checkQuizAnswers() {
  if (!currentQuizBatch.length) return;
  let score = 0;
  currentQuizBatch.forEach(function(item, i) {
    const selected = document.querySelector('input[name="q' + i + '"]:checked');
    if (selected && parseInt(selected.value, 10) === item.answer) score++;
  });

  const result = document.getElementById('quiz-result');
  if (!result) return;

  const pct = Math.round((score / currentQuizBatch.length) * 100);
  if (pct >= 70) {
    result.className = 'quiz-result correct';
    result.innerHTML = 'Well done! You scored ' + score + '/' + currentQuizBatch.length +
      ' (' + pct + '%). Keep going — click Next Batch for more!';
  } else {
    result.className = 'quiz-result incorrect';
    result.innerHTML = 'You scored ' + score + '/' + currentQuizBatch.length +
      ' (' + pct + '%). Review the Study tab, then try the next batch!';
  }
}

function nextQuizBatch() {
  // Advance the rotating index
  const start = getNextQuizIndex();
  saveQuizIndex((start + 5) % QUIZ_BANK.length);
  renderQuiz();
}

/* ========== OFFLINE MODE (simple flag) ========== */
function updateOfflineUI(enabled) {
  const btn = document.getElementById('offline-btn');
  const icon = document.getElementById('offline-icon');
  const label = document.getElementById('offline-label');
  const status = document.getElementById('offline-status');

  if (enabled) {
    if (icon) icon.textContent = '📴';
    if (label) label.textContent = 'Offline Mode Active';
    if (status) status.textContent = 'Using cached data where available. Bible text still requires connection.';
    if (btn) btn.classList.add('active');
  } else {
    if (icon) icon.textContent = '📡';
    if (label) label.textContent = 'Enable Offline Mode';
    if (status) status.textContent = '';
    if (btn) btn.classList.remove('active');
  }
}

function toggleOfflineMode() {
  const currently = localStorage.getItem(OFFLINE_KEY) === '1';
  const next = !currently;
  localStorage.setItem(OFFLINE_KEY, next ? '1' : '0');
  updateOfflineUI(next);
}

/* ========== THEME TOGGLE ========== */
function applyTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  localStorage.setItem(THEME_KEY, theme);
  const btn = document.querySelector('.theme-toggle');
  if (btn) btn.textContent = theme === 'dark' ? '☀️' : '🌙';
}

function toggleTheme() {
  const current = localStorage.getItem(THEME_KEY) || 'light';
  applyTheme(current === 'dark' ? 'light' : 'dark');
}

/* ========== STATUS BAR TIME ========== */
function updateStatusTime() {
  const el = document.querySelector('.status-bar .time');
  if (!el) return;
  const now = new Date();
  el.textContent = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
}

/* ========== INITIALIZATION ========== */
document.addEventListener('DOMContentLoaded', function() {
  // Status bar clock
  updateStatusTime();
  setInterval(updateStatusTime, 30000);

  // Theme
  const savedTheme = localStorage.getItem(THEME_KEY) || 'light';
  applyTheme(savedTheme);
  const themeBtn = document.querySelector('.theme-toggle');
  if (themeBtn) themeBtn.addEventListener('click', toggleTheme);

  // Offline mode
  updateOfflineUI(localStorage.getItem(OFFLINE_KEY) === '1');
  const offlineBtn = document.getElementById('offline-btn');
  if (offlineBtn) offlineBtn.addEventListener('click', toggleOfflineMode);

  // Bible Reading controls
  const bookSelect = document.getElementById('book-select');
  const chapterSelect = document.getElementById('chapter-select');
  const loadBtn = document.getElementById('load-chapter-btn');

  if (bookSelect && chapterSelect) {
    populateBookSelect(bookSelect);
    // Default to Genesis so user sees something immediately
    bookSelect.value = 'Genesis';
    populateChapterSelect(bookSelect, chapterSelect);
    chapterSelect.value = '1';

    bookSelect.addEventListener('change', function() {
      populateChapterSelect(bookSelect, chapterSelect);
    });

    if (loadBtn) {
      loadBtn.addEventListener('click', function() {
        loadChapter(bookSelect.value, chapterSelect.value);
      });
    }

    // Auto-load Genesis 1 on first visit (like the old site)
    loadChapter('Genesis', 1);
  }

  // Tabs
  document.querySelectorAll('.tab-btn').forEach(function(btn) {
    btn.addEventListener('click', function() {
      const tab = btn.dataset.tab;
      document.querySelectorAll('.tab-btn').forEach(function(b) { b.classList.remove('active'); });
      document.querySelectorAll('.tab-content').forEach(function(c) { c.classList.remove('active'); });
      btn.classList.add('active');
      const el = document.getElementById(tab);
      if (el) el.classList.add('active');

      if (tab === 'study-tab') renderWeeklyStudy();
      if (tab === 'quiz-tab') renderQuiz();
    });
  });

  // Quiz buttons (external to the container, as in the new HTML)
  const checkBtn = document.getElementById('check-quiz-btn');
  const nextBtn = document.getElementById('next-quiz-btn');
  if (checkBtn) checkBtn.addEventListener('click', checkQuizAnswers);
  if (nextBtn) nextBtn.addEventListener('click', nextQuizBatch);

  // Initial render if already on those tabs
  if (document.getElementById('study-grid')) renderWeeklyStudy();
  if (document.getElementById('quiz-container')) renderQuiz();
});

// script.js
// Подключение к FastAPI и отображение стихов

const API_BASE = "https://biblebot-api.onrender.com";

const bookSelect = document.getElementById("book");
const chapterSelect = document.getElementById("chapter");
const versesContainer = document.getElementById("text");

// Получить список книг
fetch(`${API_BASE}/books`)
  .then((res) => res.json())
  .then((books) => {
    books.forEach((book) => {
      const option = document.createElement("option");
      option.value = book;
      option.textContent = book;
      bookSelect.appendChild(option);
    });
    console.log("📚 Загружены книги:", books);
  })
  .catch((err) => {
    console.error("Ошибка загрузки книг:", err);
  });

// При выборе книги — получить главы
bookSelect.addEventListener("change", () => {
  const book = bookSelect.value;
  chapterSelect.innerHTML = "<option disabled selected>Выбери главу</option>";
  chapterSelect.disabled = true;
  versesContainer.innerHTML = "";

  fetch(`${API_BASE}/chapters?book=${encodeURIComponent(book)}`)
    .then((res) => res.json())
    .then((chapters) => {
      chapters.forEach((ch) => {
        const option = document.createElement("option");
        option.value = ch;
        option.textContent = `Глава ${ch}`;
        chapterSelect.appendChild(option);
      });
      chapterSelect.disabled = false;
      console.log(`📖 Главы книги ${book}:`, chapters);
    })
    .catch((err) => {
      console.error("Ошибка загрузки глав:", err);
    });
});

// При выборе главы — получить текст
chapterSelect.addEventListener("change", () => {
  const book = bookSelect.value;
  const chapter = chapterSelect.value;
  versesContainer.innerHTML = "Загрузка...";

  fetch(`${API_BASE}/bible?book=${encodeURIComponent(book)}&chapter=${chapter}`)
    .then((res) => res.json())
    .then((data) => {
      const versesHtml = data.verses.map((v) => `
        <p><strong>${v.verse}</strong> ${v.text}</p>
      `).join("");
      versesContainer.innerHTML = versesHtml;
      console.log(`✅ Показана глава ${chapter} книги ${book}`);
    })
    .catch((err) => {
      console.error("Ошибка загрузки главы:", err);
    });
});

// --- ДОБАВЬ ЭТО В КОНЕЦ script.js ---

// Получить параметры из URL
function getUrlParams() {
  const params = new URLSearchParams(window.location.search);
  return {
    book: params.get("book"),
    chapter: params.get("chapter"),
  };
}

// Инициализация WebApp по параметрам
function initByUrl() {
  const { book, chapter } = getUrlParams();
  if (book) {
    // Выбрать книгу
    bookSelect.value = book;
    // Подгрузить главы
    fetch(`${API_BASE}/chapters?book=${encodeURIComponent(book)}`)
      .then((res) => res.json())
      .then((chapters) => {
        chapterSelect.innerHTML = "<option disabled selected>Выбери главу</option>";
        chapters.forEach((ch) => {
          const option = document.createElement("option");
          option.value = ch;
          option.textContent = ch;
          chapterSelect.appendChild(option);
        });
        chapterSelect.disabled = false;
        if (chapter) {
          // Выбрать главу
          chapterSelect.value = chapter.startsWith("Глава ") ? chapter : "Глава " + chapter;
          // Загрузить текст главы
          fetch(`${API_BASE}/bible?book=${encodeURIComponent(book)}&chapter=${chapter}`)
            .then((res) => res.json())
            .then((data) => {
              const versesHtml = data.verses.map((v) => `
                <p><strong>${v.verse}</strong> ${v.text}</p>
              `).join("");
              versesContainer.innerHTML = versesHtml;
              console.log(`✅ Показана глава ${chapter} книги ${book}`);
            });
        }
      });
  }
}

// Дождаться загрузки книг, затем выполнить initByUrl
fetch(`${API_BASE}/books`)
  .then((res) => res.json())
  .then((books) => {
    books.forEach((book) => {
      const option = document.createElement("option");
      option.value = book;
      option.textContent = book;
      bookSelect.appendChild(option);
    });
    console.log("📚 Загружены книги:", books);
    // ← ВАЖНО: инициализация по параметрам
    initByUrl();
  })
  .catch((err) => {
    console.error("Ошибка загрузки книг:", err);
  });

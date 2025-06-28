// public/script.js
// Подключение к FastAPI и отображение стихов

const API_BASE = "https://biblebot-api.onrender.com";

const bookSelect = document.getElementById("bookSelect");
const chapterSelect = document.getElementById("chapterSelect");
const versesContainer = document.getElementById("verses");

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
    });
});

// script.js
// Подключение к FastAPI и отображение выбранной главы из ссылки

const API_BASE = "http://147.45.163.133:8000";

const bookSelect = document.getElementById("book");
const chapterSelect = document.getElementById("chapter");
const versesContainer = document.getElementById("text");

// Получить параметры из URL
function getUrlParams() {
  const params = new URLSearchParams(window.location.search);
  return {
    book: params.get("book"),
    chapter: params.get("chapter"),
  };
}

// Отобразить стихи главы
function showVerses(book, chapter) {
  versesContainer.innerHTML = "Загрузка...";
  fetch(`${API_BASE}/bible?book=${encodeURIComponent(book)}&chapter=${encodeURIComponent(chapter)}`)
    .then((res) => {
      if (!res.ok) throw new Error("Не найдена глава!");
      return res.json();
    })
    .then((data) => {
      if (!data.verses) {
        versesContainer.innerHTML = "Нет данных для этой главы";
        return;
      }
      const versesHtml = data.verses.map(
        (v) => `<p><strong>${v.verse}</strong> ${v.text}</p>`
      ).join("");
      versesContainer.innerHTML = versesHtml;
      console.log(`✅ Показана глава ${chapter} книги ${book}`);
    })
    .catch((err) => {
      versesContainer.innerHTML = "Ошибка загрузки главы";
      console.error("Ошибка загрузки главы:", err);
    });
}

// При старте: загрузить книги, а потом — обработать параметры из URL
fetch(`${API_BASE}/books`)
  .then((res) => res.json())
  .then((books) => {
    bookSelect.innerHTML = "<option disabled selected>Выбери книгу</option>";
    books.forEach((book) => {
      const option = document.createElement("option");
      option.value = book;
      option.textContent = book;
      bookSelect.appendChild(option);
    });

    // Если есть параметры в URL — выбрать их!
    const { book, chapter } = getUrlParams();
    if (book && books.includes(book)) {
      bookSelect.value = book;
      fetch(`${API_BASE}/chapters?book=${encodeURIComponent(book)}`)
        .then((res) => res.json())
        .then((chapters) => {
          chapterSelect.innerHTML = "<option disabled selected>Выбери главу</option>";
          chapters.forEach((ch) => {
            const option = document.createElement("option");
            option.value = ch.replace(/^Глава\s/, ""); // убираем "Глава " для value
            option.textContent = ch;
            chapterSelect.appendChild(option);
          });
          chapterSelect.disabled = false;

          // Поддержка chapter=10 или chapter=Глава 10
          let chapterParam = chapter;
          if (!chapter.startsWith("Глава ")) {
            chapterParam = "Глава " + chapter;
          }
          const chapterValue = chapterParam.replace(/^Глава\s/, "");
          chapterSelect.value = chapterValue;
          showVerses(book, chapterParam);
        });
    }
  });

// При выборе книги — подгрузить главы
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
        option.value = ch.replace(/^Глава\s/, ""); // для value только номер
        option.textContent = ch;
        chapterSelect.appendChild(option);
      });
      chapterSelect.disabled = false;
    })
    .catch((err) => {
      console.error("Ошибка загрузки глав:", err);
    });
});

// При выборе главы — отобразить её
chapterSelect.addEventListener("change", () => {
  const book = bookSelect.value;
  const chapter = chapterSelect.value;
  showVerses(book, "Глава " + chapter);
  // Поддержка обновления URL-параметров без перезагрузки страницы
  const params = new URLSearchParams(window.location.search);
  params.set("book", book);
  params.set("chapter", chapter);
  window.history.replaceState({}, '', `${location.pathname}?${params}`);
});

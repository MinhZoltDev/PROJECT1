const themeToggle = document.getElementById("themeToggle");
const lessonInput = document.getElementById("lessonInput");
const imageInput = document.getElementById("imageInput");
const extractTextBtn = document.getElementById("extractTextBtn");
const generateCardsBtn = document.getElementById("generateCardsBtn");
const flashcardList = document.getElementById("flashcardList");
const studioStatus = document.getElementById("studioStatus");

if (themeToggle) {
  themeToggle.addEventListener("click", () => {
    document.body.classList.toggle("dark");
    themeToggle.textContent = document.body.classList.contains("dark") ? "☀️" : "🌙";
  });
}

function setStatus(message, isError = false) {
  if (!studioStatus) {
    return;
  }

  studioStatus.textContent = message;
  studioStatus.style.color = isError ? "#ef4444" : "";
}

function buildFlashcards(text) {
  const lines = text
    .split(/\n+/)
    .map((line) => line.replace(/^[-•\d.\s]+/, "").trim())
    .filter((line) => line.length > 8);

  return lines.slice(0, 12).map((line, index) => {
    const separator = line.includes(":") ? ":" : line.includes("-") ? "-" : null;

    if (separator) {
      const [term, ...descParts] = line.split(separator);
      return {
        question: `Thẻ ${index + 1}: ${term.trim()} là gì?`,
        answer: descParts.join(separator).trim() || "Bạn hãy bổ sung định nghĩa chi tiết."
      };
    }

    return {
      question: `Thẻ ${index + 1}: Ý chính của nội dung này là gì?`,
      answer: line
    };
  });
}

function renderFlashcards(cards) {
  if (!flashcardList) {
    return;
  }

  if (!cards.length) {
    flashcardList.innerHTML = "<p class='empty'>Không đủ dữ liệu để tạo flashcard. Hãy nhập thêm nội dung cụ thể hơn.</p>";
    return;
  }

  flashcardList.innerHTML = cards
    .map(
      (card) => `
        <article class="flashcard">
          <p><strong>Hỏi:</strong> ${card.question}</p>
          <p><strong>Đáp:</strong> ${card.answer}</p>
        </article>
      `
    )
    .join("");
}

async function extractTextFromImage() {
  if (!imageInput || !lessonInput) {
    return;
  }

  const file = imageInput.files?.[0];
  if (!file) {
    setStatus("Bạn chưa chọn ảnh tài liệu.", true);
    return;
  }

  if (!window.Tesseract) {
    setStatus("Không tải được bộ OCR. Vui lòng kiểm tra mạng và thử lại.", true);
    return;
  }

  setStatus("Đang nhận diện chữ từ ảnh... vui lòng chờ.");

  try {
    const result = await window.Tesseract.recognize(file, "vie+eng");
    const extractedText = result?.data?.text?.trim() || "";

    if (!extractedText) {
      setStatus("Không trích xuất được chữ từ ảnh. Hãy dùng ảnh rõ nét hơn.", true);
      return;
    }

    lessonInput.value = extractedText;
    setStatus("Đã trích xuất nội dung từ ảnh. Bạn có thể bấm 'Tạo flashcard'.");
  } catch (error) {
    setStatus("OCR thất bại. Hãy thử ảnh khác hoặc nhập nội dung thủ công.", true);
  }
}

function generateFlashcards() {
  if (!lessonInput) {
    return;
  }

  const inputText = lessonInput.value.trim();
  if (!inputText) {
    setStatus("Hãy nhập nội dung hoặc trích xuất từ ảnh trước khi tạo flashcard.", true);
    renderFlashcards([]);
    return;
  }

  const cards = buildFlashcards(inputText);
  renderFlashcards(cards);
  setStatus(`Đã tạo ${cards.length} flashcard.`);
}

if (extractTextBtn) {
  extractTextBtn.addEventListener("click", extractTextFromImage);
}

if (generateCardsBtn) {
  generateCardsBtn.addEventListener("click", generateFlashcards);
}

const themeToggle = document.getElementById("themeToggle");
const lessonInput = document.getElementById("lessonInput");
const questionInput = document.getElementById("questionInput");
const answerInput = document.getElementById("answerInput");
const imageInput = document.getElementById("imageInput");
const extractTextBtn = document.getElementById("extractTextBtn");
const addManualCardBtn = document.getElementById("addManualCardBtn");
const generateCardsBtn = document.getElementById("generateCardsBtn");
const flashcardList = document.getElementById("flashcardList");
const studioStatus = document.getElementById("studioStatus");
const featureSlider = document.getElementById("featureSlider");
const featurePrev = document.getElementById("featurePrev");
const featureNext = document.getElementById("featureNext");

const manualCards = [];

if (themeToggle) {
  themeToggle.addEventListener("click", () => {
    document.body.classList.toggle("dark");
    themeToggle.innerHTML = document.body.classList.contains("dark")
      ? '<i class="bi bi-sun"></i>'
      : '<i class="bi bi-moon-stars"></i>';
  });
}

function setStatus(message, isError = false) {
  if (!studioStatus) {
    return;
  }

  studioStatus.textContent = message;
  studioStatus.style.color = isError ? "#ef4444" : "";
}

function escapeHtml(text) {
  return text
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function isLikelyQuestion(text) {
  const value = text.trim().toLowerCase();
  return (
    value.endsWith("?") ||
    value.endsWith(":") ||
    /^câu\s*\d+\b/.test(value) ||
    /^question\s*\d+\b/.test(value) ||
    /^q\d+\b/.test(value)
  );
}

function normalizeQuestion(text) {
  const raw = text.trim();
  if (!raw) {
    return "";
  }

  if (raw.endsWith(":")) {
    return raw.slice(0, -1).trim() + "?";
  }

  return raw.endsWith("?") ? raw : `${raw}?`;
}

function parseQuestionAnswerPairs(text) {
  const lines = text
    .split(/\n+/)
    .map((line) => line.trim())
    .filter(Boolean);

  const cards = [];
  let pendingQuestion = "";

  for (const line of lines) {
    const inline = line.match(/^(?:q|câu)\s*\d*\s*[:\-]\s*(.+?)\s*(?:\||=>|->)\s*(.+)$/i);
    if (inline) {
      cards.push({ question: normalizeQuestion(inline[1]), answer: inline[2].trim() });
      pendingQuestion = "";
      continue;
    }

    if (isLikelyQuestion(line)) {
      pendingQuestion = line;
      continue;
    }

    if (pendingQuestion) {
      cards.push({
        question: normalizeQuestion(pendingQuestion),
        answer: line
      });
      pendingQuestion = "";
      continue;
    }

    if (line.includes(":")) {
      const [left, ...rightParts] = line.split(":");
      const right = rightParts.join(":").trim();
      cards.push({
        question: normalizeQuestion(left.trim()),
        answer: right || "Bạn hãy bổ sung đáp án chi tiết hơn."
      });
      continue;
    }

    cards.push({
      question: `Ý chính của nội dung sau là gì?`,
      answer: line
    });
  }

  return cards.filter((card) => card.question && card.answer);
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
    .slice(0, 20)
    .map(
      (card, index) => `
        <button class="flashcard flip-card" type="button" aria-label="Lật flashcard ${index + 1}">
          <span class="flip-card-inner">
            <span class="flip-face flip-front">
              <span class="face-top">
                <span class="face-label"><i class="bi bi-patch-question"></i> Mặt trước · Câu hỏi</span>
                <i class="bi bi-arrow-repeat"></i>
              </span>
              <span class="face-content">${escapeHtml(card.question)}</span>
            </span>
            <span class="flip-face flip-back">
              <span class="face-top">
                <span class="face-label"><i class="bi bi-patch-check"></i> Mặt sau · Câu trả lời</span>
                <i class="bi bi-arrow-repeat"></i>
              </span>
              <span class="face-content">${escapeHtml(card.answer)}</span>
            </span>
          </span>
        </button>
      `
    )
    .join("");
}

function addManualCard() {
  if (!questionInput || !answerInput) {
    return;
  }

  const question = normalizeQuestion(questionInput.value.trim());
  const answer = answerInput.value.trim();

  if (!question || !answer) {
    setStatus("Hãy nhập đầy đủ ô Câu hỏi và Câu trả lời.", true);
    return;
  }

  manualCards.push({ question, answer });
  questionInput.value = "";
  answerInput.value = "";
  setStatus(`Đã thêm ${manualCards.length} thẻ thủ công. Bấm 'Tạo flashcard' để hiển thị.`);
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
    setStatus("Đã trích xuất nội dung từ ảnh. Bây giờ bạn có thể tạo flashcard.");
  } catch (error) {
    setStatus("OCR thất bại. Hãy thử ảnh khác hoặc nhập nội dung thủ công.", true);
  }
}

function generateFlashcards() {
  if (!lessonInput) {
    return;
  }

  const parsedCards = parseQuestionAnswerPairs(lessonInput.value.trim());
  const cards = [...manualCards, ...parsedCards].slice(0, 20);

  if (!cards.length) {
    setStatus("Hãy nhập nội dung hoặc thêm cặp hỏi/đáp trước khi tạo flashcard.", true);
    renderFlashcards([]);
    return;
  }

  renderFlashcards(cards);
  setStatus(`Đã tạo ${cards.length} flashcard 2 mặt.`);
}

if (extractTextBtn) {
  extractTextBtn.addEventListener("click", extractTextFromImage);
}

if (addManualCardBtn) {
  addManualCardBtn.addEventListener("click", addManualCard);
}

if (generateCardsBtn) {
  generateCardsBtn.addEventListener("click", generateFlashcards);
}

if (flashcardList) {
  flashcardList.addEventListener("click", (event) => {
    const card = event.target.closest(".flip-card");
    if (!card) {
      return;
    }

    card.classList.toggle("is-flipped");
  });
}

if (featureSlider && featurePrev && featureNext) {
  const scrollAmount = 340;
  featurePrev.addEventListener("click", () => {
    featureSlider.scrollBy({ left: -scrollAmount, behavior: "smooth" });
  });

  featureNext.addEventListener("click", () => {
    featureSlider.scrollBy({ left: scrollAmount, behavior: "smooth" });
  });
}

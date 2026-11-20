// JavaScript agrega comportamiento a los botones y formularios.
const homeView = document.querySelector("#home-view");
const grammarView = document.querySelector("#grammar-view");
const listeningView = document.querySelector("#listening-view");
const readingView = document.querySelector("#reading-view");
const vocabularyView = document.querySelector("#vocabulary-view");
const speakingView = document.querySelector("#speaking-view");
const gamesView = document.querySelector("#games-view");
const microphoneSelect = document.querySelector("#microphone-select");
const activeRecorders = new Set();
const vocabularyLevelByCategory = {
  travel: "easy", animals: "easy", thanks: "easy",
  grammar: "medium", antonyms: "medium", general: "medium", riddles: "medium",
  phrasal: "advanced", synonyms: "advanced",
};

function renderVocabulary(selectedLevel = "easy") {
  const groups = new Map();
  window.vocabularyImages
    .filter((image) => vocabularyLevelByCategory[image.categoryId] === selectedLevel)
    .forEach((image) => {
    if (!groups.has(image.categoryId)) {
      groups.set(image.categoryId, { name: image.category, items: [] });
    }
    groups.get(image.categoryId).items.push(image);
  });

  const categoryNav = document.querySelector("#vocab-categories");
  const gallery = document.querySelector("#vocabulary-gallery");
  categoryNav.replaceChildren();
  gallery.replaceChildren();
  const categoryButtons = [];
  const categorySections = [];
  groups.forEach((group, id) => {
    const categoryButton = document.createElement("button");
    categoryButton.type = "button";
    categoryButton.className = "vocab-category-button";
    categoryButton.textContent = group.name;
    categoryButton.setAttribute("aria-pressed", "false");
    categoryNav.append(categoryButton);
    categoryButtons.push(categoryButton);

    const section = document.createElement("section");
    section.className = "vocab-group";
    section.id = `vocab-${id}`;
    section.hidden = true;
    categorySections.push(section);
    categoryButton.addEventListener("click", () => {
      categorySections.forEach((topic) => { topic.hidden = topic !== section; });
      categoryButtons.forEach((button) => {
        const isSelected = button === categoryButton;
        button.setAttribute("aria-pressed", String(isSelected));
        button.classList.toggle("selected", isSelected);
      });
    });
    const heading = document.createElement("h2");
    heading.textContent = group.name;
    const grid = document.createElement("div");
    grid.className = "vocabulary-grid";

    group.items.forEach((imageData) => {
      const figure = document.createElement("figure");
      figure.className = "vocab-item";
      const imageLink = document.createElement("a");
      imageLink.href = imageData.src;
      imageLink.target = "_blank";
      imageLink.rel = "noreferrer";
      imageLink.setAttribute("aria-label", `Abrir imagen: ${imageData.alt}`);
      const image = document.createElement("img");
      image.src = imageData.src;
      image.alt = imageData.alt;
      image.loading = "lazy";
      image.decoding = "async";
      imageLink.append(image);
      const caption = document.createElement("figcaption");
      caption.textContent = imageData.title;
      figure.append(imageLink, caption);
      grid.append(figure);
    });

    section.append(heading, grid);
    gallery.append(section);
  });
}

renderVocabulary();

document.querySelectorAll("[data-vocab-level]").forEach((button) => {
  button.addEventListener("click", () => {
    document.querySelectorAll("[data-vocab-level]").forEach((levelButton) => {
      const selected = levelButton === button;
      levelButton.setAttribute("aria-pressed", String(selected));
    });
    renderVocabulary(button.dataset.vocabLevel);
  });
});

document.querySelectorAll(".lesson-view").forEach((view) => {
  const levelButtons = view.querySelectorAll("[data-section-level-button]");
  const panels = view.querySelectorAll("[data-level-panel]");
  levelButtons.forEach((button) => {
    button.addEventListener("click", () => {
      levelButtons.forEach((levelButton) => {
        levelButton.setAttribute("aria-pressed", String(levelButton === button));
      });
      panels.forEach((panel) => {
        panel.hidden = panel.dataset.levelPanel !== button.dataset.sectionLevelButton;
      });
    });
  });
});

function setSpeakingLevel(level) {
  document.querySelectorAll(".speaking-group").forEach((group) => {
    group.hidden = group.dataset.speakingLevel !== level;
  });
  document.querySelectorAll("[data-speaking-level-button]").forEach((button) => {
    button.setAttribute("aria-pressed", String(button.dataset.speakingLevelButton === level));
  });
}

document.querySelectorAll("[data-speaking-level-button]").forEach((button) => {
  button.addEventListener("click", () => setSpeakingLevel(button.dataset.speakingLevelButton));
});
setSpeakingLevel("easy");

document.querySelectorAll("[data-speak-text]").forEach((button) => {
  button.addEventListener("click", () => {
    if (!("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(button.dataset.speakText);
    utterance.lang = "en-US";
    utterance.rate = 0.88;
    window.speechSynthesis.speak(utterance);
  });
});

function addSpeakingControls() {
  document.querySelectorAll(".speaking-exercise").forEach((exercise) => {
    const phrase = exercise.querySelector(".english-phrase")?.textContent?.replace(/[“”]/g, "").trim();
    const details = exercise.querySelector("details");
    if (!phrase || !details) return;

    const controls = document.createElement("div");
    controls.className = "speaking-controls";

    const listenButton = document.createElement("button");
    listenButton.className = "practice-button";
    listenButton.type = "button";
    listenButton.textContent = "🔊 Escuchar frase";
    const recordButton = document.createElement("button");
    recordButton.className = "practice-button";
    recordButton.type = "button";
    recordButton.textContent = "🎙️ Grabar mi voz";
    const recording = document.createElement("audio");
    recording.controls = true;
    recording.hidden = true;
    recording.setAttribute("aria-label", "Reproducción de tu grabación");
    const status = document.createElement("p");
    status.className = "recording-status";
    status.setAttribute("aria-live", "polite");

    listenButton.addEventListener("click", () => {
      if (!("speechSynthesis" in window) || !("SpeechSynthesisUtterance" in window)) {
        status.textContent = "Este navegador no tiene lectura de voz disponible.";
        return;
      }
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(phrase);
      utterance.lang = "en-US";
      utterance.rate = 0.88;
      window.speechSynthesis.speak(utterance);
      status.textContent = "Escuchando la frase en inglés.";
    });

    let recorder;
    let stream;
    let chunks = [];
    recordButton.addEventListener("click", async () => {
      if (recorder?.state === "recording") {
        recorder.stop();
        recordButton.disabled = true;
        status.textContent = "Guardando tu grabación…";
        return;
      }
      if (!navigator.mediaDevices?.getUserMedia || !window.MediaRecorder) {
        status.textContent = "Este navegador no permite grabar audio aquí.";
        return;
      }
      try {
        const microphoneId = microphoneSelect.value;
        const audio = microphoneId ? { deviceId: { exact: microphoneId } } : true;
        stream = await navigator.mediaDevices.getUserMedia({ audio });
        chunks = [];
        recorder = new MediaRecorder(stream);
        recorder.addEventListener("dataavailable", (event) => {
          if (event.data.size > 0) chunks.push(event.data);
        });
        recorder.addEventListener("stop", () => {
          activeRecorders.delete(recorder);
          const audioBlob = new Blob(chunks, { type: recorder.mimeType || "audio/webm" });
          if (recording.src) URL.revokeObjectURL(recording.src);
          recording.src = URL.createObjectURL(audioBlob);
          recording.hidden = false;
          recordButton.disabled = false;
          recordButton.textContent = "🎙️ Grabar otra vez";
          status.textContent = "Grabación lista. Puedes escucharla abajo.";
          stream.getTracks().forEach((track) => track.stop());
        }, { once: true });
        recorder.start();
        activeRecorders.add(recorder);
        recordButton.textContent = "⏹️ Detener grabación";
        status.textContent = "Grabando… pulsa el botón para detener.";
      } catch (error) {
        if (error.name === "NotAllowedError") {
          status.textContent = "No se concedió permiso para usar el micrófono. Puedes permitirlo en el navegador e intentar de nuevo.";
        } else if (error.name === "OverconstrainedError" || error.name === "NotFoundError") {
          status.textContent = "Ese micrófono no está disponible. Detecta de nuevo o elige el predeterminado.";
        } else {
          status.textContent = "No se pudo iniciar la grabación. Revisa el micrófono e inténtalo de nuevo.";
        }
      }
    });

    controls.append(listenButton, recordButton, recording, status);
    details.append(controls);
  });
}

addSpeakingControls();

document.querySelector("#detect-microphones").addEventListener("click", async () => {
  const status = document.querySelector("#microphone-status");
  if (!navigator.mediaDevices?.getUserMedia || !navigator.mediaDevices?.enumerateDevices) {
    status.textContent = "Este navegador no permite seleccionar micrófonos aquí.";
    return;
  }
  status.textContent = "Solicitando acceso para mostrar los micrófonos…";
  let temporaryStream;
  try {
    temporaryStream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const available = (await navigator.mediaDevices.enumerateDevices())
      .filter((device) => device.kind === "audioinput");
    const previousValue = microphoneSelect.value;
    while (microphoneSelect.options.length > 1) microphoneSelect.remove(1);
    available.forEach((device, index) => {
      if (!device.deviceId) return;
      const option = document.createElement("option");
      option.value = device.deviceId;
      option.textContent = device.label || `Micrófono ${index + 1}`;
      microphoneSelect.append(option);
    });
    microphoneSelect.value = available.some((device) => device.deviceId === previousValue)
      ? previousValue
      : "";
    status.textContent = available.length > 0
      ? "Elige un micrófono en la lista. La selección se usará al grabar."
      : "No se encontraron micrófonos.";
  } catch (error) {
    status.textContent = error.name === "NotAllowedError"
      ? "No se concedió permiso. Permite el micrófono en el navegador para poder elegirlo."
      : "No se pudieron detectar micrófonos. Revisa la conexión del dispositivo e inténtalo de nuevo.";
  } finally {
    temporaryStream?.getTracks().forEach((track) => track.stop());
  }
});

function pauseMedia() {
  document.querySelectorAll("video, audio").forEach((player) => player.pause());
  activeRecorders.forEach((recorder) => {
    if (recorder.state === "recording") recorder.stop();
  });
  window.speechSynthesis?.cancel();
}

function showHome() {
  pauseMedia();
  document.querySelectorAll(".lesson-view").forEach((view) => { view.hidden = true; });
  homeView.hidden = false;
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function openLesson(view) {
  pauseMedia();
  homeView.hidden = true;
  document.querySelectorAll(".lesson-view").forEach((lesson) => { lesson.hidden = true; });
  view.hidden = false;
  window.scrollTo({ top: 0, behavior: "smooth" });
}

document.querySelector("#grammar-button").addEventListener("click", () => openLesson(grammarView));
document.querySelector("#listening-button").addEventListener("click", () => openLesson(listeningView));
document.querySelector("#reading-button").addEventListener("click", () => openLesson(readingView));
document.querySelector("#vocab-button").addEventListener("click", () => openLesson(vocabularyView));
document.querySelector("#speaking-button").addEventListener("click", () => openLesson(speakingView));

const gameSets = {
  easy: {
    label: "Easy",
    questions: [
      { word: "journey", answer: "viaje", options: ["viaje", "ventana", "comida"], sentence: "Our journey to the beach was fun.", translation: "Nuestro viaje a la playa fue divertido." },
      { word: "crowded", answer: "lleno de gente", options: ["tranquilo", "lleno de gente", "temprano"], sentence: "The bus is crowded this morning.", translation: "El bus está lleno de gente esta mañana." },
      { word: "borrow", answer: "pedir prestado", options: ["preparar", "devolver", "pedir prestado"], sentence: "Can I borrow your pen?", translation: "¿Me prestas tu bolígrafo?" },
      { word: "neighbour", answer: "vecino", options: ["vecino", "maestro", "hermano"], sentence: "My neighbour has a friendly dog.", translation: "Mi vecino tiene un perro amigable." },
      { word: "improve", answer: "mejorar", options: ["olvidar", "mejorar", "preguntar"], sentence: "I practice every day to improve my English.", translation: "Practico todos los días para mejorar mi inglés." },
    ],
  },
  medium: {
    label: "Medium",
    questions: [
      { word: "reliable", answer: "confiable", options: ["confiable", "ruidoso", "confundido"], sentence: "This is a reliable car.", translation: "Este es un auto confiable." },
      { word: "avoid", answer: "evitar", options: ["aceptar", "evitar", "reparar"], sentence: "I avoid checking my phone while studying.", translation: "Evito revisar mi teléfono mientras estudio." },
      { word: "affordable", answer: "asequible", options: ["puntual", "asequible", "desordenado"], sentence: "We found an affordable hotel near the station.", translation: "Encontramos un hotel asequible cerca de la estación." },
      { word: "figure out", answer: "averiguar", options: ["averiguar", "posponer", "desaparecer"], sentence: "I need to figure out how this app works.", translation: "Necesito averiguar cómo funciona esta aplicación." },
      { word: "eventually", answer: "finalmente", options: ["raramente", "cuidadosamente", "finalmente"], sentence: "She practiced a lot and eventually passed the exam.", translation: "Practicó mucho y finalmente aprobó el examen." },
    ],
  },
  advanced: {
    label: "Advanced",
    questions: [
      { word: "under the weather", answer: "sentirse indispuesto", options: ["sentirse indispuesto", "estar en el extranjero", "estar muy emocionado"], sentence: "I’m feeling under the weather today.", translation: "Hoy me siento indispuesto." },
      { word: "run out of", answer: "quedarse sin", options: ["quedarse sin", "volver a encontrar", "encargarse de"], sentence: "We ran out of milk, so I went to the store.", translation: "Nos quedamos sin leche, así que fui a la tienda." },
      { word: "hit the road", answer: "ponerse en camino", options: ["ponerse en camino", "chocar con algo", "perderse en la carretera"], sentence: "We should hit the road before sunrise.", translation: "Deberíamos ponernos en camino antes del amanecer." },
      { word: "overlook", answer: "pasar por alto", options: ["revisar con cuidado", "pasar por alto", "posponer"], sentence: "I overlooked a small mistake in the report.", translation: "Pasé por alto un pequeño error en el informe." },
      { word: "bring up a topic", answer: "mencionar un tema", options: ["cambiar de tema", "mencionar un tema", "escribir un resumen"], sentence: "She brought up an interesting topic during class.", translation: "Ella mencionó un tema interesante durante la clase." },
    ],
  },
};
let selectedGameLevel = "easy";
let gameRounds = gameSets.easy.questions;
const gameWord = document.querySelector("#game-word");
const gameProgress = document.querySelector("#game-progress");
const gameOptions = document.querySelector("#game-options");
const gameFeedback = document.querySelector("#game-feedback");
const gameExample = document.querySelector("#game-example");
const gameExampleSentence = document.querySelector("#game-example-sentence");
const gameExampleTranslation = document.querySelector("#game-example-translation");
const nextQuestionButton = document.querySelector("#next-question");
const gameLevelPicker = document.querySelector("#game-levels");
const gameCard = document.querySelector("#game-card");
let gameIndex = 0;
let gameScore = 0;
let gameAnswered = false;
let gameFinished = false;

function renderGameRound() {
  window.speechSynthesis?.cancel();
  gameOptions.replaceChildren();
  gameFeedback.textContent = "";
  gameExample.hidden = true;
  gameAnswered = false;
  if (gameIndex >= gameRounds.length) {
    gameFinished = true;
    gameProgress.textContent = `${gameSets[selectedGameLevel].label} · Reto terminado`;
    gameWord.textContent = `Your score: ${gameScore} / ${gameRounds.length}`;
    gameFeedback.textContent = "¡Buen trabajo! ¿Quieres intentarlo otra vez?";
    nextQuestionButton.textContent = "Jugar otra vez";
    nextQuestionButton.disabled = false;
    return;
  }

  gameFinished = false;
  const round = gameRounds[gameIndex];
  gameProgress.textContent = `${gameSets[selectedGameLevel].label} · Pregunta ${gameIndex + 1} de ${gameRounds.length}`;
  gameWord.textContent = round.word;
  nextQuestionButton.textContent = gameIndex === gameRounds.length - 1 ? "Ver resultado" : "Siguiente";
  nextQuestionButton.disabled = true;
  round.options.forEach((option) => {
    const answerButton = document.createElement("button");
    answerButton.type = "button";
    answerButton.className = "game-option";
    answerButton.textContent = option;
    answerButton.addEventListener("click", () => {
      if (gameAnswered) return;
      gameAnswered = true;
      const correct = option === round.answer;
      if (correct) gameScore++;
      gameFeedback.textContent = correct
        ? "✅ Correct! ¡Correcto!"
        : `❌ The correct answer is “${round.answer}”. La respuesta correcta es “${round.answer}”.`;
      gameExampleSentence.textContent = round.sentence;
      gameExampleTranslation.textContent = round.translation;
      gameExample.hidden = false;
      gameOptions.querySelectorAll("button").forEach((button) => { button.disabled = true; });
      answerButton.classList.add(correct ? "game-correct" : "game-wrong");
      nextQuestionButton.disabled = false;
    });
    gameOptions.append(answerButton);
  });
}

function selectGameLevel(level) {
  selectedGameLevel = level;
  gameRounds = gameSets[level].questions;
  gameIndex = 0;
  gameScore = 0;
  renderGameRound();
  gameLevelPicker.hidden = true;
  gameCard.hidden = false;
}

function returnToGameLevels() {
  gameLevelPicker.hidden = false;
  gameCard.hidden = true;
}

document.querySelector("#open-games").addEventListener("click", () => {
  returnToGameLevels();
  openLesson(gamesView);
});

document.querySelectorAll("[data-level]").forEach((button) => {
  button.addEventListener("click", () => selectGameLevel(button.dataset.level));
});

document.querySelector("#change-level").addEventListener("click", returnToGameLevels);

nextQuestionButton.addEventListener("click", () => {
  if (gameFinished) {
    gameIndex = 0;
    gameScore = 0;
  } else {
    gameIndex++;
  }
  renderGameRound();
});

document.querySelector("#play-game-sentence").addEventListener("click", () => {
  if (!("speechSynthesis" in window) || !("SpeechSynthesisUtterance" in window)) {
    gameFeedback.textContent = "Este navegador no tiene lectura de voz disponible.";
    return;
  }
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(gameExampleSentence.textContent);
  utterance.lang = "en-US";
  utterance.rate = 0.88;
  window.speechSynthesis.speak(utterance);
});

document.querySelectorAll(".interactive-quiz").forEach((quiz) => {
  quiz.addEventListener("submit", (event) => {
    event.preventDefault();
    const questions = [...quiz.querySelectorAll(".quiz-question")];
    const unanswered = questions.find((question) => !question.querySelector("input:checked"));
    const result = quiz.querySelector(".quiz-result");
    if (unanswered) {
      result.textContent = "Responde todas las preguntas antes de revisar el quiz.";
      return;
    }

    let score = 0;
    questions.forEach((question) => {
      const selected = question.querySelector("input:checked").value;
      const correct = selected === question.dataset.answer;
      if (correct) score++;
      question.classList.toggle("is-correct", correct);
      question.classList.toggle("is-incorrect", !correct);
      const feedback = question.querySelector(".quiz-feedback");
      feedback.textContent = correct
        ? `Correcto. ${question.dataset.explanation}`
        : `La respuesta correcta es “${question.dataset.answer}”. ${question.dataset.explanation}`;
    });
    result.textContent = `Tu resultado: ${score} de ${questions.length}.`;
  });

  quiz.addEventListener("reset", () => {
    quiz.querySelectorAll(".quiz-question").forEach((question) => {
      question.classList.remove("is-correct", "is-incorrect");
      question.querySelector(".quiz-feedback").textContent = "";
    });
    quiz.querySelector(".quiz-result").textContent = "";
  });
});

document.querySelector("#back-home").addEventListener("click", showHome);
document.querySelectorAll("[data-home]").forEach((button) => button.addEventListener("click", showHome));

// Traducciones
const translations = {
    es: {
        title: "Test de Conocimientos",
        selectTopic: "Selecciona un tema para empezar:",
        nextButton: "Siguiente Pregunta",
        prevButton: "Pregunta Anterior",
        correctFeedback: "¡Respuesta correcta! ✅",
        incorrectFeedback: "Respuesta incorrecta. La correcta es: ",
        resultsTitle: "Resultados",
        scoreText: (score, total) => `Has acertado ${score} de ${total} preguntas.`,
        progressText: (done, total) => `Progreso: ${done} de ${total} preguntas completadas`,
        restartButton: "Volver a Empezar",
        homeButtonQuiz: "Volver al Inicio",
        homeButtonResults: "Volver al Inicio",
        examTitle: "Exámenes",
        casoTitle: "Casos",
        jumpLabel: "Ir a pregunta:"
    },
    zh: {
        title: "知识测试",
        selectTopic: "请选择一个主题：",
        nextButton: "下一题",
        prevButton: "上一题",
        correctFeedback: "答案正确！✅",
        incorrectFeedback: "答案错误。正确答案是：",
        resultsTitle: "结果",
        scoreText: (score, total) => `你答对了 ${score} 题，总共 ${total} 题。`,
        progressText: (done, total) => `进度: 已完成 ${done} / ${total} 题`,
        restartButton: "重新开始",
        homeButtonQuiz: "返回主页",
        homeButtonResults: "返回主页",
        examTitle: "考试",
        casoTitle: "案例",
        jumpLabel: "跳到题目:"
    }
};

// Variables
let examenes = [];
let casos = [];
let currentQuestions = [];
let currentQuestionIndex = 0;
let score = 0;
let currentLanguage = 'es';
let currentTema = null;
let mostrarRespuestasDirectas = false; // false = Test, true = Ver Respuestas

// Elementos DOM
const mainTitle = document.getElementById('main-title');
const topicsContainer = document.getElementById('topics-container');
const topicButtonsContainer = document.getElementById('topic-buttons-container');
const quizContainer = document.getElementById('quiz-container');
const questionText = document.getElementById('question-text');
const optionsContainer = document.getElementById('options-container');
const feedback = document.getElementById('feedback');
const nextButton = document.getElementById('next-button');
const prevButton = document.getElementById('prev-button');
const progressText = document.getElementById('progress-text');
const resultsContainer = document.getElementById('results-container');
const resultsTitle = document.getElementById('results-title');
const scoreText = document.getElementById('score-text');
const restartButton = document.getElementById('restart-button');
const homeButtonQuiz = document.getElementById('home-button-quiz');
const homeButtonResults = document.getElementById('home-button-results');
const modeContainer = document.getElementById('mode-container');
const modoTestBtn = document.getElementById('modo-test');
const modoRespuestasBtn = document.getElementById('modo-respuestas');
const volverModosBtn = document.getElementById('volver-modos');

// Contenedor para botones numerados
let jumpContainer = document.createElement("div");
jumpContainer.id = "jump-container";
jumpContainer.style.marginTop = "15px";
quizContainer.appendChild(jumpContainer);

// --- Funciones ---

function setLanguage(lang) {
    currentLanguage = lang;
    mainTitle.textContent = translations[lang].title;
    updateTopicsTitles();
    nextButton.textContent = translations[lang].nextButton;
    prevButton.textContent = translations[lang].prevButton;
    resultsTitle.textContent = translations[lang].resultsTitle;
    restartButton.textContent = translations[lang].restartButton;
    homeButtonQuiz.textContent = translations[lang].homeButtonQuiz;
    homeButtonResults.textContent = translations[lang].homeButtonResults;
    updateProgressText();
    if (!quizContainer.classList.contains('hidden')) showQuestion();
    if (!resultsContainer.classList.contains('hidden')) updateResultsText();
}

function updateTopicsTitles() {
    const examTitle = document.querySelector('#topic-buttons-container h3.examen');
    const casoTitle = document.querySelector('#topic-buttons-container h3.caso');
    if (examTitle) examTitle.textContent = translations[currentLanguage].examTitle;
    if (casoTitle) casoTitle.textContent = translations[currentLanguage].casoTitle;
}

async function cargarTodosTemas() {
    try {
        const respIndexExamen = await fetch('No_Traducido/index.json');
        const archivosExamen = await respIndexExamen.json();
        examenes = [];
        for (const archivo of archivosExamen) {
            const respTema = await fetch(`No_Traducido/${archivo}`);
            const data = await respTema.json();
            examenes.push(data);
        }

        const respIndexCasos = await fetch('No_Traducido_casos/index.json');
        const archivosCasos = await respIndexCasos.json();
        casos = [];
        for (const archivo of archivosCasos) {
            const respCaso = await fetch(`No_Traducido_casos/${archivo}`);
            const data = await respCaso.json();
            casos.push(data);
        }

        loadTopics();
    } catch (error) {
        console.error("Error cargando temas o casos:", error);
    }
}

function loadTopics() {
    topicButtonsContainer.innerHTML = '';

    // Exámenes
    const examTitle = document.createElement('h3');
    examTitle.classList.add('examen');
    examTitle.textContent = translations[currentLanguage].examTitle;
    topicButtonsContainer.appendChild(examTitle);

    examenes.forEach(t => {
        const progresoTest = JSON.parse(localStorage.getItem(`progreso_${t.tema}_test`)) || {respuestas:{}};
        const progresoVer = JSON.parse(localStorage.getItem(`progreso_${t.tema}_ver`)) || {respuestas:{}};
        const doneCount = mostrarRespuestasDirectas ? Object.keys(progresoVer.respuestas).length : Object.keys(progresoTest.respuestas).length;
        const button = document.createElement('button');
        button.textContent = `${t.tema} (${doneCount} de ${t.preguntas.length})`;
        button.classList.add('option-button');
        button.onclick = () => startQuizArchivo(t);
        topicButtonsContainer.appendChild(button);
    });

    // Casos
    const casoTitle = document.createElement('h3');
    casoTitle.classList.add('caso');
    casoTitle.textContent = translations[currentLanguage].casoTitle;
    topicButtonsContainer.appendChild(casoTitle);

    casos.forEach(t => {
        const progresoTest = JSON.parse(localStorage.getItem(`progreso_${t.tema}_test`)) || {respuestas:{}};
        const progresoVer = JSON.parse(localStorage.getItem(`progreso_${t.tema}_ver`)) || {respuestas:{}};
        const doneCount = mostrarRespuestasDirectas ? Object.keys(progresoVer.respuestas).length : Object.keys(progresoTest.respuestas).length;
        const button = document.createElement('button');
        button.textContent = `${t.tema} (${doneCount} de ${t.preguntas.length})`;
        button.classList.add('option-button');
        button.onclick = () => startQuizArchivo(t);
        topicButtonsContainer.appendChild(button);
    });
}

function startQuizArchivo(temaObj) {
    currentTema = temaObj.tema;
    currentQuestions = temaObj.preguntas;

    const storageKey = mostrarRespuestasDirectas ? `progreso_${currentTema}_ver` : `progreso_${currentTema}_test`;
    const progreso = JSON.parse(localStorage.getItem(storageKey)) || {respuestas:{}, currentIndex:0, score:0};

    currentQuestionIndex = progreso.currentIndex || 0;
    score = progreso.score || 0;

    topicsContainer.classList.add('hidden');
    quizContainer.classList.remove('hidden');
    resultsContainer.classList.add('hidden');

    showQuestion();
    updateProgressText();
}

// Guardar progreso
function saveProgress(option = null) {
    const storageKey = mostrarRespuestasDirectas ? `progreso_${currentTema}_ver` : `progreso_${currentTema}_test`;
    const progreso = JSON.parse(localStorage.getItem(storageKey)) || {respuestas:{}, score:0, currentIndex:0};

    if (option !== null && !mostrarRespuestasDirectas) {
        progreso.respuestas[currentQuestionIndex] = option;
        if (option === currentQuestions[currentQuestionIndex].solucion) {
            progreso.score = (progreso.score || 0) + 1;
        }
    } else if (mostrarRespuestasDirectas) {
        progreso.respuestas[currentQuestionIndex] = "vista";
    }

    progreso.currentIndex = currentQuestionIndex;
    localStorage.setItem(storageKey, JSON.stringify(progreso));
}

// Mostrar pregunta
function showQuestion() {
    optionsContainer.innerHTML = '';
    feedback.textContent = '';

    saveProgress(); // marca vista

    const question = currentQuestions[currentQuestionIndex];
    questionText.textContent = question.pregunta;

    for (const option in question.opciones) {
        const value = question.opciones[option];
        const div = document.createElement('div');
        div.classList.add('option-button');
        div.style.marginBottom = '8px';

        if (typeof value === 'string') {
            div.textContent = `${option}: ${value}`;
            if (mostrarRespuestasDirectas && option === question.solucion) div.classList.add('correct');
            if (!mostrarRespuestasDirectas) {
                div.addEventListener('click', () => {
                    handleAnswer(option, question);
                    renderJumpButtons();
                });
            }
        } else {
            // Subopciones (casos)
            const bloqueDiv = document.createElement('div');
            bloqueDiv.style.border = "1px solid #ccc";
            bloqueDiv.style.padding = "8px";
            bloqueDiv.style.marginBottom = "10px";

            const titulo = document.createElement('strong');
            titulo.textContent = `Bloque ${option}`;
            bloqueDiv.appendChild(titulo);

            for (const subKey in value) {
                const subDiv = document.createElement('div');
                subDiv.classList.add('option-button');
                subDiv.style.margin = "4px";
                subDiv.textContent = `${subKey}: ${value[subKey]}`;

                if (mostrarRespuestasDirectas && option === question.solucion) {
                    subDiv.classList.add('correct');
                }

                if (!mostrarRespuestasDirectas) {
                    subDiv.addEventListener('click', () => {
                        handleAnswer(option, question);
                        renderJumpButtons();
                    });
                }

                bloqueDiv.appendChild(subDiv);
            }

            optionsContainer.appendChild(bloqueDiv);
        }

        optionsContainer.appendChild(div);
    }

    prevButton.classList.toggle('hidden', currentQuestionIndex === 0);
    nextButton.classList.remove('hidden');
    updateProgressText();
    renderJumpButtons();
}

// Manejar respuesta
function handleAnswer(option, question) {
    const botones = Array.from(optionsContainer.querySelectorAll(".option-button"));
    botones.forEach(b => b.style.pointerEvents = 'none');

    if (option === question.solucion) {
        feedback.textContent = translations[currentLanguage].correctFeedback;
        score++;
    } else {
        feedback.textContent = translations[currentLanguage].incorrectFeedback + question.solucion;
        const botonCorrecto = botones.find(b => b.textContent.startsWith(question.solucion + ":"));
        if (botonCorrecto) botonCorrecto.classList.add('correct');
    }

    const botonElegido = botones.find(b => b.textContent.startsWith(option + ":"));
    if (botonElegido && option !== question.solucion) botonElegido.classList.add('incorrect');

    saveProgress(option);
}

// Botones jump
function renderJumpButtons() {
    jumpContainer.innerHTML = `<p><strong>${translations[currentLanguage].jumpLabel}</strong></p>`;
    currentQuestions.forEach((q, index) => {
        const numBtn = document.createElement("button");
        numBtn.textContent = index + 1;
        numBtn.style.margin = "2px";
        if (index === currentQuestionIndex) numBtn.style.backgroundColor = "#28a745";
        numBtn.onclick = () => {
            currentQuestionIndex = index;
            showQuestion();
        };
        jumpContainer.appendChild(numBtn);
    });
}

// Siguiente/Anterior
nextButton.addEventListener('click', () => {
    if (currentQuestionIndex < currentQuestions.length - 1) {
        currentQuestionIndex++;
        showQuestion();
    } else {
        showResults();
    }
});
prevButton.addEventListener('click', () => {
    if (currentQuestionIndex > 0) {
        currentQuestionIndex--;
        showQuestion();
    }
});

// Progreso
function updateProgressText() {
    if (!currentQuestions.length) return;
    const storageKey = mostrarRespuestasDirectas ? `progreso_${currentTema}_ver` : `progreso_${currentTema}_test`;
    const progreso = JSON.parse(localStorage.getItem(storageKey)) || {respuestas:{}};
    const doneCount = Object.keys(progreso.respuestas).length;
    progressText.textContent = translations[currentLanguage].progressText(doneCount, currentQuestions.length);
}

// Resultados
function showResults() {
    quizContainer.classList.add('hidden');
    resultsContainer.classList.remove('hidden');
    updateResultsText();
}
function updateResultsText() {
    scoreText.textContent = translations[currentLanguage].scoreText(score, currentQuestions.length);
}

// Botones inicio/restart
restartButton.addEventListener('click', () => {
    const key = mostrarRespuestasDirectas ? `progreso_${currentTema}_ver` : `progreso_${currentTema}_test`;
    localStorage.removeItem(key);
    resultsContainer.classList.add('hidden');
    topicsContainer.classList.remove('hidden');
    loadTopics();
});
homeButtonQuiz.addEventListener('click', () => {
    quizContainer.classList.add('hidden');
    topicsContainer.classList.remove('hidden');
    loadTopics();
});
homeButtonResults.addEventListener('click', () => {
    resultsContainer.classList.add('hidden');
    topicsContainer.classList.remove('hidden');
    loadTopics();
});

// Modo botones
modoTestBtn.addEventListener('click', () => {
    mostrarRespuestasDirectas = false;
    modeContainer.classList.add('hidden');
    topicsContainer.classList.remove('hidden');
    loadTopics();
});
modoRespuestasBtn.addEventListener('click', () => {
    mostrarRespuestasDirectas = true;
    modeContainer.classList.add('hidden');
    topicsContainer.classList.remove('hidden');
    loadTopics();
});
volverModosBtn.addEventListener('click', () => {
    topicsContainer.classList.add('hidden');
    modeContainer.classList.remove('hidden');
});

// Inicialización
window.onload = () => {
    cargarTodosTemas();
    setLanguage('es');
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('sw.js')
            .then(() => console.log('Service Worker registrado'))
            .catch(err => console.error('Error SW:', err));
    }
};

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

// Variables globales
let examenes = [], casos = [], currentQuestions = [];
let currentQuestionIndex = 0, score = 0;
let currentLanguage = 'es', currentTema = null;
let mostrarRespuestasDirectas = false;

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

let jumpContainer = document.createElement("div");
jumpContainer.id = "jump-container";
jumpContainer.style.marginTop = "15px";
quizContainer.appendChild(jumpContainer);

// Cambiar idioma
function setLanguage(lang) {
    currentLanguage = lang;
    mainTitle.textContent = translations[lang].title;
    const selectTopic = document.getElementById('select-topic');
    if (selectTopic) selectTopic.textContent = translations[lang].selectTopic;
    nextButton.textContent = translations[lang].nextButton;
    prevButton.textContent = translations[lang].prevButton;
    resultsTitle.textContent = translations[lang].resultsTitle;
    restartButton.textContent = translations[lang].restartButton;
    homeButtonQuiz.textContent = translations[lang].homeButtonQuiz;
    homeButtonResults.textContent = translations[lang].homeButtonResults;
    updateTopicsTitles();
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

// Cargar todos los temas y casos
async function cargarTodosTemas() {
    try {
        // Exámenes
        const respIndexExamen = await fetch('No_Traducido/index.json');
        const archivosExamen = await respIndexExamen.json();
        examenes = [];
        for (const archivo of archivosExamen) {
            const respTema = await fetch(`No_Traducido/${archivo}`);
            examenes.push(await respTema.json());
        }

        // Casos
        const respIndexCasos = await fetch('No_Traducido_casos/index.json');
        const archivosCasos = await respIndexCasos.json();
        casos = [];
        for (const archivo of archivosCasos) {
            const respCaso = await fetch(`No_Traducido_casos/${archivo}`);
            casos.push(await respCaso.json());
        }

        loadTopics();
    } catch (error) {
        console.error("Error cargando temas o casos:", error);
    }
}

// Mostrar botones de temas y casos
function loadTopics() {
    topicButtonsContainer.innerHTML = '';

    // Exámenes
    const examTitle = document.createElement('h3');
    examTitle.classList.add('examen');
    examTitle.textContent = translations[currentLanguage].examTitle;
    topicButtonsContainer.appendChild(examTitle);

    examenes.forEach(t => {
        const progreso = JSON.parse(localStorage.getItem(`progreso_${t.tema}_test`)) || {currentIndex:0, score:0, respuestas:{}};
        const respondidas = Object.keys(progreso.respuestas).length;

        const button = document.createElement('button');
        // Cambiado aquí para mostrar total de preguntas
        button.textContent = `${t.tema}: ${respondidas} de ${t.preguntas.length} respondidas`;
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
        const progreso = JSON.parse(localStorage.getItem(`progreso_${t.tema}_test`)) || {currentIndex:0, score:0, respuestas:{}};
        const respondidas = Object.keys(progreso.respuestas).length;

        const button = document.createElement('button');
        button.textContent = `${t.tema}: ${respondidas} de ${t.preguntas.length} respondidas`;
        button.classList.add('option-button');
        button.onclick = () => startQuizArchivo(t);
        topicButtonsContainer.appendChild(button);
    });
}

// Iniciar quiz/caso
function startQuizArchivo(temaObj) {
    currentTema = temaObj.tema;
    currentQuestions = temaObj.preguntas;

    // Elegir la clave según modo
    const key = mostrarRespuestasDirectas ? `progreso_${currentTema}_respuestas` : `progreso_${currentTema}_test`;

    // Cargar progreso guardado
    let progreso = JSON.parse(localStorage.getItem(key)) || {currentIndex:0, score:0, respuestas:{}};
    
    // SOLO EN MODO RESPUESTAS, inicializa currentQuestionIndex en 0 si no existe
    if (mostrarRespuestasDirectas && typeof progreso.currentIndex === 'undefined') progreso.currentIndex = 0;

    currentQuestionIndex = progreso.currentIndex || 0;
    score = progreso.score || 0;

    topicsContainer.classList.add('hidden');
    quizContainer.classList.remove('hidden');
    resultsContainer.classList.add('hidden');

    showQuestion();
    updateProgressText();

    // Guardar progreso inicial (para mantener el índice de respuesta)
    progreso.currentIndex = currentQuestionIndex;
    progreso.score = score;
    localStorage.setItem(key, JSON.stringify(progreso));
}


// Función para marcar tema como visto
function marcarVisto(tema) {
    let globalProgreso = JSON.parse(localStorage.getItem("globalProgreso")) || {vistos:{}, completados:{}};
    globalProgreso.vistos[tema] = true;
    localStorage.setItem("globalProgreso", JSON.stringify(globalProgreso));
}

// Obtener progreso global
function getGlobalProgress() {
    return JSON.parse(localStorage.getItem("globalProgreso")) || {vistos:{}, completados:{}};
}

// Actualizar progreso
function updateProgressText() {
    if (currentQuestions.length > 0) {
        progressText.textContent = translations[currentLanguage].progressText(currentQuestionIndex + 1, currentQuestions.length);
    }
}

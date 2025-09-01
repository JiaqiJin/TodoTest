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
        casoTitle: "Casos"
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
        casoTitle: "案例"
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

// Cambiar idioma
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

// Cargar todos los temas y casos
async function cargarTodosTemas() {
    try {
        // Exámenes
        const respIndexExamen = await fetch('No_Traducido/index.json');
        const archivosExamen = await respIndexExamen.json();
        examenes = [];
        for (const archivo of archivosExamen) {
            const respTema = await fetch(`No_Traducido/${archivo}`);
            const data = await respTema.json();
            examenes.push(data);
        }

        // Casos
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

// Mostrar botones de temas y casos
function loadTopics() {
    topicButtonsContainer.innerHTML = '';

    // Título Exámenes
    const examTitle = document.createElement('h3');
    examTitle.classList.add('examen');
    examTitle.textContent = translations[currentLanguage].examTitle;
    topicButtonsContainer.appendChild(examTitle);

    examenes.forEach(t => {
        const progreso = JSON.parse(localStorage.getItem(`progreso_${t.tema}`)) || {currentIndex:0, score:0, respuestas:{}};
        const button = document.createElement('button');
        button.textContent = `${t.tema} (${progreso.currentIndex + 1} de ${t.preguntas.length})`;
        button.classList.add('option-button');
        button.onclick = () => startQuizArchivo(t);
        topicButtonsContainer.appendChild(button);
    });

    // Título Casos
    const casoTitle = document.createElement('h3');
    casoTitle.classList.add('caso');
    casoTitle.textContent = translations[currentLanguage].casoTitle;
    topicButtonsContainer.appendChild(casoTitle);

    casos.forEach(t => {
        const progreso = JSON.parse(localStorage.getItem(`progreso_${t.tema}`)) || {currentIndex:0, score:0, respuestas:{}};
        const button = document.createElement('button');
        button.textContent = `${t.tema} (${progreso.currentIndex + 1} de ${t.preguntas.length})`;
        button.classList.add('option-button');
        button.onclick = () => startQuizArchivo(t);
        topicButtonsContainer.appendChild(button);
    });
}

// Iniciar quiz/caso
function startQuizArchivo(temaObj) {
    currentTema = temaObj.tema;
    currentQuestions = temaObj.preguntas;

    let progreso = JSON.parse(localStorage.getItem(`progreso_${currentTema}`)) || {currentIndex:0, score:0, respuestas:{}};
    currentQuestionIndex = progreso.currentIndex || 0;
    score = progreso.score || 0;

    topicsContainer.classList.add('hidden');
    quizContainer.classList.remove('hidden');
    resultsContainer.classList.add('hidden');

    showQuestion();
    updateProgressText();

    // Guardar índice al entrar
    progreso.currentIndex = currentQuestionIndex;
    localStorage.setItem(`progreso_${currentTema}`, JSON.stringify(progreso));
}

// Mostrar pregunta (siempre marcada la correcta)
function showQuestion() {
    optionsContainer.innerHTML = '';
    feedback.textContent = '';

    const question = currentQuestions[currentQuestionIndex];
    questionText.textContent = question.pregunta;

    for (const option in question.opciones) {
        const button = document.createElement('div');
        button.classList.add('option-button');
        button.style.marginBottom = '8px';
        button.textContent = `${option}: ${question.opciones[option]}`;

        // Marcar la correcta en verde automáticamente
        if (option === question.solucion) {
            button.classList.add('correct');
        } else {
            button.classList.add('disabled-option'); // gris para no seleccionables
        }

        optionsContainer.appendChild(button);
    }

    prevButton.classList.toggle('hidden', currentQuestionIndex === 0);
    nextButton.classList.remove('hidden');
    updateProgressText();

    // Guardar progreso actual
    let progreso = JSON.parse(localStorage.getItem(`progreso_${currentTema}`)) || {respuestas:{}};
    progreso.currentIndex = currentQuestionIndex;
    progreso.score = score;
    localStorage.setItem(`progreso_${currentTema}`, JSON.stringify(progreso));
}

// Botones siguiente/anterior
nextButton.addEventListener('click', () => {
    if (currentQuestionIndex < currentQuestions.length -1) {
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

// Actualizar progreso
function updateProgressText() {
    if (!currentQuestions.length) return;
    progressText.textContent = translations[currentLanguage].progressText(currentQuestionIndex + 1, currentQuestions.length);
}

// Mostrar resultados
function showResults() {
    quizContainer.classList.add('hidden');
    resultsContainer.classList.remove('hidden');
    updateResultsText();
}

// Actualizar resultados
function updateResultsText() {
    scoreText.textContent = translations[currentLanguage].scoreText(score, currentQuestions.length);
}

// Botones inicio/restart
restartButton.addEventListener('click', () => {
    localStorage.removeItem(`progreso_${currentTema}`);
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

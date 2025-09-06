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

// Nuevo contenedor para enumeraciones
let jumpContainer = document.createElement("div");
jumpContainer.id = "jump-container";
jumpContainer.style.marginTop = "15px";
quizContainer.appendChild(jumpContainer);

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
        const respIndexExamen = await fetch('test_chino/index.json');
        const archivosExamen = await respIndexExamen.json();
        examenes = [];
        for (const archivo of archivosExamen) {
            const respTema = await fetch(`test_chino/${archivo}`);
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

// Botón para volver al menú de modos
const volverModosBtn = document.getElementById('volver-modos');
volverModosBtn.addEventListener('click', () => {
    topicsContainer.classList.add('hidden');
    modeContainer.classList.remove('hidden');
});

// Variable para modo
let mostrarRespuestasDirectas = false;

// Botones de modo
const modoTestBtn = document.getElementById('modo-test');
const modoRespuestasBtn = document.getElementById('modo-respuestas');
const modeContainer = document.getElementById('mode-container');

modoTestBtn.addEventListener('click', () => {
    mostrarRespuestasDirectas = false;
    modeContainer.classList.add('hidden');
    topicsContainer.classList.remove('hidden');
});

modoRespuestasBtn.addEventListener('click', () => {
    mostrarRespuestasDirectas = true;
    modeContainer.classList.add('hidden');
    topicsContainer.classList.remove('hidden');
});

// Función para mostrar pregunta (modo test colorea según acierto)
function showQuestion() {
    optionsContainer.innerHTML = '';
    feedback.textContent = '';

    const question = currentQuestions[currentQuestionIndex];
    questionText.textContent = question.pregunta;

    for (const option in question.opciones) {
        const value = question.opciones[option];
        const div = document.createElement('div');
        div.classList.add('option-button');
        div.style.marginBottom = '8px';

        if (typeof value === "string") {
            div.textContent = `${option}: ${value}`;

            if (mostrarRespuestasDirectas) {
                if (option === question.solucion) div.classList.add('correct'); // verde
            } else {
                div.addEventListener('click', () => {
                    if (option === question.solucion) {
                        div.classList.add('correct');
                        feedback.textContent = translations[currentLanguage].correctFeedback;
                        score++;
                    } else {
                        div.classList.add('incorrect'); // rojo
                        feedback.textContent = translations[currentLanguage].incorrectFeedback + question.solucion;
                        // marcar la correcta en verde
                        const botones = Array.from(optionsContainer.querySelectorAll('.option-button'));
                        const correcta = botones.find(b => b.textContent.startsWith(question.solucion + ":"));
                        if (correcta) correcta.classList.add('correct');
                    }
                    // bloquear todas las opciones
                    Array.from(optionsContainer.querySelectorAll('.option-button')).forEach(b => b.style.pointerEvents = 'none');
                });
            }

        } else {
            // Para bloques de casos
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
                    subDiv.classList.add('correct'); // verde
                }

                if (!mostrarRespuestasDirectas) {
                    subDiv.addEventListener('click', () => {
                        if (option === question.solucion) {
                            subDiv.classList.add('correct');
                            feedback.textContent = translations[currentLanguage].correctFeedback;
                            score++;
                        } else {
                            subDiv.classList.add('incorrect');
                            feedback.textContent = translations[currentLanguage].incorrectFeedback + question.solucion;
                            // marcar bloque correcto en verde
                            Array.from(bloqueDiv.querySelectorAll('.option-button')).forEach(b => {
                                if (option === question.solucion) b.classList.add('correct');
                            });
                        }
                        // bloquear todas las opciones
                        Array.from(bloqueDiv.querySelectorAll('.option-button')).forEach(b => b.style.pointerEvents = 'none');
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

// Manejo de respuesta
function handleAnswer(option, question) {
    // Bloquear todos los botones
    const botones = Array.from(optionsContainer.querySelectorAll("button"));
    botones.forEach(b => b.classList.add("disabled"));

    // Marcar correcta en verde
    botones.forEach(b => {
        if (b.textContent.startsWith(question.solucion + ":")) {
            b.classList.add("correct");
        }
    });

    if (option === question.solucion) {
        feedback.textContent = translations[currentLanguage].correctFeedback;
        score++;
    } else {
        feedback.textContent = translations[currentLanguage].incorrectFeedback + question.solucion;

        // Marcar la que pulsó en rojo
        const botonElegido = botones.find(b => b.textContent.startsWith(option + ":"));
        if (botonElegido) botonElegido.classList.add("incorrect");
    }

    // Guardar progreso
    let progreso = JSON.parse(localStorage.getItem(`progreso_${currentTema}`)) || {respuestas:{}};
    progreso.respuestas[currentQuestionIndex] = option;
    progreso.currentIndex = currentQuestionIndex;
    progreso.score = score;
    localStorage.setItem(`progreso_${currentTema}`, JSON.stringify(progreso));
}

// Crear botones enumerados para saltar a preguntas
function renderJumpButtons() {
    jumpContainer.innerHTML = `<p><strong>${translations[currentLanguage].jumpLabel}</strong></p>`;
    currentQuestions.forEach((q, index) => {
        const numBtn = document.createElement("button");
        numBtn.textContent = index + 1;
        numBtn.style.margin = "2px";
        if (index === currentQuestionIndex) {
            numBtn.style.backgroundColor = "#28a745"; // verde si es la actual
        }
        numBtn.onclick = () => {
            currentQuestionIndex = index;
            showQuestion();
        };
        jumpContainer.appendChild(numBtn);
    });
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

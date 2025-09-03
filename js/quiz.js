import { getTranslation } from "./language.js";

let examenes = [];
let casos = [];
let currentQuestions = [];
let currentQuestionIndex = 0;
let score = 0;
let currentTema = null;
let modo = 'quiz'; // quiz o soluciones

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
const scoreText = document.getElementById('score-text');

// Enumeración de preguntas
let jumpContainer = document.createElement("div");
jumpContainer.id = "jump-container";
jumpContainer.style.marginTop = "15px";
quizContainer.appendChild(jumpContainer);

export function setModo(newModo) {
    modo = newModo;
}

export async function cargarTodosTemas() {
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

export function loadTopics() {
    topicButtonsContainer.innerHTML = '';
    // Exámenes
    const examTitle = document.createElement('h3');
    examTitle.textContent = "Exámenes";
    topicButtonsContainer.appendChild(examTitle);

    examenes.forEach(t => {
        const button = document.createElement('button');
        button.textContent = t.tema;
        button.addEventListener('click', () => startQuizArchivo(t));
        topicButtonsContainer.appendChild(button);
    });

    // Casos
    const casoTitle = document.createElement('h3');
    casoTitle.textContent = "Casos";
    topicButtonsContainer.appendChild(casoTitle);

    casos.forEach(t => {
        const button = document.createElement('button');
        button.textContent = t.tema;
        button.addEventListener('click', () => startQuizArchivo(t));
        topicButtonsContainer.appendChild(button);
    });
}

export function startQuizArchivo(temaObj) {
    currentTema = temaObj.tema;
    currentQuestions = temaObj.preguntas;
    currentQuestionIndex = 0;
    score = 0;

    topicsContainer.classList.add('hidden');
    quizContainer.classList.remove('hidden');
    resultsContainer.classList.add('hidden');

    showQuestion();
}

export function showQuestion() {
    optionsContainer.innerHTML = '';
    feedback.textContent = '';

    const question = currentQuestions[currentQuestionIndex];
    questionText.textContent = question.pregunta;

    for (const option in question.opciones) {
        const value = question.opciones[option];
        const button = document.createElement('button');
        button.classList.add('option-button');
        button.style.marginBottom = '8px';

        if (typeof value === "string") {
            button.textContent = `${option}: ${value}`;
        } else {
            // caso objeto: mostrar bloque
            button.textContent = `${option}: ${value[Object.keys(value)[0]]} ...`; 
        }

        if (modo === 'soluciones' && option === question.solucion) {
            button.style.backgroundColor = 'green';
            button.style.color = 'white';
        }

        if (modo === 'quiz') {
            button.addEventListener('click', () => handleAnswer(option, question));
        }

        optionsContainer.appendChild(button);
    }

    renderJumpButtons();
}

function handleAnswer(option, question) {
    Array.from(optionsContainer.querySelectorAll("button")).forEach(b => b.disabled = true);

    if (option === question.solucion) {
        feedback.textContent = "¡Respuesta correcta! ✅";
        score++;
    } else {
        feedback.textContent = "Respuesta incorrecta. La correcta es: " + question.solucion;
    }
}

function renderJumpButtons() {
    jumpContainer.innerHTML = '';
    currentQuestions.forEach((q, index) => {
        const btn = document.createElement('button');
        btn.textContent = index + 1;
        if (index === currentQuestionIndex) btn.style.backgroundColor = '#28a745';
        btn.addEventListener('click', () => {
            currentQuestionIndex = index;
            showQuestion();
        });
        jumpContainer.appendChild(btn);
    });
}

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

// Contenedor de saltos
let jumpContainer = document.createElement("div");
jumpContainer.id = "jump-container";
jumpContainer.style.marginTop = "15px";
quizContainer.appendChild(jumpContainer);

// --- Funciones de idioma ---
function setLanguage(lang){
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
}

// Actualizar títulos de secciones
function updateTopicsTitles(){
    const examTitle = document.querySelector('#topic-buttons-container h3.examen');
    const casoTitle = document.querySelector('#topic-buttons-container h3.caso');
    if (examTitle) examTitle.textContent = translations[currentLanguage].examTitle;
    if (casoTitle) casoTitle.textContent = translations[currentLanguage].casoTitle;
}

// --- Cargar temas y casos ---
async function cargarTodosTemas(){
    try{
        // Exámenes
        const respIndexExamen = await fetch('No_Traducido/index.json');
        const archivosExamen = await respIndexExamen.json();
        examenes = [];
        for(const archivo of archivosExamen){
            const respTema = await fetch(`No_Traducido/${archivo}`);
            examenes.push(await respTema.json());
        }

        // Casos
        const respIndexCasos = await fetch('No_Traducido_casos/index.json');
        const archivosCasos = await respIndexCasos.json();
        casos = [];
        for(const archivo of archivosCasos){
            const respCaso = await fetch(`No_Traducido_casos/${archivo}`);
            casos.push(await respCaso.json());
        }

        loadTopics();
    }catch(error){ console.error(error); }
}

// --- Mostrar botones de temas ---
function loadTopics(){
    topicButtonsContainer.innerHTML = '';

    const examTitle = document.createElement('h3');
    examTitle.classList.add('examen');
    examTitle.textContent = translations[currentLanguage].examTitle;
    topicButtonsContainer.appendChild(examTitle);

    examenes.forEach(t=>{
        const progreso = JSON.parse(localStorage.getItem(`progreso_${t.tema}`)) || {currentIndex:0, score:0};
        const btn = document.createElement('button');
        btn.textContent = `${t.tema} (${progreso.currentIndex + 1} de ${t.preguntas.length})`;
        btn.onclick = () => startQuizArchivo(t);
        topicButtonsContainer.appendChild(btn);
    });

    const casoTitle = document.createElement('h3');
    casoTitle.classList.add('caso');
    casoTitle.textContent = translations[currentLanguage].casoTitle;
    topicButtonsContainer.appendChild(casoTitle);

    casos.forEach(t=>{
        const progreso = JSON.parse(localStorage.getItem(`progreso_${t.tema}`)) || {currentIndex:0, score:0};
        const btn = document.createElement('button');
        btn.textContent = `${t.tema} (${progreso.currentIndex + 1} de ${t.preguntas.length})`;
        btn.onclick = () => startQuizArchivo(t);
        topicButtonsContainer.appendChild(btn);
    });
}

// --- Iniciar quiz ---
function startQuizArchivo(temaObj){
    currentTema = temaObj.tema;
    currentQuestions = temaObj.preguntas;
    const progreso = JSON.parse(localStorage.getItem(`progreso_${currentTema}`)) || {currentIndex:0, score:0};
    currentQuestionIndex = progreso.currentIndex;
    score = progreso.score;

    topicsContainer.classList.add('hidden');
    quizContainer.classList.remove('hidden');
    resultsContainer.classList.add('hidden');

    showQuestion();
    updateProgressText();
}

// --- Mostrar pregunta ---
function showQuestion(){
    optionsContainer.innerHTML = '';
    feedback.textContent = '';
    const question = currentQuestions[currentQuestionIndex];
    questionText.textContent = question.pregunta;

    for(const option in question.opciones){
        const value = question.opciones[option];
        const div = document.createElement('div');
        div.classList.add('option-button');
        div.style.marginBottom = '8px';

        if(typeof value === 'string'){
            div.textContent = `${option}: ${value}`;
            if(mostrarRespuestasDirectas && option === question.solucion) div.classList.add('correct');
            if(!mostrarRespuestasDirectas){
                div.addEventListener('click', ()=>{
                    if(option === question.solucion){
                        div.classList.add('correct'); feedback.textContent = translations[currentLanguage].correctFeedback; score++;
                    }else{
                        div.classList.add('incorrect'); feedback.textContent = translations[currentLanguage].incorrectFeedback + question.solucion;
                        const botones = Array.from(optionsContainer.querySelectorAll('.option-button'));
                        const correcta = botones.find(b=>b.textContent.startsWith(question.solucion + ":"));
                        if(correcta) correcta.classList.add('correct');
                    }
                    Array.from(optionsContainer.querySelectorAll('.option-button')).forEach(b=>b.style.pointerEvents='none');
                });
            }
        }
        optionsContainer.appendChild(div);
    }

    prevButton.classList.toggle('hidden', currentQuestionIndex===0);
    nextButton.classList.remove('hidden');
    updateProgressText();
    renderJumpButtons();
}

// --- Botones siguiente/anterior ---
nextButton.addEventListener('click', ()=>{
    if(currentQuestionIndex < currentQuestions.length-1){
        currentQuestionIndex++;
        showQuestion();
    }else showResults();
});
prevButton.addEventListener('click', ()=>{
    if(currentQuestionIndex>0){ currentQuestionIndex--; showQuestion(); }
});

// --- Renderizar saltos ---
function renderJumpButtons(){
    jumpContainer.innerHTML = `<p><strong>${translations[currentLanguage].jumpLabel}</strong></p>`;
    currentQuestions.forEach((q,i)=>{
        const btn = document.createElement('button');
        btn.textContent = i+1;
        btn.style.margin='2px';
        if(i===currentQuestionIndex) btn.style.backgroundColor="#28a745";
        btn.onclick = ()=>{
            currentQuestionIndex = i;
            showQuestion();
        };
        jumpContainer.appendChild(btn);
    });
}

// --- Resultados ---
function showResults(){
    quizContainer.classList.add('hidden');
    resultsContainer.classList.remove('hidden');
    scoreText.textContent = translations[currentLanguage].scoreText(score,currentQuestions.length);
}

// --- Botones menú ---
modoTestBtn.addEventListener('click', ()=>{
    mostrarRespuestasDirectas = false;
    modeContainer.classList.add('hidden');
    topicsContainer.classList.remove('hidden');
});
modoRespuestasBtn.addEventListener('click', ()=>{
    mostrarRespuestasDirectas = true;
    modeContainer.classList.add('hidden');
    topicsContainer.classList.remove('hidden');
});
volverModosBtn.addEventListener('click', ()=>{
    topicsContainer.classList.add('hidden');
    modeContainer.classList.remove('hidden');
});
restartButton.addEventListener('click', ()=>{
    localStorage.removeItem(`progreso_${currentTema}`);
    resultsContainer.classList.add('hidden');
    topicsContainer.classList.remove('hidden');
});
homeButtonQuiz.addEventListener('click', ()=>{
    quizContainer.classList.add('hidden');
    topicsContainer.classList.remove('hidden');
});
homeButtonResults.addEventListener('click', ()=>{
    resultsContainer.classList.add('hidden');
    topicsContainer.classList.remove('hidden');
});

// --- Inicialización ---
window.onload = ()=>{
    cargarTodosTemas();
    setLanguage('es');
};

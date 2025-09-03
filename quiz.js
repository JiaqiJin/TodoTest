// Modos
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
volverModosBtn.addEventListener('click', () => {
    topicsContainer.classList.add('hidden');
    modeContainer.classList.remove('hidden');
});

// Mostrar pregunta y opciones
function showQuestion() {
    optionsContainer.innerHTML = '';
    feedback.textContent = '';
    const question = currentQuestions[currentQuestionIndex];
    questionText.textContent = question.pregunta;

    // --- MARCAR PREGUNTA VISTA EN MODO VER RESPUESTAS ---
    if (mostrarRespuestasDirectas) {
        const key = `progreso_${currentTema}_respuestas`;
        let progreso = JSON.parse(localStorage.getItem(key)) || {respuestas:{}};
        progreso.respuestas[currentQuestionIndex] = question.solucion; // marcar como vista
        progreso.currentIndex = currentQuestionIndex;
        localStorage.setItem(key, JSON.stringify(progreso));
    }
    // ------------------------------------------------------

    // Mostrar opciones
    for (const option in question.opciones) {
        const value = question.opciones[option];

        if (typeof value === "string") {
            // Opciones simples
            const div = document.createElement('div');
            div.classList.add('option-button');
            div.style.marginBottom = '8px';
            div.textContent = `${option}: ${value}`;
            div.dataset.key = option;

            if (mostrarRespuestasDirectas && option === question.solucion) div.classList.add('correct');
            if (!mostrarRespuestasDirectas) div.addEventListener('click', () => handleAnswer(option, question));

            optionsContainer.appendChild(div);
        } else {
            // Opciones tipo bloque
            const bloqueDiv = document.createElement('div');
            bloqueDiv.classList.add('bloque-opciones');

            const titulo = document.createElement('strong');
            titulo.textContent = `Bloque ${option}`;
            bloqueDiv.appendChild(titulo);

            for (const subKey in value) {
                const subDiv = document.createElement('div');
                subDiv.classList.add('option-button');
                subDiv.style.margin = '4px';
                subDiv.textContent = `${subKey}: ${value[subKey]}`;
                subDiv.dataset.key = option; // dataset.key = opción principal

                if (mostrarRespuestasDirectas && option === question.solucion) {
                    subDiv.classList.add('correct');
                }

                if (!mostrarRespuestasDirectas) {
                    subDiv.addEventListener('click', () => handleAnswer(option, question));
                }

                bloqueDiv.appendChild(subDiv);
            }

            optionsContainer.appendChild(bloqueDiv);
        }
    }

    prevButton.classList.toggle('hidden', currentQuestionIndex === 0);
    nextButton.classList.remove('hidden');
    renderJumpButtons(); // actualiza botones de salto
    updateProgressText();
}


// Manejo de respuesta
function handleAnswer(option, question) {
    const botones = Array.from(optionsContainer.querySelectorAll(".option-button"));
    botones.forEach(b => b.style.pointerEvents = 'none');

    botones.forEach(b => {
        if (b.dataset.key === question.solucion) {
            b.classList.add("correct"); // Verde todas subopciones de la opción correcta
        } else if (b.dataset.key === option) {
            b.classList.add("incorrect"); // Rojo todas subopciones de la opción seleccionada incorrecta
        }
    });

    feedback.textContent = option === question.solucion
        ? translations[currentLanguage].correctFeedback
        : translations[currentLanguage].incorrectFeedback + question.solucion;

    // Guardar progreso
    const key = mostrarRespuestasDirectas ? `progreso_${currentTema}_respuestas` : `progreso_${currentTema}_test`;
    let progreso = JSON.parse(localStorage.getItem(key)) || {respuestas:{}};
    progreso.respuestas[currentQuestionIndex] = option;
    progreso.currentIndex = currentQuestionIndex;
    if(option === question.solucion) score++;
    progreso.score = score;
    localStorage.setItem(key, JSON.stringify(progreso));
}

// Navegación
nextButton.addEventListener('click', () => {
    const key = mostrarRespuestasDirectas ? `progreso_${currentTema}_respuestas` : `progreso_${currentTema}_test`;
    let progreso = JSON.parse(localStorage.getItem(key)) || {respuestas:{}};

    // Guardar índice actual incluso en modo ver respuestas
    progreso.currentIndex = currentQuestionIndex;
    localStorage.setItem(key, JSON.stringify(progreso));

    if (currentQuestionIndex < currentQuestions.length - 1) {
        currentQuestionIndex++;
        showQuestion(); // Refresca pregunta y jump buttons
    } else {
        showResults();
    }
});
prevButton.addEventListener('click', () => {
    if (currentQuestionIndex > 0) currentQuestionIndex--;
    showQuestion();
});

// Resultados
function showResults() {
    quizContainer.classList.add('hidden');
    resultsContainer.classList.remove('hidden');
    updateResultsText();
}
function updateResultsText() {
    scoreText.textContent = translations[currentLanguage].scoreText(score, currentQuestions.length);
}

function renderJumpButtons() {
    jumpContainer.innerHTML = `<p><strong>${translations[currentLanguage].jumpLabel}</strong></p>`;

    const key = mostrarRespuestasDirectas ? `progreso_${currentTema}_respuestas` : `progreso_${currentTema}_test`;
    const progreso = JSON.parse(localStorage.getItem(key)) || {respuestas:{}};

    currentQuestions.forEach((q, index) => {
        const numBtn = document.createElement("button");
        numBtn.textContent = index + 1;
        numBtn.classList.add("num-button");

        // Resaltar la pregunta actual
        if (index === currentQuestionIndex) numBtn.classList.add("current");

        // Marcado según progreso guardado
        if (progreso.respuestas[index]) {
            if (mostrarRespuestasDirectas) {
                numBtn.style.backgroundColor = "#28a745"; // Verde siempre
            } else {
                if (progreso.respuestas[index] === q.solucion) numBtn.style.backgroundColor = "#28a745";
                else numBtn.style.backgroundColor = "#ff9999";
            }
        }

       numBtn.onclick = () => {
            currentQuestionIndex = index;

            // Guardar progreso incluso en modo ver respuestas
            progreso.currentIndex = currentQuestionIndex;
            localStorage.setItem(key, JSON.stringify(progreso));

            showQuestion(); // Refresca la pregunta y el jump container
        };

        jumpContainer.appendChild(numBtn);
    });
}

// Botones restart/home
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
    if ('serviceWorker' in navigator) navigator.serviceWorker.register('sw.js').then(() => console.log('SW registrado')).catch(err => console.error('Error SW:', err));
};

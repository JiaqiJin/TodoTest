export const translations = {
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

let currentLanguage = 'es';
const elements = {
    mainTitle: document.getElementById('main-title'),
    nextButton: document.getElementById('next-button'),
    prevButton: document.getElementById('prev-button'),
    resultsTitle: document.getElementById('results-title'),
    restartButton: document.getElementById('restart-button'),
    homeButtonQuiz: document.getElementById('home-button-quiz'),
    homeButtonResults: document.getElementById('home-button-results'),
    progressText: document.getElementById('progress-text')
};

export function setLanguage(lang) {
    currentLanguage = lang;
    elements.mainTitle.textContent = translations[lang].title;
    elements.nextButton.textContent = translations[lang].nextButton;
    elements.prevButton.textContent = translations[lang].prevButton;
    elements.resultsTitle.textContent = translations[lang].resultsTitle;
    elements.restartButton.textContent = translations[lang].restartButton;
    elements.homeButtonQuiz.textContent = translations[lang].homeButtonQuiz;
    elements.homeButtonResults.textContent = translations[lang].homeButtonResults;
}

export function getTranslation(key, ...args) {
    if (typeof translations[currentLanguage][key] === 'function') {
        return translations[currentLanguage][key](...args);
    }
    return translations[currentLanguage][key];
}

export { currentLanguage };

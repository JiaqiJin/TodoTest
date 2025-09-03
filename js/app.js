import { setLanguage } from "./language.js";
import { cargarTodosTemas, loadTopics, startQuizArchivo, setModo } from "./quiz.js";

// Botones de idioma
document.getElementById('btn-es').addEventListener('click', () => setLanguage('es'));
document.getElementById('btn-zh').addEventListener('click', () => setLanguage('zh'));

// Botones de modo
document.getElementById('modo-quiz').addEventListener('click', () => setModo('quiz'));
document.getElementById('modo-soluciones').addEventListener('click', () => setModo('soluciones'));

// Inicialización
window.addEventListener('load', async () => {
    await cargarTodosTemas();
});

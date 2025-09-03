export function guardarProgreso(tema, progreso) {
    localStorage.setItem(`progreso_${tema}`, JSON.stringify(progreso));
}

export function cargarProgreso(tema) {
    return JSON.parse(localStorage.getItem(`progreso_${tema}`)) || {currentIndex:0, score:0, respuestas:{}};
}

export function resetProgreso(tema) {
    localStorage.removeItem(`progreso_${tema}`);
}

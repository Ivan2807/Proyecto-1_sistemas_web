
// Módulo de validación - Solo valida los formularios

export const validatePostForm = (formData) => {
    const errors = {};

    // Validar título
    if (!formData.title || formData.title.trim().length < 5) {
        errors.title = "El título debe tener al menos 5 caracteres";
    }

    // Validar contenido (body)
    if (!formData.body || formData.body.trim().length < 20) {
        errors.body = "El contenido debe tener al menos 20 caracteres";
    }

    // Validar nombre del autor
    if (!formData.authorName || formData.authorName.trim() === "") {
        errors.authorName = "El nombre del autor es obligatorio";
    }

    return {
        isValid: Object.keys(errors).length === 0,
        errors: errors
    };
};

// Muestra mensaje de error debajo del input
export const showFieldError = (inputElement, message) => {
    let errorSpan = inputElement.nextElementSibling;
// Si no existe un span de error, lo creamos
    if (!errorSpan || !errorSpan.classList.contains('error-message')) {
        errorSpan = document.createElement('span');
        errorSpan.className = 'error-message';
        inputElement.parentNode.insertBefore(errorSpan, inputElement.nextSibling);
    }
// Mostramos el mensaje de error
    errorSpan.textContent = message;
    errorSpan.style.display = 'block';
    inputElement.classList.add('error');
};

// Limpia el mensaje de error
export const clearFieldError = (inputElement) => {
    const errorSpan = inputElement.nextElementSibling;
    // Si existe un span de error, lo eliminamos
    if (errorSpan && errorSpan.classList.contains('error-message')) {
        errorSpan.remove();
    }
    // Quitamos la clase de error del input
    inputElement.classList.remove('error');
};
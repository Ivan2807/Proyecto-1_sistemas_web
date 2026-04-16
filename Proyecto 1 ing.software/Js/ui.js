

import { showFieldError, clearFieldError } from './validation.js';

// Elementos principales
const app = document.getElementById('app');
const toastElement = document.getElementById('toast');

// Función para mostrar mensajes de toast
export const showToast = (message, type = 'success') => {
    toastElement.textContent = message;
    toastElement.className = `toast ${type}`;
    toastElement.classList.remove('hidden');

    setTimeout(() => {
        toastElement.classList.add('hidden');
    }, 3000);
};
// Renderizado de la lista de posts con filtros y paginación
export const showSkeleton = () => {
    app.innerHTML = `
        <div class="posts-container">
            ${Array(6).fill(0).map(() => `
                <div class="post-card skeleton">
                    <div class="skeleton-title"></div>
                    <div class="skeleton-text"></div>
                    <div class="skeleton-text"></div>
                    <div class="skeleton-author"></div>
                </div>
            `).join('')}
        </div>
    `;
};
// Renderizado de la lista de posts con filtros y paginación
export const renderPosts = (posts, currentPage = 1, tags = [], authors = [], query = '', selectedAuthorId = '', selectedTag = '', total = 0) => {
    const totalResults = total || posts.length;
    const hasPosts = posts.length > 0;
    const tagOptions = tags.map(tag => `
                <option value="${tag}" ${tag === selectedTag ? 'selected' : ''}>${tag}</option>
            `).join('');
    const authorOptions = authors.map(author => `
                <option value="${author.id}" ${String(author.id) === String(selectedAuthorId) ? 'selected' : ''}>
                    ${author.firstName} ${author.lastName}
                </option>
            `).join('');
// Luego aplicamos los filtros adicionales si es necesario
    let html = `
        <div class="posts-header">
            <div>
                <h1>Publicaciones del Blog</h1>
            </div>
            <button id="btn-create" class="btn-primary">Crear Nueva Publicación</button>
        </div>

        <div class="filter-bar">
            <form id="filter-form" class="filter-form">
                <input id="search-input" type="text" placeholder="Buscar por título o contenido..." value="${query}">
                <select id="author-filter">
                    <option value="">Todos los autores</option>
                    ${authorOptions}
                </select>
                <select id="tag-filter">
                    <option value="">Todos los tags</option>
                    ${tagOptions}
                </select>
                <button type="submit" class="btn-primary">Filtrar</button>
                <button type="button" id="btn-clear-filters" class="btn-secondary">Limpiar</button>
            </form>
            <div class="results-info">Mostrando ${posts.length} de ${totalResults} publicaciones</div>
        </div>

        <div class="posts-container">
    `;
// Luego aplicamos los filtros adicionales si es necesario
    if (hasPosts) {
        posts.forEach(post => {
            html += `
                <div class="post-card" data-id="${post.id}">
                    <h3>${post.title}</h3>
                    <p class="post-body">${post.body.substring(0, 120)}...</p>
                    <div class="post-meta">
                        <span class="author">Por: ${post.authorName || 'Anónimo'}</span>
                    </div>
                    <button class="btn-view" data-id="${post.id}">Ver Detalle</button>
                </div>
            `;
        });
    } else {
        html += `
            <div class="empty-state">
                <p>No se encontraron publicaciones con esos filtros.</p>
            </div>
        `;
    }
// Luego aplicamos los filtros adicionales si es necesario
    html += `</div>`;

    html += `
        <div class="pagination">
            <button id="btn-prev" ${currentPage === 1 ? 'disabled' : ''}>Anterior</button>
            <span>Página ${currentPage}</span>
            <button id="btn-next" ${currentPage * 10 >= totalResults ? 'disabled' : ''}>Siguiente</button>
        </div>
    `;

    app.innerHTML = html;
};
// Renderizado del detalle de una publicación
export const renderStats = (posts, authors = []) => {
    const totalPosts = posts.length;
    const authorCounts = authors.map(author => ({
        id: author.id,
        name: `${author.firstName} ${author.lastName}`,
        count: posts.filter(post => Number(post.userId) === Number(author.id)).length
    })).filter(author => author.count > 0).sort((a, b) => b.count - a.count);

    const tagCounts = posts.reduce((counts, post) => {
        if (Array.isArray(post.tags)) {
            post.tags.forEach(tag => {
                counts[tag] = (counts[tag] || 0) + 1;
            });
        }
        return counts;
    }, {});
// Luego aplicamos los filtros adicionales si es necesario
    const topTags = Object.entries(tagCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 8)
        .map(([tag, count]) => `<li><strong>${tag}</strong>: ${count}</li>`)
        .join('');

    const authorRows = authorCounts.slice(0, 8)
        .map(author => `<li>${author.name}: ${author.count} publicaciones</li>`)
        .join('');

    app.innerHTML = `
        <div class="stats-header">
            <div>
                <h1>Estadísticas del Blog</h1>
                <p>Sección adicional: publicaciones por autor y tags más usados.</p>
            </div>
            <button id="btn-home" class="btn-primary">Volver al listado</button>
        </div>

        <div class="stats-grid">
            <div class="stat-card">
                <h2>Total de publicaciones</h2>
                <p>${totalPosts}</p>
            </div>
            <div class="stat-card">
                <h2>Autores con más publicaciones</h2>
                <ul>${authorRows || '<li>No hay publicaciones disponibles</li>'}</ul>
            </div>
            <div class="stat-card">
                <h2>Tags más usados</h2>
                <ul>${topTags || '<li>No hay tags disponibles</li>'}</ul>
            </div>
        </div>
    `;
};

// Renderizado del detalle de una publicación
export const renderPostDetail = (post) => {
    app.innerHTML = `
        <div class="detail-container">
            <button id="btn-back" class="btn-secondary">← Volver al listado</button>

            <h1>${post.title}</h1>
            <p class="detail-author">Por: ${post.authorName}</p>

            <div class="detail-meta-grid">
                <div><strong>ID:</strong> ${post.id}</div>
                <div><strong>User ID:</strong> ${post.userId}</div>
                <div><strong>Reacciones:</strong> ${post.reactions ?? 0}</div>
                <div><strong>Tags:</strong> ${post.tags ? post.tags.join(', ') : 'Sin tags'}</div>
                <div><strong>Título:</strong> ${post.title}</div>
                <div><strong>Autor:</strong> ${post.authorName}</div>
            </div>

            <div class="detail-body">
                <p>${post.body}</p>
            </div>

            <div class="detail-actions">
                <button id="btn-edit" data-id="${post.id}" class="btn-warning">Editar</button>
                <button id="btn-delete" data-id="${post.id}" class="btn-danger">Eliminar</button>
            </div>
        </div>
    `;
};

// Renderizado del formulario de creación/edición de una publicación
export const renderPostForm = (post = null) => {
    const isEditing = post !== null;   // ← Esta era la línea que faltaba

    app.innerHTML = `
        <div class="form-container">
            <h2>${isEditing ? 'Editar Publicación' : 'Nueva Publicación'}</h2>
            
            <form id="post-form">
                <div class="form-group">
                    <label>Título</label>
                    <input type="text" id="title" value="${post ? post.title : ''}">
                </div>
                
                <div class="form-group">
                    <label>Contenido</label>
                    <textarea id="body" rows="8">${post ? post.body : ''}</textarea>
                </div>
                
                <div class="form-group">
                    <label>Nombre del Autor</label>
                    <input type="text" id="authorName" value="${post ? post.authorName : ''}">
                </div>
                
                <div class="form-actions">
                    <button type="button" id="btn-cancel" class="btn-secondary">Cancelar</button>
                    <button type="submit" class="btn-primary">
                        ${isEditing ? 'Guardar Cambios' : 'Crear Publicación'}
                    </button>
                </div>
            </form>
        </div>
    `;
};
// Función para limpiar todos los errores de validación en el formulario
export const clearAllFieldErrors = () => {
    document.querySelectorAll('.error').forEach(input => {
        clearFieldError(input);
    });
};


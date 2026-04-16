
// router.js
import { api } from './api.js';
import { 
    showSkeleton, 
    renderPosts, 
    renderStats,
    renderPostDetail, 
    renderPostForm,
    showToast,
    clearAllFieldErrors 
} from './ui.js';

import { validatePostForm, showFieldError } from './validation.js';
// Variables para mantener el estado actual de los filtros y paginación
let currentPage = 1;
let currentQuery = '';
let currentTag = '';
let currentAuthorId = '';
let availableTags = [];
let availableAuthors = [];
// Función principal para manejar la navegación entre vistas
export const navigateTo = async (view, id = null) => {
    try {
        if (view === 'list') {
            showSkeleton();
            if (!availableTags.length) {
                availableTags = await api.getTags();
            }
            if (!availableAuthors.length) {
                availableAuthors = await api.getAuthors();
            }

            const data = await api.getPosts(currentPage, 10, currentQuery, currentAuthorId, currentTag);
            renderPosts(data.posts, currentPage, availableTags, availableAuthors, currentQuery, currentAuthorId, currentTag, data.total);
            setupListListeners();
// Luego aplicamos los filtros adicionales si es necesario
        } else if (view === 'stats') {
            showSkeleton();
            if (!availableAuthors.length) {
                availableAuthors = await api.getAuthors();
            }
// Obtenemos más posts para tener estadísticas más completas (en un caso real, la API debería proporcionar endpoints específicos para estadísticas)
            const statsData = await api.getPosts(1, 150);
            renderStats(statsData.posts, availableAuthors);
            setupStatsListeners();
// Luego aplicamos los filtros adicionales si es necesario
        } else if (view === 'detail' && id) {
            showSkeleton();
            const post = await api.getPostById(id);
            renderPostDetail(post);
            setupDetailListeners(post);

        } else if (view === 'create') {
            renderPostForm();
            setupFormListeners(null);

        } else if (view === 'edit' && id) {
            showSkeleton();
            const post = await api.getPostById(id);
            renderPostForm(post);
            setupFormListeners(post);
        }

    } catch (error) {
        console.error(error);
        showToast("Error al cargar la vista: " + error.message, 'error');
    }
};
// Funciones para configurar los listeners de cada vista
function setupListListeners() {
    const btnCreate = document.getElementById('btn-create');
    if (btnCreate) btnCreate.addEventListener('click', () => navigateTo('create'));

    const filterForm = document.getElementById('filter-form');
    const searchInput = document.getElementById('search-input');
    const authorSelect = document.getElementById('author-filter');
    const tagSelect = document.getElementById('tag-filter');
    const btnClearFilters = document.getElementById('btn-clear-filters');
// Luego aplicamos los filtros adicionales si es necesario
    if (filterForm) {
        filterForm.addEventListener('submit', (e) => {
            e.preventDefault();
            currentQuery = searchInput.value.trim();
            currentAuthorId = authorSelect.value;
            currentTag = tagSelect.value;
            currentPage = 1;
            navigateTo('list');
        });
    }

    if (btnClearFilters) {
        btnClearFilters.addEventListener('click', () => {
            currentQuery = '';
            currentAuthorId = '';
            currentTag = '';
            currentPage = 1;
            navigateTo('list');
        });
    }

    document.querySelectorAll('.btn-view').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const id = e.target.getAttribute('data-id');
            navigateTo('detail', id);
        });
    });

    const btnPrev = document.getElementById('btn-prev');
    const btnNext = document.getElementById('btn-next');

    if (btnPrev) {
        btnPrev.addEventListener('click', () => {
            if (currentPage > 1) {
                currentPage--;
                navigateTo('list');
            }
        });
    }

    if (btnNext) {
        btnNext.addEventListener('click', () => {
            currentPage++;
            navigateTo('list');
        });
    }
}

function setupStatsListeners() {
    const btnHome = document.getElementById('btn-home');
    if (btnHome) {
        btnHome.addEventListener('click', () => {
            currentPage = 1;
            navigateTo('list');
        });
    }
}

function setupNavigation() {
    const navHome = document.getElementById('nav-home');
    const navStats = document.getElementById('nav-stats');

    if (navHome) {
        navHome.addEventListener('click', (e) => {
            e.preventDefault();
            currentPage = 1;
            navigateTo('list');
        });
    }

    if (navStats) {
        navStats.addEventListener('click', (e) => {
            e.preventDefault();
            navigateTo('stats');
        });
    }
}

function setupDetailListeners(post) {
    const btnBack = document.getElementById('btn-back');
    if (btnBack) btnBack.addEventListener('click', () => navigateTo('list'));

    const btnEdit = document.getElementById('btn-edit');
    if (btnEdit) btnEdit.addEventListener('click', () => navigateTo('edit', post.id));

    const btnDelete = document.getElementById('btn-delete');
    if (btnDelete) {
        btnDelete.addEventListener('click', async () => {
            if (confirm('¿Estás seguro de eliminar esta publicación?')) {
                try {
                    await api.deletePost(post.id);
                    showToast('Publicación eliminada correctamente', 'success');
                    navigateTo('list');
                } catch (error) {
                    showToast('Error al eliminar', 'error');
                }
            }
        });
    }
}

function setupFormListeners(postToEdit) {
    const form = document.getElementById('post-form');
    if (!form) return;

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const formData = {
            title: document.getElementById('title').value.trim(),
            body: document.getElementById('body').value.trim(),
            authorName: document.getElementById('authorName').value.trim()
        };

        // Validación
        const validation = validatePostForm(formData);

        if (!validation.isValid) {
            clearAllFieldErrors();

            if (validation.errors.title) showFieldError(document.getElementById('title'), validation.errors.title);
            if (validation.errors.body) showFieldError(document.getElementById('body'), validation.errors.body);
            if (validation.errors.authorName) showFieldError(document.getElementById('authorName'), validation.errors.authorName);
            return;
        }

        try {
            showToast(postToEdit ? 'Guardando cambios...' : 'Creando publicación...', 'success');

            if (postToEdit) {
                await api.updatePost(postToEdit.id, formData);
                showToast('¡Publicación actualizada!', 'success');
            } else {
                await api.createPost(formData);
                showToast('¡Publicación creada exitosamente!', 'success');
            }

            setTimeout(() => navigateTo('list'), 1400);

        } catch (error) {
            showToast('Error: ' + error.message, 'error');
        }
    });

    const btnCancel = document.getElementById('btn-cancel');
    if (btnCancel) btnCancel.addEventListener('click', () => navigateTo('list'));
}

export const initRouter = () => {
    setupNavigation();
    navigateTo('list');
};


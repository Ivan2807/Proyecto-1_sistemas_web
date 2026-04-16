const API_BASE = "https://dummyjson.com";

let userCache = new Map(); // Guardamos nombres de autores para no pedirlos muchas veces

export const api = {

    // Obtener lista de posts (con paginación)
    async getPosts(page = 1, limit = 10, query = '', authorId = '', tag = '') {
        const skip = (page - 1) * limit;

        const fetchJson = async (url, errorMessage) => {
            const res = await fetch(url);
            if (!res.ok) throw new Error(errorMessage);
            return res.json();
        };

        const slicePosts = (posts) => ({
            posts: posts.slice(skip, skip + limit),
            total: posts.length,
            skip,
            limit
        });

        let data;
        // Si no hay filtros, usamos la API normal. Si hay filtros, hacemos las llamadas necesarias y luego filtramos en frontend
        if (!query && !authorId && !tag) {
            const url = `${API_BASE}/posts?limit=${limit}&skip=${skip}`;
            data = await fetchJson(url, "Error al cargar las publicaciones");
        } else if (query && !authorId && !tag) {
            const url = `${API_BASE}/posts/search?q=${encodeURIComponent(query)}&limit=${limit}&skip=${skip}`;
            data = await fetchJson(url, "Error al buscar publicaciones");
        } else if (!query && authorId && !tag) {
            const url = `${API_BASE}/posts/user/${encodeURIComponent(authorId)}?limit=${limit}&skip=${skip}`;
            data = await fetchJson(url, "Error al cargar publicaciones del autor");
        } else if (!query && !authorId && tag) {
            const url = `${API_BASE}/posts/tag/${encodeURIComponent(tag)}?limit=${limit}&skip=${skip}`;
            data = await fetchJson(url, "Error al filtrar publicaciones por tag");
        } else {
            let posts = [];
// Si hay múltiples filtros, obtenemos los datos necesarios y luego filtramos en frontend
            if (query) {
                const url = `${API_BASE}/posts/search?q=${encodeURIComponent(query)}&limit=100&skip=0`;
                const searchData = await fetchJson(url, "Error al buscar publicaciones");
                posts = searchData.posts || [];
            } else if (authorId) {
                const url = `${API_BASE}/posts/user/${encodeURIComponent(authorId)}?limit=1000&skip=0`;
                const authorData = await fetchJson(url, "Error al cargar publicaciones del autor");
                posts = authorData.posts || [];
            } else if (tag) {
                const url = `${API_BASE}/posts/tag/${encodeURIComponent(tag)}?limit=1000&skip=0`;
                const tagData = await fetchJson(url, "Error al filtrar publicaciones por tag");
                posts = tagData.posts || [];
            }
// Luego aplicamos los filtros adicionales si es necesario
            if (authorId) {
                posts = posts.filter(post => Number(post.userId) === Number(authorId));
            }
            // El filtro por tag ya se aplicó en la llamada a la API, pero lo dejamos aquí por si acaso
            if (tag) {
                posts = posts.filter(post => post.tags && post.tags.includes(tag));
            }

            data = slicePosts(posts);
        }

        // Enriquecer cada post con el nombre del autor
        for (let post of data.posts) {
            if (!userCache.has(post.userId)) {
                try {
                    const userRes = await fetch(`${API_BASE}/users/${post.userId}`);
                    if (userRes.ok) {
                        const user = await userRes.json();
                        userCache.set(post.userId, `${user.firstName} ${user.lastName}`);
                    }
                } catch (e) {
                    userCache.set(post.userId, `Usuario ${post.userId}`);
                }
            }
            post.authorName = userCache.get(post.userId);
        }

        return data;
    },
// Obtener lista de tags y autores para filtros y estadísticas
    async getTags() {
        const res = await fetch(`${API_BASE}/posts/tags`);
        if (!res.ok) throw new Error("Error al cargar los tags");
        const data = await res.json();
        return data.tags || [];
    },
// Obtener lista de autores para filtros y estadísticas
    async getAuthors() {
        const res = await fetch(`${API_BASE}/users?limit=100`);
        if (!res.ok) throw new Error("Error al cargar los autores");
        const data = await res.json();
        return data.users || [];
    },

    // Obtener un solo post por ID
    async getPostById(id) {
        const res = await fetch(`${API_BASE}/posts/${id}`);
        if (!res.ok) throw new Error("No se encontró la publicación");

        const post = await res.json();

        // Añadir nombre del autor
        if (!userCache.has(post.userId)) {
            try {
                const userRes = await fetch(`${API_BASE}/users/${post.userId}`);
                if (userRes.ok) {
                    const user = await userRes.json();
                    userCache.set(post.userId, `${user.firstName} ${user.lastName}`);
                }
            } catch (e) {
                userCache.set(post.userId, `Usuario ${post.userId}`);
            }
        }
        post.authorName = userCache.get(post.userId);

        return post;
    },

    // Crear nuevo post
    async createPost(postData) {
        const res = await fetch(`${API_BASE}/posts/add`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                title: postData.title,
                body: postData.body,
                userId: 5   // DummyJSON requiere userId
            })
        });

        if (!res.ok) throw new Error("Error al crear la publicación");
        return res.json();
    },

    // Actualizar post
    async updatePost(id, postData) {
        const res = await fetch(`${API_BASE}/posts/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                title: postData.title,
                body: postData.body
            })
        });

        if (!res.ok) throw new Error("Error al actualizar");
        return res.json();
    },

    // Eliminar post
    async deletePost(id) {
        const res = await fetch(`${API_BASE}/posts/${id}`, {
            method: 'DELETE'
        });

        if (!res.ok) throw new Error("Error al eliminar");
        return res.json();
    }
};
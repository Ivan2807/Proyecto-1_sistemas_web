const API_BASE_URL = 'https://dummyjson.com';

let userCache = new Map();

export const api = {

    // fetch con post, y un filtro de busqueda por titulo o por tag, y paginacion
    async getPosts(page=1, limit=10, search='') {
        
        let url = `${API_BASE_URL}/posts?limit=${limit}&skip=${(page-1)*limit}`;
        if (search) url += `${API_BASE_URL}/posts/search?q=${encodeURIComponent(search)}`;
        if (search) url += `${API_BASE}/posts/tag/${tag}`;
       
       
        const res = await fetch(url);
        if (!res.ok) throw new Error('Failed to fetch posts');
        const data = await res.json();
   
        // Fetch user data for each post and cache it to avoid redundant requests
      await Promise.all(data.posts.map(async post => {
            if (!userCache.has(post.userId)) {
                const userRes = await fetch(`${API_BASE}/users/${post.userId}`);
                if (userRes.ok) {
                    const user = await userRes.json();
                    userCache.set(post.userId, `${user.firstName} ${user.lastName}`);
                }
            }
            post.authorName = userCache.get(post.userId) || `User ${post.userId}`;
        }));


        return data;
    },

    async getpostbyid(id) {
const res = await fetch(`${API_BASE}/posts/${id}`);
        if (!res.ok) throw new Error('Post no encontrado');
        const post = await res.json();
        
        // Añadir nombre del autor
        if (!userCache.has(post.userId)) {
            const userRes = await fetch(`${API_BASE}/users/${post.userId}`);
            if (userRes.ok) {
                const user = await userRes.json();
                userCache.set(post.userId, `${user.firstName} ${user.lastName}`);
            }
        }
        post.authorName = userCache.get(post.userId) || `User ${post.userId}`;
        return post;
    },

    // Crear post
    async createPost(postData) {
        const res = await fetch(`${API_BASE}/posts/add`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                title: postData.title,
                body: postData.body,
                userId: parseInt(postData.userId) || 5,
                tags: postData.tags || []
            })
        });
        if (!res.ok) throw new Error('Error al crear post');
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
        if (!res.ok) throw new Error('Error al actualizar');
        return res.json();
    },

    // Eliminar post
    async deletePost(id) {
        const res = await fetch(`${API_BASE}/posts/${id}`, { method: 'DELETE' });
        if (!res.ok) throw new Error('Error al eliminar');
        return res.json();
    }
};
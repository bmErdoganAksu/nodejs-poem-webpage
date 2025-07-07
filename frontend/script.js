// API temel URL'si
const API_BASE_URL = 'http://localhost:3002/api';

// --- DOM Elementleri ---
const appContainer = document.getElementById('app');
const authSection = document.getElementById('auth-section');
const poemsListSection = document.getElementById('poems-list-section');
const addPoemSection = document.getElementById('add-poem-section');
const userProfileSection = document.getElementById('user-profile-section');
const adminPanelSection = document.getElementById('admin-panel-section');
const editPoemSection = document.getElementById('edit-poem-section');
const editCommentSection = document.getElementById('edit-comment-section');
const userManagementSection = document.getElementById('user-management-section');
const contactSection = document.getElementById('contact-section');
const aboutSection = document.getElementById('about-section');
const poemTitlesList = document.getElementById('poem-titles-list');

const loginForm = document.getElementById('login-form');
const usernameInput = document.getElementById('username');
const passwordInput = document.getElementById('password');
const loginError = document.getElementById('login-error');

const registerForm = document.getElementById('register-form');
const registerUsernameInput = document.getElementById('register-username');
const registerEmailInput = document.getElementById('register-email');
const registerPasswordInput = document.getElementById('register-password');
const registerError = document.getElementById('register-error');

const poemTitleInput = document.getElementById('poem-title');
const poemContentInput = document.getElementById('poem-content');
const addPoemBtn = document.getElementById('add-poem-btn');
const poemsDiv = document.getElementById('poems-div');
const logoutBtn = document.getElementById('logout-btn');
const createPoemLink = document.getElementById('create-poem-link');
const poemsListLink = document.getElementById('poems-list-link');
const authLinks = document.getElementById('auth-links');
const loggedInLinks = document.getElementById('loggedIn-links'); // HTML ile eşleşen ID
const welcomeMessage = document.getElementById('welcome-message');
const userProfileLink = document.getElementById('user-profile-link');
const adminPanelLink = document.getElementById('admin-panel-link');
const changePasswordBtn = document.getElementById('change-password-btn');
const currentPasswordInput = document.getElementById('current-password');
const newPasswordInput = document.getElementById('new-password');
const passwordChangeMessage = document.getElementById('password-change-message');
const profileLogoutBtn = document.getElementById('profile-logout-btn');

const editPoemIdInput = document.getElementById('edit-poem-id');
const editPoemTitleInput = document.getElementById('edit-poem-title');
const editPoemContentInput = document.getElementById('edit-poem-content');
const saveEditedPoemBtn = document.getElementById('save-edited-poem-btn');
const cancelEditPoemBtn = document.getElementById('cancel-edit-poem-btn');

const adminPoemList = document.getElementById('admin-poem-list');
const adminUserList = document.getElementById('admin-user-list');

const userDetailsDiv = document.getElementById('user-details');
const editUserIdInput = document.getElementById('edit-user-id');
const editUsernameInput = document.getElementById('edit-username');
const editEmailInput = document.getElementById('edit-email');
const editRoleInput = document.getElementById('edit-role');
const editCanPostPoemsCheckbox = document.getElementById('edit-can-post-poems');
const saveUserChangesBtn = document.getElementById('save-user-changes-btn');
const cancelUserManagementBtn = document.getElementById('cancel-user-management-btn');

const commentsForManagementDiv = document.getElementById('comments-for-management');
const deleteSelectedCommentsBtn = document.getElementById('delete-selected-comments-btn');

const editCommentIdInput = document.getElementById('edit-comment-id');
const editCommentTextInput = document.getElementById('edit-comment-text');
const saveEditedCommentBtn = document.getElementById('save-edited-comment-btn');
const cancelCommentEditBtn = document.getElementById('cancel-comment-edit-btn');
const userCommentsList = document.getElementById('user-comments-list');

// --- Global Değişkenler ---
let currentUser = null;
let currentToken = null;
let currentPoemIdToEdit = null;
let currentManagingUserId = null;

// --- Yardımcı Fonksiyonlar ---
// Mesaj gösterimi: Hata veya başarı mesajlarını ekranda belirli bir süre gösterir
function showMessage(element, msgText, type) {
    element.textContent = msgText;
    element.className = `message ${type}`;
    element.classList.remove('hidden');
    setTimeout(() => {
        element.classList.add('hidden');
        element.textContent = '';
    }, 3000);
}

// Bölüm gösterimi: Belirtilen bölümü gösterir, diğerlerini gizler
function showSection(section) {
    document.querySelectorAll('main section').forEach(s => s.classList.add('hidden'));
    section.classList.remove('hidden');

    // Sidebar'ı yönet: Tam genişlik olması istenen bölümlerde gizle
    const poemTitlesContainer = document.querySelector('aside.poem-sidebar'); // Sadece aside.poem-sidebar'ı hedefle
    if (poemTitlesContainer) {
        if (section === aboutSection || section === addPoemSection || section === contactSection || section === adminPanelSection) {
            poemTitlesContainer.classList.add('hidden');
        } else {
            poemTitlesContainer.classList.remove('hidden');
        }
    } else {
        console.warn('Şiir başlıkları veya kapsayıcı elementi bulunamadı (aside.poem-sidebar)');
    }

    // body'ye full-width-section-active sınıfı ekleme/kaldırma
    // Bu sınıf ana uygulamanın konteynerini (main#app) tam genişlik yapar ve sidebar'ı gizler.
    if (section === addPoemSection || section === contactSection || section === adminPanelSection || section === aboutSection) {
        document.body.classList.add('full-width-section-active');
    } else {
        document.body.classList.remove('full-width-section-active');
    }

    if (section === userProfileSection && currentUser) { // <--- Bu bloğa taşındı
        loadUserComments();
        document.getElementById('profile-username').textContent = currentUser.username;
        document.getElementById('profile-email').textContent = currentUser.email; // <--- Buraya taşındı
        document.getElementById('profile-role').textContent = currentUser.role;
        document.getElementById('profile-can-post-poems').textContent =
            (currentUser.role === 'admin' || currentUser.canPostPoems) ? 'Evet' : 'Hayır';
        console.log('currentUser.email değeri (profil bölümünde):', currentUser.email); // <--- Buraya taşındı
    } else if (section === poemsListSection) {
        loadPoems();
    } else if (section === adminPanelSection && currentUser && currentUser.role === 'admin') {
        document.getElementById('manage-poems-tab').click();
    }
}

// Giriş formunu gösterir
function showLoginOnly() {
    document.getElementById('register-form-container').classList.add('hidden');
    document.getElementById('login-form-container').classList.remove('hidden');
    loginError.classList.add('hidden');
    registerError.classList.add('hidden');
}

// Kayıt formunu gösterir
function showRegisterOnly() {
    document.getElementById('login-form-container').classList.add('hidden');
    document.getElementById('register-form-container').classList.remove('hidden');
    loginError.classList.add('hidden');
    registerError.classList.add('hidden');
}

// Kullanıcıyı yerel depodan yükler
function loadUserFromStorage() {
    const user = JSON.parse(localStorage.getItem('currentUser'));
    const token = localStorage.getItem('token');
    if (user && token) {
        currentUser = user;
        currentToken = token;
    } else {
        currentUser = null;
        currentToken = null;
    }
    updateUIForLoginState();
}

// Kullanıcıyı yerel depoya kaydeder
function saveUserToStorage(user, token) {
    localStorage.setItem('currentUser', JSON.stringify(user));
    localStorage.setItem('token', token);
    currentUser = user;
    currentToken = token;
    updateUIForLoginState();
    console.log("saveUserToStorage'a gelen user objesi:", user);
}

// Kullanıcıyı yerel depodan siler
function clearUserFromStorage() {
    localStorage.removeItem('currentUser');
    localStorage.removeItem('token');
    currentUser = null;
    currentToken = null;
    updateUIForLoginState();
}

// Arayüzü oturum durumuna göre günceller
function updateUIForLoginState() {
    // Null kontrolü eklendi
    const authLinksElement = document.getElementById('auth-links');
    const loggedInLinksElement = document.getElementById('loggedIn-links'); // HTML ile eşleşen ID

    if (currentToken && currentUser) {
        if (authLinksElement) authLinksElement.classList.add('hidden');
        if (loggedInLinksElement) loggedInLinksElement.classList.remove('hidden');
        if (welcomeMessage) welcomeMessage.textContent = `Hoş geldiniz, ${currentUser.username}!`;
        if (userProfileLink) userProfileLink.classList.remove('hidden');
        if (createPoemLink) {
            if (currentUser.role === 'admin' || currentUser.canPostPoems) {
                createPoemLink.classList.remove('hidden');
            } else {
                createPoemLink.classList.add('hidden');
            }
        }
        if (adminPanelLink) {
            if (currentUser.role === 'admin') {
                adminPanelLink.classList.remove('hidden');
            } else {
                adminPanelLink.classList.add('hidden');
            }
        }
    } else {
        if (authLinksElement) authLinksElement.classList.remove('hidden');
        if (loggedInLinksElement) loggedInLinksElement.classList.add('hidden');
        if (welcomeMessage) welcomeMessage.textContent = '';
        if (createPoemLink) createPoemLink.classList.add('hidden');
        if (userProfileLink) userProfileLink.classList.add('hidden');
        if (adminPanelLink) adminPanelLink.classList.add('hidden');
    }
}

// --- Backend API Çağrıları ---
// Genel API isteği fonksiyonu
async function apiRequest(url, method, data = null) {
    const headers = {
        'Content-Type': 'application/json',
    };
    if (currentToken) {
        headers['Authorization'] = `Bearer ${currentToken}`;
    }

    try {
        const config = {
            method: method,
            headers: headers,
        };
        if (data) {
            config.body = JSON.stringify(data);
        }

        const response = await fetch(`${API_BASE_URL}${url}`, config);
        const text = await response.text();

        let result;
        try {
            result = text ? JSON.parse(text) : {};
        } catch {
            // Burada, 404 veya diğer HTML hata sayfalarını daha iyi loglayabilirsin
            console.error('API yanıtı JSON değil, gelen veri:', text);
            throw new Error(`API yanıtı JSON değil: ${text.substring(0, 200)}...`);
        }

        if (!response.ok) {
            if (response.status === 401 || response.status === 403) {
                clearUserFromStorage();
                showSection(authSection);
                showLoginOnly();
                showMessage(loginError, 'Oturum süreniz doldu veya yetkiniz yok. Lütfen tekrar giriş yapın.', 'error');
            }
            throw new Error(result.message || 'Bir hata oluştu.');
        }

        return result;
    } catch (error) {
        console.error('API isteği hatası:', error);
        throw error;
    }
}



// --- Kullanıcı İşlemleri ---
// Kullanıcı girişi
async function login(event) {
    event.preventDefault();
    const username = usernameInput.value.trim();
    const password = passwordInput.value;
    loginError.textContent = '';
    if (!username || !password) {
        showMessage(loginError, 'Lütfen tüm alanları doldurun.', 'error');
        return;
    }
    try {
        const res = await fetch(`${API_BASE_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });
        const data = await res.json();
        if (!res.ok) {
            throw new Error(data.message || 'Giriş başarısız.');
        }
        saveUserToStorage(data.user, data.token);
        showMessage(loginError, 'Giriş başarılı!', 'success');
        loginForm.reset();
        showSection(poemsListSection);
    } catch (err) {
        showMessage(loginError, err.message, 'error');
    }
}

// Kullanıcı kaydı
async function register(event) {
    event.preventDefault();
    const username = registerUsernameInput.value.trim();
    const email = registerEmailInput.value.trim();
    const password = registerPasswordInput.value;
    registerError.textContent = '';
    if (!username || !email || !password) {
        showMessage(registerError, 'Lütfen tüm alanları doldurun.', 'error');
        return;
    }
    try {
        const res = await fetch(`${API_BASE_URL}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, email, password })
        });
        const data = await res.json();
        if (!res.ok) {
            throw new Error(data.message || 'Kayıt başarısız.');
        }
        showMessage(registerError, 'Kayıt başarılı. Giriş yapabilirsiniz.', 'success');
        registerForm.reset();
        showLoginOnly();
    } catch (err) {
        showMessage(registerError, err.message, 'error');
    }
}

// Çıkış yapma
function logout() {
    clearUserFromStorage();
    showMessage(loginError, 'Çıkış yapıldı.', 'success');
    showSection(authSection);
    showLoginOnly();
}

// Şifre değiştirme
async function changePassword(event) {
    event.preventDefault();
    const currentPassword = currentPasswordInput.value.trim();
    const newPassword = newPasswordInput.value.trim();
    passwordChangeMessage.textContent = '';
    if (!currentPassword || !newPassword) {
        showMessage(passwordChangeMessage, 'Lütfen tüm şifre alanlarını doldurun.', 'error');
        return;
    }
    if (newPassword.length < 6) {
        showMessage(passwordChangeMessage, 'Yeni şifre en az 6 karakter olmalıdır.', 'error');
        return;
    }
    try {
        await apiRequest('/auth/profile/password', 'PUT', { currentPassword, newPassword });
        showMessage(passwordChangeMessage, 'Şifreniz başarıyla güncellendi!', 'success');
        currentPasswordInput.value = '';
        newPasswordInput.value = '';
    } catch (error) {
        showMessage(passwordChangeMessage, error.message || 'Şifre güncelleme başarısız oldu.', 'error');
    }
}

// --- Şiir İşlemleri ---
// Şiirler listesini yükler ve kullanıcı adlarını doğru şekilde gösterir
async function loadPoems() {
    try {
        const poems = await apiRequest('/poems', 'GET');
        poemsDiv.innerHTML = '';

        if (poems.length === 0) {
            poemsDiv.innerHTML = '<p class="text-center">Henüz hiç şiir eklenmemiş.</p>';
            populateSidebarPoemTitles([]); // Sidebar'ı da boşalt
            return;
        }

        const userCache = new Map();

        for (const poem of poems) {
            let authorUsername = 'Bilinmeyen Kullanıcı';

            // Yazar bilgisini çekmek için çeşitli alanları kontrol et
            if (poem.authorUsername) { // Backend doğrudan kullanıcı adını sağlıyorsa
                authorUsername = poem.authorUsername;
            } else if (poem.authorId) { // Backend yazar ID'sini sağlıyorsa
                if (!userCache.has(poem.authorId)) {
                    try {
                        const user = await apiRequest(`/auth/profile/${poem.authorId}`, 'GET');
                        userCache.set(poem.authorId, user.username || 'Bilinmeyen Kullanıcı');
                    } catch (error) {
                        console.error(`Kullanıcı ${poem.authorId} yüklenemedi:`, error);
                        userCache.set(poem.authorId, 'Bilinmeyen Kullanıcı');
                    }
                }
                authorUsername = userCache.get(poem.authorId);
            } else if (poem.author) { // Genel 'author' alanı (ID veya obje olabilir)
                if (typeof poem.author === 'string') {
                    if (!userCache.has(poem.author)) {
                        try {
                            const userApiUrl = `/auth/profile/${poem.author}`;
                            const user = await apiRequest(userApiUrl, 'GET');
                            userCache.set(poem.author, user.username || 'Bilinmeyen Kullanıcı');
                        } catch (error) {
                            console.error(`Kullanıcı ${poem.author} yüklenemedi:`, error);
                            userCache.set(poem.author, 'Bilinmeyen Kullanıcı');
                        }
                    }
                    authorUsername = userCache.get(poem.author);
                } else if (poem.author && typeof poem.author === 'object' && poem.author.username) {
                    authorUsername = poem.author.username;
                }
            }

            const poemElement = document.createElement('div');
            poemElement.className = 'poem-card';
            poemElement.dataset.id = poem._id;
            const isAuthor = currentUser && poem.author && (currentUser.id === (typeof poem.author === 'string' ? poem.author : poem.author._id));
            const isAdmin = currentUser && currentUser.role === 'admin';
            const canEdit = isAuthor || isAdmin;
            const hasLiked = currentUser && (poem.likedBy || []).includes(currentUser.id); // 'currentUser.id' olarak değiştirildi
            const likeClass = hasLiked ? 'liked' : '';
            const likeText = hasLiked ? 'Beğenmekten Vazgeç' : 'Beğen';
            let commentsHtml = '';
            if (poem.comments && poem.comments.length > 0) {
                commentsHtml = '<h4>Yorumlar:</h4>';
                poem.comments.forEach(comment => {
                    const commentAuthorUsername = comment.authorUsername || (comment.author && comment.author.username) || 'Bilinmeyen Kullanıcı';
                    const isCommentAuthor = currentUser && (comment.author && currentUser.id === (comment.author._id || comment.author) || (comment.authorId && currentUser.id === comment.authorId)); // 'currentUser.id' olarak değiştirildi
                    const canEditComment = isCommentAuthor || isAdmin;
                    commentsHtml += `
                        <div class="comment">
                            <p><strong>${commentAuthorUsername}</strong>: ${comment.text}</p>
                            <span class="comment-date">${new Date(comment.createdAt).toLocaleString()}</span>
                            ${canEditComment ? `
                                <button class="btn btn-edit-comment edit-comment-btn" data-poem-id="${poem._id}" data-comment-id="${comment._id}" data-comment-text="${comment.text}">Düzenle</button>
                                <button class="btn btn-danger delete-comment-btn" data-poem-id="${poem._id}" data-comment-id="${comment._id}">Sil</button>
                            ` : ''}
                        </div>
                    `;
                });
            } else {
                commentsHtml = '<p>Bu şiire henüz yorum yapılmamış.</p>';
            }
            poemElement.innerHTML = `
                <h3>${poem.title}</h3>
                <p class="poem-author">Yazar: ${authorUsername}</p>
                <p class="poem-content">${poem.content}</p>
                <div class="poem-actions">
                    <button class="btn btn-primary like-btn ${likeClass}" data-id="${poem._id}">${likeText} (${poem.likes})</button>
                    ${currentUser ? `
                        <div class="comment-input-area">
                            <textarea class="comment-text-input" placeholder="Yorumunuzu yazın..." rows="2"></textarea>
                            <button class="btn btn-primary add-comment-btn" data-id="${poem._id}">Yorum Yap</button>
                        </div>
                    ` : `
                        <p class="login-prompt">Yorum yapmak veya beğenmek için <a href="#" class="login-link">giriş yapın</a>.</p>
                    `}
                    ${canEdit ? `
                        <button class="btn btn-secondary edit-poem-btn" data-id="${poem._id}" data-title="${poem.title}" data-content="${poem.content}">Düzenle</button>
                        <button class="btn btn-danger delete-poem-btn" data-id="${poem._id}">Sil</button>
                    ` : ''}
                </div>
                <div class="poem-comments">${commentsHtml}</div>
            `;
            poemsDiv.appendChild(poemElement);
        }
        attachPoemEventListeners(); // Şiir butonlarına olay dinleyicileri ekle
        populateSidebarPoemTitles(poems); // Kenar çubuğundaki şiir başlıklarını yükle
    } catch (error) {
        console.error('Şiirler yüklenirken hata oluştu:', error);
        poemsDiv.innerHTML = '<p class="error-message">Şiirler yüklenemedi. Lütfen daha sonra tekrar deneyin.</p>';
        populateSidebarPoemTitles([]); // Hata durumunda sidebar'ı boşalt
    }
}


// Yeni şiir ekler
async function addPoem(event) {
    event.preventDefault();
    const title = poemTitleInput.value.trim();
    const content = poemContentInput.value.trim();
    if (!title || !content) {
        alert('Lütfen şiirin başlığını ve içeriğini girin.');
        return;
    }
    if (!currentUser || !currentToken) {
        alert('Şiir eklemek için giriş yapmalısınız.');
        showSection(authSection);
        showLoginOnly();
        return;
    }
    if (currentUser.role !== 'admin' && !currentUser.canPostPoems) {
        alert('Şiir ekleme yetkiniz bulunmamaktadır. Yönetici ile iletişime geçin.');
        return;
    }
    try {
        await apiRequest('/poems', 'POST', { title, content });
        poemTitleInput.value = '';
        poemContentInput.value = '';
        showSection(poemsListSection);
        showMessage(loginError, 'Şiir başarıyla eklendi!', 'success');
        loadPoems();
    } catch (error) {
        showMessage(loginError, 'Şiir eklenirken hata oluştu: ' + (error.message || 'Bilinmeyen Hata'), 'error');
    }
}

// Şiir düzenleme ekranını açar
async function editPoem(id, title, content) {
    currentPoemIdToEdit = id;
    editPoemIdInput.value = id;
    editPoemTitleInput.value = title;
    editPoemContentInput.value = content;
    showSection(editPoemSection);
}

// Kenar çubuğunda şiir başlıklarını listeler
function populateSidebarPoemTitles(poems) {
    const poemTitlesContainer = document.querySelector('aside.poem-sidebar'); // Sadece aside.poem-sidebar'ı hedefle
    if (poemTitlesContainer) {
        const list = poemTitlesContainer.querySelector('#poem-titles-list') || poemTitlesContainer;
        list.innerHTML = '';
        if (!poems || poems.length === 0) {
            list.innerHTML = '<li>Henüz başlık yok.</li>';
            return;
        }
        poems.forEach(poem => {
            const listItem = document.createElement('li');
            const link = document.createElement('a');
            link.href = `#poem-${poem._id}`;
            link.textContent = poem.title;
            link.onclick = (e) => {
                e.preventDefault();
                showSection(poemsListSection);
                const targetPoem = document.querySelector(`.poem-card[data-id="${poem._id}"]`);
                if (targetPoem) {
                    targetPoem.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
            };
            listItem.appendChild(link);
            list.appendChild(listItem);
        });
    } else {
        console.warn('Şiir başlıkları veya kapsayıcı elementi bulunamadı (aside.poem-sidebar)');
    }
}

// Düzenlenen şiiri kaydeder
async function saveEditedPoem(event) {
    event.preventDefault();
    const id = editPoemIdInput.value;
    const title = editPoemTitleInput.value.trim();
    const content = editPoemContentInput.value.trim();
    if (!title || !content) {
        alert('Lütfen başlık ve içerik alanlarını doldurun.');
        return;
    }
    try {
        await apiRequest(`/poems/${id}`, 'PUT', { title, content });
        alert('Şiir başarıyla güncellendi!');
        showSection(poemsListSection);
        loadPoems();
        if (currentUser.role === 'admin') {
            loadPoemsForAdmin();
        }
    } catch (error) {
        alert('Şiir güncellenirken hata oluştu: ' + (error.message || 'Bilinmeyen Hata'));
    }
}

// Şiiri siler
async function deletePoem(id) {
    if (confirm('Bu şiiri silmek istediğinizden emin misiniz?')) {
        try {
            await apiRequest(`/poems/${id}`, 'DELETE');
            alert('Şiir başarıyla silindi.');
            loadPoems();
            if (currentUser.role === 'admin') {
                loadPoemsForAdmin();
            }
        } catch (error) {
            alert('Şiir silinirken hata oluştu: ' + (error.message || 'Bilinmeyen Hata'));
        }
    }
}

// Şiiri beğenir veya beğenmekten vazgeçer
async function toggleLike(poemId) {
    if (!currentUser || !currentToken) {
        alert('Beğenmek için giriş yapmalısınız.');
        showSection(authSection);
        showLoginOnly();
        return;
    }
    try {
        await apiRequest(`/poems/${poemId}/like`, 'POST');
        loadPoems();
    } catch (error) {
        alert('Beğenme işlemi başarısız oldu: ' + (error.message || 'Bilinmeyen Hata'));
    }
}

// Yorum ekler
async function addComment(poemId, commentText) {
    console.log('addComment fonksiyonu çağrıldı. Şiir ID:', poemId, 'Yorum Metni:', commentText);
    if (!currentUser || !currentToken) {
        alert('Yorum yapmak için giriş yapmalısınız.');
        showSection(authSection);
        showLoginOnly();
        return;
    }
    if (!commentText.trim()) {
        alert('Yorum boş olamaz.');
        return;
    }
    try {
        console.log('API isteği gönderiliyor: POST /poems/:id/comments ile metin:', commentText);
        await apiRequest(`/poems/${poemId}/comments`, 'POST', { text: commentText });
        console.log('Yorum başarıyla eklendi, şiirler ve kullanıcı yorumları yenileniyor...');
        loadPoems();
        loadUserComments();
    } catch (error) {
        console.error('Yorum eklenirken hata oluştu:', error);
        alert('Yorum eklenirken hata oluştu: ' + (error.message || 'Bilinmeyen Hata'));
    }
}

// Yorum düzenleme ekranını açar
async function editComment(poemId, commentId, commentText) {
    editCommentIdInput.value = commentId;
    editCommentTextInput.value = commentText;
    editCommentSection.dataset.poemId = poemId;
    showSection(editCommentSection);
}

// Düzenlenen yorumu kaydeder
async function saveEditedComment(event) {
    event.preventDefault();
    const commentId = editCommentIdInput.value;
    const poemId = editCommentSection.dataset.poemId;
    const newText = editCommentTextInput.value.trim();
    if (!newText) {
        alert('Yorum boş olamaz.');
        return;
    }
    try {
        await apiRequest(`/poems/${poemId}/comments/${commentId}`, 'PUT', { text: newText });
        alert('Yorum başarıyla güncellendi!');
        showSection(userProfileSection);
        loadPoems();
        loadUserComments();
        if (currentUser.role === 'admin') {
            loadCommentsForAdmin();
        }
    } catch (error) {
        alert('Yorum güncellenirken hata oluştu: ' + (error.message || 'Bilinmeyen Hata'));
    }
}

// Yorumu siler
async function deleteComment(poemId, commentId) {
    if (confirm('Bu yorumu silmek istediğinizden emin misiniz?')) {
        try {
            await apiRequest(`/poems/${poemId}/comments/${commentId}`, 'DELETE');
            alert('Yorum başarıyla silindi.');
            loadPoems();
            loadUserComments();
            if (currentUser.role === 'admin') {
                loadCommentsForAdmin();
            }
        } catch (error) {
            alert('Yorum silinirken hata oluştu: ' + (error.message || 'Bilinmeyen Hata'));
        }
    }
}

// Yönetici panelinden yorum siler
async function deleteCommentFromAdminPanel(commentId) {
    if (confirm('Bu yorumu silmek istediğinizden emin misiniz?')) {
        try {
            await apiRequest(`/admin/comments/${commentId}`, 'DELETE');
            alert('Yorum başarıyla silindi.');
            loadCommentsForAdmin();
            loadPoems();
        } catch (error) {
            alert('Yorum silinirken hata oluştu: ' + (error.message || 'Bilinmeyen Hata'));
        }
    }
}

// --- Yönetici Paneli Fonksiyonları ---
// Yönetici paneli için şiirleri yükler
async function loadPoemsForAdmin() {
    try {
        const poems = await apiRequest('/poems', 'GET');
        adminPoemList.innerHTML = '';
        if (poems.length === 0) {
            adminPoemList.innerHTML = '<p>Henüz hiç şiir eklenmemiş.</p>';
            return;
        }
        const userCache = new Map();
        for (const poem of poems) {
            let authorUsername = 'Bilinmeyen Kullanıcı';
            if (poem.authorUsername) {
                authorUsername = poem.authorUsername;
            } else if (poem.authorId) {
                if (!userCache.has(poem.authorId)) {
                    try {
                        const userApiUrl = `/auth/profile/${poem.authorId}`;
                        const user = await apiRequest(userApiUrl, 'GET');
                        userCache.set(poem.authorId, user.username || 'Bilinmeyen Kullanıcı');
                    } catch (error) {
                        console.error(`Kullanıcı ${poem.authorId} yüklenemedi:`, error);
                        userCache.set(poem.authorId, 'Bilinmeyen Kullanıcı');
                    }
                }
                authorUsername = userCache.get(poem.authorId);
            } else if (poem.author) {
                if (typeof poem.author === 'string') {
                    if (!userCache.has(poem.author)) {
                        try {
                            const userApiUrl = `/auth/profile/${poem.author}`;
                            const user = await apiRequest(userApiUrl, 'GET');
                            userCache.set(poem.author, user.username || 'Bilinmeyen Kullanıcı');
                        } catch (error) {
                            console.error(`Kullanıcı ${poem.author} yüklenemedi:`, error);
                            userCache.set(poem.author, 'Bilinmeyen Kullanıcı');
                        }
                    }
                    authorUsername = userCache.get(poem.author);
                } else if (poem.author && typeof poem.author === 'object' && poem.author.username) {
                    authorUsername = poem.author.username;
                }
            }
            const poemItem = document.createElement('div');
            poemItem.className = 'admin-list-item';
            poemItem.innerHTML = `
                <span>${poem.title} (Yazar: ${authorUsername})</span>
                <div>
                    <button class="btn btn-secondary edit-poem-btn" data-id="${poem._id}" data-title="${poem.title}" data-content="${poem.content}">Düzenle</button>
                    <button class="btn btn-danger delete-poem-btn" data-id="${poem._id}">Sil</button>
                </div>
            `;
            adminPoemList.appendChild(poemItem);
        }
        attachAdminPoemEventListeners();
    } catch (error) {
        console.error('Admin şiirleri yüklenirken hata:', error);
        adminPoemList.innerHTML = '<p class="error-message">Şiirler yönetici paneline yüklenemedi.</p>';
    }
}

// Yönetici paneli şiir butonlarına olay dinleyicileri ekler
function attachAdminPoemEventListeners() {
    console.log('Admin şiir butonlarına olay dinleyicileri ekleniyor...');
    document.querySelectorAll('.edit-poem-btn').forEach(button => {
        button.onclick = () => {
            console.log('Düzenle butonuna tıklandı:', button.dataset.id);
            editPoem(button.dataset.id, button.dataset.title, button.dataset.content);
        };
    });
    document.querySelectorAll('.delete-poem-btn').forEach(button => {
        button.onclick = () => {
            console.log('Sil butonuna tıklandı:', button.dataset.id);
            deletePoem(button.dataset.id);
        };
    });
}

// Yönetici paneli için kullanıcıları yükler
async function loadUsersForAdmin() {
    try {
        const users = await apiRequest('/admin/users', 'GET');
        adminUserList.innerHTML = '';
        if (users.length === 0) {
            adminUserList.innerHTML = '<p>Henüz hiç kullanıcı yok.</p>';
            return;
        }
        users.forEach(user => {
            const userItem = document.createElement('div');
            userItem.className = 'admin-list-item';
            userItem.innerHTML = `
                <span>${user.username} (${user.email}) - Rol: ${user.role}</span>
                <div>
                    <button class="btn btn-secondary edit-user-btn" data-id="${user._id}">Düzenle</button>
                    <button class="btn btn-danger delete-user-btn ${currentUser && currentUser.id === user._id ? 'hidden' : ''}" data-id="${user._id}">Sil</button>
                </div>
            `;
            adminUserList.appendChild(userItem);
        });
        attachAdminUserEventListeners();
    } catch (error) {
        console.error('Admin kullanıcıları yüklenirken hata:', error);
        adminUserList.innerHTML = '<p class="error-message">Kullanıcılar yönetici paneline yüklenemedi.</p>';
    }
}

// Yönetici paneli kullanıcı butonlarına olay dinleyicileri ekler
function attachAdminUserEventListeners() {
    console.log('Admin kullanıcı butonlarına olay dinleyicileri ekleniyor...');
    document.querySelectorAll('.edit-user-btn').forEach(button => {
        button.onclick = () => {
            console.log('Kullanıcı düzenle butonuna tıklandı:', button.dataset.id);
            editUser(button.dataset.id);
        };
    });
    document.querySelectorAll('.delete-user-btn').forEach(button => {
        button.onclick = () => {
            console.log('Kullanıcı sil butonuna tıklandı:', button.dataset.id);
            deleteUser(button.dataset.id);
        };
    });
}

// Kullanıcı düzenleme ekranını açar
async function editUser(userId) {
    try {
        const userApiUrl = `/auth/profile/${userId}`;
        const user = await apiRequest(userApiUrl, 'GET');
        if (user) {
            editUserIdInput.value = user._id;
            editUsernameInput.value = user.username;
            editEmailInput.value = user.email;
            editRoleInput.value = user.role;
            editCanPostPoemsCheckbox.checked = user.canPostPoems;
            showSection(userManagementSection);
        }
    }
    catch (error) {
        console.error('Kullanıcı bilgileri yüklenirken hata:', error);
        alert('Kullanıcı bilgileri yüklenirken hata oluştu: ' + (error.message || 'Bilinmeyen Hata'));
    }
}

// Kullanıcı değişikliklerini kaydeder
async function saveUserChanges(event) {
    event.preventDefault();
    const userId = editUserIdInput.value;
    const username = editUsernameInput.value.trim();
    const email = editEmailInput.value.trim();
    const role = editRoleInput.value;
    const canPostPoems = editCanPostPoemsCheckbox.checked;
    if (!username || !email) {
        alert('Kullanıcı adı ve e-posta boş olamaz.');
        return;
    }
    try {
        await apiRequest(`/admin/users/${userId}`, 'PUT', { username, email, role, canPostPoems });
        alert('Kullanıcı bilgileri başarıyla güncellendi!');
        showSection(adminPanelSection);
        document.getElementById('manage-users-tab').click();
    }
    catch (error) {
        console.error('Kullanıcı bilgileri güncellenirken hata:', error);
        alert('Kullanıcı bilgileri güncellenirken hata oluştu: ' + (error.message || 'Bilinmeyen Hata'));
    }
}

// Kullanıcıyı siler
async function deleteUser(userId) {
    if (currentUser && currentUser.id === userId) { // 'currentUser.id' olarak değiştirildi
        alert('Kendi hesabınızı bu panelden silemezsiniz.');
        return;
    }
    if (confirm('Bu kullanıcıyı silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.')) {
        try {
            await apiRequest(`/admin/users/${userId}`, 'DELETE');
            alert('Kullanıcı başarıyla silindi.');
            loadUsersForAdmin();
        } catch (error) {
            console.error('Kullanıcı silinirken hata:', error);
            alert('Kullanıcı silinirken hata oluştu: ' + (error.message || 'Bilinmeyen Hata'));
        }
    }
}

// Yönetici paneli yorum butonlarına olay dinleyicileri ekler
function attachAdminCommentEventListeners() {
    console.log('Admin yorum butonlarına olay dinleyicileri ekleniyor...');
    document.querySelectorAll('.edit-comment-btn').forEach(button => {
        button.onclick = () => {
            console.log('Yorum düzenle butonuna tıklandı:', button.dataset.commentId);
            editComment(button.dataset.poemId, button.dataset.commentId, button.dataset.commentText);
        };
    });
    document.querySelectorAll('.delete-comment-from-admin-btn').forEach(button => {
        button.onclick = () => {
            console.log('Yorum sil butonuna tıklandı:', button.dataset.commentId);
            deleteCommentFromAdminPanel(button.dataset.commentId);
        };
    });
}

// Yönetici paneli için yorumları yükler
async function loadCommentsForAdmin() {
    try {
        const allPoems = await apiRequest('/poems', 'GET');
        commentsForManagementDiv.innerHTML = '';
        let hasComments = false;
        const userCache = new Map();
        for (const poem of allPoems) {
            if (poem.comments && poem.comments.length > 0) {
                hasComments = true;
                commentsForManagementDiv.innerHTML += `<h4>Şiir: "${poem.title}" Yorumları</h4>`;
                for (const comment of poem.comments) {
                    let authorUsername = comment.authorUsername || (comment.author && comment.author.username) || 'Bilinmeyen Kullanıcı';
                    const commentAuthorId = comment.authorId || (comment.author && comment.author._id) || comment.author;
                    if (typeof commentAuthorId === 'string' && !userCache.has(commentAuthorId)) {
                        try {
                            const userApiUrl = `/auth/profile/${commentAuthorId}`;
                            const user = await apiRequest(userApiUrl, 'GET');
                            userCache.set(commentAuthorId, user.username || 'Bilinmeyen Kullanıcı');
                        } catch (error) {
                            console.error(`Kullanıcı ${commentAuthorId} yüklenemedi:`, error);
                            userCache.set(commentAuthorId, 'Bilinmeyen Kullanıcı');
                        }
                    }
                    const commentItem = document.createElement('div');
                    commentItem.className = 'admin-list-item';
                    commentItem.innerHTML = `
                        <input type="checkbox" class="comment-checkbox" data-comment-id="${comment._id}">
                        <span><strong>${authorUsername}</strong>: ${comment.text} (Şiir ID: ${poem._id})</span>
                        <div>
                            <button class="btn btn-edit-comment edit-comment-btn" data-poem-id="${poem._id}" data-comment-id="${comment._id}" data-comment-text="${comment.text}">Düzenle</button>
                            <button class="btn btn-danger delete-comment-from-admin-btn" data-comment-id="${comment._id}">Sil</button>
                        </div>
                    `;
                    commentsForManagementDiv.appendChild(commentItem);
                }
            }
        }
        if (!hasComments) {
            commentsForManagementDiv.innerHTML = '<p>Henüz hiç yorum yok.</p>';
            deleteSelectedCommentsBtn.classList.add('hidden');
        } else {
            deleteSelectedCommentsBtn.classList.remove('hidden');
        }
        attachAdminCommentEventListeners(); // Yönetici yorum butonlarına olay dinleyicileri ekle
    } catch (error) {
        console.error('Admin yorumları yüklenirken hata:', error);
        commentsForManagementDiv.innerHTML = '<p class="error-message">Yorumlar yönetici paneline yüklenemedi.</p>';
        deleteSelectedCommentsBtn.classList.add('hidden');
    }
}

// Kullanıcı yorumlarını yükler
async function loadUserComments() {
    console.log('Current User (Mevcut Kullanıcı):', currentUser);
    console.log('Current User ID (Mevcut Kullanıcı ID):', currentUser ? currentUser.id : 'No ID'); // 'currentUser.id' olarak değiştirildi
    userCommentsList.innerHTML = '';
    if (!currentUser) {
        userCommentsList.innerHTML = '<h3>Yorumlar</h3><p>Yorumlarınızı görmek için giriş yapmalısınız.</p>';
        return;
    }
    try {
        const allPoems = await apiRequest('/poems', 'GET');
        let hasComments = false;
        let commentsHtml = '';
        const commentsByUser = {};
        const userCache = new Map(); // userCache burada tanımlandı
        for (const poem of allPoems) {
            for (const comment of (poem.comments || [])) {
                let authorUsername = comment.authorUsername || (comment.author && comment.author.username) || 'Bilinmeyen Kullanıcı';
                const commentAuthorId = comment.authorId || (comment.author && comment.author._id) || comment.author;
                if (typeof commentAuthorId === 'string' && !userCache.has(commentAuthorId)) {
                    try {
                        const userApiUrl = `/auth/profile/${commentAuthorId}`;
                        const user = await apiRequest(userApiUrl, 'GET');
                        userCache.set(commentAuthorId, user.username || 'Bilinmeyen Kullanıcı');
                    } catch (error) {
                        console.error(`Kullanıcı ${commentAuthorId} yüklenemedi:`, error);
                        userCache.set(commentAuthorId, 'Bilinmeyen Kullanıcı');
                    }
                }
                if (commentAuthorId && userCache.has(commentAuthorId)) {
                    authorUsername = userCache.get(commentAuthorId);
                }
                if (currentUser.role === 'admin') {
                    if (!commentsByUser[authorUsername]) {
                        commentsByUser[authorUsername] = [];
                    }
                    commentsByUser[authorUsername].push({
                        poemId: poem._id,
                        poemTitle: poem.title,
                        commentId: comment._id,
                        text: comment.text,
                        createdAt: comment.createdAt,
                        commentAuthorId: commentAuthorId
                    });
                    hasComments = true;
                } else if (commentAuthorId === currentUser.id) { // 'currentUser.id' olarak değiştirildi
                    hasComments = true;
                    commentsHtml += `
                        <div class="comment">
                            <p><strong>Şiir: "${poem.title}"</strong></p>
                            <p>${comment.text}</p>
                            <span class="comment-date">${new Date(comment.createdAt).toLocaleString()}</span>
                            <button class="btn btn-edit-comment edit-comment-btn" data-poem-id="${poem._id}" data-comment-id="${comment._id}" data-comment-text="${comment.text}">Düzenle</button>
                            <button class="btn btn-danger delete-comment-btn" data-poem-id="${poem._id}" data-comment-id="${comment._id}">Sil</button>
                        </div>
                    `;
                }
            }
        }
        if (currentUser.role === 'admin') {
            userCommentsList.innerHTML = '<h3>Yorumlar</h3>';
            for (const [username, comments] of Object.entries(commentsByUser)) {
                if (comments.length > 0) {
                    let userGroupHtml = `<div class="user-comment-group"><h4>${username} Kullanıcısının Yorumları</h4>`;
                    comments.forEach(comment => {
                        const isCommentAuthor = currentUser.id === comment.commentAuthorId; // 'currentUser.id' olarak değiştirildi
                        const canEditComment = isCommentAuthor || currentUser.role === 'admin';
                        userGroupHtml += `
                            <div class="comment">
                                <p><strong>Şiir: "${comment.poemTitle}"</strong></p>
                                <p>${comment.text}</p>
                                <span class="comment-date">${new Date(comment.createdAt).toLocaleString()}</span>
                                ${canEditComment ? `
                                    <button class="btn btn-edit-comment edit-comment-btn" data-poem-id="${comment.poemId}" data-comment-id="${comment.commentId}" data-comment-text="${comment.text}">Düzenle</button>
                                    <button class="btn btn-danger delete-comment-btn" data-poem-id="${comment.poemId}" data-comment-id="${comment.commentId}">Sil</button>
                                ` : ''}
                            </div>
                        `;
                    });
                    userGroupHtml += '</div>';
                    userCommentsList.innerHTML += userGroupHtml;
                }
            }
            if (!hasComments) {
                userCommentsList.innerHTML += '<p>Henüz herhangi bir yorum yapılmamış.</p>';
            }
        } else {
            userCommentsList.innerHTML = '<h3>Yaptığım Yorumlar</h3>';
            if (hasComments) {
                userCommentsList.innerHTML += commentsHtml;
            } else {
                userCommentsList.innerHTML += '<p>Henüz herhangi bir şiire yorum yapmadınız.</p>';
            }
        }
        attachUserCommentEventListeners(); // Kullanıcı yorum butonlarına olay dinleyicileri ekle
    } catch (error) {
        console.error('Kullanıcı yorumları yüklenirken hata oluştu:', error);
        userCommentsList.innerHTML += '<p class="error-message">Yorumlar yüklenemedi. Lütfen daha sonra tekrar deneyin.</p>';
    }
}

// Kullanıcı yorum butonlarına olay dinleyicileri ekler
function attachUserCommentEventListeners() {
    console.log('Kullanıcı yorum butonlarına olay dinleyicileri ekleniyor...');
    document.querySelectorAll('.edit-comment-btn').forEach(button => {
        button.onclick = () => {
            console.log('Kullanıcı yorum düzenle butonuna tıklandı:', button.dataset.commentId);
            editComment(button.dataset.poemId, button.dataset.commentId, button.dataset.commentText);
        };
    });
    document.querySelectorAll('.delete-comment-btn').forEach(button => {
        button.onclick = () => {
            console.log('Kullanıcı yorum sil butonuna tıklandı:', button.dataset.commentId);
            deleteComment(button.dataset.poemId, button.dataset.commentId);
        };
    });
}

// Şiir butonlarına olay dinleyicileri ekler
function attachPoemEventListeners() {
    console.log('Şiir butonlarına olay dinleyicileri ekleniyor...');
    document.querySelectorAll('.like-btn').forEach(button => {
        button.onclick = () => {
            console.log('Beğen butonuna tıklandı:', button.dataset.id);
            toggleLike(button.dataset.id);
        };
    });
    document.querySelectorAll('.edit-poem-btn').forEach(button => {
        button.onclick = () => {
            console.log('Şiir düzenle butonuna tıklandı:', button.dataset.id);
            editPoem(button.dataset.id, button.dataset.title, button.dataset.content);
        };
    });
    document.querySelectorAll('.delete-poem-btn').forEach(button => {
        button.onclick = () => {
            console.log('Şiir sil butonuna tıklandı:', button.dataset.id);
            deletePoem(button.dataset.id);
        };
    });
    document.querySelectorAll('.add-comment-btn').forEach(button => {
        button.onclick = () => {
            console.log('Yorum yap butonuna tıklandı:', button.dataset.id);
            const commentText = button.previousElementSibling.value;
            addComment(button.dataset.id, commentText);
        };
    });
    document.querySelectorAll('.edit-comment-btn').forEach(button => {
        button.onclick = () => {
            console.log('Yorum düzenle butonuna tıklandı:', button.dataset.commentId);
            editComment(button.dataset.poemId, button.dataset.commentId, button.dataset.commentText);
        };
    });
    document.querySelectorAll('.delete-comment-btn').forEach(button => {
        button.onclick = () => {
            console.log('Yorum sil butonuna tıklandı:', button.dataset.commentId);
            deleteComment(button.dataset.poemId, button.dataset.commentId);
        };
    });
    document.querySelectorAll('.login-link').forEach(link => {
        link.onclick = (e) => {
            e.preventDefault();
            console.log('Giriş yap linkine tıklandı');
            showSection(authSection);
            showLoginOnly();
        };
    });
}

// Seçilen yorumları siler
async function deleteSelectedComments() {
    const selectedCommentIds = Array.from(document.querySelectorAll('.comment-checkbox:checked'))
        .map(checkbox => checkbox.dataset.commentId);
    if (selectedCommentIds.length === 0) {
        alert('Lütfen silmek için en az bir yorum seçin.');
        return;
    }
    if (confirm(`Seçilen ${selectedCommentIds.length} yorumu silmek istediğinizden emin misiniz?`)) {
        try {
            await apiRequest('/admin/comments/delete-many', 'POST', { commentIds: selectedCommentIds });
            alert('Seçilen yorumlar başarıyla silindi.');
            loadCommentsForAdmin();
            loadPoems();
        } catch (error) {
            console.error('Seçilen yorumlar silinirken hata:', error);
            alert('Seçilen yorumlar silinirken hata oluştu: ' + (error.message || 'Bilinmeyen Hata'));
        }
    }
}

// --- Event Listener'lar ---
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM yüklendi, kullanıcı ve şiirler yükleniyor...');
    loadUserFromStorage();
    showSection(poemsListSection);
});

poemsListLink.addEventListener('click', (e) => {
    e.preventDefault();
    console.log('Şiirler listesi linkine tıklandı');
    showSection(poemsListSection);
});

createPoemLink.addEventListener('click', (e) => {
    e.preventDefault();
    console.log('Şiir ekle linkine tıklandı');
    poemTitleInput.value = '';
    poemContentInput.value = '';
    showSection(addPoemSection);
});

userProfileLink.addEventListener('click', (e) => {
    e.preventDefault();
    console.log('Kullanıcı profili linkine tıklandı');
    if (currentUser) {
        showSection(userProfileSection);
    } else {
        alert('Profilinizi görüntülemek için giriş yapmalısınız.');
        showSection(authSection);
        showLoginOnly();
    }
});

adminPanelLink.addEventListener('click', (e) => {
    e.preventDefault();
    console.log('Yönetici paneli linkine tıklandı');
    if (currentUser && currentUser.role === 'admin') {
        showSection(adminPanelSection);
    } else {
        alert('Bu sayfayı görüntülemek için yönetici yetkiniz yok.');
        showSection(poemsListSection);
    }
});

document.getElementById('contact-link').addEventListener('click', (e) => {
    e.preventDefault();
    console.log('İletişim linkine tıklandı');
    showSection(contactSection);
});

document.getElementById('about-link').addEventListener('click', (e) => {
    e.preventDefault();
    console.log('Hikayem linkine tıklandı');
    showSection(aboutSection);
});

document.getElementById('auth-main-link').addEventListener('click', (e) => {
    e.preventDefault();
    console.log('Giriş/Kayıt linkine tıklandı');
    showSection(authSection);
    showLoginOnly();
});

document.getElementById('show-register-form-link').addEventListener('click', (e) => {
    e.preventDefault();
    console.log('Kayıt formu göster linkine tıklandı');
    showRegisterOnly();
});

document.getElementById('show-login-form-link').addEventListener('click', (e) => {
    e.preventDefault();
    console.log('Giriş formu göster linkine tıklandı');
    showLoginOnly();
});

loginForm.addEventListener('submit', login);
registerForm.addEventListener('submit', register);
addPoemBtn.addEventListener('click', addPoem);
logoutBtn.addEventListener('click', logout);
profileLogoutBtn.addEventListener('click', logout);
changePasswordBtn.addEventListener('click', changePassword);
saveEditedPoemBtn.addEventListener('click', saveEditedPoem);
cancelEditPoemBtn.addEventListener('click', () => showSection(poemsListSection));
saveEditedCommentBtn.addEventListener('click', saveEditedComment);
cancelCommentEditBtn.addEventListener('click', () => showSection(userProfileSection));
saveUserChangesBtn.addEventListener('click', saveUserChanges);
cancelUserManagementBtn.addEventListener('click', () => showSection(adminPanelSection));
document.getElementById('manage-poems-tab').addEventListener('click', () => {
    console.log('Şiirleri yönet sekmesine tıklandı');
    document.querySelectorAll('.admin-tab-content').forEach(tab => tab.classList.add('hidden'));
    document.getElementById('admin-poems-content').classList.remove('hidden');
    document.querySelectorAll('.admin-tab-btn').forEach(btn => btn.classList.remove('active-tab'));
    document.getElementById('manage-poems-tab').classList.add('active-tab');
    loadPoemsForAdmin();
});
document.getElementById('manage-users-tab').addEventListener('click', () => {
    console.log('Kullanıcıları yönet sekmesine tıklandı');
    document.querySelectorAll('.admin-tab-content').forEach(tab => tab.classList.add('hidden'));
    document.getElementById('admin-users-content').classList.remove('hidden');
    document.querySelectorAll('.admin-tab-btn').forEach(btn => btn.classList.remove('active-tab'));
    document.getElementById('manage-users-tab').classList.add('active-tab');
    loadUsersForAdmin();
});
document.getElementById('manage-comments-tab').addEventListener('click', () => {
    console.log('Yorumları yönet sekmesine tıklandı');
    document.querySelectorAll('.admin-tab-content').forEach(tab => tab.classList.add('hidden'));
    document.getElementById('admin-comments-content').classList.remove('hidden');
    document.querySelectorAll('.admin-tab-btn').forEach(btn => btn.classList.remove('active-tab'));
    document.getElementById('manage-comments-tab').classList.add('active-tab');
    loadCommentsForAdmin();
});
deleteSelectedCommentsBtn.addEventListener('click', () => {
    console.log('Seçilen yorumları sil butonuna tıklandı');
    deleteSelectedComments();
});

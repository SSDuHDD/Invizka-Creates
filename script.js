// ==== Открытие модальных окон для карточек ====

// Вспомогательная функция для debounce (оптимизация производительности)
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Вспомогательная функция для throttle (ограничение вызовов)
function throttle(func, limit) {
    let inThrottle;
    return function(...args) {
        if (!inThrottle) {
            func.apply(this, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

document.addEventListener('DOMContentLoaded', function() {
    // ==== Выдвижная панель (сайдбар) ====
    const menuToggle = document.getElementById('menu-toggle');
    const drawer = document.getElementById('drawer');
    
    // Создаем оверлей для затемнения фона
    const overlay = document.createElement('div');
    overlay.className = 'drawer-overlay';
    document.body.appendChild(overlay);
    
    // Кэшируем селекторы для повторного использования
    const htmlEl = document.documentElement;
    
    // Функция открытия панели
    function openDrawer() {
        drawer.classList.add('open');
        menuToggle.classList.add('active');
        overlay.classList.add('active');
        // Скрываем скроллбар на html, но место для него уже зарезервировано через scrollbar-gutter
        htmlEl.style.overflow = 'hidden';
    }
    
    // Функция закрытия панели
    function closeDrawer() {
        drawer.classList.remove('open');
        menuToggle.classList.remove('active');
        overlay.classList.remove('active');
        htmlEl.style.overflow = '';
    }
    
    // Обработчик клика на кнопку-гамбургер
    if (menuToggle) {
        menuToggle.addEventListener('click', function() {
            if (drawer.classList.contains('open')) {
                closeDrawer();
            } else {
                openDrawer();
            }
        });
    }

    // Обработчик клика на кнопку закрытия сайдбара
    const drawerCloseBtn = document.getElementById('drawer-close');
    if (drawerCloseBtn) {
        drawerCloseBtn.addEventListener('click', closeDrawer);
    }
    
    // Закрытие при клике на оверлей
    overlay.addEventListener('click', closeDrawer);
    
    // Закрытие при клике на ссылку в меню
    const drawerLinks = document.querySelectorAll('.drawer-link');
    drawerLinks.forEach(link => {
        link.addEventListener('click', closeDrawer);
    });
    
    // Закрытие по клавише Escape
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && drawer.classList.contains('open')) {
            closeDrawer();
        }
    });
    
    // Получаем все карточки
    const cards = document.querySelectorAll('.card');
    
    // ==== Переключение темы (включая кнопку в сайдбаре) ====
    const themeToggle = document.getElementById('theme-toggle-drawer');
    const html = document.documentElement;
    
    // Проверяем сохраненную тему (уже применена в инлайновом скрипте, но на всякий случай)
    const savedTheme = localStorage.getItem('theme') || 'light';
    if (savedTheme === 'dark') {
        html.classList.add('dark');
        if (themeToggle) {
            themeToggle.classList.add('dark');
            const themeIcon = themeToggle.querySelector('.theme-icon');
            if (themeIcon) themeIcon.textContent = '☀︎';
        }
    }
    
    // Обработчик переключения темы (для кнопки в сайдбаре)
    if (themeToggle) {
        themeToggle.addEventListener('click', function() {
            const themeIcon = themeToggle.querySelector('.theme-icon');
            if (html.classList.contains('dark')) {
                // Переключение на светлую тему (moon)
                html.classList.remove('dark');
                themeToggle.classList.remove('dark');
                if (themeIcon) themeIcon.textContent = '☾';
                localStorage.setItem('theme', 'light');
            } else {
                // Переключение на темную тему (sun)
                html.classList.add('dark');
                themeToggle.classList.add('dark');
                if (themeIcon) themeIcon.textContent = '☀︎';
                localStorage.setItem('theme', 'dark');
            }
        });
    }
    
    // ==== Аватар в верхней панели ====
    function updateTopBarAvatar() {
        const topBarAvatarImg = document.getElementById('top-bar-avatar-img');
        if (!topBarAvatarImg) return;
        
        try {
            const savedAvatar = localStorage.getItem('user_avatar');
            if (savedAvatar) {
                topBarAvatarImg.innerHTML = `<img src="${savedAvatar}" alt="Ваш профиль">`;
            } else {
                topBarAvatarImg.innerHTML = '<span class="no-avatar">👤</span>';
            }
        } catch (error) {
            console.error('Ошибка загрузки аватара:', error);
            topBarAvatarImg.innerHTML = '<span class="no-avatar">👤</span>';
        }
    }
    
    // Инициализируем аватар при загрузке страницы
    updateTopBarAvatar();
    
    // Создаем модальное окно (если его еще нет)
    if (!document.querySelector('.modal')) {
        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3 id="modal-title">Информация о человеке</h3>
                    <button class="close-btn" onclick="closeModal()">×</button>
                </div>
                <div class="modal-body">
                    <img id="modal-image" src="" alt="Фото">
                    <p id="modal-description"></p>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
    }
    
    // Добавляем обработчики клика на кнопки карточек
    cards.forEach(card => {
        const btn = card.querySelector('.btn-card');
        const personData = card.dataset.person;
        
        if (btn) {
            btn.addEventListener('click', function(e) {
                e.stopPropagation();
                e.preventDefault();
                openModal(personData);
            });
        }
        
        // Также можно открывать по клику на всю карточку
        card.addEventListener('click', function(e) {
            if (e.target.classList.contains('btn-card')) return;
            openModal(personData);
        });
    });

    // Функция для открытия модального окна
    window.openModal = function(personData) {
        const modal = document.querySelector('.modal');
        const modalContent = modal.querySelector('.modal-content');
        const modalTitle = modal.querySelector('#modal-title');
        const modalImage = modal.querySelector('#modal-image');
        const modalDescription = modal.querySelector('#modal-description');
        
        
        // Подготовка данных для каждого человека
        const peopleData = {
            'teacher-1': {
                title: 'Илья Высоцкий',
                image: 'https://i.ibb.co/v6H0q66H/photo-2026-03-14-12-46-39.jpg',
                description: 'Создатель официального аккаунта Дисненской школы, очень плохой тюбик'
            },
            'student-1': {
                title: 'Кто то тут будет.',
                image: 'https://picsum.photos/seed/student1/400/300.jpg',
                description: 'пусто'
            },
            'student-2': {
                title: 'Кто то тут будет.',
                image: 'https://picsum.photos/seed/student2/400/300.jpg',
                description: 'пусто'
            },
            'teacher-2': {
                title: 'Кто то тут будет.',
                image: 'https://picsum.photos/seed/teacher2/400/300.jpg',
                description: 'пусто'
            }
        };
        
        // Проверяем наличие данных
        if (peopleData[personData]) {
            const person = peopleData[personData];
            modalTitle.textContent = person.title;
            modalImage.src = person.image;
            modalImage.alt = person.title;
            modalDescription.textContent = person.description;
            
            // Показываем модальное окно с анимацией
            modal.style.display = 'flex';
            modal.classList.add('show');
            
            // Добавляем обработчик для закрытия по клику вне модального окна
            modal.onclick = function(e) {
                if (e.target === modal) {
                    closeModal();
                }
            };
        }
    };

    // Функция для закрытия модального окна
    window.closeModal = function() {
        const modal = document.querySelector('.modal');
        if (modal) {
            modal.classList.remove('show');
            // Скрываем модальное окно после завершения анимации
            setTimeout(() => {
                if (modal.style.display !== 'none') {
                    modal.style.display = 'none';
                }
            }, 300);
        }
    };

    // Закрытие по клавише Escape
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            closeModal();
        }
    });

    // ==== Плавная прокрутка к секции Гордость школы ====
    const primaryBtn = document.querySelector('.btn-primary');
    if (primaryBtn) {
        primaryBtn.addEventListener('click', function (e) {
            e.preventDefault();
            const prideSection = document.getElementById('pride');
            if (prideSection) {
                prideSection.scrollIntoView({ behavior: 'smooth' });
            }
        });
    }

    // ==== Инициализация страницы профиля ====
    initProfilePage();

    // ==== Инициализация чата ====
    if (document.getElementById('chat-container')) {
        initChat();
    }
});

// ============================================
// ФУНКЦИИ СТРАНИЦЫ ПРОФИЛЯ
// ============================================
function initProfilePage() {
    // Проверяем, находимся ли мы на странице профиля
    const profileSection = document.querySelector('.profile-section');
    if (!profileSection) return;

    // Элементы формы
    const uidInput = document.getElementById('user-uid');
    const nicknameInput = document.getElementById('user-nickname');
    const emailInput = document.getElementById('user-email');
    const bioInput = document.getElementById('user-bio');
    const avatarPreview = document.getElementById('avatar-preview');
    const currentAvatar = document.getElementById('current-avatar');
    const avatarUpload = document.getElementById('avatar-upload');
    const removeAvatarBtn = document.getElementById('remove-avatar');
    const saveBtn = document.getElementById('save-profile');
    const clearBtn = document.getElementById('clear-profile');
    const saveMessage = document.getElementById('save-message');
    const saveMessageText = document.getElementById('save-message-text');
    const createdDateSpan = document.getElementById('created-date');
    const updatedDateSpan = document.getElementById('updated-date');

    // Ключи для localStorage
    const PROFILE_KEY = 'user_profile';
    const AVATAR_KEY = 'user_avatar';
    const UID_KEY = 'user_uid';

    // Генерация уникального UID (6 цифр, все от 1 до 9)
    function generateUID() {
        let uid = '';
        // Генерируем 6 цифр, каждая от 1 до 9
        for (let i = 0; i < 6; i++) {
            uid += Math.floor(Math.random() * 9) + 1;
        }
        return uid;
    }

    // Загрузка профиля из localStorage
    function loadProfile() {
        try {
            const savedProfile = localStorage.getItem(PROFILE_KEY);
            if (savedProfile) {
                const profile = JSON.parse(savedProfile);
                uidInput.textContent = profile.uid || '';
                nicknameInput.value = profile.nickname || '';
                emailInput.value = profile.email || '';
                bioInput.value = profile.bio || '';
                
                if (profile.createdAt) {
                    createdDateSpan.textContent = formatDate(profile.createdAt);
                }
                if (profile.updatedAt) {
                    updatedDateSpan.textContent = formatDate(profile.updatedAt);
                }

                // Загружаем аватар
                const savedAvatar = localStorage.getItem(AVATAR_KEY);
                if (savedAvatar) {
                    currentAvatar.src = savedAvatar;
                    currentAvatar.style.display = 'block';
                    updateAvatarPreview(null, savedAvatar);
                } else {
                    showNoAvatar();
                }
            } else {
                // Пытаемся загрузить сохраненный UID
                let uid = localStorage.getItem(UID_KEY);
                if (!uid) {
                    // Если UID нет, создаем новый и сохраняем его
                    uid = generateUID();
                    localStorage.setItem(UID_KEY, uid);
                }
                uidInput.textContent = uid;
                showNoAvatar();
            }
        } catch (error) {
            console.error('Ошибка загрузки профиля:', error);
            showMessage('Ошибка загрузки профиля', 'error');
        }
    }

    // Сохранение профиля
    function saveProfile() {
        try {
            const nickname = nicknameInput.value.trim();
            const email = emailInput.value.trim();
            
            if (!nickname) {
                showMessage('Никнейм обязателен', 'error');
                return;
            }

            // Валидация email (если поле не пустое)
            if (email && !isValidEmail(email)) {
                showMessage('Введите корректный email адрес', 'error');
                return;
            }

            // Получаем существующий профиль, чтобы сохранить тот же UID
            const existingProfile = localStorage.getItem(PROFILE_KEY);
            let uid;
            
            if (existingProfile) {
                // Если профиль уже существует, используем существующий UID (он не меняется)
                const oldProfile = JSON.parse(existingProfile);
                uid = oldProfile.uid;
            } else {
                // Если профиль новый, используем сохраненный UID или генерируем новый
                uid = localStorage.getItem(UID_KEY) || generateUID();
                // Сохраняем UID на будущее (если только что сгенерировали)
                if (!localStorage.getItem(UID_KEY)) {
                    localStorage.setItem(UID_KEY, uid);
                }
                uidInput.textContent = uid; // Устанавливаем UID
            }

            const profile = {
                uid: uid,
                nickname: nickname,
                email: email,
                bio: bioInput.value.trim(),
                updatedAt: new Date().toISOString()
            };

            // Если это первое сохранение, добавляем createdAt
            if (!existingProfile) {
                profile.createdAt = profile.updatedAt;
            } else {
                const oldProfile = JSON.parse(existingProfile);
                profile.createdAt = oldProfile.createdAt || profile.updatedAt;
            }

            localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));

            // Обновляем дату обновления
            updatedDateSpan.textContent = formatDate(profile.updatedAt);
            if (!createdDateSpan.textContent || createdDateSpan.textContent === '-') {
                createdDateSpan.textContent = formatDate(profile.createdAt);
            }

            showMessage('Профиль успешно сохранен', 'success');
            
            // Обновляем аватар в верхней панели
            if (typeof updateTopBarAvatar === 'function') {
                updateTopBarAvatar();
            }
        } catch (error) {
            console.error('Ошибка сохранения профиля:', error);
            showMessage('Ошибка сохранения профиля', 'error');
        }
    }

    // Функция валидации email
    function isValidEmail(email) {
        // Простая, но эффективная регулярная валидация email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    // Очистка профиля
    function clearProfile() {
        if (confirm('Вы уверены, что хотите очистить профиль? Это действие нельзя отменить.')) {
            localStorage.removeItem(PROFILE_KEY);
            localStorage.removeItem(AVATAR_KEY);
            
            // Сбрасываем форму
            nicknameInput.value = '';
            emailInput.value = '';
            bioInput.value = '';
            showNoAvatar();
            
            // Загружаем сохраненный UID (не генерируем новый)
            const savedUid = localStorage.getItem(UID_KEY);
            if (savedUid) {
                uidInput.textContent = savedUid;
            } else {
                // Если по какой-то причине UID нет, создаем новый
                const newUid = generateUID();
                uidInput.textContent = newUid;
                localStorage.setItem(UID_KEY, newUid);
            }
            
            createdDateSpan.textContent = '-';
            updatedDateSpan.textContent = '-';
            
            showMessage('Профиль очищен', 'success');
            
            // Обновляем аватар в верхней панели
            if (typeof updateTopBarAvatar === 'function') {
                updateTopBarAvatar();
            }
        }
    }

    // Обработка загрузки аватара
    function handleAvatarUpload(event) {
        const file = event.target.files[0];
        if (!file) return;

        if (!file.type.startsWith('image/')) {
            showMessage('Пожалуйста, выберите изображение', 'error');
            return;
        }

        if (file.size > 5 * 1024 * 1024) { // 5MB
            showMessage('Изображение слишком большое (макс. 5MB)', 'error');
            return;
        }

        const reader = new FileReader();
        reader.onload = function(e) {
            const base64Image = e.target.result;
            currentAvatar.src = base64Image;
            currentAvatar.style.display = 'block';
            localStorage.setItem(AVATAR_KEY, base64Image);
            showMessage('Аватар загружен', 'success');
            
            // Обновляем аватар в верхней панели
            if (typeof updateTopBarAvatar === 'function') {
                updateTopBarAvatar();
            }
        };
        reader.readAsDataURL(file);
    }

    // Удаление аватара
    function removeAvatar() {
        localStorage.removeItem(AVATAR_KEY);
        showNoAvatar();
        showMessage('Аватар удален', 'success');
        
        // Обновляем аватар в верхней панели
        if (typeof updateTopBarAvatar === 'function') {
            updateTopBarAvatar();
        }
    }

    // Обновление превью аватара
    function updateAvatarPreview(event, base64Data) {
        if (event) {
            const file = event.target.files[0];
            if (!file) return;
            
            const reader = new FileReader();
            reader.onload = function(e) {
                currentAvatar.src = e.target.result;
                currentAvatar.style.display = 'block';
            };
            reader.readAsDataURL(file);
        } else if (base64Data) {
            currentAvatar.src = base64Data;
            currentAvatar.style.display = 'block';
        }
    }

    // Показ "нет аватара"
    function showNoAvatar() {
        currentAvatar.style.display = 'none';
        const noAvatar = document.createElement('span');
        noAvatar.className = 'no-avatar';
        noAvatar.textContent = '👤';
        avatarPreview.innerHTML = '';
        avatarPreview.appendChild(noAvatar);
    }

    // Показ сообщения
    function showMessage(text, type) {
        saveMessageText.textContent = text;
        saveMessage.className = 'save-message ' + type;
        saveMessage.classList.remove('hidden');
        
        setTimeout(() => {
            saveMessage.classList.add('hidden');
        }, 3000);
    }

    // Форматирование даты
    function formatDate(isoString) {
        const date = new Date(isoString);
        return date.toLocaleDateString('ru-RU', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    // Назначаем обработчики событий
    if (saveBtn) {
        saveBtn.addEventListener('click', saveProfile);
    }

    if (clearBtn) {
        clearBtn.addEventListener('click', clearProfile);
    }

    if (avatarUpload) {
        avatarUpload.addEventListener('change', handleAvatarUpload);
    }

    if (removeAvatarBtn) {
        removeAvatarBtn.addEventListener('click', removeAvatar);
    }

    // Автосохранение при изменении полей (через debounce)
    let saveTimeout;
    const autoSaveFields = [nicknameInput, emailInput, bioInput];
    autoSaveFields.forEach(field => {
        if (field) {
            field.addEventListener('input', debounce(() => {
                // Не сохраняем автоматически, только ручное сохранение
                // Но можно раскомментировать для автосохранения:
                // saveProfile();
            }, 1000));
        }
    });

    // Загружаем профиль при открытии страницы
    loadProfile();
    
    // ==== Счетчик символов для полей профиля ====
    const nicknameField = document.getElementById('user-nickname');
    const bioField = document.getElementById('user-bio');
    const nicknameCounter = document.getElementById('nickname-count');
    const bioCounter = document.getElementById('bio-count');
    
    if (nicknameField && nicknameCounter) {
        // Инициализируем счетчик
        nicknameCounter.textContent = nicknameField.value.length;
        
        nicknameField.addEventListener('input', function() {
            const length = this.value.length;
            nicknameCounter.textContent = length;
            
            // Добавляем классы для визуальной индикации
            const parent = nicknameCounter.parentElement;
            parent.classList.remove('warning', 'danger');
            
            if (length >= 45) {
                parent.classList.add('danger');
            } else if (length >= 35) {
                parent.classList.add('warning');
            }
        });
    }
    
    if (bioField && bioCounter) {
        // Инициализируем счетчик
        bioCounter.textContent = bioField.value.length;
        
        bioField.addEventListener('input', function() {
            const length = this.value.length;
            bioCounter.textContent = length;
            
            // Добавляем классы для визуальной индикации
            const parent = bioCounter.parentElement;
            parent.classList.remove('warning', 'danger');
            
            if (length >= 450) {
                parent.classList.add('danger');
            } else if (length >= 400) {
                parent.classList.add('warning');
            }
        });
    }
}

// ============================================
// ФУНКЦИИ ЧАТА (ФОРУМ)
// ============================================
let currentUserProfile = null;

// Инициализация чата
function initChat() {
    const chatContainer = document.getElementById('chat-container');
    const noProfileMessage = document.getElementById('no-profile-message');
    const participantsList = document.getElementById('participants-list');
    const messagesContainer = document.getElementById('messages-container');
    const messageInput = document.getElementById('message-input');
    const sendButton = document.getElementById('send-button');
    const currentUserAvatar = document.getElementById('current-user-avatar');
    const currentUserName = document.getElementById('current-user-name');
    const onlineCount = document.getElementById('online-count');

    // Проверяем, есть ли профиль
    const profile = getCurrentUserProfile();

    if (!profile) {
        // Если профиля нет, скрываем информацию о текущем пользователе и блокируем отправку
        const currentUserInfo = document.querySelector('.current-user-info');
        if (currentUserInfo) {
            currentUserInfo.style.display = 'none';
        }
        if (sendButton) sendButton.disabled = true;
        if (messageInput) {
            messageInput.placeholder = 'Создайте профиль для отправки сообщений';
            messageInput.disabled = true;
        }
        loadMessages();
        loadParticipants();
        updateOnlineCount();
        return;
    }

    currentUserProfile = profile;

    // Показываем текущего пользователя
    updateCurrentUserDisplay();

    // Загружаем сообщения
    loadMessages();

    // Загружаем участников
    loadParticipants();

    // Обновляем счетчик онлайн
    updateOnlineCount();

    // Обработчик отправки сообщения
    if (sendButton) {
        sendButton.addEventListener('click', sendMessage);
    }

    // Отправка по Enter (с поддержкой Shift+Enter для новой строки)
    if (messageInput) {
        messageInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                sendMessage();
            }
        });
    }
}

// Получение профиля текущего пользователя
function getCurrentUserProfile() {
    try {
        const savedProfile = localStorage.getItem('user_profile');
        const savedAvatar = localStorage.getItem('user_avatar');
        
        if (savedProfile) {
            const profile = JSON.parse(savedProfile);
            if (profile.nickname) {
                return {
                    ...profile,
                    avatar: savedAvatar || null
                };
            }
        }
    } catch (error) {
        console.error('Ошибка получения профиля:', error);
    }
    return null;
}

// Обновление отображения текущего пользователя
function updateCurrentUserDisplay() {
    const currentUserAvatar = document.getElementById('current-user-avatar');
    const currentUserName = document.getElementById('current-user-name');

    if (currentUserProfile && currentUserName && currentUserAvatar) {
        currentUserName.textContent = currentUserProfile.nickname;
        
        if (currentUserProfile.avatar) {
            currentUserAvatar.innerHTML = `<img src="${currentUserProfile.avatar}" alt="${currentUserProfile.nickname}">`;
        } else {
            currentUserAvatar.innerHTML = '<span class="no-avatar">👤</span>';
        }
    }
}

// Загрузка сообщений из localStorage
function loadMessages() {
    const messagesContainer = document.getElementById('messages-container');
    if (!messagesContainer) return;
    
    try {
        const savedMessages = localStorage.getItem('chat_messages');
        if (savedMessages) {
            const messages = JSON.parse(savedMessages);
            messagesContainer.innerHTML = '';
            messages.forEach(msg => {
                renderMessage(msg);
            });
            scrollToBottom();
        }
    } catch (error) {
        console.error('Ошибка загрузки сообщений:', error);
    }
}

// Сохранение сообщения в localStorage
function saveMessage(message) {
    try {
        const savedMessages = localStorage.getItem('chat_messages');
        let messages = savedMessages ? JSON.parse(savedMessages) : [];
        messages.push(message);
        // Ограничиваем историю до 1000 сообщений
        if (messages.length > 1000) {
            messages = messages.slice(-1000);
        }
        localStorage.setItem('chat_messages', JSON.stringify(messages));
    } catch (error) {
        console.error('Ошибка сохранения сообщения:', error);
        showChatMessage('Ошибка отправки сообщения', 'error');
    }
}

// Отображение сообщения
function renderMessage(message) {
    const messagesContainer = document.getElementById('messages-container');
    if (!messagesContainer) return;
    
    const isOwn = currentUserProfile && message.uid === currentUserProfile.uid;

    const messageEl = document.createElement('div');
    messageEl.className = `message ${isOwn ? 'own' : ''}`;
    messageEl.dataset.uid = message.uid;
    messageEl.dataset.messageId = message.id;

    const time = new Date(message.timestamp).toLocaleTimeString('ru-RU', {
        hour: '2-digit',
        minute: '2-digit'
    });

    const avatarHtml = message.avatar
        ? `<img src="${message.avatar}" alt="${message.nickname}">`
        : `<span class="no-avatar">👤</span>`;

    // Получаем количество лайков
    const likes = getLikesForMessage(message.id);
    const likeCount = likes.length;
    const isLikedByCurrentUser = currentUserProfile && likes.includes(currentUserProfile.uid);

    // Создаем HTML для ответа
    let replyHtml = '';
    if (message.replyTo) {
        replyHtml = `
            <div class="reply-reference">
                <div class="reply-header">
                    <span class="reply-nickname">${escapeHtml(message.replyTo.nickname)}</span>
                </div>
                <div class="reply-text">${escapeHtml(message.replyTo.text)}</div>
            </div>
        `;
    }

    messageEl.innerHTML = `
        <div class="message-avatar" onclick="showUserProfile('${message.uid}')">
            ${avatarHtml}
        </div>
        <div class="message-content">
            <div class="message-header">
                <span class="message-nickname">${escapeHtml(message.nickname)}</span>
                <span class="message-time">${time}</span>
            </div>
            <div class="message-bubble">
                ${replyHtml}
                <p>${escapeHtml(message.text)}</p>
                ${likeCount > 0 ? `
                <div class="like-container">
                    <button class="like-btn ${isLikedByCurrentUser ? 'liked' : ''}" data-message-id="${message.id}">
                        👍
                    </button>
                    <span class="like-count">${likeCount}</span>
                </div>
                ` : ''}
            </div>
            <div class="message-actions"></div>
        </div>
    `;

    messagesContainer.appendChild(messageEl);

    // Загружаем и отображаем реакции для этого сообщения
    updateReactionsDisplay(message.id);

    // Добавляем контекстное меню (правая кнопка мыши / долгое нажатие) для всех сообщений
    messageEl.addEventListener('contextmenu', (e) => {
        e.preventDefault();
        showContextMenu(e, message.id, messageEl);
    });

    // Долгое нажатие на мобильных устройствах
    let pressTimer;
    const startLongPress = (e) => {
        // Не запускаем при клике на аватар
        if (e.target.closest('.message-avatar')) {
            return;
        }
        pressTimer = setTimeout(() => {
            // Создаем искусственное событие для showContextMenu
            const fakeEvent = {
                preventDefault: () => {},
                clientX: e.clientX || e.touches[0].clientX,
                clientY: e.clientY || e.touches[0].clientY
            };
            showContextMenu(fakeEvent, message.id, messageEl);
        }, 800); // 800ms для долгого нажатия
    };

    const cancelLongPress = () => {
        if (pressTimer) {
            clearTimeout(pressTimer);
            pressTimer = null;
        }
    };

    messageEl.addEventListener('touchstart', startLongPress, { passive: true });
    messageEl.addEventListener('touchend', cancelLongPress);
    messageEl.addEventListener('touchmove', cancelLongPress);

    // Обработчик лайка (клик по кнопке) - для всех сообщений
    const likeBtn = messageEl.querySelector('.like-btn');
    if (likeBtn) {
        likeBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            toggleLike(message.id);
        });
    }

    // Двойное нажатие на сообщение для лайка - для всех сообщений
    messageEl.addEventListener('dblclick', (e) => {
        // Не лайкаем при клике на кнопки или аватар
        if (e.target.closest('.context-menu') || e.target.closest('.message-avatar') || e.target.closest('.like-btn')) {
            return;
        }
        toggleLike(message.id);
    });
}

// Экранирование HTML для безопасности
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Прокрутка вниз
function scrollToBottom() {
    const messagesContainer = document.getElementById('messages-container');
    if (messagesContainer) {
        setTimeout(() => {
            messagesContainer.scrollTop = messagesContainer.scrollHeight;
        }, 50);
    }
}

// Загрузка списка участников
function loadParticipants() {
    const participantsList = document.getElementById('participants-list');
    if (!participantsList) return;
    
    try {
        const savedMessages = localStorage.getItem('chat_messages');
        let participants = new Map();
        
        if (savedMessages) {
            const messages = JSON.parse(savedMessages);
            messages.forEach(msg => {
                if (!participants.has(msg.uid)) {
                    participants.set(msg.uid, {
                        uid: msg.uid,
                        nickname: msg.nickname,
                        avatar: msg.avatar
                    });
                }
            });
        }
        
        // Добавляем текущего пользователя, если его нет в сообщениях
        if (currentUserProfile && !participants.has(currentUserProfile.uid)) {
            participants.set(currentUserProfile.uid, {
                uid: currentUserProfile.uid,
                nickname: currentUserProfile.nickname,
                avatar: currentUserProfile.avatar
            });
        }
        
        // Рендерим список
        participantsList.innerHTML = '';
        participants.forEach(participant => {
            const participantEl = document.createElement('div');
            participantEl.className = 'participant-item';
            participantEl.onclick = () => showUserProfile(participant.uid);
            
            const avatarHtml = participant.avatar
                ? `<img src="${participant.avatar}" alt="${participant.nickname}">`
                : `<span class="no-avatar">👤</span>`;
            
            participantEl.innerHTML = `
                <div class="participant-avatar">
                    ${avatarHtml}
                </div>
                <div class="participant-info">
                    <div class="participant-nickname">${escapeHtml(participant.nickname)}</div>
                    <div class="participant-uid">UID: ${participant.uid}</div>
                </div>
            `;
            participantsList.appendChild(participantEl);
        });
        
        updateOnlineCount(participants.size);
        
    } catch (error) {
        console.error('Ошибка загрузки участников:', error);
    }
}

// Обновление счетчика онлайн
function updateOnlineCount(count) {
    const onlineCount = document.getElementById('online-count');
    if (!onlineCount) return;
    
    if (count === undefined) {
        // Подсчитываем уникальных участников
        const participantsList = document.getElementById('participants-list');
        if (participantsList) {
            count = participantsList.children.length;
        }
    }
    onlineCount.textContent = `${count} онлайн`;
}

// Показ сообщения в чате (для уведомлений)
function showChatMessage(text, type = 'info') {
    // Можно добавить временное уведомление
    console.log(`[${type}] ${text}`);
}

// Модальное окно профиля пользователя
function showUserProfile(uid) {
    const modal = document.getElementById('user-profile-modal');
    if (!modal) return;
    
    const modalAvatar = document.getElementById('modal-user-avatar');
    const modalNickname = document.getElementById('modal-user-nickname');
    const modalUid = document.getElementById('modal-user-uid');
    const modalEmail = document.getElementById('modal-user-email');
    const modalBio = document.getElementById('modal-user-bio');
    const modalCreated = document.getElementById('modal-user-created');

    // Ищем профиль в localStorage по UID
    try {
        const savedProfile = localStorage.getItem('user_profile');
        if (savedProfile) {
            const profile = JSON.parse(savedProfile);
            // Показываем профиль текущего пользователя, если UID совпадает
            if (profile.uid === uid) {
                fillProfileModal(profile, currentUserProfile?.avatar);
                modal.classList.remove('hidden');
                return;
            }
        }
        
        // Ищем среди всех сообщений
        const savedMessages = localStorage.getItem('chat_messages');
        if (savedMessages) {
            const messages = JSON.parse(savedMessages);
            const userMessages = messages.filter(msg => msg.uid === uid);
            if (userMessages.length > 0) {
                const lastMessage = userMessages[userMessages.length - 1];
                const profile = {
                    uid: lastMessage.uid,
                    nickname: lastMessage.nickname,
                    avatar: lastMessage.avatar,
                    email: '',
                    bio: '',
                    createdAt: lastMessage.timestamp
                };
                fillProfileModal(profile, lastMessage.avatar);
                modal.classList.remove('hidden');
                return;
            }
        }
        
        // Если не нашли, показываем минимальную информацию
        modalNickname.textContent = 'Неизвестный пользователь';
        modalUid.textContent = `UID: ${uid}`;
        modalEmail.textContent = 'Не указан';
        modalBio.textContent = 'Нет информации';
        modalCreated.textContent = 'Неизвестно';
        modalAvatar.innerHTML = '<span class="no-avatar">👤</span>';
        modal.classList.remove('hidden');
        
    } catch (error) {
        console.error('Ошибка загрузки профиля:', error);
    }
}

// Заполнение модального окна профилем
function fillProfileModal(profile, avatar) {
    const modalAvatar = document.getElementById('modal-user-avatar');
    const modalNickname = document.getElementById('modal-user-nickname');
    const modalUid = document.getElementById('modal-user-uid');
    const modalEmail = document.getElementById('modal-user-email');
    const modalBio = document.getElementById('modal-user-bio');
    const modalCreated = document.getElementById('modal-user-created');

    modalNickname.textContent = profile.nickname;
    modalUid.textContent = `UID: ${profile.uid}`;
    modalEmail.textContent = profile.email || 'Не указан';
    modalBio.textContent = profile.bio || 'Нет информации';

    if (profile.createdAt) {
        const date = new Date(profile.createdAt);
        modalCreated.textContent = date.toLocaleDateString('ru-RU', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    } else {
        modalCreated.textContent = 'Неизвестно';
    }

    if (avatar) {
        modalAvatar.innerHTML = `<img src="${avatar}" alt="${profile.nickname}">`;
    } else {
        modalAvatar.innerHTML = '<span class="no-avatar">👤</span>';
    }
}

// Закрытие модального окна профиля
function closeUserProfileModal() {
    const modal = document.getElementById('user-profile-modal');
    if (modal) {
        modal.classList.add('hidden');
    }
}

// Закрытие модального окна по клику вне его
document.addEventListener('click', function(e) {
    const modal = document.getElementById('user-profile-modal');
    if (modal && !modal.classList.contains('hidden')) {
        if (e.target === modal) {
            closeUserProfileModal();
        }
    }
});

// Закрытие по Escape
document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
        closeUserProfileModal();
    }
});

// Закрытие контекстного меню при клике вне его
document.addEventListener('click', function(e) {
    if (!e.target.closest('.context-menu')) {
        const contextMenu = document.getElementById('context-menu');
        if (contextMenu) {
            contextMenu.classList.remove('show');
        }
    }
});

// Закрытие контекстного меню по Escape
document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
        const contextMenu = document.getElementById('context-menu');
        if (contextMenu) {
            contextMenu.classList.remove('show');
        }
    }
});

// ============================================
// ЛАЙКИ
// ============================================
// Получение лайков для сообщения
function getLikesForMessage(messageId) {
    try {
        const savedLikes = localStorage.getItem('message_likes');
        const likes = savedLikes ? JSON.parse(savedLikes) : {};
        return likes[messageId] || [];
    } catch (error) {
        console.error('Ошибка получения лайков:', error);
        return [];
    }
}

// Сохранение лайков
function saveLikes(messageId, likes) {
    try {
        const savedLikes = localStorage.getItem('message_likes');
        const allLikes = savedLikes ? JSON.parse(savedLikes) : {};
        allLikes[messageId] = likes;
        localStorage.setItem('message_likes', JSON.stringify(allLikes));
    } catch (error) {
        console.error('Ошибка сохранения лайков:', error);
    }
}

// Переключение лайка
function toggleLike(messageId) {
    if (!currentUserProfile) {
        showChatMessage('Необходимо создать профиль', 'error');
        return;
    }

    const likes = getLikesForMessage(messageId);
    const uid = currentUserProfile.uid;
    const index = likes.indexOf(uid);

    if (index === -1) {
        // Добавляем лайк
        likes.push(uid);
    } else {
        // Удаляем лайк
        likes.splice(index, 1);
    }

    saveLikes(messageId, likes);
    updateLikeDisplay(messageId);
}

// Обновление отображения лайка
function updateLikeDisplay(messageId) {
    const messageEl = document.querySelector(`[data-message-id="${messageId}"]`);
    if (!messageEl) return;

    const likes = getLikesForMessage(messageId);
    const likeCount = likes.length;
    const isLikedByCurrentUser = currentUserProfile && likes.includes(currentUserProfile.uid);

    const likeContainer = messageEl.querySelector('.like-container');
    const likeBtn = messageEl.querySelector('.like-btn');
    const likeCountSpan = messageEl.querySelector('.like-count');

    if (likeCount === 0) {
        // Скрываем контейнер лайков если количество 0
        if (likeContainer) {
            likeContainer.remove();
        }
    } else {
        // Показываем или создаем контейнер лайков
        let container = likeContainer;
        if (!container) {
            container = document.createElement('div');
            container.className = 'like-container';
            
            const btn = document.createElement('button');
            btn.className = `like-btn ${isLikedByCurrentUser ? 'liked' : ''}`;
            btn.dataset.messageId = messageId;
            btn.innerHTML = '👍';
            
            const countSpan = document.createElement('span');
            countSpan.className = 'like-count';
            countSpan.textContent = likeCount;
            
            container.appendChild(btn);
            container.appendChild(countSpan);
            
            const messageBubble = messageEl.querySelector('.message-bubble');
            messageBubble.appendChild(container);
            
            // Добавляем обработчик клика на кнопку лайка
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                toggleLike(messageId);
            });
        } else {
            if (likeBtn) {
                likeBtn.classList.toggle('liked', isLikedByCurrentUser);
            }
            if (likeCountSpan) {
                likeCountSpan.textContent = likeCount;
            }
        }
    }
}

// ============================================
// РЕАКЦИИ (СЕРДЦЕ И ПАЛЕЦ ВВЕРХ)
// ============================================
// Хранение реакций: { messageId: { emoji: [uid1, uid2, ...] } }
function addReaction(messageId, emoji) {
    if (!currentUserProfile) {
        showChatMessage('Необходимо создать профиль', 'error');
        return;
    }

    try {
        const savedReactions = localStorage.getItem('message_reactions');
        const allReactions = savedReactions ? JSON.parse(savedReactions) : {};
        
        // Инициализируем структуру для сообщения если её нет
        if (!allReactions[messageId]) {
            allReactions[messageId] = {};
        }
        
        // Инициализируем массив для эмодзи если его нет
        if (!allReactions[messageId][emoji]) {
            allReactions[messageId][emoji] = [];
        }
        
        const uid = currentUserProfile.uid;
        const userReactions = allReactions[messageId][emoji];
        const index = userReactions.indexOf(uid);
        
        if (index === -1) {
            // Добавляем реакцию
            userReactions.push(uid);
        } else {
            // Удаляем реакцию (переключение)
            userReactions.splice(index, 1);
        }
        
        // Сохраняем
        localStorage.setItem('message_reactions', JSON.stringify(allReactions));
        
        // Обновляем отображение реакций
        updateReactionsDisplay(messageId);
    } catch (error) {
        console.error('Ошибка сохранения реакций:', error);
        showChatMessage('Ошибка добавления реакции', 'error');
    }
}

// Получение реакций для сообщения
function getReactionsForMessage(messageId) {
    try {
        const savedReactions = localStorage.getItem('message_reactions');
        const allReactions = savedReactions ? JSON.parse(savedReactions) : {};
        return allReactions[messageId] || {};
    } catch (error) {
        console.error('Ошибка получения реакций:', error);
        return {};
    }
}

// Обновление отображения реакций
function updateReactionsDisplay(messageId) {
    const messageEl = document.querySelector(`[data-message-id="${messageId}"]`);
    if (!messageEl) return;

    const reactions = getReactionsForMessage(messageId);
    const messageBubble = messageEl.querySelector('.message-bubble');
    
    // Удаляем старый контейнер реакций
    const oldReactionsContainer = messageEl.querySelector('.reactions-container');
    if (oldReactionsContainer) {
        oldReactionsContainer.remove();
    }
    
    // Создаем новый контейнер если есть реакции
    const reactionEmojis = Object.keys(reactions).filter(emoji => reactions[emoji].length > 0);
    
    if (reactionEmojis.length > 0) {
        const reactionsContainer = document.createElement('div');
        reactionsContainer.className = 'reactions-container';
        
        reactionEmojis.forEach(emoji => {
            const users = reactions[emoji];
            const reactionBtn = document.createElement('button');
            reactionBtn.className = `reaction-btn ${users.includes(currentUserProfile?.uid) ? 'reacted' : ''}`;
            reactionBtn.dataset.emoji = emoji;
            reactionBtn.innerHTML = `
                <span class="reaction-emoji">${emoji}</span>
                <span class="reaction-count">${users.length}</span>
            `;
            
            reactionBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                addReaction(messageId, emoji);
            });
            
            reactionsContainer.appendChild(reactionBtn);
        });
        
        // Добавляем контейнер реакций после текста сообщения
        const textElement = messageBubble.querySelector('p');
        if (textElement) {
            textElement.insertAdjacentElement('afterend', reactionsContainer);
        }
    }
}

// ============================================
// ОТВЕТЫ НА СООБЩЕНИЯ (Telegram-style)
// ============================================
let replyToMessageId = null; // ID сообщения, на которое отвечаем
let replyToMessageData = null; // Данные сообщения, на которое отвечаем

// Включение режима ответа
function enableReplyMode(messageId, messageEl) {
    const messageBubble = messageEl.querySelector('.message-bubble');
    const nickname = messageEl.querySelector('.message-nickname').textContent;
    const text = messageBubble.querySelector('p').textContent;
    
    replyToMessageId = messageId;
    replyToMessageData = {
        nickname: nickname,
        text: text,
        messageId: messageId
    };
    
    // Показываем индикатор ответа в области ввода
    const replyIndicator = document.getElementById('reply-indicator') || createReplyIndicator();
    replyIndicator.querySelector('.reply-to-nickname').textContent = nickname;
    replyIndicator.querySelector('.reply-to-text').textContent = text;
    replyIndicator.style.display = 'flex';
    
    // Фокусируемся на поле ввода
    const messageInput = document.getElementById('message-input');
    if (messageInput) {
        messageInput.focus();
    }
    
    // Добавляем обработчик для отмены ответа
    const cancelReplyBtn = replyIndicator.querySelector('.cancel-reply');
    if (cancelReplyBtn) {
        cancelReplyBtn.onclick = cancelReply;
    }
}

// Создание индикатора ответа
function createReplyIndicator() {
    const chatMain = document.querySelector('.chat-main');
    const chatInputArea = document.querySelector('.chat-input-area');
    if (!chatMain || !chatInputArea) return null;
    
    const replyIndicator = document.createElement('div');
    replyIndicator.id = 'reply-indicator';
    replyIndicator.className = 'reply-indicator';
    replyIndicator.innerHTML = `
        <div class="reply-to-info">
            <span class="reply-to-label">Ответ на:</span>
            <span class="reply-to-nickname"></span>
            <span class="reply-to-text"></span>
        </div>
        <button class="cancel-reply" title="Отменить ответ">&times;</button>
    `;
    
    // Insert the reply indicator before the chat input area within the chat main
    chatMain.insertBefore(replyIndicator, chatInputArea);
    return replyIndicator;
}

// Отмена режима ответа
function cancelReply() {
    replyToMessageId = null;
    replyToMessageData = null;
    
    const replyIndicator = document.getElementById('reply-indicator');
    if (replyIndicator) {
        replyIndicator.style.display = 'none';
    }
}

// Обновленная функция sendMessage для поддержки ответов
function sendMessage() {
    const messageInput = document.getElementById('message-input');
    const text = messageInput ? messageInput.value.trim() : '';

    if (!text) return;

    if (!currentUserProfile) {
        showChatMessage('Необходимо создать профиль', 'error');
        return;
    }

    const message = {
        id: Date.now() + Math.random(),
        uid: currentUserProfile.uid,
        nickname: currentUserProfile.nickname,
        avatar: currentUserProfile.avatar,
        text: text,
        timestamp: new Date().toISOString(),
        replyTo: replyToMessageId ? {
            messageId: replyToMessageId,
            nickname: replyToMessageData.nickname,
            text: replyToMessageData.text
        } : null
    };

    // Сохраняем в localStorage
    saveMessage(message);

    // Отображаем сообщение
    renderMessage(message);

    // Очищаем поле ввода и сбрасываем ответ
    if (messageInput) {
        messageInput.value = '';
        messageInput.style.height = 'auto';
    }
    cancelReply();

    // Прокручиваем вниз
    scrollToBottom();

    // Обновляем список участников
    loadParticipants();
}

// ============================================
// КОНТЕКСТНОЕ МЕНЮ
// ============================================
function showContextMenu(event, messageId, messageEl) {
    // Создаем контекстное меню, если его еще нет
    let contextMenu = document.getElementById('context-menu');
    if (!contextMenu) {
        contextMenu = document.createElement('div');
        contextMenu.id = 'context-menu';
        contextMenu.className = 'context-menu';
        document.body.appendChild(contextMenu);
    }

    // Проверяем, является ли текущий пользователь автором сообщения
    const messageUid = messageEl.dataset.uid;
    const isOwnMessage = currentUserProfile && currentUserProfile.uid === messageUid;

    // Строим меню в зависимости от прав доступа
    let menuHtml = `
        <div class="context-menu-reactions">
            <button class="context-menu-item react-context" data-message-id="${messageId}">❤️</button>
            <button class="context-menu-item like-context" data-message-id="${messageId}">👍</button>
        </div>
        <button class="context-menu-item reply-context" data-message-id="${messageId}">Ответить</button>
    `;

    // Добавляем кнопки редактирования и удаления только для своих сообщений
    if (isOwnMessage) {
        menuHtml += `
            <button class="context-menu-item edit-context" data-message-id="${messageId}">Редактировать</button>
            <button class="context-menu-item delete-context" data-message-id="${messageId}">Удалить</button>
        `;
    }

    contextMenu.innerHTML = menuHtml;

    const menuWidth = contextMenu.offsetWidth;
    const menuHeight = contextMenu.offsetHeight;
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    // Рассчитываем позицию с учетом границ окна
    let left = event.clientX;
    let top = event.clientY;

    // Проверяем правую границу
    if (left + menuWidth > viewportWidth - 10) {
        left = viewportWidth - menuWidth - 10;
    }

    // Проверяем нижнюю границу
    if (top + menuHeight > viewportHeight - 10) {
        top = viewportHeight - menuHeight - 10;
    }

    // Убеждаемся, что не выходим за левую/верхнюю границы
    left = Math.max(10, left);
    top = Math.max(10, top);

    contextMenu.style.left = `${left}px`;
    contextMenu.style.top = `${top}px`;

    // Показываем меню
    contextMenu.classList.add('show');

    // Обработчики для пунктов меню
    const replyBtn = contextMenu.querySelector('.reply-context');
    const reactBtn = contextMenu.querySelector('.react-context');
    const likeContextBtn = contextMenu.querySelector('.like-context');
    const editBtn = contextMenu.querySelector('.edit-context');
    const deleteBtn = contextMenu.querySelector('.delete-context');

    // Удаляем старые обработчики, если были
    const newReplyBtn = replyBtn ? replyBtn.cloneNode(true) : null;
    const newReactBtn = reactBtn ? reactBtn.cloneNode(true) : null;
    const newLikeContextBtn = likeContextBtn ? likeContextBtn.cloneNode(true) : null;
    const newEditBtn = editBtn ? editBtn.cloneNode(true) : null;
    const newDeleteBtn = deleteBtn ? deleteBtn.cloneNode(true) : null;
    
    // Сохраняем контейнер реакций
    const reactionsContainer = contextMenu.querySelector('.context-menu-reactions');
    const newReactionsContainer = reactionsContainer ? reactionsContainer.cloneNode(true) : null;
    
    contextMenu.innerHTML = '';
    if (newReactionsContainer) {
        contextMenu.appendChild(newReactionsContainer);
    }
    if (newReplyBtn) contextMenu.appendChild(newReplyBtn);
    if (newEditBtn) contextMenu.appendChild(newEditBtn);
    if (newDeleteBtn) contextMenu.appendChild(newDeleteBtn);
    
    // Находим кнопки заново после добавления в DOM
    const finalReactBtn = contextMenu.querySelector('.react-context');
    const finalLikeContextBtn = contextMenu.querySelector('.like-context');

    if (newReplyBtn) {
        newReplyBtn.addEventListener('click', () => {
            enableReplyMode(messageId, messageEl);
            contextMenu.classList.remove('show');
        });
    }

    if (finalReactBtn) {
        finalReactBtn.addEventListener('click', () => {
            addReaction(messageId, '❤️');
            contextMenu.classList.remove('show');
        });
    }

    if (finalLikeContextBtn) {
        finalLikeContextBtn.addEventListener('click', () => {
            addReaction(messageId, '👍');
            contextMenu.classList.remove('show');
        });
    }

    if (newEditBtn) {
        newEditBtn.addEventListener('click', () => {
            editMessage(messageId, messageEl);
            contextMenu.classList.remove('show');
        });
    }

    if (newDeleteBtn) {
        newDeleteBtn.addEventListener('click', () => {
            deleteMessage(messageId, messageEl);
            contextMenu.classList.remove('show');
        });
    }
}

// ============================================
// РЕДАКТИРОВАНИЕ СООБЩЕНИЯ
// ============================================
function editMessage(messageId, messageEl) {
    // Проверяем, является ли текущий пользователь автором сообщения
    const messageUid = messageEl.dataset.uid;
    if (!currentUserProfile || currentUserProfile.uid !== messageUid) {
        showChatMessage('Вы можете редактировать только свои сообщения', 'error');
        return;
    }

    const messageBubble = messageEl.querySelector('.message-bubble');
    if (!messageBubble) return;
    
    const textElement = messageBubble.querySelector('p');
    if (!textElement) return;
    
    const currentText = textElement.textContent;

    // Добавляем класс для изменения фона сообщения при редактировании
    messageEl.classList.add('editing');
    messageBubble.style.backgroundColor = '#e6f3ff';
    messageBubble.style.borderRadius = '8px';
    messageBubble.style.padding = '0.75rem';
    messageBubble.style.transition = 'all 0.3s ease';

    // Создаем контейнер для textarea и кнопок
    const editContainer = document.createElement('div');
    editContainer.className = 'edit-container';
    editContainer.style.display = 'flex';
    editContainer.style.flexDirection = 'column';
    editContainer.style.gap = '0.5rem';

    // Создаем textarea для редактирования
    const textarea = document.createElement('textarea');
    textarea.value = currentText;
    textarea.style.width = '100%';
    textarea.style.minHeight = '80px';
    textarea.style.padding = '0.5rem';
    textarea.style.border = '2px solid #004080';
    textarea.style.borderRadius = '4px';
    textarea.style.fontFamily = 'inherit';
    textarea.style.fontSize = '1rem';
    textarea.style.resize = 'vertical';
    textarea.style.boxSizing = 'border-box';
    textarea.className = 'edit-textarea';

    // Сохраняем ссылку на textarea в messageEl для доступа из cancelEdit
    messageEl.dataset.editingTextarea = 'true';

    // Создаем контейнер для кнопок
    const buttonsContainer = document.createElement('div');
    buttonsContainer.className = 'edit-buttons';
    buttonsContainer.style.display = 'flex';
    buttonsContainer.style.gap = '0.5rem';
    buttonsContainer.style.justifyContent = 'flex-end';
    buttonsContainer.style.marginTop = '0.25rem';
    
    const saveBtn = document.createElement('button');
    saveBtn.className = 'edit-btn save-edit-btn';
    saveBtn.textContent = 'Подтвердить';
    saveBtn.title = 'Сохранить (Enter)';
    saveBtn.type = 'button';
    saveBtn.style.padding = '0.25rem 0.75rem';
    saveBtn.style.fontSize = '0.875rem';
    saveBtn.style.backgroundColor = '#28a745';
    saveBtn.style.color = 'white';
    saveBtn.style.border = 'none';
    saveBtn.style.borderRadius = '4px';
    saveBtn.style.cursor = 'pointer';
    saveBtn.style.transition = 'background-color 0.2s';
    
    const cancelBtn = document.createElement('button');
    cancelBtn.className = 'edit-btn cancel-edit-btn';
    cancelBtn.textContent = 'Отмена';
    cancelBtn.title = 'Отмена (Esc)';
    cancelBtn.type = 'button';
    cancelBtn.style.padding = '0.25rem 0.75rem';
    cancelBtn.style.fontSize = '0.875rem';
    cancelBtn.style.backgroundColor = '#dc3545';
    cancelBtn.style.color = 'white';
    cancelBtn.style.border = 'none';
    cancelBtn.style.borderRadius = '4px';
    cancelBtn.style.cursor = 'pointer';
    cancelBtn.style.transition = 'background-color 0.2s';

    // Добавляем hover эффекты
    saveBtn.onmouseenter = () => saveBtn.style.backgroundColor = '#218838';
    saveBtn.onmouseleave = () => saveBtn.style.backgroundColor = '#28a745';
    cancelBtn.onmouseenter = () => cancelBtn.style.backgroundColor = '#c82333';
    cancelBtn.onmouseleave = () => cancelBtn.style.backgroundColor = '#dc3545';

    buttonsContainer.appendChild(saveBtn);
    buttonsContainer.appendChild(cancelBtn);

    // Собираем все вместе
    editContainer.appendChild(textarea);
    editContainer.appendChild(buttonsContainer);

    // Заменяем текст на editContainer
    textElement.replaceWith(editContainer);
    textarea.focus();
    textarea.select();

    // Сохраняем редактирование
    function saveEdit() {
        const newText = textarea.value.trim();
        if (newText && newText !== currentText) {
            // Обновляем в localStorage
            updateMessageInStorage(messageId, { text: newText });
            // Обновляем отображение
            const p = document.createElement('p');
            p.textContent = newText;
            editContainer.replaceWith(p);
            // Восстанавливаем стили сообщения
            messageEl.classList.remove('editing');
            messageBubble.style.backgroundColor = '';
            messageBubble.style.border = '';
            messageBubble.style.borderRadius = '';
            messageBubble.style.padding = '';
            messageBubble.style.transition = '';
            delete messageEl.dataset.editingTextarea;
        } else if (newText === '') {
            showChatMessage('Сообщение не может быть пустым', 'error');
        } else {
            cancelEdit();
        }
    }

    // Отмена редактирования
    window.cancelEdit = function() {
        const p = document.createElement('p');
        p.textContent = currentText;
        if (editContainer.parentNode) {
            editContainer.replaceWith(p);
        }
        // Восстанавливаем стили сообщения
        messageEl.classList.remove('editing');
        messageBubble.style.backgroundColor = '';
        messageBubble.style.border = '';
        messageBubble.style.borderRadius = '';
        messageBubble.style.padding = '';
        messageBubble.style.transition = '';
        delete messageEl.dataset.editingTextarea;
    };

    saveBtn.onclick = saveEdit;
    cancelBtn.onclick = cancelEdit;

    // Сохранение по Enter (без Shift), отмена по Escape
    textarea.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            saveEdit();
        } else if (e.key === 'Escape') {
            e.preventDefault();
            cancelEdit();
        }
    });
}

// Обновление сообщения в хранилище
function updateMessageInStorage(messageId, updates) {
    try {
        const savedMessages = localStorage.getItem('chat_messages');
        if (savedMessages) {
            const messages = JSON.parse(savedMessages);
            const index = messages.findIndex(msg => msg.id == messageId);
            if (index !== -1) {
                messages[index] = { ...messages[index], ...updates };
                localStorage.setItem('chat_messages', JSON.stringify(messages));
            }
        }
    } catch (error) {
        console.error('Ошибка обновления сообщения:', error);
        showChatMessage('Ошибка редактирования сообщения', 'error');
    }
}

// Удаление сообщения
function deleteMessage(messageId, messageEl) {
    // Проверяем, является ли текущий пользователь автором сообщения
    const messageUid = messageEl.dataset.uid;
    if (!currentUserProfile || currentUserProfile.uid !== messageUid) {
        showChatMessage('Вы можете удалять только свои сообщения', 'error');
        return;
    }

    if (confirm('Вы уверены, что хотите удалить это сообщение?')) {
        // Удаляем из localStorage
        try {
            const savedMessages = localStorage.getItem('chat_messages');
            if (savedMessages) {
                const messages = JSON.parse(savedMessages);
                const filtered = messages.filter(msg => msg.id != messageId);
                localStorage.setItem('chat_messages', JSON.stringify(filtered));
            }
        } catch (error) {
            console.error('Ошибка удаления сообщения:', error);
            showChatMessage('Ошибка удаления сообщения', 'error');
            return;
        }

        // Удаляем из DOM
        messageEl.remove();

        // Обновляем список участников
        loadParticipants();

        showChatMessage('Сообщение удалено', 'success');
    }
}

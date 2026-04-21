// ===== СОХРАНЕНИЕ ПОЗИЦИИ СКРОЛЛА =====
(function() {
    if (sessionStorage.getItem('scrollPos')) {
        window.scrollTo(0, sessionStorage.getItem('scrollPos'));
        sessionStorage.removeItem('scrollPos');
    }
    window.addEventListener('beforeunload', () => {
        sessionStorage.setItem('scrollPos', window.scrollY);
    });
})();

// ===== ЗВЁЗДЫ =====
(function initStars() {
    const starsContainer = document.getElementById('starsContainer');
    if (!starsContainer) return;

    const stars = [];
    const STAR_COUNT = 45;

    for (let i = 0; i < STAR_COUNT; i++) {
        const star = document.createElement('div');
        star.classList.add('star');
        if (Math.random() < 0.6) star.classList.add('small');
        else if (Math.random() < 0.8) star.classList.add('medium');
        star.style.left = Math.random() * 100 + '%';
        star.style.top = Math.random() * 100 + '%';
        star.style.background = `rgba(255, 255, 255, ${0.4 + Math.random() * 0.5})`;
        starsContainer.appendChild(star);
        stars.push({ element: star, speed: 0.2 + Math.random() * 0.4 });
    }

    let lastScrollY = window.scrollY;
    let ticking = false;

    function updateStars() {
        const currentScrollY = window.scrollY;
        const delta = currentScrollY - lastScrollY;
        stars.forEach(star => {
            let currentTop = parseFloat(star.element.style.top);
            let newTop = currentTop + (delta * star.speed * 0.03);
            if (newTop < -10) newTop = 110;
            if (newTop > 110) newTop = -10;
            star.element.style.top = newTop + '%';
        });
        lastScrollY = currentScrollY;
        ticking = false;
    }

    window.addEventListener('scroll', () => {
        if (!ticking) {
            requestAnimationFrame(updateStars);
            ticking = true;
        }
    });
})();

// ===== СВЕЧЕНИЕ НА КАРТОЧКАХ ГЛАВНОЙ =====
(function initCardGlow() {
    const cards = document.querySelectorAll('.works-section .card');
    if (cards.length === 0) return;

    cards.forEach(card => {
        const img = card.querySelector('.card-img');
        if (!img) return;

        card.addEventListener('mousemove', (e) => {
            const rect = img.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            img.style.setProperty('--mouse-x', x + 'px');
            img.style.setProperty('--mouse-y', y + 'px');
        });
    });
})();

// ===== FAQ (раскрывающийся блок) =====
(function initFaq() {
    const faqItem = document.querySelector('.faq-item');
    if (!faqItem) return;

    const question = faqItem.querySelector('.faq-question');
    question.addEventListener('click', () => {
        faqItem.classList.toggle('active');
    });
})();

// ===== ПЛАВНАЯ ПРОКРУТКА =====
function scrollToElement(el) {
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        const href = this.getAttribute('href');
        if (href === '#' || href === '') return;
        const targetElement = document.querySelector(href);
        if (targetElement) {
            e.preventDefault();
            targetElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    });
});

document.querySelectorAll('[data-scroll]').forEach(btn => {
    btn.addEventListener('click', function(e) {
        e.preventDefault();
        const targetId = this.getAttribute('data-scroll');
        if (targetId === 'top') {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        } else {
            scrollToElement(document.getElementById(targetId));
        }
    });
});

// Ссылка "Работы" на главной
const worksLink = document.querySelector('.works-nav-link');
if (worksLink) {
    worksLink.addEventListener('click', function(e) {
        e.preventDefault();
        const target = document.querySelector('#portfolio-works');
        if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
}

// Класс scrolled для body
window.addEventListener('scroll', () => {
    document.body.classList.toggle('scrolled', window.scrollY > 50);
});

// ===== MINECRAFT: ПРИВИЛЕГИИ И ДОНАТ =====
if (document.getElementById('privilegesButtons')) {
    const privilegesDataRaw = {
        prince: { name: "Принц", features: ["Эксклюзивный префикс в чате", "Бонус 500 монет", "3 дома (/sethome)", "Ежедневный кейс"], prices: {30:390, 90:990, 180:1590, forever:2490}, sortPrice: 390 },
        rabbit: { name: "Кролик", features: ["Пушистый префикс", "Бонус 2000 монет", "4 дома", "Кроличий кейс", "Эффект скорости", "Удача"], prices: {30:490, 90:1290, 180:1990, forever:3290}, sortPrice: 490 },
        knyaz: { name: "Князь", features: ["Золотой префикс", "Бонус 1500 монет", "5 домов", "Ежедневный кейс+", "Голосовой чат"], prices: {30:690, 90:1790, 180:2790, forever:4490}, sortPrice: 690 },
        herceg: { name: "Герцег", features: ["Алмазный префикс", "Бонус 3000 монет", "7 домов", "Два кейса в день", "Эффект свечения"], prices: {30:1190, 90:2990, 180:4590, forever:7490}, sortPrice: 1190 },
        witch: { name: "Ведьма", features: ["Магический префикс", "Бонус 4000 монет", "8 домов", "Магический кейс", "Зельеварня на /kit", "Призыв волка"], prices: {30:1490, 90:3690, 180:5590, forever:8990}, sortPrice: 1490 },
        kraken: { name: "Кракен", features: ["Морской префикс", "Бонус 5000 монет", "10 домов", "Легендарный кейс", "Эффект дыхания под водой", "Ускорение"], prices: {30:1990, 90:4990, 180:7590, forever:11990}, sortPrice: 1990 }
    };

    const sortedPrivileges = Object.entries(privilegesDataRaw).sort((a, b) => a[1].sortPrice - b[1].sortPrice);
    const privilegesData = {};
    const privilegeOrder = [];
    for (const [key, value] of sortedPrivileges) {
        privilegesData[key] = value;
        privilegeOrder.push(key);
    }

    const container = document.getElementById('privilegesButtons');
    container.innerHTML = privilegeOrder.map(key =>
        `<button class="privilege-btn" data-priv="${key}">${privilegesData[key].name}</button>`
    ).join('');

    const newsData = [
        { date: "2026-07-06", displayDate: "06.07.2026", text: "Летний вайп — жаркие ивенты и битвы" },
        { date: "2026-04-02", displayDate: "02.04.2026", text: "Весенний вайп — новый сезон, новые возможности" },
        { date: "2026-01-01", displayDate: "01.01.2026", text: "Первый вайп на сервере — начало легенды" },
        { date: "2026-03-15", displayDate: "Новый ивент", text: "Троянский конь — появится в новом вайпе" }
    ];
    newsData.sort((a, b) => new Date(b.date) - new Date(a.date));
    document.getElementById('newsGrid').innerHTML = newsData.map(news =>
        `<div class="news-card"><div class="news-date">${news.displayDate}</div><div class="news-text">${news.text}</div></div>`
    ).join('');

    let currentPriv = privilegeOrder[0];
    let currentDays = "30";

    function updateDonateUI() {
        const data = privilegesData[currentPriv];
        document.getElementById('privName').innerHTML = data.name;
        document.getElementById('featuresList').innerHTML = data.features.map(f => `<li>${f}</li>`).join('');
        const price = data.prices[currentDays];
        const priceStr = currentDays === 'forever'
            ? `${price} ₽ <span style="font-size:0.8rem;">(навсегда)</span>`
            : `${price} ₽ <span style="font-size:0.8rem;">/ ${currentDays} дней</span>`;
        document.getElementById('priceDisplay').innerHTML = priceStr;

        document.querySelectorAll('.privilege-btn').forEach(btn => {
            btn.classList.toggle('active', btn.getAttribute('data-priv') === currentPriv);
        });
    }

    document.querySelectorAll('.privilege-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            currentPriv = btn.getAttribute('data-priv');
            updateDonateUI();
        });
    });

    document.querySelectorAll('.duration-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            currentDays = btn.getAttribute('data-days');
            document.querySelectorAll('.duration-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            updateDonateUI();
        });
    });

    document.querySelector('.duration-btn').classList.add('active');
    updateDonateUI();

    window.copyIP = function() {
        navigator.clipboard.writeText('fun.invizkasmp.pro');
        const ipEl = document.querySelector('.ip-address');
        const original = ipEl.innerText;
        ipEl.innerText = '✅ Скопировано!';
        setTimeout(() => ipEl.innerText = original, 1500);
    };
}

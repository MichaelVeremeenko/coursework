document.addEventListener('DOMContentLoaded', function() {
    const contentContainer = document.getElementById('content-container');
    const navLinks = document.querySelectorAll('nav a');
    let currentUser = null;
    let discountedCars = [];
    let mobileMenuOpen = false;

    // Инициализация мобильного меню
    const mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
    const mobileNav = document.querySelector('.mobile-nav');
    const menuOverlay = document.createElement('div');
    menuOverlay.className = 'menu-overlay';
    document.body.appendChild(menuOverlay);

    // Проверка авторизации при загрузке страницы
    checkAuth();

    // Функция для проверки авторизации
    function checkAuth() {
        const userData = localStorage.getItem('currentUser');
        if (userData) {
            currentUser = JSON.parse(userData);
            updateAuthUI();
        }
    }

    // Обновление UI в зависимости от статуса авторизации
    function updateAuthUI() {
        const authBtn = document.querySelector('.auth-btn.dropdown-toggle');
        const dropdownMenu = document.querySelector('.dropdown-menu');
        
        if (currentUser) {
            authBtn.textContent = currentUser.name;
            dropdownMenu.innerHTML = `
                <button class="auth-btn" id="profile-btn">Профиль</button>
                <button class="auth-btn" id="logout-btn">Выйти</button>
            `;
            
            // Обновляем мобильное меню
            const mobileAuth = document.querySelector('.mobile-auth');
            if (mobileAuth) {
                mobileAuth.innerHTML = `
                    <button class="auth-btn" id="mobile-profile-btn">Профиль</button>
                    <button class="auth-btn" id="mobile-logout-btn">Выйти</button>
                `;
            }
        } else {
            authBtn.textContent = 'Профиль';
            dropdownMenu.innerHTML = `
                <button class="auth-btn" id="login-btn">Вход</button>
                <button class="auth-btn" id="register-btn">Регистрация</button>
            `;
            
            // Обновляем мобильное меню
            const mobileAuth = document.querySelector('.mobile-auth');
            if (mobileAuth) {
                mobileAuth.innerHTML = `
                    <button class="auth-btn" id="mobile-login-btn">Вход</button>
                    <button class="auth-btn" id="mobile-register-btn">Регистрация</button>
                `;
            }
        }
    }

    // Функция для сохранения скидок в localStorage
    function saveDiscountsToStorage(discounts) {
        localStorage.setItem('carDiscounts', JSON.stringify(discounts));
    }

    // Функция для получения скидок из localStorage
    function getDiscountsFromStorage() {
        const discounts = localStorage.getItem('carDiscounts');
        return discounts ? JSON.parse(discounts) : null;
    }

    // Функция для применения случайных скидок
    function applyRandomDiscounts(carsArray) {
        const storedDiscounts = getDiscountsFromStorage();
        if (storedDiscounts) {
            return storedDiscounts;
        }

        const cars = [...carsArray];
        const newDiscountedCars = [];
        
        // Выбираем 3 случайные машины для скидки
        while (newDiscountedCars.length < 3 && cars.length > 0) {
            const randomIndex = Math.floor(Math.random() * cars.length);
            const car = cars.splice(randomIndex, 1)[0];
            
            // Генерируем случайную скидку от 5% до 15%
            const discountPercentage = 5 + Math.floor(Math.random() * 11);
            const originalPrice = parseInt(car.price.replace(/\D/g, ''), 10);
            const discountAmount = Math.floor(originalPrice * discountPercentage / 100);
            const discountedPrice = originalPrice - discountAmount;
            
            // Форматируем цену
            const formattedPrice = `${discountedPrice.toLocaleString('ru-RU')} BYN`;
            
            newDiscountedCars.push({
                ...car,
                price: formattedPrice,
                originalPrice: `${originalPrice.toLocaleString('ru-RU')} BYN`,
                discount: discountPercentage,
                isDiscounted: true
            });
        }
        
        const result = [...newDiscountedCars, ...cars];
        saveDiscountsToStorage(result);
        return result;
    }

    // Загрузка секции
    function loadSection(sectionId) {
        const template = document.getElementById(`${sectionId}-template`);
        if (template) {
            contentContainer.innerHTML = '';
            const content = template.content.cloneNode(true);
            contentContainer.appendChild(content);
            
            if (sectionId === 'promotions') {
                enhancePromotionsSection();
            } else if (sectionId === 'cars') {
                loadCarsFromXML();
            } else if (sectionId === 'order') {
                if (!currentUser) {
                    showLoginPrompt();
                } else {
                    setupOrderForm();
                }
            }
        }
    }

    // Улучшение секции акций
    function enhancePromotionsSection() {
        const promotionItems = document.querySelectorAll('.promotion-item');
        promotionItems.forEach(item => {
            item.addEventListener('click', function() {
                this.classList.toggle('expanded');
            });
        });
    }

    // Показать запрос на вход
    function showLoginPrompt() {
        contentContainer.innerHTML = `
            <div class="login-prompt">
                <h2>Для оформления заказа необходимо войти в систему</h2>
                <p>Пожалуйста, войдите в свой аккаунт или зарегистрируйтесь, чтобы продолжить оформление заказа.</p>
                <div class="prompt-buttons">
                    <button id="go-to-login" class="submit-btn">Войти</button>
                    <button id="go-to-register" class="submit-btn secondary">Регистрация</button>
                </div>
            </div>
        `;

        document.getElementById('go-to-login').addEventListener('click', () => loadLoginForm());
        document.getElementById('go-to-register').addEventListener('click', () => loadRegisterForm());
    }

    // Загрузка формы входа
    function loadLoginForm() {
        contentContainer.innerHTML = `
            <section class="auth-form active-section">
                <div class="section-title">
                    <h2>Вход в аккаунт</h2>
                    <p>Введите свои учетные данные</p>
                </div>
                <div class="form-container">
                    <form id="login-form">
                        <div class="form-group">
                            <label for="login-username">Логин:</label>
                            <input type="text" id="login-username" required>
                        </div>
                        <div class="form-group">
                            <label for="login-password">Пароль:</label>
                            <input type="password" id="login-password" required>
                        </div>
                        <button type="submit" class="submit-btn">Войти</button>
                        <p class="auth-switch">Нет аккаунта? <a href="#" id="switch-to-register">Зарегистрируйтесь</a></p>
                    </form>
                </div>
            </section>
        `;

        document.getElementById('login-form').addEventListener('submit', handleLogin);
        document.getElementById('switch-to-register').addEventListener('click', (e) => {
            e.preventDefault();
            loadRegisterForm();
        });
    }

    // Загрузка формы регистрации
    function loadRegisterForm() {
        contentContainer.innerHTML = `
            <section class="auth-form active-section">
                <div class="section-title">
                    <h2>Регистрация</h2>
                    <p>Создайте новый аккаунт</p>
                </div>
                <div class="form-container">
                    <form id="register-form">
                        <div class="form-group">
                            <label for="reg-name">ФИО:</label>
                            <input type="text" id="reg-name" required>
                        </div>
                        <div class="form-group">
                            <label for="reg-username">Логин:</label>
                            <input type="text" id="reg-username" required>
                        </div>
                        <div class="form-group">
                            <label for="reg-password">Пароль:</label>
                            <input type="password" id="reg-password" required>
                        </div>
                        <div class="form-group">
                            <label for="reg-email">Email:</label>
                            <input type="email" id="reg-email" required>
                        </div>
                        <div class="form-group">
                            <label for="reg-phone">Телефон:</label>
                            <input type="tel" id="reg-phone" required>
                        </div>
                        <button type="submit" class="submit-btn">Зарегистрироваться</button>
                        <p class="auth-switch">Уже есть аккаунт? <a href="#" id="switch-to-login">Войдите</a></p>
                    </form>
                </div>
            </section>
        `;

        document.getElementById('register-form').addEventListener('submit', handleRegister);
        document.getElementById('switch-to-login').addEventListener('click', (e) => {
            e.preventDefault();
            loadLoginForm();
        });
    }

    // Обработка входа
    function handleLogin(e) {
        e.preventDefault();
        const username = document.getElementById('login-username').value;
        const password = document.getElementById('login-password').value;

        fetch('users.xml')
            .then(response => response.text())
            .then(data => {
                const parser = new DOMParser();
                const xmlDoc = parser.parseFromString(data, "text/xml");
                const users = xmlDoc.getElementsByTagName("user");
                
                for (let user of users) {
                    const userLogin = user.getElementsByTagName("login")[0].textContent;
                    const userPass = user.getElementsByTagName("password")[0].textContent;
                    
                    if (userLogin === username && userPass === password) {
                        currentUser = {
                            login: userLogin,
                            name: user.getElementsByTagName("name")[0].textContent,
                            email: user.getElementsByTagName("email")[0].textContent,
                            phone: user.getElementsByTagName("phone")[0].textContent
                        };
                        
                        localStorage.setItem('currentUser', JSON.stringify(currentUser));
                        updateAuthUI();
                        alert(`Добро пожаловать, ${currentUser.name}!`);
                        loadSection('order');
                        
                        // Закрываем мобильное меню, если оно открыто
                        closeMobileMenu();
                        return;
                    }
                }
                
                alert('Неверный логин или пароль');
            })
            .catch(error => {
                console.error('Ошибка загрузки данных:', error);
                alert('Ошибка при входе в систему');
            });
    }

    // Обработка регистрации
    function escapeXml(unsafe) {
        return unsafe.replace(/[<>&'"]/g, function(c) {
            switch(c) {
                case '<': return '&lt;';
                case '>': return '&gt;';
                case '&': return '&amp;';
                case '\'': return '&apos;';
                case '"': return '&quot;';
            }
        });
    }
    
    function saveUserToXmlFile(username, name, email, phone, password) {
        const xmlData = `
    <?xml version="1.0" encoding="UTF-8"?>
    <users>
        <user>
            <login>${escapeXml(username)}</login>
            <password>${escapeXml(password)}</password>
            <name>${escapeXml(name)}</name>
            <email>${escapeXml(email)}</email>
            <phone>${escapeXml(phone)}</phone>
            <registrationDate>${new Date().toISOString()}</registrationDate>
        </user>
    </users>
        `.trim();
    
        const blob = new Blob([xmlData], { type: 'application/xml' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${username}_registration.xml`;
        document.body.appendChild(a);
        a.click();
        setTimeout(() => {
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        }, 100);
    }
    
    // Замените эту функцию:
    function handleRegister(e) {
        e.preventDefault();
        const name = document.getElementById('reg-name').value.trim();
        const username = document.getElementById('reg-username').value.trim();
        const password = document.getElementById('reg-password').value;
        const email = document.getElementById('reg-email').value.trim();
        const phone = document.getElementById('reg-phone').value.trim();
    
        // Валидация
        let isValid = true;
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const passwordErrors = [];
    
        if (username.length < 3 || username.length > 20) {
            alert("Логин должен содержать от 3 до 20 символов");
            isValid = false;
        }
    
        if (!emailRegex.test(email)) {
            alert("Некорректный email");
            isValid = false;
        }
    
        if (password.length < 6) {
            passwordErrors.push("Минимум 6 символов");
        }
        if (!/[A-Z]/.test(password)) {
            passwordErrors.push("Добавьте заглавную букву");
        }
        if (!/\d/.test(password)) {
            passwordErrors.push("Добавьте цифру");
        }
    
        if (passwordErrors.length > 0) {
            alert("Пароль: " + passwordErrors.join("; "));
            isValid = false;
        }
    
        if (!isValid) return;
    
        // Сохраняем в XML-файл для скачивания
        saveUserToXmlFile(username, name, email, phone, password);
    
        // Локальное сохранение в браузере (для авторизации)
        currentUser = {
            login: username,
            name: name,
            email: email,
            phone: phone
        };
        localStorage.setItem('currentUser', JSON.stringify(currentUser));
        updateAuthUI();
        alert(`Регистрация успешна, ${currentUser.name}!`);
        loadSection('order');
        closeMobileMenu();
    }
    

    // Выход из системы
    function handleLogout() {
        currentUser = null;
        localStorage.removeItem('currentUser');
        updateAuthUI();
        alert('Вы вышли из системы');
        
        // Закрываем мобильное меню, если оно открыто
        closeMobileMenu();
    }

    // Закрытие мобильного меню
    function closeMobileMenu() {
        mobileMenuOpen = false;
        mobileNav.classList.remove('active');
        menuOverlay.classList.remove('active');
        document.body.style.overflow = '';
    }

    // Загрузка автомобилей из XML
    function loadCarsFromXML() {
        fetch('data.xml')
            .then(response => response.text())
            .then(data => {
                const parser = new DOMParser();
                const xmlDoc = parser.parseFromString(data, "text/xml");
                const cars = xmlDoc.getElementsByTagName("car");
                const carList = document.getElementById('car-list');
                
                // Преобразуем XML в массив объектов
                const carsArray = Array.from(cars).map(car => {
                    return {
                        name: car.getElementsByTagName("name")[0].textContent,
                        price: car.getElementsByTagName("price")[0].textContent,
                        image: (car.getElementsByTagName("image")[0]?.textContent || ''),
                        description: car.getElementsByTagName("description")[0].textContent
                    };
                });
                
                // Применяем скидки
                const processedCars = applyRandomDiscounts(carsArray);
                
                let html = '';
                processedCars.forEach(car => {
                    const imageUrl = car.image || 'img/default-car.jpg';
                    const badgeText = car.isDiscounted ? `Скидка ${car.discount}%` : '';
                    const priceHtml = car.isDiscounted 
                        ? `<div class="car-price">
                            <span class="original-price">${car.originalPrice}</span>
                            <span class="discounted-price">${car.price}</span>
                        </div>`
                        : `<div class="car-price">${car.price}</div>`;
                    
                    html += `
                        <div class="car">
                            ${car.isDiscounted ? `<div class="car-badge discount-badge">${badgeText}</div>` : ''}
                            <div class="car-image">
                                <img src="${imageUrl}" alt="${car.name}" 
                                    onerror="this.classList.add('error'); this.src='img/default-car.jpg'">
                            </div>
                            <div class="car-info">
                                <h3>${car.name}</h3>
                                ${priceHtml}
                                <p>${car.description}</p>
                                <button class="test-drive-btn" data-car="${car.name}">Оформить заказ</button>
                            </div>
                        </div>
                    `;
                });
                
                carList.innerHTML = html;
                
                // Добавляем обработчики для увеличения изображений
                document.querySelectorAll('.car-image img').forEach(img => {
                    img.addEventListener('click', function(e) {
                        showImageModal(this.src, this.alt);
                    });
                });
            })
            .catch(error => console.error('Ошибка загрузки данных:', error));
    }
    
    // Показать модальное окно с увеличенным изображением
    function showImageModal(src, alt) {
        const modal = document.createElement('div');
        modal.className = 'image-modal';
        modal.innerHTML = `
            <div class="modal-content">
                <span class="close-modal">&times;</span>
                <img src="${src}" alt="${alt}">
                <p>${alt}</p>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        modal.querySelector('.close-modal').addEventListener('click', () => {
            modal.remove();
        });
        
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.remove();
            }
        });
    }

    // Настройка формы заказа
    function setupOrderForm() {
        fetch('data.xml')
            .then(response => response.text())
            .then(data => {
                const parser = new DOMParser();
                const xmlDoc = parser.parseFromString(data, "text/xml");
                const cars = xmlDoc.getElementsByTagName("car");
                const modelSelect = document.getElementById('order-model');
                
                modelSelect.innerHTML = '<option value="">Выберите модель</option>';
                
                for (let car of cars) {
                    const name = car.getElementsByTagName("name")[0].textContent;
                    const option = document.createElement('option');
                    option.value = name;
                    option.textContent = name;
                    modelSelect.appendChild(option);
                }
                
                // Заполняем данные пользователя, если он авторизован
                if (currentUser) {
                    document.getElementById('order-name').value = currentUser.name;
                    document.getElementById('order-phone').value = currentUser.phone;
                }
            });
    }
    
    // Обработка кликов по навигации
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const sectionId = this.getAttribute('data-section');
            loadSection(sectionId);
            
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
            
            // Закрываем мобильное меню, если оно открыто
            closeMobileMenu();
        });
    });
    
    // Обработка форм
    document.addEventListener('submit', function(e) {
        if (e.target.id === 'order-form') {
            e.preventDefault();
            const carModel = document.getElementById('order-model').value;
            const address = document.getElementById('order-address').value;
            
            alert(`Ваш заказ на ${carModel} оформлен! Адрес доставки: ${address}. Мы свяжемся с вами для подтверждения.`);
            e.target.reset();
        }
        
        if (e.target.id === 'review-form') {
            e.preventDefault();
            const reviewsList = document.getElementById('reviews-list');
            const textarea = e.target.querySelector('textarea');
            
            if (textarea.value.trim()) {
                const reviewElement = document.createElement('div');
                reviewElement.className = 'review-item';
                reviewElement.innerHTML = `
                    <p class="review-author">${currentUser ? currentUser.name : 'Анонимный пользователь'}</p>
                    <p class="review-text">${textarea.value}</p>
                    <p class="review-date">${new Date().toLocaleDateString()}</p>
                `;
                reviewsList.prepend(reviewElement);
                textarea.value = '';
                alert('Спасибо за ваш отзыв!');
            }
        }
    });
    
    // Обработка кликов
    document.addEventListener('click', function(e) {
        // Оформление заказа
        if (e.target.classList.contains('test-drive-btn')) {
            e.preventDefault();
            const carModel = e.target.getAttribute('data-car');
            loadSection('order');
            
            const modelSelect = document.getElementById('order-model');
            if (modelSelect) {
                modelSelect.value = carModel;
            }
        }
        
        // Кнопки в выпадающем меню профиля
        if (e.target.id === 'login-btn' || e.target.id === 'mobile-login-btn') {
            loadLoginForm();
            closeMobileMenu();
        }
        
        if (e.target.id === 'register-btn' || e.target.id === 'mobile-register-btn') {
            loadRegisterForm();
            closeMobileMenu();
        }
        
        if (e.target.id === 'profile-btn' || e.target.id === 'mobile-profile-btn') {
            showUserProfile();
            closeMobileMenu();
        }
        
        if (e.target.id === 'logout-btn' || e.target.id === 'mobile-logout-btn') {
            handleLogout();
            closeMobileMenu();
        }
    });
    
    // Показать профиль пользователя
    function showUserProfile() {
        if (!currentUser) return;
        
        contentContainer.innerHTML = `
            <section class="profile active-section">
                <div class="section-title">
                    <h2>Мой профиль</h2>
                    <p>Управление вашей учетной записью</p>
                </div>
                <div class="profile-container">
                    <div class="profile-info">
                        <h3>${currentUser.name}</h3>
                        <p><strong>Логин:</strong> ${currentUser.login}</p>
                        <p><strong>Email:</strong> ${currentUser.email}</p>
                        <p><strong>Телефон:</strong> ${currentUser.phone}</p>
                    </div>
                    <div class="profile-actions">
                        <button id="logout-profile" class="submit-btn danger">Выйти</button>
                    </div>
                </div>
            </section>
        `;
        
        document.getElementById('logout-profile').addEventListener('click', handleLogout);
    }
    
    // Обработчик клика по кнопке меню
    mobileMenuToggle?.addEventListener('click', function() {
        mobileMenuOpen = !mobileMenuOpen;
        mobileNav.classList.toggle('active', mobileMenuOpen);
        menuOverlay.classList.toggle('active', mobileMenuOpen);
        document.body.style.overflow = mobileMenuOpen ? 'hidden' : '';
    });

    // Закрытие меню при клике на оверлей
    menuOverlay.addEventListener('click', function() {
        closeMobileMenu();
    });

    // Загружаем первую секцию по умолчанию
    loadSection('promotions');
});
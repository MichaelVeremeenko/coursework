document.addEventListener('DOMContentLoaded', function() {
    const contentContainer = document.getElementById('content-container');
    const navLinks = document.querySelectorAll('nav a');
    
    // Функция для применения случайных скидок
    function applyRandomDiscounts(carsArray) {
      const cars = [...carsArray];
      const discountedCars = [];
      
      // Выбираем 3 случайные машины для скидки
      while (discountedCars.length < 3 && cars.length > 0) {
        const randomIndex = Math.floor(Math.random() * cars.length);
        const car = cars.splice(randomIndex, 1)[0];
        
        // Генерируем случайную скидку от 5% до 15%
        const discountPercentage = 5 + Math.floor(Math.random() * 11);
        const originalPrice = parseInt(car.price.replace(/\D/g, ''), 10);
        const discountAmount = Math.floor(originalPrice * discountPercentage / 100);
        const discountedPrice = originalPrice - discountAmount;
        
        // Форматируем цену
        const formattedPrice = `${discountedPrice.toLocaleString('ru-RU')} BYN`;
        
        discountedCars.push({
          ...car,
          price: formattedPrice,
          originalPrice: `${originalPrice.toLocaleString('ru-RU')} BYN`,
          discount: discountPercentage,
          isDiscounted: true
        });
      }
      
      return [...discountedCars, ...cars];
    }
  
    // Загрузка секции
    function loadSection(sectionId) {
      const template = document.getElementById(`${sectionId}-template`);
      if (template) {
        contentContainer.innerHTML = '';
        const content = template.content.cloneNode(true);
        contentContainer.appendChild(content);
        
        if (sectionId === 'cars') {
          loadCarsFromXML();
        } else if (sectionId === 'order') {
          setupOrderForm();
        }
      }
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
        })
        .catch(error => console.error('Ошибка загрузки данных:', error));
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
      });
    });
    
    // Обработка форм
    document.addEventListener('submit', function(e) {
      if (e.target.id === 'order-form') {
        e.preventDefault();
        alert('Ваш заказ оформлен! Мы свяжемся с вами для подтверждения.');
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
            <p class="review-text">${textarea.value}</p>
            <p class="review-date">${new Date().toLocaleDateString()}</p>
          `;
          reviewsList.prepend(reviewElement);
          textarea.value = '';
          alert('Спасибо за ваш отзыв!');
        }
      }
    });
    
    // Обработка кнопок оформления заказа
    document.addEventListener('click', function(e) {
      if (e.target.classList.contains('test-drive-btn')) {
        e.preventDefault();
        const carModel = e.target.getAttribute('data-car');
        loadSection('order');
        
        const modelSelect = document.getElementById('order-model');
        if (modelSelect) {
          modelSelect.value = carModel;
        }
      }
    });
    
    // Загружаем первую секцию по умолчанию
    loadSection('promotions');
  });
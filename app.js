document.addEventListener('DOMContentLoaded', () => {
  const menuContainer = document.getElementById('menu-container');

  fetch('cocktails.json')
    .then((response) => response.json())
    .then((data) => {
      // 각 항목에 sweet/sour 기본값(0~5) 보장
      data.forEach((category) => {
        category.items.forEach((item) => {
          if (typeof item.sweet !== 'number') item.sweet = 0;
          if (typeof item.sour !== 'number') item.sour = 0;
        });
      });

      renderMenu(data);

      // --- 추가: 이미지 URL 수집 후 백그라운드 프리로드 ---
      const imageUrls = [];
      data.forEach((cat) => {
        (cat.items || []).forEach((it) => {
          if (it && typeof it.image === 'string' && it.image.trim())
            imageUrls.push(it.image.trim());
        });
      });

      // 중복 제거
      const uniqueUrls = Array.from(new Set(imageUrls));

      // 비동기 프리로드(실패해도 무시)
      preloadImages(uniqueUrls).then((results) => {
        console.log('preloadImages finished:', results.length);
      });
      // ---------------------------------------------------
    });

  function renderMenu(categories) {
    categories.forEach((category) => {
      const section = document.createElement('section');
      section.className = 'category-section';

      const title = document.createElement('h2');
      title.className = 'category-title';
      title.textContent = category.category;
      section.appendChild(title);

      const grid = document.createElement('div');
      grid.className = 'menu-grid';

      category.items.forEach((item) => {
        const cocktailDiv = document.createElement('div');
        cocktailDiv.className = 'cocktail-item';

        const name = document.createElement('h3');
        name.className = 'cocktail-name';
        name.textContent = item.name;

        const ingredients = document.createElement('p');
        ingredients.className = 'cocktail-ingredients';
        ingredients.textContent = item.ingredients.join(', ');

        const abv = document.createElement('p');
        abv.className = 'cocktail-abv';
        abv.textContent = `ABV: ${item.abv}%`;

        cocktailDiv.appendChild(name);
        cocktailDiv.appendChild(ingredients);
        cocktailDiv.appendChild(abv);

        const ratingWrapper = document.createElement('div');
        ratingWrapper.className = 'preview-ratings';

        const sweetPreview = document.createElement('div');
        sweetPreview.className = 'preview-row';
        sweetPreview.innerHTML = `<span class="preview-label">Sweet</span>`;
        sweetPreview.appendChild(createRatingDots(item.sweet, 'small'));
        ratingWrapper.appendChild(sweetPreview);

        const sourPreview = document.createElement('div');
        sourPreview.className = 'preview-row';
        sourPreview.innerHTML = `<span class="preview-label">Sour</span>`;
        sourPreview.appendChild(createRatingDots(item.sour, 'small'));
        ratingWrapper.appendChild(sourPreview);

        cocktailDiv.appendChild(ratingWrapper);

        // Add click event
        cocktailDiv.addEventListener('click', () => openModal(item));

        grid.appendChild(cocktailDiv);
      });

      section.appendChild(grid);
      menuContainer.appendChild(section);
    });
  }
  // rating dot 생성 유틸: value 0..5, size 'small'|'default'
  function createRatingDots(value = 0, size = '') {
    const container = document.createElement('div');
    container.className = `rating ${size || ''}`.trim();
    for (let i = 1; i <= 5; i++) {
      const dot = document.createElement('span');
      dot.className = 'dot' + (i <= value ? ' filled' : '');
      container.appendChild(dot);
    }
    return container;
  }

  // --- 추가: 이미지 프리로드 유틸 ---
  function preloadImages(urls = []) {
    const jobs = urls.map((url) => {
      return new Promise((resolve) => {
        if (!url) return resolve({ url, status: 'empty' });
        const img = new Image();
        img.onload = () => resolve({ url, status: 'ok' });
        img.onerror = () => resolve({ url, status: 'error' });
        img.src = url;
        // 참고: 캐시된 이미지의 경우 onload가 바로 호출됩니다.
      });
    });
    return Promise.all(jobs);
  }

  // Modal Logic
  const modal = document.getElementById('cocktail-modal');
  const closeBtn = document.getElementById('close-modal');
  const modalImage = document.getElementById('modal-image');
  const modalTitle = document.getElementById('modal-title');
  const modalIngredients = document.getElementById('modal-ingredients');
  const modalAbv = document.getElementById('modal-abv');
  const modalDescription = document.getElementById('modal-description');

  // 모달에 rating 출력할 요소
  const modalSweet = document.getElementById('modal-sweet');
  const modalSour = document.getElementById('modal-sour');

  function openModal(item) {
    modalTitle.textContent = item.name;
    modalIngredients.textContent = item.ingredients.join(', ');
    modalAbv.textContent = `ABV: ${item.abv}%`;
    modalDescription.textContent =
      item.description || 'No description available.';

    // rating 렌더링 (기존 내용 대체)
    modalSweet.innerHTML = '';
    modalSour.innerHTML = '';
    modalSweet.appendChild(createRatingDots(item.sweet));
    modalSour.appendChild(createRatingDots(item.sour));

    // 이미지 처리 (기존 코드 유지)
    if (item.image) {
      modalImage.removeAttribute('srcset');
      modalImage.src = item.image;
      modalImage.alt = `${item.name} image`;
      modalImage.style.display = 'block';
    } else {
      modalImage.removeAttribute('src');
      modalImage.removeAttribute('srcset');
      modalImage.alt = '';
      modalImage.style.display = 'none';
    }

    modal.showModal();
  }

  closeBtn.addEventListener('click', () => {
    modal.close();
  });

  // 모달이 닫힐 때 이미지 클리어 (브라우저별 동작 차이 방지)
  modal.addEventListener('close', () => {
    modalImage.removeAttribute('src');
    modalImage.removeAttribute('srcset');
    modalImage.alt = '';
    modalImage.style.display = 'none';
  });

  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      modal.close();
    }
  });
});

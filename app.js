document.addEventListener('DOMContentLoaded', () => {
    const menuContainer = document.getElementById('menu-container');

    fetch('cocktails.json')
        .then(response => response.json())
        .then(data => {
            renderMenu(data);
        })
        .catch(error => {
            console.error('Error loading menu data:', error);
            menuContainer.innerHTML = '<p class="error">Failed to load menu data.</p>';
        });

    function renderMenu(categories) {
        categories.forEach(category => {
            const section = document.createElement('section');
            section.className = 'category-section';

            const title = document.createElement('h2');
            title.className = 'category-title';
            title.textContent = category.category;
            section.appendChild(title);

            const grid = document.createElement('div');
            grid.className = 'menu-grid';

            category.items.forEach(item => {
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

                // Add click event
                cocktailDiv.addEventListener('click', () => openModal(item));

                grid.appendChild(cocktailDiv);
            });

            section.appendChild(grid);
            menuContainer.appendChild(section);
        });
    }

    // Modal Logic
    const modal = document.getElementById('cocktail-modal');
    const closeBtn = document.getElementById('close-modal');
    const modalImage = document.getElementById('modal-image');
    const modalTitle = document.getElementById('modal-title');
    const modalIngredients = document.getElementById('modal-ingredients');
    const modalAbv = document.getElementById('modal-abv');
    const modalDescription = document.getElementById('modal-description');

    function openModal(item) {
        modalTitle.textContent = item.name;
        modalIngredients.textContent = item.ingredients.join(', ');
        modalAbv.textContent = `ABV: ${item.abv}%`;
        modalDescription.textContent = item.description || 'No description available.';

        if (item.image) {
            modalImage.src = item.image;
            modalImage.style.display = 'block';
        } else {
            modalImage.style.display = 'none';
        }

        modal.showModal();
    }

    closeBtn.addEventListener('click', () => {
        modal.close();
    });

    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.close();
        }
    });
});

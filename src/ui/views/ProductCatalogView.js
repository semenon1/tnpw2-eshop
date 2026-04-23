
export function ProductCatalogView({ viewState, handlers }) {
  const { products } = viewState;
  const { onAddToCart } = handlers;

  const container = document.createElement('div');

  const title = document.createElement('h2');
  title.textContent = 'Katalog produktů';
  container.appendChild(title);

  const list = document.createElement('ul');

  products.forEach((product) => {
    const li = document.createElement('li');

    const label = document.createElement('span');
    label.textContent = `${product.name} - ${product.price} Kč (Skladem: ${product.stockCount} ks) `;
    li.appendChild(label);

    const canBuy = product.capabilities.canBePurchased;

    //tlačítko pro přidání do košíku
    if (canBuy && onAddToCart) {
      const btn = document.createElement('button');
      btn.textContent = 'Přidat do košíku';
      btn.addEventListener('click', () => onAddToCart(product.id));
      li.appendChild(btn);
    }

    list.appendChild(li);
  });

  container.appendChild(list);
  return container;
}
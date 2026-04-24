export async function addItemToOrder({ store, payload }) {
  // Nastavíme výchozí quantity na 1, pokud chybí
  const { productId, quantity = 1 } = payload;
  let notification = null;

  try {
    const state = store.getState();
    const product = state.products.find(p => p.id === productId);

    if (!product) {
      throw new Error("Produkt nebyl nalezen.");
    }

    //invarianta: počet kusů u jakékoli položky v košíku musí být celé číslo větší než nula
    if (!Number.isInteger(quantity) ||quantity <= 0) {
      throw new Error("Počet kusů u jakékoli položky v košíku musí být celé číslo větší než nula.");
    }
    //invarianta: produkt musí být aktivní, aby mohl být přidán do košíku
    if (product.status !== 'ACTIVE') {
      throw new Error("Tento produkt již není aktivní a nelze jej přidat do košíku.");
    }
    //invarianta: pokud status ≠ CART, nelze do ní přidávat další produkty ani měnit jejich množství 
    store.setState((state) => {
      if (state.currentOrder.status !== 'CART') {
        notification = {
          type: 'WARNING',
          message: "Nelze přidávat položky, objednávka už není ve stavu CART."
        };
        return { ...state, ui: { ...state.ui, notification } };
      }

      const newItem = {
        productId: product.id,
        quantity: quantity,
        price: product.price
      };

      const updatedItems = [...state.currentOrder.items, newItem];
      const updatedTotalPrice = state.currentOrder.totalPrice + (product.price * quantity);

      notification = {
        type: 'SUCCESS',
        message: 'Produkt byl přidán do košíku.'
      };

      return {
        ...state,
        currentOrder: {
          ...state.currentOrder,
          items: updatedItems,
          totalPrice: updatedTotalPrice
        },
        ui: {
          ...state.ui,
          notification
        }
      };
    });
  } catch (error) {
    store.setState((state) => ({
      ...state,
      ui: {
        ...state.ui,
        notification: { type: 'WARNING', message: error.message },
      },
    }));
  }
}
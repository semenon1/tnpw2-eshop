export async function addItemToOrder({ store, payload }) {
  const { product, quantity } = payload;
  let notification = null;

  try {
    if (!Number.isInteger(quantity) ||quantity <= 0) {
      throw new Error("Počet kusů musí být větší než nula.");
    }

    if (product.status !== 'ACTIVE') {
      throw new Error("Tento produkt již není aktivní a nelze jej přidat do košíku.");
    }

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
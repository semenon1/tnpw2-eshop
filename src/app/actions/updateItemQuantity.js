export async function updateItemQuantity({ store, api, payload }) {
  const { productId, quantity } = payload;
  let notification = null;

  try {
    if (quantity <= 0) {
      throw new Error("Počet kusů musí být větší než nula.");
    }

    store.setState((state) => {
      if (state.currentOrder.status !== 'CART') {
        notification = { type: "WARNING", message: "Množství lze měnit pouze ve stavu košíku." };
        return { ...state, ui: { ...state.ui, notification } };
      }

      const updatedItems = state.currentOrder.items.map(item => 
        item.productId === productId ? { ...item, quantity } : item
      );
      const updatedTotalPrice = updatedItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

      return {
        ...state,
        currentOrder: {
          ...state.currentOrder,
          items: updatedItems,
          totalPrice: updatedTotalPrice
        },
        ui: { ...state.ui, notification }
      };
    });
  } catch (error) {
    store.setState((state) => ({
      ...state,
      ui: {
        ...state.ui,
        notification: { type: "WARNING", message: error.message },
      },
    }));
  }
}
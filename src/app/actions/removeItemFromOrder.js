export async function removeItemFromOrder({ store, api, payload }) {
  const { productId } = payload;
  let notification = null;

  try {
    store.setState((state) => {
      if (state.currentOrder.status !== 'CART') {
        notification = { type: "WARNING", message: "Položky lze odebírat pouze ve stavu košíku." };
        return { ...state, ui: { ...state.ui, notification } };
      }

      const updatedItems = state.currentOrder.items.filter(item => item.productId !== productId);
      const updatedTotalPrice = updatedItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

      notification = { type: "SUCCESS", message: "Položka byla odebrána z košíku." };

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
        notification,
        status: "ERROR",
        message: error.message,
      },
    }));
  }
}
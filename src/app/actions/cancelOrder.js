export async function cancelOrder({ store, api, payload }) {
  const state = store.getState();
  const { token, role } = state.auth; // Můžeme si vytáhnout i roli
  const { orderId } = payload || {};
  let notification = null;

  
  try {
    if (!orderId || store.getState().currentOrder.id === orderId) {
      store.setState((state) => {
        if (state.currentOrder.status !== 'CART') {
          notification = { type: "WARNING", message: "Tento košík již nelze vyprázdnit." };
          return { ...state, ui: { ...state.ui, notification } };
        }
        
        notification = { type: "SUCCESS", message: "Košík byl vyprázdněn." };
        return {
          ...state,
          currentOrder: { id: null, status: 'CART', items: [], totalPrice: 0 },
          ui: { ...state.ui, notification }
        };
      });
      return; 
    }

    //PLACED -> CANCELED
    const orderToCancel = state.orders.find(o => o.id === orderId);

    if (!orderToCancel) {
       throw new Error("Objednávka nebyla nalezena.");
    }

    //invarianta: pouze objednávky ve stavu PLACED lze stornovat
    if (orderToCancel.status === "SHIPPED") {
       throw new Error("Objednávku nelze stornovat, již byla expedována.");
    }
    
    if (orderToCancel.status === "CANCELED") {
       throw new Error("Tato objednávka je již stornována.");
    }

    const { status, reason, order } = await api.orders.cancelOrder(orderId, token);

    store.setState((state) => {
      let { orders } = state;

      if (status === "SUCCESS") {
        orders = state.orders.map((o) => o.id === order.id ? order : o);
        notification = { type: "SUCCESS", message: "Objednávka byla úspěšně stornována." };
      }

      if (status === "REJECTED") {
        notification = { type: "WARNING", message: "Objednávku se nepodařilo stornovat." };
      }

      return {
        ...state,
        orders,
        ui: { ...state.ui, notification },
      };
    });

  } catch (error) {
    store.setState((state) => ({
      ...state,
      ui: { ...state.ui, notification, status: "ERROR", message: error.message },
    }));
  }
}
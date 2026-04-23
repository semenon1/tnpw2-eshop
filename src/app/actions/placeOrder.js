export async function placeOrder({ store, api, payload }) {
  const { token } = store.getState().auth;
  const { currentOrder } = store.getState();
  const { deliveryDetails } = payload;
  let notification = null;

  try {
    if (currentOrder.items.length === 0) {
      throw new Error("Nelze odeslat prázdný košík.");
    }

    if (!deliveryDetails || !deliveryDetails.address) {
      throw new Error("Chybí doručovací údaje.");
    }

    const { status, reason, orderId } = await api.products.placeOrder(currentOrder, deliveryDetails, token);

    store.setState((state) => {
      if (status === "SUCCESS") {
        const finishedOrder = {
          ...state.currentOrder,
          status: 'PLACED',
          deliveryDetails: deliveryDetails,
          id: orderId 
        };

        notification = {
          type: 'SUCCESS',
          message: 'Objednávka byla úspěšně odeslána!'
        };

        return {
          ...state,
          orders: [...state.orders, finishedOrder],
          currentOrder: { 
            id: null,
            status: 'CART',
            items: [],
            totalPrice: 0
          },
          ui: {
            ...state.ui,
            mode: 'ORDER_SUCCESS',
            notification
          }
        };
      }

      if (status === "REJECTED") {
        notification = {
          type: 'WARNING',
          message: 'Objednávku nelze odeslat.'
        };
      }

      return {
        ...state,
        ui: { ...state.ui, notification }
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
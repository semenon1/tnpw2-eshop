export async function placeOrder({ store, api, payload }) {
  const state = store.getState();
  const { currentOrder } = state;
  const { deliveryDetails } = payload;

  if (currentOrder.items.length === 0) {
    console.warn("Nelze odeslat prázdný košík."); 
    return;
  }

  if (!deliveryDetails || !deliveryDetails.address) {
    console.warn("Chybí doručovací údaje."); 
    return;
  }

  try {
    const response = await api.products.placeOrder(currentOrder, deliveryDetails);

    if (response.status === "SUCCESS") {
      store.setState((state) => {
        const finishedOrder = {
          ...state.currentOrder,
          status: 'PLACED',
          deliveryDetails: deliveryDetails,
          id: response.orderId 
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
            notification: { type: 'SUCCESS', message: 'Objednávka byla úspěšně odeslána!' }
          }
        };
      });
    }
  } catch (error) {
    console.error("Chyba při odesílání objednávky:", error);
  }
}
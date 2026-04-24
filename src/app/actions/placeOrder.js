export async function placeOrder({ store, api, payload }) {
  const state = store.getState();
  const { token } = state.auth;
  const { currentOrder, products } = state;
  const deliveryDetails = payload?.deliveryDetails || currentOrder.deliveryDetails;
  let notification = null;

  //prechod CART -> PLACED

  try {
    //invarianta: objednávka ve stavu PLACED nebo SHIPPED nesmí být prázdná 
    if (currentOrder.items.length === 0) {
      throw new Error("Nelze odeslat prázdný košík.");
    }
    //invarianta: objednávka ve stavu PLACED musí mít vyplněné doručovací údaje
    if (!deliveryDetails || !deliveryDetails.address) {
      throw new Error("Chybí doručovací údaje.");
    }

    //invarianta: všechny položky v objednávce musí být aktivní a musí být skladem v požadovaném množství
    for (const item of currentOrder.items) {
      const product = products.find(p => p.id === item.productId);
      if (!product) continue;

      if (product.status !== 'ACTIVE') {
        throw new Error(`Položka v košíku již není aktivní. Objednávku nelze odeslat.`);
      }
      if (product.stockCount === 0 || product.stockCount < item.quantity) {
        throw new Error(`Zboží již není skladem v požadovaném množství. Objednávku nelze odeslat.`);
      }
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
      }

      return {
        ...state,
        ui: { ...state.ui, notification: { type: 'WARNING', message: 'Objednávku nelze odeslat.' } }
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
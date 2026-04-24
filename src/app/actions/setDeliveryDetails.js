export async function setDeliveryDetails({ store, payload }) {
  const { deliveryDetails } = payload;
  let notification = null;

  try {
    store.setState((state) => {
      //invarianta: pokud status ≠ CART, nelze měnit doručovací údaje
      if (state.currentOrder.status !== 'CART') {
        notification = { type: 'WARNING', message: "Doručovací údaje lze měnit pouze u rozpracované objednávky." };
        return { ...state, ui: { ...state.ui, notification } };
      }

      notification = { type: 'SUCCESS', message: 'Doručovací údaje byly úspěšně uloženy.' };

      return {
        ...state,
        currentOrder: {
          ...state.currentOrder,
          deliveryDetails: deliveryDetails
        },
        ui: { ...state.ui, notification }
      };
    });
  } catch (error) {
    store.setState((state) => ({
      ...state,
      ui: { ...state.ui, notification: { type: 'WARNING', message: error.message } }
    }));
  }
}
export async function shipOrder({ store, api, payload }) {
  const { token, role } = store.getState().auth;
  const { orderId } = payload;
  let notification = null;

  try {
    if (role !== 'ADMIN') {
      throw new Error("K této akci nemáte oprávnění.");
    }

    const { status, reason, order } = await api.orders.shipOrder(orderId, token);

    store.setState((state) => {
      let { orders } = state;

      if (status === "SUCCESS") {
        orders = state.orders.map((o) => o.id === order.id ? order : o);
        notification = { type: "SUCCESS", message: "Objednávka byla odeslána." };
      }

      if (status === "REJECTED") {
        notification = { type: "WARNING", message: "Objednávku nelze expedovat." };
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
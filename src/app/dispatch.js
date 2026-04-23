import { addItemToOrder } from "./actions/addItemToOrder.js";
import { placeOrder } from "./actions/placeOrder.js";

export function createDispatcher(store, api) {
  return async function dispatch(action) {
    const { type, payload = {} } = action ?? {};

    switch (type) {
      case "ADD_ITEM_TO_CART":
        return addItemToOrder({ store, payload });

      case "PLACE_ORDER":
        return placeOrder({ store, api, payload });

      case "ENTER_CART":
        store.setState(state => ({
          ...state,
          ui: { ...state.ui, mode: 'CART_DETAIL' }
        }));
        break;

      default:
        console.warn(`Neznámý typ akce: ${type}`);
    }
  };
}
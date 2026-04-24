import { addItemToOrder } from "./actions/addItemToOrder.js";
import { placeOrder } from "./actions/placeOrder.js";
import { loginUser } from "./actions/loginUser.js";
import { logoutUser } from "./actions/logoutUser.js";
import { removeItemFromOrder } from "./actions/removeItemFromOrder.js";
import { updateItemQuantity } from "./actions/updateItemQuantity.js";
import { cancelOrder } from "./actions/cancelOrder.js";
import { shipOrder } from "./actions/shipOrder.js";
import { setDeliveryDetails } from "./actions/setDeliveryDetails.js";

export function createDispatcher(store, api) {
  return async function dispatch(action) {
    const { type, payload = {} } = action ?? {};

    switch (type) {
      case "LOGIN":
        return loginUser({ store, api, payload });
      case "LOGOUT":
        return logoutUser({ store, api });

      case "ADD_ITEM_TO_CART":
        return addItemToOrder({ store, payload });
      case "REMOVE_ITEM_FROM_CART":
        return removeItemFromOrder({ store, api, payload });
      case "UPDATE_ITEM_QUANTITY":
        return updateItemQuantity({ store, api, payload });
      case "PLACE_ORDER":
        return placeOrder({ store, api, payload });
      case "CANCEL_ORDER":
        return cancelOrder({ store, api, payload });
      case "SHIP_ORDER":
        return shipOrder({ store, api, payload });
        case "SET_DELIVERY_DETAILS":
      return setDeliveryDetails({ store, payload });

      case "ENTER_CATALOG":
        store.setState(state => ({
          ...state,
          ui: { ...state.ui, mode: 'CATALOG' }
        }));
        break;

      case "ENTER_CART":
        store.setState(state => ({
          ...state,
          ui: { ...state.ui, mode: 'CART_DETAIL' }
        }));
        break;

      case "ENTER_ORDER_SUCCESS":
        store.setState(state => ({
          ...state,
          ui: { ...state.ui, mode: 'ORDER_SUCCESS' }
        }));
        break;

      case "ENTER_AUTHENTICATION":
        store.setState(state => ({
          ...state,
          ui: { ...state.ui, mode: 'AUTHENTICATION' }
        }));
        break;

      default:
        console.warn(`Neznámý typ akce: ${type}`);
    }
  };
}
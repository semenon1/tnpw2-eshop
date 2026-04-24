// student_masloma2_tests.js
// Spuštění v terminálu: node tests/student_masloma2_tests.js

import { createStore } from "../src/infra/store/createStore.js";
import { addItemToOrder } from "../src/app/actions/addItemToOrder.js";
import { removeItemFromOrder } from "../src/app/actions/removeItemFromOrder.js";
import { updateItemQuantity } from "../src/app/actions/updateItemQuantity.js";
import { setDeliveryDetails } from "../src/app/actions/setDeliveryDetails.js";
import { placeOrder } from "../src/app/actions/placeOrder.js";
import { cancelOrder } from "../src/app/actions/cancelOrder.js";
import { shipOrder } from "../src/app/actions/shipOrder.js";
import { loginUser } from "../src/app/actions/loginUser.js";
import { logoutUser } from "../src/app/actions/logoutUser.js";
import { createDispatcher } from "../src/app/dispatch.js";
import { parseUrl, urlToAction, routeToUrl, stateToUrl } from "../src/infra/router/router.js";

function clone(obj) {
  return JSON.parse(JSON.stringify(obj));
}

// ==========================================
// 1. Doména ORDER (Business entita)
// ==========================================

export async function testScenario_addItemToOrder() {
  let state1 = { 
    products: [{ id: 'p1', price: 50, status: 'ACTIVE' }],
    currentOrder: { status: 'CART', items: [], totalPrice: 0 }, 
    ui: { notification: null } 
  };
  const store1 = createStore(clone(state1));
  
  await addItemToOrder({ store: store1, payload: { productId: 'p1', quantity: 2 } });
  
  const newState1 = store1.getState();
  console.assert(newState1.currentOrder.items.length === 1, "Položka úspěšně přidána do košíku");
  console.assert(newState1.currentOrder.totalPrice === 100, "Celková cena je správně spočítána (100 Kč)");
  console.assert(newState1.ui.notification?.type === 'SUCCESS', "Notifikace je SUCCESS");

  let state2 = { 
    products: [{ id: 'p1', price: 50, status: 'ACTIVE' }],
    currentOrder: { status: 'PLACED', items: [], totalPrice: 0 }, 
    ui: { notification: null } 
  };
  const store2 = createStore(clone(state2));
  
  await addItemToOrder({ store: store2, payload: { productId: 'p1', quantity: 1 } });
  
  const newState2 = store2.getState();
  console.assert(newState2.currentOrder.items.length === 0, "Položka nebyla přidána, protože status není CART");
  console.assert(newState2.ui.notification?.type === 'WARNING', "Zobrazila se WARNING notifikace");

  console.log("testScenario_addItemToOrder passed");
}

export async function testScenario_removeItemFromOrder() {
  let state = {
    currentOrder: { status: 'CART', items: [{ productId: 'p1', quantity: 2, price: 50 }, { productId: 'p2', quantity: 1, price: 100 }], totalPrice: 200 },
    ui: { notification: null }
  };
  const store = createStore(clone(state));
  await removeItemFromOrder({ store, api: {}, payload: { productId: 'p1' } });

  const newState = store.getState();
  console.assert(newState.currentOrder.items.length === 1, "Položka p1 byla odebrána");
  console.assert(newState.currentOrder.items[0].productId === 'p2', "V košíku zbyla jen položka p2");
  console.assert(newState.currentOrder.totalPrice === 100, "Celková cena se přepočítala na 100 Kč");
  console.assert(newState.ui.notification?.type === 'SUCCESS', "Notifikace je SUCCESS");

  console.log("testScenario_removeItemFromOrder passed");
}

export async function testScenario_updateItemQuantity() {
  let state1 = { currentOrder: { status: 'CART', items: [{ productId: 'p1', quantity: 1, price: 50 }], totalPrice: 50 }, ui: { notification: null } };
  const store1 = createStore(clone(state1));
  await updateItemQuantity({ store: store1, api: {}, payload: { productId: 'p1', quantity: 4 } });
  
  const newState1 = store1.getState();
  console.assert(newState1.currentOrder.items[0].quantity === 4, "Množství se aktualizovalo na 4");
  console.assert(newState1.currentOrder.totalPrice === 200, "Cena se přepočítala na 200 Kč");

  let state2 = { currentOrder: { status: 'CART', items: [{ productId: 'p1', quantity: 1, price: 50 }], totalPrice: 50 }, ui: { notification: null } };
  const store2 = createStore(clone(state2));
  await updateItemQuantity({ store: store2, api: {}, payload: { productId: 'p1', quantity: -2 } });
  
  const newState2 = store2.getState();
  console.assert(newState2.currentOrder.items[0].quantity === 1, "Množství se nezměnilo");
  console.assert(newState2.ui.notification?.type === 'WARNING', "Notifikace je WARNING");

  console.log("testScenario_updateItemQuantity passed");
}

export async function testScenario_setDeliveryDetails() {
  let state = { currentOrder: { status: 'CART', deliveryDetails: null }, ui: { notification: null } };
  const store = createStore(clone(state));
  await setDeliveryDetails({ store, payload: { deliveryDetails: { address: 'Hradecká 1' } } });

  const newState = store.getState();
  console.assert(newState.currentOrder.deliveryDetails?.address === 'Hradecká 1', "Údaje byly uloženy");
  console.assert(newState.ui.notification?.type === 'SUCCESS', "Notifikace je SUCCESS");

  console.log("testScenario_setDeliveryDetails passed");
}

export async function testScenario_placeOrder() {
  let state1 = {
    auth: { token: 'token123' },
    currentOrder: { status: 'CART', items: [{ productId: 'p1', quantity: 1, price: 50 }], totalPrice: 50, id: null },
    products: [{ id: 'p1', status: 'ACTIVE', stockCount: 5 }],
    orders: [], ui: { mode: 'CART_DETAIL', notification: null }
  };
  const store1 = createStore(clone(state1));
  const api1 = { products: { placeOrder: async () => ({ status: 'SUCCESS', orderId: 'ord-1' }) } };
  await placeOrder({ store: store1, api: api1, payload: { deliveryDetails: { address: 'Ulice 1' } } });

  const newState1 = store1.getState();
  console.assert(newState1.orders.length === 1, "Objednávka se přesunula do 'orders'");
  console.assert(newState1.orders[0].status === 'PLACED', "Status objednávky je PLACED");
  console.assert(newState1.currentOrder.items.length === 0, "Aktuální košík se vyprázdnil");
  console.assert(newState1.ui.mode === 'ORDER_SUCCESS', "Změnil se mód na ORDER_SUCCESS");

  let state2 = {
    auth: { token: 'token' },
    currentOrder: { status: 'CART', items: [{ productId: 'p1', quantity: 1, price: 50 }], deliveryDetails: null },
    products: [{ id: 'p1', status: 'ACTIVE', stockCount: 5 }], ui: { notification: null, status: 'READY' }
  };
  const store2 = createStore(clone(state2));
  await placeOrder({ store: store2, api: {}, payload: {} });

  const newState2 = store2.getState();
  console.assert(newState2.ui.status === 'ERROR', "Aplikace ohlásila ERROR pro chybějící údaje");

  console.log("testScenario_placeOrder passed");
}

export async function testScenario_cancelOrder() {
  let state1 = { auth: { token: 'token' }, currentOrder: { id: null, status: 'CART' }, orders: [{ id: 'ord-1', status: 'PLACED' }], ui: { notification: null } };
  const store1 = createStore(clone(state1));
  const api1 = { orders: { cancelOrder: async () => ({ status: 'SUCCESS', order: { id: 'ord-1', status: 'CANCELED' } }) } };
  await cancelOrder({ store: store1, api: api1, payload: { orderId: 'ord-1' } });

  const newState1 = store1.getState();
  console.assert(newState1.orders[0].status === 'CANCELED', "Stav byl změněn na CANCELED");
  console.assert(newState1.ui.notification?.type === 'SUCCESS', "Notifikace je SUCCESS");

  let state2 = { auth: { token: 'token' }, currentOrder: { id: null, status: 'CART' }, orders: [{ id: 'ord-2', status: 'SHIPPED' }], ui: { notification: null, status: 'READY' } };
  const store2 = createStore(clone(state2));
  await cancelOrder({ store: store2, api: {}, payload: { orderId: 'ord-2' } });

  const newState2 = store2.getState();
  console.assert(newState2.ui.status === 'ERROR', "Aplikace přešla do ERRORu (zachycena výjimka)");
  console.assert(newState2.ui.message.includes('již byla expedována'), "Správná zpráva výjimky");

  console.log("testScenario_cancelOrder passed");
}

export async function testScenario_shipOrder() {
  let state1 = { auth: { token: 'admin-token', role: 'ADMIN' }, orders: [{ id: 'ord-3', status: 'PLACED' }], ui: { notification: null } };
  const store1 = createStore(clone(state1));
  const api1 = { orders: { shipOrder: async () => ({ status: 'SUCCESS', order: { id: 'ord-3', status: 'SHIPPED' } }) } };
  await shipOrder({ store: store1, api: api1, payload: { orderId: 'ord-3' } });

  const newState1 = store1.getState();
  console.assert(newState1.orders[0].status === 'SHIPPED', "Objednávka přešla do stavu SHIPPED");
  console.assert(newState1.ui.notification?.type === 'SUCCESS', "Notifikace je SUCCESS");

  let state2 = { auth: { token: 'user-token', role: 'ANONYMOUS' }, orders: [{ id: 'ord-4', status: 'PLACED' }], ui: { notification: null, status: 'READY' } };
  const store2 = createStore(clone(state2));
  await shipOrder({ store: store2, api: {}, payload: { orderId: 'ord-4' } });

  const newState2 = store2.getState();
  console.assert(newState2.ui.status === 'ERROR', "Aplikace hodila ERROR o oprávněních");
  console.assert(newState2.ui.message.includes('oprávnění'), "Zachycena zpráva o oprávnění");

  console.log("testScenario_shipOrder passed");
}

// ==========================================
// 2. Autentizace (IR08)
// ==========================================

export async function testScenario_auth() {
  let state1 = { auth: { role: 'ANONYMOUS', userId: null, token: null }, ui: { status: 'READY', mode: 'AUTHENTICATION', notification: null } };
  const store1 = createStore(clone(state1));
  const api1 = { auth: { login: async () => ({ status: 'SUCCESS', role: 'ADMIN', userId: '1', token: 'mock-token-123' }) } };
  await loginUser({ store: store1, api: api1, payload: { username: 'admin', password: 'heslo' } });

  const newState1 = store1.getState();
  console.assert(newState1.auth.role === 'ADMIN', "loginUser: role je nastavena na ADMIN");
  console.assert(newState1.auth.token === 'mock-token-123', "loginUser: token byl úspěšně uložen");
  console.assert(newState1.ui.mode === 'CATALOG', "loginUser: po přihlášení se aplikace přepne do katalogu");

  let state2 = { auth: { role: 'ANONYMOUS', userId: null, token: null }, ui: { status: 'READY', mode: 'AUTHENTICATION', notification: null } };
  const store2 = createStore(clone(state2));
  const api2 = { auth: { login: async () => ({ status: 'REJECTED', reason: 'Špatné jméno nebo heslo.' }) } };
  await loginUser({ store: store2, api: api2, payload: { username: 'spatny_user', password: '123' } });

  const newState2 = store2.getState();
  console.assert(newState2.auth.role === 'ANONYMOUS', "loginUser: role zůstala ANONYMOUS");
  console.assert(newState2.auth.token === null, "loginUser: token nebyl přidělen");

  let state3 = { auth: { role: 'USER', userId: '1', token: 'mock-token-123' }, ui: { status: 'READY', mode: 'CATALOG', notification: null } };
  const store3 = createStore(clone(state3));
  await logoutUser({ store: store3, api: {} });

  const newState3 = store3.getState();
  console.assert(newState3.auth.role === 'ANONYMOUS', "logoutUser: role se vrátila na ANONYMOUS");
  console.assert(newState3.auth.token === null, "logoutUser: token byl bezpečně smazán");

  console.log("testScenario_auth passed");
}

// ==========================================
// 3. Dispatcher (IR02)
// ==========================================

export async function testScenario_dispatcher() {
  let state1 = { ui: { mode: 'UNKNOWN' } };
  const store1 = createStore(clone(state1));
  const dispatch1 = createDispatcher(store1, {});

  await dispatch1({ type: 'ENTER_CATALOG' });
  console.assert(store1.getState().ui.mode === 'CATALOG', "ENTER_CATALOG: přepne ui.mode na CATALOG");

  await dispatch1({ type: 'ENTER_CART' });
  console.assert(store1.getState().ui.mode === 'CART_DETAIL', "ENTER_CART: přepne ui.mode na CART_DETAIL");

  let state2 = { currentOrder: { status: 'CART', items: [], totalPrice: 0 }, ui: { notification: null } };
  const store2 = createStore(clone(state2));
  const dispatch2 = createDispatcher(store2, {});
  await dispatch2({ type: 'ADD_ITEM_TO_CART', payload: { product: { id: 'p1', price: 100, status: 'ACTIVE' }, quantity: 1 } });

  console.assert(store2.getState().currentOrder.items.length === 1, "ADD_ITEM_TO_CART: dispatcher předal payload akci");
  console.assert(store2.getState().currentOrder.totalPrice === 100, "ADD_ITEM_TO_CART: cena byla správně přepočítána");

  console.log("testScenario_dispatcher passed");
}

// ==========================================
// 4. Router (IR04)
// ==========================================

export function testScenario_router() {
  console.assert(parseUrl("/products").context === "CATALOG", "parseUrl /products: context je CATALOG");
  console.assert(parseUrl("/cart").context === "CART_DETAIL", "parseUrl /cart: context je CART_DETAIL");
  console.assert(parseUrl("/auth").context === "AUTHENTICATION", "parseUrl /auth: context je AUTHENTICATION");

  console.assert(urlToAction("http://localhost:8080/#/products").type === "ENTER_CATALOG", "urlToAction #/products: vygeneruje akci ENTER_CATALOG");
  console.assert(urlToAction("https://muj-eshop.cz/#/orders/success").type === "ENTER_ORDER_SUCCESS", "urlToAction #/orders/success: vygeneruje akci ENTER_ORDER_SUCCESS");

  console.assert(routeToUrl({ context: "CATALOG" }) === "#/products", "routeToUrl CATALOG: vrací #/products");
  
  const catalogState = { ui: { mode: "CATALOG" } };
  console.assert(stateToUrl(catalogState) === "#/products", "stateToUrl: mód CATALOG vrátí #/products");

  console.log("testScenario_router passed");
}

// ==========================================
// SPUŠTĚNÍ TESTŮ 
// ==========================================

testScenario_router();
testScenario_dispatcher()
  .then(() => testScenario_auth())
  .then(() => testScenario_addItemToOrder())
  .then(() => testScenario_removeItemFromOrder())
  .then(() => testScenario_updateItemQuantity())
  .then(() => testScenario_setDeliveryDetails())
  .then(() => testScenario_placeOrder())
  .then(() => testScenario_cancelOrder())
  .then(() => testScenario_shipOrder());
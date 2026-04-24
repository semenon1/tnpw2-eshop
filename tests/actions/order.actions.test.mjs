// Spuštění v terminálu: node tests/actions/order.actions.test.mjs

import { assert } from "../assert.js";
import { createStore } from "../../src/infra/store/createStore.js";
import { addItemToOrder } from "../../src/app/actions/addItemToOrder.js";
import { removeItemFromOrder } from "../../src/app/actions/removeItemFromOrder.js";
import { updateItemQuantity } from "../../src/app/actions/updateItemQuantity.js";
import { setDeliveryDetails } from "../../src/app/actions/setDeliveryDetails.js";
import { placeOrder } from "../../src/app/actions/placeOrder.js";
import { cancelOrder } from "../../src/app/actions/cancelOrder.js";
import { shipOrder } from "../../src/app/actions/shipOrder.js";

console.log("\n── Testy doménových akcí: ORDER ──");

// ==========================================
// 1. addItemToOrder
// ==========================================
console.log("\n[addItemToOrder] SUCCESS - Přidání produktu do košíku");
{
  const store = createStore({
    currentOrder: { status: 'CART', items: [], totalPrice: 0 },
    ui: { notification: null }
  });

  await addItemToOrder({
    store,
    payload: { product: { id: 'p1', price: 50, status: 'ACTIVE' }, quantity: 2 }
  });

  const state = store.getState();
  assert(state.currentOrder.items.length === 1, "Položka úspěšně přidána do košíku");
  assert(state.currentOrder.totalPrice === 100, "Celková cena je správně spočítána (100 Kč)");
  assert(state.ui.notification?.type === 'SUCCESS', "Notifikace je SUCCESS");
}

console.log("\n[addItemToOrder] WARNING - Přidání do odeslané objednávky (porušení invariantu)");
{
  const store = createStore({
    currentOrder: { status: 'PLACED', items: [], totalPrice: 0 },
    ui: { notification: null }
  });

  await addItemToOrder({ store, payload: { product: { id: 'p1', price: 50, status: 'ACTIVE' }, quantity: 1 } });
  
  const state = store.getState();
  assert(state.currentOrder.items.length === 0, "Položka nebyla přidána, protože status není CART");
  assert(state.ui.notification?.type === 'WARNING', "Zobrazila se WARNING notifikace");
}


// ==========================================
// 2. removeItemFromOrder
// ==========================================
console.log("\n[removeItemFromOrder] SUCCESS - Odebrání položky z košíku");
{
  const store = createStore({
    currentOrder: { 
      status: 'CART', 
      items: [{ productId: 'p1', quantity: 2, price: 50 }, { productId: 'p2', quantity: 1, price: 100 }], 
      totalPrice: 200 
    },
    ui: { notification: null }
  });

  await removeItemFromOrder({ store, api: {}, payload: { productId: 'p1' } });

  const state = store.getState();
  assert(state.currentOrder.items.length === 1, "Položka p1 byla odebrána");
  assert(state.currentOrder.items[0].productId === 'p2', "V košíku zbyla jen položka p2");
  assert(state.currentOrder.totalPrice === 100, "Celková cena se přepočítala na 100 Kč");
  assert(state.ui.notification?.type === 'SUCCESS', "Notifikace je SUCCESS");
}


// ==========================================
// 3. updateItemQuantity
// ==========================================
console.log("\n[updateItemQuantity] SUCCESS - Změna množství položky v košíku");
{
  const store = createStore({
    currentOrder: { status: 'CART', items: [{ productId: 'p1', quantity: 1, price: 50 }], totalPrice: 50 },
    ui: { notification: null }
  });

  await updateItemQuantity({ store, api: {}, payload: { productId: 'p1', quantity: 4 } });

  const state = store.getState();
  assert(state.currentOrder.items[0].quantity === 4, "Množství se aktualizovalo na 4");
  assert(state.currentOrder.totalPrice === 200, "Cena se přepočítala na 200 Kč");
}

console.log("\n[updateItemQuantity] WARNING - Pokus o nastavení záporného množství (porušení invariantu)");
{
  const store = createStore({
    currentOrder: { status: 'CART', items: [{ productId: 'p1', quantity: 1, price: 50 }], totalPrice: 50 },
    ui: { notification: null }
  });

  await updateItemQuantity({ store, api: {}, payload: { productId: 'p1', quantity: -2 } });

  const state = store.getState();
  assert(state.currentOrder.items[0].quantity === 1, "Množství se nezměnilo");
  assert(state.ui.notification?.type === 'WARNING', "Notifikace je WARNING");
}


// ==========================================
// 4. setDeliveryDetails
// ==========================================
console.log("\n[setDeliveryDetails] SUCCESS - Nastavení doručovacích údajů");
{
  const store = createStore({
    currentOrder: { status: 'CART', deliveryDetails: null },
    ui: { notification: null }
  });

  await setDeliveryDetails({ store, payload: { deliveryDetails: { address: 'Hradecká 1' } } });

  const state = store.getState();
  assert(state.currentOrder.deliveryDetails?.address === 'Hradecká 1', "Údaje byly uloženy");
  assert(state.ui.notification?.type === 'SUCCESS', "Notifikace je SUCCESS");
}


// ==========================================
// 5. placeOrder
// ==========================================
console.log("\n[placeOrder] SUCCESS - Odeslání objednávky (CART -> PLACED)");
{
  const store = createStore({
    auth: { token: 'token123' },
    currentOrder: { status: 'CART', items: [{ productId: 'p1', quantity: 1, price: 50 }], totalPrice: 50, id: null },
    products: [{ id: 'p1', status: 'ACTIVE', stockCount: 5 }],
    orders: [],
    ui: { mode: 'CART_DETAIL', notification: null }
  });

  const api = {
    products: { placeOrder: async () => ({ status: 'SUCCESS', orderId: 'ord-1' }) }
  };

  await placeOrder({ store, api, payload: { deliveryDetails: { address: 'Ulice 1' } } });

  const state = store.getState();
  assert(state.orders.length === 1, "Objednávka se přesunula do 'orders'");
  assert(state.orders[0].status === 'PLACED', "Status objednávky je PLACED");
  assert(state.currentOrder.items.length === 0, "Aktuální košík se vyprázdnil");
  assert(state.ui.mode === 'ORDER_SUCCESS', "Změnil se mód na ORDER_SUCCESS");
}

console.log("\n[placeOrder] ERROR - Chybějící doručovací údaje");
{
  const store = createStore({
    auth: { token: 'token' },
    currentOrder: { status: 'CART', items: [{ productId: 'p1', quantity: 1, price: 50 }], deliveryDetails: null },
    products: [{ id: 'p1', status: 'ACTIVE', stockCount: 5 }],
    ui: { notification: null, status: 'READY' }
  });

  await placeOrder({ store, api: {}, payload: {} }); // Žádné údaje

  const state = store.getState();
  assert(state.ui.status === 'ERROR', "Aplikace ohlásila ERROR");
  assert(state.ui.message === 'Chybí doručovací údaje.', "Správná chybová hláška");
}


// ==========================================
// 6. cancelOrder
// ==========================================
console.log("\n[cancelOrder] SUCCESS - Stornování objednávky (PLACED -> CANCELED)");
{
  const store = createStore({
    auth: { token: 'token' },
    orders: [{ id: 'ord-1', status: 'PLACED' }],
    ui: { notification: null }
  });

  const api = {
    orders: { cancelOrder: async () => ({ status: 'SUCCESS', order: { id: 'ord-1', status: 'CANCELED' } }) }
  };

  await cancelOrder({ store, api, payload: { orderId: 'ord-1' } });

  const state = store.getState();
  assert(state.orders[0].status === 'CANCELED', "Stav byl změněn na CANCELED");
  assert(state.ui.notification?.type === 'SUCCESS', "Notifikace je SUCCESS");
}

console.log("\n[cancelOrder] ERROR - Storno expedované objednávky (porušení invariantu)");
{
  const store = createStore({
    auth: { token: 'token' },
    orders: [{ id: 'ord-2', status: 'SHIPPED' }], // Už odesláno!
    ui: { notification: null, status: 'READY' }
  });

  await cancelOrder({ store, api: {}, payload: { orderId: 'ord-2' } });

  const state = store.getState();
  assert(state.ui.status === 'ERROR', "Aplikace přešla do ERRORu (zachycena výjimka)");
  assert(state.ui.message.includes('již byla expedována'), "Správná zpráva výjimky");
}


// ==========================================
// 7. shipOrder
// ==========================================
console.log("\n[shipOrder] SUCCESS - Expedice administrátorem (PLACED -> SHIPPED)");
{
  const store = createStore({
    auth: { token: 'admin-token', role: 'ADMIN' }, // Admin role
    orders: [{ id: 'ord-3', status: 'PLACED' }],
    ui: { notification: null }
  });

  const api = {
    orders: { shipOrder: async () => ({ status: 'SUCCESS', order: { id: 'ord-3', status: 'SHIPPED' } }) }
  };

  await shipOrder({ store, api, payload: { orderId: 'ord-3' } });

  const state = store.getState();
  assert(state.orders[0].status === 'SHIPPED', "Objednávka přešla do stavu SHIPPED");
  assert(state.ui.notification?.type === 'SUCCESS', "Notifikace je SUCCESS");
}

console.log("\n[shipOrder] ERROR - Běžný uživatel zkouší expedovat (Nedostatečná práva)");
{
  const store = createStore({
    auth: { token: 'user-token', role: 'USER' }, // Není admin!
    orders: [{ id: 'ord-4', status: 'PLACED' }],
    ui: { notification: null, status: 'READY' }
  });

  await shipOrder({ store, api: {}, payload: { orderId: 'ord-4' } });

  const state = store.getState();
  assert(state.ui.status === 'ERROR', "Aplikace hodila ERROR o oprávněních");
  assert(state.ui.message.includes('oprávnění'), "Zachycena zpráva o oprávnění");
}

console.log("\n── Všechny testy domény Order hotovy ──\n");
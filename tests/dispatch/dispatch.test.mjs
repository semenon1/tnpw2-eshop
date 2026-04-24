import { assert } from "../assert.js";
import { createStore } from "../../src/infra/store/createStore.js";
import { createDispatcher } from "../../src/app/dispatch.js";

console.log("\n── Testy Dispatcheru (IR02) ──");

// ==========================================
// 1. Navigační akce (Synchronní změny stavu)
// ==========================================
console.log("\n[Navigace] Přepínání módů aplikace");
{
  const store = createStore({
    ui: { mode: 'UNKNOWN' }
  });
  
  const dispatch = createDispatcher(store, {});

  dispatch({ type: 'ENTER_CATALOG' });
  assert(store.getState().ui.mode === 'CATALOG', "ENTER_CATALOG: přepne ui.mode na CATALOG");

  dispatch({ type: 'ENTER_CART' });
  assert(store.getState().ui.mode === 'CART_DETAIL', "ENTER_CART: přepne ui.mode na CART_DETAIL");

  dispatch({ type: 'ENTER_ORDER_SUCCESS' });
  assert(store.getState().ui.mode === 'ORDER_SUCCESS', "ENTER_ORDER_SUCCESS: přepne ui.mode na ORDER_SUCCESS");

  dispatch({ type: 'ENTER_AUTHENTICATION' });
  assert(store.getState().ui.mode === 'AUTHENTICATION', "ENTER_AUTHENTICATION: přepne ui.mode na AUTHENTICATION");
}


// ==========================================
// 2. Propojení s autentizačními akcemi
// ==========================================
console.log("\n[Delegace] Autentizační akce (LOGIN)");
{
  const store = createStore({
    auth: { role: 'ANONYMOUS', userId: null, token: null },
    ui: { status: 'READY', mode: 'AUTHENTICATION', notification: null }
  });

  const api = {
    auth: {
      login: async () => ({ status: 'SUCCESS', role: 'ADMIN', userId: 'u-1', token: 'token-123' })
    }
  };

  const dispatch = createDispatcher(store, api);

  await dispatch({ type: 'LOGIN', payload: { username: 'admin', password: '123' } });

  const state = store.getState();
  assert(state.auth.role === 'ADMIN', "LOGIN: dispatcher správně delegoval požadavek a přihlásil uživatele");
  assert(state.auth.token === 'token-123', "LOGIN: dispatcher zapsal token do stavu");
}


// ==========================================
// 3. Propojení s doménovými akcemi
// ==========================================
console.log("\n[Delegace] Doménové akce (ADD_ITEM_TO_CART)");
{
  const store = createStore({
    currentOrder: { status: 'CART', items: [], totalPrice: 0 },
    ui: { notification: null }
  });

  const dispatch = createDispatcher(store, {});

  await dispatch({ 
    type: 'ADD_ITEM_TO_CART', 
    payload: { product: { id: 'p1', price: 100, status: 'ACTIVE' }, quantity: 1 } 
  });

  const state = store.getState();
  assert(state.currentOrder.items.length === 1, "ADD_ITEM_TO_CART: dispatcher předal payload akci a produkt se přidal");
  assert(state.currentOrder.totalPrice === 100, "ADD_ITEM_TO_CART: cena byla správně přepočítána na 100 Kč");
}

console.log("\n[Neznámá akce] Handling neznámého action.type");
{
  const store = createStore({ ui: { mode: 'CATALOG' } });
  const dispatch = createDispatcher(store, {});

  dispatch({ type: 'NEEXISTUJE' });
  
  const state = store.getState();
  assert(state.ui.mode === 'CATALOG', "Neznámá akce: stav aplikace se nijak nezměnil");
}

console.log("\n── Hotovo ──\n");
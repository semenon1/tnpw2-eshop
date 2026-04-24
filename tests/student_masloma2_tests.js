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

// Pomocná funkce podle šablony
function clone(obj) {
  return JSON.parse(JSON.stringify(obj));
}

console.log("\n── SPUŠTĚNÍ TESTŮ (Maria Maslova) ──\n");

// ==========================================
// 1. Doména ORDER (Business entita)
// ==========================================

export async function testScenario_addItemToOrder() {
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
    console.assert(state.currentOrder.items.length === 1, "Položka úspěšně přidána do košíku");
    console.assert(state.currentOrder.totalPrice === 100, "Celková cena je správně spočítána (100 Kč)");
    console.assert(state.ui.notification?.type === 'SUCCESS', "Notifikace je SUCCESS");
  }
  console.log("\n[addItemToOrder] WARNING - Přidání do odeslané objednávky (porušení invariantu)");
  {
    const store = createStore({
      currentOrder: { status: 'PLACED', items: [], totalPrice: 0 },
      ui: { notification: null }
    });
  
    await addItemToOrder({ store, payload: { product: { id: 'p1', price: 50, status: 'ACTIVE' }, quantity: 1 } });
    
    const state = store.getState();
    console.assert(state.currentOrder.items.length === 0, "Položka nebyla přidána, protože status není CART");
    console.assert(state.ui.notification?.type === 'WARNING', "Zobrazila se WARNING notifikace");
  }
}

export async function testScenario_removeItemFromOrder() {
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
    console.assert(state.currentOrder.items.length === 1, "Položka p1 byla odebrána");
    console.assert(state.currentOrder.items[0].productId === 'p2', "V košíku zbyla jen položka p2");
    console.assert(state.currentOrder.totalPrice === 100, "Celková cena se přepočítala na 100 Kč");
    console.assert(state.ui.notification?.type === 'SUCCESS', "Notifikace je SUCCESS");
  }
}

export async function testScenario_updateItemQuantity() {
  console.log("\n[updateItemQuantity] SUCCESS - Změna množství položky v košíku");
  {
    const store = createStore({
      currentOrder: { status: 'CART', items: [{ productId: 'p1', quantity: 1, price: 50 }], totalPrice: 50 },
      ui: { notification: null }
    });
  
    await updateItemQuantity({ store, api: {}, payload: { productId: 'p1', quantity: 4 } });
  
    const state = store.getState();
    console.assert(state.currentOrder.items[0].quantity === 4, "Množství se aktualizovalo na 4");
    console.assert(state.currentOrder.totalPrice === 200, "Cena se přepočítala na 200 Kč");
  }
  
  console.log("\n[updateItemQuantity] WARNING - Pokus o nastavení záporného množství (porušení invariantu)");
  {
    const store = createStore({
      currentOrder: { status: 'CART', items: [{ productId: 'p1', quantity: 1, price: 50 }], totalPrice: 50 },
      ui: { notification: null }
    });
  
    await updateItemQuantity({ store, api: {}, payload: { productId: 'p1', quantity: -2 } });
  
    const state = store.getState();
    console.assert(state.currentOrder.items[0].quantity === 1, "Množství se nezměnilo");
    console.assert(state.ui.notification?.type === 'WARNING', "Notifikace je WARNING");
  }
}

export async function testScenario_setDeliveryDetails() {
    console.log("\n[setDeliveryDetails] SUCCESS - Nastavení doručovacích údajů");
    {
      const store = createStore({
        currentOrder: { status: 'CART', deliveryDetails: null },
        ui: { notification: null }
      });
    
      await setDeliveryDetails({ store, payload: { deliveryDetails: { address: 'Hradecká 1' } } });
    
      const state = store.getState();
      console.assert(state.currentOrder.deliveryDetails?.address === 'Hradecká 1', "Údaje byly uloženy");
      console.assert(state.ui.notification?.type === 'SUCCESS', "Notifikace je SUCCESS");
    }
}

export async function testScenario_placeOrder() {
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
    console.assert(state.orders.length === 1, "Objednávka se přesunula do 'orders'");
    console.assert(state.orders[0].status === 'PLACED', "Status objednávky je PLACED");
    console.assert(state.currentOrder.items.length === 0, "Aktuální košík se vyprázdnil");
    console.assert(state.ui.mode === 'ORDER_SUCCESS', "Změnil se mód na ORDER_SUCCESS");
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
    console.assert(state.ui.status === 'ERROR', "Aplikace ohlásila ERROR");
    console.assert(state.ui.message === 'Chybí doručovací údaje.', "Správná chybová hláška");
  }
}

export async function testScenario_cancelOrder() {
  console.log("\n[cancelOrder] SUCCESS - Stornování objednávky (PLACED -> CANCELED)");
  {
    const store = createStore({
      auth: { token: 'token' },
      currentOrder: { id: null, status: 'CART' },
      orders: [{ id: 'ord-1', status: 'PLACED' }],
      ui: { notification: null }
    });
  
    const api = {
      orders: { cancelOrder: async () => ({ status: 'SUCCESS', order: { id: 'ord-1', status: 'CANCELED' } }) }
    };
  
    await cancelOrder({ store, api, payload: { orderId: 'ord-1' } });
  
    const state = store.getState();
    console.assert(state.orders[0].status === 'CANCELED', "Stav byl změněn na CANCELED");
    console.assert(state.ui.notification?.type === 'SUCCESS', "Notifikace je SUCCESS");
  }
  
  console.log("\n[cancelOrder] ERROR - Storno expedované objednávky (porušení invariantu)");
  {
    const store = createStore({
      auth: { token: 'token' },
      currentOrder: { id: null, status: 'CART' },
      orders: [{ id: 'ord-2', status: 'SHIPPED' }], 
      ui: { notification: null, status: 'READY' }
    });
  
    await cancelOrder({ store, api: {}, payload: { orderId: 'ord-2' } });
  
    const state = store.getState();
    console.assert(state.ui.status === 'ERROR', "Aplikace přešla do ERRORu (zachycena výjimka)");
    console.assert(state.ui.message.includes('již byla expedována'), "Správná zpráva výjimky");
  }
}

export async function testScenario_shipOrder() {
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
    console.assert(state.orders[0].status === 'SHIPPED', "Objednávka přešla do stavu SHIPPED");
    console.assert(state.ui.notification?.type === 'SUCCESS', "Notifikace je SUCCESS");
  }
  
  console.log("\n[shipOrder] ERROR - Běžný uživatel zkouší expedovat (Nedostatečná práva)");
  {
    const store = createStore({
      auth: { token: 'user-token', role: 'ANONYMOUS' },
      orders: [{ id: 'ord-4', status: 'PLACED' }],
      ui: { notification: null, status: 'READY' }
    });
  
    await shipOrder({ store, api: {}, payload: { orderId: 'ord-4' } });
  
    const state = store.getState();
    console.assert(state.ui.status === 'ERROR', "Aplikace hodila ERROR o oprávněních");
    console.assert(state.ui.message.includes('oprávnění'), "Zachycena zpráva o oprávnění");
  }
}


// ==========================================
// 2. Autentizace (IR08)
// ==========================================

export async function testScenario_auth() {
  console.log("\n── Testy autentizačních akcí: AUTH ──");
  
  // loginUser
  console.log("\n[loginUser] SUCCESS - Úspěšné přihlášení uživatele");
  {
    const store = createStore({
      auth: { role: 'ANONYMOUS', userId: null, token: null },
      ui: { status: 'READY', mode: 'AUTHENTICATION', notification: null }
    });
  
    const api = {
      auth: {
        login: async () => ({
          status: 'SUCCESS', role: 'ADMIN', userId: '1', token: 'mock-token-123'
        })
      }
    };
  
    await loginUser({ store, api, payload: { username: 'admin', password: 'heslo' } });
  
    const state = store.getState();
    console.assert(state.auth.role === 'ADMIN', "loginUser: role je nastavena na ADMIN");
    console.assert(state.auth.token === 'mock-token-123', "loginUser: token byl úspěšně uložen");
    console.assert(state.ui.mode === 'CATALOG', "loginUser: po přihlášení se aplikace přepne do katalogu");
    console.assert(state.ui.notification?.type === 'SUCCESS', "loginUser: notifikace je SUCCESS");
    console.assert(state.ui.status === 'READY', "loginUser: status UI je zpět na READY");
  }
  
  console.log("\n[loginUser] REJECTED - Špatné jméno nebo heslo");
  {
    const store = createStore({
      auth: { role: 'ANONYMOUS', userId: null, token: null },
      ui: { status: 'READY', mode: 'AUTHENTICATION', notification: null }
    });
  
    const api = {
      auth: {
        login: async () => ({
          status: 'REJECTED', reason: 'Špatné jméno nebo heslo.'
        })
      }
    };
  
    await loginUser({ store, api, payload: { username: 'spatny_user', password: '123' } });
  
    const state = store.getState();
    console.assert(state.auth.role === 'ANONYMOUS', "loginUser: role zůstala ANONYMOUS (nepřihlášen)");
    console.assert(state.auth.token === null, "loginUser: token nebyl přidělen");
    console.assert(state.ui.mode === 'AUTHENTICATION', "loginUser: mode zůstal AUTHENTICATION");
    console.assert(state.ui.notification?.type === 'WARNING', "loginUser: zobrazila se WARNING notifikace o špatném heslu");
  }
  
  console.log("\n[loginUser] ERROR - Výjimka nebo síťová chyba");
  {
    const store = createStore({
      auth: { role: 'ANONYMOUS', userId: null, token: null },
      ui: { status: 'READY', mode: 'AUTHENTICATION', notification: null }
    });
  
    const api = {
      auth: {
        login: async () => { throw new Error("Síť nedostupná"); } // Simulace pádu serveru
      }
    };
  
    await loginUser({ store, api, payload: { username: 'admin', password: '123' } });
  
    const state = store.getState();
    console.assert(state.ui.status === 'ERROR', "loginUser: aplikace přešla do stavu ERROR");
    console.assert(state.ui.message === 'Síť nedostupná', "loginUser: správně zachycena chybová zpráva výjimky");
  }
  
  // logoutUser
  console.log("\n[logoutUser] SUCCESS - Úspěšné odhlášení");
  {
    const store = createStore({
      auth: { role: 'USER', userId: '1', token: 'mock-token-123' },
      ui: { status: 'READY', mode: 'CATALOG', notification: null }
    });
  
    await logoutUser({ store, api: {} });
  
    const state = store.getState();
    console.assert(state.auth.role === 'ANONYMOUS', "logoutUser: role se vrátila na ANONYMOUS");
    console.assert(state.auth.token === null, "logoutUser: token byl bezpečně smazán");
    console.assert(state.ui.mode === 'AUTHENTICATION', "logoutUser: aplikace po odhlášení přesměrovala na přihlášení");
    console.assert(state.ui.notification?.type === 'SUCCESS', "logoutUser: zobrazila se SUCCESS notifikace o odhlášení");
  }
  
  console.log("\n── Všechny testy autentizace hotovy ──\n");
}


// ==========================================
// 3. Dispatcher (IR02)
// ==========================================

export async function testScenario_dispatcher() {
  console.log("\n── Testy Dispatcheru (IR02) ──");
  
  // 1. Navigační akce
  console.log("\n[Navigace] Přepínání módů aplikace");
  {
    const store = createStore({
      ui: { mode: 'UNKNOWN' }
    });
    
    const dispatch = createDispatcher(store, {});
  
    dispatch({ type: 'ENTER_CATALOG' });
    console.assert(store.getState().ui.mode === 'CATALOG', "ENTER_CATALOG: přepne ui.mode na CATALOG");
  
    dispatch({ type: 'ENTER_CART' });
    console.assert(store.getState().ui.mode === 'CART_DETAIL', "ENTER_CART: přepne ui.mode na CART_DETAIL");
  
    dispatch({ type: 'ENTER_ORDER_SUCCESS' });
    console.assert(store.getState().ui.mode === 'ORDER_SUCCESS', "ENTER_ORDER_SUCCESS: přepne ui.mode na ORDER_SUCCESS");
  
    dispatch({ type: 'ENTER_AUTHENTICATION' });
    console.assert(store.getState().ui.mode === 'AUTHENTICATION', "ENTER_AUTHENTICATION: přepne ui.mode na AUTHENTICATION");
  }
  
  
  // Propojení s autentizačními akcemi
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
    console.assert(state.auth.role === 'ADMIN', "LOGIN: dispatcher správně delegoval požadavek a přihlásil uživatele");
    console.assert(state.auth.token === 'token-123', "LOGIN: dispatcher zapsal token do stavu");
  }
  
  
  // Propojení s doménovými akcemi
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
    console.assert(state.currentOrder.items.length === 1, "ADD_ITEM_TO_CART: dispatcher předal payload akci a produkt se přidal");
    console.assert(state.currentOrder.totalPrice === 100, "ADD_ITEM_TO_CART: cena byla správně přepočítána na 100 Kč");
  }
  
  console.log("\n[Neznámá akce] Handling neznámého action.type");
  {
    const store = createStore({ ui: { mode: 'CATALOG' } });
    const dispatch = createDispatcher(store, {});
  
    dispatch({ type: 'NEEXISTUJE' });
    
    const state = store.getState();
    console.assert(state.ui.mode === 'CATALOG', "Neznámá akce: stav aplikace se nijak nezměnil");
  }
  
  console.log("\n── Hotovo ──\n");
}


// ==========================================
// 4. Router (IR04)
// ==========================================

export function testScenario_router() {
  console.log("\n── Testy Routeru (IR04) ──");
  
  // 1. parseUrl
  console.log("\n[parseUrl] Převod cest na kontexty");
  {
    console.assert(parseUrl("/products").context === "CATALOG", "parseUrl /products: context je CATALOG");
    console.assert(parseUrl("products").context === "CATALOG", "parseUrl products (bez lomítka): context je CATALOG");
    console.assert(parseUrl("/cart").context === "CART_DETAIL", "parseUrl /cart: context je CART_DETAIL");
    console.assert(parseUrl("/orders/success").context === "ORDER_SUCCESS", "parseUrl /orders/success: context je ORDER_SUCCESS");
    console.assert(parseUrl("/auth").context === "AUTHENTICATION", "parseUrl /auth: context je AUTHENTICATION");
    console.assert(parseUrl("/neexistuje").context === "UNKNOWN", "parseUrl /neexistuje: neznámá cesta vrací UNKNOWN");
    console.assert(parseUrl("").context === "UNKNOWN", "parseUrl (prázdná cesta): vrací UNKNOWN");
  }
  
  // 2. urlToAction (převod celého URL s hashem na akci pro dispatcher)
  console.log("\n[urlToAction] Převod celého URL prohlížeče na Akci");
  {
    console.assert(
      urlToAction("http://localhost:8080/#/products").type === "ENTER_CATALOG", 
      "urlToAction #/products: vygeneruje akci ENTER_CATALOG"
    );
    console.assert(
      urlToAction("http://localhost:8080/#/cart").type === "ENTER_CART", 
      "urlToAction #/cart: vygeneruje akci ENTER_CART"
    );
    console.assert(
      urlToAction("https://muj-eshop.cz/#/orders/success").type === "ENTER_ORDER_SUCCESS", 
      "urlToAction #/orders/success: vygeneruje akci ENTER_ORDER_SUCCESS"
    );
    console.assert(
      urlToAction("http://localhost:8080/#/auth").type === "ENTER_AUTHENTICATION", 
      "urlToAction #/auth: vygeneruje akci ENTER_AUTHENTICATION"
    );
    
    console.assert(
      urlToAction("http://localhost:8080/#/nesmysl").type === "ENTER_CATALOG", 
      "urlToAction #/nesmysl: neznámá adresa fallbackuje na akci ENTER_CATALOG"
    );
  }
  
  // 3. routeToUrl (převod route objektu zpět na hash URL)
  console.log("\n[routeToUrl] Převod kontextu zpět na URL hash");
  {
    console.assert(routeToUrl({ context: "CATALOG" }) === "#/products", "routeToUrl CATALOG: vrací #/products");
    console.assert(routeToUrl({ context: "CART_DETAIL" }) === "#/cart", "routeToUrl CART_DETAIL: vrací #/cart");
    console.assert(routeToUrl({ context: "ORDER_SUCCESS" }) === "#/orders/success", "routeToUrl ORDER_SUCCESS: vrací #/orders/success");
    console.assert(routeToUrl({ context: "AUTHENTICATION" }) === "#/auth", "routeToUrl AUTHENTICATION: vrací #/auth");
    console.assert(routeToUrl({ context: "UNKNOWN" }) === "#/", "routeToUrl UNKNOWN: fallback na #/");
  }
  
  // 4. stateToUrl (extrakce UI módu ze stavu do URL pro synchronizaci adresního řádku)
  console.log("\n[stateToUrl] Synchronizace State -> URL");
  {
    const catalogState = { ui: { mode: "CATALOG" } };
    console.assert(stateToUrl(catalogState) === "#/products", "stateToUrl: mód CATALOG vrátí #/products");
  
    const cartState = { ui: { mode: "CART_DETAIL" } };
    console.assert(stateToUrl(cartState) === "#/cart", "stateToUrl: mód CART_DETAIL vrátí #/cart");
  
    const errorState = { ui: { mode: "NEEXISTUJE" } };
    console.assert(stateToUrl(errorState) === "#/", "stateToUrl: neznámý mód aplikace vrátí root url #/");
  }
  
  console.log("\n── Všechny testy Routeru hotovy ──\n");
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
  .then(() => testScenario_updateItemQuantity()) 
  .then(() => testScenario_setDeliveryDetails())
  .then(() => testScenario_placeOrder())
  .then(() => testScenario_cancelOrder())
  .then(() => testScenario_shipOrder())
  .then(() => console.log("\n✅ Všechny scénáře proběhly úspěšně!\n"));
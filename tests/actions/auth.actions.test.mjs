import { assert } from "../assert.js";
import { createStore } from "../../src/infra/store/createStore.js";
import { loginUser } from "../../src/app/actions/loginUser.js";
import { logoutUser } from "../../src/app/actions/logoutUser.js";

console.log("\n── Testy autentizačních akcí: AUTH ──");

// ==========================================
// 1. loginUser
// ==========================================
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
  assert(state.auth.role === 'ADMIN', "loginUser: role je nastavena na ADMIN");
  assert(state.auth.token === 'mock-token-123', "loginUser: token byl úspěšně uložen");
  assert(state.ui.mode === 'CATALOG', "loginUser: po přihlášení se aplikace přepne do katalogu");
  assert(state.ui.notification?.type === 'SUCCESS', "loginUser: notifikace je SUCCESS");
  assert(state.ui.status === 'READY', "loginUser: status UI je zpět na READY");
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
  assert(state.auth.role === 'ANONYMOUS', "loginUser: role zůstala ANONYMOUS (nepřihlášen)");
  assert(state.auth.token === null, "loginUser: token nebyl přidělen");
  assert(state.ui.mode === 'AUTHENTICATION', "loginUser: mode zůstal AUTHENTICATION");
  assert(state.ui.notification?.type === 'WARNING', "loginUser: zobrazila se WARNING notifikace o špatném heslu");
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
  assert(state.ui.status === 'ERROR', "loginUser: aplikace přešla do stavu ERROR");
  assert(state.ui.message === 'Síť nedostupná', "loginUser: správně zachycena chybová zpráva výjimky");
}

// ==========================================
// 2. logoutUser
// ==========================================
console.log("\n[logoutUser] SUCCESS - Úspěšné odhlášení");
{
  const store = createStore({
    auth: { role: 'USER', userId: '1', token: 'mock-token-123' },
    ui: { status: 'READY', mode: 'CATALOG', notification: null }
  });

  await logoutUser({ store, api: {} });

  const state = store.getState();
  assert(state.auth.role === 'ANONYMOUS', "logoutUser: role se vrátila na ANONYMOUS");
  assert(state.auth.token === null, "logoutUser: token byl bezpečně smazán");
  assert(state.ui.mode === 'AUTHENTICATION', "logoutUser: aplikace po odhlášení přesměrovala na přihlášení");
  assert(state.ui.notification?.type === 'SUCCESS', "logoutUser: zobrazila se SUCCESS notifikace o odhlášení");
}

console.log("\n── Všechny testy autentizace hotovy ──\n");
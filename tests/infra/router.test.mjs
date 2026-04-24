import { assert } from "../assert.js";
import {
  parseUrl,
  urlToAction,
  routeToUrl,
  stateToUrl
} from "../../src/infra/router/router.js";

console.log("\n── Testy Routeru (IR04) ──");

// ==========================================
// 1. parseUrl (převod cesty na route objekt)
// ==========================================
console.log("\n[parseUrl] Převod cest na kontexty");
{
  assert(parseUrl("/products").context === "CATALOG", "parseUrl /products: context je CATALOG");
  assert(parseUrl("products").context === "CATALOG", "parseUrl products (bez lomítka): context je CATALOG");
  assert(parseUrl("/cart").context === "CART_DETAIL", "parseUrl /cart: context je CART_DETAIL");
  assert(parseUrl("/orders/success").context === "ORDER_SUCCESS", "parseUrl /orders/success: context je ORDER_SUCCESS");
  assert(parseUrl("/auth").context === "AUTHENTICATION", "parseUrl /auth: context je AUTHENTICATION");
  assert(parseUrl("/neexistuje").context === "UNKNOWN", "parseUrl /neexistuje: neznámá cesta vrací UNKNOWN");
  assert(parseUrl("").context === "UNKNOWN", "parseUrl (prázdná cesta): vrací UNKNOWN");
}

// ==========================================
// 2. urlToAction (převod celého URL s hashem na akci pro dispatcher)
// ==========================================
console.log("\n[urlToAction] Převod celého URL prohlížeče na Akci");
{
  assert(
    urlToAction("http://localhost:8080/#/products").type === "ENTER_CATALOG", 
    "urlToAction #/products: vygeneruje akci ENTER_CATALOG"
  );
  assert(
    urlToAction("http://localhost:8080/#/cart").type === "ENTER_CART", 
    "urlToAction #/cart: vygeneruje akci ENTER_CART"
  );
  assert(
    urlToAction("https://muj-eshop.cz/#/orders/success").type === "ENTER_ORDER_SUCCESS", 
    "urlToAction #/orders/success: vygeneruje akci ENTER_ORDER_SUCCESS"
  );
  assert(
    urlToAction("http://localhost:8080/#/auth").type === "ENTER_AUTHENTICATION", 
    "urlToAction #/auth: vygeneruje akci ENTER_AUTHENTICATION"
  );
  
  assert(
    urlToAction("http://localhost:8080/#/nesmysl").type === "ENTER_CATALOG", 
    "urlToAction #/nesmysl: neznámá adresa fallbackuje na akci ENTER_CATALOG"
  );
}

// ==========================================
// 3. routeToUrl (převod route objektu zpět na hash URL)
// ==========================================
console.log("\n[routeToUrl] Převod kontextu zpět na URL hash");
{
  assert(routeToUrl({ context: "CATALOG" }) === "#/products", "routeToUrl CATALOG: vrací #/products");
  assert(routeToUrl({ context: "CART_DETAIL" }) === "#/cart", "routeToUrl CART_DETAIL: vrací #/cart");
  assert(routeToUrl({ context: "ORDER_SUCCESS" }) === "#/orders/success", "routeToUrl ORDER_SUCCESS: vrací #/orders/success");
  assert(routeToUrl({ context: "AUTHENTICATION" }) === "#/auth", "routeToUrl AUTHENTICATION: vrací #/auth");
  assert(routeToUrl({ context: "UNKNOWN" }) === "#/", "routeToUrl UNKNOWN: fallback na #/");
}

// ==========================================
// 4. stateToUrl (extrakce UI módu ze stavu do URL pro synchronizaci adresního řádku)
// ==========================================
console.log("\n[stateToUrl] Synchronizace State -> URL");
{
  const catalogState = { ui: { mode: "CATALOG" } };
  assert(stateToUrl(catalogState) === "#/products", "stateToUrl: mód CATALOG vrátí #/products");

  const cartState = { ui: { mode: "CART_DETAIL" } };
  assert(stateToUrl(cartState) === "#/cart", "stateToUrl: mód CART_DETAIL vrátí #/cart");

  const errorState = { ui: { mode: "NEEXISTUJE" } };
  assert(stateToUrl(errorState) === "#/", "stateToUrl: neznámý mód aplikace vrátí root url #/");
}

console.log("\n── Všechny testy Routeru hotovy ──\n");
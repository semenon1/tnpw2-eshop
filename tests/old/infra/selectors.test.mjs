
//v terminálu: node tests/infra/selectors.test.mjs

import { assert } from "../old/assert.js";
import {
  selectProductCatalogView,
  selectViewState,
} from "../../src/infra/store/selectors.js";


// selectProductCatalogView


console.log("\n── selectProductCatalogView ──");

// zobrazení katalogu
{
  const state = {
    products: [
      { id: "p1", name: "Jablko", status: "ACTIVE", stockCount: 10 },
      { id: "p2", name: "Hruška", status: "OUT_OF_STOCK", stockCount: 0 },
      { id: "p3", name: "Zázvor (Vyřazeno)", status: "ARCHIVED", stockCount: 5 },
    ],
  };

  const viewState = selectProductCatalogView(state);

  assert(
    viewState.type === "PRODUCT_CATALOG",
    "selectProductCatalogView: type je PRODUCT_CATALOG"
  );
  assert(
    viewState.products.length === 2,
    "selectProductCatalogView: vyfiltruje ARCHIVED produkty (vrátí jen 2)"
  );
  assert(
    viewState.products[0].capabilities.canBePurchased === true,
    "selectProductCatalogView: ACTIVE produkt se skladem > 0 lze koupit"
  );
  assert(
    viewState.products[1].capabilities.canBePurchased === false,
    "selectProductCatalogView: OUT_OF_STOCK produkt s 0 skladem nelze koupit"
  );
  assert(
    viewState.capabilities.canEnterCart === true,
    "selectProductCatalogView: canEnterCart je vždy true"
  );
}

// prázdný sklad
{
  const state = {
    // product chybí
  };

  const viewState = selectProductCatalogView(state);
  assert(
    viewState.products.length === 0,
    "selectProductCatalogView: pokud chybí products ve state, vrátí prázdné pole a nespadne"
  );
}


// selectViewState


console.log("\n── selectViewState ──");

// stav loading
{
  const state = {
    ui: { status: "LOADING", mode: "CATALOG" },
  };
  const viewState = selectViewState(state);
  assert(viewState.type === "LOADING", "selectViewState: při status LOADING vrátí typ LOADING");
}

// stav error
{
  const state = {
    ui: { status: "ERROR", errorMessage: "Spadlo to", mode: "CATALOG" },
  };
  const viewState = selectViewState(state);
  assert(viewState.type === "ERROR", "selectViewState: při status ERROR vrátí typ ERROR");
  assert(viewState.message === "Spadlo to", "selectViewState: předá chybovou hlášku");
}

// stav ready
{
  const state = {
    products: [{ id: "p1", status: "ACTIVE", stockCount: 1 }],
    ui: { status: "READY", mode: "CATALOG" },
  };
  const viewState = selectViewState(state);
  assert(
    viewState.type === "PRODUCT_CATALOG",
    "selectViewState: při READY a CATALOG vrátí PRODUCT_CATALOG"
  );
}

console.log("\n── Hotovo ──\n");
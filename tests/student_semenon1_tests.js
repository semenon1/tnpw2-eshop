// student_semenon1_tests.js

//v terminálu: node tests/student_semenon1_tests.js

import { selectProductCatalogView, selectViewState } from "../src/infra/store/selectors.js";
import { createProductsApi } from "../src/api/productsApi.js";

function clone(obj) {
  return JSON.parse(JSON.stringify(obj));
}

// selektory

export function testScenario_selectProductCatalogView() {
  let state = {
    products: [
      { id: "p1", name: "Jablko", status: "ACTIVE", stockCount: 10 },
      { id: "p2", name: "Vyprodané", status: "OUT_OF_STOCK", stockCount: 0 },
      { id: "p3", name: "Zázvor", status: "ARCHIVED", stockCount: 5 },
    ]
  };

  const viewState = selectProductCatalogView(clone(state));

  console.assert(
    viewState.products.length === 2,
    "Should filter out ARCHIVED products"
  );
  console.assert(
    viewState.products[0].capabilities.canBePurchased === true,
    "ACTIVE product in stock should be purchasable"
  );
  console.assert(
    viewState.products[1].capabilities.canBePurchased === false,
    "OUT_OF_STOCK product should NOT be purchasable"
  );
  
  console.log("testScenario_selectProductCatalogView passed");
}

export function testScenario_selectViewState_status() {
  let stateLoading = { ui: { status: "LOADING" } };
  let stateError = { ui: { status: "ERROR", errorMessage: "Chyba sítě" } };

  const viewLoading = selectViewState(clone(stateLoading));
  const viewError = selectViewState(clone(stateError));

  console.assert(
    viewLoading.type === "LOADING", 
    "Should return LOADING type"
  );
  console.assert(
    viewError.type === "ERROR" && viewError.message === "Chyba sítě", 
    "Should return ERROR type with message"
  );

  console.log("testScenario_selectViewState_status passed");
}

// api, doménová logika

export async function testScenario_getProducts() {
  const db = { 
    products: [{ id: "p1", name: "Datle", status: "ACTIVE", stockCount: 10 }] 
  };
  const api = createProductsApi(db);

  const result = await api.getProducts();

  console.assert(
    result.status === "SUCCESS", 
    "Should return SUCCESS"
  );
  console.assert(
    result.products.length === 1, 
    "Should return products from DB"
  );

  console.log("testScenario_getProducts passed");
}

export async function testScenario_decreaseStock_successAndTransition() {
  const db = {
    products: [{ id: "p1", status: "ACTIVE", stockCount: 2 }]
  };
  const api = createProductsApi(db);

  // kupujeme kolik je na sklaě
  const result = await api.decreaseStock("p1", 2);

  console.assert(
    result.status === "SUCCESS",
    "Purchase should be successful"
  );
  console.assert(
    result.product.stockCount === 0,
    "Stock should decrease to 0"
  );
  console.assert(
    result.product.status === "OUT_OF_STOCK",
    "Status should automatically transition to OUT_OF_STOCK"
  );

  console.log("testScenario_decreaseStock_successAndTransition passed");
}

export async function testScenario_decreaseStock_rejected() {
  const db = {
    products: [{ id: "p1", status: "ACTIVE", stockCount: 1 }]
  };
  const api = createProductsApi(db);

  // kupujeme víc než je na skladě
  const result = await api.decreaseStock("p1", 5);

  console.assert(
    result.status === "REJECTED",
    "Purchase should be rejected due to low stock"
  );

  console.log("testScenario_decreaseStock_rejected passed");
}

// spuštění
testScenario_selectProductCatalogView();
testScenario_selectViewState_status();

testScenario_getProducts()
  .then(() => testScenario_decreaseStock_successAndTransition())
  .then(() => testScenario_decreaseStock_rejected());

// v terminálu: node tests/api/productsApi.test.mjs

import { assert } from "../assert.js";
import { createProductsApi } from "../../src/api/productsApi.js";


// getProducts


console.log("\n── getProducts ──");

// načtení produktů
{
  const db = {
    products: [{ id: "p1", name: "Datle", status: "ACTIVE", stockCount: 10 }]
  };
  const result = await createProductsApi(db).getProducts();
  
  assert(result.status === "SUCCESS", "getProducts: Vrátí stav SUCCESS");
  assert(result.products.length === 1, "getProducts: Vrátí zkopírované pole produktů");
}


// decreaseStock (Doménová logika nakupování)


console.log("\n── decreaseStock ──");

// úspěšný nákup (zboží na skladě)
{
  const db = {
    products: [{ id: "p1", status: "ACTIVE", stockCount: 10 }]
  };
  const result = await createProductsApi(db).decreaseStock("p1", 2);
  
  assert(result.status === "SUCCESS", "decreaseStock: Úspěšný nákup povolen");
  assert(result.product.stockCount === 8, "decreaseStock: Správně se odečetly 2 kusy ze skladu");
  assert(result.product.status === "ACTIVE", "decreaseStock: Stav zůstává ACTIVE, protože ještě něco zbylo");
}

// úspěšný nákup posledního kusu
{
  const db = {
    products: [{ id: "p2", status: "ACTIVE", stockCount: 3 }]
  };
  const result = await createProductsApi(db).decreaseStock("p2", 3);
  
  assert(result.status === "SUCCESS", "decreaseStock: Nákup posledních kusů úspěšný");
  assert(result.product.stockCount === 0, "decreaseStock: Sklad klesl na nulu");
  assert(result.product.status === "OUT_OF_STOCK", "decreaseStock: AUTOMAT: Stav se sám přepnul na OUT_OF_STOCK");
}

// produkt neexistuje
{
  const db = { products: [] };
  const result = await createProductsApi(db).decreaseStock("neexistuje", 1);
  
  assert(result.status === "REJECTED", "decreaseStock: Neexistující produkt -> REJECTED");
}

// archived product
{
  const db = {
    products: [{ id: "p3", status: "ARCHIVED", stockCount: 10 }]
  };
  const result = await createProductsApi(db).decreaseStock("p3", 1);
  
  assert(result.status === "REJECTED", "decreaseStock: Pokus o nákup ARCHIVED produktu -> REJECTED");
}

// nedostatek na skladě
{
  const db = {
    products: [{ id: "p4", status: "ACTIVE", stockCount: 1 }]
  };
  const result = await createProductsApi(db).decreaseStock("p4", 5);
  
  assert(result.status === "REJECTED", "decreaseStock: Pokus o nákup více kusů, než je na skladě -> REJECTED");
}

console.log("\n── Hotovo ──\n");
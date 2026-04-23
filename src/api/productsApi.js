//imporuje funkci z utils.js
import { delay } from "./utils.js";

//public funkce k dispozici pro ostatní soubory
export function createProductsApi(db) {
  return {
    
    async getProducts() {
      await delay();

      return {
        status: "SUCCESS",
        products: structuredClone(db.products)
      };
    }

  };
}
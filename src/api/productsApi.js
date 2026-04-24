// imporuje funkci z utils.js
import { delay } from "./utils.js";

// public funkce k dispozici pro ostatní soubory
export function createProductsApi(db) {
  return {
    
    async getProducts() {
      await delay();

      return {
        status: "SUCCESS",
        products: structuredClone(db.products)
      };
    },


    async decreaseStock(productId, amount = 1) {
      await delay();

      const product = db.products.find((p) => p.id === productId);

      if (!product) {
        return { 
          status: "REJECTED", 
          reason: "Produkt neexistuje." 
        };
      }

      if (product.status === "ARCHIVED") {
        return { 
          status: "REJECTED", 
          reason: "Vyřazené produkty nelze kupovat." 
        };
      }

      if (product.stockCount < amount) {
        return { 
          status: "REJECTED", 
          reason: "Nedostatek zboží na skladě." 
        };
      }

      product.stockCount -= amount;

      if (product.stockCount === 0) {
        product.status = "OUT_OF_STOCK";
      }

      return { 
        status: "SUCCESS", 
        product: structuredClone(product) 
      };
    }

  };
}
import { createMockDatabase } from "./data.js";
import { createProductsApi } from "./productsApi.js";


export function createApi() {
  const db = createMockDatabase();
  return {
    products: createProductsApi(db),
    
  };
}
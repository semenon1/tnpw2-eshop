//import funkcí z jiných souborů
import { createMockDatabase } from "./data.js";
import { createProductsApi } from "./productsApi.js";

//funkce pro vytvoření api pro ostatní soubory
export function createApi() {
  
  const db = createMockDatabase();
  return {
    products: createProductsApi(db),
    
  };
}
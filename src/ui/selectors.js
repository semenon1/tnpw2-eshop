
//základní selektor
export function selectAllProducts(state) {
  return state.products ?? [];
}

//capabilities
export function canAddToCart(product) {
  return product.status === "ACTIVE" && product.stockCount > 0;
}

// pohledy

// pohled: katalog produktů
export function selectProductCatalogView(state) {
  const allProducts = selectAllProducts(state);
  
  const visibleProducts = allProducts.filter(p => p.status !== "ARCHIVED");

  const productsWithCapabilities = visibleProducts.map(p => ({
    ...p, 
    capabilities: {
      canBeAddedToCart: canAddToCart(p)
    }
  }));

  return {
    type: "PRODUCT_CATALOG",
    products: productsWithCapabilities,
    capabilities: {
      canEnterCart: true 
    }
  };
}


//dipatcher pohledů
/*
 * Vrací objekt ve tvaru:
 * {
 * type: 'LOADING' | 'ERROR' | 'PRODUCT_CATALOG',
 * message?: string,
 * products?: Product[],
 * capabilities?: {}
 * }
 */
export function selectViewState(state) {
  if (!state || !state.ui) {
    return { type: "ERROR", message: "Stav UI chybí" };
  }

  const { status, errorMessage, mode } = state.ui;

  if (status === "LOADING") return { type: "LOADING" };
  if (status === "ERROR") return { type: "ERROR", message: errorMessage };
  if (status !== "READY") return { type: "ERROR", message: `Neznámý stav UI: ${status}` };

  switch (mode) {
    case "CATALOG":
      return selectProductCatalogView(state);
      
    default:
      return { type: "ERROR", message: `Neznámý mód aplikace: ${mode}` };
  }
}
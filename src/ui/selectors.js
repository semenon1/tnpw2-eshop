
export function selectAllProducts(state) {
  return state.products || [];
}


export function canAddToCart(state, product) {
  return product.status === "ACTIVE" && product.stockCount > 0;
}

export function selectProductCatalogView(state) {
  const products = selectAllProducts(state);
  
  const visibleProducts = products.filter(p => p.status !== "ARCHIVED");

  return {
    type: "PRODUCT_CATALOG",
    products: visibleProducts,
    capabilities: {
      canViewCart: true 
    }
  };
}

export function selectViewState(state) {
  const { status, errorMessage, mode } = state.ui;

  if (status === "LOADING") return { type: "LOADING" };
  if (status === "ERROR") return { type: "ERROR", message: errorMessage };
  if (status !== "READY") return { type: "ERROR", message: `Neznámý stav: ${status}` };

  switch (mode) {
    case "CATALOG":
      return selectProductCatalogView(state);
    default:
      return { type: "ERROR", message: `Neznámý mód: ${mode}` };
  }
}

import { productCatalogHandlers } from "./productCatalogHandlers.js";
import { errorHandlers } from "./errorHandlers.js";

export function createHandlers(dispatch, viewState) {
  switch (viewState.type) {
    case "PRODUCT_CATALOG":
      return productCatalogHandlers(dispatch, viewState);

    case "ERROR":
      return errorHandlers(dispatch);

    default:
      return {};
  }
}
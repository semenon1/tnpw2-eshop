
import { selectViewState } from "../infra/store/selectors.js";
import { createHandlers } from "../app/actionHandlers/createHandlers.js";
import { ProductCatalogView } from "./views/ProductCatalogView.js";
import { LoadingView } from "./views/LoadingView.js";
import { ErrorView } from "./views/ErrorView.js";

export function render(root, state, dispatch) {
  root.replaceChildren();

  const viewState = selectViewState(state);
  
  //továrna ovladačů/handlerů
  const handlers = createHandlers(dispatch, viewState);

  let view;

  switch (viewState.type) {
    case "LOADING":
      view = LoadingView();
      break;

    case "ERROR":
      view = ErrorView({ message: viewState.message, handlers });
      break;

    case "PRODUCT_CATALOG":
      view = ProductCatalogView({ viewState, handlers });
      break;

    default:
      view = document.createTextNode(`Neznámý typ pohledu: ${viewState.type}`);
  }

  root.appendChild(view);
}
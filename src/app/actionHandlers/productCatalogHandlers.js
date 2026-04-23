
export function productCatalogHandlers(dispatch, viewState) {
  const handlers = {};

  handlers.onAddToCart = (productId) => {
    dispatch({
      type: 'ADD_ITEM_TO_CART', 
      payload: { productId } 
    });
  };

  if (viewState.capabilities.canEnterCart) {
    handlers.onEnterCart = () => {
      dispatch({ type: 'ENTER_CART' });
    };
  }

  return handlers;
}
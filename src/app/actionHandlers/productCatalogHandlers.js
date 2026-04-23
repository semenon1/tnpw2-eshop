
export function productCatalogHandlers(dispatch, viewState) {
  const { capabilities } = viewState;
  const { canEnterCart } = capabilities;
  
  const handlers = {};

  handlers.onAddToCart = (productId) =>
    dispatch({
      type: 'ADD_ITEM_TO_CART',
      payload: { productId },
    });

  if (canEnterCart) {
    handlers.onEnterCart = () => dispatch({ type: 'ENTER_CART' });
  }

  return handlers;
}
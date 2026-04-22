export async function addItemToOrder({ store, payload }) {
  const { product, quantity } = payload;
  
  if (quantity <= 0) {
    console.warn("Počet kusů musí být větší než nula.");
    return;
  }

  store.setState((state) => {

    if (state.currentOrder.status !== 'CART') {
       console.warn("Nelze přidávat položky, objednávka už není ve stavu CART.");
       return state;
    }

    const newItem = {
      productId: product.id,
      quantity: quantity,
      price: product.price
    };

    const updatedItems = [...state.currentOrder.items, newItem];
    const updatedTotalPrice = state.currentOrder.totalPrice + (product.price * quantity); 

    return {
      ...state,
      currentOrder: {
        ...state.currentOrder,
        items: updatedItems,
        totalPrice: updatedTotalPrice
      }
    };
  });
}
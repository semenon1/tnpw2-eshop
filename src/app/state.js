export function createInitialState() {
  return {
    products: [],     
    orders: [],       

    order: {
      id: null,
      status: 'CART',
      items: [],      
      totalPrice: 0
    },

    auth: {
      role: 'ANONYMOUS',
      userId: null,
      token: null
    },

    ui: {
      mode: 'CATALOG',          
      status: 'LOADING',      
      errorMessage: null,
      notification: null,
    },
  };
}
export async function logoutUser({ store, api }) {
  let notification = null;

  try {
    store.setState(state => ({ ...state, ui: { ...state.ui, status: 'LOADING' } }));

    notification = { type: "SUCCESS", message: "Byli jste odhlášeni." };

    store.setState((state) => ({
      ...state,
      auth: {
        role: 'ANONYMOUS',
        userId: null,
        token: null
      },
      ui: {
        ...state.ui,
        status: 'READY',
        mode: 'AUTHENTICATION',
        notification
      }
    }));
  } catch (error) {
    store.setState((state) => ({
      ...state,
      ui: {
        ...state.ui,
        status: "ERROR",
        notification: null,
        message: error.message
      }
    }));
  }
}
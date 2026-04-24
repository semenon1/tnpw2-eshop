export async function loginUser({ store, api, payload }) {
  const { username, password } = payload;
  let notification = null;

  try {
    store.setState(state => ({ ...state, ui: { ...state.ui, status: 'LOADING' } }));

    const { status, reason, token, role, userId } = await api.auth.login(username, password);

    store.setState((state) => {
      if (status === "SUCCESS") {
        notification = { type: "SUCCESS", message: "Úspěšně přihlášeno." };
        return {
          ...state,
          auth: {
            role: role,
            userId: userId,
            token: token
          },
          ui: {
            ...state.ui,
            status: 'READY',
            mode: 'CATALOG',
            notification
          }
        };
      }

      if (status === "REJECTED") {
        notification = { type: "WARNING", message: "Špatné jméno nebo heslo." };
      }

      return {
        ...state,
        ui: { ...state.ui, status: 'READY', notification }
      };
    });
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
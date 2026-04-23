import { createStore } from "./infra/store/createStore.js";
import { createInitialState } from "./app/state.js";
import { createDispatcher } from "./app/dispatch.js";
import { createApi } from "./api/mockApi.js";
import { urlToAction, updateUrl } from "./infra/router/router.js";

const store = createStore(createInitialState());
const api = createApi();
const dispatch = createDispatcher(store, api);

store.subscribe((state) => {
  updateUrl(state);
});


window.addEventListener("hashchange", () => {
  const action = urlToAction(window.location.href);
  dispatch(action);
});

dispatch({ type: "APP_INIT" });
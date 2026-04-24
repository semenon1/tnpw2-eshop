import { createStore } from "./infra/store/createStore.js";
import { createInitialState } from "./app/state.js";
import { createDispatcher } from "./app/dispatch.js";
import { createApi } from "./api/mockApi.js";
import { urlToAction, updateUrl } from "./infra/router/router.js";
import { render } from "./ui/render.js";

const store = createStore(createInitialState());
const api = createApi();
const dispatch = createDispatcher(store, api);

const root = document.getElementById("app");

store.subscribe((state) => {
  updateUrl(state);
  render(root, state, dispatch);
});


window.addEventListener("hashchange", () => {
  const action = urlToAction(window.location.href);
  dispatch(action);
});

dispatch({ type: "APP_INIT" });
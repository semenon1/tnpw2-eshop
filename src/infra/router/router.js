export function urlToRoute(url) {
  const hashIndex = url.indexOf("#");
  const path = hashIndex >= 0 ? url.slice(hashIndex + 1) : "";
  return parseUrl(path);
}

export function parseUrl(path) {
  const parts = path.split("/").filter(Boolean);

  if (parts.length === 1 && parts[0] === "products") {
    return { context: "CATALOG" };
  }

  if (parts.length === 1 && parts[0] === "cart") {
    return { context: "CART_DETAIL" };
  }

  if (parts.length === 2 && parts[0] === "orders" && parts[1] === "success") {
    return { context: "ORDER_SUCCESS" };
  }

  if (parts.length === 1 && parts[0] === "auth") {
    return { context: "AUTHENTICATION" };
  }

  return { context: "UNKNOWN" };
}

export function routeToAction(route) {
  switch (route.context) {
    case "CATALOG":
      return { type: "ENTER_CATALOG" };

    case "CART_DETAIL":
      return { type: "ENTER_CART" };

    case "ORDER_SUCCESS":
      return { type: "ENTER_ORDER_SUCCESS" };

    case "AUTHENTICATION":
      return { type: "ENTER_AUTHENTICATION" };

    case "UNKNOWN":
      return { type: "ENTER_CATALOG" }; 
  }
}

export function urlToAction(url) {
  const route = urlToRoute(url);
  return routeToAction(route);
}


export function stateToRoute(state) {
  const { mode } = state.ui;

  switch (mode) {
    case "CATALOG":
      return { context: "CATALOG" };

    case "CART_DETAIL":
      return { context: "CART_DETAIL" };

    case "ORDER_SUCCESS":
      return { context: "ORDER_SUCCESS" };

    case "AUTHENTICATION":
      return { context: "AUTHENTICATION" };

    default:
      return { context: "UNKNOWN" };
  }
}

export function routeToUrl(route) {
  switch (route.context) {
    case "CATALOG":
      return "#/products";

    case "CART_DETAIL":
      return "#/cart";

    case "ORDER_SUCCESS":
      return "#/orders/success";

    case "AUTHENTICATION":
      return "#/auth";

    default:
      return "#/";
  }
}

export function stateToUrl(state) {
  const route = stateToRoute(state);
  return routeToUrl(route);
}

export function updateUrl(state) {
  const url = stateToUrl(state);
  if (url !== window.location.hash) {
    window.location.hash = url;
  }
}


export function errorHandlers(dispatch) {
  return {
    onContinue: () => dispatch({ type: 'ENTER_CATALOG' }), 
  };
}
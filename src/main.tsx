import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { createStore } from "redux";
import { rootReducer } from "./reducers/index.ts";
import { Provider } from "react-redux";
import './styles/quiz-animations.css';

export const store = createStore(rootReducer);
createRoot(document.getElementById("root")!).render(
  <Provider store={store}>
    <App />
  </Provider>,
);

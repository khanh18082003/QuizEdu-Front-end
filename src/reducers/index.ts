import { combineReducers } from "redux";
import user from "./userReducer";

export const rootReducer = combineReducers({
  user,
});

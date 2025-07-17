import type { UserAction } from "../actions/user";
import type { RegisterResponse } from "../services/userService";

const initial: RegisterResponse = {
  id: "",
  email: "",
  first_name: "",
  last_name: "",
  display_name: "",
  avatar: null,
  is_active: false,
  role: "",
  created_at: "",
  updated_at: "",
};

const userReducer = (state = initial, action: UserAction) => {
  switch (action.type) {
    case "MY_PROFILE":
      return { ...state, ...action.payload };
    case "CLEAR_PROFILE":
      return initial; // Return initial state instead of empty object
    default:
      return initial;
  }
};

export default userReducer;

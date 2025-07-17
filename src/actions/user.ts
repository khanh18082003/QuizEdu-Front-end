import type { RegisterResponse } from "../services/userService";

export type UserAction = {
  type: "MY_PROFILE" | "CLEAR_PROFILE";
  payload?: RegisterResponse | null;
};

export const myProfile = (userProfile: RegisterResponse): UserAction => {
  return {
    type: "MY_PROFILE",
    payload: userProfile,
  };
};

export const clearProfile = (): UserAction => {
  return {
    type: "CLEAR_PROFILE",
  };
};

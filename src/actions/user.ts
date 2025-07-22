import type { RegisterResponse } from "../services/userService";
import type {
  StudentProfileResponse,
  TeacherProfileResponse,
} from "../types/response";

export type UserAction = {
  type: "MY_PROFILE" | "CLEAR_PROFILE";
  payload?: RegisterResponse | StudentProfileResponse | TeacherProfileResponse;
};

export const myProfile = (
  userProfile:
    | RegisterResponse
    | StudentProfileResponse
    | TeacherProfileResponse,
): UserAction => {
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

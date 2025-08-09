import i18n from "../i18n";

/**
 * Utility to set page title
 * @param titleKey Translation key for page title
 * @param includeAppName Whether to include the app name in the title
 */
export const setPageTitle = (titleKey: string, includeAppName = true): void => {
  const appName = "Quiz Edu";
  const translatedTitle = i18n.t(titleKey);
  document.title = includeAppName
    ? `${translatedTitle} | ${appName}`
    : translatedTitle;
};

/**
 * Hook to set page title
 * @param titleKey Translation key for page title
 * @param includeAppName Whether to include the app name in the title
 */
export const usePageTitle = (titleKey: string, includeAppName = true): void => {
  setPageTitle(titleKey, includeAppName);
};

/**
 * Constants for common page title translation keys
 */
export const PAGE_TITLES = {
  HOME: "pageTitle.home",
  LOGIN: "pageTitle.login",
  REGISTER: "pageTitle.register",
  FORGOT_PASSWORD: "pageTitle.forgotPassword",
  RESET_PASSWORD: "pageTitle.resetPassword",
  PASSWORD_CREATION: "pageTitle.passwordCreation",
  VERIFICATION: "pageTitle.verification",
  STUDENT_HOME: "pageTitle.studentHome",
  STUDENT_PROFILE: "pageTitle.studentProfile",
  CLASSROOM_LIST: "pageTitle.classroomList",
  TEACHER_HOME: "pageTitle.teacherHome",
  TEACHER_PROFILE: "pageTitle.teacherProfile",
  TEACHER_CLASSES: "pageTitle.teacherClasses",
  ABOUT_US: "pageTitle.aboutUs",
  CONTACT: "pageTitle.contact",
  NOT_FOUND: "pageTitle.notFound",
  QUIZ_WAITING_ROOM: "pageTitle.quizWaitingRoom",
  QUIZ_TAKING: "pageTitle.quizTaking",
  QUIZ_PRACTICE: "pageTitle.quizPractice",
} as const;

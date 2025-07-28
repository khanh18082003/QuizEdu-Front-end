export default {
  // Page Titles
  pageTitle: {
    home: "Home",
    login: "Login",
    register: "Register",
    forgotPassword: "Forgot Password",
    resetPassword: "Reset Password",
    passwordCreation: "Create Password",
    verification: "Account Verification",
    studentHome: "Student Home",
    studentProfile: "Student Profile",
    classroomList: "My Classrooms",
    teacherHome: "Teacher Home",
    teacherProfile: "Teacher Profile",
    teacherClasses: "My Classes",
    aboutUs: "About Us",
    contact: "Contact",
    notFound: "Page Not Found",
    quizWaitingRoom: "Quiz Waiting Room",
    quizTaking: "Quiz Taking",
  },

  // Common UI Elements
  common: {
    save: "Save",
    cancel: "Cancel",
    edit: "Edit",
    loading: "Loading...",
    saving: "Saving...",
    goBack: "Go Back",
    backToClasses: "Back to classes",
  },

  // Navigation
  nav: {
    home: "Home",
    aboutUs: "About Us",
    contact: "Contact",
    login: "Login",
    register: "Register",
  },

  // Profile Pages
  profile: {
    personalInfo: "Personal Information",
    email: "Email",
    displayName: "Display Name",
    firstName: "First Name",
    lastName: "Last Name",
    enterFirstName: "Enter first name",
    enterLastName: "Enter last name",
    enterDisplayName: "Enter display name",
    schoolName: "School Name",
    enterSchoolName: "Enter school name",
    noInfo: "No information available",
  },

  // Classroom
  classroom: {
    myClasses: "My Classes",
    search: "Search classes...",
    noClasses: "You haven't joined any classes yet.",
    joinClass: "Join a Class",
    joinSuccess: "Successfully joined the class",
    enterClassCode: "Enter class code",
    class: "Class",
    subject: "Subject",
    teacher: "Teacher",
    lastUpdated: "Last Updated",
    viewClass: "View",
    searchResults: "Search Results",
    noResults: "No classes found matching your search.",
    unenroll: "Unenroll",
    unenrollSuccess: "Successfully left the class",
    leaveClass: "Leave Class",
    confirmLeave:
      'Are you sure you want to leave the class "{{className}}"? You will no longer have access to this class\'s materials and assignments.',
    classNotFound: "Classroom not found",
    classNotFoundDesc:
      "The classroom you're looking for doesn't exist or you don't have access to it.",
    tabs: {
      stream: "Stream",
      classwork: "Classwork",
      people: "People",
    },
    dueDate: "Due date",
    completed: "Completed",
    viewAssignment: "View",
    attachments: "Attachments",
    teachers: "Teachers",
    students: "Students",
    studentsCount: "students",
    allTopics: "All topics",
    assignedWork: "Assigned work",
  },

  // Student Profile Specific
  studentProfile: {
    level: "Level",
    levels: {
      primary: "Primary",
      secondary: "Middle School",
      highSchool: "High School",
      undergraduate: "Undergraduate",
      postgraduate: "Postgraduate",
    },
  },

  // Teacher Profile Specific
  teacherProfile: {
    subjects: "Teaching Subjects",
    addSubject: "Add Subject",
    enterSubject: "Enter subject name",
    experience: "Experience",
    enterExperience: "Describe your teaching experience",
    noSubjects: "No subjects yet",
  },

  // Teacher Class Management
  teacherClass: {
    myClasses: "My Classes",
    createClass: "Create Class",
    createFirstClass: "Create First Class",
    noClasses: "No classes yet",
    noClassesDesc: "Start by creating your first class",
    manageClasses: "Manage and monitor your classes",
    classCode: "Class Code",
    copyCode: "Copy class code",
    copiedCode: "Copied!",
    students: "students",
    createdOn: "Created on",
    viewClass: "View Class",
    editClass: "Edit",
    deleteClass: "Delete",
    search: "Search classes...",
  },

  // Error messages
  errors: {
    general: "An error occurred. Please try again later.",
    avatarSize:
      "Avatar image is too large. Please choose an image smaller than 5MB.",
    avatarFormat: "Only JPG, PNG and GIF formats are supported for avatar.",
    network:
      "Network connection error. Please check your connection and try again.",
    sessionExpired: "Your session has expired. Please login again.",
    forbidden: "You don't have permission to perform this action.",
  },

  // Testimonials
  testimonials: {
    studentOne:
      "I like QuizEdu because it's easy to use, I can see my score right after finishing and review detailed answers.",
    studentTwo:
      "Thanks to QuizEdu, I study in groups very effectively, we can compete and exchange answers easily.",
    teacherOne:
      "I highly appreciate the results statistics feature, which helps me quickly grasp the classroom situation.",
  },

  // Language switcher
  language: {
    english: "English",
    vietnamese: "Vietnamese",
  },

  // Quiz Waiting Room
  quizWaitingRoom: {
    pageTitle: "Quiz Waiting Room",
    reviewInfo:
      "Review the quiz information and rules before starting your quiz session.",
    sessionInfo: "Session Information",
    accessCode: "Access Code",
    teacher: "Teacher",
    totalQuestions: "Total Questions",
    status: "Status",
    estimatedStart: "Estimated Start",
    readyToStart: "Ready to Start",
    waitingRoom: "Waiting Room",
    quizRules: "Quiz Rules & Guidelines",
    rules: {
      timeLimit: "Each question has a specific time limit",
      completionTime: "Quiz completion time depends on your answer speed",
      noGoBack: "You cannot go back once you submit an answer",
      integrity: "Maintain academic integrity throughout the quiz",
      connection: "Keep your internet connection stable",
    },
    importantInstructions: "Important Instructions:",
    instructions: {
      readRules: "Read all rules carefully before starting",
      waitForTeacher:
        "Once you start, you must wait for teacher to begin the quiz",
      stableConnection: "Ensure stable internet connection throughout",
      noPause: "You cannot pause once the quiz begins",
    },
    leave: "Leave",
    leaveSession: "Leave Session",
    enterQuizRoom: "Enter Quiz Room",
    confirmLeave: "Are you sure you want to leave the waiting room?",
    loadFailed: "Failed to load quiz session details. Please try again.",
    loadingWaitingRoom: "Loading waiting room...",
    checkingSessionStatus: "Checking session status...",
  },

  // Quiz Taking
  quizTaking: {
    pageTitle: "Quiz Taking",
    back: "Back",
    pause: "Pause",
    resume: "Resume",
    submit: "Submit",
    submitQuiz: "Submit Quiz",
    question: "Question",
    of: "of",
    answered: "answered",
    points: "points",
    point: "point",
    previous: "Previous",
    next: "Next",
    questions: "Questions",
    quizSession: "Quiz Session",
    accessCode: "Access Code",
    status: "Status",
    keyboardShortcuts: "Keyboard shortcuts:",
    navigateQuestions: "← → Navigate questions",
    submitShortcut: "Shift+Enter Submit quiz",
    typeAnswer: "Type your answer here...",
    unsupportedType: "Unsupported question type:",
    unsavedChanges: "You have unsaved changes. Are you sure you want to leave?",
    loadingQuizData: "Loading quiz data...",

    // Waiting for teacher
    waitingForTeacher: "Waiting for Teacher",
    waitingMessage:
      "You have successfully entered the quiz room. Please wait for your teacher to start the quiz.",
    quizStatus: "Quiz Status",
    waitingInstructions: "While you wait:",
    waitingRules: {
      stayOnTab: "Keep this tab open and do not navigate away",
      stableConnection: "Ensure your internet connection is stable",
      autoStart: "The quiz will start automatically when the teacher begins",
      reviewRules: "Review quiz rules if needed",
    },
    leaveQuizRoom: "Leave Quiz Room",
    startQuizTest: "Start Quiz (Test)",

    // Submit confirmation
    submitConfirmation: "Submit Quiz?",
    submitMessage:
      "You have answered {{answered}} out of {{total}} questions. Are you sure you want to submit your quiz? This action cannot be undone.",
    submitting: "Submitting...",
    submittingMessage: "Submitting your quiz...",

    // Time display
    timeRemaining: "Time remaining:",
    timeUp: "Time's up!",

    // Question types
    multipleChoice: "Multiple Choice",
    trueFalse: "True/False",
    essay: "Essay",
    true: "True",
    false: "False",
  },
};

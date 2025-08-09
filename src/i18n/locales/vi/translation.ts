export default {
  // Page Titles
  pageTitle: {
    home: "Trang chủ",
    login: "Đăng nhập",
    register: "Đăng ký",
    forgotPassword: "Quên mật khẩu",
    resetPassword: "Đặt lại mật khẩu",
    passwordCreation: "Tạo mật khẩu",
    verification: "Xác thực tài khoản",
    studentHome: "Trang chủ học sinh",
    studentProfile: "Hồ sơ học sinh",
    classroomList: "Lớp học của tôi",
    teacherHome: "Trang chủ giáo viên",
    teacherProfile: "Hồ sơ giáo viên",
    teacherClasses: "Lớp học của tôi",
    aboutUs: "Về chúng tôi",
    contact: "Liên hệ",
    notFound: "Không tìm thấy trang",
    quizWaitingRoom: "Phòng chờ làm bài",
    quizTaking: "Làm bài thi",
    quizPractice: "Luyện tập Quiz",
  },

  // Common UI Elements
  common: {
    save: "Lưu",
    cancel: "Hủy",
    edit: "Chỉnh sửa",
    loading: "Đang tải...",
    saving: "Đang lưu...",
    goBack: "Quay lại",
    backToClasses: "Quay lại danh sách lớp học",
  },

  // Navigation
  nav: {
    home: "Trang chủ",
    aboutUs: "Về chúng tôi",
    contact: "Liên hệ",
    login: "Đăng nhập",
    register: "Đăng ký",
  },

  // Profile Pages
  profile: {
    personalInfo: "Thông tin cá nhân",
    email: "Email",
    displayName: "Tên hiển thị",
    firstName: "Tên",
    lastName: "Họ",
    enterFirstName: "Nhập tên",
    enterLastName: "Nhập họ",
    enterDisplayName: "Nhập tên hiển thị",
    schoolName: "Trường học",
    enterSchoolName: "Nhập tên trường",
    noInfo: "Chưa có thông tin",
  },

  // Classroom
  classroom: {
    myClasses: "Lớp học của tôi",
    search: "Tìm kiếm lớp học...",
    noClasses: "Bạn chưa tham gia lớp học nào.",
    joinClass: "Tham gia lớp học",
    joinSuccess: "Tham gia lớp học thành công",
    enterClassCode: "Nhập mã lớp học",
    class: "Lớp",
    subject: "Môn học",
    teacher: "Giáo viên",
    lastUpdated: "Cập nhật cuối",
    viewClass: "Xem",
    searchResults: "Kết quả tìm kiếm",
    noResults: "Không tìm thấy lớp học phù hợp.",
    unenroll: "Hủy đăng ký",
    unenrollSuccess: "Đã rời khỏi lớp học thành công",
    leaveClass: "Hủy đăng ký lớp học",
    confirmLeave:
      'Bạn có chắc chắn muốn hủy đăng ký lớp học "{{className}}"? Bạn sẽ không còn quyền truy cập vào tài liệu và bài tập của lớp này.',
    classNotFound: "Không tìm thấy lớp học",
    classNotFoundDesc:
      "Lớp học bạn đang tìm kiếm không tồn tại hoặc bạn không có quyền truy cập.",
    tabs: {
      stream: "Bảng tin",
      classwork: "Bài tập trên lớp",
      people: "Mọi người",
    },
    dueDate: "Đến hạn",
    completed: "Đã hoàn thành",
    viewAssignment: "Xem",
    attachments: "Tệp đính kèm",
    teachers: "Giáo viên",
    students: "Ban học",
    studentsCount: "sinh viên",
    allTopics: "Tất cả chủ đề",
    assignedWork: "Bài tập được giao",
  },

  // Student Profile Specific
  studentProfile: {
    level: "Cấp độ",
    levels: {
      primary: "Tiểu học",
      secondary: "THCS",
      highSchool: "THPT",
      undergraduate: "Đại học",
      postgraduate: "Thạc sĩ",
    },
  },

  // Teacher Profile Specific
  teacherProfile: {
    subjects: "Môn học giảng dạy",
    addSubject: "Thêm môn học",
    enterSubject: "Nhập tên môn học",
    experience: "Kinh nghiệm",
    enterExperience: "Mô tả kinh nghiệm giảng dạy của bạn",
    noSubjects: "Chưa có môn học nào",
  },

  // Teacher Class Management
  teacherClass: {
    myClasses: "Lớp học của tôi",
    createClass: "Tạo lớp học",
    createFirstClass: "Tạo lớp học đầu tiên",
    noClasses: "Chưa có lớp học nào",
    noClassesDesc: "Bắt đầu bằng cách tạo lớp học đầu tiên của bạn",
    manageClasses: "Quản lý và theo dõi các lớp học của bạn",
    classCode: "Mã lớp",
    copyCode: "Copy mã lớp",
    copiedCode: "Đã copy!",
    students: "học sinh",
    createdOn: "Tạo ngày",
    viewClass: "Xem lớp",
    editClass: "Chỉnh sửa",
    deleteClass: "Xóa lớp",
    search: "Tìm kiếm lớp học...",
  },

  // Error messages
  errors: {
    general: "Đã xảy ra lỗi khi cập nhật thông tin. Vui lòng thử lại sau.",
    avatarSize: "Kích thước avatar quá lớn. Vui lòng chọn ảnh nhỏ hơn 5MB.",
    avatarFormat: "Chỉ hỗ trợ định dạng JPG, PNG và GIF cho avatar.",
    network: "Lỗi kết nối mạng. Vui lòng kiểm tra kết nối và thử lại.",
    sessionExpired: "Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.",
    forbidden: "Bạn không có quyền thực hiện thao tác này.",
  },

  // Testimonials
  testimonials: {
    studentOne:
      "Mình thích QuizEdu vì dễ dùng, làm bài xong biết điểm ngay và có thể xem lại đáp án chi tiết.",
    studentTwo:
      "Nhờ QuizEdu mình học nhóm rất hiệu quả, các bạn cùng thi đua và trao đổi đáp án dễ dàng.",
    teacherOne:
      "Tôi đánh giá cao tính năng thống kê kết quả, giúp tôi nắm bắt nhanh tình hình lớp học.",
  },

  // Language switcher
  language: {
    english: "English",
    vietnamese: "Tiếng Việt",
  },

  // Quiz Waiting Room
  quizWaitingRoom: {
    pageTitle: "Phòng chờ làm bài",
    reviewInfo:
      "Xem lại thông tin bài kiểm tra và các quy tắc trước khi bắt đầu phiên làm bài.",
    sessionInfo: "Thông tin phiên",
    accessCode: "Mã truy cập",
    teacher: "Giáo viên",
    totalQuestions: "Tổng số câu hỏi",
    status: "Trạng thái",
    estimatedStart: "Thời gian dự kiến",
    readyToStart: "Sẵn sàng bắt đầu",
    waitingRoom: "Phòng chờ",
    quizRules: "Quy tắc & Hướng dẫn",
    rules: {
      timeLimit: "Mỗi câu hỏi có thời gian giới hạn riêng",
      completionTime:
        "Thời gian hoàn thành bài thi phụ thuộc vào tốc độ trả lời của bạn",
      noGoBack: "Bạn không thể quay lại sau khi đã nộp câu trả lời",
      integrity: "Duy trì tính trung thực trong suốt bài kiểm tra",
      connection: "Giữ kết nối internet ổn định",
    },
    importantInstructions: "Hướng dẫn quan trọng:",
    instructions: {
      readRules: "Đọc kỹ tất cả các quy tắc trước khi bắt đầu",
      waitForTeacher:
        "Sau khi bắt đầu, bạn phải đợi giáo viên khởi động bài thi",
      stableConnection: "Đảm bảo kết nối internet ổn định trong suốt quá trình",
      noPause: "Bạn không thể tạm dừng sau khi bài thi bắt đầu",
    },
    leave: "Rời khỏi",
    leaveSession: "Rời khỏi phiên",
    enterQuizRoom: "Vào phòng thi",
    confirmLeave: "Bạn có chắc chắn muốn rời khỏi phòng chờ?",
    loadFailed: "Không thể tải thông tin phiên thi. Vui lòng thử lại.",
    loadingWaitingRoom: "Đang tải phòng chờ...",
    checkingSessionStatus: "Đang kiểm tra trạng thái phiên...",
  },

  // Quiz Taking
  quizTaking: {
    pageTitle: "Làm bài thi",
    back: "Quay lại",
    pause: "Tạm dừng",
    resume: "Tiếp tục",
    submit: "Nộp bài",
    submitQuiz: "Nộp bài thi",
    question: "Câu hỏi",
    of: "của",
    answered: "đã trả lời",
    points: "điểm",
    point: "điểm",
    previous: "Trước",
    next: "Tiếp theo",
    questions: "Các câu hỏi",
    quizSession: "Phiên thi",
    accessCode: "Mã truy cập",
    status: "Trạng thái",
    keyboardShortcuts: "Phím tắt:",
    navigateQuestions: "← → Điều hướng câu hỏi",
    submitShortcut: "Shift+Enter Nộp bài",
    typeAnswer: "Nhập câu trả lời của bạn tại đây...",
    unsupportedType: "Loại câu hỏi không được hỗ trợ:",
    unsavedChanges:
      "Bạn có thay đổi chưa được lưu. Bạn có chắc chắn muốn thoát?",
    loadingQuizData: "Đang tải dữ liệu bài thi...",

    // Waiting for teacher
    waitingForTeacher: "Đang chờ giáo viên",
    waitingMessage:
      "Bạn đã vào phòng thi thành công. Vui lòng đợi giáo viên bắt đầu bài thi.",
    quizStatus: "Trạng thái bài thi",
    waitingInstructions: "Trong khi chờ đợi:",
    waitingRules: {
      stayOnTab: "Giữ tab này mở và không điều hướng đi nơi khác",
      stableConnection: "Đảm bảo kết nối internet ổn định",
      autoStart: "Bài thi sẽ tự động bắt đầu khi giáo viên khởi động",
      reviewRules: "Xem lại các quy tắc bài thi nếu cần",
    },
    leaveQuizRoom: "Rời khỏi phòng thi",
    startQuizTest: "Bắt đầu thi (Test)",

    // Submit confirmation
    submitConfirmation: "Nộp bài thi?",
    submitMessage:
      "Bạn đã trả lời {{answered}} trong tổng số {{total}} câu hỏi. Bạn có chắc chắn muốn nộp bài? Thao tác này không thể hoàn tác.",
    submitting: "Đang nộp bài...",
    submittingMessage: "Đang nộp bài thi của bạn...",

    // Time display
    timeRemaining: "Thời gian còn lại:",
    timeUp: "Hết giờ!",

    // Question types
    multipleChoice: "Trả lời trắc nghiệm",
    trueFalse: "Đúng/Sai",
    essay: "Tự luận",
    true: "Đúng",
    false: "Sai",
  },
  true: "Đúng",
  false: "Sai",
};

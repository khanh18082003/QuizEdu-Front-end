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
};

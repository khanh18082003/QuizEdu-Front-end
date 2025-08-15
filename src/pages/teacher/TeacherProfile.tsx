import { useState, useEffect, useRef } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  FaUser,
  FaEdit,
  FaSave,
  FaTimes,
  FaEnvelope,
  FaUniversity,
  FaCamera,
  FaBook,
  FaBriefcase,
} from "react-icons/fa";
import InputField from "../../components/ui/InputField";
import Button from "../../components/ui/Button";
import type { RegisterResponse } from "../../services/userService";
import { updateUserProfile } from "../../services/userService";
import { myProfile } from "../../actions/user";
import type {
  StudentProfileResponse,
  TeacherProfileResponse,
} from "../../types/response";
import { setPageTitle, PAGE_TITLES, usePageTitle } from "../../utils/title";

interface TeacherData {
  email: string;
  first_name: string;
  last_name: string;
  display_name: string;
  subjects: Array<string>;
  experience: string;
  school_name: string;
  avatar: string;
}

export const TeacherProfile = () => {
  // Set page title
  usePageTitle(PAGE_TITLES.TEACHER_PROFILE);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedAvatarFile, setSelectedAvatarFile] = useState<File | null>(
    null,
  );
  const [subjectInput, setSubjectInput] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const dispatch = useDispatch();

  // Lấy thông tin user từ Redux store
  const userProfile = useSelector(
    (state: {
      user: RegisterResponse | StudentProfileResponse | TeacherProfileResponse;
    }) => state.user,
  ) as TeacherProfileResponse;

  // Teacher data từ user profile Redux
  const [teacherData, setTeacherData] = useState<TeacherData>({
    email: userProfile.email || "",
    first_name: userProfile.first_name || "",
    last_name: userProfile.last_name || "",
    display_name: userProfile.display_name || "",
    subjects: userProfile.subjects || [],
    experience: userProfile.experience || "",
    school_name: userProfile.school_name || "",
    avatar: userProfile.avatar,
  });

  // Cập nhật teacherData khi userProfile thay đổi
  useEffect(() => {
    if (userProfile) {
      setTeacherData({
        email: userProfile.email || "",
        first_name: userProfile.first_name || "",
        last_name: userProfile.last_name || "",
        display_name: userProfile.display_name || "",
        subjects: userProfile.subjects || [],
        experience: userProfile.experience || "",
        school_name: userProfile.school_name || "",
        avatar: userProfile.avatar,
      });
    }
  }, [userProfile]);

  const [formData, setFormData] = useState<TeacherData>(teacherData);

  // Cập nhật formData khi teacherData thay đổi
  useEffect(() => {
    setFormData(teacherData);
  }, [teacherData]);

  const handleInputChange = (
    field: keyof TeacherData,
    value: string | string[],
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // Thêm môn học mới
  const addSubject = () => {
    if (
      subjectInput.trim() &&
      !formData.subjects.includes(subjectInput.trim())
    ) {
      handleInputChange("subjects", [
        ...formData.subjects,
        subjectInput.trim(),
      ]);
      setSubjectInput("");
    }
  };

  // Xóa môn học
  const removeSubject = (subjectToRemove: string) => {
    handleInputChange(
      "subjects",
      formData.subjects.filter((subject) => subject !== subjectToRemove),
    );
  };

  // Xử lý upload avatar
  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Store the file for later upload during save
      setSelectedAvatarFile(file);

      // Create a preview of the image
      const reader = new FileReader();
      reader.onload = () => {
        setFormData((prev) => ({
          ...prev,
          avatar: reader.result as string,
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    setIsLoading(true);
    try {
      const userData = {
        firstName: formData.first_name,
        lastName: formData.last_name,
        displayName: formData.display_name,
        subjects: formData.subjects,
        experience: formData.experience,
        schoolName: formData.school_name,
      };

      const response = await updateUserProfile(
        userData,
        selectedAvatarFile,
        "teacher",
      );

      const updatedData = {
        ...formData,
        first_name: response.data.first_name || formData.first_name,
        last_name: response.data.last_name || formData.last_name,
        display_name: response.data.display_name || formData.display_name,
        subjects: response.data.subjects || formData.subjects,
        experience: response.data.experience || formData.experience,
        school_name: response.data.school_name || formData.school_name,
        avatar: response.data.avatar || formData.avatar,
      };

      setFormData(updatedData);
      setTeacherData(updatedData);

      // Update Redux store with the updated profile
      dispatch(
        myProfile({
          ...userProfile,
          first_name: updatedData.first_name,
          last_name: updatedData.last_name,
          display_name: updatedData.display_name,
          subjects: updatedData.subjects,
          experience: updatedData.experience,
          school_name: updatedData.school_name,
          avatar: updatedData.avatar,
        }),
      );

      // Exit editing mode and reset the selected file
      setIsEditing(false);
      setSelectedAvatarFile(null);
      // Reset the file input element
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } catch (error) {
      console.error("Error saving profile:", error);
      let errorMessage =
        "Đã xảy ra lỗi khi cập nhật thông tin. Vui lòng thử lại sau.";

      if (error instanceof Error) {
        // Extract specific error messages for better user feedback
        if (error.message.includes("Avatar image size")) {
          errorMessage =
            "Kích thước avatar quá lớn. Vui lòng chọn ảnh nhỏ hơn 5MB.";
        } else if (error.message.includes("Only JPG, PNG and GIF")) {
          errorMessage = "Chỉ hỗ trợ định dạng JPG, PNG và GIF cho avatar.";
        } else if (
          error.message.includes("Network Error") ||
          error.message.includes("timeout")
        ) {
          errorMessage =
            "Lỗi kết nối mạng. Vui lòng kiểm tra kết nối và thử lại.";
        } else if (error.message.includes("401")) {
          errorMessage = "Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.";
        } else if (error.message.includes("403")) {
          errorMessage = "Bạn không có quyền thực hiện thao tác này.";
        }
        console.log("Error details:", errorMessage);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData(teacherData);
    setSelectedAvatarFile(null);
    setIsEditing(false);
    // Reset the file input element
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Set page title on mount
  useEffect(() => {
    setPageTitle(PAGE_TITLES.TEACHER_PROFILE);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6 dark:from-gray-900 dark:to-gray-800">
      <div className="mx-auto max-w-4xl">
        {/* Header */}
        <div className="mb-8 rounded-2xl bg-white shadow-xl dark:bg-gray-800">
          <div className="relative h-32 rounded-t-2xl bg-gradient-to-r from-[var(--color-gradient-from)] to-[var(--color-gradient-to)]"></div>
          <div className="px-8 pb-8">
            <div className="-mt-16 mb-6 flex items-center justify-between">
              <div className="flex items-center">
                <div className="relative flex h-32 w-32 items-center justify-center rounded-full border-4 border-white bg-white shadow-lg dark:border-gray-700 dark:bg-gray-700">
                  {(isEditing ? formData.avatar : teacherData.avatar) ? (
                    <img
                      src={
                        isEditing
                          ? formData.avatar || ""
                          : teacherData.avatar || ""
                      }
                      alt={teacherData.display_name}
                      className="h-full w-full rounded-full object-cover"
                    />
                  ) : (
                    <FaUser className="h-16 w-16 text-gray-400 dark:text-gray-300" />
                  )}
                  {isEditing && (
                    <label
                      htmlFor="avatar-upload"
                      className="absolute right-0 bottom-0 flex h-8 w-8 cursor-pointer items-center justify-center rounded-full bg-[var(--color-gradient-from)] text-white hover:bg-[var(--color-gradient-to)]"
                    >
                      <FaCamera className="h-4 w-4" />
                      <input
                        ref={fileInputRef}
                        type="file"
                        id="avatar-upload"
                        className="hidden"
                        accept="image/*"
                        onChange={handleAvatarChange}
                      />
                    </label>
                  )}
                </div>
                <div className="mt-16 ml-6">
                  <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                    {teacherData.display_name}
                  </h1>
                  <p className="text-lg text-gray-600 dark:text-gray-300">
                    Giảng viên
                  </p>
                </div>
              </div>
              <div className="mt-16">
                {!isEditing ? (
                  <Button
                    onClick={() => setIsEditing(true)}
                    variant="primary"
                    className="flex items-center gap-2"
                  >
                    <FaEdit className="h-4 w-4" />
                    Chỉnh sửa
                  </Button>
                ) : (
                  <div className="flex gap-3">
                    <Button
                      onClick={handleSave}
                      variant="primary"
                      isLoading={isLoading}
                      loadingText="Đang lưu..."
                      className="flex items-center gap-2"
                    >
                      <FaSave className="h-4 w-4" />
                      Lưu
                    </Button>
                    <Button
                      onClick={handleCancel}
                      variant="outline"
                      className="flex items-center gap-2"
                    >
                      <FaTimes className="h-4 w-4" />
                      Hủy
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Profile Information */}
        <div className="rounded-2xl bg-white p-8 shadow-xl dark:bg-gray-800">
          <h2 className="mb-8 text-2xl font-bold text-gray-900 dark:text-white">
            Thông tin cá nhân
          </h2>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {/* Email - read only */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-200">
                <FaEnvelope className="h-4 w-4" />
                Email
              </label>
              <div className="rounded-lg bg-gray-50 p-3 dark:bg-gray-700">
                <p className="text-gray-900 dark:text-white">
                  {teacherData.email}
                </p>
              </div>
            </div>

            {/* Display Name */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-200">
                <FaUser className="h-4 w-4" />
                Tên hiển thị
              </label>
              {isEditing ? (
                <InputField
                  label=""
                  value={formData.display_name}
                  onChange={(e) =>
                    handleInputChange("display_name", e.target.value)
                  }
                  placeholder="Nhập tên hiển thị"
                />
              ) : (
                <div className="rounded-lg bg-gray-50 p-3 dark:bg-gray-700">
                  <p className="text-gray-900 dark:text-white">
                    {teacherData.display_name}
                  </p>
                </div>
              )}
            </div>

            {/* First Name */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-200">
                Họ
              </label>
              {isEditing ? (
                <InputField
                  label=""
                  value={formData.last_name}
                  onChange={(e) =>
                    handleInputChange("last_name", e.target.value)
                  }
                  placeholder="Nhập họ"
                />
              ) : (
                <div className="rounded-lg bg-gray-50 p-3 dark:bg-gray-700">
                  <p className="text-gray-900 dark:text-white">
                    {teacherData.last_name}
                  </p>
                </div>
              )}
            </div>

            {/* Last Name */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-200">
                Tên
              </label>
              {isEditing ? (
                <InputField
                  label=""
                  value={formData.first_name}
                  onChange={(e) =>
                    handleInputChange("first_name", e.target.value)
                  }
                  placeholder="Nhập tên"
                />
              ) : (
                <div className="rounded-lg bg-gray-50 p-3 dark:bg-gray-700">
                  <p className="text-gray-900 dark:text-white">
                    {teacherData.first_name}
                  </p>
                </div>
              )}
            </div>

            {/* Subjects */}
            <div className="space-y-2 md:col-span-2">
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-200">
                <FaBook className="h-4 w-4" />
                Môn học giảng dạy
              </label>
              {isEditing ? (
                <div className="space-y-3">
                  <div className="flex gap-2">
                    <InputField
                      label=""
                      value={subjectInput}
                      onChange={(e) => setSubjectInput(e.target.value)}
                      placeholder="Nhập tên môn học"
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          addSubject();
                        }
                      }}
                    />
                    <Button
                      onClick={addSubject}
                      variant="primary"
                      className="whitespace-nowrap"
                    >
                      Thêm môn học
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {formData.subjects.map((subject, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-1 rounded-full bg-blue-100 px-3 py-1 text-sm text-blue-800"
                      >
                        {subject}
                        <button
                          onClick={() => removeSubject(subject)}
                          className="ml-1 rounded-full text-blue-800 hover:text-blue-600"
                        >
                          <FaTimes className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="rounded-lg bg-gray-50 p-3 dark:bg-gray-700">
                  <div className="flex flex-wrap gap-2">
                    {teacherData.subjects.length > 0 ? (
                      teacherData.subjects.map((subject, index) => (
                        <span
                          key={index}
                          className="rounded-full bg-blue-100 px-3 py-1 text-sm text-blue-800"
                        >
                          {subject}
                        </span>
                      ))
                    ) : (
                      <p className="text-gray-500">Chưa có môn học nào</p>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Experience */}
            <div className="space-y-2 md:col-span-2">
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-200">
                <FaBriefcase className="h-4 w-4" />
                Kinh nghiệm
              </label>
              {isEditing ? (
                <textarea
                  value={formData.experience}
                  onChange={(e) =>
                    handleInputChange("experience", e.target.value)
                  }
                  placeholder="Mô tả kinh nghiệm giảng dạy của bạn"
                  className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-700 focus:border-[var(--color-gradient-from)] focus:ring-2 focus:ring-[var(--color-gradient-from)]/20 focus:outline-none dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200"
                  rows={4}
                />
              ) : (
                <div className="rounded-lg bg-gray-50 p-3 dark:bg-gray-700">
                  <p className="whitespace-pre-line text-gray-900 dark:text-white">
                    {teacherData.experience || "Chưa có thông tin"}
                  </p>
                </div>
              )}
            </div>

            {/* School Name */}
            <div className="space-y-2 md:col-span-2">
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-200">
                <FaUniversity className="h-4 w-4" />
                Trường học
              </label>
              {isEditing ? (
                <InputField
                  label=""
                  value={formData.school_name}
                  onChange={(e) =>
                    handleInputChange("school_name", e.target.value)
                  }
                  placeholder="Nhập tên trường"
                />
              ) : (
                <div className="rounded-lg bg-gray-50 p-3 dark:bg-gray-700">
                  <p className="text-gray-900 dark:text-white">
                    {teacherData.school_name || "Chưa có thông tin"}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

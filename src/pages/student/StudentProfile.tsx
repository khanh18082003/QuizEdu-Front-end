import { useState, useEffect, useRef } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  FaUser,
  FaEdit,
  FaSave,
  FaTimes,
  FaEnvelope,
  FaGraduationCap,
  FaUniversity,
  FaCamera,
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

import { PAGE_TITLES, usePageTitle } from "../../utils/title";

interface StudentData {
  email: string;
  first_name: string;
  last_name: string;
  display_name: string;
  level:
    | "PRIMARY"
    | "SECONDARY"
    | "HIGH_SCHOOL"
    | "UNDERGRADUATE"
    | "POSTGRADUATE"
    | "DOCTORATE";
  school_name: string;
  avatar?: string | null;
}

export const StudentProfile = () => {
  // Set page title
  usePageTitle(PAGE_TITLES.STUDENT_PROFILE);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedAvatarFile, setSelectedAvatarFile] = useState<File | null>(
    null,
  );
  const fileInputRef = useRef<HTMLInputElement>(null);

  const dispatch = useDispatch();

  // Lấy thông tin user từ Redux store
  const userProfile = useSelector(
    (state: {
      user: RegisterResponse | StudentProfileResponse | TeacherProfileResponse;
    }) => state.user,
  ) as StudentProfileResponse;

  // Student data từ user profile Redux
  const [studentData, setStudentData] = useState<StudentData>({
    email: userProfile.email || "",
    first_name: userProfile.first_name || "",
    last_name: userProfile.last_name || "",
    display_name: userProfile.display_name || "",
    level: (userProfile.level as StudentData["level"]) || "UNDERGRADUATE",
    school_name: userProfile.school_name || "",
    avatar: userProfile.avatar,
  });

  // Cập nhật studentData khi userProfile thay đổi
  useEffect(() => {
    if (userProfile) {
      setStudentData({
        email: userProfile.email || "",
        first_name: userProfile.first_name || "",
        last_name: userProfile.last_name || "",
        display_name: userProfile.display_name || "",
        level: (userProfile.level as StudentData["level"]) || "UNDERGRADUATE",
        school_name: userProfile.school_name || "",
        avatar: userProfile.avatar,
      });
    }
  }, [userProfile]);

  const [formData, setFormData] = useState<StudentData>(studentData);

  // Cập nhật formData khi studentData thay đổi
  useEffect(() => {
    setFormData(studentData);
  }, [studentData]);

  const levelOptions = [
    { value: "PRIMARY", label: "Tiểu học" },
    { value: "SECONDARY", label: "THCS" },
    { value: "HIGH_SCHOOL", label: "THPT" },
    { value: "UNDERGRADUATE", label: "Đại học" },
    { value: "POSTGRADUATE", label: "Thạc sĩ" },
    { value: "DOCTORATE", label: "Tiến sĩ" },
  ];

  const handleInputChange = (field: keyof StudentData, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
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
        level: formData.level,
        schoolName: formData.school_name,
      };

      const response = await updateUserProfile(
        userData,
        selectedAvatarFile,
        "student",
      );

      const updatedData = {
        ...formData,
        first_name: response.data.first_name || formData.first_name,
        last_name: response.data.last_name || formData.last_name,
        display_name: response.data.display_name || formData.display_name,
        school_name: response.data.school_name || formData.school_name,
        level: response.data?.level || formData.level,
        avatar: response.data.avatar || formData.avatar,
      } as StudentData;

      setFormData(updatedData);
      setStudentData(updatedData);

      // Update Redux store with the updated profile
      // Make sure we're using the correct field names that match the Redux store structure
      dispatch(
        myProfile({
          ...userProfile,
          first_name: updatedData.first_name,
          last_name: updatedData.last_name,
          display_name: updatedData.display_name,
          level: updatedData.level,
          school_name: updatedData.school_name,
          avatar: updatedData.avatar ?? userProfile.avatar ?? "",
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
    setFormData(studentData);
    setSelectedAvatarFile(null);
    setIsEditing(false);
    // Reset the file input element
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="space-y-8">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8 rounded-2xl border border-gray-100 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
          <div className="relative h-32 rounded-t-2xl bg-gradient-to-r from-[var(--color-gradient-from)] to-[var(--color-gradient-to)]"></div>
          <div className="px-8 pb-8">
            <div className="-mt-16 mb-6 flex items-center justify-between">
              <div className="flex items-center">
                <div className="relative flex h-32 w-32 items-center justify-center rounded-full border-4 border-white bg-white shadow-lg dark:border-gray-700 dark:bg-gray-700">
                  {(isEditing ? formData.avatar : studentData.avatar) ? (
                    <img
                      src={
                        isEditing
                          ? formData.avatar || ""
                          : studentData.avatar || ""
                      }
                      alt={studentData.display_name}
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
                    {studentData.display_name}
                  </h1>
                  <p className="text-lg text-gray-600 dark:text-gray-300">
                    Sinh viên
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
        <div className="rounded-2xl border border-gray-100 bg-white p-8 shadow-sm dark:border-gray-700 dark:bg-gray-800">
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
                  {studentData.email}
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
                    {studentData.display_name}
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
                    {studentData.last_name}
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
                    {studentData.first_name}
                  </p>
                </div>
              )}
            </div>

            {/* Level */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-200">
                <FaGraduationCap className="h-4 w-4" />
                Trình độ
              </label>
              {isEditing ? (
                <select
                  value={formData.level}
                  onChange={(e) => handleInputChange("level", e.target.value)}
                  className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-700 focus:border-[var(--color-gradient-from)] focus:ring-2 focus:ring-[var(--color-gradient-from)]/20 focus:outline-none dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200"
                >
                  {levelOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              ) : (
                <div className="rounded-lg bg-gray-50 p-3 dark:bg-gray-700">
                  <p className="text-gray-900 dark:text-white">
                    {
                      levelOptions.find(
                        (opt) => opt.value === studentData.level,
                      )?.label
                    }
                  </p>
                </div>
              )}
            </div>

            {/* School Name */}
            <div className="space-y-2">
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
                    {studentData.school_name}
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

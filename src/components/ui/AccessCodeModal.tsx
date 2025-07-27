import { useState } from "react";
import { FaTimes, FaLock, FaPlay, FaSpinner } from "react-icons/fa";
import Button from "./Button";

interface AccessCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (accessCode: string) => Promise<void>;
  quizSessionName: string;
  quizSessionStatus?: "LOBBY" | "ACTIVE" | "PAUSED" | "COMPLETED";
  isLoading?: boolean;
}

const AccessCodeModal = ({
  isOpen,
  onClose,
  onSubmit,
  quizSessionName,
  quizSessionStatus = "ACTIVE",
  isLoading = false,
}: AccessCodeModalProps) => {
  const [accessCode, setAccessCode] = useState("");
  const [error, setError] = useState("");

  // Get status-specific text
  const getStatusText = () => {
    switch (quizSessionStatus) {
      case "LOBBY":
        return {
          title: "Join Waiting Room",
          description: "Enter the access code to join the waiting room for",
          buttonText: "Join Waiting Room",
        };
      case "ACTIVE":
        return {
          title: "Join Active Quiz",
          description: "Enter the access code to join the active quiz",
          buttonText: "Join Quiz",
        };
      case "PAUSED":
        return {
          title: "Join Paused Quiz",
          description: "Enter the access code to rejoin the paused quiz",
          buttonText: "Rejoin Quiz",
        };
      default:
        return {
          title: "Enter Access Code",
          description: "Please enter the 6-character access code for",
          buttonText: "Join Session",
        };
    }
  };

  const statusText = getStatusText();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (accessCode.length !== 6) {
      setError("Access code must be exactly 6 characters");
      return;
    }

    try {
      setError("");
      await onSubmit(accessCode);
    } catch {
      setError("Invalid access code. Please try again.");
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.toUpperCase().slice(0, 6);
    setAccessCode(value);
    if (error) setError("");
  };

  const handleClose = () => {
    setAccessCode("");
    setError("");
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4">
      <div className="relative w-full max-w-md rounded-lg bg-white p-6 shadow-xl dark:bg-gray-800">
        {/* Close button */}
        <button
          onClick={handleClose}
          disabled={isLoading}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300"
        >
          <FaTimes className="h-5 w-5" />
        </button>

        {/* Header */}
        <div className="mb-6 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/30">
            <FaLock className="h-8 w-8 text-blue-600 dark:text-blue-400" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            {statusText.title}
          </h2>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            {statusText.description}
          </p>
          <p className="font-medium text-gray-900 dark:text-white">
            "{quizSessionName}"
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Access Code Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Access Code
            </label>
            <input
              type="text"
              value={accessCode}
              onChange={handleInputChange}
              placeholder="Enter 6-character code"
              disabled={isLoading}
              className={`mt-1 block w-full rounded-md border px-3 py-3 text-center font-mono text-lg font-bold tracking-widest uppercase shadow-sm focus:ring-2 focus:outline-none ${
                error
                  ? "border-red-300 focus:border-red-500 focus:ring-red-500"
                  : "border-gray-300 focus:border-blue-500 focus:ring-blue-500"
              } disabled:cursor-not-allowed disabled:bg-gray-50 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:disabled:bg-gray-800`}
              maxLength={6}
              autoFocus
            />
            {error && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                {error}
              </p>
            )}
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="secondary"
              onClick={handleClose}
              disabled={isLoading}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              disabled={accessCode.length !== 6 || isLoading}
              className="flex-1"
            >
              {isLoading ? (
                <>
                  <FaSpinner className="mr-2 h-4 w-4 animate-spin" />
                  Joining...
                </>
              ) : (
                <>
                  <FaPlay className="mr-2 h-4 w-4" />
                  {statusText.buttonText}
                </>
              )}
            </Button>
          </div>
        </form>

        {/* Helper text */}
        <div className="mt-6 rounded-lg bg-blue-50 p-4 dark:bg-blue-900/20">
          <div className="flex">
            <div className="ml-3">
              <h3 className="text-sm font-medium text-blue-800 dark:text-blue-300">
                Need help?
              </h3>
              <div className="mt-2 text-sm text-blue-700 dark:text-blue-400">
                <p>• Ask your teacher for the access code</p>
                <p>• Make sure you enter all 6 characters correctly</p>
                <p>• The code is case-insensitive</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AccessCodeModal;

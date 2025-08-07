import SockJS from "sockjs-client";
import Stomp from "stompjs";
import type { RegisterResponse } from "./userService";

// Interface for quiz submission data
export interface QuizSubmissionData {
  id: string; // student id
  email: string;
  score: number;
  quiz_session_id: string;
}

// Interface for session WebSocket callbacks
export interface SessionSocketCallbacks {
  onJoinSession?: (data: RegisterResponse) => void;
  onStartExam?: (data: boolean) => void;
  onCloseQuiz?: (data: boolean) => void;
  onSubmitQuiz?: (data: QuizSubmissionData) => void;
  onConnectionChange?: (connected: boolean) => void;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let sessionStompClient: any = null;

export const connectSessionSocket = (
  sessionId: string,
  callbacks: SessionSocketCallbacks,
) => {
  const baseUrl =
    import.meta.env.VITE_BASE_URL || "http://localhost:8080/api/v1.0";
  const socket = new SockJS(`${baseUrl}/ws-session`);
  sessionStompClient = Stomp.over(socket);

  // Get token from sessionStorage
  const token = sessionStorage.getItem("token");
  console.log(
    "📡 Connecting to WebSocket with token:",
    token ? "Present" : "Missing",
  );

  sessionStompClient.connect(
    {
      Authorization: `Bearer ${token}`,
    },
    () => {
      console.log("✅ Session WebSocket connected");
      callbacks.onConnectionChange?.(true);

      // Subscribe to join session topic
      if (callbacks.onJoinSession) {
        sessionStompClient.subscribe(
          `/topic/join-quiz-session/${sessionId}`,
          (message: { body: string }) => {
            const data: RegisterResponse = JSON.parse(message.body);
            console.log("📡 Real-time join session update:", data);
            callbacks.onJoinSession?.(data);
          },
        );
      }

      // Subscribe to start exam topic
      if (callbacks.onStartExam) {
        sessionStompClient.subscribe(
          `/topic/start-exam/${sessionId}`,
          (message: { body: string }) => {
            const data: boolean = JSON.parse(message.body);
            console.log("📡 Real-time start exam update:", data);
            callbacks.onStartExam?.(data);
          },
        );
      }

      // Subscribe to close quiz session topic
      if (callbacks.onCloseQuiz) {
        sessionStompClient.subscribe(
          `/topic/close-quiz-session/${sessionId}`,
          (message: { body: string }) => {
            const data: boolean = JSON.parse(message.body);
            console.log("📡 Real-time close quiz update:", data);
            callbacks.onCloseQuiz?.(data);
          },
        );
      }

      // Subscribe to submit quiz topic
      if (callbacks.onSubmitQuiz) {
        sessionStompClient.subscribe(
          `/topic/submit-quiz-session/${sessionId}`,
          (message: { body: string }) => {
            const data: QuizSubmissionData = JSON.parse(message.body);
            console.log("📡 Real-time quiz submission update:", data);
            callbacks.onSubmitQuiz?.(data);
          },
        );
      }
    },
    (error: Error) => {
      console.error("❌ Session WebSocket error:", error);
      callbacks.onConnectionChange?.(false);
    },
  );
};

export const disconnectSessionSocket = () => {
  if (sessionStompClient !== null) {
    sessionStompClient.disconnect(() => {
      console.log("🔌 Session WebSocket disconnected");
    });
    sessionStompClient = null;
  }
};

export const disconnectAllSockets = () => {
  disconnectSessionSocket();
};

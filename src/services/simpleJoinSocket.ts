import SockJS from "sockjs-client";
import Stomp from "stompjs";
import type { RegisterResponse } from "./userService";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let joinSessionStompClient: any = null;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let startExamStompClient: any = null;

export const connectJoinSessionSocket = (
  sessionId: string,
  onMessage: (data: RegisterResponse) => void,
  onConnectionChange?: (connected: boolean) => void,
) => {
  const baseUrl =
    import.meta.env.VITE_BASE_URL || "http://localhost:8080/api/v1.0";
  const socket = new SockJS(`${baseUrl}/ws-join-quiz-session`);
  joinSessionStompClient = Stomp.over(socket);

  joinSessionStompClient.connect(
    {
      Authorization: `Bearer ${sessionStorage.getItem("token")}`,
    },
    () => {
      console.log("✅ Join Session WebSocket connected");
      onConnectionChange?.(true);
      // Subscribe to join session topic - replace sessionId with actual session ID
      joinSessionStompClient.subscribe(
        `/topic/join-quiz-session/${sessionId}`,
        (message: { body: string }) => {
          const data: RegisterResponse = JSON.parse(message.body);
          console.log("📡 Real-time join session update:", data);
          onMessage(data); // Gửi về component sử dụng
        },
      );
    },
    (error: Error) => {
      console.error("❌ Join Session WebSocket error:", error);
      onConnectionChange?.(false);
    },
  );
};

export const connectStartExamSocket = (
  sessionId: string,
  onStartExamMessage: (data: boolean) => void,
  onCloseQuizMessage?: (data: boolean) => void,
  onConnectionChange?: (connected: boolean) => void,
) => {
  const baseUrl =
    import.meta.env.VITE_BASE_URL || "http://localhost:8080/api/v1.0";
  const socket = new SockJS(`${baseUrl}/ws-start-exam`);
  startExamStompClient = Stomp.over(socket);

  startExamStompClient.connect(
    {
      Authorization: `Bearer ${sessionStorage.getItem("token")}`,
    },
    () => {
      console.log("✅ Start Exam WebSocket connected");
      onConnectionChange?.(true);

      // Subscribe to start exam topic
      startExamStompClient.subscribe(
        `/topic/start-exam/${sessionId}`,
        (message: { body: string }) => {
          const data: boolean = JSON.parse(message.body);
          console.log("📡 Real-time start exam update:", data);
          onStartExamMessage(data);
        },
      );

      // Subscribe to close quiz session topic if callback is provided
      if (onCloseQuizMessage) {
        startExamStompClient.subscribe(
          `/topic/close-quiz-session/${sessionId}`,
          (message: { body: string }) => {
            const data: boolean = JSON.parse(message.body);
            console.log("📡 Real-time close quiz update:", data);
            onCloseQuizMessage(data);
          },
        );
      }
    },
    (error: Error) => {
      console.error("❌ Start Exam WebSocket error:", error);
      onConnectionChange?.(false);
    },
  );
};

export const disconnectJoinSessionSocket = () => {
  if (joinSessionStompClient !== null) {
    joinSessionStompClient.disconnect(() => {
      console.log("🔌 Join Session WebSocket disconnected");
    });
    joinSessionStompClient = null;
  }
};

export const disconnectStartExamSocket = () => {
  if (startExamStompClient !== null) {
    startExamStompClient.disconnect(() => {
      console.log("🔌 Start Exam WebSocket disconnected");
    });
    startExamStompClient = null;
  }
};

export const disconnectAllSockets = () => {
  disconnectJoinSessionSocket();
  disconnectStartExamSocket();
};

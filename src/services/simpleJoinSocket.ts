import SockJS from "sockjs-client";
import Stomp from "stompjs";
import type { RegisterResponse } from "./userService";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let stompClient: any = null;

export const connectJoinSessionSocket = (
  sessionId: string,
  onMessage: (data: RegisterResponse) => void,
  onConnectionChange?: (connected: boolean) => void,
) => {
  const baseUrl =
    import.meta.env.VITE_BASE_URL || "http://localhost:8080/api/v1.0";
  const socket = new SockJS(`${baseUrl}/ws-join-quiz-session`);
  stompClient = Stomp.over(socket);

  stompClient.connect(
    {
      Authorization: `Bearer ${sessionStorage.getItem("token")}`,
    },
    () => {
      console.log("✅ WebSocket connected");
      onConnectionChange?.(true);
      // Subscribe to join session topic - replace sessionId with actual session ID
      stompClient.subscribe(
        `/topic/join-quiz-session/${sessionId}`,
        (message: { body: string }) => {
          const data: RegisterResponse = JSON.parse(message.body);
          console.log("📡 Real-time join session update:", data);
          onMessage(data); // Gửi về component sử dụng
        },
      );
    },
    (error: Error) => {
      console.error("❌ WebSocket error:", error);
      onConnectionChange?.(false);
    },
  );
};

export const connectStartExamSocket = (
  sessionId: string,
  onMessage: (data: boolean) => void,
  onConnectionChange?: (connected: boolean) => void,
) => {
  const baseUrl =
    import.meta.env.VITE_BASE_URL || "http://localhost:8080/api/v1.0";
  const socket = new SockJS(`${baseUrl}/ws-start-exam`);
  stompClient = Stomp.over(socket);

  stompClient.connect(
    {
      Authorization: `Bearer ${sessionStorage.getItem("token")}`,
    },
    () => {
      console.log("✅ WebSocket connected");
      onConnectionChange?.(true);
      // Subscribe to join session topic - replace sessionId with actual session ID
      stompClient.subscribe(
        `/topic/start-exam/${sessionId}`,
        (message: { body: string }) => {
          const data: boolean = JSON.parse(message.body);
          console.log("📡 Real-time join session update:", data);
          onMessage(data); // Gửi về component sử dụng
        },
      );
    },
    (error: Error) => {
      console.error("❌ WebSocket error:", error);
      onConnectionChange?.(false);
    },
  );
};

export const disconnectJoinSessionSocket = () => {
  if (stompClient !== null) {
    stompClient.disconnect(() => {
      console.log("🔌 WebSocket disconnected");
    });
  }
};

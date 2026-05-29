import { io, Socket } from "socket.io-client";
import { getToken } from "./tokenStorage";

const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:5000";

/**
 * Chat Socket.IO service — replaces v1 chatSignalR.js.
 * Namespace: /chat
 * Events: JoinConversation, LeaveConversation, SendMessage, NewMessage
 */
class ChatSocketService {
  private socket: Socket | null = null;

  start(token?: string) {
    if (this.socket?.connected) return;

    const authToken = token || getToken();
    if (!authToken) return;

    this.socket = io(`${SOCKET_URL}/chat`, {
      auth: { token: authToken },
      transports: ["websocket"],
      reconnection: true,
      reconnectionDelay: 2000,
      reconnectionAttempts: 10,
    });

    this.socket.on("connect", () => {
      console.log("[ChatSocket] Connected");
    });

    this.socket.on("disconnect", (reason) => {
      console.log("[ChatSocket] Disconnected:", reason);
    });
  }

  stop() {
    this.socket?.disconnect();
    this.socket = null;
  }

  joinConversation(conversationId: string | number) {
    this.socket?.emit("JoinConversation", String(conversationId));
  }

  leaveConversation(conversationId: string | number) {
    this.socket?.emit("LeaveConversation", String(conversationId));
  }

  sendMessage(conversationId: string | number, content: string) {
    this.socket?.emit("SendMessage", {
      conversationId: String(conversationId),
      content,
    });
  }

  onReceiveMessage(cb: (message: any) => void): () => void {
    this.socket?.on("NewMessage", cb);
    return () => { this.socket?.off("NewMessage", cb); };
  }

  get isConnected(): boolean {
    return this.socket?.connected ?? false;
  }
}

export const chatSocket = new ChatSocketService();


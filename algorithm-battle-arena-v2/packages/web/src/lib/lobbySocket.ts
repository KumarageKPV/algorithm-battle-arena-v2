import { io, Socket } from "socket.io-client";
import { getToken } from "./tokenStorage";

const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:5000";

/**
 * Lobby Socket.IO service — replaces v1 signalRService.js.
 * Namespace: /lobby
 * Events: JoinLobby, LeaveLobby, LobbyUpdated, MatchStarted, LobbyDeleted
 */
class LobbySocketService {
  private socket: Socket | null = null;

  start(token?: string) {
    if (this.socket?.connected) return;

    const authToken = token || getToken();
    if (!authToken) return;

    this.socket = io(`${SOCKET_URL}/lobby`, {
      auth: { token: authToken },
      transports: ["websocket"],
      reconnection: true,
      reconnectionDelay: 2000,
      reconnectionAttempts: 10,
    });

    this.socket.on("connect", () => {
      console.log("[LobbySocket] Connected");
    });

    this.socket.on("disconnect", (reason) => {
      console.log("[LobbySocket] Disconnected:", reason);
    });
  }

  stop() {
    this.socket?.disconnect();
    this.socket = null;
  }

  joinLobby(lobbyId: string | number) {
    this.socket?.emit("JoinLobby", String(lobbyId));
  }

  leaveLobby(lobbyId: string | number) {
    this.socket?.emit("LeaveLobby", String(lobbyId));
  }

  onLobbyUpdated(cb: (lobby: any) => void): () => void {
    this.socket?.on("LobbyUpdated", cb);
    return () => { this.socket?.off("LobbyUpdated", cb); };
  }

  onMatchStarted(cb: (dto: any) => void): () => void {
    this.socket?.on("MatchStarted", cb);
    return () => { this.socket?.off("MatchStarted", cb); };
  }

  onLobbyDeleted(cb: () => void): () => void {
    this.socket?.on("LobbyDeleted", cb);
    return () => { this.socket?.off("LobbyDeleted", cb); };
  }

  get isConnected(): boolean {
    return this.socket?.connected ?? false;
  }
}

export const lobbySocket = new LobbySocketService();


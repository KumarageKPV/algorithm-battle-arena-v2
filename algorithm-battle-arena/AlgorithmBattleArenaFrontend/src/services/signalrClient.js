import * as signalR from "@microsoft/signalr";

/**
 * Creates and returns a HubConnection instance for /hubs/match.
 * supply getToken() to fetch the latest JWT (from localStorage or in-memory).
 */
export function createMatchHubConnection({ baseUrl = "", getToken = () => null }) {
  const hubUrl = `${baseUrl || ""}/hubs/match`;

  const connection = new signalR.HubConnectionBuilder()
    .withUrl(hubUrl, {
      accessTokenFactory: async () => {
        // SignalR will append ?access_token=...
        const token = await getToken();
        return token || null;
      },
      // transport fallback defaults are fine (WebSockets, ServerSentEvents, LongPolling)
    })
    .withAutomaticReconnect()
    .build();

  // Provide typed subscription helpers on connection object
  connection.onMatchStarted = (handler) => connection.on("MatchStarted", handler);
  connection.onLobbyMemberJoined = (handler) => connection.on("LobbyMemberJoined", handler);
  connection.onLobbyMemberLeft = (handler) => connection.on("LobbyMemberLeft", handler);

  return connection;
}

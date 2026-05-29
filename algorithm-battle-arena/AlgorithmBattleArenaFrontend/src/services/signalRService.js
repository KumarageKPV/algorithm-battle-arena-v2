import * as signalR from '@microsoft/signalr';
import apiService from './api';
import { getToken } from './tokenStorage';

class SignalRService {
    constructor() {
        this.connection = null;
        this.connectionState = 'disconnected';
        this.callbacks = {
            LobbyUpdated: [],
            MatchStarted: [],
            LobbyDeleted: [],
        };
    }

    async start() {
        if (this.connectionState !== 'disconnected') {
            return Promise.resolve();
        }

        const token = getToken();
        if (!token) {
            console.log("No token, SignalR connection not started.");
            return Promise.reject('No token');
        }

        this.connectionState = 'connecting';
        this.connection = new signalR.HubConnectionBuilder()
            .withUrl(`${apiService.client.defaults.baseURL}/lobbyHub`, {
                accessTokenFactory: () => getToken(),
            })
            .withAutomaticReconnect()
            .configureLogging(signalR.LogLevel.Information)
            .build();

        this.connection.onclose(err => {
            console.log('SignalR disconnected.', err);
            this.connectionState = 'disconnected';
        });

        this.connection.on('LobbyUpdated', (lobby) => {
            console.log('SignalR: LobbyUpdated received', lobby);
            this.callbacks.LobbyUpdated.forEach(callback => callback(lobby));
        });

        this.connection.on('MatchStarted', (match) => {
            console.log('SignalR: MatchStarted received', match);
            this.callbacks.MatchStarted.forEach(callback => callback(match));
        });

        this.connection.on('LobbyDeleted', () => {
            console.log('SignalR: LobbyDeleted received');
            this.callbacks.LobbyDeleted.forEach(callback => callback());
        });

        try {
            await this.connection.start();
            console.log('SignalR connected successfully.');
            this.connectionState = 'connected';
            return Promise.resolve();
        } catch (err) {
            console.error('SignalR connection failed: ', err);
            this.connectionState = 'disconnected';
            return Promise.reject(err);
        }
    }

    stop() {
        if (this.connection && this.connectionState === 'connected') {
            this.connection.stop();
        }
    }

    async joinLobby(lobbyId) {
        if (this.connectionState === 'disconnected') {
            await this.start();
        }
        
        if (this.connection && this.connectionState === 'connected') {
            console.log('SignalR: Joining lobby', lobbyId);
            try {
                await this.connection.invoke('JoinLobby', lobbyId.toString());
                console.log('SignalR: Successfully joined lobby', lobbyId);
            } catch (err) {
                console.error('SignalR: Failed to join lobby', err);
            }
        } else {
            console.log('SignalR: Cannot join lobby - connection not ready', this.connectionState);
        }
    }

    leaveLobby(lobbyId) {
        if (this.connection && this.connectionState === 'connected') {
            console.log('SignalR: Leaving lobby', lobbyId);
            this.connection.invoke('LeaveLobby', lobbyId.toString()).catch(err => {
                console.error('SignalR: Failed to leave lobby', err);
            });
        }
    }

    onLobbyUpdated(callback) {
        this.callbacks.LobbyUpdated.push(callback);
        return () => {
            this.callbacks.LobbyUpdated = this.callbacks.LobbyUpdated.filter(cb => cb !== callback);
        };
    }

    onMatchStarted(callback) {
        this.callbacks.MatchStarted.push(callback);
        return () => {
            this.callbacks.MatchStarted = this.callbacks.MatchStarted.filter(cb => cb !== callback);
        };
    }

    onLobbyDeleted(callback) {
        this.callbacks.LobbyDeleted.push(callback);
        return () => {
            this.callbacks.LobbyDeleted = this.callbacks.LobbyDeleted.filter(cb => cb !== callback);
        };
    }
}

const signalRService = new SignalRService();
export default signalRService;

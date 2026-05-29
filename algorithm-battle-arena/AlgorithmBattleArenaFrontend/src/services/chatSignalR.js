import * as signalR from '@microsoft/signalr';
import apiService from './api';
import { getToken } from './tokenStorage';

class ChatSignalRService {
  constructor() {
    this.connection = null;
    this.connectionState = 'disconnected';
    this.callbacks = {
      ReceiveMessage: []
    };
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
  }

  async start() {
    if (this.connectionState === 'connected') return;
    if (this.connectionState === 'connecting') return;

    const token = getToken();
    if (!token) {
      console.error('No authentication token available');
      return Promise.reject(new Error('No authentication token available'));
    }

    this.connectionState = 'connecting';
    
    try {
      this.connection = new signalR.HubConnectionBuilder()
        .withUrl(`${apiService.client.defaults.baseURL}/chathub?access_token=${encodeURIComponent(token)}`, {
          skipNegotiation: true,
          transport: signalR.HttpTransportType.WebSockets
        })
        .withAutomaticReconnect([0, 2000, 10000, 30000])
        .configureLogging(signalR.LogLevel.Information)
        .build();

      this.connection.onclose((error) => {
        console.log('SignalR connection closed:', error);
        this.connectionState = 'disconnected';
      });

      this.connection.onreconnecting((error) => {
        console.log('SignalR reconnecting:', error);
        this.connectionState = 'reconnecting';
      });

      this.connection.onreconnected((connectionId) => {
        console.log('SignalR reconnected:', connectionId);
        this.connectionState = 'connected';
      });

      this.connection.on('NewMessage', (message) => {
        try {
          if (message && this.callbacks.ReceiveMessage) {
            this.callbacks.ReceiveMessage.forEach(callback => {
              try {
                callback(message);
              } catch (callbackError) {
                console.error('Error in message callback:', callbackError);
              }
            });
          }
        } catch (error) {
          console.error('Error handling received message:', error);
        }
      });

      await this.connection.start();
      this.connectionState = 'connected';
      this.reconnectAttempts = 0;
      console.log('SignalR connected successfully');
    } catch (err) {
      console.error('Failed to start SignalR connection:', err);
      this.connectionState = 'disconnected';
      
      throw new Error(`Failed to connect to chat service: ${err.message}`);
    }
  }

  async joinConversation(conversationId) {
    try {
      if (this.connectionState === 'disconnected') {
        await this.start();
      }
      
      if (this.connection && this.connectionState === 'connected') {
        console.log('chatSignalR: invoking JoinConversation for', conversationId);
        await this.connection.invoke('JoinConversation', conversationId.toString());
      } else {
        throw new Error('SignalR connection not available');
      }
    } catch (error) {
      console.error('Failed to join conversation:', error);
      throw error;
    }
  }

  async leaveConversation(conversationId) {
    try {
      if (this.connection && this.connectionState === 'connected') {
        await this.connection.invoke('LeaveConversation', conversationId.toString());
      }
    } catch (error) {
      console.error('Failed to leave conversation:', error);
      // Don't throw here as leaving is not critical
    }
  }

  async sendMessage(conversationId, content) {
    try {
      if (!content || content.trim().length === 0) {
        throw new Error('Message content cannot be empty');
      }
      
      if (this.connection && this.connectionState === 'connected') {
        console.log('chatSignalR: invoking SendMessage to', conversationId, 'content=', content);
        await this.connection.invoke('SendMessage', conversationId.toString(), content.trim());
      } else {
        throw new Error('Not connected to chat service');
      }
    } catch (error) {
      console.error('Failed to send message:', error);
      throw error;
    }
  }

  onReceiveMessage(callback) {
    this.callbacks.ReceiveMessage.push(callback);
    return () => {
      this.callbacks.ReceiveMessage = this.callbacks.ReceiveMessage.filter(cb => cb !== callback);
    };
  }

  stop() {
    try {
      if (this.connection) {
        this.connection.stop();
        this.connectionState = 'disconnected';
      }
    } catch (error) {
      console.error('Error stopping SignalR connection:', error);
    }
  }
}

export default new ChatSignalRService();
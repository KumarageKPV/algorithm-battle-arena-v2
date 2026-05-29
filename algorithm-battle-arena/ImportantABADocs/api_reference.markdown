# AlgorithmBattleArena API Reference

## Authentication

### Register Student

**Endpoint:** `POST /api/Auth/register/student`  
**Authorization:** None (Anonymous)

**Request Body:**
```json
{
  "email": "string",
  "password": "string",
  "passwordConfirm": "string",
  "firstName": "string",
  "lastName": "string",
  "teacherId": NULL,
  "role": "string"
}
```

**Response:** `200 OK`
```json
{
  "message": "Student registered successfully"
}
```

### Register Teacher

**Endpoint:** `POST /api/Auth/register/teacher`  
**Authorization:** None (Anonymous)

**Request Body:**
```json
{
  "email": "string",
  "password": "string",
  "passwordConfirm": "string",
  "firstName": "string",
  "lastName": "string",
  "role": "string"
}
```

**Response:** `200 OK`
```json
{
  "message": "Teacher registered successfully"
}
```

### Login

**Endpoint:** `POST /api/Auth/login`  
**Authorization:** None (Anonymous)

**Request Body:**
```json
{
  "email": "string",
  "password": "string"
}
```

**Response:** `200 OK`
```json
{
  "token": "string",
  "role": "string",
  "email": "string"
}
```



### Refresh Token

**Endpoint:** `GET /api/Auth/refresh/token`  
**Authorization:** Bearer Token Required

**Response:** `200 OK`
```json
{
  "token": "string",
  "role": "string",
  "email": "string"
}
```

### Get Profile

**Endpoint:** `GET /api/Auth/profile`  
**Authorization:** Bearer Token Required

**Response:** `200 OK`
```json
{
  "id": 0,
  "firstName": "string",
  "lastName": "string",
  "fullName": "string",
  "email": "string",
  "role": "string",
  "active": true,
  "teacherId": 0
}
```

## Lobbies

### Get Open Lobbies

**Endpoint:** `GET /api/Lobbies`  
**Authorization:** Student or Admin

**Response:** `200 OK`
```json
[
  {
    "lobbyId": 0,
    "name": "string",
    "maxPlayers": 0,
    "currentPlayers": 0,
    "status": "string",
    "hostEmail": "string",
    "lobbyCode": "string"
  }
]
```

### Get Lobby by ID

**Endpoint:** `GET /api/Lobbies/{lobbyId}`  
**Authorization:** Student or Admin

**Response:** `200 OK`
```json
{
  "lobbyId": 0,
  "name": "string",
  "maxPlayers": 0,
  "currentPlayers": 0,
  "status": "string",
  "hostEmail": "string",
  "lobbyCode": "string"
}
```

### Create Lobby

**Endpoint:** `POST /api/Lobbies`  
**Authorization:** Student or Admin

**Request Body:**
```json
{
  "name": "string",
  "maxPlayers": 10,
  "mode": "1v1",
  "difficulty": "Medium"
}
```

**Response:** `201 Created`
```json
{
  "lobbyId": 0,
  "name": "string",
  "maxPlayers": 0,
  "status": "string",
  "hostEmail": "string",
  "lobbyCode": "string"
}
```

### Join Lobby

**Endpoint:** `POST /api/Lobbies/{lobbyCode}/join`  
**Authorization:** Student or Admin

**Response:** `200 OK`
```json
{
  "lobbyId": 0,
  "name": "string",
  "currentPlayers": 0,
  "maxPlayers": 0
}
```

### Leave Lobby

**Endpoint:** `POST /api/Lobbies/{lobbyId}/leave`  
**Authorization:** Student or Admin

**Response:** `200 OK`
```json
{
  "message": "Left lobby successfully"
}
```

### Close Lobby

**Endpoint:** `POST /api/Lobbies/{lobbyId}/close`  
**Authorization:** Host Only

**Response:** `200 OK`
```json
{
  "message": "Lobby closed successfully"
}
```

### Kick Participant

**Endpoint:** `DELETE /api/Lobbies/{lobbyId}/participants/{participantEmail}`  
**Authorization:** Host Only

**Response:** `200 OK`
```json
{
  "message": "Participant kicked successfully"
}
```

### Update Lobby Privacy

**Endpoint:** `PUT /api/Lobbies/{lobbyId}/privacy`  
**Authorization:** Host Only

**Request Body:**
```json
{
  "isPublic": true
}
```

**Response:** `200 OK`
```json
{
  "message": "Lobby privacy updated successfully"
}
```

### Update Lobby Difficulty

**Endpoint:** `PUT /api/Lobbies/{lobbyId}/difficulty`  
**Authorization:** Host Only

**Request Body:**
```json
{
  "difficulty": "Hard"
}
```

**Response:** `200 OK`
```json
{
  "message": "Lobby difficulty updated successfully"
}
```

### Delete Lobby

**Endpoint:** `DELETE /api/Lobbies/{lobbyId}`  
**Authorization:** Host Only

**Response:** `200 OK`
```json
{
  "message": "Lobby deleted successfully"
}
```

## Matches

### Start Match

**Endpoint:** `POST /api/Matches/{lobbyId}/start`  
**Authorization:** Host Only

**Request Body:**
```json
{
  "problemIds": [1, 2, 3],
  "durationSec": 3600,
  "preparationBufferSec": 5
}
```

**Response:** `200 OK`
```json
{
  "matchId": 0,
  "problemIds": [1, 2, 3],
  "startAtUtc": "2024-01-01T00:00:00Z",
  "durationSec": 3600,
  "sentAtUtc": "2024-01-01T00:00:00Z"
}
```

## Problems

### Create Problem

**Endpoint:** `POST /api/Problems`  
**Authorization:** Admin Only

**Request Body:**
```json
{
  "title": "string",
  "description": "string",
  "difficulty": "string",
  "category": "string",
  "isPublic": true,
  "isActive": true,
  "testCases": [
    {
      "input": "string",
      "expectedOutput": "string",
      "isSample": true
    }
  ]
}
```

**Response:** `201 Created`
```json
{
  "problemId": 123,
  "message": "Problem created successfully"
}
```

### Update Problem

**Endpoint:** `PUT /api/Problems/{id}`  
**Authorization:** Admin Only

**Path Parameters:**
- `id` (integer) - Problem ID

**Request Body:**
```json
{
  "title": "string",
  "description": "string",
  "difficulty": "string",
  "category": "string",
  "isPublic": true,
  "isActive": true
}
```

**Response:** `200 OK`
```json
{
  "message": "Problem updated successfully"
}
```

### Get Problems

**Endpoint:** `GET /api/Problems`  
**Authorization:** Student or Admin

**Query Parameters:**
- `Category` (string, optional)
- `DifficultyLevel` (string, optional)
- `SearchTerm` (string, optional)
- `Page` (integer, optional)
- `PageSize` (integer, optional)

**Response:** `200 OK`
```json
{
  "problems": [],
  "page": 1,
  "pageSize": 10,
  "total": 0
}
```

### Get Problem by ID

**Endpoint:** `GET /api/Problems/{id}`  
**Authorization:** Student or Admin

**Response:** `200 OK`
```json
{
  "problemId": 0,
  "title": "string",
  "description": "string",
  "difficultyLevel": "string",
  "category": "string",
  "timeLimit": 0,
  "memoryLimit": 0
}
```

### Delete Problem

**Endpoint:** `DELETE /api/Problems/{id}`  
**Authorization:** Admin Only

**Response:** `200 OK`
```json
{
  "message": "Problem deleted successfully."
}
```

### Get Categories

**Endpoint:** `GET /api/Problems/categories`  
**Authorization:** Student or Admin

**Response:** `200 OK`
```json
["Array", "String", "Dynamic Programming", "Graph"]
```

### Get Difficulty Levels

**Endpoint:** `GET /api/Problems/difficulty-levels`  
**Authorization:** Student or Admin

**Response:** `200 OK`
```json
["Easy", "Medium", "Hard", "Expert"]
```

### Generate Problems

**Endpoint:** `POST /api/Problems/generate`  
**Authorization:** Bearer Token Required

**Request Body:**
```json
{
  "language": "string",
  "difficulty": "string",
  "maxProblems": 5
}
```

**Response:** `200 OK`
```json
[
  {
    "problemId": 0,
    "title": "string",
    "description": "string",
    "difficultyLevel": "string"
  }
]
```

## Submissions

### Create Submission

**Endpoint:** `POST /api/Submissions`  
**Authorization:** Bearer Token Required

**Request Body:**
```json
{
  "matchId": 0,
  "problemId": 0,
  "language": "string",
  "code": "string",
  "status": "string",
  "score": 0
}
```

**Response:** `200 OK`
```json
{
  "submissionId": 0
}
```

### Get User Submissions for Match

**Endpoint:** `GET /api/Submissions/match/{matchId}/user`  
**Authorization:** Bearer Token Required

**Path Parameters:**
- `matchId` (integer) - Match ID

**Response:** `200 OK`
```json
[
  {
    "submissionId": 0,
    "matchId": 0,
    "problemId": 0,
    "participantEmail": "string",
    "language": "string",
    "code": "string",
    "status": "string",
    "score": 0,
    "submittedAt": "2024-01-01T00:00:00Z"
  }
]
```

## Admin

### Get Users

**Endpoint:** `GET /api/Admin/users`  
**Authorization:** Admin Only

**Query Parameters:**
- `q` (string, optional) - Search by name or email
- `role` (string, optional) - Filter by role ("Student" or "Teacher")
- `page` (integer, optional, default: 1) - Page number
- `pageSize` (integer, optional, default: 25) - Items per page

**Response:** `200 OK`
```json
{
  "items": [
    {
      "id": "Student:123",
      "name": "John Doe",
      "email": "john@example.com",
      "role": "Student",
      "isActive": true,
      "createdAt": "2024-01-01T00:00:00Z"
    }
  ],
  "total": 100
}
```

### Toggle User Active Status

**Endpoint:** `PUT /api/Admin/users/{id}/deactivate`  
**Authorization:** Admin Only

**Path Parameters:**
- `id` (string) - User ID in format "Role:UserId" (e.g., "Student:123")

**Request Body:**
```json
{
  "deactivate": true
}
```

**Response:** `200 OK`
```json
{
  "id": "Student:123",
  "name": "John Doe",
  "email": "john@example.com",
  "role": "Student",
  "isActive": false,
  "createdAt": "2024-01-01T00:00:00Z"
}
```

### Import Problems

**Endpoint:** `POST /api/Admin/problems/import`  
**Authorization:** Admin Only

**Request Body:** 
- **File Upload:** `multipart/form-data` with JSON or CSV file
- **JSON Body:** Array of problem objects

**JSON Format:**
```json
[
  {
    "title": "Two Sum",
    "description": "Given an array of integers...",
    "difficulty": "Easy",
    "isPublic": true,
    "isActive": true,
    "testCases": [
      {
        "input": "[2,7,11,15]\n9",
        "expectedOutput": "[0,1]",
        "isSample": true
      }
    ]
  }
]
```

**Response:** `200 OK`
```json
{
  "ok": true,
  "inserted": 5,
  "message": "Successfully imported 5 problems"
}
```

**Error Response:** `400 Bad Request`
```json
{
  "ok": false,
  "errors": [
    "Row 1, title: Title is required",
    "Row 2, difficulty: Invalid difficulty level"
  ]
}
```

## Students

### Request Teacher

**Endpoint:** `POST /api/Students/request`  
**Authorization:** Student Only

**Request Body:**
```json
123
```

**Response:** `200 OK`
```json
{
  "requestId": 456
}
```

### Accept Student Request

**Endpoint:** `PUT /api/Students/{requestId}/accept`  
**Authorization:** Teacher Only

**Path Parameters:**
- `requestId` (integer) - The student request ID

**Response:** `200 OK`

### Reject Student Request

**Endpoint:** `PUT /api/Students/{requestId}/reject`  
**Authorization:** Teacher Only

**Path Parameters:**
- `requestId` (integer) - The student request ID

**Response:** `200 OK`

### Get Students by Status

**Endpoint:** `GET /api/Students`  
**Authorization:** Teacher Only

**Query Parameters:**
- `status` (string, required) - Filter by status ("Pending", "Accepted", etc.)

**Response:** `200 OK`
```json
{
  "data": [
    {
      "requestId": 456,
      "studentId": 123,
      "username": "john_doe",
      "email": "john@example.com",
      "status": "Pending"
    }
  ]
}
```

## Teachers

### Get All Teachers

**Endpoint:** `GET /api/Teachers`  
**Authorization:** Bearer Token Required

**Response:** `200 OK`
```json
[
  {
    "teacherId": 1,
    "firstName": "Jane",
    "lastName": "Smith",
    "fullName": "Jane Smith",
    "email": "jane.smith@example.com",
    "active": true
  }
]
```

## Chat

### Get Conversations

**Endpoint:** `GET /api/Chat/conversations`  
**Authorization:** Bearer Token Required

**Response:** `200 OK`
```json
[
  {
    "conversationId": 0,
    "type": "Friend",
    "referenceId": null,
    "createdAt": "2024-01-01T00:00:00Z",
    "updatedAt": "2024-01-01T00:00:00Z",
    "participants": ["user1@example.com", "user2@example.com"],
    "lastMessage": {
      "messageId": 0,
      "conversationId": 0,
      "senderEmail": "string",
      "senderName": "string",
      "content": "string",
      "sentAt": "2024-01-01T00:00:00Z"
    }
  }
]
```

### Get Messages

**Endpoint:** `GET /api/Chat/conversations/{conversationId}/messages`  
**Authorization:** Bearer Token Required (Must be participant)

**Path Parameters:**
- `conversationId` (integer) - Conversation ID

**Query Parameters:**
- `pageSize` (integer, optional, default: 50) - Number of messages per page
- `offset` (integer, optional, default: 0) - Offset for pagination

**Response:** `200 OK`
```json
[
  {
    "messageId": 0,
    "conversationId": 0,
    "senderEmail": "string",
    "senderName": "string",
    "content": "string",
    "sentAt": "2024-01-01T00:00:00Z"
  }
]
```

### Send Message

**Endpoint:** `POST /api/Chat/conversations/{conversationId}/messages`  
**Authorization:** Bearer Token Required (Must be participant)

**Path Parameters:**
- `conversationId` (integer) - Conversation ID

**Request Body:**
```json
{
  "content": "string"
}
```

**Response:** `200 OK`
```json
{
  "messageId": 0
}
```

### Create Friend Conversation

**Endpoint:** `POST /api/Chat/conversations/friend`  
**Authorization:** Bearer Token Required

**Request Body:**
```json
{
  "friendId": 0,
  "friendEmail": "string"
}
```

**Response:** `200 OK`
```json
{
  "conversationId": 0,
  "type": "Friend",
  "referenceId": null,
  "createdAt": "2024-01-01T00:00:00Z",
  "updatedAt": "2024-01-01T00:00:00Z",
  "participants": ["user1@example.com", "user2@example.com"],
  "lastMessage": null
}
```

## Friends

### Get Friends

**Endpoint:** `GET /api/Friends`  
**Authorization:** Student Only

**Response:** `200 OK`
```json
[
  {
    "studentId": 0,
    "fullName": "string",
    "email": "string",
    "isOnline": false,
    "friendsSince": "2024-01-01T00:00:00Z"
  }
]
```

### Search Students

**Endpoint:** `GET /api/Friends/search`  
**Authorization:** Student Only

**Query Parameters:**
- `query` (string, required) - Search term for student name or email

**Response:** `200 OK`
```json
[
  {
    "studentId": 0,
    "fullName": "string",
    "email": "string",
    "isOnline": false,
    "friendsSince": "2024-01-01T00:00:00Z"
  }
]
```

### Send Friend Request

**Endpoint:** `POST /api/Friends/request`  
**Authorization:** Student Only

**Request Body:**
```json
{
  "receiverId": 0
}
```

**Response:** `200 OK`
```json
{
  "requestId": 0,
  "message": "Friend request sent successfully"
}
```

### Get Received Friend Requests

**Endpoint:** `GET /api/Friends/requests/received`  
**Authorization:** Student Only

**Response:** `200 OK`
```json
[
  {
    "requestId": 0,
    "senderId": 0,
    "receiverId": 0,
    "senderName": "string",
    "senderEmail": "string",
    "receiverName": "string",
    "receiverEmail": "string",
    "status": "Pending",
    "requestedAt": "2024-01-01T00:00:00Z"
  }
]
```

### Get Sent Friend Requests

**Endpoint:** `GET /api/Friends/requests/sent`  
**Authorization:** Student Only

**Response:** `200 OK`
```json
[
  {
    "requestId": 0,
    "senderId": 0,
    "receiverId": 0,
    "senderName": "string",
    "senderEmail": "string",
    "receiverName": "string",
    "receiverEmail": "string",
    "status": "Pending",
    "requestedAt": "2024-01-01T00:00:00Z"
  }
]
```

### Accept Friend Request

**Endpoint:** `PUT /api/Friends/requests/{requestId}/accept`  
**Authorization:** Student Only

**Path Parameters:**
- `requestId` (integer) - Friend request ID

**Response:** `200 OK`
```json
{
  "message": "Friend request accepted successfully"
}
```

### Reject Friend Request

**Endpoint:** `PUT /api/Friends/requests/{requestId}/reject`  
**Authorization:** Student Only

**Path Parameters:**
- `requestId` (integer) - Friend request ID

**Response:** `200 OK`
```json
{
  "message": "Friend request rejected successfully"
}
```

### Remove Friend

**Endpoint:** `DELETE /api/Friends/{friendId}`  
**Authorization:** Student Only

**Path Parameters:**
- `friendId` (integer) - Friend's student ID

**Response:** `200 OK`
```json
{
  "message": "Friend removed successfully"
}
```

## Statistics

### Get User Statistics

**Endpoint:** `GET /api/Statistics/user`  
**Authorization:** Student or Admin

**Response:** `200 OK`
```json
{
  "email": "string",
  "fullName": "string",
  "rank": 0,
  "matchesPlayed": 0,
  "winRate": 0.0,
  "problemsCompleted": 0,
  "totalScore": 0,
  "lastActivity": "2024-01-01T00:00:00Z"
}
```

### Get Leaderboard

**Endpoint:** `GET /api/Statistics/leaderboard`  
**Authorization:** Student or Admin

**Response:** `200 OK`
```json
[
  {
    "rank": 1,
    "participantEmail": "string",
    "fullName": "string",
    "totalScore": 0,
    "problemsCompleted": 0,
    "matchesPlayed": 0,
    "winRate": 0.0,
    "lastSubmission": "2024-01-01T00:00:00Z"
  }
]
```

## SignalR Hubs

### Chat Hub

**URL:** `/chatHub`  
**Authorization:** Bearer Token Required

#### Hub Methods (Client to Server)

##### Join Conversation
**Method:** `JoinConversation(string conversationId)`

##### Leave Conversation
**Method:** `LeaveConversation(string conversationId)`

##### Send Message
**Method:** `SendMessage(string conversationId, string content)`

#### Hub Events (Server to Client)

##### New Message
**Event:** `NewMessage`
```json
{
  "messageId": 0,
  "conversationId": 0,
  "senderEmail": "string",
  "senderName": "string",
  "content": "string",
  "sentAt": "2024-01-01T00:00:00Z"
}
```

### Match Hub

**URL:** `/matchHub`  
**Authorization:** Bearer Token Required

#### Hub Methods (Client to Server)

##### Join Lobby
**Method:** `JoinLobby(string lobbyId)`

##### Leave Lobby
**Method:** `LeaveLobby(string lobbyId)`

#### Hub Events (Server to Client)

##### Lobby Updated
**Event:** `LobbyUpdated`
```json
{
  "content": "string"
}
```

##### Lobby Created
**Event:** `LobbyCreated`
```json
{
  "messageId": 0
}
```

##### Lobby Deleted
**Event:** `LobbyDeleted`

##### Match Started
**Event:** `MatchStarted`
```json
{
  "friendEmail": "string",
  "friendId": 0
}
```

**Response:** `200 OK`
```json
{
  "conversationId": 0,
  "type": "Friend",
  "name": "string",
  "participantEmails": ["user1@example.com", "user2@example.com"]
}
```

## Friends

### Get Friends

**Endpoint:** `GET /api/Friends`  
**Authorization:** Student Only

**Response:** `200 OK`
```json
[
  {
    "studentId": 0,
    "firstName": "string",
    "lastName": "string",
    "email": "string",
    "isOnline": true
  }
]
```

### Search Students

**Endpoint:** `GET /api/Friends/search`  
**Authorization:** Student Only

**Query Parameters:**
- `query` (string, required) - Search term for student name or email

**Response:** `200 OK`
```json
[
  {
    "studentId": 0,
    "firstName": "string",
    "lastName": "string",
    "email": "string",
    "isFriend": false,
    "hasPendingRequest": false
  }
]
```

### Send Friend Request

**Endpoint:** `POST /api/Friends/request`  
**Authorization:** Student Only

**Request Body:**
```json
{
  "receiverId": 0
}
```

```json
{
  "message": "Message content cannot be empty"
}
```

```json
{
  "message": "Cannot send friend request to yourself"
}
```

```json
{
  "message": "You can only chat with friends"
}
```

### 401 Unauthorized
```json
{
  "requestId": 0,
  "message": "Friend request sent successfully"
}
```

### Get Received Friend Requests

**Endpoint:** `GET /api/Friends/requests/received`  
**Authorization:** Student Only

**Response:** `200 OK`
```json
[
  {
    "requestId": 0,
    "senderId": 0,
    "senderName": "string",
    "senderEmail": "string",
    "sentAt": "2024-01-01T00:00:00Z",
    "status": "Pending"
  }
]
```

### Get Sent Friend Requests

**Endpoint:** `GET /api/Friends/requests/sent`  
**Authorization:** Student Only

**Response:** `200 OK`
```json
[
  {
    "requestId": 0,
    "receiverId": 0,
    "receiverName": "string",
    "receiverEmail": "string",
    "sentAt": "2024-01-01T00:00:00Z",
    "status": "Pending"
  }
]
```

### Accept Friend Request

**Endpoint:** `PUT /api/Friends/requests/{requestId}/accept`  
**Authorization:** Student Only

**Response:** `200 OK`
```json
{
  "message": "Friend request accepted successfully"
}
```

### Reject Friend Request

**Endpoint:** `PUT /api/Friends/requests/{requestId}/reject`  
**Authorization:** Student Only

**Response:** `200 OK`
```json
{
  "message": "Friend request rejected successfully"
}
```

### Remove Friend

**Endpoint:** `DELETE /api/Friends/{friendId}`  
**Authorization:** Student Only

**Response:** `200 OK`
```json
{
  "message": "Friend removed successfully"
}
```

## Statistics

### Get User Statistics

**Endpoint:** `GET /api/Statistics/user`  
**Authorization:** Student or Admin

**Response:** `200 OK`
```json
{
  "rank": 0,
  "matchesPlayed": 0,
  "matchesWon": 0,
  "winRate": 0.0,
  "totalScore": 0,
  "averageScore": 0.0,
  "problemsSolved": 0,
  "favoriteCategory": "string"
}
```

```json
{
  "message": "Not a participant in this conversation"
}
```

### 404 Not Found
```json
{
  "lobbyId": 0,
  "name": "string",
  "currentPlayers": 0,
  "maxPlayers": 0,
  "status": "string"
}
```

```json
{
  "message": "Friend request not found"
}
```

### 413 Payload Too Large
```json
{
  "lobbyId": 0,
  "name": "string",
  "hostEmail": "string",
  "lobbyCode": "string"
}
```

**Event:** `LobbyDeleted`

**Event:** `MatchStarted`
```json
{
  "matchId": 0,
  "problemIds": [1, 2, 3],
  "startAtUtc": "2024-01-01T00:00:00Z",
  "durationSec": 3600,
  "sentAtUtc": "2024-01-01T00:00:00Z"
}
```

#### Chat Events
**Event:** `NewMessage`
```json
{
  "messageId": 0,
  "conversationId": 0,
  "senderEmail": "string",
  "senderName": "string",
  "content": "string",
  "sentAt": "2024-01-01T00:00:00Z"
}
```

```json
{
  "message": "Failed to get user statistics",
  "error": "[error details]"
}
```

```json
{
  "message": "Failed to send message: [details]"
}
```

# RideConnect Chat Feature - API Contract & Frontend Guide

## 📋 Overview

The RideConnect chat feature enables real-time communication between drivers and passengers for a specific ride/trip. Messages are persisted to the database and delivered via WebSocket for instant communication.

---

## 🔐 Authentication

All endpoints (REST and WebSocket) require JWT authentication.

**Header Format:**
```
Authorization: Bearer <JWT_TOKEN>
```

---

## 🔌 WebSocket API

### Connection Endpoint

**URL:** `/ws-chat`

**Connection Type:** SockJS + STOMP

**Authentication:** JWT token must be sent in the `Authorization` header during the CONNECT frame.

### Subscribe Destinations

#### 1. User Message Queue (Personal Messages)
```
Destination: /user/queue/messages
```

**Description:** Each user subscribes to their personal queue to receive messages sent to them.

**Message Format (Received):**
```json
{
  "id": 123,
  "tripId": "100",
  "senderId": "45",
  "recipientId": "67",
  "content": "I'm 5 minutes away!",
  "timestamp": "2026-01-15T20:30:45.123"
}
```

### Send Destinations

#### 1. Send Private Message
```
Destination: /app/chat.sendPrivateMessage
```

**Message Format (Send):**
```json
{
  "tripId": "100",
  "senderId": "45",
  "recipientId": "67",
  "content": "Hello! Are you ready?"
}
```

**Response:** The message is saved to the database and broadcast to both sender and recipient via their `/user/queue/messages` subscription.

**Response Format:**
```json
{
  "id": 123,
  "tripId": "100",
  "senderId": "45",
  "recipientId": "67",
  "content": "Hello! Are you ready?",
  "timestamp": "2026-01-15T20:30:45.123"
}
```

---

## 🌐 REST API

### 1. Get Chat History

Retrieve all messages for a specific ride/trip.

**Endpoint:** `GET /api/chat/history/{tripId}`

**Path Parameters:**
- `tripId` (string, required): The ID of the ride/trip

**Headers:**
```
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json
```

**Success Response:**
- **Status Code:** `200 OK`
- **Response Body:**
```json
[
  {
    "id": 1,
    "tripId": "100",
    "senderId": "45",
    "recipientId": "67",
    "content": "Hello! Are you ready?",
    "timestamp": "2026-01-15T20:25:30.123"
  },
  {
    "id": 2,
    "tripId": "100",
    "senderId": "67",
    "recipientId": "45",
    "content": "Yes, I'll be there in 2 minutes!",
    "timestamp": "2026-01-15T20:26:15.456"
  },
  {
    "id": 3,
    "tripId": "100",
    "senderId": "45",
    "recipientId": "67",
    "content": "Great! I'm at the pickup point.",
    "timestamp": "2026-01-15T20:28:20.789"
  }
]
```

**Error Responses:**

**Unauthorized Access:**
- **Status Code:** `403 Forbidden`
- **Response Body:**
```json
{
  "error": "AccessDeniedException",
  "message": "You are not authorized to view this chat."
}
```

**Ride Not Found:**
- **Status Code:** `404 Not Found`
- **Response Body:**
```json
{
  "error": "RuntimeException",
  "message": "Ride not found"
}
```

**User Not Authenticated:**
- **Status Code:** `401 Unauthorized`
- **Response Body:**
```json
{
  "error": "Unauthorized",
  "message": "User not found"
}
```

---

## 📊 Data Models

### ChatMessage Entity

```json
{
  "id": "Long (Auto-generated)",
  "tripId": "String (Required) - The ride/trip ID",
  "senderId": "String (Required) - User ID of sender",
  "recipientId": "String (Required) - User ID of recipient",
  "content": "String (Required, TEXT) - Message content",
  "timestamp": "LocalDateTime (Auto-generated) - Creation timestamp"
}
```

### Field Constraints
- `tripId`: Cannot be null, indexed for performance
- `senderId`: Cannot be null
- `recipientId`: Cannot be null
- `content`: Text field (no length limit)
- `timestamp`: Auto-generated on creation, immutable

---

## 🔒 Security & Authorization

### Access Control Rules

1. **WebSocket Connection:**
   - Requires valid JWT token in Authorization header
   - User's identity is extracted from token

2. **Send Message:**
   - Any authenticated user can send a message
   - Validation should ensure `senderId` matches authenticated user

3. **Receive Message:**
   - Users only receive messages where they are the `recipientId`
   - Messages are routed to personal queues

4. **Chat History:**
   - Only accessible to users who are participants in the ride:
     - The driver of the ride
     - Passengers with confirmed (non-cancelled) bookings
   - Returns `403 Forbidden` for unauthorized users

---

## 🎨 Frontend Implementation Guide

### 1. Technology Stack Recommendations

**WebSocket Libraries:**
- **JavaScript/TypeScript:** `sockjs-client` + `@stomp/stompjs`
- **React Native:** `react-native-stomp`

### 2. Connection Setup

#### JavaScript/React Example

```javascript
import SockJS from 'sockjs-client';
import { Client } from '@stomp/stompjs';

class ChatService {
  constructor(jwtToken) {
    this.jwtToken = jwtToken;
    this.stompClient = null;
    this.connected = false;
  }

  connect(onMessageReceived) {
    const socket = new SockJS('http://your-backend-url/ws-chat');
    
    this.stompClient = new Client({
      webSocketFactory: () => socket,
      connectHeaders: {
        Authorization: `Bearer ${this.jwtToken}`
      },
      onConnect: () => {
        console.log('Connected to WebSocket');
        this.connected = true;
        
        // Subscribe to personal message queue
        this.stompClient.subscribe('/user/queue/messages', (message) => {
          const chatMessage = JSON.parse(message.body);
          onMessageReceived(chatMessage);
        });
      },
      onStompError: (frame) => {
        console.error('STOMP error:', frame);
      }
    });

    this.stompClient.activate();
  }

  sendMessage(tripId, senderId, recipientId, content) {
    if (this.connected) {
      const message = {
        tripId: tripId,
        senderId: senderId,
        recipientId: recipientId,
        content: content
      };

      this.stompClient.publish({
        destination: '/app/chat.sendPrivateMessage',
        body: JSON.stringify(message)
      });
    }
  }

  disconnect() {
    if (this.stompClient) {
      this.stompClient.deactivate();
      this.connected = false;
    }
  }
}

export default ChatService;
```

### 3. Fetch Chat History

```javascript
async function fetchChatHistory(tripId, jwtToken) {
  try {
    const response = await fetch(`http://your-backend-url/api/chat/history/${tripId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${jwtToken}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const messages = await response.json();
    return messages;
  } catch (error) {
    console.error('Failed to fetch chat history:', error);
    throw error;
  }
}
```

### 4. Complete React Component Example

```jsx
import React, { useState, useEffect, useRef } from 'react';
import ChatService from './ChatService';

function ChatComponent({ tripId, currentUserId, recipientId, jwtToken }) {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const chatService = useRef(null);

  useEffect(() => {
    // 1. Fetch chat history
    loadChatHistory();

    // 2. Connect to WebSocket
    chatService.current = new ChatService(jwtToken);
    chatService.current.connect((newMessage) => {
      // Add new message to state
      setMessages(prev => [...prev, newMessage]);
    });

    // Cleanup on unmount
    return () => {
      chatService.current?.disconnect();
    };
  }, [tripId, jwtToken]);

  async function loadChatHistory() {
    try {
      setLoading(true);
      const history = await fetchChatHistory(tripId, jwtToken);
      setMessages(history);
    } catch (error) {
      console.error('Failed to load chat history:', error);
    } finally {
      setLoading(false);
    }
  }

  function handleSendMessage() {
    if (inputMessage.trim() && chatService.current) {
      chatService.current.sendMessage(
        tripId,
        currentUserId,
        recipientId,
        inputMessage
      );
      setInputMessage('');
    }
  }

  return (
    <div className="chat-container">
      <div className="messages-list">
        {loading ? (
          <p>Loading messages...</p>
        ) : (
          messages.map((msg) => (
            <div 
              key={msg.id} 
              className={msg.senderId === currentUserId ? 'message-sent' : 'message-received'}
            >
              <div className="message-content">{msg.content}</div>
              <div className="message-time">
                {new Date(msg.timestamp).toLocaleTimeString()}
              </div>
            </div>
          ))
        )}
      </div>
      
      <div className="message-input">
        <input
          type="text"
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
          placeholder="Type a message..."
        />
        <button onClick={handleSendMessage}>Send</button>
      </div>
    </div>
  );
}

async function fetchChatHistory(tripId, jwtToken) {
  const response = await fetch(`http://your-backend-url/api/chat/history/${tripId}`, {
    headers: {
      'Authorization': `Bearer ${jwtToken}`,
      'Content-Type': 'application/json'
    }
  });
  return response.json();
}

export default ChatComponent;
```

---

## 💡 UI/UX Best Practices

### 1. Chat Screen Layout

```
┌─────────────────────────────────┐
│  [Back] Driver Name       [•]   │ ← Header (shows online status)
├─────────────────────────────────┤
│                                 │
│  ┌─────────────────┐            │ ← Received message (left-aligned)
│  │ Hey, I'm here!  │            │
│  │ 2:30 PM         │            │
│  └─────────────────┘            │
│                                 │
│            ┌─────────────────┐  │ ← Sent message (right-aligned)
│            │ Great! Coming   │  │
│            │ down now        │  │
│            │ 2:31 PM    ✓✓   │  │
│            └─────────────────┘  │
│                                 │
├─────────────────────────────────┤
│ [Type a message...]      [Send] │ ← Input area
└─────────────────────────────────┘
```

### 2. User Experience Features

**Essential:**
- ✅ Auto-scroll to latest message
- ✅ Display message timestamps
- ✅ Visual distinction between sent/received messages
- ✅ Loading indicator for history fetch
- ✅ Connection status indicator
- ✅ Empty state ("No messages yet")

**Recommended:**
- ✅ Read receipts (✓✓ for delivered)
- ✅ Online/offline status
- ✅ "User is typing..." indicator
- ✅ Message delivery confirmation
- ✅ Retry failed messages
- ✅ Character count/limit
- ✅ Send button disabled when input empty

**Nice to Have:**
- 📎 File/image attachments
- 📍 Location sharing
- 🔔 Push notifications for new messages
- 🔍 Search within chat
- ⭐ Pin important messages

### 3. User Flow

**Opening Chat:**
```
1. User opens ride details
2. Clicks "Chat with Driver/Passenger"
3. App fetches chat history (REST API)
4. App establishes WebSocket connection
5. Chat screen displays with history
6. Real-time messages start flowing
```

**Sending Message:**
```
1. User types message
2. Clicks Send
3. Message sent via WebSocket
4. Optimistically add to UI
5. Receive confirmation from server
6. Update message status (✓✓)
```

**Receiving Message:**
```
1. Message arrives via WebSocket
2. Add to messages list
3. Auto-scroll to bottom
4. Show notification if app backgrounded
5. Play sound (optional)
```

---

## 🎯 Key Business Rules

### 1. Message Accessibility
- Messages are scoped to a specific `tripId`
- Only ride participants can view/send messages
- Chat history persists even after ride completion

### 2. Ride Status Handling
- **Active Rides:** Full chat functionality enabled
- **Completed Rides:** Chat is read-only (disable input, show history)
- **Cancelled Rides:** Passengers with cancelled bookings cannot access chat

### 3. User Identity
- `senderId` must match authenticated user's ID
- `recipientId` is the other participant (driver or passenger)
- For rides with multiple passengers, each has a separate 1:1 chat with driver

---

## 🧪 Testing Scenarios

### REST API Testing

**Test Case 1: Successful History Retrieval**
```bash
curl -X GET \
  http://localhost:8080/api/chat/history/100 \
  -H 'Authorization: Bearer YOUR_JWT_TOKEN'
```

**Expected:** 200 OK with array of messages

**Test Case 2: Unauthorized Access**
```bash
# User not part of ride
curl -X GET \
  http://localhost:8080/api/chat/history/999 \
  -H 'Authorization: Bearer UNAUTHORIZED_USER_TOKEN'
```

**Expected:** 403 Forbidden

### WebSocket Testing

Use a STOMP client tool or write integration tests to:
1. Connect with valid JWT
2. Subscribe to `/user/queue/messages`
3. Send message to `/app/chat.sendPrivateMessage`
4. Verify message received on both sender and recipient queues

---

## 📱 Mobile Considerations

### Android/iOS Specific
- Handle app backgrounding (pause/resume WebSocket)
- Implement reconnection logic
- Use persistent storage for offline messages
- Integrate with push notification services
- Handle network changes gracefully

### Sample Reconnection Logic
```javascript
let reconnectAttempts = 0;
const MAX_RECONNECT_ATTEMPTS = 5;

function connectWithRetry() {
  chatService.connect(
    onMessageReceived,
    onError: () => {
      if (reconnectAttempts < MAX_RECONNECT_ATTEMPTS) {
        reconnectAttempts++;
        setTimeout(() => connectWithRetry(), 2000 * reconnectAttempts);
      }
    }
  );
}
```

---

## 🐛 Error Handling Guide

### Frontend Error Scenarios

| Error | Cause | Solution |
|-------|-------|----------|
| WebSocket Connection Failed | Invalid JWT or network issue | Verify token, check network, retry connection |
| 403 on History Fetch | User not participant | Show error: "You don't have access to this chat" |
| 404 on History Fetch | Invalid tripId | Show error: "Ride not found" |
| Message Send Failure | Disconnected or server error | Queue message locally, retry when connected |
| Token Expired | JWT expired | Refresh token, reconnect |

### Backend Error Responses

All errors follow this format:
```json
{
  "error": "ExceptionType",
  "message": "Human-readable error message",
  "timestamp": "2026-01-15T20:30:45.123"
}
```

---

## 🚀 Performance Optimization



### Frontend
- ✅ Virtual scrolling for long chat histories
- ✅ Lazy load older messages (pagination)
- ✅ Debounce "typing" indicators
- ✅ Compress images before sending
- ✅ Connection pooling for REST requests

---


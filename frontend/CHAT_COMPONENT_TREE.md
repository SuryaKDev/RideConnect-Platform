# 🌳 RideConnect Chat - Component Tree & Data Flow

## Component Hierarchy

```
App
├── AuthProvider (Context)
│   └── ChatProvider (Context)
│       └── Router
│           ├── NotificationToast
│           └── Routes
│               ├── Home
│               ├── Login
│               ├── Register
│               ├── Profile
│               ├── PassengerDashboard
│               │   └── Can use ChatButton
│               ├── MyBookings
│               │   └── Can use ChatButton
│               ├── DriverDashboard
│               │   └── Can use ChatButton
│               ├── DriverHistory
│               │   └── Can use ChatButton
│               └── ChatPage
│                   ├── Header (back button, user info)
│                   └── ChatWindow
│                       ├── ConnectionStatus
│                       ├── MessageList
│                       │   └── ChatBubble (multiple)
│                       └── ChatInput
```

## Chat Component Breakdown

```
ChatButton Component
├── Props: tripId, otherUser, rideInfo, variant, label
├── State: isChatOpen
└── Renders:
    ├── Button element
    └── ChatModal (when open)
        ├── Modal overlay
        ├── Modal header
        │   ├── User avatar
        │   ├── User name
        │   ├── Ride info
        │   └── Close button
        └── ChatWindow
            ├── ConnectionStatus
            ├── Messages container
            │   └── ChatBubble (for each message)
            │       ├── Avatar
            │       ├── Message content
            │       ├── Timestamp
            │       └── Status icon
            └── ChatInput
                ├── Textarea
                ├── Character count
                └── Send button
```

## Data Flow Diagram

```
┌──────────────────────────────────────────────────────────────┐
│                    User Action                                │
│         (Opens chat / Sends message / Receives message)       │
└───────────────────────────┬──────────────────────────────────┘
                            │
                            ▼
┌──────────────────────────────────────────────────────────────┐
│                    ChatButton Component                       │
│  • User clicks "Chat with Driver"                            │
│  • Opens ChatModal with tripId & otherUser                   │
└───────────────────────────┬──────────────────────────────────┘
                            │
                            ▼
┌──────────────────────────────────────────────────────────────┐
│                      ChatModal                                │
│  • Fetches chat history from REST API                        │
│  • Calls initializeChatSession()                             │
└───────────────────────────┬──────────────────────────────────┘
                            │
                            ▼
┌──────────────────────────────────────────────────────────────┐
│                    ChatContext                                │
│  • Stores messages in activeChatSessions Map                 │
│  • Manages unread counts                                     │
│  • Handles WebSocket messages                                │
└─────────┬───────────────────────────────┬────────────────────┘
          │                               │
          ▼                               ▼
┌─────────────────────┐         ┌─────────────────────┐
│   ChatService       │         │   REST API          │
│   (WebSocket)       │         │   (Chat History)    │
│                     │         │                     │
│ • Connect to WS     │         │ • GET /api/chat/    │
│ • Subscribe to      │         │   history/{tripId}  │
│   /user/queue/      │         │                     │
│   messages          │         │ • Returns array of  │
│ • Publish to        │         │   messages          │
│   /app/chat.send    │         │                     │
│   PrivateMessage    │         └─────────────────────┘
│                     │
│ • Auto-reconnect    │
│ • Queue messages    │
└──────────┬──────────┘
           │
           ▼
┌──────────────────────────────────────────────────────────────┐
│                     Backend Server                            │
│  • WebSocket endpoint: /ws-chat                              │
│  • REST endpoint: /api/chat/history/{tripId}                 │
│  • Stores messages in database                               │
│  • Routes messages to recipients                             │
└──────────────────────────────────────────────────────────────┘
```

## Message Flow

### Sending a Message

```
User types message
    │
    ▼
ChatInput captures text
    │
    ▼
User clicks Send button
    │
    ▼
onSendMessage() callback
    │
    ▼
ChatContext.sendMessage()
    │
    ├─── Optimistic update (add to UI immediately)
    │    • Message shows with "sending" status
    │    • Appears in chat window instantly
    │
    ├─── ChatService.sendMessage()
    │    • Publishes to /app/chat.sendPrivateMessage
    │    • Sends via WebSocket
    │
    └─── Backend processes & broadcasts
         │
         ├─── Message saved to database
         │
         └─── Broadcast to both users
              • Sender gets confirmation
              • Recipient gets new message
              │
              ▼
         WebSocket message received
              │
              ▼
         ChatService.onMessageReceived
              │
              ▼
         ChatContext updates state
              │
              ▼
         Components re-render
              │
              ▼
         Message appears with "sent" status ✓✓
```

### Receiving a Message

```
Another user sends message
    │
    ▼
Backend broadcasts to /user/queue/messages
    │
    ▼
WebSocket receives message
    │
    ▼
ChatService.onMessageReceived callback
    │
    ▼
ChatContext.handleIncomingMessage()
    │
    ├─── Update activeChatSessions
    │    • Add message to session
    │
    ├─── Update unreadCounts
    │    • Increment if chat not focused
    │
    └─── Trigger re-render
         │
         ▼
ChatWindow updates
    │
    ├─── New ChatBubble added
    ├─── Auto-scroll to bottom
    └─── Show notification badge
```

## State Management Flow

```
┌─────────────────────────────────────────────────────────────┐
│                      ChatContext State                       │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  activeChatSessions: Map<tripId, {                          │
│    tripId: string,                                          │
│    messages: Message[],                                     │
│    otherUser: { id, name },                                 │
│    lastMessage: Message,                                    │
│    lastMessageTime: Date,                                   │
│    isActive: boolean                                        │
│  }>                                                         │
│                                                              │
│  unreadCounts: Map<tripId, number>                          │
│                                                              │
│  connectionStatus: 'connected' | 'disconnected' |           │
│                    'reconnecting' | 'failed'                │
│                                                              │
└─────────────────────────────────────────────────────────────┘
         │
         │ Provides via Context
         ▼
┌─────────────────────────────────────────────────────────────┐
│              Components using useChat()                      │
├─────────────────────────────────────────────────────────────┤
│  • ChatButton - triggers modal                              │
│  • ChatModal - displays chat in overlay                     │
│  • ChatWindow - shows messages & input                      │
│  • ChatPage - full page view                                │
│  • Any component - can show unread badges                   │
└─────────────────────────────────────────────────────────────┘
```

## Connection Lifecycle

```
1. APP STARTS
   └─> AuthProvider initializes
       └─> User authenticates
           └─> ChatProvider initializes
               └─> Checks if user.token exists
                   │
                   ▼
                   YES → Initialize WebSocket
                   │
                   └─> ChatService.connect(token)
                       │
                       ├─> Create SockJS connection
                       ├─> Create STOMP client
                       ├─> Send Authorization header
                       └─> Activate connection
                           │
                           ▼
                       ON CONNECT
                       │
                       ├─> Subscribe to /user/queue/messages
                       ├─> Set connected = true
                       ├─> Notify listeners: 'connected'
                       └─> Process queued messages
                           │
                           ▼
                       READY FOR MESSAGING

2. USER OPENS CHAT
   └─> Click ChatButton
       └─> ChatModal opens
           └─> Fetch chat history (REST)
           └─> initializeChatSession()
               └─> Store messages in context
                   └─> Chat ready to use

3. CONNECTION LOST
   └─> WebSocket disconnected
       └─> onWebSocketClose() triggered
           │
           ├─> Set connected = false
           ├─> Notify: 'disconnected'
           └─> Attempt reconnection
               │
               └─> Retry 1 (2s delay)
                   │
                   └─> Retry 2 (4s delay)
                       │
                       └─> Retry 3 (6s delay)
                           │
                           └─> ... up to 5 attempts
                               │
                               ├─> SUCCESS → reconnect
                               └─> FAILURE → show error

4. USER LOGS OUT
   └─> AuthContext.logout()
       └─> ChatService.disconnect()
           │
           ├─> Unsubscribe from all
           ├─> Deactivate STOMP client
           ├─> Clear message queue
           └─> Reset connection state
```

## Props Flow Example

```
DriverDashboard
│
├── activeRide = {
│     id: "123",
│     passengerId: "456",
│     passengerName: "John Doe",
│     pickupLocation: "123 Main St",
│     destination: "456 Oak Ave"
│   }
│
└── Renders:
    │
    <ChatButton
      tripId={activeRide.id}                    // "123"
      otherUser={{
        id: activeRide.passengerId,             // "456"
        name: activeRide.passengerName          // "John Doe"
      }}
      rideInfo={{
        from: activeRide.pickupLocation,        // "123 Main St"
        to: activeRide.destination              // "456 Oak Ave"
      }}
      variant="primary"
      label="Chat with Passenger"
    />
    │
    └── ChatButton Internal:
        │
        ├── Sets state: isChatOpen = true
        │
        └── Renders:
            │
            <ChatModal
              isOpen={true}
              onClose={handleClose}
              tripId="123"
              otherUser={{ id: "456", name: "John Doe" }}
              rideInfo={{ from: "123 Main St", to: "456 Oak Ave" }}
            />
            │
            └── ChatModal Internal:
                │
                ├── Fetches: fetchChatHistory("123")
                │
                ├── Calls: initializeChatSession("123", messages, otherUser)
                │
                └── Renders:
                    │
                    <ChatWindow
                      messages={getMessages("123")}
                      currentUserId={user.id}
                      otherUser={{ id: "456", name: "John Doe" }}
                      onSendMessage={handleSend}
                      connectionStatus={connectionStatus}
                    />
                    │
                    └── ChatWindow Internal:
                        │
                        ├── Maps messages → ChatBubble components
                        │
                        └── Renders:
                            │
                            ├── ConnectionStatus
                            │
                            ├── messages.map(msg =>
                            │     <ChatBubble
                            │       message={msg}
                            │       isOwnMessage={msg.senderId === user.id}
                            │       otherUserName="John Doe"
                            │     />
                            │   )
                            │
                            └── <ChatInput
                                  onSendMessage={async (content) => {
                                    await sendMessage("123", "456", content)
                                  }}
                                />
```

## Context API Structure

```
┌────────────────────────────────────────────────────────────┐
│                     AuthContext                             │
├────────────────────────────────────────────────────────────┤
│  State:                                                     │
│    • user: { id, token, role, name, email, isVerified }   │
│    • loading: boolean                                      │
│                                                            │
│  Methods:                                                  │
│    • login(token, role, name, email, isVerified)          │
│    • logout()                                              │
│    • updateUser(updates)                                   │
└────────────────────────────────────────────────────────────┘
                              │
                              │ Provides user data
                              ▼
┌────────────────────────────────────────────────────────────┐
│                     ChatContext                             │
├────────────────────────────────────────────────────────────┤
│  State:                                                     │
│    • activeChatSessions: Map                               │
│    • connectionStatus: string                              │
│    • unreadCounts: Map                                     │
│                                                            │
│  Methods:                                                  │
│    • initializeChatSession(tripId, messages, otherUser)   │
│    • sendMessage(tripId, recipientId, content)            │
│    • getMessages(tripId)                                   │
│    • getUnreadCount(tripId)                                │
│    • getTotalUnreadCount()                                 │
│    • markAsRead(tripId)                                    │
│    • closeChatSession(tripId)                              │
│                                                            │
│  Uses:                                                     │
│    • user.token from AuthContext                           │
│    • user.id from AuthContext                              │
└────────────────────────────────────────────────────────────┘
                              │
                              │ Used by
                              ▼
                    All Chat Components
```

## Event Flow Timeline

```
Time  Event                                    Component/Service
─────────────────────────────────────────────────────────────────
0ms   User opens chat                         ChatButton
10ms  Fetch history API call                  ChatModal
200ms History received                        ChatModal
210ms Initialize session                      ChatContext
220ms Render messages                         ChatWindow
─────────────────────────────────────────────────────────────────
1000ms User types message                     ChatInput
1500ms User clicks Send                       ChatInput
1510ms Optimistic update                      ChatContext
1520ms Message appears (sending...)           ChatBubble
1525ms WebSocket send                         ChatService
1600ms Backend processes                      Server
1650ms Message saved to DB                    Server
1700ms Broadcast to recipients                Server
1750ms WebSocket receives confirmation        ChatService
1760ms Update message status (sent)           ChatContext
1770ms Re-render with checkmark               ChatBubble
─────────────────────────────────────────────────────────────────
2000ms Other user receives message            ChatService
2010ms Update session & unread count          ChatContext
2020ms Render new message                     ChatBubble
2030ms Auto-scroll to bottom                  ChatWindow
```

---

## Key Takeaways

1. **Centralized State**: ChatContext manages all chat state globally
2. **Service Layer**: ChatService handles WebSocket complexity
3. **Reusable Components**: ChatButton works anywhere with just props
4. **Optimistic Updates**: UI feels instant with optimistic rendering
5. **Error Recovery**: Auto-reconnection ensures reliability
6. **Clean Separation**: Presentation, logic, and state are separated

This architecture ensures:
- 🎯 Easy integration
- 🔄 Reliable messaging
- ⚡ Fast UI updates
- 🛠️ Maintainable code
- 📈 Scalable structure

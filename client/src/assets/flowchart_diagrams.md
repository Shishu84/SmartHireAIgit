# SmartHireAI System Flowcharts

Here are the visual flowchart diagrams representing the different system architectures.

## 1. Overall System Architecture Flow

```mermaid
graph TD
    %% Entities
    Client[React Frontend / Vite]
    Express[Express.js Server]
    DB[(MongoDB)]

    %% Connections
    Client <-->|REST API Requests <br> Axios| Express
    
    subgraph Backend Server
        Express --> Auth[Auth Controller]
        Express --> User[User Controller]
        Express --> Resume[Resume Controller]
        Express --> Payment[Payment Controller]
        Express --> Interview[Interview Controller]
        
        Auth <--> DB
        User <--> DB
        Resume <--> DB
        Payment <--> DB
        Interview <--> DB
    end
```

## 2. Real-Time Avatar Interview Flow

```mermaid
sequenceDiagram
    autonumber
    participant Candidate as User
    participant Frontend as React Client
    participant Backend as Node.js Socket Server
    participant DB as MongoDB
    participant AI as OpenRouter Service

    Candidate->>Frontend: Joins Interview Room
    Frontend->>Backend: Connect via Socket.io
    Backend-->>Frontend: Connection Established
    
    Candidate->>Frontend: Speaks (Mic Input)
    Frontend->>Backend: Streams Transcript (Web Speech API)
    
    Backend->>DB: Fetch Interview Context/History
    DB-->>Backend: Return Context
    
    Backend->>AI: Sends prompt with context
    AI-->>Backend: Returns AI Response (Text)
    
    Backend-->>Frontend: Emits AI Response (WebSocket)
    Frontend->>Candidate: Renders Avatar Lip-sync & TTS
```

## 3. Resume Analysis Pipeline

```mermaid
graph TD
    User[User] -->|Uploads PDF/Doc| Client[React Frontend]
    Client -->|POST multipart/form-data| Server[Express Router]
    
    subgraph Server-Side Processing
        Server --> Multer[Multer Middleware]
        Multer -->|Saves file temporarily| Parser{Document Parser}
        
        Parser -->|PDF| PDFParse[pdf-parse]
        Parser -->|DOCX| Mammoth[mammoth]
        Parser -->|Image| Tesseract[tesseract.js]
        
        PDFParse --> Text[Extracted Raw Text]
        Mammoth --> Text
        Tesseract --> Text
        
        Text --> AIService[openRouter.service.js]
        AIService -->|Sends to LLM| OpenRouter[OpenRouter API]
        OpenRouter -->|Returns JSON insights| AIService
    end
    
    AIService --> Controller[Resume Controller]
    Controller --> DB[(MongoDB)]
    Controller -->|Returns Analysis Data| Client
    Client --> Display[Render Charts & Score]
```

## 4. Authentication Flow

```mermaid
sequenceDiagram
    participant User
    participant Client
    participant Server
    participant DB
    
    User->>Client: Enters Credentials
    Client->>Server: POST /api/auth/login
    Server->>DB: Find User by Email
    DB-->>Server: User Record
    
    alt Invalid Credentials
        Server-->>Client: 401 Unauthorized
    else Valid Credentials
        Server->>Server: Validate Password (bcrypt)
        Server->>Server: Generate JWT Token
        Server-->>Client: 200 OK + JWT Cookie / Token
        Client->>Client: Store User in Redux State
        Client->>User: Redirect to Dashboard
    end
    
    User->>Client: Visits Protected Route
    Client->>Server: GET /api/user/profile (with Token)
    Server->>Server: isAuth.js Middleware Validates Token
    Server-->>Client: Return Secure Data
```

# SmartHire AI - Entity Relationship Diagram (ERD)

This document outlines the MongoDB collections, their schemas, and the relationships between them for the SmartHire AI application.

## Entity Relationship Diagram

```mermaid
erDiagram
    USER ||--o{ INTERVIEW : "has many"
    USER ||--|| CHAT : "has one"
    USER ||--o{ PAYMENT : "has many"
    USER ||--o{ RESUME_ANALYSIS : "has many"

    USER {
        ObjectId _id PK
        String name
        String email "unique"
        Number credits "default: 500000"
        String profilePhoto
        String[] skills
        String experience
        Object socials "linkedin, github, portfolio"
        String activeResumeUrl
        Date createdAt
        Date updatedAt
    }

    INTERVIEW {
        ObjectId _id PK
        ObjectId userId FK "ref: User"
        String role
        String experience
        String mode "HR, Technical"
        String resumeText
        Object[] questions
        Number finalScore
        String status "Incompleted, completed"
        String aiRecommendation "Selected, Improvement Needed"
        Number codingScore
        Object aiFeedback
        Date createdAt
        Date updatedAt
    }

    CHAT {
        ObjectId _id PK
        ObjectId userId FK "ref: User, unique"
        Object profile
        Object[] messages
        Date createdAt
        Date updatedAt
    }

    PAYMENT {
        ObjectId _id PK
        ObjectId userId FK "ref: User"
        String planId
        Number amount
        Number credits
        String razorpayOrderId
        String razorpayPaymentId
        String status "created, paid, failed"
        Date createdAt
        Date updatedAt
    }

    RESUME_ANALYSIS {
        ObjectId _id PK
        ObjectId userId FK "ref: User"
        String role
        String experience
        Number atsScore
        String summary
        String bestRole
        String[] skills
        String[] strengths
        String[] weakness
        String[] suggestions
        String experienceAnalysis
        String fileName
        Date createdAt
        Date updatedAt
    }

    CONTACT {
        ObjectId _id PK
        String name
        String email
        String category
        String subject
        String message
        String status "pending, resolved"
        Date createdAt
        Date updatedAt
    }
```

## Collections Breakdown

### 1. User
The core entity representing an authenticated user on the platform.
*   **Relationships**:
    *   One-to-Many with **Interview**
    *   One-to-One with **Chat** (persistent thread per user)
    *   One-to-Many with **Payment**
    *   One-to-Many with **ResumeAnalysis**

### 2. Interview
Represents an AI interview session taken by a user.
*   **Relationships**:
    *   Many-to-One with **User** (via `userId`)
*   **Key Fields**:
    *   `questions`: Array of sub-documents containing the question, answer, difficulty, time limit, and detailed scoring (score, confidence, communication, correctness).
    *   `aiFeedback`: Structured object containing overall feedback, technical/behavioral feedback, strengths, improvements, and actionable suggestions.

### 3. Chat
Stores the persistent conversational history and context for the AI Assistant.
*   **Relationships**:
    *   One-to-One with **User** (via `userId`)
*   **Key Fields**:
    *   `messages`: Array of message sub-documents containing role (`user`, `assistant`, `system`) and content.
    *   `profile`: Cached context (role, experience, skills, resume summary) used for personalized responses.

### 4. Payment
Records transactions for purchasing credits or plans via Razorpay.
*   **Relationships**:
    *   Many-to-One with **User** (via `userId`)
*   **Key Fields**:
    *   Stores `razorpayOrderId` and `razorpayPaymentId` for payment gateway reconciliation.

### 5. ResumeAnalysis
Stores the results of AI-powered resume parsing and ATS scoring.
*   **Relationships**:
    *   Many-to-One with **User** (via `userId`)
*   **Key Fields**:
    *   `atsScore`: The calculated ATS compatibility score.
    *   Detailed arrays for `skills`, `strengths`, `weakness`, and `suggestions`.

### 6. Contact
Stores support inquiries and messages sent via the contact form.
*   **Relationships**:
    *   Independent collection (no explicit foreign keys).

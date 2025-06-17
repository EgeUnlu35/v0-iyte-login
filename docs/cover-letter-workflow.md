# Cover Letter Workflow Documentation

This document describes the complete cover letter signing workflow in the GMS (Graduation Management System).

## Overview

The cover letter workflow involves three main roles that must sign cover letters in sequence:

- Department Chair - Initial review and signing
- Faculty Secretary - Middle-tier review and signing
- Student Affairs - Final review and signing

## Workflow Stages

### Stage 1: Department Chair

- **Endpoint**: GET /api/department-chair/cover-letters
- **Description**: Get all cover letters ready for department chair review
- **Status Required**: COMPLETED
- **Stage Required**: PENDING_DEPARTMENT_CHAIR
- **Action**: POST /api/department-chair/cover-letters/{id}/sign
- **Next Stage**: PENDING_FACULTY_SECRETARY

### Stage 2: Faculty Secretary

- **Endpoint**: GET /api/faculty-secretary/cover-letters
- **Description**: Get all cover letters pending faculty secretary signature from department chairs
- **Status Required**: COMPLETED
- **Stage Required**: PENDING_FACULTY_SECRETARY
- **Prerequisites**: Must be signed by department chair
- **Action**: POST /api/faculty-secretary/cover-letters/{id}/sign
- **Next Stage**: PENDING_STUDENT_AFFAIRS

### Stage 3: Student Affairs (Final)

- **Endpoint**: GET /api/student-affairs/cover-letters
- **Description**: Get all cover letters pending student affairs signature from faculty secretaries
- **Status Required**: COMPLETED
- **Stage Required**: PENDING_STUDENT_AFFAIRS
- **Prerequisites**: Must be signed by both department chair and faculty secretary
- **Action**: POST /api/student-affairs/cover-letters/{id}/sign
- **Final Stage**: FULLY_SIGNED

## API Endpoints

### Department Chair Endpoints

```
GET    /api/department-chair/cover-letters          # List pending cover letters
GET    /api/department-chair/cover-letters/{id}     # Get specific cover letter
POST   /api/department-chair/cover-letters/{id}/sign # Sign cover letter
```

### Faculty Secretary Endpoints

```
GET    /api/faculty-secretary/cover-letters          # List pending cover letters from dept chairs
GET    /api/faculty-secretary/cover-letters/{id}     # Get specific cover letter
POST   /api/faculty-secretary/cover-letters/{id}/sign # Sign cover letter
```

### Student Affairs Endpoints

```
GET    /api/student-affairs/cover-letters            # List pending cover letters from faculties
GET    /api/student-affairs/cover-letters/{id}       # Get specific cover letter
POST   /api/student-affairs/cover-letters/{id}/sign  # Sign cover letter (final)
```

## Database Schema

### CoverLetter Model

```prisma
model CoverLetter {
  id                String            @id @default(uuid()) @db.Uuid
  stage             CoverLetterStage  @default(GENERATED)

  // Department Chair signing
  departmentChairSigned    Boolean   @default(false)
  departmentChairSignedBy  String?   @db.Uuid
  departmentChairSignedAt  DateTime?

  // Faculty Secretary signing
  facultySecretary         Boolean   @default(false)
  facultySecretarySignedBy String?   @db.Uuid
  facultySecretarySignedAt DateTime?

  // Student Affairs signing
  studentAffairsSigned     Boolean   @default(false)
  studentAffairsSignedBy   String?   @db.Uuid
  studentAffairsSignedAt   DateTime?

  // Overall completion status
  isFullySigned   Boolean   @default(false)
  completedAt     DateTime?

  graduationEntry   GraduationEntry @relation(fields: [graduationEntryId], references: [id])
  graduationEntryId String          @unique @db.Uuid
}
```

### CoverLetterStage Enum

```prisma
enum CoverLetterStage {
  GENERATED
  PENDING_DEPARTMENT_CHAIR
  PENDING_FACULTY_SECRETARY
  PENDING_STUDENT_AFFAIRS
  FULLY_SIGNED
}
```

## Authentication & Authorization

All endpoints require:

- **Authentication**: Bearer JWT token
- **Authorization**: Specific role permissions
  - Department Chair endpoints: DEPARTMENT_CHAIR role
  - Faculty Secretary endpoints: FACULTY_SECRETARY role
  - Student Affairs endpoints: STUDENT_AFFAIRS role

## Example Workflow

### 1. Department Chair Signs

```bash
# Get pending cover letters
curl -H "Authorization: Bearer {token}" \
  GET /api/department-chair/cover-letters

# Sign a specific cover letter
curl -H "Authorization: Bearer {token}" \
  -X POST /api/department-chair/cover-letters/{id}/sign
```

### 2. Faculty Secretary Signs

```bash
# Get cover letters from department chairs
curl -H "Authorization: Bearer {token}" \
  GET /api/faculty-secretary/cover-letters

# Sign the cover letter
curl -H "Authorization: Bearer {token}" \
  -X POST /api/faculty-secretary/cover-letters/{id}/sign
```

### 3. Student Affairs Signs (Final)

```bash
# Get cover letters from faculty secretaries
curl -H "Authorization: Bearer {token}" \
  GET /api/student-affairs/cover-letters

# Final signature
curl -H "Authorization: Bearer {token}" \
  -X POST /api/student-affairs/cover-letters/{id}/sign
```

## Response Formats

### Cover Letter List Response

```json
{
  "coverLetters": [
    {
      "id": "uuid",
      "studentId": "20221001",
      "studentName": "John",
      "studentLastName": "Doe",
      "gpa": 3.75,
      "graduationDate": "2024-06-15T00:00:00.000Z",
      "department": "Computer Engineering",
      "creditsEarned": 240,
      "coverLetter": {
        "id": "uuid",
        "stage": "PENDING_FACULTY_SECRETARY",
        "departmentChairSigned": true,
        "departmentChairSignedAt": "2024-06-01T10:30:00.000Z",
        "facultySecretary": false,
        "facultySecretarySignedAt": null,
        "studentAffairsSigned": false,
        "studentAffairsSignedAt": null,
        "isFullySigned": false,
        "completedAt": null
      }
    }
  ],
  "total": 1
}
```

### Sign Response

```json
{
  "message": "Cover letter signed successfully and forwarded to Student Affairs",
  "entry": {
    // ... cover letter details with updated signature info
  }
}
```

## Error Handling

Common error scenarios:

- 401 Unauthorized: Missing or invalid JWT token
- 403 Forbidden: Insufficient role permissions
- 404 Not Found: Cover letter not found
- 400 Bad Request: Validation errors (e.g., already signed, wrong stage, prerequisites not met)

## Filter Options

All list endpoints support optional department filtering:

```
GET /api/{role}/cover-letters?department=Computer%20Engineering
```

This helps users focus on cover letters from specific departments when dealing with multiple departments.

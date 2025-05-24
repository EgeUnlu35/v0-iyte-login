## 2.2 Product Functions

The Automated Graduation Management System (AGMS) is designed to streamline and optimize graduation-related processes for students, advisors, and administrative staff. The main functions of the system include:

### Student

- **Submit Graduation Application:** Submit an application for graduation through the system.
- **Check Graduation Status:** View the current status of their submitted graduation application.
- **Resolve Application Issues:** Address issues related to the graduation application, such as missing documents or incorrect details.

### Advisor

- **Decide on Graduation Applications:** Approve or reject submitted graduation applications after review. (Backend yapıldı)
- **Correct and Update Student Info:** Edit student information to ensure records are accurate. (furkan backend yapılacak)

### Department Secretary

- **Import and Export Graduation Data:** Transfer student graduation data into or out of the system as needed.
- **Submit Graduation Documents:** Provide finalized graduation documents to relevant authorities.
- **Correct Graduation Issues:** Address errors or discrepancies in graduation records.
- **Receive Approved Graduation Forms:** Collect approved graduation forms from advisors or department chairs.
- **Rank Students by GPA:** Generate a ranking of graduating students based on their GPA.
- **Prepare Cover Letter for Graduation Forms:** Draft and finalize cover letters to accompany graduation forms.
- **Import Undergraduate Curriculum:** Add or update the department's undergraduate curriculum in the system.
- **Submit Ranked List to Faculty Secretary:** Share the ranked list of students with the faculty secretary.
- **Update Student Record:** Modify student records to reflect updates, such as approved graduation status.

### Department Chair

- **Sign Cover Letters and Send Them Back to the Department Secretary:** Review and sign prepared cover letters, returning them to the department secretary for further processing.

### Faculty Secretary

- **Inform Department Secretary About Not Approved Graduations:** Notify department secretaries of graduations that were not approved.
- **Request Graduation Decision from Department Secretaries:** Collect graduation decisions from department secretaries for faculty-level processing.
- **Send Graduation Decision to Faculties:** Submit finalized graduation decisions to the faculties.
- **Check If Cover Letters Sent by Departments:** Monitor if cover letters have been sent by departments and follow up if necessary.
- **Combine Graduating Students from Departments:** Consolidate a unified list of graduating students from all departments.
- **Rank and Decide Top 3 of the Faculty:** Determine the top three students from the faculty based on GPA or other criteria.
- **Send Transcripts, Cover Letters, Forms to Dean:** Forward required documents, including transcripts and cover letters, to the dean for approval.
- **Send Documents Approved by Dean to Student Affairs:** Pass documents signed by the dean to the student affairs office.
- **Inform Graduated Students:** Notify students of their successful graduation.

### Student Affairs

- **Rank the Students Among the University:** Rank graduating students at the university level based on performance or other criteria.
- **Initiate and Request Graduation Decision from Faculties:** Prompt faculties to submit their graduation decisions.
- **Check If Cover Letters Sent by Faculties:** Monitor and ensure faculties have sent required cover letters.
- **Answer the Students' Questions:** Respond to inquiries from students regarding graduation processes.
- **Update Student Record:** Modify records to reflect approved graduation statuses.

## 2.3 User Characteristics

The Automated Graduation Management System (AGMS) is designed for a diverse set of users, each with varying levels of technical expertise and responsibilities. Below are the user types and their general characteristics:

Students:

Description: Undergraduate students who are applying for graduation.

Characteristics:

Basic computer literacy.

Familiarity with using online systems such as UBYS.

Expected to interact with the system occasionally during the graduation process.

Advisors (Instructors):

Description: Faculty members responsible for reviewing and approving student applications.

Characteristics:

Moderate IT skills.

Familiarity with academic policies and curriculum requirements.

Regular interaction with the system during application review periods.

Department Secretaries:

Description: Administrative staff managing department-level graduation workflows.

Characteristics:

High familiarity with academic processes and record management.

Regular and frequent interaction with the system for data entry, list management, and communication with advisors and students.

Department Chairs:

Description: Heads of academic departments who oversee and approve graduation processes at the department level.

Characteristics:

Familiar with department operations and student academic records.

Moderate IT skills.

Periodic interaction with the system for approvals and document signing.

Faculty Secretaries:

Description: Administrative staff responsible for managing faculty-wide graduation workflows.

Characteristics:

Proficient in managing data across multiple departments.

Familiar with academic policies and reporting requirements.

Frequent interaction with the system during peak graduation periods for consolidating data and preparing reports.

Dean's Office Staff:

Description: Administrative staff working at the faculty level, handling approvals and coordinating with faculty secretaries.

Characteristics:

Proficient in document review and record management.

Familiar with high-level graduation policies.

Moderate interaction with the system for document approval and reporting.

Student Affairs Staff:

Description: Staff responsible for university-wide graduation processes, including final approvals and student communication.

Characteristics:

High-level IT and administrative skills.

Familiar with university-wide academic regulations and policies.

Regular interaction with the system for ranking students and updating records.

Rectorate Staff:

Description: Senior officials responsible for signing digital diplomas and ensuring compliance with university standards.

Characteristics:

Minimal interaction with the system, focused on digital approvals.

Require secure access and role-specific functionalities.

## 2.4 Constraints

The system must meet the following constraints:

Regulatory Compliance: Adhere to university data protection policies. Test by security audits and penetration testing.

Language Support: Provide interfaces in Turkish and English. Test by verifying translations across all features.

Peak Load Handling: Support 1,000+ concurrent users during peak periods with response times <3 seconds. Test through load testing.

Availability: Ensure 99.9% uptime during academic terms, excluding maintenance. Test via uptime monitoring logs.

Data Backup: Perform automated backups every 24 hours. Test by checking system logs and backup files.

Security: Implement secure authentication and role-based access. Test by simulating unauthorized attempts.

Browser Compatibility: Support major browsers and mobile devices. Test through compatibility testing.

Audit Logging: Record all user actions for audits. Test by verifying logs after various operations.  
Actor:

Student

Description:

The student submits a graduation application by completing a form, uploading required documents (e.g., course completion forms, disengagement form etc.) and confirming submission.The system validates the application and notifies relevant parties for further processing.

Preconditions:

The student logs into the system.

The current date falls within the graduation application period.

Postconditions:

The graduation application is submitted and securely stored in the system.

A confirmation message with a reference number is sent to the student.

The student's advisor is notified of the pending graduation application.

Priority:

It has high priority.

Frequency of Use:

Typically, once per student per degree program. However, students who cannot graduate on their initial application may reapply during subsequent graduation periods.

Normal Course of Events:

Student selects "Apply for Graduation" option

System displays graduation application form

Student fills in required information

Student uploads any required documents (e.g., course completion forms, disengagement form etc.)

System validates all required fields

Student confirms submission

System saves application and generates confirmation number

System notifies the advisor about the pending application for review.

Alternative Courses:

1.1.AC.1 - Student saves application as draft:

Student saves partially completed application

System stores draft for later completion

Student can return to complete application within deadline

Exceptions:

1.1.EX.1 - System Failure or Technical Issue:

Condition:
The system encounters a technical problem, such as a server error, data corruption, or unexpected behavior.

System Response:

Displays a generic error message: "An unexpected error occurred while processing your application. Please try again later."

Logs the error details in the system error logs for troubleshooting.

Provides the student with a support contact (e.g., IT Helpdesk or technical support team) for assistance.

If possible, retains any partially completed data to allow the student to resume the application process after the issue is resolved.

Includes:

Special Requirements:

Form must be accessible on mobile devices

Real-time field validation

Support document upload up to 10MB per file

The system must support multiple file formats for document uploads (PDF, DOCX, etc.)

Assumptions:

The student has a reliable internet connection.

The required documents are available in digital format.

The student's academic record is accurate and up-to-date.

Notes and Issues:

Define specific document requirements for international students.

Clarify the escalation process for technical issues during the application process.

Actor:

Student

Description:

Student monitors the progress of their graduation application through various approval stages and views any pending actions or issues that require attention.

Preconditions:

The student has submitted a graduation application.

The student's application is available in the system database.

Postconditions:

The student successfully views the current status of their graduation application.

The system logs a timestamp of the status check.

Any new notifications related to the application are marked as read.

Priority:

It has medium priority.

Frequency of Use:

Weekly or as needed.

Normal Course of Events:

The system displays the "Graduation Status" section.

The student clicks the section to view progress.

The system displays the current application status.

The student can navigate to view details about pending tasks.

System displays contact information for relevant department

Alternative Courses:

1.2.AC.1 - Application Rejected:

Condition:
The system detects that the student's graduation application has been rejected by one or more approving parties.

Alternative Sequence of Events:

The student accesses the "Graduation Status" section to view their application.

The system displays a rejection message, including:

The reasons for rejection.

Specific tasks or corrections required to address the rejection.

Relevant deadlines for resubmission or appeal.

The student is guided to a separate interface to take corrective actions, such as updating information or contacting the appropriate department for assistance.

Exceptions:

1.2.EX.1 - Failure to Retrieve Application Status:

Condition:
The system fails to fetch the student's graduation application status due to technical issues, such as a server error or connection problem.

System Response:

Displays an error message:
"We encountered an issue while retrieving your graduation application status. Please try again later."

Provides a link to technical support or a troubleshooting guide.

Logs the error for system administrators to review.

1.2.EX.2 - System Maintenance or Update in Progress:

Condition:
The system status is unavailable because it is undergoing maintenance or updates.

System Response:

Displays a notification message:
"The graduation status system is currently undergoing maintenance. Last updated on: [timestamp]."

Includes:

Special Requirements:

The system must provide real-time updates for any status changes.

Assumptions:

Application statuses are synced across departments.

Notes and Issues:

Clarify how the system handles conflicting or delayed updates from multiple departments.

Actor:

Student

Description:

Student addresses and resolves issues identified during the graduation application review process, including responding to department requests, updating information, and submitting additional documentation.

Preconditions:

Student has an active graduation application

Issues have been reported by reviewers

Student has received notification of issues

Postconditions:

All flagged issues are addressed and marked as resolved.

Required updates or documents are submitted.

The system updates the application status to reflect the resolution.

Reviewers are notified of the resolution.

Priority:

It has high priority.

Frequency of Use:

As needed during application process

Normal Course of Events:

Student receives issue notification

Student accesses "Application Issues" section

System displays list of pending issues with:

Issue description

Required actions

Deadline for resolution

Department contact information

Student selects issue to resolve

System provides appropriate resolution interface

Student submits required corrections/documents

System validates submissions

Student receives confirmation of submission

System notifies relevant department

Issue status updates to "Pending Review"

Alternative Courses:

1.3.AC.1 - Contact Support for Assistance:

Condition: The student cannot resolve the flagged issue independently due to unclear instructions or missing information.

Steps:

The student selects the "Contact Support" option in the "Application Issues" section.

The system displays support contact details and a messaging interface.

The student submits a query or request for assistance, including any relevant attachments or explanations.

The system sends the query to the support team and displays a confirmation message.

Support responds with guidance, enabling the student to proceed with resolving the issue.

Exceptions:

1.3.EX.2 - Unanticipated System Error:

Condition: A system error occurs during the resolution submission process.

Response:

Displays a general error message:
"An error occurred while processing your submission. Please try again later."

Logs the error for system administrators to review.

Provides options to contact technical support for further assistance.

Maintains the issue status as unresolved.

Includes:

Special Requirements:

Notifications must be sent to all relevant stakeholders upon issue resolution.

The system must validate document formats and completeness before submission.

Real-time updates for issue statuses must be visible to the student and reviewers.

Assumptions:

The flagged issues are actionable within the system.

All flagged issues are documented clearly with required actions specified.

Notes and Issues:

Provide detailed instructions or FAQs to assist students in resolving common issues.

## Swagger API Definition

```typescript
import swaggerJSDoc from "swagger-jsdoc";

const options: swaggerJSDoc.Options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "GMS Backend API",
      version: "1.0.0",
      description: "Graduation Management System Backend API Documentation",
      contact: {
        name: "GMS Team",
      },
    },
    servers: [
      {
        url: process.env.APP_URL || "http://localhost:5000",
        description: "Development server",
      },
    ],
    components: {
      securitySchemes: {
        BearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
          description:
            "Enter your JWT token obtained from /api/auth/login endpoint",
        },
      },
      schemas: {
        User: {
          type: "object",
          properties: {
            email: { type: "string", format: "email" },
            firstName: { type: "string" },
            lastName: { type: "string" },
            role: {
              type: "string",
              enum: [
                "STUDENT",
                "ADVISOR",
                "DEPARTMENT_SECRETARY",
                "DEPARTMENT_CHAIR",
                "FACULTY_SECRETARY",
                "STUDENT_AFFAIRS",
                "ADMIN",
              ],
            },
          },
          required: ["email", "role"],
        },
        RegisterRequest: {
          type: "object",
          properties: {
            email: { type: "string", format: "email" },
            password: { type: "string", minLength: 6 },
            firstName: { type: "string" },
            lastName: { type: "string" },
            role: {
              type: "string",
              enum: [
                "STUDENT",
                "ADVISOR",
                "DEPARTMENT_SECRETARY",
                "DEPARTMENT_CHAIR",
                "FACULTY_SECRETARY",
                "STUDENT_AFFAIRS",
                "ADMIN",
              ],
            },
            studentId: {
              type: "string",
              description: "Required for STUDENT role registration",
            },
          },
          required: ["email", "password", "role"],
        },
        LoginRequest: {
          type: "object",
          properties: {
            email: { type: "string", format: "email" },
            password: { type: "string" },
          },
          required: ["email", "password"],
        },
        AuthResponse: {
          type: "object",
          properties: {
            user: { $ref: "#/components/schemas/User" },
            token: {
              type: "object",
              properties: {
                token: { type: "string" },
                expiresIn: { type: "number" },
              },
            },
          },
        },
        GraduationApplication: {
          type: "object",
          properties: {
            id: { type: "string", format: "uuid" },
            studentId: { type: "string" },
            studentName: { type: "string" },
            studentLastName: { type: "string" },
            submissionDate: { type: "string", format: "date-time" },
            status: {
              type: "string",
              enum: [
                "PENDING",
                "UNDER_REVIEW",
                "APPROVED",
                "REJECTED",
                "RETURNED_FOR_REVISION",
              ],
            },
            gpaOverall: { type: "number", minimum: 0, maximum: 4 },
            departmentName: { type: "string" },
            reviewDate: { type: "string", format: "date-time" },
            feedback: { type: "string" },
            advisorId: { type: "string", format: "uuid" },
            departmentId: { type: "string" },
          },
        },
        GraduationApplicationSubmit: {
          type: "object",
          properties: {
            studentId: { type: "string" },
            gpaOverall: { type: "number", minimum: 0, maximum: 4 },
            departmentId: { type: "string" },
            departmentName: { type: "string" },
          },
          required: [
            "studentId",
            "gpaOverall",
            "departmentId",
            "departmentName",
          ],
        },
        ApplicationReview: {
          type: "object",
          properties: {
            applicationId: { type: "string", format: "uuid" },
            status: {
              type: "string",
              enum: [
                "PENDING",
                "UNDER_REVIEW",
                "APPROVED",
                "REJECTED",
                "RETURNED_FOR_REVISION",
              ],
            },
            feedback: { type: "string" },
          },
          required: ["applicationId", "status"],
        },
        GraduationList: {
          type: "object",
          properties: {
            id: { type: "string", format: "uuid" },
            name: { type: "string" },
            description: { type: "string" },
            entries: {
              type: "array",
              items: { $ref: "#/components/schemas/GraduationEntry" },
            },
          },
        },
        GraduationEntry: {
          type: "object",
          properties: {
            id: { type: "string", format: "uuid" },
            studentId: { type: "string" },
            studentName: { type: "string" },
            studentLastName: { type: "string" },
            gpa: { type: "number", minimum: 0, maximum: 4 },
            graduationDate: { type: "string", format: "date" },
            department: { type: "string" },
            creditsEarned: { type: "number", minimum: 0 },
            status: {
              type: "string",
              enum: [
                "NEW",
                "UNDER_REVIEW",
                "PENDING_ISSUES",
                "APPROVED",
                "REJECTED",
                "COMPLETED",
              ],
            },
            notes: { type: "string" },
          },
        },
        ImportValidationResult: {
          type: "object",
          properties: {
            isValid: { type: "boolean" },
            errors: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  row: { type: "number" },
                  errors: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        field: { type: "string" },
                        message: { type: "string" },
                      },
                    },
                  },
                },
              },
            },
            validEntries: {
              type: "array",
              items: { $ref: "#/components/schemas/GraduationEntry" },
            },
            summary: {
              type: "object",
              properties: {
                total: { type: "number" },
                valid: { type: "number" },
                invalid: { type: "number" },
              },
            },
          },
        },
        Error: {
          type: "object",
          properties: {
            message: { type: "string" },
            errors: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  field: { type: "string" },
                  message: { type: "string" },
                },
              },
            },
          },
        },
        CoverLetterData: {
          type: "object",
          properties: {
            studentId: { type: "string" },
            studentName: { type: "string" },
            studentLastName: { type: "string" },
            gpa: { type: "number", minimum: 0, maximum: 4 },
            graduationDate: { type: "string", format: "date-time" },
            department: { type: "string" },
            creditsEarned: { type: "number", minimum: 0 },
            status: {
              type: "string",
              enum: [
                "NEW",
                "UNDER_REVIEW",
                "PENDING_ISSUES",
                "APPROVED",
                "REJECTED",
                "COMPLETED",
              ],
            },
            notes: { type: "string" },
          },
        },
        GenerateCoverLetterRequest: {
          type: "object",
          properties: {
            notes: {
              type: "string",
              description: "Additional notes for the cover letter",
              minLength: 1,
            },
          },
          required: ["notes"],
        },
        CoverLetterResponse: {
          type: "object",
          properties: {
            message: { type: "string" },
            entry: { $ref: "#/components/schemas/GraduationEntry" },
          },
        },
        AllowedUser: {
          type: "object",
          properties: {
            id: { type: "integer" },
            email: { type: "string", format: "email" },
            role: {
              type: "string",
              enum: [
                "STUDENT",
                "ADVISOR",
                "DEPARTMENT_SECRETARY",
                "DEPARTMENT_CHAIR",
                "FACULTY_SECRETARY",
                "STUDENT_AFFAIRS",
                "ADMIN",
              ],
            },
            studentId: {
              type: "string",
              description: "Required for STUDENT role",
            },
            createdAt: { type: "string", format: "date-time" },
            updatedAt: { type: "string", format: "date-time" },
          },
          required: ["email", "role"],
        },
        AllowedUserUpload: {
          type: "object",
          properties: {
            message: { type: "string" },
            totalProcessed: { type: "number" },
            created: { type: "number" },
          },
        },
        AllowedUserUploadError: {
          type: "object",
          properties: {
            error: { type: "string" },
            details: { type: "string" },
          },
        },
      },
    },
  },
  apis: ["./src/routes/*.ts"], // Path to the API docs
};

export const swaggerSpec = swaggerJSDoc(options);
```

</rewritten_file>

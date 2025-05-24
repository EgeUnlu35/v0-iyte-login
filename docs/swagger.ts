import swaggerJSDoc from 'swagger-jsdoc';

const options: swaggerJSDoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'GMS Backend API',
      version: '1.0.0',
      description: 'Graduation Management System Backend API Documentation',
      contact: {
        name: 'GMS Team',
      },
    },
    servers: [
      {
        url: 'http://51.21.202.179:5000/',
        description: 'Development server',
      },
    ],
    components: {
      securitySchemes: {
        BearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Enter your JWT token obtained from /api/auth/login endpoint'
        },
      },
      schemas: {
        User: {
          type: 'object',
          properties: {
            email: { type: 'string', format: 'email' },
            firstName: { type: 'string' },
            lastName: { type: 'string' },
            role: {
              type: 'string',
              enum: ['STUDENT', 'ADVISOR', 'DEPARTMENT_SECRETARY', 'DEPARTMENT_CHAIR', 'FACULTY_SECRETARY', 'STUDENT_AFFAIRS', 'ADMIN']
            },
          },
          required: ['email', 'role'],
        },
        RegisterRequest: {
          type: 'object',
          properties: {
            email: { type: 'string', format: 'email' },
            password: { type: 'string', minLength: 6 },
            firstName: { type: 'string' },
            lastName: { type: 'string' },
            role: {
              type: 'string',
              enum: ['STUDENT', 'ADVISOR', 'DEPARTMENT_SECRETARY', 'DEPARTMENT_CHAIR', 'FACULTY_SECRETARY', 'STUDENT_AFFAIRS', 'ADMIN']
            },
            studentId: {
              type: 'string',
              description: 'Required for STUDENT role registration'
            },
          },
          required: ['email', 'password', 'role'],
        },
        LoginRequest: {
          type: 'object',
          properties: {
            email: { type: 'string', format: 'email' },
            password: { type: 'string' },
          },
          required: ['email', 'password'],
        },
        AuthResponse: {
          type: 'object',
          properties: {
            user: { $ref: '#/components/schemas/User' },
            token: {
              type: 'object',
              properties: {
                token: { type: 'string' },
                expiresIn: { type: 'number' },
              },
            },
          },
        },
        GraduationApplication: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            studentId: { type: 'string' },
            studentName: { type: 'string' },
            studentLastName: { type: 'string' },
            submissionDate: { type: 'string', format: 'date-time' },
            status: {
              type: 'string',
              enum: ['PENDING', 'UNDER_REVIEW', 'APPROVED', 'REJECTED', 'RETURNED_FOR_REVISION']
            },
            gpaOverall: { type: 'number', minimum: 0, maximum: 4 },
            departmentName: { type: 'string' },
            reviewDate: { type: 'string', format: 'date-time' },
            feedback: { type: 'string' },
            advisorId: { type: 'string', format: 'uuid' },
            departmentId: { type: 'string' },
          },
        },
        GraduationApplicationSubmit: {
          type: 'object',
          properties: {
            studentId: { type: 'string' },
            gpaOverall: { type: 'number', minimum: 0, maximum: 4 },
            departmentId: { type: 'string' },
            departmentName: { type: 'string' },
          },
          required: ['studentId', 'gpaOverall', 'departmentId', 'departmentName'],
        },
        ApplicationReview: {
          type: 'object',
          properties: {
            applicationId: { type: 'string', format: 'uuid' },
            status: {
              type: 'string',
              enum: ['PENDING', 'UNDER_REVIEW', 'APPROVED', 'REJECTED', 'RETURNED_FOR_REVISION']
            },
            feedback: { type: 'string' },
          },
          required: ['applicationId', 'status'],
        },
        GraduationList: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            name: { type: 'string' },
            description: { type: 'string' },
            entries: {
              type: 'array',
              items: { $ref: '#/components/schemas/GraduationEntry' },
            },
          },
        },
        GraduationEntry: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            studentId: { type: 'string' },
            studentName: { type: 'string' },
            studentLastName: { type: 'string' },
            gpa: { type: 'number', minimum: 0, maximum: 4 },
            graduationDate: { type: 'string', format: 'date' },
            department: { type: 'string' },
            creditsEarned: { type: 'number', minimum: 0 },
            status: {
              type: 'string',
              enum: ['NEW', 'UNDER_REVIEW', 'PENDING_ISSUES', 'APPROVED', 'REJECTED', 'COMPLETED']
            },
            notes: { type: 'string' },
          },
        },
        ImportValidationResult: {
          type: 'object',
          properties: {
            isValid: { type: 'boolean' },
            errors: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  row: { type: 'number' },
                  errors: {
                    type: 'array',
                    items: {
                      type: 'object',
                      properties: {
                        field: { type: 'string' },
                        message: { type: 'string' },
                      },
                    },
                  },
                },
              },
            },
            validEntries: {
              type: 'array',
              items: { $ref: '#/components/schemas/GraduationEntry' },
            },
            summary: {
              type: 'object',
              properties: {
                total: { type: 'number' },
                valid: { type: 'number' },
                invalid: { type: 'number' },
              },
            },
          },
        },
        Error: {
          type: 'object',
          properties: {
            message: { type: 'string' },
            errors: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  field: { type: 'string' },
                  message: { type: 'string' },
                },
              },
            },
          },
        },
        CoverLetterData: {
          type: 'object',
          properties: {
            studentId: { type: 'string' },
            studentName: { type: 'string' },
            studentLastName: { type: 'string' },
            gpa: { type: 'number', minimum: 0, maximum: 4 },
            graduationDate: { type: 'string', format: 'date-time' },
            department: { type: 'string' },
            creditsEarned: { type: 'number', minimum: 0 },
            status: {
              type: 'string',
              enum: ['NEW', 'UNDER_REVIEW', 'PENDING_ISSUES', 'APPROVED', 'REJECTED', 'COMPLETED']
            },
            notes: { type: 'string' },
          },
        },
        GenerateCoverLetterRequest: {
          type: 'object',
          properties: {
            notes: {
              type: 'string',
              description: 'Additional notes for the cover letter',
              minLength: 1
            },
          },
          required: ['notes'],
        },
        CoverLetterResponse: {
          type: 'object',
          properties: {
            message: { type: 'string' },
            entry: { $ref: '#/components/schemas/GraduationEntry' },
          },
        },
        AllowedUser: {
          type: 'object',
          properties: {
            id: { type: 'integer' },
            email: { type: 'string', format: 'email' },
            role: {
              type: 'string',
              enum: ['STUDENT', 'ADVISOR', 'DEPARTMENT_SECRETARY', 'DEPARTMENT_CHAIR', 'FACULTY_SECRETARY', 'STUDENT_AFFAIRS', 'ADMIN']
            },
            studentId: {
              type: 'string',
              description: 'Required for STUDENT role'
            },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
          required: ['email', 'role'],
        },
        AllowedUserUpload: {
          type: 'object',
          properties: {
            message: { type: 'string' },
            totalProcessed: { type: 'number' },
            created: { type: 'number' },
          },
        },
        AllowedUserUploadError: {
          type: 'object',
          properties: {
            error: { type: 'string' },
            details: { type: 'string' },
          },
        },
      },
    },
  },
  apis: ['./src/routes/*.ts'], // Path to the API docs
};

export const swaggerSpec = swaggerJSDoc(options); 
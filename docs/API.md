# EduGuard AI API Documentation

## Base URL
```
http://localhost:8000/api/v1
```

## Authentication
All endpoints require Bearer token authentication except `/auth/login` and `/auth/register`.

```bash
Authorization: Bearer <your_access_token>
```

## Endpoints

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/auth/register` | Register new user |
| POST | `/auth/login` | Login and get token |
| GET | `/auth/me` | Get current user |

### Students
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/students/` | List all students |
| GET | `/students/{id}` | Get student details |
| POST | `/students/` | Create student |

### Risk Assessment
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/risk/` | List risk assessments |
| GET | `/risk/student/{id}/latest` | Get latest assessment |
| POST | `/risk/` | Create assessment |
| GET | `/risk/dashboard/stats` | Dashboard statistics |

### Interventions
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/interventions/` | List interventions |
| POST | `/interventions/` | Create intervention |
| PATCH | `/interventions/{id}/status` | Update status |

### Quizzes
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/quizzes/` | List quizzes |
| GET | `/quizzes/{id}` | Get quiz details |
| POST | `/quizzes/` | Create quiz |
| GET | `/quizzes/{id}/submissions` | Get submissions |
| GET | `/quizzes/{id}/analytics` | Quiz analytics |

### Notifications
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/notifications/` | List notifications |
| POST | `/notifications/` | Create notification |
| PATCH | `/notifications/{id}/read` | Mark as read |

### Analytics
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/analytics/overview` | Overview stats |
| GET | `/analytics/department` | Department analytics |
| GET | `/analytics/trends` | Trend data |

## Response Codes
- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `404` - Not Found
- `500` - Server Error

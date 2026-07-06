# Event Scheduler API

A simple RESTful API for managing events — create, view, update, delete, and automatically clean up expired events. Built with Node.js and Express, using JSON file-based storage (no database required).

This project was built solo as a learning exercise, following strict layered architecture: **routes → services → utilities**, with no direct file access from route handlers.

## Features

- Full CRUD for events (title, date, time, description)
- Input validation with detailed error messages
- Bulk cleanup of expired events via a dedicated endpoint
- Clean separation of concerns: routes handle HTTP, services handle business logic, utilities handle file I/O and validation
- JSON file persistence — no database setup needed

## Tech Stack

- **Runtime:** Node.js
- **Framework:** Express
- **Module system:** ES Modules (`import`/`export`)
- **Storage:** JSON file (`data/events.json`)

## Project Structure

```
event-scheduler/
├── data/
│   └── events.json          # Persisted event data
├── routes/
│   └── events.js             # HTTP endpoints — request/response only
├── services/
│   └── eventService.js       # Business logic — CRUD + expired cleanup
├── utils/
│   ├── fileHelper.js          # Read/write data/events.json
│   └── validate.js            # Validation rules for event data
├── index.js                   # App entry point
├── package.json
└── README.md
```

## Getting Started

### Prerequisites

- Node.js installed (v18+ recommended)

### Installation

```bash
git clone https://github.com/samstar001/event-scheduler.git
cd event-scheduler
npm install
```

### Running the server

```bash
node index.js
```

You should see:

```
The server is running on http://localhost:3000
```

## Event Data Model

| Field         | Type   | Required | Format                     |
|---------------|--------|----------|-----------------------------|
| `id`          | number | auto-generated | — |
| `title`       | string | ✅ yes   | non-empty text              |
| `date`        | string | ✅ yes   | `YYYY-MM-DD`                |
| `time`        | string | ✅ yes   | `HH:MM` (24-hour)            |
| `description` | string | optional | any text (defaults to `""`) |

## API Endpoints

### 1. Get all events

```
GET /events
```

**Example:**

```bash
curl http://localhost:3000/events
```

**Response — `200 OK`:**

```json
[
  {
    "id": 1,
    "title": "Team Meeting",
    "date": "2026-08-15",
    "time": "14:30",
    "description": "Weekly sync"
  }
]
```

---

### 2. Get a single event by ID

```
GET /events/:id
```

**Example:**

```bash
curl http://localhost:3000/events/1
```

**Response — `200 OK`:**

```json
{
  "id": 1,
  "title": "Team Meeting",
  "date": "2026-08-15",
  "time": "14:30",
  "description": "Weekly sync"
}
```

**Response — `404 Not Found`** (invalid or missing ID):

```json
{ "message": "Event with ID 999 not found" }
```

---

### 3. Create a new event

```
POST /events
```

**Example:**

```bash
curl -X POST http://localhost:3000/events \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Team Meeting",
    "date": "2026-08-15",
    "time": "14:30",
    "description": "Weekly sync"
  }'
```

**Response — `201 Created`:**

```json
{
  "id": 1,
  "title": "Team Meeting",
  "date": "2026-08-15",
  "time": "14:30",
  "description": "Weekly sync"
}
```

**Response — `400 Bad Request`** (validation failure — all errors returned at once):

```json
{
  "message": "Validation Failed",
  "details": [
    "Title is required and must be a non-empty text string.",
    "Date is required and must match the YYYY-MM-DD format.",
    "Time is required and must be in the HH:MM 24 hour format."
  ]
}
```

---

### 4. Update an event (partial or full)

```
PUT /events/:id
```

Only send the fields you want to change — untouched fields are preserved automatically.

**Example:**

```bash
curl -X PUT http://localhost:3000/events/1 \
  -H "Content-Type: application/json" \
  -d '{ "title": "Updated Team Meeting" }'
```

**Response — `200 OK`:**

```json
{
  "id": 1,
  "title": "Updated Team Meeting",
  "date": "2026-08-15",
  "time": "14:30",
  "description": "Weekly sync"
}
```

**Response — `404 Not Found`:**

```json
{ "message": "Event with ID 999 not found." }
```

**Response — `400 Bad Request`** (the resulting merged event fails validation):

```json
{
  "message": "Validation Failed",
  "details": ["Date is required and must match the YYYY-MM-DD format."]
}
```

---

### 5. Delete an event by ID

```
DELETE /events/:id
```

**Example:**

```bash
curl -X DELETE http://localhost:3000/events/1
```

**Response — `200 OK`:**

```json
{
  "message": "Event successfully deleted.",
  "event": {
    "id": 1,
    "title": "Updated Team Meeting",
    "date": "2026-08-15",
    "time": "14:30",
    "description": "Weekly sync"
  }
}
```

**Response — `404 Not Found`:**

```json
{ "message": "Event with ID 999 not found." }
```

---

### 6. Delete all expired events (bonus)

```
DELETE /events/expired
```

Removes every event whose combined date/time is earlier than the current moment.

**Example:**

```bash
curl -X DELETE http://localhost:3000/events/expired
```

**Response — `200 OK`:**

```json
{
  "message": "Cleanup completed.",
  "count": 1,
  "deletedEvents": [
    {
      "id": 2,
      "title": "Old Event",
      "date": "2025-01-01",
      "time": "10:00",
      "description": ""
    }
  ]
}
```

> **Note:** This route is registered *before* `DELETE /events/:id` in `routes/events.js`. If the order were reversed, Express would match `/expired` as if `"expired"` were an `:id` value, since route params match any string.

## Error Handling

The API follows standard HTTP status code conventions:

| Status | Meaning                                          |
|--------|---------------------------------------------------|
| `200`  | Request succeeded                                  |
| `201`  | Resource created successfully                       |
| `400`  | Client sent invalid data (validation failure)       |
| `404`  | Requested resource does not exist                   |
| `500`  | Unexpected server error                             |

Validation errors always return a `details` array listing **every** problem found with the submitted data, rather than stopping at the first error.

## Testing

All endpoints were manually tested with Postman, covering both happy paths and edge cases (missing fields, malformed dates/times, non-existent IDs).

## Architecture Notes

- **Routes** (`routes/events.js`) only handle HTTP concerns — parsing requests, setting status codes, shaping responses. They contain no business logic.
- **Services** (`services/eventService.js`) contain all business logic — validation, ID generation, merging updates, filtering expired events. They know nothing about `req`/`res`.
- **Utilities** (`utils/`) handle low-level concerns: reading/writing the JSON file, and validating raw event data shape.
- Errors are thrown from the service layer with attached properties (`statusCode`, `details`) that the route layer reads to decide the correct HTTP response — keeping error-to-HTTP-code translation isolated to one place.

## Author

Built by [Samstar](https://github.com/samstar001) as a solo learning project — Computer Engineering student, Federal University of Technology, Minna (FUTMinna).
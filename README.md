# Campus Equipment Booking API

Backend REST API for booking campus shared equipment, built with TypeScript, Hono, and SQLite.

## How to Run

1. Install dependencies:
   ```bash
   npm install

## Test Evidence Summary

Base URL: `http://localhost:8787/api`

1. **GET Equipment (200 OK)**
   - Request: `GET /api/equipment`
   - Response: `[{"id":"eq-1","name":"Projector A","location":"Building 1"},{"id":"eq-2","name":"Camera Sony A7","location":"Media Lab Room 2"}]`

2. **POST Booking (201 Created)**
   - Request: `POST /api/bookings` with valid payload
   - Response: Booking object created with ID `7aac0511-4adc-44b2-aade-1f480e7a3cd6`

3. **POST Booking Conflict (409 Conflict)**
   - Request: `POST /api/bookings` with overlapping time window (10:00–12:00 vs 09:00–11:00)
   - Response: `{"error":"Booking time conflicts with an existing reservation for this equipment"}`

4. **POST Invalid Date Order (400 Bad Request)**
   - Request: `POST /api/bookings` with `startAt` (15:00) >= `endAt` (13:00)
   - Response: `{"error":"startAt must be earlier than endAt"}`

5. **GET Not Found (404 Not Found)**
   - Request: `GET /api/bookings/unknown-id-999`
   - Response: `{"error":"Booking not found"}`

6. **DELETE Booking (204 No Content)**
   - Request: `DELETE /api/bookings/7aac0511-4adc-44b2-aade-1f480e7a3cd6`
   - Response: Empty body, status 204
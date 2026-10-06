# API Contract: Campus Equipment Booking API

Base URL: `http://localhost:8787/api`

## Data Model & Schema (ERD)

### 1. `equipment` Table
- `id` (TEXT, PRIMARY KEY): รหัสอุปกรณ์ เช่น `eq-1`
- `name` (TEXT, NOT NULL): ชื่ออุปกรณ์
- `location` (TEXT, NOT NULL): สถานที่จัดเก็บ

### 2. `bookings` Table
- `id` (TEXT, PRIMARY KEY): รหัสการจอง (UUID)
- `equipmentId` (TEXT, NOT NULL, FOREIGN KEY references equipment.id)
- `borrowerName` (TEXT, NOT NULL): ชื่อผู้จอง
- `startAt` (TEXT, NOT NULL): วัน-เวลาเริ่มต้น (ISO 8601)
- `endAt` (TEXT, NOT NULL): วัน-เวลาสิ้นสุด (ISO 8601)
- `purpose` (TEXT, NOT NULL): วัตถุประสงค์
- `createdAt` (TEXT, DEFAULT CURRENT_TIMESTAMP)

---

## Endpoints Specification

### 1. Equipment
- **GET `/api/equipment`**
  - **Success:** `200 OK`
  - **Response:**
    ```json
    [
      { "id": "eq-1", "name": "Projector A", "location": "Building 1" },
      { "id": "eq-2", "name": "Camera Sony A7", "location": "Media Lab Room 2" }
    ]
    ```

### 2. Bookings
- **GET `/api/bookings`**
  - **Success:** `200 OK` (Array of bookings)
- **GET `/api/bookings/:id`**
  - **Success:** `200 OK`
  - **Error:** `404 Not Found` -> `{"error": "Booking not found"}`
- **POST `/api/bookings`**
  - **Success:** `201 Created`
  - **Payload:**
    ```json
    {
      "equipmentId": "eq-1",
      "borrowerName": "Somchai Jaidee",
      "startAt": "2026-10-20T09:00:00.000Z",
      "endAt": "2026-10-20T11:00:00.000Z",
      "purpose": "Class presentation"
    }
    ```
  - **Error Cases:**
    - `400 Bad Request`: ข้อมูลไม่ครบ, รูปแบบเวลาไม่ใช่วันที่ ISO หรือ `startAt >= endAt`
    - `404 Not Found`: ไม่พบ `equipmentId` ในฐานข้อมูล
    - `409 Conflict`: ช่วงเวลาที่เลือกทับซ้อนกับการจองที่มีอยู่แล้ว
- **PATCH `/api/bookings/:id`**
  - **Success:** `200 OK`
  - **Error:** `400`, `404`, `409` (ป้องกันเวลาชนกับรายการอื่น ยกเว้นตัวเอง)
- **DELETE `/api/bookings/:id`**
  - **Success:** `204 No Content`
  - **Error:** `404 Not Found`
# AI Log

## 1. Initial Setup and Contract Design
- **Prompt:** ช่วยออกแบบ SQLite Schema และ REST API บน Hono/TypeScript ตาม API Contract
- **What was used:** โครงสร้าง Table `equipment`, `bookings` และ Route CRUD
- **Verification & Ownership:** ปรับย้ายไฟล์เข้าสู่โฟลเดอร์ `src/` ให้เป็นระเบียบ และตรวจสอบการคืนค่า HTTP Status Codes (200, 201, 204, 400, 404, 409) ให้ตรงตามตาราง Contract

## 2. Overlapping Time Query & Self-Exclusion
- **Prompt:** ช่วยตรวจทานตรรกะการตรวจสอบ Overlapping Time ของการจองอุปกรณ์
- **What was used:** สมการเงื่อนไข SQL: `(? < endAt AND ? > startAt)`
- **Verification & Ownership:** ตรวจสอบเพิ่มเติมในเคสของ `PATCH` ให้เพิ่มเงื่อนไข `AND id != ?` เพื่อป้องกันไม่ให้แจ้งเตือนเวลาชนกับตัวมันเอง
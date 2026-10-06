# Quality Gate Review

## Finding 1: Time Overlapping Detection Logic (Reliability & Accuracy)
- **What was found:** การตรวจสอบการจองชนกัน หากตรวจแค่จุดเวลาเริ่มต้นเท่ากัน จะไม่ดักจับช่วงเวลาคาบเกี่ยว (Partial overlap / Enclosing overlap)
- **How it was fixed:** ใช้ตรรกะช่วงเวลาใน SQL: `(? < endAt AND ? > startAt)` ครอบคลุมทุกเคสที่มีเวลาทับซ้อนในอุปกรณ์เดียวกัน
- **Evidence:** ทดสอบยิง `POST /api/bookings` เวลา 10:00–12:00 น. ซ้ำซ้อนกับ 09:00–11:00 น. ของอุปกรณ์ `eq-1` ได้รับ HTTP 409 Conflict

## Finding 2: SQL Parameter Binding & Injection Defense (Implementation & Security)
- **What was found:** เสี่ยงต่อ SQL Injection หากนำ Request Body มาต่อสตริง SQL
- **How it was fixed:** ใช้ Prepared Statements พร้อม Parameter Binding `?` ผ่าน `better-sqlite3` ทั้งระบบ
- **Evidence:** ทุกฟังก์ชันใน `src/index.ts` และ `src/db.ts` ไม่มีการ Concatenate สตริงลงใน SQL

## Finding 3: PATCH Self-Conflict Prevention (Reasoning / You Own It)
- **What was found:** การแก้ไขการจองเดิม (PATCH) หากส่งช่วงเวลาเดิม ระบบจะมองว่าเวลาชนกับการจองเดิมของตัวเอง
- **How it was fixed:** เพิ่มเงื่อนไข `AND id != ?` ในคำสั่งเช็ก Conflict เพื่อยกเว้น ID ของตนเอง
- **Evidence:** ทดสอบยิง `PATCH` เปลี่ยนเฉพาะ `borrowerName` สำเร็จ ได้รับ HTTP 200 โดยไม่ติด 409 Conflict
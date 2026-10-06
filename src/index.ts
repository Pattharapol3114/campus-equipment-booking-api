import { Hono } from 'hono';
import { serve } from '@hono/node-server';
import { cors } from 'hono/cors';
import { db, initDB } from './db';
import { randomUUID } from 'crypto';

initDB();

const app = new Hono();

app.use('/*', cors());

function isValidDate(dateStr: string) {
  const d = new Date(dateStr);
  return !isNaN(d.getTime()) && typeof dateStr === 'string' && dateStr.includes('T');
}

// 1. GET /api/equipment
app.get('/api/equipment', (c) => {
  const rows = db.prepare('SELECT id, name, location FROM equipment').all();
  return c.json(rows, 200);
});

// 2. GET /api/bookings
app.get('/api/bookings', (c) => {
  const rows = db.prepare('SELECT id, equipmentId, borrowerName, startAt, endAt, purpose FROM bookings').all();
  return c.json(rows, 200);
});

// 3. GET /api/bookings/:id
app.get('/api/bookings/:id', (c) => {
  const id = c.req.param('id');
  const booking = db.prepare('SELECT id, equipmentId, borrowerName, startAt, endAt, purpose FROM bookings WHERE id = ?').get(id);

  if (!booking) {
    return c.json({ error: 'Booking not found' }, 404);
  }
  return c.json(booking, 200);
});

// 4. POST /api/bookings
app.post('/api/bookings', async (c) => {
  let body: any;
  try {
    body = await c.req.json();
  } catch {
    return c.json({ error: 'Invalid JSON payload' }, 400);
  }

  const { equipmentId, borrowerName, startAt, endAt, purpose } = body || {};

  if (!equipmentId || !borrowerName || !startAt || !endAt || !purpose) {
    return c.json({ error: 'Missing required fields: equipmentId, borrowerName, startAt, endAt, purpose' }, 400);
  }

  if (!isValidDate(startAt) || !isValidDate(endAt)) {
    return c.json({ error: 'startAt and endAt must be valid ISO 8601 date strings' }, 400);
  }

  if (new Date(startAt) >= new Date(endAt)) {
    return c.json({ error: 'startAt must be earlier than endAt' }, 400);
  }

  const eq = db.prepare('SELECT id FROM equipment WHERE id = ?').get(equipmentId);
  if (!eq) {
    return c.json({ error: 'Equipment not found' }, 404);
  }

  const conflict = db.prepare(`
    SELECT id FROM bookings
    WHERE equipmentId = ?
      AND ? < endAt
      AND ? > startAt
    LIMIT 1
  `).get(equipmentId, startAt, endAt);

  if (conflict) {
    return c.json({ error: 'Booking time conflicts with an existing reservation for this equipment' }, 409);
  }

  const newId = randomUUID();
  db.prepare(`
    INSERT INTO bookings (id, equipmentId, borrowerName, startAt, endAt, purpose)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(newId, equipmentId, borrowerName, startAt, endAt, purpose);

  const created = db.prepare('SELECT id, equipmentId, borrowerName, startAt, endAt, purpose FROM bookings WHERE id = ?').get(newId);
  return c.json(created, 201);
});

// 5. PATCH /api/bookings/:id
app.patch('/api/bookings/:id', async (c) => {
  const id = c.req.param('id');
  const existing: any = db.prepare('SELECT * FROM bookings WHERE id = ?').get(id);

  if (!existing) {
    return c.json({ error: 'Booking not found' }, 404);
  }

  let body: any;
  try {
    body = await c.req.json();
  } catch {
    return c.json({ error: 'Invalid JSON payload' }, 400);
  }

  const equipmentId = body.equipmentId ?? existing.equipmentId;
  const borrowerName = body.borrowerName ?? existing.borrowerName;
  const startAt = body.startAt ?? existing.startAt;
  const endAt = body.endAt ?? existing.endAt;
  const purpose = body.purpose ?? existing.purpose;

  if (!isValidDate(startAt) || !isValidDate(endAt)) {
    return c.json({ error: 'startAt and endAt must be valid ISO 8601 date strings' }, 400);
  }

  if (new Date(startAt) >= new Date(endAt)) {
    return c.json({ error: 'startAt must be earlier than endAt' }, 400);
  }

  const eq = db.prepare('SELECT id FROM equipment WHERE id = ?').get(equipmentId);
  if (!eq) {
    return c.json({ error: 'Equipment not found' }, 404);
  }

  const conflict = db.prepare(`
    SELECT id FROM bookings
    WHERE equipmentId = ?
      AND id != ?
      AND ? < endAt
      AND ? > startAt
    LIMIT 1
  `).get(equipmentId, id, startAt, endAt);

  if (conflict) {
    return c.json({ error: 'Booking time conflicts with an existing reservation for this equipment' }, 409);
  }

  db.prepare(`
    UPDATE bookings
    SET equipmentId = ?, borrowerName = ?, startAt = ?, endAt = ?, purpose = ?
    WHERE id = ?
  `).run(equipmentId, borrowerName, startAt, endAt, purpose, id);

  const updated = db.prepare('SELECT id, equipmentId, borrowerName, startAt, endAt, purpose FROM bookings WHERE id = ?').get(id);
  return c.json(updated, 200);
});

// 6. DELETE /api/bookings/:id
app.delete('/api/bookings/:id', (c) => {
  const id = c.req.param('id');
  const existing = db.prepare('SELECT id FROM bookings WHERE id = ?').get(id);

  if (!existing) {
    return c.json({ error: 'Booking not found' }, 404);
  }

  db.prepare('DELETE FROM bookings WHERE id = ?').run(id);
  return c.body(null, 204);
});

const port = 8787;
console.log(`Server is running on http://localhost:${port}`);
serve({
  fetch: app.fetch,
  port,
});
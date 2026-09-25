import express, { Request, Response } from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;
const DATA_DIR = path.join(__dirname, 'data');
const DATA_FILE = path.join(DATA_DIR, 'atelier_storage.json');

app.use(express.json({ limit: '10mb' }));

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// In-memory cache + disk storage persistence
function loadStore(): any {
  try {
    if (fs.existsSync(DATA_FILE)) {
      const raw = fs.readFileSync(DATA_FILE, 'utf-8');
      return JSON.parse(raw);
    }
  } catch (err) {
    console.error('Error reading storage file, initializing new store:', err);
  }
  return null;
}

function saveStore(data: any) {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf-8');
    return true;
  } catch (err) {
    console.error('Error saving storage file:', err);
    return false;
  }
}

// ─── API Routes ─────────────────────────────────────────────────────────────
app.get('/api/atelier/health', (_req: Request, res: Response) => {
  res.json({
    status: 'online',
    mode: 'persistent-storage',
    timestamp: new Date().toISOString(),
  });
});

app.get('/api/atelier/state', (_req: Request, res: Response) => {
  const store = loadStore();
  if (store) {
    res.json(store);
  } else {
    // If not yet saved on server, return empty object so client provides seed data
    res.json({ initialized: false });
  }
});

app.post('/api/atelier/state', (req: Request, res: Response) => {
  const incoming = req.body;
  const current = loadStore() || {};
  const merged = {
    ...current,
    ...incoming,
    lastUpdated: new Date().toISOString(),
  };
  saveStore(merged);
  res.json({ success: true, lastUpdated: merged.lastUpdated });
});

app.post('/api/atelier/appointment', (req: Request, res: Response) => {
  const newAppointment = req.body;
  if (!newAppointment || !newAppointment.id) {
    return res.status(400).json({ success: false, error: 'Invalid appointment payload' });
  }
  const store = loadStore() || { appointments: [], customers: [], notifications: [] };
  const appointments = Array.isArray(store.appointments) ? store.appointments : [];
  
  // Upsert appointment
  const existingIdx = appointments.findIndex((a: any) => a.id === newAppointment.id);
  if (existingIdx >= 0) {
    appointments[existingIdx] = newAppointment;
  } else {
    appointments.push(newAppointment);
  }
  store.appointments = appointments;
  store.lastUpdated = new Date().toISOString();
  saveStore(store);

  return res.json({ success: true, appointment: newAppointment });
});

app.patch('/api/atelier/appointment/:id/status', (req: Request, res: Response) => {
  const { id } = req.params;
  const { status } = req.body;
  const store = loadStore() || { appointments: [] };
  const appointments = Array.isArray(store.appointments) ? store.appointments : [];
  const apt = appointments.find((a: any) => a.id === id);
  if (apt) {
    apt.status = status;
    store.lastUpdated = new Date().toISOString();
    saveStore(store);
    return res.json({ success: true, appointment: apt });
  }
  return res.status(404).json({ success: false, error: 'Appointment not found' });
});

app.post('/api/atelier/order', (req: Request, res: Response) => {
  const newOrder = req.body;
  const store = loadStore() || { orders: [] };
  const orders = Array.isArray(store.orders) ? store.orders : [];
  orders.unshift(newOrder);
  store.orders = orders;
  store.lastUpdated = new Date().toISOString();
  saveStore(store);
  res.json({ success: true, order: newOrder });
});

// ─── Vite Middleware integration ─────────────────────────────────────────────
async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(Number(PORT), '0.0.0.0', () => {
    console.log(`[Royal Atelier Server] Running on http://0.0.0.0:${PORT} with persistent disk storage.`);
  });
}

startServer();

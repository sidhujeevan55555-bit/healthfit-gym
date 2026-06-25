import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { eq, desc, sql } from 'drizzle-orm';
import { db } from './src/db/index.ts';
import { users, admin, workouts, subscriptions } from './src/db/schema.ts';
import { hashPassword, verifyPassword, signToken, verifyToken } from './src/utils/auth-server.ts';
import { adminAuth } from './src/lib/firebase-admin.ts';

const app = express();
const PORT = 3000;

app.use(express.json());

// Seeding standard admin user during startup
async function seedAdmin() {
  try {
    const existing = await db.select().from(admin);
    if (existing.length === 0) {
      const hp = hashPassword('admin123');
      await db.insert(admin).values({
        username: 'admin',
        password: hp,
      });
      console.log('Seeded default admin user [username: admin, password: admin123]');
    }
  } catch (error) {
    console.error('Error seeding admin:', error);
  }
}

// Security & Authentication Middlewares
const authenticateUser = async (req: express.Request & { userId?: number; email?: string; isAdmin?: boolean }, res: express.Response, next: express.NextFunction) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Access denied: Missing bearer token' });
  }
  const token = authHeader.split(' ')[1];
  const payload = verifyToken(token);
  if (!payload) {
    return res.status(401).json({ error: 'Access denied: Invalid or expired token' });
  }
  req.userId = payload.userId;
  req.email = payload.email;
  req.isAdmin = payload.isAdmin || false;
  next();
};

const authenticateAdmin = async (req: express.Request & { userId?: number; email?: string; isAdmin?: boolean }, res: express.Response, next: express.NextFunction) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Access denied: Missing bearer token' });
  }
  const token = authHeader.split(' ')[1];
  const payload = verifyToken(token);
  if (!payload || !payload.isAdmin) {
    return res.status(403).json({ error: 'Access denied: Administrative privileges required' });
  }
  req.userId = payload.userId;
  req.email = payload.email;
  req.isAdmin = true;
  next();
};

// --- AUTHENTICATION API ROUTES ---

// Local Register User
app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, phone, password, membershipType } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email, and password are required.' });
    }

    // Check if user already exists
    const existing = await db.select().from(users).where(eq(users.email, email.toLowerCase()));
    if (existing.length > 0) {
      return res.status(400).json({ error: 'Email already registered.' });
    }

    const hashedPassword = hashPassword(password);
    const mType = membershipType || 'None';

    const [newUser] = await db.insert(users).values({
      name,
      email: email.toLowerCase(),
      phone: phone || '',
      password: hashedPassword,
      membershipType: mType,
    }).returning();

    // If a plan was selected during registration, automatically register a subscription log!
    if (mType !== 'None') {
      let price = 499;
      let durationMonths = 1;
      if (mType === 'Quarterly Pack') {
        price = 1499;
        durationMonths = 3;
      } else if (mType === 'Annual Pass') {
        price = 4999;
        durationMonths = 12;
      } else if (mType === 'Pro Monthly') {
        price = 799;
        durationMonths = 1;
      }

      const startDate = new Date().toISOString().split('T')[0];
      const endDateVal = new Date();
      endDateVal.setMonth(endDateVal.getMonth() + durationMonths);
      const endDate = endDateVal.toISOString().split('T')[0];

      await db.insert(subscriptions).values({
        userId: newUser.id,
        planName: mType,
        price,
        startDate,
        endDate,
      });
    }

    // Sign jwt token
    const token = signToken({ userId: newUser.id, email: newUser.email, isAdmin: false });
    return res.status(201).json({
      token,
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        phone: newUser.phone,
        membershipType: newUser.membershipType,
        createdAt: newUser.createdAt,
      }
    });

  } catch (error: any) {
    console.error('Registration error:', error);
    return res.status(500).json({ error: error.message || 'Server error during registration' });
  }
});

// Local Login User
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const [userRecord] = await db.select().from(users).where(eq(users.email, email.toLowerCase()));
    if (!userRecord || !userRecord.password) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const matches = verifyPassword(password, userRecord.password);
    if (!matches) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const token = signToken({ userId: userRecord.id, email: userRecord.email, isAdmin: false });
    return res.json({
      token,
      user: {
        id: userRecord.id,
        name: userRecord.name,
        email: userRecord.email,
        phone: userRecord.phone,
        membershipType: userRecord.membershipType,
        createdAt: userRecord.createdAt,
      }
    });
  } catch (error: any) {
    console.error('Login error:', error);
    return res.status(500).json({ error: 'Server error during login' });
  }
});

// Firebase Google Login/Signup Endpoint
app.post('/api/auth/google', async (req, res) => {
  try {
    const { token } = req.body;
    if (!token) {
      return res.status(400).json({ error: 'Firebase ID Token is required' });
    }

    // Verify Firebase token via Admin SDK
    const decodedToken = await adminAuth.verifyIdToken(token);
    const { uid, email, name, picture } = decodedToken;

    if (!email) {
      return res.status(400).json({ error: 'Email omitted by provider' });
    }

    // Try finding user by email first
    let userRecord;
    const [existingByEmail] = await db.select().from(users).where(eq(users.email, email.toLowerCase()));

    if (existingByEmail) {
      // User of local login already exists, populate uid if not exists
      if (!existingByEmail.uid) {
        const [updated] = await db.update(users).set({ uid }).where(eq(users.id, existingByEmail.id)).returning();
        userRecord = updated;
      } else {
        userRecord = existingByEmail;
      }
    } else {
      // Create new Google User
      const [newGoogleUser] = await db.insert(users).values({
        uid,
        name: name || email.split('@')[0],
        email: email.toLowerCase(),
        phone: '',
        membershipType: 'None',
      }).returning();
      userRecord = newGoogleUser;
    }

    const jwtToken = signToken({ userId: userRecord.id, email: userRecord.email, isAdmin: false });
    return res.json({
      token: jwtToken,
      user: {
        id: userRecord.id,
        name: userRecord.name,
        email: userRecord.email,
        phone: userRecord.phone,
        membershipType: userRecord.membershipType,
        createdAt: userRecord.createdAt,
      }
    });

  } catch (error: any) {
    console.error('Google login verification failure:', error);
    return res.status(401).json({ error: 'Google authentication verification failed' });
  }
});

// Admin Login
app.post('/api/auth/admin/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required' });
    }

    const [adminRecord] = await db.select().from(admin).where(eq(admin.username, username.trim().toLowerCase()));
    if (!adminRecord) {
      return res.status(401).json({ error: 'Invalid administrative credentials' });
    }

    const matches = verifyPassword(password, adminRecord.password);
    if (!matches) {
      return res.status(401).json({ error: 'Invalid administrative credentials' });
    }

    const token = signToken({ userId: adminRecord.id, email: adminRecord.username, isAdmin: true });
    return res.json({
      token,
      isAdmin: true,
      user: {
        name: 'Gym Administrator',
        email: 'admin@healthfit.in',
      }
    });

  } catch (error: any) {
    console.error('Admin login error:', error);
    return res.status(500).json({ error: 'Server error during admin authentication' });
  }
});


// --- MEMBER API ENDPOINTS (AUTHENTICATED) ---

// Retrieve single user profile info
app.get('/api/users/me', authenticateUser, async (req: any, res) => {
  try {
    const [me] = await db.select().from(users).where(eq(users.id, req.userId));
    if (!me) {
      return res.status(404).json({ error: 'User not found' });
    }
    return res.json({
      id: me.id,
      name: me.name,
      email: me.email,
      phone: me.phone,
      membershipType: me.membershipType,
      createdAt: me.createdAt,
    });
  } catch (error) {
    return res.status(500).json({ error: 'Server error fetching profile' });
  }
});

// Get member workflows
app.get('/api/workouts', authenticateUser, async (req: any, res) => {
  try {
    const results = await db.select()
      .from(workouts)
      .where(eq(workouts.userId, req.userId))
      .orderBy(desc(workouts.date));
    return res.json(results);
  } catch (error) {
    return res.status(500).json({ error: 'Error pulling workouts' });
  }
});

// Log new workout
app.post('/api/workouts', authenticateUser, async (req: any, res) => {
  try {
    const { date, exercise, duration, calories, weight } = req.body;
    if (!date || !exercise || duration === undefined || calories === undefined) {
      return res.status(400).json({ error: 'Missing log fields' });
    }

    const [newLog] = await db.insert(workouts).values({
      userId: req.userId,
      date,
      exercise,
      duration: Number(duration),
      calories: Number(calories),
      weight: weight ? Number(weight) : null,
    }).returning();

    return res.status(201).json(newLog);
  } catch (error) {
    return res.status(500).json({ error: 'Database logging failure' });
  }
});

// Delete a workout log
app.delete('/api/workouts/:id', authenticateUser, async (req: any, res) => {
  try {
    const { id } = req.params;
    const [existing] = await db.select().from(workouts).where(eq(workouts.id, Number(id)));

    if (!existing || existing.userId !== req.userId) {
      return res.status(403).json({ error: 'Unauthorized to delete this log.' });
    }

    await db.delete(workouts).where(eq(workouts.id, Number(id)));
    return res.json({ success: true, message: 'Workout log removed successfully' });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to erase workout log' });
  }
});

// Get user subscriptions history
app.get('/api/subscriptions', authenticateUser, async (req: any, res) => {
  try {
    const results = await db.select()
      .from(subscriptions)
      .where(eq(subscriptions.userId, req.userId))
      .orderBy(desc(subscriptions.createdAt));
    return res.json(results);
  } catch (error) {
    return res.status(500).json({ error: 'Error pulling subscription logs' });
  }
});

// Purchase a plan/subscription
app.post('/api/subscriptions', authenticateUser, async (req: any, res) => {
  try {
    const { planName, price, durationMonths } = req.body;
    if (!planName || !price || !durationMonths) {
      return res.status(400).json({ error: 'Planning arguments are missing' });
    }

    const startDate = new Date().toISOString().split('T')[0];
    const endDateVal = new Date();
    endDateVal.setMonth(endDateVal.getMonth() + Number(durationMonths));
    const endDate = endDateVal.toISOString().split('T')[0];

    // Transactional logic: Record Subscription AND update member's visual badge planName!
    const [sub] = await db.insert(subscriptions).values({
      userId: req.userId,
      planName,
      price: Number(price),
      startDate,
      endDate,
    }).returning();

    await db.update(users)
      .set({ membershipType: planName })
      .where(eq(users.id, req.userId));

    return res.status(201).json(sub);
  } catch (error) {
    console.error('Error purchasing plan:', error);
    return res.status(500).json({ error: 'Failed to complete transaction' });
  }
});


// --- ADMIN API ENDPOINTS (RESTRICTED SYSTEM ADM) ---

// Retrieve all gym users
app.get('/api/admin/users', authenticateAdmin, async (req, res) => {
  try {
    const allUsers = await db.select().from(users).orderBy(desc(users.createdAt));
    return res.json(allUsers);
  } catch (error) {
    return res.status(500).json({ error: 'Audit failure fetching users list' });
  }
});

// Delete user account
app.delete('/api/admin/users/:id', authenticateAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    await db.delete(users).where(eq(users.id, Number(id)));
    return res.json({ success: true, message: 'User and all linked trackers fully deleted' });
  } catch (error) {
    return res.status(500).json({ error: 'Admin removal transaction failed' });
  }
});

// Retrieve all recorded subscriptions
app.get('/api/admin/subscriptions', authenticateAdmin, async (req, res) => {
  try {
    const subs = await db.select()
      .from(subscriptions)
      .orderBy(desc(subscriptions.createdAt));

    // Map each subscription to user name for comprehensive audit view
    const allUsers = await db.select().from(users);
    const result = subs.map(sub => {
      const parentUser = allUsers.find(u => u.id === sub.userId);
      return {
        ...sub,
        userName: parentUser ? parentUser.name : 'Unknown User',
        userEmail: parentUser ? parentUser.email : 'N/A',
      };
    });

    return res.json(result);
  } catch (error) {
    return res.status(500).json({ error: 'Admin subscription pulling error' });
  }
});

// Retrieve all gym workouts logged
app.get('/api/admin/workouts', authenticateAdmin, async (req, res) => {
  try {
    const subLogs = await db.select()
      .from(workouts)
      .orderBy(desc(workouts.createdAt));

    const allUsers = await db.select().from(users);
    const result = subLogs.map(log => {
      const parentUser = allUsers.find(u => u.id === log.userId);
      return {
        ...log,
        userName: parentUser ? parentUser.name : 'Unknown User',
      };
    });

    return res.json(result);
  } catch (error) {
    return res.status(500).json({ error: 'Admin workout pulling error' });
  }
});

// Admin metrics and statistics
app.get('/api/admin/stats', authenticateAdmin, async (req, res) => {
  try {
    // Total Revenue (Sum of subscriptions prices)
    const subResult = await db.select().from(subscriptions);
    const totalRevenue = subResult.reduce((sum, item) => sum + item.price, 0);

    // Dynamic Plan Distribution
    const distribution: Record<string, number> = {};
    subResult.forEach(item => {
      distribution[item.planName] = (distribution[item.planName] || 0) + 1;
    });

    // Total Users
    const uResult = await db.select().from(users);
    const totalUsers = uResult.length;

    // Active memberships count (users who don't have membership 'None')
    const activeMembers = uResult.filter(u => u.membershipType && u.membershipType !== 'None').length;

    // Workouts metrics
    const wResult = await db.select().from(workouts);
    const totalWorkoutLogs = wResult.length;

    return res.json({
      totalRevenue,
      totalUsers,
      activeMembers,
      totalWorkoutLogs,
      planDistribution: distribution,
    });

  } catch (error) {
    console.error('Stats aggregation error:', error);
    return res.status(500).json({ error: 'Admin statistics calculations failed' });
  }
});


// --- VITE DEV AND PROD MIDDLEWARE SETUP ---

async function startServer() {
  await seedAdmin();

  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    // SPA routing fallback
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[HealthFit Gym Application Service] online at http://localhost:${PORT}`);
  });
}

startServer();

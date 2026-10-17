-- ============================================================
-- Enterprise AI Workflow OS — Supabase PostgreSQL Schema
-- ============================================================

-- 1. Users Table
CREATE TABLE IF NOT EXISTS users (
  id BIGSERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  role VARCHAR(50) NOT NULL DEFAULT 'employee', -- 'admin', 'manager', 'employee'
  department VARCHAR(100) NOT NULL DEFAULT 'Engineering',
  status VARCHAR(50) NOT NULL DEFAULT 'active',
  avatar VARCHAR(255),
  joined VARCHAR(50) DEFAULT '2026-01-15',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Departments Table
CREATE TABLE IF NOT EXISTS departments (
  id BIGSERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  head VARCHAR(255) NOT NULL,
  employees INT DEFAULT 0,
  projects INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Projects Table
CREATE TABLE IF NOT EXISTS projects (
  id BIGSERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  department VARCHAR(100) NOT NULL,
  status VARCHAR(50) NOT NULL DEFAULT 'active', -- 'active', 'planning', 'delayed', 'completed'
  progress INT DEFAULT 0,
  deadline VARCHAR(50),
  risk VARCHAR(50) DEFAULT 'low', -- 'low', 'medium', 'high'
  tasks INT DEFAULT 0,
  lead VARCHAR(255),
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Tasks Table
CREATE TABLE IF NOT EXISTS tasks (
  id BIGSERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  project_id BIGINT REFERENCES projects(id) ON DELETE CASCADE,
  project VARCHAR(255),
  priority VARCHAR(50) DEFAULT 'medium', -- 'low', 'medium', 'high', 'critical'
  deadline TIMESTAMPTZ NOT NULL,
  description TEXT,
  status VARCHAR(50) DEFAULT 'not_started', -- 'not_started', 'in_progress', 'completed', 'delayed'
  assigned_to BIGINT REFERENCES users(id) ON DELETE SET NULL,
  assigned VARCHAR(255) DEFAULT 'Unassigned',
  progress INT DEFAULT 0,
  risk_level VARCHAR(50) DEFAULT 'low',
  delay_prob NUMERIC(3,2) DEFAULT 0.10,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Chat Channels Table
CREATE TABLE IF NOT EXISTS chat_channels (
  id BIGSERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  members INT DEFAULT 1,
  last_message TEXT,
  last_time VARCHAR(50),
  unread INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Chat Messages Table
CREATE TABLE IF NOT EXISTS chat_messages (
  id BIGSERIAL PRIMARY KEY,
  channel_id BIGINT REFERENCES chat_channels(id) ON DELETE CASCADE,
  sender VARCHAR(255) NOT NULL,
  sender_id BIGINT REFERENCES users(id) ON DELETE SET NULL,
  content TEXT NOT NULL,
  time VARCHAR(50) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Audit Logs Table
CREATE TABLE IF NOT EXISTS audit_logs (
  id BIGSERIAL PRIMARY KEY,
  user_name VARCHAR(255) NOT NULL,
  user_id BIGINT REFERENCES users(id) ON DELETE SET NULL,
  action VARCHAR(255) NOT NULL,
  resource VARCHAR(255),
  ip VARCHAR(100) DEFAULT '127.0.0.1',
  timestamp TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_tasks_assigned_to ON tasks(assigned_to);
CREATE INDEX IF NOT EXISTS idx_tasks_project_id ON tasks(project_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_channel_id ON chat_messages(channel_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_timestamp ON audit_logs(timestamp);

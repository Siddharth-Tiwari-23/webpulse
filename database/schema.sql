-- WebPulse Database Schema

CREATE TABLE IF NOT EXISTS websites (
    id          SERIAL PRIMARY KEY,
    name        VARCHAR(255) NOT NULL,
    url         TEXT NOT NULL UNIQUE,
    status      VARCHAR(20) NOT NULL DEFAULT 'UNKNOWN',
    status_code INTEGER,
    response_ms INTEGER,
    last_checked TIMESTAMP WITH TIME ZONE,
    created_at  TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS health_logs (
    id          SERIAL PRIMARY KEY,
    website_id  INTEGER NOT NULL REFERENCES websites(id) ON DELETE CASCADE,
    status      VARCHAR(20) NOT NULL,
    status_code INTEGER,
    response_ms INTEGER,
    checked_at  TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_health_logs_website_id ON health_logs(website_id);
CREATE INDEX IF NOT EXISTS idx_health_logs_checked_at ON health_logs(checked_at);

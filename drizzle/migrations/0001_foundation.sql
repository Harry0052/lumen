CREATE TABLE users (
  id TEXT PRIMARY KEY,
  display_name TEXT NOT NULL DEFAULT '',
  kind TEXT NOT NULL CHECK (kind IN ('guest', 'editor', 'deleted')),
  locale TEXT NOT NULL DEFAULT 'en' CHECK (locale IN ('en', 'es')),
  text_scale TEXT NOT NULL DEFAULT '1' CHECK (text_scale IN ('1', '1.15', '1.3')),
  contrast TEXT NOT NULL DEFAULT 'standard' CHECK (contrast IN ('standard', 'high')),
  simpler INTEGER NOT NULL DEFAULT 0 CHECK (simpler IN (0, 1)),
  reduced_motion INTEGER NOT NULL DEFAULT 0 CHECK (reduced_motion IN (0, 1)),
  created_at TEXT NOT NULL
);

CREATE TABLE sessions (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users (id),
  token_hash TEXT NOT NULL UNIQUE,
  created_at TEXT NOT NULL,
  expires_at TEXT NOT NULL
);

CREATE INDEX sessions_user_idx ON sessions (user_id);

CREATE TABLE security_events (
  id TEXT PRIMARY KEY,
  user_id TEXT REFERENCES users (id),
  kind TEXT NOT NULL,
  metadata_json TEXT NOT NULL,
  created_at TEXT NOT NULL
);

CREATE INDEX security_events_user_idx ON security_events (user_id, created_at);

CREATE TABLE rate_buckets (
  bucket_key TEXT PRIMARY KEY,
  window_start TEXT NOT NULL,
  count INTEGER NOT NULL
);

CREATE TABLE guides (
  id TEXT PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  topic TEXT NOT NULL,
  source_url TEXT NOT NULL,
  source_title TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('draft', 'unverified', 'verified', 'archived')),
  reviewed_at TEXT,
  review_due_at TEXT,
  is_demo INTEGER NOT NULL DEFAULT 0 CHECK (is_demo IN (0, 1)),
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE INDEX guides_status_idx ON guides (status, topic);

CREATE TABLE guide_versions (
  id TEXT PRIMARY KEY,
  guide_id TEXT NOT NULL REFERENCES guides (id),
  locale TEXT NOT NULL CHECK (locale IN ('en', 'es')),
  version INTEGER NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('draft', 'reviewed')),
  title TEXT NOT NULL,
  summary TEXT NOT NULL,
  simpler_summary TEXT,
  translation_note TEXT,
  reviewed_at TEXT,
  created_at TEXT NOT NULL,
  UNIQUE (guide_id, locale, version)
);

CREATE INDEX guide_versions_guide_idx ON guide_versions (guide_id, locale, status);

CREATE TABLE guide_steps (
  id TEXT PRIMARY KEY,
  version_id TEXT NOT NULL REFERENCES guide_versions (id),
  ordinal INTEGER NOT NULL,
  heading TEXT NOT NULL,
  explanation TEXT NOT NULL,
  simpler_explanation TEXT,
  example TEXT,
  caution TEXT,
  UNIQUE (version_id, ordinal)
);

CREATE TABLE glossary_terms (
  id TEXT PRIMARY KEY,
  version_id TEXT NOT NULL REFERENCES guide_versions (id),
  term TEXT NOT NULL,
  definition TEXT NOT NULL
);

CREATE INDEX glossary_version_idx ON glossary_terms (version_id);

CREATE TABLE guide_sessions (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users (id),
  guide_id TEXT NOT NULL REFERENCES guides (id),
  version_id TEXT NOT NULL REFERENCES guide_versions (id),
  status TEXT NOT NULL CHECK (status IN ('in_progress', 'completed', 'abandoned')),
  last_step_ordinal INTEGER NOT NULL,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE INDEX guide_sessions_user_idx ON guide_sessions (user_id, updated_at);
CREATE INDEX guide_sessions_owner_guide_idx ON guide_sessions (user_id, guide_id, status);

CREATE TABLE session_steps (
  id TEXT PRIMARY KEY,
  session_id TEXT NOT NULL REFERENCES guide_sessions (id),
  step_id TEXT REFERENCES guide_steps (id),
  ordinal INTEGER NOT NULL,
  completed_at TEXT NOT NULL,
  UNIQUE (session_id, ordinal)
);

CREATE INDEX session_steps_session_idx ON session_steps (session_id);

CREATE TABLE saved_guides (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users (id),
  guide_id TEXT NOT NULL REFERENCES guides (id),
  created_at TEXT NOT NULL,
  UNIQUE (user_id, guide_id)
);

CREATE TABLE feedback (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users (id),
  guide_id TEXT NOT NULL REFERENCES guides (id),
  step_ordinal INTEGER,
  clarity_rating INTEGER,
  confusing INTEGER NOT NULL DEFAULT 0 CHECK (confusing IN (0, 1)),
  note TEXT,
  created_at TEXT NOT NULL
);

CREATE INDEX feedback_guide_idx ON feedback (guide_id, created_at);

CREATE TABLE metric_events (
  id TEXT PRIMARY KEY,
  user_id TEXT REFERENCES users (id),
  guide_id TEXT,
  session_id TEXT,
  kind TEXT NOT NULL,
  created_at TEXT NOT NULL
);

CREATE INDEX metric_events_kind_idx ON metric_events (kind, created_at);

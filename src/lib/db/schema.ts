import { index, integer, sqliteTable, text, uniqueIndex } from "drizzle-orm/sqlite-core";

export const users = sqliteTable("users", {
  id: text("id").primaryKey(),
  displayName: text("display_name").notNull(),
  kind: text("kind").notNull(),
  locale: text("locale").notNull(),
  textScale: text("text_scale").notNull(),
  contrast: text("contrast").notNull(),
  simpler: integer("simpler").notNull(),
  reducedMotion: integer("reduced_motion").notNull(),
  createdAt: text("created_at").notNull(),
});

export const sessions = sqliteTable(
  "sessions",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id),
    tokenHash: text("token_hash").notNull().unique(),
    createdAt: text("created_at").notNull(),
    expiresAt: text("expires_at").notNull(),
  },
  (table) => [index("sessions_user_idx").on(table.userId)],
);

export const securityEvents = sqliteTable(
  "security_events",
  {
    id: text("id").primaryKey(),
    userId: text("user_id").references(() => users.id),
    kind: text("kind").notNull(),
    metadataJson: text("metadata_json").notNull(),
    createdAt: text("created_at").notNull(),
  },
  (table) => [index("security_events_user_idx").on(table.userId, table.createdAt)],
);

export const rateBuckets = sqliteTable("rate_buckets", {
  bucketKey: text("bucket_key").primaryKey(),
  windowStart: text("window_start").notNull(),
  count: integer("count").notNull(),
});

export const guides = sqliteTable(
  "guides",
  {
    id: text("id").primaryKey(),
    slug: text("slug").notNull().unique(),
    topic: text("topic").notNull(),
    sourceUrl: text("source_url").notNull(),
    sourceTitle: text("source_title").notNull(),
    status: text("status").notNull(),
    reviewedAt: text("reviewed_at"),
    reviewDueAt: text("review_due_at"),
    isDemo: integer("is_demo").notNull(),
    createdAt: text("created_at").notNull(),
    updatedAt: text("updated_at").notNull(),
  },
  (table) => [index("guides_status_idx").on(table.status, table.topic)],
);

export const guideVersions = sqliteTable(
  "guide_versions",
  {
    id: text("id").primaryKey(),
    guideId: text("guide_id")
      .notNull()
      .references(() => guides.id),
    locale: text("locale").notNull(),
    version: integer("version").notNull(),
    status: text("status").notNull(),
    title: text("title").notNull(),
    summary: text("summary").notNull(),
    simplerSummary: text("simpler_summary"),
    translationNote: text("translation_note"),
    reviewedAt: text("reviewed_at"),
    createdAt: text("created_at").notNull(),
  },
  (table) => [
    uniqueIndex("guide_versions_unique").on(table.guideId, table.locale, table.version),
    index("guide_versions_guide_idx").on(table.guideId, table.locale, table.status),
  ],
);

export const guideSteps = sqliteTable(
  "guide_steps",
  {
    id: text("id").primaryKey(),
    versionId: text("version_id")
      .notNull()
      .references(() => guideVersions.id),
    ordinal: integer("ordinal").notNull(),
    heading: text("heading").notNull(),
    explanation: text("explanation").notNull(),
    simplerExplanation: text("simpler_explanation"),
    example: text("example"),
    caution: text("caution"),
  },
  (table) => [uniqueIndex("guide_steps_ordinal").on(table.versionId, table.ordinal)],
);

export const glossaryTerms = sqliteTable(
  "glossary_terms",
  {
    id: text("id").primaryKey(),
    versionId: text("version_id")
      .notNull()
      .references(() => guideVersions.id),
    term: text("term").notNull(),
    definition: text("definition").notNull(),
  },
  (table) => [index("glossary_version_idx").on(table.versionId)],
);

export const guideSessions = sqliteTable(
  "guide_sessions",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id),
    guideId: text("guide_id")
      .notNull()
      .references(() => guides.id),
    versionId: text("version_id")
      .notNull()
      .references(() => guideVersions.id),
    status: text("status").notNull(),
    lastStepOrdinal: integer("last_step_ordinal").notNull(),
    createdAt: text("created_at").notNull(),
    updatedAt: text("updated_at").notNull(),
  },
  (table) => [
    index("guide_sessions_user_idx").on(table.userId, table.updatedAt),
    index("guide_sessions_owner_guide_idx").on(table.userId, table.guideId, table.status),
  ],
);

export const sessionSteps = sqliteTable(
  "session_steps",
  {
    id: text("id").primaryKey(),
    sessionId: text("session_id")
      .notNull()
      .references(() => guideSessions.id),
    stepId: text("step_id").references(() => guideSteps.id),
    ordinal: integer("ordinal").notNull(),
    completedAt: text("completed_at").notNull(),
  },
  (table) => [
    uniqueIndex("session_steps_ordinal").on(table.sessionId, table.ordinal),
    index("session_steps_session_idx").on(table.sessionId),
  ],
);

export const savedGuides = sqliteTable(
  "saved_guides",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id),
    guideId: text("guide_id")
      .notNull()
      .references(() => guides.id),
    createdAt: text("created_at").notNull(),
  },
  (table) => [uniqueIndex("saved_guides_pair").on(table.userId, table.guideId)],
);

export const feedback = sqliteTable(
  "feedback",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id),
    guideId: text("guide_id")
      .notNull()
      .references(() => guides.id),
    stepOrdinal: integer("step_ordinal"),
    clarityRating: integer("clarity_rating"),
    confusing: integer("confusing").notNull(),
    note: text("note"),
    createdAt: text("created_at").notNull(),
  },
  (table) => [index("feedback_guide_idx").on(table.guideId, table.createdAt)],
);

export const metricEvents = sqliteTable(
  "metric_events",
  {
    id: text("id").primaryKey(),
    userId: text("user_id").references(() => users.id),
    guideId: text("guide_id"),
    sessionId: text("session_id"),
    kind: text("kind").notNull(),
    createdAt: text("created_at").notNull(),
  },
  (table) => [index("metric_events_kind_idx").on(table.kind, table.createdAt)],
);

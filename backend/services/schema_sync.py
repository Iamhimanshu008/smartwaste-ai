from sqlalchemy import text


SCHEMA_STATEMENTS = [
    "DO $$ BEGIN IF EXISTS (SELECT 1 FROM pg_type WHERE typname = 'userrole') THEN ALTER TYPE userrole ADD VALUE IF NOT EXISTS 'recycler'; END IF; END $$;",
    "DO $$ BEGIN IF EXISTS (SELECT 1 FROM pg_type WHERE typname = 'bidstatus') THEN ALTER TYPE bidstatus ADD VALUE IF NOT EXISTS 'completed'; END IF; END $$;",
    """
    DO $$
    BEGIN
      IF EXISTS (SELECT 1 FROM pg_type WHERE typname = 'binstatus') THEN
        ALTER TYPE binstatus ADD VALUE IF NOT EXISTS 'partial';
        ALTER TYPE binstatus ADD VALUE IF NOT EXISTS 'critical';
        ALTER TYPE binstatus ADD VALUE IF NOT EXISTS 'inactive';
      END IF;
    END $$;
    """,
    """
    ALTER TABLE IF EXISTS bin_reports
      ADD COLUMN IF NOT EXISTS fill_level INTEGER,
      ADD COLUMN IF NOT EXISTS waste_type VARCHAR(100),
      ADD COLUMN IF NOT EXISTS urgency VARCHAR(50),
      ADD COLUMN IF NOT EXISTS ai_observations TEXT,
      ADD COLUMN IF NOT EXISTS reporter_lat DOUBLE PRECISION,
      ADD COLUMN IF NOT EXISTS reporter_lng DOUBLE PRECISION,
      ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'pending',
      ADD COLUMN IF NOT EXISTS verified_by INTEGER,
      ADD COLUMN IF NOT EXISTS verified_at TIMESTAMPTZ;
    """,
    """
    DO $$
    BEGIN
      IF EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'bin_reports' AND column_name = 'reporter_id'
      ) THEN
        ALTER TABLE bin_reports ALTER COLUMN reporter_id DROP NOT NULL;
      END IF;
    END $$;
    """,
    """
    DO $$
    BEGIN
      IF EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'bin_reports' AND column_name = 'ai_fill_level'
      ) THEN
        UPDATE bin_reports
        SET fill_level = COALESCE(fill_level, ai_fill_level)
        WHERE fill_level IS NULL;
      END IF;

      IF EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'bin_reports' AND column_name = 'ai_waste_type'
      ) THEN
        UPDATE bin_reports
        SET waste_type = COALESCE(waste_type, ai_waste_type)
        WHERE waste_type IS NULL;
      END IF;

      IF EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'bin_reports' AND column_name = 'ai_analysis'
      ) THEN
        UPDATE bin_reports
        SET ai_observations = COALESCE(ai_observations, ai_analysis)
        WHERE ai_observations IS NULL;
      END IF;

      IF EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'bin_reports' AND column_name = 'latitude'
      ) THEN
        UPDATE bin_reports
        SET reporter_lat = COALESCE(reporter_lat, latitude)
        WHERE reporter_lat IS NULL;
      END IF;

      IF EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'bin_reports' AND column_name = 'longitude'
      ) THEN
        UPDATE bin_reports
        SET reporter_lng = COALESCE(reporter_lng, longitude)
        WHERE reporter_lng IS NULL;
      END IF;
    END $$;
    """,
    """
    UPDATE bin_reports
    SET status = CASE
      WHEN status IS NOT NULL THEN status
      WHEN notes = 'pending_verification' THEN 'pending'
      WHEN notes = 'verified' THEN 'verified'
      WHEN notes LIKE 'rejected%' THEN 'rejected'
      ELSE 'pending'
    END;
    """,
    """
    UPDATE bin_reports
    SET status = 'pending'
    WHERE status IS NULL OR status = '';
    """,
    """
    ALTER TABLE IF EXISTS shg_reports
      ADD COLUMN IF NOT EXISTS bin_id INTEGER REFERENCES bins(id);
    """,
    """
    ALTER TABLE IF EXISTS users
      ADD COLUMN IF NOT EXISTS expo_push_token VARCHAR(255);
    """,
]


def sync_database_schema(engine) -> None:
    with engine.begin() as connection:
        for statement in SCHEMA_STATEMENTS:
            connection.execute(text(statement))

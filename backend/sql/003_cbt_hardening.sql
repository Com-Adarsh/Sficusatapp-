ALTER TABLE answer_key_entries
  ADD COLUMN IF NOT EXISTS correct_options text[];

UPDATE answer_key_entries
SET correct_options = ARRAY[correct_option]
WHERE correct_options IS NULL;

ALTER TABLE answer_key_entries
  ALTER COLUMN correct_options SET DEFAULT ARRAY[]::text[];

CREATE INDEX IF NOT EXISTS idx_exam_attempts_user ON exam_attempts(user_id, exam_id);
CREATE INDEX IF NOT EXISTS idx_exam_results_exam_score ON exam_results(exam_id, score DESC);
CREATE INDEX IF NOT EXISTS idx_exam_registrations_exam_status ON exam_registrations(exam_id, status);
CREATE INDEX IF NOT EXISTS idx_notifications_user_created ON notifications(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_actor_created ON audit_logs(actor_user_id, created_at DESC);

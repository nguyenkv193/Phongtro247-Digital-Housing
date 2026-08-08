ALTER TABLE transactions
    ADD COLUMN IF NOT EXISTS external_id VARCHAR(120),
    ADD COLUMN IF NOT EXISTS status VARCHAR(30) NOT NULL DEFAULT 'pending';

CREATE UNIQUE INDEX IF NOT EXISTS ux_transactions_external_id
    ON transactions(external_id)
    WHERE external_id IS NOT NULL;

CREATE TABLE IF NOT EXISTS master_codes
(
    id            BIGSERIAL PRIMARY KEY,
    category_code VARCHAR(50)  NOT NULL,
    code          VARCHAR(50)  NOT NULL,
    name          VARCHAR(100) NOT NULL,
    description   VARCHAR(300),
    status        BOOLEAN      NOT NULL DEFAULT TRUE,
    created_at    TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at    TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_master_codes_category_code UNIQUE (category_code, code)
);

INSERT INTO master_codes (id, category_code, code, name, description, status, created_at, updated_at)
SELECT item.id,
       group_row.code,
       item.code,
       item.name,
       item.description,
       item.is_active,
       item.created_at::timestamp,
       item.updated_at::timestamp
FROM master_data_items item
JOIN master_data_groups group_row ON group_row.id = item.group_id
ON CONFLICT (category_code, code) DO NOTHING;

SELECT setval(
    pg_get_serial_sequence('master_codes', 'id'),
    COALESCE((SELECT MAX(id) FROM master_codes), 1),
    EXISTS (SELECT 1 FROM master_codes)
);

CREATE INDEX IF NOT EXISTS ix_master_codes_category_status_name
    ON master_codes(category_code, status, name);

DROP TRIGGER IF EXISTS master_codes_set_updated_at ON master_codes;
CREATE TRIGGER master_codes_set_updated_at
    BEFORE UPDATE ON master_codes
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

DROP TABLE IF EXISTS master_data_items;
DROP TABLE IF EXISTS master_data_groups;

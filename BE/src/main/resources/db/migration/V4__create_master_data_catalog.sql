CREATE TABLE IF NOT EXISTS master_data_groups (
    id BIGSERIAL PRIMARY KEY,
    code VARCHAR(80) NOT NULL UNIQUE,
    name VARCHAR(150) NOT NULL,
    description TEXT,
    is_system BOOLEAN NOT NULL DEFAULT FALSE,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    sort_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS master_data_items (
    id BIGSERIAL PRIMARY KEY,
    group_id BIGINT NOT NULL REFERENCES master_data_groups(id) ON DELETE RESTRICT,
    code VARCHAR(100) NOT NULL,
    name VARCHAR(150) NOT NULL,
    description TEXT,
    sort_order INTEGER NOT NULL DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_master_data_items_group_code UNIQUE (group_id, code)
);

CREATE INDEX IF NOT EXISTS ix_master_data_groups_active_order
    ON master_data_groups(is_active, sort_order, name);
CREATE INDEX IF NOT EXISTS ix_master_data_items_group_active_order
    ON master_data_items(group_id, is_active, sort_order, name);

INSERT INTO master_data_groups (code, name, description, is_system, sort_order)
VALUES
    ('AMENITY', 'Tiện ích phòng', 'Danh sách tiện ích có thể chọn cho tin đăng', TRUE, 10),
    ('SURROUNDING', 'Khu vực xung quanh', 'Các địa điểm và tiện ích xung quanh tin đăng', TRUE, 20),
    ('GENDER', 'Giới tính', 'Danh mục giới tính dùng trong hồ sơ', TRUE, 30),
    ('TRANSACTION_TYPE', 'Loại giao dịch', 'Danh mục loại giao dịch tài chính', TRUE, 40),
    ('EXPENSE_CATEGORY', 'Nhóm chi phí', 'Danh mục nhóm chi phí vận hành', TRUE, 50)
ON CONFLICT (code) DO UPDATE
SET name = EXCLUDED.name,
    description = EXCLUDED.description,
    updated_at = CURRENT_TIMESTAMP;

INSERT INTO master_data_items (group_id, code, name, sort_order)
SELECT id, seed.code, seed.name, seed.sort_order
FROM master_data_groups group_row
JOIN (
    VALUES
        ('AMENITY', 'gac-lung', 'Gác lửng', 10),
        ('AMENITY', 'wifi', 'Wifi', 20),
        ('AMENITY', 've-sinh-trong', 'Vệ sinh trong', 30),
        ('AMENITY', 'phong-tam', 'Phòng tắm', 40),
        ('AMENITY', 'binh-nong-lanh', 'Bình nóng lạnh', 50),
        ('AMENITY', 'ke-bep', 'Kệ bếp', 60),
        ('AMENITY', 'may-giat', 'Máy giặt', 70),
        ('AMENITY', 'tivi', 'Tivi', 80),
        ('AMENITY', 'dieu-hoa', 'Điều hòa', 90),
        ('AMENITY', 'tu-lanh', 'Tủ lạnh', 100),
        ('AMENITY', 'giuong-nem', 'Giường nệm', 110),
        ('AMENITY', 'tu-ao-quan', 'Tủ áo quần', 120),
        ('AMENITY', 'ban-cong-san-thuong', 'Ban công / sân thượng', 130),
        ('AMENITY', 'thang-may', 'Thang máy', 140),
        ('AMENITY', 'bai-de-xe-rieng', 'Bãi để xe riêng', 150),
        ('AMENITY', 'camera-an-ninh', 'Camera an ninh', 160),
        ('AMENITY', 'ho-boi', 'Hồ bơi', 170),
        ('AMENITY', 'san-vuon', 'Sân vườn', 180),
        ('SURROUNDING', 'cho', 'Chợ', 10),
        ('SURROUNDING', 'sieu-thi', 'Siêu thị', 20),
        ('SURROUNDING', 'benh-vien', 'Bệnh viện', 30),
        ('SURROUNDING', 'truong-hoc', 'Trường học', 40),
        ('SURROUNDING', 'cong-vien', 'Công viên', 50),
        ('SURROUNDING', 'ben-xe-bus', 'Bến xe bus', 60),
        ('SURROUNDING', 'trung-tam-the-duc-the-thao', 'Trung tâm thể dục thể thao', 70),
        ('GENDER', 'male', 'Nam', 10),
        ('GENDER', 'female', 'Nữ', 20),
        ('GENDER', 'other', 'Khác', 30),
        ('TRANSACTION_TYPE', 'deposit', 'Nạp tiền', 10),
        ('TRANSACTION_TYPE', 'payment', 'Thanh toán', 20),
        ('TRANSACTION_TYPE', 'refund', 'Hoàn tiền', 30),
        ('EXPENSE_CATEGORY', 'rent', 'Tiền thuê', 10),
        ('EXPENSE_CATEGORY', 'posting-fee', 'Phí đăng tin', 20),
        ('EXPENSE_CATEGORY', 'hot-listing-fee', 'Phí tin HOT', 30),
        ('EXPENSE_CATEGORY', 'other', 'Chi phí khác', 40)
) AS seed(group_code, code, name, sort_order) ON group_row.code = seed.group_code
ON CONFLICT (group_id, code) DO UPDATE
SET name = EXCLUDED.name,
    sort_order = EXCLUDED.sort_order,
    updated_at = CURRENT_TIMESTAMP;

DROP TRIGGER IF EXISTS master_data_groups_set_updated_at ON master_data_groups;
CREATE TRIGGER master_data_groups_set_updated_at
    BEFORE UPDATE ON master_data_groups
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS master_data_items_set_updated_at ON master_data_items;
CREATE TRIGGER master_data_items_set_updated_at
    BEFORE UPDATE ON master_data_items
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

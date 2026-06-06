-- 入居者アカウント（個人情報ゼロ設計）
CREATE TABLE IF NOT EXISTS tenants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  building_id UUID NOT NULL REFERENCES buildings(id) ON DELETE CASCADE,
  alias TEXT NOT NULL,
  access_code_hash TEXT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_tenants_building_id ON tenants(building_id);
CREATE UNIQUE INDEX idx_tenants_alias_building ON tenants(building_id, alias);
ALTER TABLE tenants ENABLE ROW LEVEL SECURITY;
CREATE POLICY "tenants_admin_all" ON tenants FOR ALL TO authenticated USING (true);
COMMENT ON TABLE tenants IS '入居者アカウント。個人情報は保持しない。仮名IDとコードハッシュのみ。';

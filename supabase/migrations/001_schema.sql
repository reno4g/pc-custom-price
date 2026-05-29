CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE part_categories (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  name text NOT NULL,
  max_quantity int NOT NULL DEFAULT 1,
  sort_order int NOT NULL
);

CREATE TABLE parts (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  category_id uuid NOT NULL REFERENCES part_categories(id) ON DELETE CASCADE,
  name text NOT NULL,
  spec text,
  is_active boolean NOT NULL DEFAULT true,
  sort_order int NOT NULL DEFAULT 0
);

CREATE TABLE tiers (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  name text NOT NULL,
  description text
);

CREATE TABLE part_prices (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  part_id uuid NOT NULL REFERENCES parts(id) ON DELETE CASCADE,
  tier_id uuid NOT NULL REFERENCES tiers(id) ON DELETE CASCADE,
  price integer NOT NULL CHECK (price >= 0),
  UNIQUE (part_id, tier_id)
);

CREATE TABLE profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  tier_id uuid REFERENCES tiers(id),
  company_name text NOT NULL DEFAULT '',
  is_admin boolean NOT NULL DEFAULT false
);

CREATE TABLE configurations (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE configuration_items (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  configuration_id uuid NOT NULL REFERENCES configurations(id) ON DELETE CASCADE,
  part_id uuid NOT NULL REFERENCES parts(id),
  quantity int NOT NULL DEFAULT 1 CHECK (quantity > 0)
);

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$ BEGIN NEW.updated_at = now(); RETURN NEW; END; $$ LANGUAGE plpgsql;

CREATE TRIGGER trg_configurations_updated_at
  BEFORE UPDATE ON configurations FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, company_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'company_name', ''));
  RETURN NEW;
END; $$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION handle_new_user();

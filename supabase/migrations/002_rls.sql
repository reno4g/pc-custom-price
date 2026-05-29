ALTER TABLE part_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE parts ENABLE ROW LEVEL SECURITY;
ALTER TABLE tiers ENABLE ROW LEVEL SECURITY;
ALTER TABLE part_prices ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE configurations ENABLE ROW LEVEL SECURITY;
ALTER TABLE configuration_items ENABLE ROW LEVEL SECURITY;

-- Public read for categories and active parts
CREATE POLICY "auth read categories" ON part_categories FOR SELECT TO authenticated USING (true);
CREATE POLICY "auth read active parts" ON parts FOR SELECT TO authenticated USING (is_active = true);
CREATE POLICY "auth read tiers" ON tiers FOR SELECT TO authenticated USING (true);

-- Part prices: only user's tier
CREATE POLICY "own tier prices" ON part_prices FOR SELECT TO authenticated
  USING (tier_id = (SELECT tier_id FROM profiles WHERE id = auth.uid()));

-- Profiles: own row only
CREATE POLICY "own profile read" ON profiles FOR SELECT TO authenticated USING (id = auth.uid());
CREATE POLICY "own profile update" ON profiles FOR UPDATE TO authenticated USING (id = auth.uid());
CREATE POLICY "own profile insert" ON profiles FOR INSERT TO authenticated WITH CHECK (id = auth.uid());

-- Configurations: own rows
CREATE POLICY "own configs" ON configurations FOR ALL TO authenticated USING (user_id = auth.uid());

-- Configuration items: own configs
CREATE POLICY "own config items" ON configuration_items FOR ALL TO authenticated
  USING (configuration_id IN (SELECT id FROM configurations WHERE user_id = auth.uid()));

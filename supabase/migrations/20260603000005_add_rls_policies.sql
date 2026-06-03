-- buildings
alter table buildings enable row level security;

create policy "anyone can read buildings"
  on buildings for select using (true);

create policy "anyone can insert buildings"
  on buildings for insert with check (true);

create policy "anyone can update buildings"
  on buildings for update using (true);

-- statuses
alter table statuses enable row level security;

create policy "anyone can read statuses"
  on statuses for select using (true);

create policy "anyone can insert statuses"
  on statuses for insert with check (true);

create policy "anyone can update statuses"
  on statuses for update using (true);

-- status_history
alter table status_history enable row level security;

create policy "anyone can read status_history"
  on status_history for select using (true);

create policy "anyone can insert status_history"
  on status_history for insert with check (true);

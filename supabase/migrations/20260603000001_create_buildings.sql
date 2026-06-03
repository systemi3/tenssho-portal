create table buildings (
  id   uuid primary key default gen_random_uuid(),
  name text not null
);

alter table buildings enable row level security;

create policy "anyone can read buildings"
  on buildings for select using (true);

create policy "anyone can insert buildings"
  on buildings for insert with check (true);

create policy "anyone can update buildings"
  on buildings for update using (true);

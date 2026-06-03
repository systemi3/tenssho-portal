create table statuses (
  id          uuid primary key default gen_random_uuid(),
  building_id uuid not null references buildings(id) on delete cascade,
  category    text not null check (category in ('設備系', '清掃系', 'インシデント系', '入退館系')),
  item        text not null,
  status      text not null check (status in ('正常', '異常', '対応中')),
  updated_at  timestamptz not null default now()
);

alter table statuses enable row level security;

create policy "anyone can read statuses"
  on statuses for select using (true);

create policy "anyone can insert statuses"
  on statuses for insert with check (true);

create policy "anyone can update statuses"
  on statuses for update using (true);

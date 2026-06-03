create table status_history (
  id          uuid primary key default gen_random_uuid(),
  building_id uuid not null references buildings(id) on delete cascade,
  category    text not null check (category in ('設備系', '清掃系', 'インシデント系', '入退館系')),
  item        text not null,
  status      text not null check (status in ('正常', '異常', '対応中')),
  changed_at  timestamptz not null default now(),
  memo        text
);

alter table status_history enable row level security;

create policy "anyone can read status_history"
  on status_history for select using (true);

create policy "anyone can insert status_history"
  on status_history for insert with check (true);

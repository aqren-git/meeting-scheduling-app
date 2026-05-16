-- ============================================================
-- DEMO SEED
-- ============================================================

-- 3 crews
insert into crews (name, color, display_order) values
  ('Team Alpha', '#16a34a', 1),
  ('Team Beta',  '#2563eb', 2),
  ('Team Gamma', '#d97706', 3);

-- Generate available slots for every weekday in the next 5 weeks
do $$
declare
  crew_record record;
  check_date  date := current_date;
  end_date    date := current_date + interval '35 days';
begin
  while check_date <= end_date loop
    if extract(dow from check_date) not in (0, 6) then
      for crew_record in select id from crews loop
        insert into slots (crew_id, date, status)
        values (crew_record.id, check_date, 'available')
        on conflict do nothing;
      end loop;
    end if;
    check_date := check_date + interval '1 day';
  end loop;
end;
$$;

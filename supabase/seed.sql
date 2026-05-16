-- ============================================================
-- DEMO SEED
-- ============================================================

-- 3 crews
insert into crews (name, color, display_order) values
  ('Team Alpha', '#16a34a', 1),
  ('Team Beta',  '#2563eb', 2),
  ('Team Gamma', '#d97706', 3);

-- Generate time slots for every weekday in the next 5 weeks.
-- Each crew gets 5 time slots per weekday: 8am, 10am, 12pm, 2pm, 4pm (2hr each).
do $$
declare
  crew_record record;
  check_date  date := current_date;
  end_date    date := current_date + interval '35 days';
  slot_times  time[] := array[
    '08:00'::time,
    '10:00'::time,
    '12:00'::time,
    '14:00'::time,
    '16:00'::time
  ];
  slot_time   time;
begin
  while check_date <= end_date loop
    if extract(dow from check_date) not in (0, 6) then
      for crew_record in select id from crews loop
        foreach slot_time in array slot_times loop
          insert into slots (crew_id, date, start_time, end_time, status)
          values (
            crew_record.id,
            check_date,
            slot_time,
            slot_time + interval '2 hours',
            'available'
          )
          on conflict do nothing;
        end loop;
      end loop;
    end if;
    check_date := check_date + interval '1 day';
  end loop;
end;
$$;

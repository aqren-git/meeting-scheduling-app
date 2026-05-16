-- ============================================================
-- updated_at TRIGGER
-- ============================================================
create or replace function set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger trg_crews_updated_at
  before update on crews
  for each row execute function set_updated_at();

create trigger trg_properties_updated_at
  before update on properties
  for each row execute function set_updated_at();

create trigger trg_slots_updated_at
  before update on slots
  for each row execute function set_updated_at();

-- ============================================================
-- AUDIT LOG TRIGGER
-- ============================================================
create or replace function log_slot_change()
returns trigger
language plpgsql
security definer
as $$
begin
  if (tg_op = 'INSERT') then
    insert into slot_audit_log(slot_id, action, old_status, new_status, metadata)
    values (new.id, 'INSERT', null, new.status, jsonb_build_object('crew_id', new.crew_id, 'date', new.date));
  elsif (tg_op = 'UPDATE') then
    insert into slot_audit_log(slot_id, action, old_status, new_status, metadata)
    values (new.id, 'UPDATE', old.status, new.status, jsonb_build_object(
      'crew_id', new.crew_id,
      'date', new.date,
      'booked_by_email', new.booked_by_email
    ));
  elsif (tg_op = 'DELETE') then
    insert into slot_audit_log(slot_id, action, old_status, new_status, metadata)
    values (old.id, 'DELETE', old.status, null, jsonb_build_object('crew_id', old.crew_id, 'date', old.date));
  end if;
  return coalesce(new, old);
end;
$$;

create trigger trg_slots_audit
  after insert or update or delete on slots
  for each row execute function log_slot_change();

-- ============================================================
-- AUTO-SET booked_at ON STATUS CHANGE
-- ============================================================
create or replace function set_booked_at()
returns trigger
language plpgsql
as $$
begin
  if new.status = 'booked' and old.status != 'booked' then
    new.booked_at = now();
  end if;
  if new.status = 'cancelled' and old.status != 'cancelled' then
    new.cancelled_at = now();
  end if;
  return new;
end;
$$;

create trigger trg_slots_booked_at
  before update on slots
  for each row execute function set_booked_at();

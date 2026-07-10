-- =============================================================================
-- BeingCamp — 0003_record_transaction_rpc.sql
-- Server-authoritative wallet: one atomic RPC updates the balance and writes
-- the ledger row, with row locking and overdraft protection. The client can
-- no longer desync a balance — it just reports what happened.
-- =============================================================================

create or replace function public.record_transaction(
  p_label  text,
  p_amount int,
  p_ref    text
)
returns json
language plpgsql
security invoker
set search_path = public, pg_temp
as $$
declare
  v_uid      uuid := auth.uid();
  v_balance  int;
  v_activity int;
  v_ref      text := p_ref;
  v_txn_id   uuid;
begin
  if v_uid is null then
    raise exception 'record_transaction: not authenticated';
  end if;

  -- Unknown refs file under 'admin' instead of violating the check constraint.
  if v_ref not in ('ritual','zone','pool','store','pack','service','gift','admin') then
    v_ref := 'admin';
  end if;

  select balance, activity_coins
    into v_balance, v_activity
    from public.profiles
   where id = v_uid
     for update;

  if not found then
    raise exception 'record_transaction: profile % not found', v_uid;
  end if;

  v_balance := v_balance + p_amount;
  if v_balance < 0 then
    raise exception 'record_transaction: insufficient balance';
  end if;
  if p_amount > 0 then
    v_activity := v_activity + p_amount;
  end if;

  update public.profiles
     set balance = v_balance,
         activity_coins = v_activity
   where id = v_uid;

  insert into public.transactions (profile_id, label, amount, ref)
  values (v_uid, p_label, p_amount, v_ref)
  returning id into v_txn_id;

  return json_build_object(
    'transaction_id', v_txn_id,
    'balance', v_balance,
    'activity_coins', v_activity
  );
end;
$$;

comment on function public.record_transaction(text, int, text)
  is 'Atomically adjust the calling user''s BeingCoin balance and append a ledger row.';

revoke execute on function public.record_transaction(text, int, text) from anon;
grant  execute on function public.record_transaction(text, int, text) to authenticated;

-- Nettoie les doublons owner : garde le plus ancien par user_id, supprime le reste.
delete from public.household_members
where is_owner = true
  and id not in (
    select distinct on (user_id) id
    from public.household_members
    where is_owner = true
    order by user_id, created_at asc
  );

-- Empêche toute future duplication d'owner par utilisateur.
create unique index if not exists idx_household_members_unique_owner
  on public.household_members(user_id) where (is_owner = true);

-- v4 §5. Nullable audio asset for Theta. Existing rows are unaffected.

alter table public.questions
  add column if not exists audio_asset_url text;

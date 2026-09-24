CREATE TABLE public.users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL CHECK (name = btrim(name) AND length(name) > 0),
  email text NOT NULL UNIQUE CHECK (email = btrim(email) AND length(email) > 0),
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE public.actions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.users(id),
  title varchar(160) NOT NULL CHECK (title = btrim(title) AND length(title) > 0),
  category text NOT NULL CHECK (category IN ('energy', 'waste', 'transport', 'food')),
  status text NOT NULL DEFAULT 'todo' CHECK (status IN ('todo', 'completed')),
  action_date date NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, action_date, title)
);
CREATE INDEX actions_user_date_idx ON public.actions(user_id, action_date);
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.actions ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.users, public.actions FROM anon, authenticated;

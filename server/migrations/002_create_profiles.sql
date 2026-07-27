-- Migration: Create profiles table for username→email mapping
-- Run this in the Supabase SQL editor or via psql using the service role key

CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  username text UNIQUE NOT NULL,
  email text UNIQUE NOT NULL,
  full_name text,
  role text,
  is_admin boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Example seed rows (run once via SQL editor)
-- INSERT INTO public.profiles (username, email, full_name, role, is_admin) VALUES
-- ('R.Sablang','redgelson@sablang.test','Redgelson Sablang','Researcher',true),
-- ('M.M.Sulit','mary@sulit.test','Mary Margarette Sulit','Research Leader',true);

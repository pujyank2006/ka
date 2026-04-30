-- ============================================================
-- PAGETURNER - Complete Supabase Schema
-- Run this in your Supabase SQL Editor (supabase.com → SQL Editor)
-- ============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- PROFILES TABLE (extends Supabase auth.users)
-- ============================================================
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT NOT NULL,
  username TEXT UNIQUE,
  avatar_url TEXT,
  role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, username)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'username', SPLIT_PART(NEW.email, '@', 1))
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================================
-- BOOKS TABLE
-- ============================================================
CREATE TABLE public.books (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  title TEXT NOT NULL,
  author TEXT NOT NULL,
  description TEXT,
  genre TEXT[] DEFAULT '{}',
  cover_url TEXT,
  pdf_url TEXT NOT NULL,
  uploaded_by UUID REFERENCES public.profiles(id),
  approved_by UUID REFERENCES public.profiles(id),
  status TEXT DEFAULT 'approved' CHECK (status IN ('pending', 'approved', 'rejected')),
  page_count INT DEFAULT 0,
  language TEXT DEFAULT 'English',
  published_year INT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- BOOK UPLOAD REQUESTS (user submissions awaiting admin approval)
-- ============================================================
CREATE TABLE public.book_requests (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  title TEXT NOT NULL,
  author TEXT NOT NULL,
  description TEXT,
  genre TEXT[] DEFAULT '{}',
  cover_url TEXT,
  pdf_url TEXT NOT NULL,
  requested_by UUID REFERENCES public.profiles(id),
  requester_email TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  admin_note TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- WISHLISTS TABLE
-- ============================================================
CREATE TABLE public.wishlists (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  book_id UUID REFERENCES public.books(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, book_id)
);

-- ============================================================
-- BOOKMARKS TABLE
-- ============================================================
CREATE TABLE public.bookmarks (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  book_id UUID REFERENCES public.books(id) ON DELETE CASCADE,
  page_number INT NOT NULL,
  label TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- NOTES TABLE (per-page notes while reading)
-- ============================================================
CREATE TABLE public.notes (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  book_id UUID REFERENCES public.books(id) ON DELETE CASCADE,
  page_number INT NOT NULL,
  content TEXT NOT NULL,
  highlight_text TEXT,
  color TEXT DEFAULT '#FFEB3B',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- READING PROGRESS TABLE
-- ============================================================
CREATE TABLE public.reading_progress (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  book_id UUID REFERENCES public.books(id) ON DELETE CASCADE,
  current_page INT DEFAULT 1,
  total_pages INT DEFAULT 0,
  last_read_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, book_id)
);

-- ============================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.books ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.book_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wishlists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookmarks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reading_progress ENABLE ROW LEVEL SECURITY;

-- Profiles: users can read all, update own
CREATE POLICY "Public profiles are viewable by everyone" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Books: everyone can view approved books, admins can do everything
CREATE POLICY "Anyone can view approved books" ON public.books FOR SELECT USING (status = 'approved');
CREATE POLICY "Admins can manage books" ON public.books FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Book requests: users see their own, admins see all
CREATE POLICY "Users see own requests" ON public.book_requests FOR SELECT USING (requested_by = auth.uid());
CREATE POLICY "Users can insert requests" ON public.book_requests FOR INSERT WITH CHECK (requested_by = auth.uid());
CREATE POLICY "Admins manage all requests" ON public.book_requests FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Wishlists, bookmarks, notes, progress: own data only
CREATE POLICY "Users manage own wishlists" ON public.wishlists FOR ALL USING (user_id = auth.uid());
CREATE POLICY "Users manage own bookmarks" ON public.bookmarks FOR ALL USING (user_id = auth.uid());
CREATE POLICY "Users manage own notes" ON public.notes FOR ALL USING (user_id = auth.uid());
CREATE POLICY "Users manage own progress" ON public.reading_progress FOR ALL USING (user_id = auth.uid());

-- ============================================================
-- STORAGE BUCKETS
-- Run these separately in Supabase Dashboard → Storage
-- Or via SQL:
-- ============================================================
-- INSERT INTO storage.buckets (id, name, public) VALUES ('books-pdf', 'books-pdf', false);
-- INSERT INTO storage.buckets (id, name, public) VALUES ('book-covers', 'book-covers', true);

-- Storage policies (run after creating buckets):
-- CREATE POLICY "Authenticated users can upload PDFs" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'books-pdf' AND auth.role() = 'authenticated');
-- CREATE POLICY "Authenticated users can read PDFs" ON storage.objects FOR SELECT USING (bucket_id = 'books-pdf' AND auth.role() = 'authenticated');
-- CREATE POLICY "Anyone can view covers" ON storage.objects FOR SELECT USING (bucket_id = 'book-covers');
-- CREATE POLICY "Authenticated users can upload covers" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'book-covers' AND auth.role() = 'authenticated');

-- ============================================================
-- MAKE A USER ADMIN (run after signing up with your admin email)
-- Replace 'admin@yourdomain.com' with your actual admin email
-- ============================================================
-- UPDATE public.profiles SET role = 'admin' WHERE email = 'admin@yourdomain.com';

-- ============================================================
-- SAMPLE DATA (optional - remove in production)
-- ============================================================
-- INSERT INTO public.books (title, author, description, genre, cover_url, pdf_url, status)
-- VALUES (
--   'The Great Gatsby',
--   'F. Scott Fitzgerald',
--   'A story of wealth, class, love, and the American Dream set in the 1920s.',
--   ARRAY['Classic', 'Fiction'],
--   'https://upload.wikimedia.org/wikipedia/commons/7/7a/The_Great_Gatsby_Cover_1925_Retouched.jpg',
--   'https://www.gutenberg.org/files/64317/64317-pdf.pdf',
--   'approved'
-- );

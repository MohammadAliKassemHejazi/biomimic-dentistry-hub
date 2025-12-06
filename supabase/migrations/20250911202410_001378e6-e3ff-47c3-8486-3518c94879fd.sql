-- Create profiles table for user data with roles
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  first_name TEXT,
  last_name TEXT,
  role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'vip', 'ambassador', 'admin')),
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create resources table for downloadable content
CREATE TABLE public.resources (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  file_url TEXT NOT NULL,
  file_name TEXT NOT NULL,
  file_size BIGINT,
  file_type TEXT NOT NULL,
  access_level TEXT NOT NULL DEFAULT 'public' CHECK (access_level IN ('public', 'vip', 'ambassador', 'admin')),
  category TEXT,
  tags TEXT[],
  download_count INTEGER NOT NULL DEFAULT 0,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create courses table for course management
CREATE TABLE public.courses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  price DECIMAL(10,2) NOT NULL DEFAULT 0,
  featured_image TEXT,
  coming_soon BOOLEAN NOT NULL DEFAULT false,
  launch_date TIMESTAMP WITH TIME ZONE,
  access_level TEXT NOT NULL DEFAULT 'public' CHECK (access_level IN ('public', 'vip', 'ambassador', 'admin')),
  stripe_price_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create purchases table for tracking course purchases
CREATE TABLE public.purchases (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  stripe_payment_intent_id TEXT,
  amount DECIMAL(10,2) NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed', 'refunded')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, course_id)
);

-- Create storage buckets for file uploads
INSERT INTO storage.buckets (id, name, public) VALUES
  ('avatars', 'avatars', true),
  ('resources', 'resources', false),
  ('course-images', 'course-images', true);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resources ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.purchases ENABLE ROW LEVEL SECURITY;

-- Create function to get user role
CREATE OR REPLACE FUNCTION public.get_user_role(user_uuid UUID)
RETURNS TEXT AS $$
BEGIN
  RETURN (SELECT role FROM public.profiles WHERE user_id = user_uuid);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- RLS Policies for profiles
CREATE POLICY "Users can view their own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all profiles" ON public.profiles
  FOR ALL USING (public.get_user_role(auth.uid()) = 'admin');

-- RLS Policies for resources
CREATE POLICY "Public resources are viewable by everyone" ON public.resources
  FOR SELECT USING (access_level = 'public');

CREATE POLICY "VIP resources are viewable by VIP+ users" ON public.resources
  FOR SELECT USING (
    access_level = 'vip' AND 
    public.get_user_role(auth.uid()) IN ('vip', 'ambassador', 'admin')
  );

CREATE POLICY "Ambassador resources are viewable by ambassadors+ users" ON public.resources
  FOR SELECT USING (
    access_level = 'ambassador' AND 
    public.get_user_role(auth.uid()) IN ('ambassador', 'admin')
  );

CREATE POLICY "Admin resources are viewable by admins only" ON public.resources
  FOR SELECT USING (
    access_level = 'admin' AND 
    public.get_user_role(auth.uid()) = 'admin'
  );

CREATE POLICY "Admins can manage all resources" ON public.resources
  FOR ALL USING (public.get_user_role(auth.uid()) = 'admin');

-- RLS Policies for courses
CREATE POLICY "Everyone can view courses" ON public.courses
  FOR SELECT USING (true);

CREATE POLICY "Admins can manage courses" ON public.courses
  FOR ALL USING (public.get_user_role(auth.uid()) = 'admin');

-- RLS Policies for purchases
CREATE POLICY "Users can view their own purchases" ON public.purchases
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own purchases" ON public.purchases
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all purchases" ON public.purchases
  FOR ALL USING (public.get_user_role(auth.uid()) = 'admin');

-- Storage policies for avatars
CREATE POLICY "Avatar images are publicly accessible" ON storage.objects
  FOR SELECT USING (bucket_id = 'avatars');

CREATE POLICY "Users can upload their own avatar" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'avatars' AND 
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can update their own avatar" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'avatars' AND 
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- Storage policies for resources
CREATE POLICY "Users can view purchased resources" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'resources' AND (
      public.get_user_role(auth.uid()) = 'admin' OR
      EXISTS (
        SELECT 1 FROM public.resources r 
        WHERE r.file_url LIKE '%' || name || '%' AND (
          r.access_level = 'public' OR
          (r.access_level = 'vip' AND public.get_user_role(auth.uid()) IN ('vip', 'ambassador', 'admin')) OR
          (r.access_level = 'ambassador' AND public.get_user_role(auth.uid()) IN ('ambassador', 'admin')) OR
          (r.access_level = 'admin' AND public.get_user_role(auth.uid()) = 'admin')
        )
      )
    )
  );

CREATE POLICY "Admins can upload resources" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'resources' AND 
    public.get_user_role(auth.uid()) = 'admin'
  );

-- Storage policies for course images
CREATE POLICY "Course images are publicly accessible" ON storage.objects
  FOR SELECT USING (bucket_id = 'course-images');

CREATE POLICY "Admins can upload course images" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'course-images' AND 
    public.get_user_role(auth.uid()) = 'admin'
  );

-- Create function to handle new user registration
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, email, first_name, last_name)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data ->> 'first_name',
    NEW.raw_user_meta_data ->> 'last_name'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new users
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_resources_updated_at
  BEFORE UPDATE ON public.resources
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_courses_updated_at
  BEFORE UPDATE ON public.courses
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
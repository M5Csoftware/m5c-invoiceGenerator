-- Create run_sessions table
CREATE TABLE public.run_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  run_number TEXT NOT NULL UNIQUE,
  header JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create awb_entries table
CREATE TABLE public.awb_entries (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  run_session_id UUID NOT NULL REFERENCES public.run_sessions(id) ON DELETE CASCADE,
  awb_no TEXT NOT NULL,
  items JSONB NOT NULL DEFAULT '[]',
  created_by TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(run_session_id, awb_no)
);

-- Enable Row Level Security (public access for collaborative sessions)
ALTER TABLE public.run_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.awb_entries ENABLE ROW LEVEL SECURITY;

-- Create policies for public access (anyone can read/write to collaborate)
CREATE POLICY "Anyone can view run sessions" 
  ON public.run_sessions FOR SELECT 
  USING (true);

CREATE POLICY "Anyone can create run sessions" 
  ON public.run_sessions FOR INSERT 
  WITH CHECK (true);

CREATE POLICY "Anyone can update run sessions" 
  ON public.run_sessions FOR UPDATE 
  USING (true);

CREATE POLICY "Anyone can view awb entries" 
  ON public.awb_entries FOR SELECT 
  USING (true);

CREATE POLICY "Anyone can create awb entries" 
  ON public.awb_entries FOR INSERT 
  WITH CHECK (true);

CREATE POLICY "Anyone can update awb entries" 
  ON public.awb_entries FOR UPDATE 
  USING (true);

CREATE POLICY "Anyone can delete awb entries" 
  ON public.awb_entries FOR DELETE 
  USING (true);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_run_sessions_updated_at
  BEFORE UPDATE ON public.run_sessions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_awb_entries_updated_at
  BEFORE UPDATE ON public.awb_entries
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Enable realtime for awb_entries table
ALTER PUBLICATION supabase_realtime ADD TABLE public.awb_entries;
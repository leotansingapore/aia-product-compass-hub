-- Create products table
CREATE TABLE public.products (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  category_id TEXT NOT NULL,
  tags TEXT[] DEFAULT '{}',
  highlights TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on products table
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- Create policy to allow anyone to view products
CREATE POLICY "Anyone can view products" 
ON public.products 
FOR SELECT 
USING (true);

-- Create policy to allow authenticated users to manage products (for admin functionality later)
CREATE POLICY "Authenticated users can manage products" 
ON public.products 
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- Add trigger for updated_at
CREATE TRIGGER update_products_updated_at
BEFORE UPDATE ON public.products
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert category data
INSERT INTO public.categories (id, name, description) VALUES 
  ('investment', 'Investment Products', 'Growth-focused solutions for wealth building'),
  ('endowment', 'Endowment Products', 'Balanced savings and protection plans'),
  ('whole-life', 'Whole Life Products', 'Lifelong protection with cash value'),
  ('term', 'Term Products', 'Affordable protection for specific periods'),
  ('medical', 'Medical Insurance Products', 'Comprehensive health protection')
ON CONFLICT (id) DO UPDATE SET 
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  updated_at = now();

-- Insert product data
INSERT INTO public.products (id, title, description, category_id, tags, highlights) VALUES 
  ('pro-achiever', 'Pro Achiever', 'Flexible investment plan with multiple fund options for long-term wealth building', 'investment', 
   '{"Flexible Premium", "Multiple Funds", "Long-term Growth"}', 
   '{"Choice of over 20 investment funds", "Flexible premium payment options", "Potential for higher returns", "Free fund switching"}'),
   
  ('pro-lifetime-protector', 'Pro Lifetime Protector', 'Investment-linked plan with built-in life protection coverage', 'investment',
   '{"Life Protection", "Investment Growth", "Premium Flexibility"}',
   '{"Combined investment and protection", "Flexible premium payment terms", "Multiple fund options available", "Death benefit protection included"}'),
   
  ('platinum-wealth-venture', 'Platinum Wealth Venture', 'Premium investment solution for high net worth individuals', 'investment',
   '{"High Net Worth", "Premium Funds", "Exclusive"}',
   '{"Access to exclusive investment funds", "Dedicated relationship management", "Advanced portfolio strategies", "Global investment opportunities"}'),
   
  ('smart-wealth-builder', 'Smart Wealth Builder', 'Balanced endowment plan combining savings and protection', 'endowment',
   '{"Savings", "Protection", "Maturity Benefit"}',
   '{"Guaranteed cash value growth", "Life protection coverage", "Maturity benefit payout", "Loan facility available"}'),
   
  ('retirement-saver', 'Retirement Saver', 'Long-term endowment plan designed for retirement planning', 'endowment',
   '{"Retirement Planning", "Guaranteed Returns", "Tax Benefits"}',
   '{"Guaranteed maturity benefit", "Annual bonus declarations", "Tax-efficient retirement planning", "Flexible premium payment options"}'),
   
  ('guaranteed-protect-plus', 'Guaranteed Protect Plus', 'Lifelong protection with increasing cash value', 'whole-life',
   '{"Lifelong Coverage", "Cash Value", "Dividends"}',
   '{"Lifetime protection coverage", "Participating policy with dividends", "Increasing cash value", "Estate planning benefits"}'),
   
  ('secure-flexi-term', 'Secure Flexi Term', 'Affordable protection for specific term periods', 'term',
   '{"Affordable", "High Coverage", "Renewable"}',
   '{"High coverage at low premiums", "Renewable and convertible options", "Various term periods available", "No medical exam for qualifying amounts"}'),
   
  ('ultimate-critical-cover', 'Ultimate Critical Cover', 'Comprehensive critical illness protection with term coverage', 'term',
   '{"Critical Illness", "Term Protection", "Multiple Claims"}',
   '{"Coverage for 100+ critical illnesses", "Multiple claim benefits", "Early stage coverage", "Premium waiver benefit"}'),
   
  ('healthshield-gold-max', 'Healthshield Gold Max', 'Comprehensive medical insurance with extended coverage', 'medical',
   '{"Comprehensive", "Cashless", "Worldwide Coverage"}',
   '{"Cashless treatment at panel hospitals", "Worldwide emergency coverage", "No claim bonus benefits", "Pre and post hospitalization coverage"}'),
   
  ('solitaire-pa', 'Solitaire PA', 'Personal accident insurance with comprehensive protection', 'medical',
   '{"Accident Protection", "24/7 Coverage", "Disability Benefits"}',
   '{"24/7 worldwide accident protection", "Disability income benefits", "Medical expense coverage", "Family coverage options"}');
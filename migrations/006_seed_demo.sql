-- ============================================================
-- 006_seed_demo.sql
-- SportXtreme Events — Seed Demo Data (Safe & Idempotent)
-- ============================================================

INSERT INTO public.events (title, category, sport, description, location, participants, event_date, status)
VALUES
  ('Mumbai Corporate Cricket League','CORPORATE','Cricket','Annual corporate cricket tournament featuring 32 companies','Mumbai, Maharashtra','500+','2025-03-15'::date,'upcoming'),
  ('SportXtreme City Marathon 2025','MARATHON','Running','City-wide marathon with 21K and 42K categories','Mumbai, Maharashtra','2,500+','2025-04-20'::date,'upcoming'),
  ('Inter-School Sports Championship','SCHOOL','Multi-Sport','Multi-sport championship for schools across Mumbai','Mumbai, Maharashtra','1,200+','2025-02-10'::date,'upcoming'),
  ('Football Super League Mumbai','LEAGUE','Football','Competitive football league with 16 teams','Mumbai, Maharashtra','800+','2025-05-01'::date,'upcoming'),
  ('Western Mumbai Cyclothon','CYCLING','Cycling','Inaugural cycling event across Western Mumbai','Mumbai, Maharashtra','3,000+','2025-06-15'::date,'upcoming'),
  ('Corporate Swim Challenge','AQUATIC','Swimming','Corporate swimming competition with relay and individual events','Mumbai, Maharashtra','400+','2025-07-20'::date,'upcoming'),
  ('TechCorp Basketball Tournament','CORPORATE','Basketball','Inter-company basketball championship for tech companies','Pune, Maharashtra','250+','2025-03-25'::date,'upcoming'),
  ('Half Marathon for Charity','MARATHON','Running','Charity half marathon supporting underprivileged children','Mumbai, Maharashtra','1,800+','2025-04-05'::date,'upcoming'),
  ('School Badminton Championship','SCHOOL','Badminton','Inter-school badminton tournament for U-14 and U-17','Mumbai, Maharashtra','300+','2025-02-25'::date,'upcoming');

INSERT INTO public.gallery (caption, category, event_name)
VALUES
  ('Mumbai Corporate Cricket League Finals','Corporate','Cricket'),
  ('City Marathon 2025 Start Line','Marathon','Running'),
  ('Inter-School Championship Awards','School','Multi-Sport'),
  ('Football Super League Match','League','Football'),
  ('Western Mumbai Cyclothon Route','Cycling','Cycling'),
  ('Corporate Swim Challenge','Aquatic','Swimming'),
  ('Basketball Tournament Finals','Corporate','Basketball'),
  ('Charity Half Marathon','Marathon','Running'),
  ('School Badminton Championship','School','Badminton');

INSERT INTO public.testimonials (name, role, text, stars)
VALUES
  ('Vikram Mehta','VP Operations, TechCorp India','SportXtreme transformed our annual corporate games into a world-class event. Their execution was flawless — every single detail accounted for.',5),
  ('Priya Sharma','Sports Director, Mumbai Schools Association','The school championship they organized was the most professionally run youth sporting event we have ever witnessed in the city.',5),
  ('Rahul Nair','Marathon Participant & Running Club Lead','The event execution was world-class. From setup to the final ceremony, everything was managed perfectly.',5);

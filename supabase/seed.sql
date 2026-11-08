-- Optional pilot directory / taxonomy seed. These are reference values, not real students.
insert into public.departments (university_id, name)
select u.id, d.name
from public.universities u
cross join (values
  ('Computer Science'),
  ('Electrical and Electronics Engineering'),
  ('Mechanical Engineering'),
  ('Environmental Engineering'),
  ('Medicine and Surgery'),
  ('Public Health'),
  ('Agriculture'),
  ('Business Administration'),
  ('Accounting'),
  ('Biological Sciences'),
  ('Chemistry'),
  ('Economics'),
  ('Mass Communication'),
  ('Law'),
  ('Education'),
  ('Fine and Applied Arts'),
  ('Sociology'),
  ('Political Science')
) as d(name)
where u.slug = 'wale-university'
on conflict (university_id, name) do nothing;

insert into public.skills (name, category) values
  ('Research', 'Research'),
  ('Data Analysis', 'Data'),
  ('Critical Thinking', 'Professional'),
  ('Communication', 'Professional'),
  ('Teamwork', 'Professional'),
  ('Project Management', 'Professional'),
  ('Problem Solving', 'Professional'),
  ('Writing', 'Communication'),
  ('Presentation', 'Communication'),
  ('Python', 'Technology'),
  ('JavaScript', 'Technology'),
  ('SQL', 'Technology'),
  ('CAD', 'Engineering'),
  ('Laboratory Methods', 'Science'),
  ('Field Research', 'Research'),
  ('Business Analysis', 'Business'),
  ('Digital Marketing', 'Business'),
  ('Design Thinking', 'Design')
on conflict (name) do nothing;

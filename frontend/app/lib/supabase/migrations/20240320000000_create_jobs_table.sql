-- Create jobs table
create table if not exists public.jobs (
    id uuid primary key default gen_random_uuid(),
    user_id uuid references auth.users(id) on delete cascade,
    status text not null default 'queued',
    video_name text,
    face_name text,
    appearances jsonb,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.jobs enable row level security;

-- Create policies
create policy "Users can view their own jobs"
    on public.jobs for select
    using (auth.uid() = user_id);

create policy "Users can insert their own jobs"
    on public.jobs for insert
    with check (auth.uid() = user_id);

create policy "Users can update their own jobs"
    on public.jobs for update
    using (auth.uid() = user_id);

-- Create function to update updated_at
create or replace function public.handle_updated_at()
returns trigger as $$
begin
    new.updated_at = timezone('utc'::text, now());
    return new;
end;
$$ language plpgsql;

-- Create trigger for updated_at
create trigger handle_updated_at
    before update on public.jobs
    for each row
    execute function public.handle_updated_at(); 
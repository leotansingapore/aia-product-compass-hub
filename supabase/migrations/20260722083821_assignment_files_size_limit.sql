-- Pin the assignment-files bucket to a 50 MB per-object limit so uploads that
-- can't succeed are rejected up front instead of after a long doomed transfer.
-- Previously file_size_limit was NULL (inheriting the project default), while
-- the client advertised a 500 MB cap — a mismatch that silently failed large
-- uploads with a cryptic "Payload too large".
update storage.buckets
set file_size_limit = 52428800  -- 50 * 1024 * 1024
where id = 'assignment-files';


-- Fix 404 link_to values in changelog_entries
-- /category/investment → correct category id for Investment Products
UPDATE changelog_entries SET link_to = '/category/c7cde8f4-12d4-4ddc-9150-7b32008a4e19'
WHERE link_to = '/category/investment';

-- /category/medical → Medical Insurance Products
UPDATE changelog_entries SET link_to = '/category/b1024527-481f-4d85-9192-b43633e9be4a'
WHERE link_to = '/category/medical';

-- /category/whole-life → Whole Life Products
UPDATE changelog_entries SET link_to = '/category/19b8c528-f36e-4731-827c-0cdb1de25059'
WHERE link_to = '/category/whole-life';

-- /category/training → Supplementary Training
UPDATE changelog_entries SET link_to = '/category/5ef0b17f-a19f-4859-8349-3e4959620e94'
WHERE link_to = '/category/training';

-- /category/products → no single category, redirect to dashboard
UPDATE changelog_entries SET link_to = '/'
WHERE link_to = '/category/products';

-- /category/scripts → scripts page
UPDATE changelog_entries SET link_to = '/scripts'
WHERE link_to = '/category/scripts';

-- /servicing → doesn't exist, point to changelog
UPDATE changelog_entries SET link_to = '/changelog'
WHERE link_to = '/servicing';

-- /playbooks → doesn't exist, point to scripts
UPDATE changelog_entries SET link_to = '/scripts'
WHERE link_to = '/playbooks';

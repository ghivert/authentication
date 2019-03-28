-- Revert the extension creation if activated, in order to avoid polluting the
--   global space with unused functions.
drop extension if exists "uuid-ossp";

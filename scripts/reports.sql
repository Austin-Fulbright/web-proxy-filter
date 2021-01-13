-- Get list of domains that have "apple" in them
select domain, requests
from (
    select domainRoot as 'domain', count(1) as 'requests'
    from vLogEntries
    group by domainRoot
    union 
    select domain, count(1) 
    from vLogEntries
    group by domain
) as 't'
where domain like '%apple%';

 
pg_dump -U postgres -h remote_host -p remote_port name_of_database > name_of_backup_file
 psql -U postgres -W -d lis_ent  -f ~/work/intan/ilogistics/backup_1.bak
 

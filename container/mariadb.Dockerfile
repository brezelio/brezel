FROM mariadb:12

COPY container/mariadb.cnf /etc/mysql/conf.d/zz-brezel.cnf

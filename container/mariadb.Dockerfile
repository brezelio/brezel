FROM mariadb:11.4

COPY container/mariadb.cnf /etc/mysql/conf.d/zz-brezel.cnf

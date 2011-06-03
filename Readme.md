#v0.1

### apache log monitoring

     this solution utilizes syslog and syslog-ng

          syslog
               - runs on each server where apache is installed
               - responsible for fielding each apache log messages

          syslog-ng
               - runs on central sever responsible for apache log aggregation

     add the following configurations to the apache conf

          LogFormat "%h %{X-Forwarded-For}i %{%d/%b/%Y %X}t %r %s %B %D %T" custom

               specifies log format

          CustomLog "|/usr/bin/logger -p local.info" custom

               pipes to syslog facilty "local.info"

     add the following configuration to the syslog conf

          local.*    @syslog-ng_IP

               forwarding facility to central syslog-ng instance

     add the following configuration to the syslog-ng conf

          source s_network { udp(ip(0.0.0.0) port(514)); };

          destination mongo_messages { udp("NODE_JS_UDP_APP_IP_ADDRESS" port(41234)); };

          filter apache_local { facility(local); };

          log {
               source(s_network);
               filter (apache_local);
               destination(mongo_messages);
          };

### installing npm (node package manager)

     curl http://npmjs.org/install.sh | sh

### node packages

     npm install winston mongoose journey

## requires

     mongoDB

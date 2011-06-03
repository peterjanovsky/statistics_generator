#v0.1

### apache log monitoring

     add the following configurations to the apache conf

          LogFormat "%h %{X-Forwarded-For}i %{%d/%b/%Y %X}t %r %s %B %D %T" custom

               specifies log format

          CustomLog "|/usr/bin/logger -p local.info" custom

               pipes to syslog facilty "local.info"

### installing npm (node package manager)

     curl http://npmjs.org/install.sh | sh

### node packages

     npm install winston mongoose journey

## requires

     mongoDB

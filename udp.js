// datagram sockets
var dgram = require('dgram');


// winston
var winston = require('winston');
winston.add(winston.transports.File, { filename: 'statistics.log' });
winston.remove(winston.transports.Console);


// mongoose
var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/statistics');


// mongoose - models
require('./models/log');
require('./models/user');
var logModel = mongoose.model('Log');
var userModel = mongoose.model('User');


// create udp4 socket
var server = dgram.createSocket("udp4");


// on socket message
server.on("message", function (buf, rinfo) {
  winston.log("info", "server received: [" + buf + "] from " + rinfo.address + ":" + rinfo.port);

  // apache log format
  //
  // - LogFormat "%h %{X-Forwarded-For}i %{%d/%b/%Y %X}t %r %s %B %D %T" custom
  //	%h			remote host
  //    %{X-Forwarded-For}i     originating client IP address through HTTP proxy or load balancer
  //	%{%d/%b/%Y %X}t		time the request was received (format - 24/May/2011 13:16:11)
  //	%r			first line of request
  //	%s			status
  //	%B			size of response in bytes, excluding HTTP headers
  //	%D			time taken to serve the request, in microseconds
  //	%T			time taken to serve the request, in seconds
  //
  //  - Health Check Log Example
  //	10.0.0.9 - 24/May/2011 13:16:17 GET /media/d0/d0/d0/d0/result.html?authtok=healthcheck HTTP/1.1 200 12 6785 0
  //
  // - Media Request Log Example
  //    10.0.0.9 157.127.124.15 24/May/2011 13:16:11 GET /media/d0/d0/d0/d2/dX/dF/dQ/2XFQ_6.M4A?sid=20891&did=PLAYIT&src=PLAYIT&tgt=PlayitWebPlayer&authtok=5246104560437184659_GjhV6tMAWCKCFVvI3iuFuwvt4 HTTP/1.1 200 2180600 6068701 6

  // convert buffer to string
  //
  // - syslog will prepend data to the string
  //    split on ending characters (logger:)
  var temp = buf.toString('utf8', 0, buf.length).split('logger:');
  if (temp.length != 2) {
    winston.log("error", "invalid format - server received: [" + buf + "] from " + rinfo.address + ":" + rinfo.port);
  } else {
    // trim beginning and ending whitespace
    //
    // - meta characters
    //    - '\s' matches whitespace characters (carriage return, new line and tab)
    var str = temp[1].replace(/^\s+|\s+$/g, '');

    // split incoming message
    //var parts = buf.toString('utf8', 0, buf.length).split(/ /);
    var parts = str.split(/ /);

    // the following code is debug only
    /*
    winston.log("info", "parts[0]: [" + parts[0] + "]");
    winston.log("info", "parts[1]: [" + parts[1] + "]");
    winston.log("info", "parts[2]: [" + parts[2] + "]");
    winston.log("info", "parts[3]: [" + parts[3] + "]");
    winston.log("info", "parts[4]: [" + parts[4] + "]");
    winston.log("info", "parts[5]: [" + parts[5] + "]");
    winston.log("info", "parts[5][length - 1]: [" + parts[5][parts[5].length - 1] + "]");
    winston.log("info", "parts[5][length - 2]: [" + parts[5][parts[5].length - 2] + "]");
    winston.log("info", "parts[5][length - 3]: [" + parts[5][parts[5].length - 3] + "]");
    winston.log("info", "parts[5][length - 4]: [" + parts[5][parts[5].length - 4] + "]");
    winston.log("info", "parts[5][length - 5]: [" + parts[5][parts[5].length - 5] + "]");
    winston.log("info", "parts[6]: [" + parts[6] + "]");
    winston.log("info", "parts[7]: [" + parts[7] + "]");
    winston.log("info", "parts[8]: [" + parts[8] + "]");
    winston.log("info", "parts[9]: [" + parts[9] + "]");
    winston.log("info", "parts[10]: [" + parts[10] + "]");
    */

    // ensure we only log valid requests
    //
    // - healthcheck
    //    last 5 chars (check)
    var len = parts[5].length;
    if ((parts[5][len - 1] != 'k') && (parts[5][len - 2] != 'c') && (parts[5][len - 3] != 'e') && (parts[5][len - 4] != 'h') && (parts[5][len - 5] != 'c')) {
      var instance = new logModel();
      instance.remote_host = parts[0];
      instance.x_forwarded_for = parts[1];
      instance.req_time = parts[2] + ' ' + parts[3];
      instance.req_method = parts[4];
      instance.req_url = parts[5];
      instance.res_status = parts[7];
      instance.res_size = parts[8];
      instance.res_time_microseconds = parts[9];
      instance.res_time_seconds = parts[10];
      instance.unparsed_log_entry = buf;
      instance.save(function(err) {
        if(err) {
          winston.log("error", err);
        }
      });
    }
  }
});


// on socket listening
server.on("listening", function () {
  var address = server.address();
  winston.log("info", "server listening: [" + address.address + ":" + address.port + "]");
});


server.bind(41234);

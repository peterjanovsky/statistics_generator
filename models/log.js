var mongoose = require('mongoose')
  , Schema = mongoose.Schema;

var Log = new Schema({
  remote_host             : { type: String }
  , x_forwarded_for       : { type: String }
  , req_time              : { type: Date }
  , req_method            : { type: String }
  , req_url               : { type: String }
  , res_status            : { type: String }
  , res_size              : { type: String }
  , res_time_microseconds : { type: String }
  , res_time_seconds      : { type: String }
  , unparsed_log_entry    : { type: String }
  , created_on            : { type: Date, default: Date.now }
  , updated_on            : { type: Date, default: Date.now }
});

mongoose.model('Log', Log);

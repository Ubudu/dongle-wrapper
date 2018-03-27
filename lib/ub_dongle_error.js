

function UBDongleError(code, message) {
  this.code = code;
  this.message = message;
  // this.stack = (new Error()).stack;
}

UBDongleError.prototype = new Error;

module.exports = UBDongleError;
const logWithTime = function() {
  return Function.prototype.bind.call(console.log, console, `${new Date().toISOString()}\t `);
}();

const errorWithTime = function() {
  return Function.prototype.bind.call(console.error, console, `${new Date().toISOString()}\t `);
}();

module.exports = { logWithTime, errorWithTime }
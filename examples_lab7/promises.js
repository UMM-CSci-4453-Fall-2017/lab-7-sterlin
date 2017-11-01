Promise = require('bluebird');

var promise = new Promise(function(resolve, reject) {
	console.log('Inside resolver function');
	resolve();
});

promise.then(function() {
	console.log('Inside onFulfilled handler');
});

console.log('End of Script');

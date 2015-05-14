if ( typeof Array.prototype.pushArray !== 'function' ) {
	Array.prototype.pushArray = function() {
		var toPush = this.concat.apply([], arguments);
		for (var i = 0, len = toPush.length; i < len; ++i) {
			this.push(toPush[i]);
		}
	};
}
module.exports.toImportPath = function(path) {
	return path
		// Backslash to forward
		.replace(/\\/g, "/")
		// Remove extension
		.replace(/([^.]*)(\.\w+)?/, "$1");
}

"use strict";

var path = require('path');
var ImportUtils = require('./ImportUtils');

class FileImport {
	constructor(match, file) {
		this.match = match;
		this.file = file;
	}
	equalsFile(file) {
		return file.getImportNormalizedPath() == this.getImportNormalizedPath();
	}
	getImportNormalizedPath() {
		var relativeDirectory = this.file.getDirectory();
		var importPath = this.match.getPath();
		var joinedPath = path.join(relativeDirectory, importPath);
		var normalizedPath = path.normalize(joinedPath);
		return ImportUtils.toImportPath(normalizedPath);
	}
	isRelativeImport() {
		return this.match.isRelativePath();
	}
	replaceWith(toFile, contents, baseFile) {
		if (!baseFile) {
			baseFile = this.file;
		}
		var importString = this.match.getImportString();
		var relativeImport = baseFile.getRelativeImport(toFile);
		var newImportString = this.match.getReplacedImportString(relativeImport);
		console.log({
			'from': importString,
			'to': newImportString,
			'file': this.file.getPath()
		});
		return contents.replace(importString, newImportString);
	}
	getAbsolutePath() {
		var relativeDirectory = this.file.getDirectory();
		return path.join(relativeDirectory, this.match.getPath());
	}
}

module.exports = FileImport;

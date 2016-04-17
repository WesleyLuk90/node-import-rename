"use strict";

var File = require('./File');
var _ = require('lodash');
var glob = require('glob');
var path = require('path');

class Renamer {
	constructor(fromFile, toFile, rootPath, options) {
		this.fromFile = new File(fromFile);
		this.toFile = new File(toFile);

		this.options = _.assign({
			fileTypes: ['.js', '.jsx'],
		}, options);

		this.findFiles(rootPath);
	}
	doRename(options) {
		this.files.forEach(file => {
			file.replaceImport(this.fromFile, this.toFile);
		});
		this.fromFile.updateImports(this.toFile);

		this.files.forEach(file => {
			file.writeChanges(options);
		});
		this.fromFile.writeMoveFile(this.toFile, options);
	}
	findFiles(rootPath) {
		var files = [];
		var search = this.options.fileTypes.map(fileExt => {
			return path.join(rootPath, "**/*" + fileExt);
		}).forEach(searchPath => {
			var paths = glob.sync(searchPath);
			paths.forEach(filePath => {
				var file = new File(filePath);
				if (!file.equals(this.fromFile) && !file.equals(this.toFile)) {
					files.push(file);
				}
			});
		});
		this.files = files;
	}
}

module.exports = Renamer;

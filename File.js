"use strict";

var fs = require('fs');
var path = require('path');
var Match = require('./Match');
var FileImport = require('./FileImport');
var ImportUtils = require('./ImportUtils');
var mkdirp = require('mkdirp');

class File {
	constructor(path) {
		this.path = path;
	}
	getImports() {
		if (!this.imports) {
			var match = null;
			var imports = [];
			var matcher = /var \w+ = require\(['"]([^'"]+)['"]\);|import .* from ['"]([^'"]+)['"];/g;
			while (match = matcher.exec(this.getOriginalContents())) {
				var myMatch = new Match(match);
				var fileImport = new FileImport(myMatch, this);
				imports.push(fileImport);
			}
			this.imports = imports;
		}
		return this.imports;
	}
	getOriginalContents() {
		if (!this.contents) {
			this.contents = fs.readFileSync(this.path, 'utf-8');
		}
		return this.contents;

	}
	equals(otherFile) {
		return this.normalizedPath() == otherFile.normalizedPath();
	}
	getPath() {
		return this.path;
	}
	normalizedPath() {
		return path.normalize(this.path);
	}
	getImportNormalizedPath() {
		return ImportUtils.toImportPath(this.normalizedPath());
	}
	getCurrentContents() {
		if (this.newContents) {
			return this.newContents;
		} else {
			return this.getOriginalContents();
		}
	}
	updateContents(newContents) {
		this.newContents = newContents;
	}
	replaceImport(fromFile, toFile, baseFile) {
		var replaced = false;
		this.getImports().forEach(
			fileImport => {
				if (fileImport.isRelativeImport() && fileImport.equalsFile(fromFile)) {
					var contents = fileImport.replaceWith(toFile, this.getCurrentContents(), baseFile);
					this.updateContents(contents);
					replaced = true;
				}
			});
		return replaced;
	}
	getDirectory() {
		return path.dirname(this.path);
	}
	getRelativeImport(toFile) {
		var relativePath = path.relative(this.getDirectory(), toFile.getPath());
		return ImportUtils.toImportPath(relativePath);
	}
	updateImports(toFile) {
		this.getImports().forEach(fileImport => {
			if (!fileImport.isRelativeImport()) {
				return;
			}
			var absPath = fileImport.getAbsolutePath();
			var existingImport = new File(absPath);
			var foundReplacement = this.replaceImport(existingImport, existingImport, toFile);
			if (!foundReplacement) {
				throw new Error("Failed to find replacement for ", absPath);
			}
		});
	}
	writeChanges(options) {
		if (!this.newContents) {
			return;
		}
		if (options.dryRun) {
			console.log("Writing file %s", this.getPath());
		} else {
			fs.writeFileSync(this.getPath(), this.getCurrentContents());
		}
	}
	writeMoveFile(toFile, options) {
		if (options.dryRun) {
			console.log("Creating directory %s", toFile.getDirectory());
		} else {
			mkdirp.sync(toFile.getDirectory());
		}
		if (options.dryRun) {
			console.log("Copying file %s => %s", this.getPath(), toFile.getPath());
		} else {
			fs.writeFileSync(toFile.getPath(), this.getCurrentContents());
		}
		if (options.dryRun) {
			console.log("Deleting file %s", this.getPath());
		} else {
			fs.unlinkSync(this.getPath());
		}
	}
}

module.exports = File;

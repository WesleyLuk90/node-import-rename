"use strict";


class Match {
	constructor(match) {
		this.match = match;
		this.pathMatch = /var \w+ = require\(['"]([^'"]+)['"]\);|import .* from ['"]([^'"]+)['"];/.exec(this.getImportString());
		this.path = this.pathMatch[1] || this.pathMatch[2];
		if (!this.pathMatch) {
			throw new Error("No path match found for " + match[0]);
		}
		if (!this.path) {
			throw new Error("No path found in " + match[0]);
		}
	}
	getPath() {
		return this.path;
	}
	isRelativePath() {
		return this.getPath()[0] == ".";
	}
	getImportString() {
		return this.match[0];
	}
	getReplacedImportString(newPath) {
		return this.getImportString()
			.replace(/(['"])([^'"]+)(['"])/g, "$1" + newPath + "$3");
	}
}

module.exports = Match;

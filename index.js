var argv = require('minimist')(process.argv.slice(2));
var Renamer = require('./Renamer');

function main(argv) {
	var fromPath = argv.from;
	if (!fromPath) {
		console.error("Missing argument --from");
		return;
	}
	var toPath = argv.to;
	if (!toPath) {
		console.error("Missing argument --to");
		return;
	}
	var rootPath = argv['root-path'];
	if (!rootPath) {
		console.error("Missing argument --root-path");
		return;
	}

	var options = {};
	if (argv['dry-run']) {
		options.dryRun = true;
	}

	var renamer = new Renamer(fromPath, toPath, rootPath);
	renamer.doRename(options);
}

main(argv);

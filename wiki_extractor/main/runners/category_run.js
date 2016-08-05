"use strict";

const argsOptions = [
	{name: "category", alias: "c", multiple: true, type: String, defaultValue: []},
	{name: "output_dir", alias: "o", multiple: false, type: String, defaultValue: ""}
];

var commandLineArgs = require('command-line-args')(argsOptions);

var bot = require('nodemw');
var fs = require('fs');

var client = new bot({
	server: 'en.wikipedia.org',  // host name of MediaWiki-powered site
	path: '/w',                  // path to api.php script
	debug: false                 // is more verbose when set to true
});

commandLineArgs.category.forEach(function (category) {

	console.log(category);

	client.getPagesInCategory(category, function (err, pages) {

		if (err) {
			console.error(err);
			return;
		}

		let pagesArr = pages.filter(function (page) {
								return page.ns === 0;
							})
							.map(function (page) {

								return page.title;

							});

		let output = commandLineArgs.output_dir + category.replace(" ", "_").toLowerCase() + ".json";
		console.log(output);
		let data = JSON.stringify(pagesArr);
		fs.writeFile(output, data, {flag: 'w+'}, err => {

			if (err) {
				console.error(err);
				return;
			}

			console.log("Successfully wrote " + category);

		});
	});

});
/** Grunt task for documentation generation based on comments in the source
	code.
*/
module.exports = function (grunt) {
	var optionsDefaults = {
		template: 'docs/docgen.template',
		commentRegExp: /\/\*\*(([^*]|\*+[^\/])*)\*+\//g,
		title: grunt.template.process('<%= pkg.name %>'),
		description: grunt.template.process('<%= pkg.description %>'),
		footer: grunt.template.process('<%= pkg.name %> (version <%= pkg.version %>)'
			+' by <a href="mailto:<%= pkg.author.email %>"><%= pkg.author.name %></a>.'),
		items: []
	};

	function escapeHTML(text) {
		var escapeSequences = { '<': '&lt;', '>': '&gt;', '"': '&quot;', '&': '&amp;' };
		return text.replace(/[<>&"]/g, function (match) {
			return escapeSequences[match];
		});
	}
	
	function parseComment(text) {
		text = escapeHTML(text.trim()) // Escape HTML special characters.
			.replace(/\s*\n\s+/g, '\n') // Clean spaces around ends of lines.
			.replace(/([.:]\n)/g, '$1\n'); // Put blank lines between paragraphs.
		var nameMatch = /^(\w+\s+)*((\w+\.)*\w+)\s*[(:=]/.exec(text),
			lines = text.split('\n'),
			header = nameMatch ? lines.shift() : '',
			content = nameMatch ? lines.join('\n') : text,
			modifiers = [];
		content = content
			.replace(/\[(.*?)\]\(((https?|ftp|mailto):.*?)\)/g, '<a href="$2" target="_blank">$1</a>') // Transform links.
			.replace(/`(.*?)`/g, '<code>$1</code>') // Transform code text.
			.replace(/(\n\s+[*-][^\n]*)+/g, function (match) { // Transform lists.
				return '\n<ul>'+ match.replace(/\n\s+[*-]([^\n]*)/g, '<li>$1</li>') +'</ul>';
			});
		return {
			name: nameMatch ? nameMatch[2] : '',
			header: header,
			content: content.split('\n\n'), // Split into paragraphs.
			modifiers: ['new', 'static', 'abstract'].filter(function (modifier) {
				return header && header.match(new RegExp('\\b'+ modifier +'\\s'));
			})
		};
	}
	
	function parseFile(path, options) {
		var input = grunt.file.read(path);
		input.replace(options.commentRegExp, function () {
			var parsed = parseComment(arguments[1]);
			if (parsed.name) {
				parsed.sourceFile = path;
				options.items.push(parsed);
			}
		});
	}
	
	function generateIndex(options) {
		var output = '<ul>',
			itemStack = [];
		options.items.sort(function (i1, i2) {
			return i1.name.toLowerCase().localeCompare(i2.name.toLowerCase());
		});
		options.items.forEach(function (item) {
			var name = item.name
				styles = item.modifiers.map(function (modifier) {
					return 'item_'+ modifier;
				}).join(' ');
			if (itemStack.length > 0) {
				if (item.name.indexOf(itemStack[0]) == 0) {
					output += '<ul>';
				} else {
					itemStack.shift();
					output += '</li>';
					while (itemStack.length > 0 && item.name.indexOf(itemStack[0]) != 0) {
						output += '</ul></li>';
						itemStack.shift();
					}
				}
			}
			if (itemStack.length > 0) {
				name = name.substr(itemStack[0].length);
			}
			
			output += '<li><span class="'+ styles +'"><a href="#'+ encodeURIComponent(item.name) +'"><code>'+ name +'</code></a></span>';
			itemStack.unshift(item.name +'.');
		});		
		if (options.items) {
			output += '</li>';
		}
		return output +'</ul>';
	}
	
	return grunt.registerMultiTask('docgen', 'Extract and concatenate documentation comments.', function() {
		var options = this.options(optionsDefaults);
		this.files.forEach(function (file) {
			file.src.filter(function (path) {
				return grunt.file.exists(path);
			}).forEach(function (path) {
				parseFile(path, options);
			})
			options.index = generateIndex(options);
			grunt.file.write(file.dest, grunt.template.process(grunt.file.read(options.template), { data: options }));
			grunt.log.writeln('Written ' + file.dest + '.');
		});
	});
};
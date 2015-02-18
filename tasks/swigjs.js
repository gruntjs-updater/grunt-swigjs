/*
 * grunt-swigjs
 * https://github.com/cedriceberhardt/grunt-swigjs
 *
 * Copyright (c) 2015 Cédric Eberhardt
 * Licensed under the MIT license.
 */

'use strict';

var swig = require('swig');

module.exports = function(grunt) {

    // Please see the Grunt documentation for more information regarding task
    // creation: http://gruntjs.com/creating-tasks

    grunt.registerMultiTask('swig', 'Grunt plugin for the Swig JavaScript Template Engine.', function() {
        // Merge task-specific and/or target-specific options with these defaults.
        var options = this.options({
            locals: {},
            tags: {},
            filters: {}
        });

        // Setup swig default configuration
        swig.setDefaults({
            // Get optional template path from options, setting root folder of where Swig looks for templates
            loader: options.templatePath ? swig.loaders.fs(options.templatePath) : swig.loaders.fs(),
            // Cache templates
            cache: options.cache === true ? true : false
        });

        // Register all filters
        for (var filter in options.filters) {
            swig.setFilter( filter, options.filters[filter] );
        }

        // Register all tags
        for (var tag in options.tags) {
            swig.setTag( tag, options.tags[tag].parse, options.tags[tag].compile, options.tags[tag].ends, options.tags[tag].blockLevel );

            if ( options.tags[tag].ext ) {
                swig.setExtension( tag, options.tags[tag].ext );
            }
        }

        // Iterate over all specified file groups.
        this.files.forEach(function(f) {
            // Concat specified files.
            var output = f.src.filter(function(filepath) {
                // Warn on and remove invalid source files (if nonull was set).
                if (!grunt.file.exists(filepath)) {
                    grunt.log.warn('Source file "' + filepath + '" not found.');
                    return false;
                } else {
                    return true;
                }
            }).map(function(filepath) {
                // Read file source.
                return {
                    source: grunt.file.read(filepath),
                    path: filepath
                };
            }); //.join(grunt.util.normalizelf(''));

            output.forEach(function(item) {
                var src = swig.render(item.source, {
                    filename: item.path,
                    locals: options.data
                });

                // Write the destination file.
                grunt.file.write(f.dest, src);

                // Print a success message.
                grunt.log.writeln('File "' + f.dest + '" created.');
            });

        });
    });

};

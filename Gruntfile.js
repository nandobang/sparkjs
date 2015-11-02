module.exports = function (grunt) {
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    todo: {
      options: {
      },
      target: [
        'src/**/*.js'
      ]
    },
    jshint: {
      all: [
        'src/**/*.js'
      ]
    },
    uglify: {
      target: {
        options: {
          mangle: true,
          compress: true
        },
        files: {
          'build/<%= pkg.name %>-<%= pkg.version %>.min.js': [
            'src/<%= pkg.name %>.js',
            'src/<%= pkg.name %>/*.js'
          ],
          'build/util-<%= pkg.version %>.min.js': 'src/util.js'
        }
      }
    },
    build: {
      src: 'src/<%= pkg.name %>.js',
      dest: 'build/<%= pkg.name %>-<%= pkg.version %>.min.js'
    }
  });

  grunt.loadNpmTasks('grunt-todo');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-uglify');

  grunt.registerTask('default', ['jshint', 'uglify']);
};

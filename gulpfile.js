/* global require, console */

"use strict";

var gulp = require("gulp");
var watch = require("gulp-watch");
var autoprefixer = require("gulp-autoprefixer");
var sass = require("gulp-sass");
var babel = require("gulp-babel");
var gutil = require("gulp-util");
var browserify = require("browserify");
var source = require("vinyl-source-stream");
var buffer = require("vinyl-buffer");
var uglify = require("gulp-uglify");
var csso = require("gulp-csso");
var del = require("del");

gulp.task("default", ["watch"]);

gulp.task("clean", function() {
    return del([
        "src/css",
        "src/js/tmp",
        "src/js/main.js"
    ]);
});

gulp.task("sass", function() {
    return gulp.src("src/scss/*.scss")
        .pipe(sass())
        .pipe(autoprefixer())
        .on("error", console.error.bind(console))
        .pipe(gulp.dest("src/css"));
});

gulp.task("babel", function() {
    return gulp.src("src/js/dev/*.js")
        .pipe(babel({
            presets: ["es2015"]
        }))
        .on("error", gutil.log)
        .pipe(gulp.dest("src/js/tmp"));
});

gulp.task("js", ["babel"], function() {
    return browserify("src/js/tmp/main.js").bundle()
        .pipe(source("main.js"))
        .pipe(buffer())
        .on("error", gutil.log)
        .pipe(gulp.dest("src/js"));
});

gulp.task("watch", function() {
    gulp.watch(["src/js/dev/*.js"], ["js"]);
    gulp.watch(["src/scss/*.scss", "src/scss/imports/*.scss"], ["sass"]);
});

gulp.task("build", ["build:html", "build:css", "build:js", "build:libs", "build:workers"], function() {
    return del([
        "src/css",
        "src/js/tmp",
        "src/js/main.js"
    ]);
});

gulp.task("build:html", function() {
    return gulp.src("src/index.html")
        .pipe(gulp.dest("dist"));
});

gulp.task("build:css", ["sass"], function() {
    return gulp.src("src/css/main.css")
		.pipe(csso())
        .pipe(gulp.dest("dist/css"));
});

gulp.task("build:js", ["js"], function() {
    return gulp.src("src/js/main.js")
		.pipe(uglify())
		.pipe(gulp.dest("dist/js"));
});

gulp.task("build:libs", function() {
    return gulp.src("src/js/libs/*.js")
		.pipe(gulp.dest("dist/js/libs"));
});

gulp.task("build:workers", function() {
    return gulp.src("src/js/workers/*.js")
        .pipe(babel({
            presets: ["es2015"]
        }))
        .pipe(gulp.dest("dist/js/workers"));
});

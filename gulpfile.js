
// tasks from David-Emmanuel Divernois (divdavem)

"use strict";

const gulp = require("gulp");
const path = require("path");
const rimraf = require("rimraf");
const webpack = require("webpack");
const webpackConfig = require("./webpack.config.js");

const processWebpackErrors = function (done) {
    return (inputErr, result) => {
        let outputErr = inputErr;
        if (!outputErr) {
            const stats = result.toJson();
            if (stats.errors.length > 0) {
                outputErr = stats.errors;
            }
        }
        if (done) {
            done(outputErr);
        } else {
            if (outputErr) {
                console.log("The following error(s) occurred:\n", Array.isArray(outputErr) ? outputErr.join("\n") : outputErr);
            } else {
                console.log("Build successful!");
            }
        }
    };
};

gulp.task("build", function (done) {
    webpack(webpackConfig).run(processWebpackErrors(done));
});

gulp.task("watch", function (done) {
    webpack(webpackConfig).watch({}, processWebpackErrors());
});

gulp.task("clean", function (done) {
    rimraf(webpackConfig.output.path, done);
});

gulp.task("default", ["build"]);

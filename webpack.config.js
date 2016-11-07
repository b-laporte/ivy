"use strict";

const path = require("path");
const webpack = require("webpack");
const prod = process.argv.indexOf("--production") > -1;

console.log(prod ? "Production mode" : "Development mode");

const plugins = [];

if (prod) {
    plugins.push(new webpack.optimize.UglifyJsPlugin());
}

module.exports = {
    entry: path.join(__dirname, "test/app.js"),
    output: {
        path: path.join(__dirname, "dist"),
        filename: "app.js"
    },
    module: {
        loaders: [
            {test: /\.js$/, exclude: /node_modules/, loader: "babel-loader"}
        ]
    },
    plugins: plugins,
    debug: !prod,
    devtool: prod ? "source-map" : null
};

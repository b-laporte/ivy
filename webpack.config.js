const path = require("path");

module.exports = {
    mode: 'development',
    target: 'node',
    entry: {
        "mocha.specs": "./src/test/testapp.ts"
    },
    // devtool: "inline-source-map",
    module: {
        rules: [
            {
                test: /\.ts$/,
                loader: "ts-loader",
                exclude: /node_modules/,
                options: {
                    configFile: "tsconfig.webpack.json"
                }
            },
            {
                test: /\.(ts|js)$/,
                loader: "./dist/webpack/loader.js"
            }
        ]
    },
    resolve: {
        extensions: [".ts", ".js"]
    },
    output: {
        filename: "[name].js",
        path: path.resolve(__dirname, "dist")
    }
};
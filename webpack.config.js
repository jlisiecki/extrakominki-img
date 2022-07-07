//@ts-check
const path = require('path');
const nodeExternals = require('webpack-node-externals');

/** @type {import('webpack').Configuration} */
const config = {
    mode: 'production',
    target: 'node',
    entry: './src/index.ts',
    output: {
        path: path.join(__dirname, 'dist'),
        filename: 'index.js'
    },
    module: {
        rules: [{ test: /\.tsx?/, use: 'ts-loader' }]
    },
    externals: [nodeExternals()]
};

module.exports = config;

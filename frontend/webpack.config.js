const Dotenv = require('dotenv-webpack');
const path = require('path');
const TerserPlugin = require('terser-webpack-plugin');
const { TsconfigPathsPlugin } = require('tsconfig-paths-webpack-plugin');
const ReactRefreshWebpackPlugin = require('@pmmmwh/react-refresh-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyPlugin = require('copy-webpack-plugin');
const { config } = require('dotenv');

const dotEnvFile = '.env';
config({ path: dotEnvFile });
console.log(process.env);
const port = process.env.PORT || 3000;
const isProd = process.env.NODE_ENV === 'production';

/**
 * @type {import('webpack').Configuration}
 */
module.exports = {
    entry: {
        main: ['./src/index'],
    },

    mode: isProd ? 'production' : 'development',
    devtool: 'source-map',
    resolve: {
        extensions: ['.ts', '.tsx', '.js', '.mjs'],
        plugins: [new TsconfigPathsPlugin({})],
    },
    output: {
        filename: 'js/[name].[contenthash:8].bundle.js',
        publicPath: '/',
        path: path.join(__dirname, 'build'),
    },
    plugins: [
        new ReactRefreshWebpackPlugin({ overlay: false }),
        new Dotenv({ path: dotEnvFile, silent: true }),
        new HtmlWebpackPlugin({
            template: './public/index.html',
            templateParameters: {
                APP_PAGE_TITLE: process.env.APP_PAGE_TITLE,
            },
        }),
        new CopyPlugin({
            patterns: [
                {
                    from: 'public',
                    to: '',
                    toType: 'dir',
                    globOptions: {
                        ignore: ['**/index.html'],
                    },
                },
            ],
        }),
    ],
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                exclude: /node_modules/,
                use: {
                    loader: 'ts-loader',
                    options: {
                        transpileOnly: true,
                    },
                },
            },
            { test: /\.css$/i, use: ['style-loader', 'css-loader'] },
            { test: /\.svg/, use: [{ loader: '@svgr/webpack' }] },
            { test: /\.mjs$/, include: /node_modules/, type: 'javascript/auto' },
        ],
    },
    performance: {
        maxAssetSize: 1 * 1024 * 1024,
        maxEntrypointSize: 1 * 1024 * 1024,
    },
    experiments: {
        topLevelAwait: true,
        outputModule: true,
    },
    optimization: {
        minimize: isProd,
        minimizer: [
            new TerserPlugin({
                parallel: true,
                terserOptions: {
                    compress: {
                        drop_console: isProd,
                    },
                    ecma: 2022,
                },
            }),
        ],
        splitChunks: {
            cacheGroups: {
                vendor: {
                    test: /[\\/]node_modules[\\/]/,
                    name: 'vendors',
                    chunks: 'all',
                },
            },
        },
    },
    stats: {
        warningsFilter: /export .* was not found in/,
    },
    devServer: {
        port,
        hot: true,
        host: '0.0.0.0',
        allowedHosts: ['all'],
        historyApiFallback: true,
        static: path.join(__dirname, 'public'),
        client: {
            overlay: {
                runtimeErrors: error => {
                    const ignoreErrors = ['AxiosError'];
                    if (ignoreErrors.includes(error.name)) return false;
                    else return true;
                },
            },
        },
    },
};

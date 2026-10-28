const Dotenv = require('dotenv-webpack');
const path = require('path');
const TerserPlugin = require('terser-webpack-plugin');
const { TsconfigPathsPlugin } = require('tsconfig-paths-webpack-plugin');
const ReactRefreshWebpackPlugin = require('@pmmmwh/react-refresh-webpack-plugin');
const ReactRefreshTypeScript = require('react-refresh-typescript').default;
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyPlugin = require('copy-webpack-plugin');
const { config } = require('dotenv');

const dotEnvFile = '.env';
config({ path: dotEnvFile });

const port = process.env.PORT || 3000;

/**
 * @param {Record<string, unknown>} _env
 * @param {{ mode?: string }} argv
 * @returns {import('webpack').Configuration}
 */
module.exports = (_env, argv) => {
    const isProd = (argv.mode ?? process.env.NODE_ENV) === 'production';

    return {
        entry: {
            main: ['./src/index'],
        },

        mode: isProd ? 'production' : 'development',
        devtool: isProd ? false : 'source-map',
        resolve: {
            extensions: ['.ts', '.tsx', '.js', '.mjs'],
            plugins: [new TsconfigPathsPlugin({})],
        },
        output: {
            filename: 'js/[name].[contenthash:8].bundle.js',
            publicPath: '/',
            path: path.join(__dirname, 'build'),
            clean: true,
        },
        plugins: [
            ...(!isProd ? [new ReactRefreshWebpackPlugin({ overlay: false })] : []),
            new Dotenv({ path: dotEnvFile, silent: true }),
            new HtmlWebpackPlugin({
                template: './public/index.html',
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
                            getCustomTransformers: () => ({ before: isProd ? [] : [ReactRefreshTypeScript()] }),
                        },
                    },
                },
                {
                    test: /\.css$/i,
                    use: ['style-loader', { loader: 'css-loader', options: { esModule: false } }],
                },
                {
                    test: /\.(png|jpe?g|gif|webp|ico)$/i,
                    type: 'asset/resource',
                    generator: {
                        filename: 'assets/[name].[contenthash:8][ext]',
                    },
                },
                { test: /\.svg/, use: [{ loader: '@svgr/webpack' }] },
                { test: /\.mjs$/, include: /node_modules/, type: 'javascript/auto' },
            ],
        },
        performance: {
            maxAssetSize: 1 * 1024 * 1024,
            maxEntrypointSize: 1 * 1024 * 1024,
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
                chunks: 'all',
                cacheGroups: {
                    react: {
                        test: /[\\/]node_modules[\\/](react|react-dom|scheduler|react-router|react-router-dom)[\\/]/,
                        name: 'vendors-react',
                        priority: 30,
                    },
                    mui: {
                        test: /[\\/]node_modules[\\/](@mui|@emotion|@popperjs|react-transition-group|stylis)[\\/]/,
                        name: 'vendors-mui',
                        priority: 30,
                    },
                    leaflet: {
                        test: /[\\/]node_modules[\\/](leaflet|leaflet\.markercluster|react-leaflet|@react-leaflet)[\\/]/,
                        name: 'vendors-leaflet',
                        priority: 30,
                    },
                    maplibre: {
                        test: /[\\/]node_modules[\\/](maplibre-gl|react-map-gl|@vis\.gl|@maplibre)[\\/]/,
                        name: 'vendors-maplibre',
                        priority: 30,
                    },
                    deckgl: {
                        test: /[\\/]node_modules[\\/](@deck\.gl|@luma\.gl|@loaders\.gl|@math\.gl|@probe\.gl)[\\/]/,
                        name: 'vendors-deckgl',
                        priority: 30,
                    },
                    validation: {
                        test: /[\\/]node_modules[\\/](class-validator|class-transformer|validator|libphonenumber-js)[\\/]/,
                        name: 'vendors-validation',
                        priority: 30,
                    },
                    vendor: {
                        test: /[\\/]node_modules[\\/]/,
                        name: 'vendors',
                        priority: 10,
                    },
                },
            },
        },
        ignoreWarnings: [/export .* was not found in/],
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
};

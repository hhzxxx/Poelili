const Components = require('unplugin-vue-components/webpack')
const { ElementPlusResolver } = require('unplugin-vue-components/resolvers')

const path = require('path')

function resolve(dir) {
	return path.join(__dirname, dir)
}

module.exports = {
	publicPath: './',
	lintOnSave: false, // 取消 eslint
	devServer: {
		// can be overwritten by process.env.HOST
		host: '0.0.0.0',
		port: 9090,
	},
	css: {
		sourceMap: true,
	},
	chainWebpack: (config) => {
		config.resolve.alias
			.set('@', resolve('src'))
			.set('src', resolve('src'))
			.set('common', resolve('src/common'))
			.set('components', resolve('src/components'))
		config.module
			.rule("worker")
			.test(/\.worker\.js$/)
			.use("worker-loader")
			.loader("worker-loader")
			.options({
				inline: "fallback"
			});
		config.module.rule("js").exclude.add(/\.worker\.js$/);
	},
	pluginOptions: {
		electronBuilder: {
			nodeIntegration: true,
			builderOptions: {
				nsis: {
					allowToChangeInstallationDirectory: true,
					oneClick: false,
				},
				// win: {
				//   icon: './public/favicon.ico'
				// },
				// mac: {
				//   icon: './public/favicon.png'
				// },
				productName: 'Poelili',
			},
		},
	},
	configureWebpack: {
		plugins: [
			Components({
				resolvers: [ElementPlusResolver()],
			}),
		],
	},
}

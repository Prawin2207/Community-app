const { defineConfig } = require('@vue/cli-service')
const path = require('path')

module.exports = defineConfig({
    publicPath: '/app/',
    transpileDependencies: true,
    outputDir: path.resolve(__dirname, '../client')
})

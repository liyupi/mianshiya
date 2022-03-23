const { tcbConfig } = require('./config/getConfig');
const cloud = require('@cloudbase/node-sdk');

const app = cloud.init(tcbConfig);

module.exports = app;

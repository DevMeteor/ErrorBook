// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()

// 云函数入口函数
exports.main = async (event, context) => {
  try {
    const res = await cloud.openapi.security.imgSecCheck({
      media: {
        contentType: 'image/*',
        value: Buffer.from(event.img)
      }
    })
    return res;
  } catch (err) {
    return err;
  }
}
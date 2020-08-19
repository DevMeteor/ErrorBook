# 部署说明

1. 克隆项目到本地
2. 使用微信开发者工具打开项目
3. 将appid修改为你的appid，将云函数“checkText”和“checkImg”中“index.js”内云函数初始化的环境id为你的环境id
4. 上传并部署“cloudfunctions”中的三个云函数
5. 打开云开发控制台，创建“note”集合，将权限设置为”所有用户可读，仅创建者可写”
6. 开始使用
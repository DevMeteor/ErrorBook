//Page Object
const app = getApp();
const db = wx.cloud.database()
Page({
    data: {
        type: '数学',
        types: ["数学", "语文", "英语", "物理", "化学", "生物", "政治", "历史", "地理", "其他"]
    },
    //options(Object)
    onLoad: function (options) {
    },
    onReady: function () {

    },
    onShow: function () {

    },
    onHide: function () {

    },
    onUnload: function () {

    },
    onPullDownRefresh: function () {

    },
    onReachBottom: function () {

    },
    onShareAppMessage: function () {

    },
    onPageScroll: function () {

    },
    //item(index,pagePath,text)
    onTabItemTap: function (item) {

    },
    editorReady() {
        const that = this
        wx.createSelectorQuery().select('#editor').context(function (res) {
            that.editor = res.context
        }).exec()
    },
    insertImg() {
        wx.chooseImage({
            count: 9,
            sizeType: ['original', 'compressed'],
            sourceType: ['album', 'camera'],
            success: (result) => {
                const tempFilePaths = result.tempFilePaths
                var checks = []
                wx.showLoading({
                    title: '正在检查图片',
                    mask: true
                });
                tempFilePaths.forEach(item => {
                    checks.push(new Promise((resolve, reject) => {
                        wx.getFileSystemManager().readFile({
                            filePath: item,
                            success(res) {
                                wx.cloud.callFunction({
                                    name: 'checkImg',
                                    data: {
                                        img: res.data
                                    },
                                    success: res => {
                                        resolve(res.result.errCode)
                                    }
                                })
                            }
                        })
                    }))
                })
                Promise.all(checks).then((res) => {
                    wx.hideLoading();
                    for (var i in tempFilePaths) {
                        if (res[i] == 0) {
                            this.editor.insertImage({
                                src: tempFilePaths[i],
                                width: '100%',
                            })
                        }
                    }
                    if (res.length!=tempFilePaths.length) {
                        wx.showToast({
                            title: '违规图片未被插入',
                            icon: 'none'
                        });
                    }
                }).catch((e) => {
                    console.log(e)
                })
            }
        });
    },
    bold() {
        this.editor.format("bold", "")
    },
    italic() {
        this.editor.format("italic", "")
    },
    underline() {
        this.editor.format("underline", "")
    },
    h1() {
        this.editor.format("header", "H1")
    },
    h2() {
        this.editor.format("header", "H2")
    },
    h3() {
        this.editor.format("header", "H3")
    },
    undo() {
        this.editor.undo()
    },
    redo() {
        this.editor.redo()
    },
    touchEnd(e) {
        console.log(e)
    },
    prevent() {

    },
    save() {
        var that = this
        wx.showModal({
            content: '保存后将无法修改，是否继续？',
            success: (result) => {
                if (result.confirm) {
                    if (app.globalData.openid == '') {
                        wx.showToast({
                            title: '状态异常，请重启小程序重试'
                        });
                        return
                    }
                    wx.cloud.callFunction({
                        name: 'checkText',
                        data: {
                            content: '哈哈哈'
                        }
                    }).then(res => {
                        if (res.result.errCode == 0) {
                            that.performSave()
                            wx.showLoading({
                                title: "正在保存"
                            });
                        } else {
                            wx.showToast({
                                title: '存在违规内容，请修改',
                                icon: 'none'
                            });
                        }
                    }).catch(err => {
                        wx.showToast({
                            title: '内容审核失败，请稍后重试',
                            icon: 'none'
                        });
                    })
                }
            },
            fail: () => { },
            complete: () => { }
        });
    },
    performSave() {
        var that = this
        this.editor.getContents({
            success(res) {
                const delta = res.delta.ops
                var html = res.html
                console.log(html)
                var imgs = []
                for (var i in delta) {
                    const item = delta[i].insert
                    if (item.image != null) {
                        imgs.push(item.image)
                    }
                }
                if (imgs.length == 0) {
                    wx.showToast({
                        title: '至少要有一张图片',
                        icon: 'none'
                    });
                    return
                }
                if (imgs.length > 50) {
                    wx.showToast({
                        title: '每次最多只能上传50张图片',
                        icon: 'none'
                    });
                    return
                }
                var requests = []
                for (var i in imgs) {
                    const path = imgs[i]
                    requests.push(
                        wx.cloud.uploadFile({
                            cloudPath: app.globalData.openid + '/' + new Date().getTime() + "_" + i,
                            filePath: path
                        })
                    )
                }
                Promise.all(requests).then((res) => {
                    console.log(res)
                    if (res.length == imgs.length) {
                        var ids = []
                        for (var i in res) {
                            ids.push(res[i].fileID)
                        }
                        wx.cloud.getTempFileURL({
                            fileList: ids,
                            success: res => {
                                for (var i in imgs) {
                                    html = html.replace(imgs[i], res.fileList[i].tempFileURL)
                                }
                                var cover = res.fileList[0].tempFileURL
                                db.collection("note").add({
                                    data: {
                                        cover: cover,
                                        type: that.data.type,
                                        html: html,
                                        images: ids,
                                        timestamp: new Date().getTime()
                                    },
                                    success(res) {
                                        wx.showToast({
                                            title: '保存成功',
                                            success: (result) => {
                                                setTimeout(() => {
                                                    wx.navigateBack();
                                                    getCurrentPages()[0].refresh()
                                                }, 1500);
                                            }
                                        });
                                    }
                                })
                            },
                            fail: err => {
                                wx.showToast({
                                    title: '图片上传失败',
                                    icon: 'none'
                                });
                            }
                        })
                    } else {
                        wx.showToast({
                            title: '图片上传失败',
                            icon: 'none'
                        });
                    }
                }).catch((e) => {
                    wx.showToast({
                        title: '图片上传失败',
                        icon: 'none'
                    });
                })
            }
        })
    },
    clearFormat() {
        this.editor.removeFormat()
    },
    typeChange(e) {
        var that = this
        this.setData({
            type: that.data.types[parseInt(e.detail.value)]
        })
    }
});
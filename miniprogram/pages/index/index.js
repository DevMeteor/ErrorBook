//Page Object
const db = wx.cloud.database()
const app = getApp();
Page({
    data: {
        notes: []
    },
    //options(Object)
    onLoad: function (options) {
        var that = this
        wx.cloud.callFunction({
            name: 'getOpenid',
            success: res => {
                app.globalData.openid = res.result.openid
                that.refresh()
            },
            fail: err => {
                wx.showToast({
                    title: '登录失败，请重启小程序重试',
                    icon: 'none'
                });
            }
        })
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
        this.refresh()
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
    add() {
        wx.navigateTo({
            url: '/pages/add/add'
        });
    },
    refresh() {
        var that = this
        if (app.globalData.openid == '') {
            wx.showToast({
                title: '状态异常，请重启小程序重试',
                icon: 'none'
            });
            return
        }
        wx.showNavigationBarLoading();
        db.collection("note").where({
            _openid: app.globalData.openid
        }).field({
            _id: true,
            cover: true,
            type: true
        }).orderBy('timestamp', 'desc')
            .get()
            .then((res) => {
                wx.showToast({
                    title: '列表已刷新',
                    icon: 'none'
                });
                wx.hideNavigationBarLoading();
                wx.stopPullDownRefresh()
                that.setData({
                    notes: res.data
                })
            }).catch((e) => {
                wx.showToast({
                    title: '列表刷新失败，请重试',
                    icon: 'none'
                });
            })
    },
    display(e) {
        var item = e.currentTarget.dataset.item
        console.log(item)
        wx.navigateTo({
            url: '/pages/display/display?id=' + item._id
        });
    }
});
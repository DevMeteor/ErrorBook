//Page Object
const db = wx.cloud.database()
const app = getApp()
Page({
    data: {
        contents: '',
        id: '',
        showDelete: false,
        images: [],
        cover:''
    },
    //options(Object)
    onLoad: function (options) {
        var that = this
        this.setData({
            id: options.id
        })
        wx.showLoading({
            title: '正在获取数据',
            mask: true
        });
        db.collection("note").doc(this.data.id).get().then((res) => {
            that.setData({
                contents: res.data.html,
                showDelete: res.data._openid == app.globalData.openid,
                images: res.data.images,
                cover:res.data.cover
            })
            wx.hideLoading();
        }).catch((e) => {
            console.log(e)
            wx.showToast({
                title: '获取数据失败，请重试',
                icon: 'none'
            });
            setTimeout(() => {
                wx.navigateBack();
            }, 1500);
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

    },
    onReachBottom: function () {

    },
    onShareAppMessage: function () {
        console.log(this.data.id)
        return{
            path:'/pages/display/display?id='+this.data.id,
            imageUrl:this.data.cover
        }
    },
    onPageScroll: function () {

    },
    //item(index,pagePath,text)
    onTabItemTap: function (item) {

    },
    delete() {
        var that = this
        wx.showModal({
            content: '是否删除？',
            success: (result) => {
                if (result.confirm) {
                    wx.cloud.deleteFile({
                        fileList: that.data.images
                    }).then(res => {
                        db.collection("note").doc(that.data.id).remove().then(() => {
                            wx.navigateBack();
                            getCurrentPages()[0].refresh()
                        }).catch(() => {
                            wx.showToast({
                                title: '删除失败，请重试',
                                icon: 'none'
                            });
                        })
                    }).catch(error => {
                        wx.showToast({
                            title: '删除失败',
                            icon: 'none'
                        });
                    })
                }
            }
        });
    }
});
function main() {

    let appPackageName = 'com.tencent.qqmusic'
    let internalMkdirPath = '/storage/emulated/0/autojsdata/'
    // 首先检查无障碍服务是否已经启动
    auto.waitFor()
    // 打开悬浮窗，当程序结束自动关闭
    console.show(true)
    // 打印版本号
    console.verbose('当前版本号：' + app.versionCode)
    // 启动QQ音乐
    let startR = app.launch(appPackageName)
    console.verbose('starting')
    // 点击首页
    id("e3p").className("android.widget.TextView").text("首页").findOne().click()
    console.verbose('click 首页')
    // 点击‘免’按钮
    // let a =  id("h30").clickable(true).findOne().click()
    clickImg(internalMkdirPath + "btn2.jpg", 0.5);
    
    closeApp(appPackageName)
}


main()


function closeApp(packageName){
    app.openAppSetting(packageName)
    className("android.widget.LinearLayout").desc("结束运行").findOne().click()
    text('确定').findOne().click()
    home()
}

/**
 * @function clickImg
 * @description 查找并点击图片
 * @param smallImgPath {string} 提前截取的小图路径
 * @param threshold {number} 图片相似度。取值范围为0~1的浮点数。默认值为0.9
 * @return {Boolean} 是否找到并点击了图片
 */
function clickImg(smallImgPath, threshold) {
    threads.start(function () {
        sleep(1000)
        let startBtn = text('立即开始').findOne(2000)
        if (startBtn == null) {
            return
        }
        startBtn.click()
    })
    console.log(smallImgPath)
    requestScreenCapture(false);
    let smallImg = images.read(smallImgPath); //读取本地的领取图片
    let img = images.captureScreen();
    sleep(1000)
    console.verbose('images', img.getWidth(), img.getHeight(), smallImg)
    let result = images.findImage(img, smallImg, {
        threshold: threshold,
    }); //找到图会返回坐标 找不到返回null
    if (!result) {
        return false;
    } else {
        // 找到的坐标是给的smallImg左上角，要精确实现中心，用宽度和高度的一半确定点
        console.log(result.x+smallImg.getWidth()/2, result.y+smallImg.getHeight()/2)
        click(887, 311);
        return true;

    }
}
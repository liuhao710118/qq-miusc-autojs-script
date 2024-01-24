const appPackageName = 'com.tencent.qqmusic'
const internalMkdirPath = '/storage/emulated/0/autojsdata/'

let taskCount = 0

function main() {
    taskCount += 1
    console.verbose('执行第' + taskCount + '次任务')
    // 首先检查无障碍服务是否已经启动
    auto.waitFor()
    // 打开悬浮窗，当程序结束自动关闭
    console.show(true)
    // 打印版本号
    console.verbose('当前版本号：' + app.versionCode)
    // 启动之前关闭QQ音乐
    closeApp(appPackageName)
    // 启动QQ音乐
    openQQMiuscApp()
    // 使用多线程允许autojs客户端开启qq音乐
    allowOpenQQMiusc()
    // 点击首页
    id("e3p").className("android.widget.TextView").text("首页").findOne().click()
    console.verbose('click 首页')
    // 点击‘免’按钮
    clickAdvertisementGetDuration()
    // 关闭app
    // closeApp(appPackageName)
}


main()


function closeApp(packageName) {
    app.openAppSetting(packageName)
    let end_btn = className("android.widget.LinearLayout").desc("结束运行").findOne(2000)
    if (end_btn == null) {
        return
    }
    end_btn.click()
    let b = text('确定').findOne(2000)
    if (b != null) {
        b.click()
    }
    console.verbose('关闭qq音乐')
    home()
    sleep(1000)
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
        console.verbose('未找到‘免’按钮')
        return false;
    } else {
        // 找到的坐标是给的smallImg左上角，要精确实现中心，用宽度和高度的一半确定点
        console.log(result.x + smallImg.getWidth() / 2, result.y + smallImg.getHeight() / 2)
        click(887, 311);
        return true;

    }
}

/**
 * 第一次使用autojs客户端开启QQ音乐，会被系统提示放权限
 */
function allowOpenQQMiusc() {
    threads.start(function () {
        sleep(1000)
        let startBtn = text('允许').findOne(2000)
        if (startBtn == null) {
            console.verbose('未找到允许按钮，无需放权，直接下一步')
            return
        }
        startBtn.click()
        console.verbose('允许autojs开启QQ音乐')
        openQQMiuscApp()
    })
}

/**
 * 开启QQ音乐
 */
function openQQMiuscApp() {
    let startR = app.launch(appPackageName)
    console.verbose('starting',)
}

function find_closebtn_to_click(){
    let close_btn = text('关闭').findOne(2000)
    if (close_btn != null) {
        close_btn.click()
        console.verbose('找到关闭按钮，关闭当前广告')
    }
}

function clearBackGroundTask() {
    home()
    sleep(2000)
    openQQMiuscApp()
    find_closebtn_to_click()
    sleep(1000)
    home()
    sleep(500)
    console.verbose('打开后台任务')
    recents()
    let clear_btn = descContains('双击清理').findOne(3000)
    console.log('clear_btn', clear_btn)
    clear_btn.click()
    console.verbose('清除后台任务')
}

function clickAdvertisementGetDuration() {

    // 第一次进去直接就是广告
    // 第二次进去就会有‘续时长按钮’，广告分两种，一种是进去等待3秒，点击获取时长，一种是观看时长30秒退出获取奖励
    // 每天成功加时长的机会只有24次机会
    if(text("今日免费畅听次数已用完").findOne()!=null){
        console.verbose('今日免费畅听次数已用完')
        return
    }
    let a = id("h2z").findOne().click()
    if (!a) {
        console.verbose('打开免时长页面，失败，未找到免时长按钮')
        closeApp(appPackageName)
    }
    let continuous_btn = text('续时长').findOne()
    if (continuous_btn == null) {
        console.verbose('未找到‘续时长’按钮')
        sleep(2000)
    } else {
        continuous_btn.click()
        console.verbose('点击‘续时长’按钮')
    }
    let get_btn = text("点击一下，获得奖励").findOne(10 * 1000)
    if (get_btn == null) {
        console.verbose('未找到‘点击一下，获得奖励’按钮')
        // 获取‘已看完广告’
        let btn = textContains('已看完广告').findOne(35 * 1000)
        if (btn == null) {
            console.verbose('未获取‘已看完广告’')
            main()
            return
        }
        console.verbose('获取‘已看完广告’，循序《《《》》》')
        clearBackGroundTask()
        main()
        return
    }
    get_btn.click()
    console.verbose('点击‘点击一下，获取奖励’按钮')
    let lock = threads.lock()
    let complete = lock.newCondition()
    let i = threads.atomic()
    threads.start(function () {

        let allow_btn = text('允许').findOne(2000)
        i.getAndIncrement()
        if (allow_btn == null) {
            console.verbose('未找到允许按钮，时长允许按钮', 'atomic i =' + i)
        } else {
            allow_btn.click()
            i.getAndIncrement()
            console.verbose('点击‘允许’按钮，获取时长', 'atomic i =' + i)
        }
        lock.lock()
        complete.signal()
        lock.unlock()

    })
    lock.lock()
    console.verbose('等待子线程完成')
    complete.await()
    console.verbose('子线程完成')
    lock.unlock()
    console.verbose('执行清除任务')
    clearBackGroundTask()
    console.verbose('时长获取完成，循环开始《《《》》》')
    main()
}
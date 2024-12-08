let isSeeking = false;

let subFrameDocument = undefined;

let bossTimeout = undefined;

const schoolAndPerf = [
    "清华大学", "北京大学", "复旦大学", "上海交通大学", "浙江大学",
    "南京大学", "武汉大学", "中山大学", "华中科技大学", "山东大学",
    "哈尔滨工业大学", "同济大学", "北京航空航天大学", "东南大学", "西安交通大学",
    "四川大学", "北京理工大学", "天津大学", "中国人民大学", "北京科技大学",
    "大连理工大学", "中南大学", "南京理工大学", "南开大学",
    "厦门大学", "华东师范大学", "南昌大学", "东北大学", "北京邮电大学",
    "吉林大学", "西北工业大学", "重庆大学", "华北电力大学", "长安大学",
    "湖南大学", "北京外国语大学", "上海外国语大学", "上海财经大学", "上海大学",
    "中北大学", "南京财经大学", "南京邮电大学", "华东理工大学", "武汉理工大学",
    "广西大学", "兰州大学", "贵州大学", "郑州大学", "安徽大学",
    "宁波大学", "北京交通大学",

    "计算机科学与技术", "电子信息工程", "通信工程", "软件工程", "人工智能",
    "电气工程及其自动化", "自动化", "机械工程", "土木工程", "建筑学",
    "化学工程与工艺", "材料科学与工程", "环境工程", "能源与动力工程", "物理学",
    "数学与应用数学", "数据科学与大数据技术", "网络工程", "信息管理与信息系统", "安全工程", "工业设计",
    "生物工程", "地理信息科学", "土木工程"
]


// 定制一个休眠机制
async function sleep(duration) {
    return new Promise(resolve => setTimeout(resolve, duration));
}

// 点击按钮
async function clickBtn(className){
    let button = subFrameDocument.querySelector(className);
    if(button){
        button.click();
    }
}

// 判断存在的字符串与不存在的字符串
async function checkDivText(div, includeStrs, excludeStr) {
    // 获取div及其子元素的所有文本内容
    const allText = div?.innerText || div?.textContent;
    if(!allText){
        return false;
    }

    // 检查是否包含text2字符串
    if (allText.includes(excludeStr)) {
        return false;
    }

    // 检查是否包含text1数组中的任意字符串
    return includeStrs.some(text => allText.includes(text));
}

// 查询是否需要打招呼
async function greetResult(seekName){
    const allRecords = subFrameDocument.querySelectorAll('ul li.record-item');

    // 跳过打招呼超过10个的
    if(allRecords.length > 10){
        return;
    }

    // 打招呼
    await clickBtn(".button-chat-wrap.resumeGreet .btn.btn-greet");
}


// 刷新frame体
async function refreshFrame(){
    const subFrame = window.top.document.querySelector('iframe[name="recommendFrame"]');
    subFrameDocument = subFrame.contentDocument || subFrame.contentWindow.document;
}

// 打开过滤面板后应用上次过滤条件
async function filterPanel(){
    // 打开面板
    await clickBtn(".filter-arrow-down.iboss-down")
    await sleep(2000);

    // // // 应用上次过滤条件
    // await clickBtn(".recover")
    // await sleep(2000);

    // 点击应用
    let okButton = await subFrameDocument.querySelectorAll(".filter-wrap .btns .btn")[1];
    if(okButton){
        okButton.click();
    }
    await sleep(2000);
}

async function loopGreet(){
    // 选择所有的li标签下的div元素
    const allDivs = await subFrameDocument.querySelectorAll('ul.recommend-card-list li div.candidate-card-wrap .card-inner.new-geek-wrap');
    const divs = Array.prototype.filter.call(allDivs, function(element) {
        return !element.classList.contains('has-viewed');
    });

    for (let i = 0; i < divs.length; i++) {
        if(!isSeeking){
            break;
        }
        // 如果不满足则下一个
        let result = await checkDivText(divs[i], schoolAndPerf, "学院");
        if(!result){
            continue;
        }

        // 展开详情面板
        divs[i].click();
        await sleep(3000);

        // 此处需要判断是否需要打招呼
        console.log("name is: " + await subFrameDocument.querySelector('.geek-name')?.textContent);
        await greetResult();
        await sleep(5000);


        // 关闭面板
        await clickBtn(".dialog-custom-title .resume-custom-close");
        await sleep(3000);
    }

    await sleep(3000);
}


async function beginSeek() {
    isSeeking = true;
    for(let i=0;i<500;i++){
        if(!isSeeking){
            break;
        }
        // 这里是beginSeek方法的实现
        console.log('Seeking started...');
        // 更新按钮图标为暂停图标
        document.getElementById('seekControlButtonIcon').src = chrome.runtime.getURL('icons/pause.png');

        // 刷新一下上下文
        console.log('refreshFrame...');
        await refreshFrame()

        // 过滤下数据
        console.log('filterPanel...');
        await filterPanel();

        // 开始逐个打招呼
        console.log('loopGreet...');
        await loopGreet();

        // 开始逐个打招呼
        console.log('last loop...');
    }
}

async function pauseSeek() {
    // 这里是停止Seek方法的实现
    console.log('Seeking paused...');
    // 更新按钮图标为播放图标
    document.getElementById('seekControlButtonIcon').src = chrome.runtime.getURL('icons/play.png');

    isSeeking = false;
}

// 创建悬浮按钮
const button = document.createElement('button');
button.id = 'seekControlButton';
button.style.position = 'fixed';
button.style.top = '10px';
button.style.right = '10px';
button.style.zIndex = '9999';
button.style.border = 'none';
button.style.outline = 'none';
button.style.backgroundColor = 'transparent';
button.style.cursor = 'pointer';

// 设置按钮的初始图标
const buttonImage = document.createElement('img');
buttonImage.id = 'seekControlButtonIcon';
buttonImage.src = chrome.runtime.getURL('icons/play.png');
buttonImage.style.width = '50px';
buttonImage.style.height = '40px';
button.appendChild(buttonImage);

button.onclick = function() {
    if (isSeeking) {
        pauseSeek();
    } else {
        beginSeek();
    }
};

// 将按钮添加到页面中
document.body.appendChild(button);
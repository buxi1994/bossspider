let isSeeking = false;

let subFrameDocument = undefined;


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

// 查询是否需要打招呼
async function queryGreetResult(seekName){
    window.chrome.runtime.sendMessage({ action: "queryGreetResult", seekName: seekName }, function(response) {
        if (response) {
            console.log('Received data:', response);

            // TODO 在这里处理接收到的数据，并确定是否需要打招呼

        }
    });
}



// 刷新frame体
async function refreshFrame(){
    const subFrame = window.top.document.querySelector('iframe[name="recommendFrame"]');
    subFrameDocument = subFrame.contentDocument || subFrame.contentWindow.document;
}

// 打开过滤面板后应用上次过滤条件
async function filterPanel(){
    // 打开面板
    await clickBtn(".filter-label")
    await sleep(2000);

    // 应用上次过滤条件
    await clickBtn(".recover")
    await sleep(2000);

    // 点击应用
    let okButton = subFrameDocument.querySelectorAll(".filter-wrap .btns .btn")[1];
    if(okButton){
        okButton.click();
    }
    await sleep(2000);
}

async function loopGreet(){
    // 选择所有的li标签下的div元素
    const divs = subFrameDocument.querySelectorAll('ul.recommend-card-list li div.candidate-card-wrap .card-inner.new-geek-wrap');

    for (let i = 0; i < 3; i++) {
        // 展开详情面板
        divs[i].click();
        await sleep(3000);

        // 此处需要发送请求到服务端，根据服务端数据判断是否需要打招呼
        console.log("name is: " + subFrameDocument.querySelector('.geek-name')?.textContent);
        await sleep(5000);


        // 关闭面板
        await clickBtn(".dialog-custom-title .resume-custom-close");
        await sleep(3000);
    }
}


async function beginSeek() {
    // 这里是beginSeek方法的实现
    console.log('Seeking started...');
    // 更新按钮图标为暂停图标
    document.getElementById('seekControlButtonIcon').src = chrome.runtime.getURL('icons/pause.png');

    // 刷新一下上下文
    await refreshFrame()

    // 过滤下数据
    await filterPanel();

    // 开始逐个打招呼
    await loopGreet();

    isSeeking = true;
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
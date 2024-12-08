// 读取数据
function getData(callback) {
    chrome.storage.local.get('targetUrlData', function(result) {

        // TODO 处理请求
        // callback(result.targetUrlData);
    });
}

// 监听来自content.js的消息
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    if (request.action === "queryGreetResult") {
        getData(sendResponse);
        return true; // 表示异步响应
    }
});
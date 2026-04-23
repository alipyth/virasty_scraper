document.getElementById('startBtn').addEventListener('click', () => {
    const scrolls = document.getElementById('scrollCount').value;
    document.getElementById('startBtn').style.display = 'none';
    document.getElementById('stopBtn').style.display = 'block';
    
    chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
        chrome.tabs.sendMessage(tabs[0].id, {action: "start", maxScrolls: parseInt(scrolls)});
    });
});

document.getElementById('stopBtn').addEventListener('click', () => {
    chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
        chrome.tabs.sendMessage(tabs[0].id, {action: "stop"});
    });
    window.close(); // بستن پاپ‌آپ
});

let isScraping = false;
let scrapedData = new Set(); // استفاده از Set برای جلوگیری از ذخیره پست‌های تکراری
let scrollInterval;

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "start") {
        isScraping = true;
        startScraping(request.maxScrolls);
    } else if (request.action === "stop") {
        stopAndDownload();
    }
});

function extractPosts() {
    // پیدا کردن تمام کانتینرهای پست‌ها در صفحه (بر اساس ساختار سلکتور شما)
    const posts = document.querySelectorAll("blockquote");
    
    posts.forEach(post => {
        try {
            // استخراج نام
            let nameEl = post.querySelector(".ms-2.my-2 div:nth-child(1) > div");
            let name = nameEl ? nameEl.innerText.replace(/\n/g, ' ').trim() : "نامعلوم";

            // استخراج لینک عکس پروفایل
            let imgEl = post.querySelector("img");
            let imgSrc = imgEl ? imgEl.src : "بدون تصویر";

            // استخراج متن پست
            let textEl = post.querySelector(".post-contents");
            let text = textEl ? textEl.innerText.replace(/\n/g, ' ').trim() : "بدون متن";

            if (text !== "بدون متن") {
                let postData = `نام: ${name}\nتصویر: ${imgSrc}\nمتن: ${text}\n-----------------------------------\n`;
                scrapedData.add(postData);
            }
        } catch (e) {
            console.log("خطا در استخراج یک پست", e);
        }
    });
}

function startScraping(maxScrolls) {
    let currentScrolls = 0;
    scrapedData.clear();
    
    extractPosts(); // استخراج پست‌های اولیه قبل از اسکرول

    scrollInterval = setInterval(() => {
        if (!isScraping) return;

        window.scrollTo(0, document.body.scrollHeight);
        currentScrolls++;
        
        setTimeout(extractPosts, 1500); // 1.5 ثانیه صبر برای لود شدن محتوای جدید بعد از اسکرول

        if (currentScrolls >= maxScrolls) {
            stopAndDownload();
        }
    }, 3000); // هر 3 ثانیه یک بار اسکرول میکند (اجازه میدهد درخواست شبکه تکمیل شود)
}

function stopAndDownload() {
    if (!isScraping) return;
    isScraping = false;
    clearInterval(scrollInterval);
    
    let finalContent = Array.from(scrapedData).join('\n');
    if(finalContent.trim() === "") {
        alert("هیچ دیتایی یافت نشد!");
        return;
    }

    // ساخت فایل txt و دانلود آن
    const blob = new Blob(["\ufeff" + finalContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `virasty_data_${new Date().getTime()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

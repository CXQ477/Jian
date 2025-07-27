// 在现有代码基础上添加以下内容

// 修改postArticle函数，添加分享链接生成
function postArticle() {
    if (!currentUser) {
        document.getElementById('post-msg').textContent = '请先登录';
        return;
    }
    const title = document.getElementById('title').value.trim();
    const content = document.getElementById('content').value.trim();
    if (!title || !content) {
        document.getElementById('post-msg').textContent = '标题和内容不能为空';
        return;
    }
    
    const article = { 
        title, 
        content, 
        author: currentUser, 
        time: new Date().toLocaleString() 
    };
    
    // 保存到本地
    articles.unshift(article);
    saveArticles();
    
    // 生成分享链接
    const shareLink = generateShareLink(article);
    
    // 显示成功消息和分享链接
    document.getElementById('post-msg').innerHTML = `
        <div>发布成功！</div>
        <div style="margin-top:10px;">
            <strong>分享链接：</strong>
            <input type="text" id="share-link-input" value="${shareLink}" readonly 
                   style="width:70%; padding:5px; margin-right:5px;">
            <button class="blue-btn" onclick="copyShareLink()" 
                    style="padding:5px 10px;">复制</button>
        </div>
        <div style="margin-top:10px; color:#666;">
            将此链接发送给他人即可分享文章
        </div>
    `;
    
    renderArticles(articles);
}

// 添加复制链接功能
function copyShareLink() {
    const input = document.getElementById('share-link-input');
    input.select();
    document.execCommand('copy');
    alert('链接已复制到剪贴板');
}

// 修改初始化函数，添加URL文章加载
window.onload = function() {
    // 检查URL中是否有文章
    const urlArticle = loadArticleFromURL();
    if (urlArticle) {
        // 检查是否已存在相同文章
        const exists = articles.some(a => 
            a.title === urlArticle.title && 
            a.content === urlArticle.content && 
            a.author === urlArticle.author
        );
        
        if (!exists) {
            if (confirm('是否要导入URL中的文章？')) {
                articles.unshift(urlArticle);
                saveArticles();
            }
        }
    }
    
    renderArticles(articles);
    renderLoginStatus();
    if (currentUser) hideAuthForms();
}

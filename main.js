// main.js
// 登录与注册功能优化 + 文章本地存储同步

let users = JSON.parse(localStorage.getItem('users') || '[]');
let articles = JSON.parse(localStorage.getItem('articles') || '[]');
let currentUser = localStorage.getItem('currentUser') || null;

function saveUsers() {
    localStorage.setItem('users', JSON.stringify(users));
}
function saveArticles() {
    localStorage.setItem('articles', JSON.stringify(articles));
}
function saveCurrentUser() {
    if (currentUser) localStorage.setItem('currentUser', currentUser);
    else localStorage.removeItem('currentUser');
}

function register() {
    const username = document.getElementById('reg-username').value.trim();
    const password = document.getElementById('reg-password').value;
    const msg = document.getElementById('reg-msg');
    if (!username || !password) {
        msg.textContent = '用户名和密码不能为空';
        return;
    }
    if (users.find(u => u.username === username)) {
        msg.textContent = '用户名已存在';
        return;
    }
    users.push({ username, password });
    saveUsers();
    currentUser = username;
    saveCurrentUser();
    msg.textContent = '注册成功，欢迎 ' + username + '！';
    renderLoginStatus();
    hideAuthForms();
}

function login() {
    const username = document.getElementById('login-username').value.trim();
    const password = document.getElementById('login-password').value;
    const msg = document.getElementById('login-msg');
    const user = users.find(u => u.username === username && u.password === password);
    if (!user) {
        msg.textContent = '用户名或密码错误';
        return;
    }
    currentUser = username;
    saveCurrentUser();
    msg.textContent = '登录成功，欢迎 ' + username + '！';
    renderLoginStatus();
    hideAuthForms();
}

function logout() {
    currentUser = null;
    saveCurrentUser();
    renderLoginStatus();
    showAuthForms();
}

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
    articles.unshift({ title, content, author: currentUser, time: new Date().toLocaleString() });
    saveArticles();
    document.getElementById('post-msg').textContent = '发布成功！';
    renderArticles(articles);
}

function renderArticles(list) {
    const container = document.getElementById('article-list');
    if (list.length === 0) {
        container.innerHTML = '<p style="color:#90a4ae;">暂无文章</p>';
        return;
    }
    container.innerHTML = list.map((a, idx) => {
        let delBtn = '';
        if (currentUser && a.author === currentUser) {
            delBtn = `<button class='blue-btn' style='margin-left:1rem;padding:0.3rem 1rem;font-size:0.9rem;' onclick='deleteArticle(${idx})'>删除</button>`;
        }
        return `
        <div class="article">
            <h3>${a.title}</h3>
            <div style="color:#1976d2;font-size:0.95rem;">作者：${a.author} | 时间：${a.time}${delBtn}</div>
            <div style="margin-top:0.5rem;">${a.content.replace(/\n/g, '<br>')}</div>
        </div>
        `;
    }).join('');
}
// 删除文章，需输入密码验证
function deleteArticle(idx) {
    const article = articles[idx];
    if (!currentUser || !article || article.author !== currentUser) {
        alert('只能删除自己发布的文章');
        return;
    }
    const pwd = prompt('请输入注册时的密码以确认删除：');
    const user = users.find(u => u.username === currentUser);
    if (!user || user.password !== pwd) {
        alert('密码错误，无法删除');
        return;
    }
    if (!confirm('确定要删除这篇文章吗？')) return;
    articles.splice(idx, 1);
    saveArticles();
    renderArticles(articles);
}

function searchArticle() {
    const keyword = document.getElementById('search-input').value.trim();
    if (!keyword) {
        renderArticles(articles);
        return;
    }
    const result = articles.filter(a => a.title.includes(keyword));
    renderArticles(result);
}

function renderLoginStatus() {
    const loginArea = document.getElementById('login-area');
    if (currentUser) {
        loginArea.innerHTML = `<span style='color:#1976d2;'>已登录：${currentUser}</span> <button class='blue-btn' onclick='logout()'>退出登录</button>`;
        document.getElementById('post-msg').textContent = '';
    } else {
        loginArea.innerHTML = '';
    }
}

function hideAuthForms() {
    const reg = document.querySelector('.register');
    const reg2 = document.querySelectorAll('.register')[1];
    if (reg) reg.style.display = 'none';
    if (reg2) reg2.style.display = 'none';
}
function showAuthForms() {
    const reg = document.querySelector('.register');
    const reg2 = document.querySelectorAll('.register')[1];
    if (reg) reg.style.display = '';
    if (reg2) reg2.style.display = '';
}

// 初始化
window.onload = function() {
    renderArticles(articles);
    renderLoginStatus();
    if (currentUser) hideAuthForms();
}
// 发布文章时生成分享链接
function generateShareLink(article) {
  const compressed = LZString.compressToEncodedURIComponent(JSON.stringify(article));
  return `${window.location.origin}${window.location.pathname}?article=${compressed}`;
}

// 读取URL中的文章
function loadArticleFromURL() {
  const params = new URLSearchParams(window.location.search);
  if(params.has('article')) {
    try {
      return JSON.parse(LZString.decompressFromEncodedURIComponent(params.get('article')));
    } catch(e) {
      console.error('解析文章失败', e);
    }
  }
  return null;
}
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

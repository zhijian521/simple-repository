// 全局变量
let userInfo = null;
let hasParticipated = false;

// 默认用户信息
const defaultUserInfo = {
    name: "张宇航",
    jobNo: "X-SPACE-2024-001",
    companyName: "翔迅航天科技有限公司",
    photoUrl: ""
};

// 页面加载完成
window.onload = function() {
    // 显示loading动画
    document.getElementById('loading').style.display = 'flex';
    document.getElementById('userSection').classList.add('hidden');

    // 先尝试加载真实用户信息
    loadUserInfo();

    // 绑定模态框背景点击事件
    document.getElementById('modalBackdrop').addEventListener('click', closeModal);
};

// 加载用户信息
function loadUserInfo() {
    document.getElementById('errorMessage').classList.add('hidden');

    try {
        qing.call('getPersonInfo', {
            success: function(res) {
                console.log('用户信息:', res);

                if (res && res.success && res.data) {
                    // 获取成功，保存真实信息并显示
                    userInfo = res.data;
                    displayUserInfo(userInfo);
                } else {
                    // 获取失败，使用默认信息
                    console.warn('无法获取用户信息，使用默认信息');
                    displayUserInfo(defaultUserInfo);
                }
            },
            error: function(err) {
                // 请求失败，使用默认信息
                console.error('获取用户信息失败:', err);
                console.warn('获取用户信息失败，使用默认信息');
                displayUserInfo(defaultUserInfo);
            }
        });
    } catch (error) {
        // 调用失败，使用默认信息
        console.error('调用getPersonInfo失败:', error);
        console.warn('调用getPersonInfo失败，使用默认信息');
        displayUserInfo(defaultUserInfo);
    }
}

// 显示用户信息
function displayUserInfo(data) {
    // 隐藏loading状态
    document.getElementById('loading').style.display = 'none';

    // 确保用户区域可见
    document.getElementById('userSection').classList.remove('hidden');
    document.getElementById('lotteryBtn').disabled = false;

    // 填充用户信息
    document.getElementById('userName').textContent = data.name || '未知用户';
    document.getElementById('companyName').textContent = data.companyName || '翔迅科技';
    document.getElementById('jobNo').textContent = data.jobNo || '-';

    const photoImg = document.getElementById('userPhoto');
    const avatarPlaceholder = document.getElementById('avatarPlaceholder');

    if (data.photoUrl) {
        photoImg.src = data.photoUrl;
        photoImg.style.display = 'block';
        avatarPlaceholder.style.display = 'none';
    } else {
        photoImg.style.display = 'none';
        avatarPlaceholder.style.display = 'flex';
    }

    // 如果是默认信息，可以添加一个提示（可选）
    if (data === defaultUserInfo) {
        console.log('当前显示默认用户信息');
    }
}

// 参与抽奖
function participateLottery() {
    if (hasParticipated) {
        showError('您已经参与过抽奖了');
        return;
    }

    if (!userInfo) {
        showError('无法获取用户信息');
        return;
    }

    const btn = document.getElementById('lotteryBtn');
    const btnText = document.getElementById('btnText');
    const btnIcon = document.getElementById('btnIcon');

    // 检查元素是否存在
    if (!btn || !btnText || !btnIcon) {
        console.error('按钮元素未找到');
        return;
    }

    // 显示加载状态
    btn.disabled = true;
    btnText.textContent = '指令传输中...';
    btnIcon.innerHTML = '',
    btnIcon.classList.add('animate-spin');

    const requestData = {
        jobNo: userInfo.jobNo,
        eid: userInfo.eid,
        name: userInfo.name,
        photoUrl: userInfo.photoUrl,
        companyName: userInfo.companyName
    };

    // 发送抽奖请求
    sendLotteryRequest(requestData);
}

// 发送抽奖请求
function sendLotteryRequest(data) {
    console.log('发送抽奖参与请求:', data);

    // 模拟API请求延迟
    setTimeout(() => {
        console.log('抽奖请求成功（模拟）');
        hasParticipated = true;
        showModal();
        resetButton();
    }, 1500);
}

// 重置按钮状态
function resetButton() {
    const btn = document.getElementById('lotteryBtn');
    const btnText = document.getElementById('btnText');
    const btnIcon = document.getElementById('btnIcon');

    // 检查元素是否存在
    if (!btn || !btnText || !btnIcon) {
        console.error('按钮元素未找到');
        return;
    }

    if (hasParticipated) {
        btn.disabled = true;
        btnText.textContent = '抽奖指令已确认';
        btnIcon.innerHTML = `<path d="M20 6L9 17l-5-5" stroke="currentColor" stroke-width="3" fill="none"/>`;
        btnIcon.classList.remove('animate-spin');
        btn.classList.remove('btn-primary');
        btn.classList.add('bg-cyan-400/10', 'border-cyan-400/30', 'text-cyan-300');
    } else {
        btn.disabled = false;
        btnText.textContent = '提交抽奖指令';
        btnIcon.innerHTML = `<path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 00-2.91-.09z"/><path d="M12 15l-3-3a22 22 0 012-3.95A12.88 12.88 0 0122 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 01-4 2z"/><path d="M9 12l-4.5 4.5"/><path d="M14.5 4.5l3.5 3.5"/>`;
        btnIcon.classList.remove('animate-spin');
    }
}

// 显示错误消息
function showError(message) {
    const errorEl = document.getElementById('errorMessage');
    errorEl.textContent = message;
    errorEl.classList.remove('hidden');
    errorEl.classList.add('animate-fade-in');
}

// 显示成功弹窗
function showModal() {
    const modal = document.getElementById('modal');
    modal.classList.remove('hidden');
    modal.classList.add('animate-fade-in');

    // 简单的礼花效果
    createConfetti();
}

// 关闭弹窗
function closeModal() {
    const modal = document.getElementById('modal');
    modal.classList.add('hidden');
    modal.classList.remove('animate-fade-in');
}

// 创建礼花效果
function createConfetti() {
    const colors = ['#22d3ee', '#60a5fa', '#ffffff'];

    for (let i = 0; i < 50; i++) {
        setTimeout(() => {
            const confetti = document.createElement('div');
            confetti.style.cssText = `
                position: fixed;
                width: ${Math.random() * 8 + 4}px;
                height: ${Math.random() * 8 + 4}px;
                background: ${colors[Math.floor(Math.random() * colors.length)]};
                left: 50%;
                top: 50%;
                border-radius: ${Math.random() > 0.5 ? '50%' : '0'};
                pointer-events: none;
                z-index: 1000;
            `;
            document.body.appendChild(confetti);

            const angle = (Math.random() * 360) * (Math.PI / 180);
            const velocity = Math.random() * 200 + 100;
            const vx = Math.cos(angle) * velocity;
            const vy = Math.sin(angle) * velocity;

            let x = window.innerWidth / 2;
            let y = window.innerHeight / 2;
            let opacity = 1;

            const animate = () => {
                x += vx * 0.016;
                y += vy * 0.016 + 2;
                opacity -= 0.016;

                confetti.style.left = x + 'px';
                confetti.style.top = y + 'px';
                confetti.style.opacity = opacity;

                if (opacity > 0) {
                    requestAnimationFrame(animate);
                } else {
                    confetti.remove();
                }
            };

            requestAnimationFrame(animate);
        }, i * 10);
    }
}

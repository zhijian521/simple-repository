/**
 * 翔迅科技年会抽奖应用
 * @author 翔迅科技
 * @version 1.0.0
 */

/**
 * 抽奖应用主类
 */
class LotteryApp {
    constructor() {
        // 私有属性
        this._userInfo = null;
        this._hasParticipated = false;
        
        // 默认用户信息
        this._defaultUserInfo = {
            name: "张宇航",
            jobNo: "X-SPACE-2024-001",
            companyName: "翔迅航天科技有限公司",
            photoUrl: ""
        };
        
        // 缓存DOM元素
        this._elements = {
            loading: null,
            userSection: null,
            errorMessage: null,
            userName: null,
            companyName: null,
            jobNo: null,
            userPhoto: null,
            avatarPlaceholder: null,
            lotteryBtn: null,
            btnText: null,
            modal: null,
            modalBackdrop: null
        };
        
        // 初始化
        this._init();
    }
    
    /**
     * 初始化应用
     * @private
     */
    _init() {
        try {
            this._cacheElements();
            this._bindEvents();
            this._loadUserInfo();
            this._showLoading();
        } catch (error) {
            console.error('初始化应用失败:', error);
            this._showError('应用初始化失败，请刷新页面重试');
        }
    }
    
    /**
     * 缓存DOM元素
     * @private
     */
    _cacheElements() {
        const elements = {
            loading: document.getElementById('loading'),
            userSection: document.getElementById('userSection'),
            errorMessage: document.getElementById('errorMessage'),
            userName: document.getElementById('userName'),
            companyName: document.getElementById('companyName'),
            jobNo: document.getElementById('jobNo'),
            userPhoto: document.getElementById('userPhoto'),
            avatarPlaceholder: document.getElementById('avatarPlaceholder'),
            lotteryBtn: document.getElementById('lotteryBtn'),
            btnText: document.getElementById('btnText'),
            modal: document.getElementById('modal'),
            modalBackdrop: document.getElementById('modalBackdrop')
        };
        
        // 验证关键元素是否存在
        const requiredElements = ['lotteryBtn', 'btnText', 'modal', 'modalBackdrop'];
        requiredElements.forEach(key => {
            if (!elements[key]) {
                throw new Error(`必要元素 ${key} 未找到`);
            }
        });
        
        this._elements = elements;
    }
    
    /**
     * 绑定事件
     * @private
     */
    _bindEvents() {
        // 绑定抽奖按钮事件
        if (this._elements.lotteryBtn) {
            this._elements.lotteryBtn.addEventListener('click', () => this._participateLottery());
        }
        
        // 绑定弹窗背景点击事件
        if (this._elements.modalBackdrop) {
            this._elements.modalBackdrop.addEventListener('click', () => this._closeModal());
        }
        
        // 绑定ESC键关闭弹窗
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && !this._elements.modal.classList.contains('hidden')) {
                this._closeModal();
            }
        });
    }
    
    /**
     * 显示加载状态
     * @private
     */
    _showLoading() {
        if (this._elements.loading) {
            this._elements.loading.style.display = 'flex';
        }
        if (this._elements.userSection) {
            this._elements.userSection.classList.add('hidden');
        }
    }
    
    /**
     * 隐藏加载状态
     * @private
     */
    _hideLoading() {
        if (this._elements.loading) {
            this._elements.loading.style.display = 'none';
        }
        if (this._elements.userSection) {
            this._elements.userSection.classList.remove('hidden');
        }
        if (this._elements.lotteryBtn) {
            this._elements.lotteryBtn.disabled = false;
        }
    }
    
    /**
     * 加载用户信息
     * @private
     */
    _loadUserInfo() {
        this._hideError();
        
        try {
            if (typeof qing !== 'undefined' && qing.call) {
                qing.call('getPersonInfo', {
                    success: (res) => this._handleUserInfoSuccess(res),
                    error: (err) => this._handleUserInfoError(err)
                });
            } else {
                // 开发环境或云之家未加载时使用默认信息
                console.warn('qing API不可用，使用默认用户信息');
                this._displayUserInfo(this._defaultUserInfo);
            }
        } catch (error) {
            console.error('调用getPersonInfo异常:', error);
            this._handleUserInfoError(error);
        }
    }
    
    /**
     * 处理用户信息获取成功
     * @param {Object} res - 响应数据
     * @private
     */
    _handleUserInfoSuccess(res) {
        console.log('用户信息:', res);
        
        if (res && res.success && res.data) {
            this._userInfo = res.data;
            this._displayUserInfo(this._userInfo);
        } else {
            console.warn('用户信息格式不正确，使用默认信息');
            this._displayUserInfo(this._defaultUserInfo);
        }
    }
    
    /**
     * 处理用户信息获取失败
     * @param {Error} err - 错误对象
     * @private
     */
    _handleUserInfoError(err) {
        console.error('获取用户信息失败:', err);
        this._showError('获取用户信息失败，使用默认信息');
        this._displayUserInfo(this._defaultUserInfo);
    }
    
    /**
     * 显示用户信息
     * @param {Object} data - 用户数据
     * @private
     */
    _displayUserInfo(data) {
        this._hideLoading();
        
        // 填充用户信息
        if (this._elements.userName) {
            this._elements.userName.textContent = data.name || '未知用户';
        }
        if (this._elements.companyName) {
            this._elements.companyName.textContent = data.companyName || '翔迅科技';
        }
        if (this._elements.jobNo) {
            this._elements.jobNo.textContent = data.jobNo || '-';
        }
        
        // 处理头像
        if (this._elements.userPhoto && this._elements.avatarPlaceholder) {
            if (data.photoUrl) {
                this._elements.userPhoto.src = data.photoUrl;
                this._elements.userPhoto.style.display = 'block';
                this._elements.avatarPlaceholder.style.display = 'none';
            } else {
                this._elements.userPhoto.style.display = 'none';
                this._elements.avatarPlaceholder.style.display = 'flex';
            }
        }
        
        // 如果是默认信息，添加日志
        if (data === this._defaultUserInfo) {
            console.log('当前显示默认用户信息');
        }
    }
    
    /**
     * 参与抽奖
     * @private
     */
    _participateLottery() {
        // 防止重复提交
        if (this._hasParticipated) {
            this._showError('您已经参与过抽奖了');
            return;
        }
        
        // 验证用户信息
        if (!this._userInfo) {
            this._showError('无法获取用户信息');
            return;
        }
        
        // 更新按钮状态
        this._updateButtonState('loading');
        
        // 准备请求数据
        const requestData = {
            jobNo: this._userInfo.jobNo,
            eid: this._userInfo.eid,
            name: this._userInfo.name,
            photoUrl: this._userInfo.photoUrl,
            companyName: this._userInfo.companyName
        };
        
        // 发送抽奖请求
        this._sendLotteryRequest(requestData);
    }
    
    /**
     * 发送抽奖请求
     * @param {Object} data - 请求数据
     * @private
     */
    _sendLotteryRequest(data) {
        console.log('发送抽奖参与请求:', data);
        
        // TODO: 替换为真实的API调用
        // 模拟API请求延迟
        setTimeout(() => {
            try {
                console.log('抽奖请求成功');
                this._hasParticipated = true;
                this._showModal();
                this._updateButtonState('success');
            } catch (error) {
                console.error('抽奖请求处理失败:', error);
                this._showError('抽奖请求处理失败，请重试');
                this._updateButtonState('default');
            }
        }, 1500);
    }
    
    /**
     * 更新按钮状态
     * @param {string} state - 按钮状态: 'default' | 'loading' | 'success'
     * @private
     */
    _updateButtonState(state) {
        const { lotteryBtn, btnText } = this._elements;
        
        if (!lotteryBtn || !btnText) {
            console.error('按钮元素未找到');
            return;
        }
        
        switch (state) {
            case 'loading':
                lotteryBtn.disabled = true;
                btnText.textContent = '提交中...';
                break;
            case 'success':
                lotteryBtn.disabled = true;
                btnText.textContent = '已参与成功';
                lotteryBtn.classList.remove('btn-primary');
                lotteryBtn.classList.add('bg-cyan-400/10', 'border-cyan-400/30', 'text-cyan-300');
                break;
            case 'default':
            default:
                if (!this._hasParticipated) {
                    lotteryBtn.disabled = false;
                    btnText.textContent = '参与抽奖';
                } else {
                    this._updateButtonState('success');
                }
                break;
        }
    }
    
    /**
     * 显示错误消息
     * @param {string} message - 错误消息
     * @private
     */
    _showError(message) {
        const errorEl = this._elements.errorMessage;
        if (errorEl) {
            errorEl.textContent = message;
            errorEl.classList.remove('hidden');
            errorEl.classList.add('animate-fade-in');
            
            // 5秒后自动隐藏
            setTimeout(() => {
                this._hideError();
            }, 5000);
        }
    }
    
    /**
     * 隐藏错误消息
     * @private
     */
    _hideError() {
        const errorEl = this._elements.errorMessage;
        if (errorEl) {
            errorEl.classList.add('hidden');
            errorEl.classList.remove('animate-fade-in');
        }
    }
    
    /**
     * 显示成功弹窗
     * @private
     */
    _showModal() {
        const modal = this._elements.modal;
        if (modal) {
            modal.classList.remove('hidden');
            modal.classList.add('animate-fade-in');
            
            // 创建礼花效果
            this._createConfetti();
        }
    }
    
    /**
     * 关闭弹窗
     * @private
     */
    _closeModal() {
        const modal = this._elements.modal;
        if (modal) {
            modal.classList.add('hidden');
            modal.classList.remove('animate-fade-in');
            
            // 确保按钮状态正确
            this._updateButtonState('default');
        }
    }
    
    /**
     * 创建礼花效果
     * @private
     */
    _createConfetti() {
        const colors = ['#22d3ee', '#60a5fa', '#ffffff', '#4ade80', '#fbbf24'];
        const confettiCount = 50;
        
        for (let i = 0; i < confettiCount; i++) {
            setTimeout(() => {
                const confetti = document.createElement('div');
                const size = Math.random() * 8 + 4;
                const startX = window.innerWidth / 2;
                const startY = window.innerHeight / 2;
                const angle = Math.random() * Math.PI * 2;
                const velocity = Math.random() * 200 + 100;
                
                confetti.style.cssText = `
                    position: fixed;
                    width: ${size}px;
                    height: ${size}px;
                    background: ${colors[Math.floor(Math.random() * colors.length)]};
                    left: ${startX}px;
                    top: ${startY}px;
                    border-radius: ${Math.random() > 0.5 ? '50%' : '0'};
                    pointer-events: none;
                    z-index: 1000;
                    will-change: transform, opacity;
                `;
                
                document.body.appendChild(confetti);
                
                const vx = Math.cos(angle) * velocity;
                const vy = Math.sin(angle) * velocity;
                let x = startX;
                let y = startY;
                let opacity = 1;
                let rotation = 0;
                const rotationSpeed = (Math.random() - 0.5) * 10;
                
                const animate = () => {
                    x += vx * 0.016;
                    y += vy * 0.016 + 2;
                    opacity -= 0.015;
                    rotation += rotationSpeed;
                    
                    confetti.style.transform = `translate(${x - startX}px, ${y - startY}px) rotate(${rotation}deg)`;
                    confetti.style.opacity = opacity;
                    
                    if (opacity > 0) {
                        requestAnimationFrame(animate);
                    } else {
                        confetti.remove();
                    }
                };
                
                requestAnimationFrame(animate);
            }, i * 20);
        }
    }
    
    /**
     * 销毁应用
     */
    destroy() {
        // 清理事件监听器等
        this._hasParticipated = false;
        this._userInfo = null;
    }
}

// 页面加载完成后初始化应用
document.addEventListener('DOMContentLoaded', () => {
    window.lotteryApp = new LotteryApp();
});

// 导出供模块化使用（如果支持ES6模块）
if (typeof module !== 'undefined' && module.exports) {
    module.exports = LotteryApp;
}
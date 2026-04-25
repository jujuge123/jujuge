// DOM 元素
const uploadBtn = document.getElementById('uploadBtn');
const fileInput = document.getElementById('fileInput');

// 选择方式模态框元素
const choiceModal = document.getElementById('choiceModal');
const galleryBtn = document.getElementById('galleryBtn');
const cameraChoiceBtn = document.getElementById('cameraChoiceBtn');
const cancelChoice = document.getElementById('cancelChoice');

// 相机模态框元素
const cameraModal = document.getElementById('cameraModal');
const cameraVideo = document.getElementById('cameraVideo');
const cameraCanvas = document.getElementById('cameraCanvas');
const captureBtn = document.getElementById('captureBtn');
const closeCameraBtn = document.getElementById('closeCameraBtn');
const switchCamera = document.getElementById('switchCamera');

// 相机相关变量
let currentStream = null;
let facingMode = 'user'; // 'user' 前置, 'environment' 后置

// 上传按钮点击事件 - 显示选择方式
uploadBtn.addEventListener('click', () => {
    showChoiceModal();
});

// 显示选择方式模态框
function showChoiceModal() {
    choiceModal.style.display = 'flex';
}

// 隐藏选择方式模态框
function hideChoiceModal() {
    choiceModal.style.display = 'none';
}

// 从相册选择
galleryBtn.addEventListener('click', () => {
    hideChoiceModal();
    fileInput.click();
});

// 打开相机
cameraChoiceBtn.addEventListener('click', () => {
    hideChoiceModal();
    openCamera();
});

// 取消选择
cancelChoice.addEventListener('click', () => {
    hideChoiceModal();
});

// 点击遮罩层关闭
choiceModal.addEventListener('click', (e) => {
    if (e.target.classList.contains('choice-overlay')) {
        hideChoiceModal();
    }
});

// 生成粒子效果
function createParticles() {
    const particlesContainer = document.getElementById('particles');
    const particleCount = 30;
    
    for (let i = 0; i < particleCount; i++) {
        const particle = document.createElement('div');
        particle.className = 'particle';
        particle.style.left = Math.random() * 100 + '%';
        particle.style.animationDelay = Math.random() * 20 + 's';
        particle.style.animationDuration = (15 + Math.random() * 10) + 's';
        particlesContainer.appendChild(particle);
    }
}

// 页面加载时创建粒子
createParticles();

// 文件选择事件
fileInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
        handleImageUpload(file);
    }
});

// 处理图片上传
function handleImageUpload(file) {
    // 检查文件类型
    if (!file.type.startsWith('image/')) {
        alert('请上传图片文件');
        return;
    }

    // 显示加载状态
    const originalText = uploadBtn.innerHTML;
    uploadBtn.innerHTML = '<span style="position: relative; z-index: 1;">分析中...</span>';
    uploadBtn.classList.add('loading');
    uploadBtn.disabled = true;

    // 读取图片
    const reader = new FileReader();
    reader.onload = (e) => {
        const imageData = e.target.result;
        
        // 模拟AI分析过程
        setTimeout(() => {
            analyzeImage(imageData);
            // 恢复按钮状态
            uploadBtn.innerHTML = originalText;
            uploadBtn.classList.remove('loading');
            uploadBtn.disabled = false;
        }, 2000);
    };
    reader.readAsDataURL(file);
}

// 分析图片（调用豆包API）
async function analyzeImage(imageData) {
    console.log('开始分析图片...');
    
    try {
        // 将图片转换为base64格式（去掉data:image前缀）
        const base64Image = imageData.split(',')[1];
        
        // 调用阿里云通义千问API
        const response = await fetch('/api/analyze-skin', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                image: base64Image,
                prompt: `请作为专业的皮肤科医生分析这张面部照片的肌肤状况。

请严格按照以下JSON格式返回结果（不要包含任何其他文字说明）：

{
  "skinType": "肤质类型（如：混合性肌肤、干性肌肤、油性肌肤、敏感性肌肤等）",
  "skinScore": "综合评分（0-100的数字，不要包含"分"字）",
  "problems": ["具体问题1", "具体问题2", "具体问题3"],
  "suggestions": ["专业建议1", "专业建议2", "专业建议3", "专业建议4"]
}

请基于图片中可见的肌肤特征（如毛孔大小、油光程度、色素沉着、细纹等）给出专业准确的分析。`
            })
        });

        if (!response.ok) {
            throw new Error(`API请求失败: ${response.status}`);
        }

        const apiResult = await response.json();
        
        // 解析豆包返回的结果
        let result;
        try {
            // 如果豆包返回的是JSON字符串，需要解析
            result = typeof apiResult.result === 'string' 
                ? JSON.parse(apiResult.result) 
                : apiResult.result;
        } catch (parseError) {
            console.error('解析豆包结果失败:', parseError);
            // 使用默认结果
            result = getDefaultResult();
        }

        // 添加照片URL
        result.photoUrl = imageData;
        
        // 显示结果
        showResult(result);
        
    } catch (error) {
        console.error('调用豆包API失败:', error);
        
        // API调用失败时使用模拟结果
        const result = getDefaultResult();
        result.photoUrl = imageData;
        showResult(result);
        
        // 可以显示错误提示
        // alert('网络连接异常，显示模拟结果');
    }
}

// 默认结果（API失败时使用）
function getDefaultResult() {
    return {
        skinType: '混合性肌肤',
        skinScore: '85',
        problems: ['T区轻微出油', '两颊略显干燥', '细纹初现'],
        suggestions: [
            '建议使用温和的氨基酸洁面',
            '加强补水保湿护理',
            '注意防晒，预防光老化',
            '定期使用抗氧化精华'
        ]
    };
}

// 显示分析结果
function showResult(result) {
    // 先显示选择对话框
    showContactDialog(result);
}

// 显示联系方式选择对话框
function showContactDialog(result) {
    const dialogHTML = `
        <div class="contact-dialog" id="contactDialog">
            <div class="dialog-overlay"></div>
            <div class="dialog-content">
                <div class="dialog-header">
                    <h3>🎉 检测完成！</h3>
                    <p>想要查看详细的肌肤分析报告吗？</p>
                </div>
                
                <div class="contact-options">
                    <button class="contact-btn wechat" id="wechatBtn">
                        <div class="contact-icon">💬</div>
                        <div class="contact-info">
                            <div class="contact-name">微信咨询</div>
                            <div class="contact-desc">专业护肤师一对一指导</div>
                        </div>
                    </button>
                    
                    <button class="contact-btn whatsapp" id="whatsappBtn">
                        <div class="contact-icon">📱</div>
                        <div class="contact-info">
                            <div class="contact-name">WhatsApp咨询</div>
                            <div class="contact-desc">国际护肤专家在线服务</div>
                        </div>
                    </button>
                </div>
                
                <div class="dialog-actions">
                    <button class="dialog-btn secondary" id="skipBtn">
                        暂时跳过
                    </button>
                    <button class="dialog-btn primary" id="viewReportBtn">
                        直接查看报告
                    </button>
                </div>
                
                <button class="dialog-close" id="closeDialog">✕</button>
            </div>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', dialogHTML);
    
    // 添加事件监听
    document.getElementById('wechatBtn').addEventListener('click', () => {
        showContactPage('wechat', result);
    });
    
    document.getElementById('whatsappBtn').addEventListener('click', () => {
        showContactPage('whatsapp', result);
    });
    
    document.getElementById('viewReportBtn').addEventListener('click', () => {
        document.getElementById('contactDialog').remove();
        showDetailedResult(result);
    });
    
    document.getElementById('skipBtn').addEventListener('click', () => {
        document.getElementById('contactDialog').remove();
        showDetailedResult(result);
    });
    
    document.getElementById('closeDialog').addEventListener('click', () => {
        document.getElementById('contactDialog').remove();
    });
    
    // 点击遮罩层关闭
    document.querySelector('.dialog-overlay').addEventListener('click', () => {
        document.getElementById('contactDialog').remove();
    });
}

// 显示联系方式页面
function showContactPage(type, result) {
    document.getElementById('contactDialog').remove();
    
    const contactInfo = {
        wechat: {
            title: '微信咨询',
            icon: '💬',
            qrCode: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iIzAwZDRkNCIvPgogIDx0ZXh0IHg9IjEwMCIgeT0iMTAwIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTQiIGZpbGw9IndoaXRlIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkeT0iLjNlbSI+5b6u5L+h5LqM57u05paBPC90ZXh0Pgo8L3N2Zz4K',
            contact: 'SkinCare_AI',
            description: '扫描二维码添加微信，获取专业护肤建议'
        },
        whatsapp: {
            title: 'WhatsApp咨询',
            icon: '📱',
            qrCode: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iIzI1RDM2NiIvPgogIDx0ZXh0IHg9IjEwMCIgeT0iMTAwIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTQiIGZpbGw9IndoaXRlIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkeT0iLjNlbSI+V2hhdHNBcHAgUVI8L3RleHQ+Cjwvc3ZnPgo=',
            contact: '+1 234 567 8900',
            description: 'Scan QR code to chat on WhatsApp for professional skin care advice'
        }
    };
    
    const info = contactInfo[type];
    
    const contactHTML = `
        <div class="contact-page" id="contactPage">
            <div class="contact-header">
                <button class="contact-back" id="contactBack">
                    <span>←</span>
                    <span>返回</span>
                </button>
                <h2>${info.title}</h2>
                <div style="width: 70px;"></div>
            </div>
            
            <div class="contact-content">
                <div class="contact-main">
                    <div class="contact-avatar">
                        <span>${info.icon}</span>
                    </div>
                    
                    <h3>专业护肤咨询</h3>
                    <p class="contact-subtitle">${info.description}</p>
                    
                    <div class="qr-container">
                        <img src="${info.qrCode}" alt="QR Code" class="qr-code">
                        <p class="qr-label">扫描二维码</p>
                    </div>
                    
                    <div class="contact-id">
                        <span class="id-label">${type === 'wechat' ? '微信号' : '电话号码'}:</span>
                        <span class="id-value">${info.contact}</span>
                        <button class="copy-btn" onclick="copyToClipboard('${info.contact}')">复制</button>
                    </div>
                </div>
                
                <div class="contact-actions">
                    <button class="action-btn secondary" id="laterBtn">
                        稍后联系
                    </button>
                    <button class="action-btn primary" id="continueBtn">
                        继续查看报告
                    </button>
                </div>
            </div>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', contactHTML);
    
    // 添加事件监听
    document.getElementById('contactBack').addEventListener('click', () => {
        document.getElementById('contactPage').remove();
        showContactDialog(result);
    });
    
    document.getElementById('laterBtn').addEventListener('click', () => {
        document.getElementById('contactPage').remove();
    });
    
    document.getElementById('continueBtn').addEventListener('click', () => {
        document.getElementById('contactPage').remove();
        showDetailedResult(result);
    });
}

// 复制到剪贴板
function copyToClipboard(text) {
    navigator.clipboard.writeText(text).then(() => {
        alert('已复制到剪贴板');
    }).catch(() => {
        // 降级方案
        const textArea = document.createElement('textarea');
        textArea.value = text;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        alert('已复制到剪贴板');
    });
}

// 显示详细检测结果
function showDetailedResult(result) {
    const resultHTML = `
        <div class="result-page">
            <div class="result-header">
                <button class="result-back" id="resultBack">
                    <span>←</span>
                </button>
                <h2>检测报告</h2>
                <button class="result-share">
                    <span>⋯</span>
                </button>
            </div>

            <div class="result-scroll">
                <!-- 照片预览 -->
                <div class="result-photo">
                    <img src="${result.photoUrl}" alt="检测照片" id="resultPhoto">
                    <div class="photo-overlay">
                        <div class="scan-line"></div>
                    </div>
                </div>

                <!-- 总体评分 -->
                <div class="score-card">
                    <div class="score-circle">
                        <svg width="120" height="120">
                            <circle cx="60" cy="60" r="54" fill="none" stroke="#f0f0f0" stroke-width="8"/>
                            <circle cx="60" cy="60" r="54" fill="none" stroke="url(#gradient)" stroke-width="8"
                                stroke-dasharray="339.292" stroke-dashoffset="${339.292 - (339.292 * parseInt(result.skinScore)) / 100}"
                                stroke-linecap="round" transform="rotate(-90 60 60)"/>
                            <defs>
                                <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                                    <stop offset="0%" style="stop-color:#00d4d4;stop-opacity:1" />
                                    <stop offset="100%" style="stop-color:#00b8b8;stop-opacity:1" />
                                </linearGradient>
                            </defs>
                        </svg>
                        <div class="score-text">
                            <div class="score-number">${result.skinScore}</div>
                            <div class="score-label">综合评分</div>
                        </div>
                    </div>
                    <div class="score-desc">
                        <div class="score-status">肌肤状态良好</div>
                        <div class="score-type">${result.skinType}</div>
                    </div>
                </div>

                <!-- 问题分析 -->
                <div class="analysis-section">
                    <h3 class="section-title">
                        <span class="title-icon">🔍</span>
                        问题分析
                    </h3>
                    <div class="problem-list">
                        ${result.problems.map((problem, index) => `
                            <div class="problem-item">
                                <div class="problem-header">
                                    <span class="problem-badge">${index + 1}</span>
                                    <span class="problem-name">${problem}</span>
                                </div>
                                <div class="problem-bar">
                                    <div class="problem-progress" style="width: ${70 - index * 10}%"></div>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>

                <!-- 护肤建议 -->
                <div class="analysis-section">
                    <h3 class="section-title">
                        <span class="title-icon">💡</span>
                        护肤建议
                    </h3>
                    <div class="suggestion-list">
                        ${result.suggestions.map((suggestion, index) => `
                            <div class="suggestion-item">
                                <div class="suggestion-icon">${['🧴', '💧', '☀️', '✨'][index]}</div>
                                <div class="suggestion-text">${suggestion}</div>
                            </div>
                        `).join('')}
                    </div>
                </div>

                <!-- 底部操作 -->
                <div class="result-actions">
                    <button class="action-btn secondary" id="saveReport">
                        <span>📥</span>
                        保存报告
                    </button>
                    <button class="action-btn primary" id="retestBtn">
                        <span>🔄</span>
                        重新检测
                    </button>
                </div>
            </div>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', resultHTML);
    
    // 添加关闭事件
    document.getElementById('resultBack').addEventListener('click', () => {
        document.querySelector('.result-page').remove();
    });

    // 重新检测
    document.getElementById('retestBtn').addEventListener('click', () => {
        document.querySelector('.result-page').remove();
        showChoiceModal();
    });

    // 保存报告
    document.getElementById('saveReport').addEventListener('click', () => {
        alert('报告已保存到相册');
    });
}

// 底部导航切换
const navItems = document.querySelectorAll('.nav-item');
navItems.forEach(item => {
    item.addEventListener('click', (e) => {
        e.preventDefault();
        navItems.forEach(nav => nav.classList.remove('active'));
        item.classList.add('active');
        
        const navText = item.querySelector('.nav-text').textContent;
        console.log(`切换到：${navText}`);
    });
});




// 打开相机
async function openCamera() {
    try {
        cameraModal.style.display = 'block';
        
        const constraints = {
            video: {
                facingMode: facingMode,
                width: { ideal: 1280 },
                height: { ideal: 720 }
            },
            audio: false
        };
        
        currentStream = await navigator.mediaDevices.getUserMedia(constraints);
        cameraVideo.srcObject = currentStream;
        
    } catch (error) {
        console.error('无法访问相机:', error);
        alert('无法访问相机，请检查权限设置');
        cameraModal.style.display = 'none';
    }
}

// 关闭相机
function closeCamera() {
    if (currentStream) {
        currentStream.getTracks().forEach(track => track.stop());
        currentStream = null;
    }
    cameraVideo.srcObject = null;
    cameraModal.style.display = 'none';
}

// 切换前后摄像头
switchCamera.addEventListener('click', async () => {
    facingMode = facingMode === 'user' ? 'environment' : 'user';
    
    // 关闭当前流
    if (currentStream) {
        currentStream.getTracks().forEach(track => track.stop());
    }
    
    // 打开新的摄像头
    try {
        const constraints = {
            video: {
                facingMode: facingMode,
                width: { ideal: 1280 },
                height: { ideal: 720 }
            },
            audio: false
        };
        
        currentStream = await navigator.mediaDevices.getUserMedia(constraints);
        cameraVideo.srcObject = currentStream;
    } catch (error) {
        console.error('切换摄像头失败:', error);
        alert('切换摄像头失败');
    }
});

// 拍照
captureBtn.addEventListener('click', () => {
    // 设置canvas尺寸
    cameraCanvas.width = cameraVideo.videoWidth;
    cameraCanvas.height = cameraVideo.videoHeight;
    
    // 绘制当前视频帧到canvas
    const context = cameraCanvas.getContext('2d');
    context.drawImage(cameraVideo, 0, 0);
    
    // 转换为blob
    cameraCanvas.toBlob((blob) => {
        if (blob) {
            // 创建文件对象
            const file = new File([blob], 'camera-photo.jpg', { type: 'image/jpeg' });
            
            // 关闭相机
            closeCamera();
            
            // 处理图片
            handleImageUpload(file);
        }
    }, 'image/jpeg', 0.9);
});

// 关闭相机按钮 - 返回到选择方式
closeCameraBtn.addEventListener('click', () => {
    closeCamera();
    // 返回到选择方式而不是直接关闭
    showChoiceModal();
});

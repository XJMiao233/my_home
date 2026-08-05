// ===== DOM 元素获取 =====
const hamburger = document.getElementById('hamburger');
const navMenu = document.getElementById('nav-menu');
const navLinks = document.querySelectorAll('.nav-link');
const form = document.querySelector('.form');
const themeToggle = document.getElementById('theme-toggle');
const themeToggleText = document.querySelector('.theme-toggle-text');
const quoteElement = document.getElementById('random-quote');
const quoteRefreshButton = document.getElementById('quote-refresh');
const themeModeStorageKey = 'theme-mode';
const defaultPageTitle = '✨ XJMiao\'s Home ✨';
let themeMode = 'auto';

// ===== 页面加载完成后执行 =====
document.addEventListener('DOMContentLoaded', function() {
    // 初始化所有功能
    initNavigation();
    initThemeToggle();
    initHeroButtons();
    initRandomQuote();
    initScrollAnimations();
    initFormHandler();
    initFloatingElements();
    initTypingEffect();
    initParticleSystem();
    
    // 页面加载动画
    setTimeout(() => {
        document.body.classList.add('loaded');
    }, 100);
});

// ===== 导航栏功能 =====
function initNavigation() {
    // 移动端菜单切换
    if (hamburger && navMenu) {
        hamburger.addEventListener('click', () => {
            const isActive = hamburger.classList.toggle('active');
            navMenu.classList.toggle('active');
            hamburger.setAttribute('aria-expanded', isActive);
        });

        // 键盘支持
        hamburger.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                hamburger.click();
            }
        });
    }

    // 点击菜单项关闭移动端菜单
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            hamburger?.classList.remove('active');
            navMenu?.classList.remove('active');
            hamburger?.setAttribute('aria-expanded', 'false');
        });
    });

    // 滚动时改变导航栏样式
    let scrollTicking = false;
    window.addEventListener('scroll', () => {
        if (!scrollTicking) {
            requestAnimationFrame(() => {
                const navbar = document.querySelector('.navbar');
                if (navbar) {
                    navbar.classList.toggle('scrolled', window.scrollY > 100);
                }
                scrollTicking = false;
            });
            scrollTicking = true;
        }
    });
}

function initThemeToggle() {
    const storedTheme = localStorage.getItem(themeModeStorageKey);
    themeMode = storedTheme && ['auto', 'light', 'dark'].includes(storedTheme) ? storedTheme : 'auto';

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    const applyTheme = (mode, prefersDark) => {
        const resolvedTheme = mode === 'auto' ? (prefersDark ? 'dark' : 'light') : mode;
        document.documentElement.setAttribute('data-theme', resolvedTheme);
        document.documentElement.setAttribute('data-theme-mode', mode);

        if (themeToggleText) {
            themeToggleText.textContent = mode === 'auto' ? '自动' : mode === 'dark' ? '暗色' : '亮色';
        }

        if (themeToggle) {
            themeToggle.setAttribute('title', mode === 'auto' ? '跟随系统主题' : `${mode === 'dark' ? '暗色' : '亮色'}模式`);
        }
    };

    applyTheme(themeMode, mediaQuery.matches);

    if (themeToggle) {
        themeToggle.addEventListener('click', () => {
            const modes = ['auto', 'light', 'dark'];
            const currentIndex = modes.indexOf(themeMode);
            themeMode = modes[(currentIndex + 1) % modes.length];
            localStorage.setItem(themeModeStorageKey, themeMode);
            applyTheme(themeMode, mediaQuery.matches);
        });
    }

    const handleSystemThemeChange = (event) => {
        if (themeMode === 'auto') {
            applyTheme('auto', event.matches);
        }
    };

    if (typeof mediaQuery.addEventListener === 'function') {
        mediaQuery.addEventListener('change', handleSystemThemeChange);
    } else if (typeof mediaQuery.addListener === 'function') {
        mediaQuery.addListener(handleSystemThemeChange);
    }
}

function initRandomQuote() {
    if (!quoteElement) return;

    const fallbackQuotes = [
        '愿你像星星一样发光，也像风一样自由。',
        '即使世界很吵，也要记得自己心里的那点光。',
        '有些梦不会立刻实现，但它们会陪你走很远。',
        '真正的勇气，往往藏在不肯放弃的心里。',
        '把喜欢的事留在心里，迟早会化作勇气。',
        '在喧闹的世界里，保持一份温柔和执拗。'
    ];

    const quoteTagElement = document.querySelector('.quote-tag');
    let quotesToShow = [...fallbackQuotes];
    let quoteIndex = 0;
    let charIndex = 0;
    let typingTimer = null;

    const typeQuote = () => {
        const currentQuote = quotesToShow[quoteIndex];
        quoteElement.textContent = currentQuote.substring(0, charIndex + 1);
        charIndex++;

        if (charIndex >= currentQuote.length) {
            quoteElement.textContent = currentQuote;
            return;
        }

        typingTimer = setTimeout(typeQuote, 80);
    };

    const showQuote = (quoteText, sourceText = '二次元语录') => {
        clearTimeout(typingTimer);
        charIndex = 0;
        quoteIndex = 0;
        quotesToShow = [quoteText, ...fallbackQuotes];
        typeQuote();

        if (quoteTagElement) {
            quoteTagElement.textContent = sourceText;
        }
    };

    const showNextQuote = () => {
        clearTimeout(typingTimer);
        quoteIndex = (quoteIndex + 1) % quotesToShow.length;
        charIndex = 0;
        typeQuote();
    };

    const tryApiSources = async () => {
        const sources = [
            {
                url: 'https://v1.hitokoto.cn/?c=a&c=b&c=c&encode=json&max_length=60',
                parse: (data) => {
                    if (!data || !data.hitokoto) return null;
                    return {
                        text: data.hitokoto,
                        source: data.from_who || data.from || 'Hitokoto'
                    };
                }
            },
            {
                url: 'https://api.ixiaowai.cn/ylapi/index.php?format=json',
                parse: (data) => {
                    const text = data?.text || data?.hitokoto || data?.content || data?.quote || data?.data?.text || data?.data?.content;
                    if (!text) return null;
                    return {
                        text,
                        source: data?.from || data?.source || data?.author || '一言'
                    };
                }
            }
        ];

        for (const source of sources) {
            try {
                const response = await fetch(source.url, {
                    headers: { 'Accept': 'application/json' },
                    mode: 'cors'
                });

                if (!response.ok) {
                    continue;
                }

                const payload = await response.json();
                const parsed = source.parse(payload);

                if (parsed && parsed.text) {
                    return parsed;
                }
            } catch (error) {
                continue;
            }
        }

        return null;
    };

    typeQuote();

    if (quoteRefreshButton) {
        quoteRefreshButton.addEventListener('click', showNextQuote);
    }

    tryApiSources()
        .then((result) => {
            if (result) {
                showQuote(result.text, result.source);
            } else {
                showQuote(fallbackQuotes[0], '随机灵感');
            }
        })
        .catch(() => {
            showQuote(fallbackQuotes[0], '随机灵感');
        });
}

function initHeroButtons() {
    document.querySelectorAll('[data-target]').forEach(button => {
        button.addEventListener('click', () => {
            const targetId = button.getAttribute('data-target');
            if (targetId) {
                scrollToSection(targetId);
            }
        });
    });
}

// ===== 平滑滚动功能 =====
function scrollToSection(sectionId) {
    const section = document.getElementById(sectionId);
    if (section) {
        const offsetTop = section.getBoundingClientRect().top + window.pageYOffset - 80;
        if (typeof window.scrollTo === 'function') {
            window.scrollTo({
                top: offsetTop,
                behavior: 'smooth'
            });
        } else {
            window.scrollTo(0, offsetTop);
        }
    }
}

// 为导航链接添加平滑滚动
navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault();
        const targetId = link.getAttribute('href').substring(1);
        scrollToSection(targetId);
    });
});

// ===== 滚动动画 =====
function initScrollAnimations() {
    // 减少动画偏好检查
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) {
        document.querySelectorAll('.about-card, .contact-item, .interest-item, .stat-item').forEach(el => {
            el.style.opacity = '1';
            el.style.transform = 'none';
        });
        return;
    }

    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, observerOptions);

    const animatedElements = document.querySelectorAll(`
        .about-card,
        .contact-item,
        .interest-item,
        .stat-item
    `);

    animatedElements.forEach(el => {
        el.classList.add('fade-in');
        observer.observe(el);
    });
}

// ===== 表单处理 =====
function initFormHandler() {
    if (!form) return;

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        
        // 获取表单数据
        const name = form.querySelector('input[type="text"]')?.value || '';
        const email = form.querySelector('input[type="email"]')?.value || '';
        const message = form.querySelector('textarea')?.value || '';
        
        // 简单验证
        if (!name.trim() || !email.trim() || !message.trim()) {
            showNotification('请填写所有必填字段 📝', 'error');
            return;
        }

        // 如果配置了 Formspree 等后端，提交数据
        const actionUrl = form.getAttribute('action');
        if (actionUrl && !actionUrl.includes('your-form-id')) {
            const formData = new FormData(form);
            fetch(actionUrl, {
                method: 'POST',
                body: formData,
                headers: { 'Accept': 'application/json' }
            })
            .then(response => {
                if (response.ok) {
                    showNotification('消息发送成功！感谢您的联系 ✨', 'success');
                    form.reset();
                } else {
                    showNotification('发送失败，请稍后再试 😥', 'error');
                }
            })
            .catch(() => {
                showNotification('网络错误，请稍后再试 😥', 'error');
            });
        } else {
            // 无后端：显示提示
            showNotification('消息已收到！（表单后端待配置）✨', 'success');
            form.reset();
        }
    });
}

// ===== 通知系统 =====
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.setAttribute('role', 'alert');
    notification.setAttribute('aria-live', 'polite');
    notification.innerHTML = `
        <div class="notification-content">
            <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
            <span>${message}</span>
        </div>
    `;
    
    const bgMap = {
        success: 'linear-gradient(135deg, #ff69b4, #8b5cf6)',
        error: 'linear-gradient(135deg, #ef4444, #f97316)',
        info: 'linear-gradient(135deg, #3b82f6, #8b5cf6)'
    };

    notification.style.cssText = `
        position: fixed;
        top: 100px;
        right: 20px;
        background: ${bgMap[type] || bgMap.info};
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 10px;
        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
        z-index: 10000;
        transform: translateX(400px);
        transition: all 0.3s ease;
        backdrop-filter: blur(20px);
        max-width: min(360px, calc(100vw - 40px));
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.transform = 'translateX(0)';
    }, 100);
    
    setTimeout(() => {
        notification.style.transform = 'translateX(400px)';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }, 3000);
}

// ===== 浮动元素动画增强 =====
function initFloatingElements() {
    // 减少动画偏好检查
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const floatingElements = document.querySelectorAll(`
        .floating-heart,
        .floating-star,
        .floating-cloud,
        .floating-moon
    `);
    
    floatingElements.forEach((element, index) => {
        element.addEventListener('mouseenter', () => {
            element.style.transform = 'scale(1.5) rotate(20deg)';
            element.style.filter = 'drop-shadow(0 0 10px rgba(255, 105, 180, 0.7))';
        });
        
        element.addEventListener('mouseleave', () => {
            element.style.transform = '';
            element.style.filter = '';
        });
        
        element.style.animationDelay = `${Math.random() * 3}s`;
    });
}

// ===== 打字机效果增强 =====
function initTypingEffect() {
    const typingElement = document.querySelector('.typing-text');
    if (!typingElement) return;
    
    // 减少动画偏好检查
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    
    const texts = [
        '一个音游痴 🎵',
        '初音未来天下第一！（胡言乱语）',
        '用代码堆积屎山的码农 💻',
        '寻找灵感中 👀'
    ];
    
    let textIndex = 0;
    let charIndex = 0;
    let isDeleting = false;
    
    function typeWriter() {
        const currentText = texts[textIndex];
        
        if (isDeleting) {
            typingElement.textContent = currentText.substring(0, charIndex - 1);
            charIndex--;
        } else {
            typingElement.textContent = currentText.substring(0, charIndex + 1);
            charIndex++;
        }
        
        let speed = isDeleting ? 50 : 100;
        
        if (!isDeleting && charIndex === currentText.length) {
            speed = 2000;
            isDeleting = true;
        } else if (isDeleting && charIndex === 0) {
            isDeleting = false;
            textIndex = (textIndex + 1) % texts.length;
            speed = 500;
        }
        
        setTimeout(typeWriter, speed);
    }
    
    setTimeout(typeWriter, 2000);
}

// ===== 粒子系统 =====
function initParticleSystem() {
    const particleContainer = document.querySelector('.floating-particles');
    if (!particleContainer) return;
    
    // 移动端或减少动画偏好时跳过
    if (window.matchMedia('(max-width: 768px)').matches) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    
    function createParticle() {
        const particle = document.createElement('div');
        particle.className = 'particle';
        
        const size = Math.random() * 6 + 2;
        const duration = Math.random() * 3 + 2;
        const startX = Math.random() * window.innerWidth;
        const startY = window.innerHeight + 10;
        
        particle.style.cssText = `
            position: absolute;
            width: ${size}px;
            height: ${size}px;
            background: linear-gradient(45deg, #ff69b4, #8b5cf6, #3b82f6);
            border-radius: 50%;
            left: ${startX}px;
            top: ${startY}px;
            opacity: 0.6;
            pointer-events: none;
            animation: floatUp ${duration}s linear forwards;
            will-change: transform, opacity;
        `;
        
        particleContainer.appendChild(particle);
        
        setTimeout(() => {
            if (particle.parentNode) {
                particle.parentNode.removeChild(particle);
            }
        }, duration * 1000);
    }
    
    setInterval(createParticle, 2000);
}

// ===== CSS 动画定义 =====
const style = document.createElement('style');
style.textContent = `
    @keyframes floatUp {
        0% {
            transform: translateY(0) rotate(0deg);
            opacity: 0.6;
        }
        50% {
            opacity: 1;
        }
        100% {
            transform: translateY(-100vh) rotate(360deg);
            opacity: 0;
        }
    }
    
    .notification-content {
        display: flex;
        align-items: center;
        gap: 0.5rem;
    }
    
    .notification-content i {
        font-size: 1.2rem;
        flex-shrink: 0;
    }
    
    body.loaded .fade-in {
        animation: fadeInUp 0.8s ease-out forwards;
    }
    
    @keyframes fadeInUp {
        from {
            opacity: 0;
            transform: translateY(30px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }
`;
document.head.appendChild(style);

// ===== 页面可见性 API =====
document.addEventListener('visibilitychange', () => {
    document.title = defaultPageTitle;
});

// ===== Easter Egg - konami code =====
let konamiCode = [];
const konamiSequence = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'KeyB', 'KeyA'];

document.addEventListener('keydown', (e) => {
    konamiCode.push(e.code);
    if (konamiCode.length > konamiSequence.length) {
        konamiCode.shift();
    }
    
    if (konamiCode.join(',') === konamiSequence.join(',')) {
        triggerEasterEgg();
        konamiCode = [];
    }
});

function triggerEasterEgg() {
    const colors = ['#ff69b4', '#8b5cf6', '#3b82f6', '#ffc0cb'];
    
    for (let i = 0; i < 50; i++) {
        setTimeout(() => {
            const sparkle = document.createElement('div');
            sparkle.innerHTML = '✨';
            sparkle.style.cssText = `
                position: fixed;
                font-size: 2rem;
                color: ${colors[Math.floor(Math.random() * colors.length)]};
                left: ${Math.random() * window.innerWidth}px;
                top: ${Math.random() * window.innerHeight}px;
                pointer-events: none;
                z-index: 10000;
                animation: sparkleEffect 2s ease-out forwards;
            `;
            
            document.body.appendChild(sparkle);
            
            setTimeout(() => {
                sparkle.remove();
            }, 2000);
        }, i * 50);
    }
    
    showNotification('🎉 发现隐藏彩蛋！你好厉害！！', 'success');
}

// ===== 添加 sparkle 动画 =====
const sparkleStyle = document.createElement('style');
sparkleStyle.textContent = `
    @keyframes sparkleEffect {
        0% {
            transform: scale(0) rotate(0deg);
            opacity: 1;
        }
        50% {
            transform: scale(1.5) rotate(180deg);
            opacity: 0.8;
        }
        100% {
            transform: scale(0) rotate(360deg);
            opacity: 0;
        }
    }
`;
document.head.appendChild(sparkleStyle);

// ===== 图片加载优化 =====
document.addEventListener('DOMContentLoaded', () => {
    const images = document.querySelectorAll('img');
    
    images.forEach(img => {
        const showImage = () => {
            img.style.opacity = '1';
            img.style.visibility = 'visible';
            img.style.display = 'block';
        };

        const isAlreadyLoaded = img.complete && img.naturalWidth > 0;
        img.style.opacity = isAlreadyLoaded ? '1' : '0';
        img.style.visibility = isAlreadyLoaded ? 'visible' : 'hidden';
        img.style.display = 'block';
        img.style.transition = 'opacity 0.35s ease';
        
        img.addEventListener('load', showImage);
        
        img.addEventListener('error', () => {
            img.style.opacity = '0.5';
            img.style.visibility = 'visible';
            img.alt = '图片加载失败 (´･ω･`)';
        });

        if (isAlreadyLoaded) {
            showImage();
        }
    });
});

// ===== 导出函数供全局使用 =====
window.scrollToSection = scrollToSection;
window.showNotification = showNotification;

// ===== 控制台彩蛋 =====
(function() {
    // 主欢迎信息
    const styles = [
        'color: #ff69b4',
        'font-size: 20px',
        'font-weight: bold',
        'text-shadow: 0 0 10px rgba(255,105,180,0.5)',
        'padding: 12px 0'
    ].join(';');

    const subStyles = [
        'color: #8b5cf6',
        'font-size: 13px',
        'line-height: 1.8',
        'padding: 4px 0'
    ].join(';');

    const hintStyles = [
        'color: #94a3b8',
        'font-size: 11px',
        'font-style: italic'
    ].join(';');

    console.log('%c🌸 二次元世界已加载完成！', styles);
    console.log('%c欢迎来到 XJMiao\'s Home ✨', subStyles);
    console.log(
        '%c\n' +
        '  　　 ∧＿∧\n' +
        '  　（｡･ω･｡）＜ 你居然打开了控制台！\n' +
        '  　 |　　 | \n' +
        '  　 |　　| \n' +
        '  　 しーＪ\n',
        'color: #ff69b4; font-size: 12px; line-height: 1.6'
    );
    console.log(
        '%c✨ 发现彩蛋？那你一定也是个有趣的人 ✨\n' +
        '🎮 GitHub: XJMiao233\n' +
        '📺 Bilibili: 569861719\n' +
        '💤 今天也要好好睡觉哦~',
        subStyles
    );
    console.log(
        '%c试试 Konami Code 吧 ↑↑↓↓←→←→BA',
        hintStyles
    );
})();

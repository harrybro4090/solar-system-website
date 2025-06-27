// 全局变量
let scene, camera, renderer, controls;
let sun, earth, moon;
let earthOrbit, moonOrbit;
let animationId;
let sunLight;
let isPlaying = true;
let speedFactor = 1;
let earthRotationSpeed = 0.01;
let earthRevolutionSpeed = 0.005;
let moonRotationSpeed = 0.01;
let moonRevolutionSpeed = 0.05;
let currentView = 'space';

// 纹理加载器
const textureLoader = new THREE.TextureLoader();

// DOM 元素
const solarSystemContainer = document.getElementById('solar-system');
const speedControl = document.getElementById('speed-control');
const speedValue = document.getElementById('speed-value');
const showOrbitCheckbox = document.getElementById('show-orbit');
const showNamesCheckbox = document.getElementById('show-names');
const playPauseButton = document.getElementById('play-pause');
const resetButton = document.getElementById('reset');
const infoContent = document.getElementById('info-content');

// 视角按钮
const sunViewButton = document.getElementById('sun-view');
const earthViewButton = document.getElementById('earth-view');
const moonViewButton = document.getElementById('moon-view');
const spaceViewButton = document.getElementById('space-view');

// 天体现象按钮
const showDayNightButton = document.getElementById('show-day-night');
const showSeasonsButton = document.getElementById('show-seasons');
const showMoonPhasesButton = document.getElementById('show-moon-phases');

// 选项卡切换
const lessonTabs = document.querySelectorAll('.lesson-tab');
const lessonContents = document.querySelectorAll('.lesson-content');

// 初始化
function init() {
    // 创建场景
    scene = new THREE.Scene();
    
    // 创建相机
    const aspectRatio = solarSystemContainer.clientWidth / solarSystemContainer.clientHeight;
    camera = new THREE.PerspectiveCamera(75, aspectRatio, 0.1, 1000);
    camera.position.z = 30;
    
    // 创建渲染器
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(solarSystemContainer.clientWidth, solarSystemContainer.clientHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    solarSystemContainer.appendChild(renderer.domElement);
    
    // 创建环境光
    const ambientLight = new THREE.AmbientLight(0x404040, 0.2);
    scene.add(ambientLight);
    
    // 创建太阳光源
    sunLight = new THREE.PointLight(0xFFFFFF, 2, 100);
    sunLight.position.set(0, 0, 0);
    scene.add(sunLight);
    
    // 添加星空背景
    createStarfield();
    
    // 创建天体
    createSolarSystem();
    
    // 添加轨道控制器
    controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    
    // 在窗口调整大小时更新渲染器
    window.addEventListener('resize', onWindowResize);
    
    // 开始动画循环
    animate();
    
    // 初始化事件监听
    initEventListeners();
}

// 创建天体
function createSolarSystem() {
    // 太阳
    const sunGeometry = new THREE.SphereGeometry(5, 32, 32);
    const sunTexture = textureLoader.load('images/sun_texture.jpg');
    const sunMaterial = new THREE.MeshBasicMaterial({ 
        map: sunTexture
    });
    sun = new THREE.Mesh(sunGeometry, sunMaterial);
    scene.add(sun);
    
    // 地球轨道
    const earthOrbitGeometry = new THREE.RingGeometry(15, 15.1, 64);
    const earthOrbitMaterial = new THREE.MeshBasicMaterial({ 
        color: 0x3366ff, 
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.5
    });
    earthOrbit = new THREE.Mesh(earthOrbitGeometry, earthOrbitMaterial);
    earthOrbit.rotation.x = Math.PI / 2;
    scene.add(earthOrbit);
    
    // 地球
    const earthGeometry = new THREE.SphereGeometry(1, 32, 32);
    const earthTexture = textureLoader.load('images/earth_texture.jpg');
    const earthBumpMap = textureLoader.load('images/earth_bump.jpg');
    const earthSpecularMap = textureLoader.load('images/earth_specular.jpg');
    const earthMaterial = new THREE.MeshPhongMaterial({ 
        map: earthTexture,
        bumpMap: earthBumpMap,
        bumpScale: 0.05,
        specularMap: earthSpecularMap,
        specular: new THREE.Color(0x333333)
    });
    earth = new THREE.Mesh(earthGeometry, earthMaterial);
    earth.position.x = 15;
    scene.add(earth);
    
    // 月球轨道
    const moonOrbitGeometry = new THREE.RingGeometry(2, 2.05, 64);
    const moonOrbitMaterial = new THREE.MeshBasicMaterial({ 
        color: 0xaaaaaa, 
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.5
    });
    moonOrbit = new THREE.Mesh(moonOrbitGeometry, moonOrbitMaterial);
    moonOrbit.rotation.x = Math.PI / 2;
    earth.add(moonOrbit);
    
    // 月球
    const moonGeometry = new THREE.SphereGeometry(0.27, 32, 32);
    const moonTexture = textureLoader.load('images/moon_texture.jpg');
    const moonMaterial = new THREE.MeshPhongMaterial({ 
        map: moonTexture,
        bumpMap: moonTexture,
        bumpScale: 0.02,
    });
    moon = new THREE.Mesh(moonGeometry, moonMaterial);
    moon.position.x = 2;
    earth.add(moon);
    
    // 添加天体标签
    createCelestialLabels();
}

// 创建天体标签
function createCelestialLabels() {
    // 创建精灵标签，它们总是面向相机
    createSpriteLabel('太阳', sun, 6, 0xffff00);
    createSpriteLabel('地球', earth, 1.5, 0x3366ff);
    createSpriteLabel('月球', moon, 0.5, 0xaaaaaa);
}

// 创建精灵标签
function createSpriteLabel(text, parent, offset, color) {
    // 创建画布
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    canvas.width = 256;
    canvas.height = 128;
    
    // 绘制文字
    context.font = 'Bold 40px Arial';
    context.fillStyle = 'rgba(255,255,255,0.95)';
    context.textAlign = 'center';
    context.fillText(text, 128, 64);
    
    // 创建纹理
    const texture = new THREE.CanvasTexture(canvas);
    
    // 创建精灵材质
    const spriteMaterial = new THREE.SpriteMaterial({ 
        map: texture,
        color: color 
    });
    
    // 创建精灵
    const sprite = new THREE.Sprite(spriteMaterial);
    sprite.scale.set(2, 1, 1);
    sprite.position.set(0, offset, 0);
    sprite.userData.isLabel = true;
    
    parent.add(sprite);
}

// 创建星空背景
function createStarfield() {
    const starsGeometry = new THREE.BufferGeometry();
    const starsMaterial = new THREE.PointsMaterial({
        color: 0xffffff,
        size: 0.1
    });
    
    const starsVertices = [];
    for(let i = 0; i < 10000; i++) {
        const x = (Math.random() - 0.5) * 2000;
        const y = (Math.random() - 0.5) * 2000;
        const z = (Math.random() - 0.5) * 2000;
        starsVertices.push(x, y, z);
    }
    
    starsGeometry.setAttribute('position', new THREE.Float32BufferAttribute(starsVertices, 3));
    const stars = new THREE.Points(starsGeometry, starsMaterial);
    scene.add(stars);
}

// 窗口大小改变时更新
function onWindowResize() {
    const width = solarSystemContainer.clientWidth;
    const height = solarSystemContainer.clientHeight;
    
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    
    renderer.setSize(width, height);
}

// 动画循环
function animate() {
    animationId = requestAnimationFrame(animate);
    
    if (isPlaying) {
        // 太阳自转
        sun.rotation.y += 0.002 * speedFactor;
        
        // 地球自转
        earth.rotation.y += earthRotationSpeed * speedFactor;
        
        // 地球公转
        const earthOrbitRadius = 15;
        earth.position.x = earthOrbitRadius * Math.cos(Date.now() * 0.0001 * earthRevolutionSpeed * speedFactor);
        earth.position.z = earthOrbitRadius * Math.sin(Date.now() * 0.0001 * earthRevolutionSpeed * speedFactor);
        
        // 月球自转
        moon.rotation.y += moonRotationSpeed * speedFactor;
        
        // 适当倾斜地球轴
        earth.rotation.z = 0.41;
        
        // 更新标签方向
        updateLabelsOrientation();
    }
    
    // 更新轨道控制器
    controls.update();
    
    // 渲染场景
    renderer.render(scene, camera);
}

// 更新标签方向
function updateLabelsOrientation() {
    scene.traverse(function(object) {
        if (object.userData && object.userData.isLabel) {
            object.lookAt(camera.position);
        }
    });
}

// 初始化事件监听器
function initEventListeners() {
    // 速度控制
    speedControl.addEventListener('input', function() {
        speedFactor = parseFloat(this.value);
        speedValue.textContent = speedFactor + 'x';
    });
    
    // 显示/隐藏轨道
    showOrbitCheckbox.addEventListener('change', function() {
        earthOrbit.visible = this.checked;
        moonOrbit.visible = this.checked;
    });
    
    // 显示/隐藏标签
    showNamesCheckbox.addEventListener('change', function() {
        scene.traverse(function(object) {
            if (object.userData && object.userData.isLabel) {
                object.visible = showNamesCheckbox.checked;
            }
        });
    });
    
    // 播放/暂停
    playPauseButton.addEventListener('click', function() {
        isPlaying = !isPlaying;
        this.textContent = isPlaying ? '暂停' : '播放';
    });
    
    // 重置
    resetButton.addEventListener('click', resetScene);
    
    // 视角切换按钮
    sunViewButton.addEventListener('click', function() { changeView('sun'); });
    earthViewButton.addEventListener('click', function() { changeView('earth'); });
    moonViewButton.addEventListener('click', function() { changeView('moon'); });
    spaceViewButton.addEventListener('click', function() { changeView('space'); });
    
    // 天体现象按钮
    showDayNightButton.addEventListener('click', showDayNightCycle);
    showSeasonsButton.addEventListener('click', showSeasonsCycle);
    showMoonPhasesButton.addEventListener('click', showMoonPhasesCycle);
    
    // 选项卡切换
    lessonTabs.forEach(tab => {
        tab.addEventListener('click', function() {
            // 移除所有选项卡的激活状态
            lessonTabs.forEach(t => t.classList.remove('active'));
            // 移除所有内容的激活状态
            lessonContents.forEach(c => c.classList.remove('active'));
            
            // 添加当前选项卡的激活状态
            this.classList.add('active');
            // 显示对应的内容
            const tabId = this.getAttribute('data-tab');
            document.getElementById(tabId).classList.add('active');
        });
    });
}

// 重置场景
function resetScene() {
    // 重置相机位置
    camera.position.set(0, 10, 30);
    camera.lookAt(scene.position);
    
    // 重置地球位置
    earth.position.set(15, 0, 0);
    
    // 重置控制参数
    speedFactor = 1;
    speedControl.value = 1;
    speedValue.textContent = '1x';
    
    isPlaying = true;
    playPauseButton.textContent = '暂停';
    
    // 重置视角
    changeView('space');
}

// 切换视角
function changeView(viewType) {
    // 移除所有视角按钮的激活状态
    sunViewButton.classList.remove('active');
    earthViewButton.classList.remove('active');
    moonViewButton.classList.remove('active');
    spaceViewButton.classList.remove('active');
    
    // 记录当前视角
    currentView = viewType;
    
    // 根据视角类型设置相机位置
    switch(viewType) {
        case 'sun':
            // 太阳视角
            camera.position.set(10, 5, 0);
            camera.lookAt(sun.position);
            sunViewButton.classList.add('active');
            updateInfoPanel('太阳视角', '从太阳的角度观察地球和月球的运动。太阳是太阳系的中心，所有行星绕太阳公转。');
            break;
            
        case 'earth':
            // 地球视角
            camera.position.copy(earth.position);
            camera.position.y += 2;
            camera.lookAt(sun.position);
            earthViewButton.classList.add('active');
            updateInfoPanel('地球视角', '从地球的角度观察太阳和月球。地球既有自转又有公转，自转导致昼夜交替，公转导致四季变化。');
            break;
            
        case 'moon':
            // 月球视角
            const moonWorldPosition = new THREE.Vector3();
            moon.getWorldPosition(moonWorldPosition);
            camera.position.copy(moonWorldPosition);
            camera.position.y += 0.5;
            camera.lookAt(earth.position);
            moonViewButton.classList.add('active');
            updateInfoPanel('月球视角', '从月球的角度观察地球和太阳。月球是地球的卫星，它同时自转和公转，自转周期和公转周期相同，这使得月球总是同一面朝向地球。');
            break;
            
        case 'space':
        default:
            // 太空视角（默认）
            camera.position.set(0, 15, 30);
            camera.lookAt(scene.position);
            spaceViewButton.classList.add('active');
            updateInfoPanel('太空视角', '从太空俯视太阳系。在这个视角下，你可以清楚地看到太阳、地球和月球的相对位置和运动。');
            break;
    }
    
    // 更新控制器
    controls.target.copy(scene.position);
    controls.update();
}

// 更新信息面板
function updateInfoPanel(title, content) {
    infoContent.innerHTML = `<h3>${title}</h3><p>${content}</p>`;
}

// 显示昼夜循环
function showDayNightCycle() {
    // 更改为地球视角
    changeView('earth');
    
    // 将相机移到地球表面
    camera.position.copy(earth.position);
    camera.position.y += 1.2;
    
    // 更新信息面板
    updateInfoPanel('昼夜循环', '地球绕着自己的轴自转，造成昼夜交替。一次完整的自转需要约24小时，也就是一天的时间。从地球表面看，太阳会从东方升起，从西方落下。');
    
    // 加速地球自转以便观察效果
    const originalEarthRotationSpeed = earthRotationSpeed;
    earthRotationSpeed = 0.05;
    
    // 20秒后恢复原速
    setTimeout(() => {
        earthRotationSpeed = originalEarthRotationSpeed;
        changeView('space');
    }, 20000);
}

// 显示四季循环
function showSeasonsCycle() {
    // 更改为太空视角
    changeView('space');
    
    // 调整相机位置以便观察地球公转
    camera.position.set(0, 25, 5);
    camera.lookAt(scene.position);
    
    // 更新信息面板
    updateInfoPanel('四季循环', '地球绕太阳公转加上地轴倾斜，导致了四季变化。当地球公转到不同位置时，阳光照射地球的角度不同，形成了春、夏、秋、冬四个季节。');
    
    // 加速地球公转以便观察效果
    const originalEarthRevolutionSpeed = earthRevolutionSpeed;
    earthRevolutionSpeed = 0.02;
    
    // 20秒后恢复原速
    setTimeout(() => {
        earthRevolutionSpeed = originalEarthRevolutionSpeed;
        changeView('space');
    }, 20000);
}

// 显示月相循环
function showMoonPhasesCycle() {
    // 更改为太空视角，但稍微调整以便观察月相
    camera.position.set(20, 10, 10);
    camera.lookAt(earth.position);
    
    // 更新信息面板
    updateInfoPanel('月相循环', '月相是从地球上看到的月球被太阳照亮部分的形状。随着月球绕地球公转，月相也随之变化，形成新月、上弦月、满月、下弦月等不同形态。一个完整的月相周期约为29.5天。');
    
    // 加速月球公转以便观察效果
    const originalMoonRevolutionSpeed = moonRevolutionSpeed;
    moonRevolutionSpeed = 0.2;
    
    // 20秒后恢复原速
    setTimeout(() => {
        moonRevolutionSpeed = originalMoonRevolutionSpeed;
        changeView('space');
    }, 20000);
}

// 初始化3D场景
init();

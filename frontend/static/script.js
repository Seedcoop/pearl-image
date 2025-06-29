// Pearl Game Asset Generator - JavaScript
document.addEventListener('DOMContentLoaded', function() {
    // UI Elements
    const form = document.getElementById('imageForm');
    const generateBtn = document.getElementById('generateBtn');
    const btnText = document.getElementById('btnText');
    const btnIcon = document.getElementById('btn-icon');
    const spinner = document.getElementById('spinner');
    const promptTextarea = document.getElementById('prompt');
    
    // Result elements
    const loading = document.getElementById('loading');
    const resultContainer = document.getElementById('resultContainer');
    const errorContainer = document.getElementById('errorContainer');
    const generatedImage = document.getElementById('generatedImage');
    const usedPrompt = document.getElementById('usedPrompt');
    const downloadLink = document.getElementById('downloadLink');
    const errorMessage = document.getElementById('errorMessage');
    const saveToGalleryBtn = document.getElementById('saveToGalleryBtn');

    // Gallery elements
    const galleryModal = document.getElementById('galleryModal');
    const galleryLink = document.getElementById('galleryLink');
    const galleryGrid = document.getElementById('galleryGrid');
    const emptyGallery = document.getElementById('emptyGallery');
    const clearGalleryBtn = document.getElementById('clearGalleryBtn');
    const closeGalleryBtn = document.getElementById('closeGalleryBtn');

    // Current selections
    let currentAssetType = 'character';
    let currentSelectedPreset = null;
    let lastGeneratedImage = null;

    // 에셋 타입별 특화 스타일 프리셋
    const assetTypeStylePresets = {
        character: {
            anime: {
                icon: '🌸',
                title: '애니메이션',
                description: '일본 애니메이션 캐릭터',
                prompt: 'anime character style, manga art, cel shading, clean lines, vibrant colors, japanese animation style'
            },
            realistic: {
                icon: '🎭',
                title: '리얼리스틱',
                description: '사실적인 캐릭터',
                prompt: 'realistic character, detailed human anatomy, lifelike proportions, photorealistic rendering'
            },
            pixel_art: {
                icon: '🟨',
                title: '픽셀 아트',
                description: '레트로 픽셀 캐릭터',
                prompt: 'pixel art character, 16-bit style, retro gaming, crisp pixels, character sprite'
            },
            cartoon: {
                icon: '🎪',
                title: '카툰',
                description: '밝고 재미있는 캐릭터',
                prompt: 'cartoon character style, colorful, fun, playful design, exaggerated features'
            },
            watercolor: {
                icon: '🎨',
                title: '수채화',
                description: '부드러운 수채화 캐릭터',
                prompt: 'watercolor character painting, soft brushstrokes, flowing colors, artistic style'
            },
            oil_painting: {
                icon: '🖼️',
                title: '유화',
                description: '고전적인 유화 캐릭터',
                prompt: 'oil painting character, traditional art style, rich textures, classic painting'
            },
            fantasy: {
                icon: '🧙',
                title: '판타지',
                description: '마법적인 판타지 캐릭터',
                prompt: 'fantasy character art, magical elements, mystical atmosphere, detailed fantasy design'
            },
            cyberpunk: {
                icon: '🤖',
                title: '사이버펑크',
                description: '미래적 사이버 캐릭터',
                prompt: 'cyberpunk character, neon colors, futuristic design, high-tech cybernetic elements'
            },
            illustration: {
                icon: '✏️',
                title: '일러스트레이션',
                description: '손그림 일러스트 캐릭터',
                prompt: 'character illustration, hand-drawn style, detailed line art, professional illustration'
            }
        },
        background: {
            concept_art: {
                icon: '🎨',
                title: '컨셉 아트',
                description: '게임 컨셉 아트 배경',
                prompt: 'game concept art background, detailed environment, atmospheric perspective, professional concept design'
            },
            pixel_art: {
                icon: '🟨',
                title: '픽셀 아트',
                description: '레트로 픽셀 배경',
                prompt: 'pixel art background, 16-bit environment, retro gaming style, detailed pixel scenery'
            },
            photorealistic: {
                icon: '📸',
                title: '포토리얼리스틱',
                description: '사진같은 현실적 배경',
                prompt: 'photorealistic background, detailed realistic environment, high-quality rendering'
            },
            fantasy_landscape: {
                icon: '🏰',
                title: '판타지 랜드스케이프',
                description: '마법적인 판타지 풍경',
                prompt: 'fantasy landscape, magical environment, mystical atmosphere, enchanted scenery'
            },
            cyberpunk: {
                icon: '🌆',
                title: '사이버펑크',
                description: '미래 도시 배경',
                prompt: 'cyberpunk cityscape, neon-lit future city, high-tech urban environment'
            },
            panoramic: {
                icon: '🌄',
                title: '파노라마',
                description: '광활한 파노라마 뷰',
                prompt: 'panoramic landscape, wide vista, expansive scenery, cinematic composition'
            },
            minimalist: {
                icon: '⚪',
                title: '미니멀',
                description: '단순하고 깔끔한 배경',
                prompt: 'minimalist background, clean design, simple composition, reduced visual elements'
            },
            watercolor: {
                icon: '🎨',
                title: '수채화',
                description: '부드러운 수채화 배경',
                prompt: 'watercolor landscape, soft brushstrokes, flowing colors, artistic background'
            },
            stylized: {
                icon: '🌈',
                title: '스타일라이즈드',
                description: '양식화된 아트 배경',
                prompt: 'stylized background art, artistic interpretation, unique art style, creative environment'
            }
        },
        item: {
            isometric: {
                icon: '📦',
                title: '아이소메트릭',
                description: '입체적인 아이소메트릭',
                prompt: 'isometric item design, 3D perspective, geometric style, clean isometric view'
            },
            pixel_art: {
                icon: '🟨',
                title: '픽셀 아트',
                description: '레트로 픽셀 아이템',
                prompt: 'pixel art item, 16-bit style, game icon, retro item design, crisp pixels'
            },
            concept_art: {
                icon: '🎨',
                title: '컨셉 아트',
                description: '게임 컨셉 아트 아이템',
                prompt: 'game item concept art, detailed design, professional concept illustration'
            },
            render_3d: {
                icon: '💎',
                title: '3D 렌더',
                description: '3D 렌더링 아이템',
                prompt: '3D rendered item, high-quality 3D model, realistic materials and lighting'
            },
            flat_design: {
                icon: '🔷',
                title: '플랫 디자인',
                description: '평면적인 모던 디자인',
                prompt: 'flat design item, minimalist style, clean geometric shapes, modern icon design'
            },
            icon_style: {
                icon: '⭐',
                title: '아이콘 스타일',
                description: '게임 아이콘 스타일',
                prompt: 'game icon style, clear symbol design, recognizable item icon, UI-friendly'
            },
            realistic: {
                icon: '🎯',
                title: '리얼리스틱',
                description: '사실적인 아이템',
                prompt: 'realistic item design, detailed textures, lifelike materials, photorealistic'
            },
            sketch: {
                icon: '✏️',
                title: '스케치',
                description: '손그림 스케치 아이템',
                prompt: 'hand-drawn item sketch, pencil drawing style, artistic sketch, line art'
            },
            cartoon: {
                icon: '🎪',
                title: '카툰',
                description: '밝고 재미있는 카툰 아이템',
                prompt: 'cartoon item style, colorful, fun design, playful cartoon aesthetics'
            }
        },
        ui: {
            flat_design: {
                icon: '📱',
                title: '플랫 디자인',
                description: '모던 플랫 UI',
                prompt: 'flat design UI, minimalist interface, clean geometric shapes, modern UI elements'
            },
            material_design: {
                icon: '🎨',
                title: '머터리얼 디자인',
                description: '구글 머터리얼 스타일',
                prompt: 'material design UI, elevation shadows, bold colors, clean typography'
            },
            skeuomorphic: {
                icon: '💼',
                title: '스큐어모피즘',
                description: '현실적인 질감 UI',
                prompt: 'skeuomorphic UI design, realistic textures, 3D-like elements, tactile interface'
            },
            glassmorphism: {
                icon: '🔮',
                title: '글라스모피즘',
                description: '투명한 유리 질감 UI',
                prompt: 'glassmorphism UI, transparent glass effect, blur background, modern glass design'
            },
            neumorphism: {
                icon: '🌑',
                title: '뉴모피즘',
                description: '부드러운 그림자 UI',
                prompt: 'neumorphism UI design, soft shadows, subtle depth, modern minimalist interface'
            },
            minimalist: {
                icon: '⚪',
                title: '미니멀',
                description: '극도로 단순한 UI',
                prompt: 'minimalist UI design, ultra-clean interface, essential elements only, pure simplicity'
            },
            pixel_art: {
                icon: '🟨',
                title: '픽셀 아트',
                description: '레트로 픽셀 UI',
                prompt: 'pixel art UI, 16-bit interface, retro game UI, crisp pixel design'
            },
            fantasy: {
                icon: '🧙',
                title: '판타지',
                description: '마법적인 판타지 UI',
                prompt: 'fantasy UI design, magical interface, ornate decorations, mystical elements'
            },
            cyberpunk: {
                icon: '🤖',
                title: '사이버펑크',
                description: '미래적 네온 UI',
                prompt: 'cyberpunk UI interface, neon colors, futuristic HUD, high-tech design'
            }
        }
    };

    // Asset type별 플레이스홀더
    const assetTypePlaceholders = {
        character: [
            '빛나는 룬이 새겨진 판타지 검사',
            '사이버펑크 해커 캐릭터',
            '귀여운 동물 전사',
            '마법 지팡이를 든 마법사',
            '미래형 로봇 캐릭터',
            '중세 기사 캐릭터'
        ],
        background: [
            '신비로운 빛나는 숲',
            '사이버펑크 도시의 밤 거리',
            '고대 사원 유적',
            '수중 산호초 장면',
            '화산 동굴 내부',
            '우주 정거장 내부'
        ],
        item: [
            '빛나는 체력 회복 포션',
            '고대 보물 상자',
            '룬이 새겨진 마법 검',
            '크리스탈 파워업 젬',
            '신비로운 마법 반지',
            '에너지 실드 장치'
        ],
        ui: [
            '메탈릭 게임 버튼',
            '체력바 인터페이스',
            '인벤토리 패널 디자인',
            '메뉴 배경 프레임',
            '미니맵 UI 요소',
            '스킬 아이콘 버튼'
        ]
    };

    // Initialize the application
    function init() {
        setupAssetTypeTabs();
        updatePresets(); // 초기 프리셋 로드
        setupGallery();
        setupGuidanceSlider();
        setupSeedInput();
        updatePlaceholderForAssetType();
        
        // 폼 제출 이벤트
        document.getElementById('imageForm').addEventListener('submit', function(e) {
            e.preventDefault();
            generateImage();
        });
        
        // 갤러리 버튼 이벤트
        document.getElementById('galleryBtn').addEventListener('click', openGallery);
        document.getElementById('closeGalleryBtn').addEventListener('click', closeGallery);
        document.getElementById('clearGalleryBtn').addEventListener('click', clearGallery);
        
        console.log('🎮 Pearl Game Asset Generator initialized successfully!');
    }

    // Setup asset type tabs
    function setupAssetTypeTabs() {
        const tabs = document.querySelectorAll('[data-asset-type]');
        tabs.forEach(tab => {
            tab.addEventListener('click', (e) => {
                e.preventDefault();
                const assetType = tab.dataset.assetType;
                changeAssetType(assetType);
            });
        });
    }

    // Select asset type
    function changeAssetType(assetType) {
        // 탭 상태 업데이트
        document.querySelectorAll('[data-asset-type]').forEach(tab => {
            tab.classList.remove('pearl-abyss-tab-active');
            tab.classList.add('pearl-abyss-tab-inactive');
        });
        
        const selectedTab = document.querySelector(`[data-asset-type="${assetType}"]`);
        if (selectedTab) {
            selectedTab.classList.remove('pearl-abyss-tab-inactive');
            selectedTab.classList.add('pearl-abyss-tab-active');
        }

        currentAssetType = assetType;
        currentSelectedPreset = null; // 프리셋 선택 리셋
        updatePresets(); // 새로운 에셋 타입에 맞는 프리셋으로 업데이트
        updatePlaceholderForAssetType();
    }

    // Select preset
    function selectPreset(presetKey, preset) {
        // 이전 선택 해제
        document.querySelectorAll('.preset-card').forEach(card => {
            card.classList.remove('pearl-abyss-preset-selected');
        });
        
        // 새 선택 적용
        const selectedCard = document.querySelector(`[data-preset="${presetKey}"]`);
        if (selectedCard) {
            selectedCard.classList.add('pearl-abyss-preset-selected');
        }
        
        currentSelectedPreset = preset;
        console.log('Selected preset:', preset.title);
    }

    // Setup guidance slider
    function setupGuidanceSlider() {
        const slider = document.getElementById('guidance_scale');
        const valueDisplay = document.getElementById('guidance_value');
        const fillElement = document.getElementById('guidance_fill');

        if (slider && valueDisplay && fillElement) {
            slider.addEventListener('input', function() {
                const value = this.value;
                valueDisplay.textContent = value;
                
                const percentage = ((value - this.min) / (this.max - this.min)) * 100;
                fillElement.style.width = `${percentage}%`;
            });
        }
    }

    // Setup seed input
    function setupSeedInput() {
        const seedInput = document.getElementById('seed');
        if (seedInput) {
            seedInput.addEventListener('dblclick', function() {
                this.value = Math.floor(Math.random() * 2147483647);
            });
        }
    }

    // Update placeholder for current asset type
    function updatePlaceholderForAssetType() {
        const placeholders = assetTypePlaceholders[currentAssetType] || assetTypePlaceholders.character;
        const randomPlaceholder = placeholders[Math.floor(Math.random() * placeholders.length)];
        promptTextarea.placeholder = `생성하고 싶은 에셋을 자세히 설명해주세요 (예: '${randomPlaceholder}')`;
    }

    // 이미지 생성 함수
    async function generateImage() {
        const prompt = document.getElementById('prompt').value;
        const aspectRatio = document.getElementById('aspect_ratio').value;
        const guidanceScale = parseFloat(document.getElementById('guidance_scale').value);
        const seed = parseInt(document.getElementById('seed').value) || 0;
        const transparentBg = document.getElementById('transparent_bg').checked;

        if (!prompt.trim()) {
            alert('프롬프트를 입력해주세요.');
            return;
        }

        // 선택된 프리셋의 프롬프트 추가
        let finalPrompt = prompt;
        if (currentSelectedPreset && currentSelectedPreset.prompt) {
            finalPrompt = prompt + ', ' + currentSelectedPreset.prompt;
        }

        // 로딩 상태 시작
        setLoadingState(true);
        hideAllSections();
        showSection(loading);

        try {
            const response = await fetch('/generate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    prompt: finalPrompt,
                    aspect_ratio: aspectRatio,
                    guidance_scale: guidanceScale,
                    seed: seed,
                    transparent_bg: transparentBg
                })
            });

            const data = await response.json();

            if (data.success) {
                lastGeneratedImage = {
                    url: data.image_path,
                    prompt: finalPrompt,
                    timestamp: new Date().toISOString(),
                    assetType: currentAssetType,
                    preset: currentSelectedPreset
                };
                showResult(data.image_path, finalPrompt);
                
                // 갤러리에 저장
                saveToGallery({
                    imagePath: data.image_path,
                    prompt: finalPrompt,
                    assetType: currentAssetType,
                    presetTitle: currentSelectedPreset ? currentSelectedPreset.title : null,
                    aspectRatio: aspectRatio,
                    guidanceScale: guidanceScale,
                    seed: seed,
                    transparentBg: transparentBg,
                    timestamp: new Date().toISOString()
                });
            } else {
                showError(data.error || '알 수 없는 오류가 발생했습니다.');
            }
        } catch (error) {
            console.error('Error:', error);
            showError('네트워크 오류가 발생했습니다. 다시 시도해주세요.');
        } finally {
            setLoadingState(false);
        }
    }

    // Set loading state
    function setLoadingState(isLoading) {
        generateBtn.disabled = isLoading;
        
        if (isLoading) {
            btnText.textContent = '생성중...';
            btnIcon.textContent = 'hourglass_empty';
            generateBtn.classList.add('opacity-50');
        } else {
            btnText.textContent = '에셋 생성하기';
            btnIcon.textContent = 'auto_awesome';
            generateBtn.classList.remove('opacity-50');
        }
    }

    // Show result
    function showResult(imageUrl, prompt) {
        hideAllSections();
        
        generatedImage.src = imageUrl;
        generatedImage.alt = prompt;
        usedPrompt.textContent = prompt;
        downloadLink.href = imageUrl;
        downloadLink.download = `asset_${Date.now()}.jpg`;
        
        showSection(resultContainer);
    }

    // Show error
    function showError(message) {
        hideAllSections();
        errorMessage.textContent = message;
        showSection(errorContainer);
    }

    // Hide all result sections
    function hideAllSections() {
        loading.style.display = 'none';
        resultContainer.style.display = 'none';
        errorContainer.style.display = 'none';
    }

    // Show specific section
    function showSection(section) {
        section.style.display = 'block';
    }

    // Gallery functions
    function setupGallery() {
        // Gallery link click
        if (galleryLink) {
            galleryLink.addEventListener('click', (e) => {
                e.preventDefault();
                openGallery();
            });
        }

        // Save to gallery button
        if (saveToGalleryBtn) {
            saveToGalleryBtn.addEventListener('click', saveToGallery);
        }

        // Close gallery modal
        if (closeGalleryBtn) {
            closeGalleryBtn.addEventListener('click', closeGallery);
        }

        // Clear gallery
        if (clearGalleryBtn) {
            clearGalleryBtn.addEventListener('click', clearGallery);
        }

        // Close modal on backdrop click
        if (galleryModal) {
            galleryModal.addEventListener('click', (e) => {
                if (e.target === galleryModal) {
                    closeGallery();
                }
            });
        }
    }

    function saveToGallery() {
        if (!lastGeneratedImage) return;

        const savedImages = JSON.parse(localStorage.getItem('assetGallery') || '[]');
        
        const imageData = {
            id: Date.now(),
            ...lastGeneratedImage
        };

        savedImages.push(imageData);
        localStorage.setItem('assetGallery', JSON.stringify(savedImages));

        // Show success feedback
        saveToGalleryBtn.innerHTML = '<span class="material-symbols-outlined mr-2">check</span>저장됨!';
        saveToGalleryBtn.classList.add('bg-green-600');
        
        setTimeout(() => {
            saveToGalleryBtn.innerHTML = '<span class="material-symbols-outlined mr-2">save</span>갤러리 저장';
            saveToGalleryBtn.classList.remove('bg-green-600');
        }, 2000);
    }

    function openGallery() {
        loadGalleryImages();
        galleryModal.classList.remove('hidden');
    }

    function closeGallery() {
        galleryModal.classList.add('hidden');
    }

    function loadGalleryImages() {
        const savedImages = JSON.parse(localStorage.getItem('assetGallery') || '[]');
        
        if (savedImages.length === 0) {
            galleryGrid.style.display = 'none';
            emptyGallery.classList.remove('hidden');
            return;
        }

        galleryGrid.style.display = 'grid';
        emptyGallery.classList.add('hidden');
        galleryGrid.innerHTML = '';

        // Sort by timestamp (newest first)
        savedImages.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

        savedImages.forEach(image => {
            const imageCard = document.createElement('div');
            imageCard.className = 'bg-[var(--pearl-abyss-bg-medium)] rounded-lg p-4 shadow-lg';
            
            const date = new Date(image.timestamp).toLocaleDateString('ko-KR');
            const assetTypeKorean = {
                character: '캐릭터',
                background: '배경',
                item: '아이템',
                ui: 'UI 요소'
            };

            imageCard.innerHTML = `
                <img src="${image.url}" alt="${image.prompt}" class="w-full h-32 object-cover rounded-lg mb-3">
                <div class="text-sm">
                    <div class="text-[var(--pearl-abyss-text)] font-medium mb-1">${assetTypeKorean[image.assetType] || image.assetType}</div>
                    <div class="text-[var(--pearl-abyss-text-muted)] text-xs mb-2">${date}</div>
                    <div class="text-[var(--pearl-abyss-text-muted)] text-xs line-clamp-2">${image.prompt}</div>
                </div>
                <div class="flex gap-2 mt-3">
                    <button onclick="downloadFromGallery('${image.url}', '${date}')" class="flex-1 px-3 py-1 bg-[var(--pearl-abyss-accent)] text-[var(--pearl-abyss-bg-dark)] rounded text-xs font-medium hover:bg-[#c8901f] transition-colors">
                        다운로드
                    </button>
                    <button onclick="removeFromGallery(${image.id})" class="px-3 py-1 bg-red-600 text-white rounded text-xs font-medium hover:bg-red-700 transition-colors">
                        삭제
                    </button>
                </div>
            `;

            galleryGrid.appendChild(imageCard);
        });
    }

    function clearGallery() {
        if (confirm('모든 저장된 이미지를 삭제하시겠습니까?')) {
            localStorage.removeItem('assetGallery');
            loadGalleryImages();
        }
    }

    // Global functions for gallery actions
    window.downloadFromGallery = function(url, date) {
        const link = document.createElement('a');
        link.href = url;
        link.download = `asset_${date}.jpg`;
        link.click();
    };

    window.removeFromGallery = function(id) {
        const savedImages = JSON.parse(localStorage.getItem('assetGallery') || '[]');
        const filteredImages = savedImages.filter(img => img.id !== id);
        localStorage.setItem('assetGallery', JSON.stringify(filteredImages));
        loadGalleryImages();
    };

    // 프리셋 업데이트 함수
    function updatePresets() {
        const presetGrid = document.getElementById('preset-grid');
        if (!presetGrid) return;
        
        presetGrid.innerHTML = '';

        const presets = assetTypeStylePresets[currentAssetType] || {};

        // Create preset cards
        Object.entries(presets).forEach(([key, preset]) => {
            const card = document.createElement('div');
            card.className = 'preset-card pearl-abyss-preset-card p-4 rounded-lg border-2 border-transparent hover:border-[var(--pearl-abyss-primary)] transition-all duration-300 cursor-pointer group';
            card.dataset.preset = key;
            
            card.innerHTML = `
                <div class="flex flex-col items-center text-center space-y-2">
                    <div class="text-3xl mb-2 group-hover:scale-110 transition-transform duration-300">${preset.icon}</div>
                    <h4 class="text-[var(--pearl-abyss-text)] font-bold text-base leading-tight">${preset.title}</h4>
                    <p class="text-[var(--pearl-abyss-text-muted)] text-sm leading-snug">${preset.description}</p>
                </div>
            `;
            
            card.addEventListener('click', () => selectPreset(key, preset));
            presetGrid.appendChild(card);
        });
    }

    // Initialize the app
    init();
}); 
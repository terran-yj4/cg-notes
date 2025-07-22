/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ "./src/app.ts":
/*!********************!*\
  !*** ./src/app.ts ***!
  \********************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony import */ var three__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! three */ "./node_modules/three/build/three.module.js");
/* harmony import */ var three_examples_jsm_controls_OrbitControls__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! three/examples/jsm/controls/OrbitControls */ "./node_modules/three/examples/jsm/controls/OrbitControls.js");


class ThreeJSContainer {
    scene;
    plane;
    group;
    staff;
    notes;
    ball;
    camera; // カメラを移動させるために定義
    staffMaterial = new three__WEBPACK_IMPORTED_MODULE_1__.MeshStandardMaterial({ color: 0x000000 });
    geometry;
    material;
    light;
    audioContext;
    oscillator = null;
    constructor() {
        this.staff = new three__WEBPACK_IMPORTED_MODULE_1__.Group();
        this.notes = new three__WEBPACK_IMPORTED_MODULE_1__.Group();
        this.light = new three__WEBPACK_IMPORTED_MODULE_1__.PointLight(0x00ffff, 1.0, 150); // 距離100まで光が届く
        // オーディオコンテキストの初期化
        this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
    }
    // 画面部分の作成(表示する枠ごとに)*
    createRendererDOM = (width, height, cameraPos) => {
        let renderer = new three__WEBPACK_IMPORTED_MODULE_1__.WebGLRenderer({ antialias: true });
        renderer.setSize(width, height);
        renderer.setClearColor(new three__WEBPACK_IMPORTED_MODULE_1__.Color(0x00eeff)); // 背景色
        renderer.shadowMap.enabled = true; // シャドウの設定
        renderer.shadowMap.type = three__WEBPACK_IMPORTED_MODULE_1__.PCFSoftShadowMap;
        //カメラの設定
        this.camera = new three__WEBPACK_IMPORTED_MODULE_1__.PerspectiveCamera(75, width / height, 0.1, 1000);
        this.camera.position.copy(cameraPos);
        this.camera.lookAt(new three__WEBPACK_IMPORTED_MODULE_1__.Vector3(0, 0, 0));
        let orbitControls = new three_examples_jsm_controls_OrbitControls__WEBPACK_IMPORTED_MODULE_0__.OrbitControls(this.camera, renderer.domElement);
        this.createScene();
        // 毎フレームのupdateを呼んで，render
        // reqestAnimationFrame により次フレームを呼ぶ
        let render = (time) => {
            // orbitControls.update();
            renderer.render(this.scene, this.camera);
            requestAnimationFrame(render);
        };
        requestAnimationFrame(render);
        renderer.domElement.style.cssFloat = "left";
        renderer.domElement.style.margin = "10px";
        return renderer.domElement;
    };
    // シーンの作成(全体で1回)
    createScene = () => {
        this.scene = new three__WEBPACK_IMPORTED_MODULE_1__.Scene();
        const spacing = 24;
        /**
         * 音符を配置
         * @param pitch
         */
        const createNote = (pitch, count) => {
            const noteX = (2 * count + 1) * spacing;
            // 幅10・高さ1の円柱
            const geometry = new three__WEBPACK_IMPORTED_MODULE_1__.CylinderGeometry(12, 12, 2, 64);
            const material = new three__WEBPACK_IMPORTED_MODULE_1__.MeshStandardMaterial({
                color: 0x333333,
                metalness: 0.8,
                roughness: 0.2,
                emissive: 0x000000,
                emissiveIntensity: 0.0
            });
            const note = new three__WEBPACK_IMPORTED_MODULE_1__.Mesh(geometry, material);
            note.position.set(noteX, -4, pitch * -spacing / 2 + spacing * 3); // 0 -> C3, 7->C4
            note.receiveShadow = true;
            note.castShadow = true;
            this.notes.add(note);
            // 6 -> B3以上は下に線を伸ばし、それ未満は線を上に伸ばす
            const noteBarGeometry = new three__WEBPACK_IMPORTED_MODULE_1__.BoxGeometry(3, 1, spacing * 3.5);
            const noteBar = new three__WEBPACK_IMPORTED_MODULE_1__.Mesh(noteBarGeometry, this.staffMaterial);
            noteBar.position.set(noteX + (pitch >= 6 ? -10.5 : 10.5), -4, pitch * -spacing / 2 + spacing * 3 + (pitch >= 6 ? 41 : -41));
            noteBar.receiveShadow = true;
            noteBar.castShadow = true;
            this.scene.add(noteBar);
            // C3以下の高さには補助線を追加
            const barHeight = 1;
            const barDepth = 3;
            const staffGeometry = new three__WEBPACK_IMPORTED_MODULE_1__.BoxGeometry(spacing * 1.5, barHeight, barDepth);
            if (pitch <= 0) {
                for (let i = 0; i < Math.floor(Math.abs(pitch) / 2) + 1; i++) {
                    const bar = new three__WEBPACK_IMPORTED_MODULE_1__.Mesh(staffGeometry, this.staffMaterial);
                    bar.position.set(noteX, -4, spacing * 3 + i * spacing);
                    bar.castShadow = true;
                    bar.receiveShadow = true;
                    this.scene.add(bar);
                }
            }
            if (pitch >= 12) {
                for (let i = 0; i < Math.floor(Math.abs(pitch) / 2) - 5; i++) {
                    const bar = new three__WEBPACK_IMPORTED_MODULE_1__.Mesh(staffGeometry, this.staffMaterial);
                    bar.position.set(noteX, -4, -spacing * 3 - i * spacing);
                    bar.castShadow = true;
                    bar.receiveShadow = true;
                    this.scene.add(bar);
                }
            }
        };
        // 五線譜を配置
        const createStaff = (length) => {
            const barLength = length + 400;
            const barHeight = 1;
            const barDepth = 3;
            const baseY = -4;
            const baseZ = 0;
            const staffGeometry = new three__WEBPACK_IMPORTED_MODULE_1__.BoxGeometry(barLength, barHeight, barDepth);
            for (let i = 0; i < 5; i++) {
                const bar = new three__WEBPACK_IMPORTED_MODULE_1__.Mesh(staffGeometry, this.staffMaterial);
                bar.position.set(length / 2, baseY, baseZ + (2 - i) * spacing);
                bar.castShadow = true;
                bar.receiveShadow = true;
                this.staff.add(bar);
            }
            const barLineGeometry = new three__WEBPACK_IMPORTED_MODULE_1__.BoxGeometry(barDepth, barHeight, spacing * 4 + 3);
            let barLineX = spacing * 2 * 8; // 小節を区切る線
            while (barLineX < length) {
                const bar = new three__WEBPACK_IMPORTED_MODULE_1__.Mesh(barLineGeometry, this.staffMaterial);
                bar.position.set(barLineX, baseY, baseZ);
                bar.castShadow = true;
                bar.receiveShadow = true;
                barLineX += spacing * 2 * 8;
                this.staff.add(bar);
            }
            this.scene.add(this.staff);
        };
        const createPlane = (length) => {
            // 平面の生成
            let planeGeometry = new three__WEBPACK_IMPORTED_MODULE_1__.PlaneGeometry(length + 400, 400);
            let planeMaterial = new three__WEBPACK_IMPORTED_MODULE_1__.MeshStandardMaterial({ color: 0xffffff, metalness: 0.3, roughness: 0.9 });
            this.plane = new three__WEBPACK_IMPORTED_MODULE_1__.Mesh(planeGeometry, planeMaterial);
            this.plane.receiveShadow = true; //影を受けるようにする
            this.plane.position.x = length / 2;
            this.plane.position.y = -5;
            this.plane.rotation.x = -Math.PI / 2;
            this.scene.add(this.plane);
        };
        const createBall = () => {
            const ballGeometry = new three__WEBPACK_IMPORTED_MODULE_1__.SphereGeometry(6, 32, 32);
            const ballMaterial = new three__WEBPACK_IMPORTED_MODULE_1__.MeshStandardMaterial({ color: 0x00ffff });
            this.ball = new three__WEBPACK_IMPORTED_MODULE_1__.Mesh(ballGeometry, ballMaterial);
            this.ball.castShadow = true;
            this.ball.position.set(0, 0, 0);
            this.scene.add(this.ball);
        };
        this.light.position.set(5, 50, 5);
        this.light.castShadow = true;
        this.scene.add(this.light);
        const hermite = (p0, v0, p1, v1, t) => {
            //エルミート曲線を実装する
            const result = p0.clone().multiplyScalar((2 * t + 1) * (1 - t) ** 2).clone().add(v0.clone().multiplyScalar(t * (1 - t) ** 2)).clone().add(p1.clone().multiplyScalar(t ** 2 * (3 - 2 * t))).clone().add(v1.clone().multiplyScalar(-1 * t ** 2 * (1 - t)));
            return result;
        };
        // ここでエルミート曲線を作る。
        const noteData = [
            // 小節 1
            { pitch: 4, start: 0, duration: 1 },
            { pitch: 4, start: 1, duration: 1 },
            { pitch: 5, start: 2, duration: 1 },
            { pitch: 7, start: 3, duration: 1 },
            // 小節 2
            { pitch: 7, start: 4, duration: 1 },
            { pitch: 5, start: 5, duration: 1 },
            { pitch: 4, start: 6, duration: 1 },
            { pitch: 2, start: 7, duration: 1 },
            // 小節 3
            { pitch: 0, start: 8, duration: 1 },
            { pitch: 0, start: 9, duration: 1 },
            { pitch: 2, start: 10, duration: 1 },
            { pitch: 4, start: 11, duration: 1 },
            // 小節 4
            { pitch: 4, start: 12, duration: 1.5 },
            { pitch: 2, start: 13.5, duration: 0.5 },
            { pitch: 2, start: 14, duration: 2 },
            // 小節 5
            { pitch: 4, start: 16, duration: 1 },
            { pitch: 4, start: 17, duration: 1 },
            { pitch: 5, start: 18, duration: 1 },
            { pitch: 7, start: 19, duration: 1 },
            // 小節 6
            { pitch: 7, start: 20, duration: 1 },
            { pitch: 5, start: 21, duration: 1 },
            { pitch: 4, start: 22, duration: 1 },
            { pitch: 2, start: 23, duration: 1 },
            // 小節 7
            { pitch: 0, start: 24, duration: 1 },
            { pitch: 0, start: 25, duration: 1 },
            { pitch: 2, start: 26, duration: 1 },
            { pitch: 4, start: 27, duration: 1 },
            // 小節 8
            { pitch: 2, start: 28, duration: 1.5 },
            { pitch: 0, start: 29.5, duration: 0.5 },
            { pitch: 0, start: 30, duration: 2 }
        ];
        createStaff((2 * noteData[noteData.length - 1].start + 1) * spacing);
        createPlane((2 * noteData[noteData.length - 1].start + 1) * spacing);
        createBall();
        // JSONから音符を追加 for 音符配置
        noteData.forEach(note => {
            createNote(note.pitch, note.start);
        });
        this.scene.add(this.notes);
        // 音符のX,Z座標リストを作成（createNoteと同じ座標計算を使用）
        const notePositions = noteData.map(note => {
            const x = (2 * note.start + 1) * spacing; // createNoteと同じ計算
            const z = note.pitch * -spacing / 2 + spacing * 3;
            return new three__WEBPACK_IMPORTED_MODULE_1__.Vector3(x, 5, z);
        });
        // ボールのアニメーション用変数
        let currentNoteIndex = 0;
        let animationStartTime = 0;
        let isAnimating = false;
        let startPos = new three__WEBPACK_IMPORTED_MODULE_1__.Vector3(0, 5, spacing * 3); // 開始位置
        function hermite3D(p0, p1, duration, elapsed, v0 = new three__WEBPACK_IMPORTED_MODULE_1__.Vector3(0, 100, 0), v1 = new three__WEBPACK_IMPORTED_MODULE_1__.Vector3(0, 100, 0)) {
            const t = Math.min(elapsed / duration, 1); // 時間に対して正規化されたt
            const h00 = 2 * t ** 3 - 3 * t ** 2 + 1;
            const h10 = t ** 3 - 2 * t ** 2 + t;
            const h01 = -2 * t ** 3 + 3 * t ** 2;
            const h11 = t ** 3 - t ** 2;
            // エルミート補間計算
            const result = new three__WEBPACK_IMPORTED_MODULE_1__.Vector3();
            result.clone().addScaledVector(p0, h00);
            result.clone().addScaledVector(v0, h10);
            result.clone().addScaledVector(p1, h01);
            result.clone().addScaledVector(v1, h11);
            return result;
        }
        //ライトの設定
        const light = new three__WEBPACK_IMPORTED_MODULE_1__.DirectionalLight(0xffffff, 0.6);
        const lvec = new three__WEBPACK_IMPORTED_MODULE_1__.Vector3(1, 1, -1).clone().normalize();
        light.position.set(lvec.x, lvec.y, lvec.z);
        this.scene.add(light);
        // console.log(this.notes);
        let update = (time) => {
            // ボールのアニメーション
            if (currentNoteIndex < notePositions.length) {
                if (!isAnimating) {
                    // アニメーション開始
                    isAnimating = true;
                    animationStartTime = time;
                }
                const currentNote = noteData[currentNoteIndex];
                const prevNote = currentNoteIndex > 0 ? noteData[currentNoteIndex - 1] : null;
                // 前の音符のdurationを使用して移動時間を計算
                let duration;
                if (prevNote) {
                    duration = prevNote.duration * 1000; // 前の音符のdurationを使用
                }
                else {
                    duration = 1000; // 最初の音符は1秒で移動
                }
                const elapsed = time - animationStartTime;
                const progress = Math.min(elapsed / duration * 2, 1);
                if (progress < 1) {
                    // 現在のノートから次のノートへ弧を描いて飛ぶアニメーション
                    const currentPos = currentNoteIndex === 0 ? startPos : notePositions[currentNoteIndex - 1];
                    const targetPos = notePositions[currentNoteIndex];
                    // durationに基づいて弧の高さを計算
                    const baseHeight = 20;
                    const durationMultiplier = prevNote ? prevNote.duration : 1;
                    const jumpHeight = baseHeight * durationMultiplier;
                    const jumpProgress = Math.sin(progress * Math.PI); // 1回の弧
                    // 線形補間で位置を計算
                    this.ball.position.x = currentPos.x + (targetPos.x - currentPos.x) * progress;
                    this.ball.position.y = currentPos.y + jumpHeight * jumpProgress;
                    this.ball.position.z = currentPos.z + (targetPos.z - currentPos.z) * progress;
                    // ライトをボールに追従させる
                    this.light.position.x = this.ball.position.x;
                    this.light.position.y = this.ball.position.y + 20; // ボールの少し上に配置
                    this.light.position.z = this.ball.position.z;
                }
                else {
                    // 現在のノートのアニメーション完了
                    isAnimating = false;
                    currentNoteIndex++;
                    // 現在の音符を光らせて音を鳴らす（通過したことを示す）
                    if (currentNoteIndex - 1 < this.notes.children.length) {
                        const noteMesh = this.notes.children[currentNoteIndex - 1];
                        if (noteMesh instanceof three__WEBPACK_IMPORTED_MODULE_1__.Mesh && noteMesh.material instanceof three__WEBPACK_IMPORTED_MODULE_1__.MeshStandardMaterial) {
                            noteMesh.material.color.set(0x00ffff); // 黄色に変更
                            noteMesh.material.emissive.set(0x00ffff); // 発光効果を追加
                            noteMesh.material.emissiveIntensity = 1; // 発光強度
                        }
                        // 音を鳴らす
                        this.playNote(noteData[currentNoteIndex - 1].pitch);
                    }
                }
            }
            // カメラをライトに追従させて、常に前を見る
            // this.light.position.x += 4;
            this.camera.position.x = this.light.position.x - 55;
            this.camera.lookAt(this.light.position.x, 0, 0); // ライトのある方向を注視
            requestAnimationFrame(update);
        };
        requestAnimationFrame(update);
    };
    // 音を鳴らすメソッド
    playNote = (pitch) => {
        // 既存のオシレーターを停止
        if (this.oscillator) {
            this.oscillator.stop();
            this.oscillator.disconnect();
        }
        // 新しいオシレーターを作成
        this.oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        // ピッチから周波数を計算（C4 = 261.63Hzを基準）
        const baseFreq = 261.63; // C4
        const frequency = baseFreq * Math.pow(2, pitch / 12);
        // オシレーターの設定
        this.oscillator.type = 'sine';
        this.oscillator.frequency.setValueAtTime(frequency, this.audioContext.currentTime);
        // ゲインの設定（フェードイン・フェードアウト）
        gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
        gainNode.gain.linearRampToValueAtTime(0.3, this.audioContext.currentTime + 0.1);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.5);
        // 接続
        this.oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
        // 音を開始
        this.oscillator.start();
        this.oscillator.stop(this.audioContext.currentTime + 0.5);
    };
}
window.addEventListener("DOMContentLoaded", init);
function init() {
    let container = new ThreeJSContainer();
    let viewport = container.createRendererDOM(640, 480, new three__WEBPACK_IMPORTED_MODULE_1__.Vector3(-50, 100, 100));
    document.body.appendChild(viewport);
}


/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = __webpack_modules__;
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/chunk loaded */
/******/ 	(() => {
/******/ 		var deferred = [];
/******/ 		__webpack_require__.O = (result, chunkIds, fn, priority) => {
/******/ 			if(chunkIds) {
/******/ 				priority = priority || 0;
/******/ 				for(var i = deferred.length; i > 0 && deferred[i - 1][2] > priority; i--) deferred[i] = deferred[i - 1];
/******/ 				deferred[i] = [chunkIds, fn, priority];
/******/ 				return;
/******/ 			}
/******/ 			var notFulfilled = Infinity;
/******/ 			for (var i = 0; i < deferred.length; i++) {
/******/ 				var [chunkIds, fn, priority] = deferred[i];
/******/ 				var fulfilled = true;
/******/ 				for (var j = 0; j < chunkIds.length; j++) {
/******/ 					if ((priority & 1 === 0 || notFulfilled >= priority) && Object.keys(__webpack_require__.O).every((key) => (__webpack_require__.O[key](chunkIds[j])))) {
/******/ 						chunkIds.splice(j--, 1);
/******/ 					} else {
/******/ 						fulfilled = false;
/******/ 						if(priority < notFulfilled) notFulfilled = priority;
/******/ 					}
/******/ 				}
/******/ 				if(fulfilled) {
/******/ 					deferred.splice(i--, 1)
/******/ 					var r = fn();
/******/ 					if (r !== undefined) result = r;
/******/ 				}
/******/ 			}
/******/ 			return result;
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/define property getters */
/******/ 	(() => {
/******/ 		// define getter functions for harmony exports
/******/ 		__webpack_require__.d = (exports, definition) => {
/******/ 			for(var key in definition) {
/******/ 				if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 					Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	(() => {
/******/ 		__webpack_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop))
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	(() => {
/******/ 		// define __esModule on exports
/******/ 		__webpack_require__.r = (exports) => {
/******/ 			if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/jsonp chunk loading */
/******/ 	(() => {
/******/ 		// no baseURI
/******/ 		
/******/ 		// object to store loaded and loading chunks
/******/ 		// undefined = chunk not loaded, null = chunk preloaded/prefetched
/******/ 		// [resolve, reject, Promise] = chunk loading, 0 = chunk loaded
/******/ 		var installedChunks = {
/******/ 			"main": 0
/******/ 		};
/******/ 		
/******/ 		// no chunk on demand loading
/******/ 		
/******/ 		// no prefetching
/******/ 		
/******/ 		// no preloaded
/******/ 		
/******/ 		// no HMR
/******/ 		
/******/ 		// no HMR manifest
/******/ 		
/******/ 		__webpack_require__.O.j = (chunkId) => (installedChunks[chunkId] === 0);
/******/ 		
/******/ 		// install a JSONP callback for chunk loading
/******/ 		var webpackJsonpCallback = (parentChunkLoadingFunction, data) => {
/******/ 			var [chunkIds, moreModules, runtime] = data;
/******/ 			// add "moreModules" to the modules object,
/******/ 			// then flag all "chunkIds" as loaded and fire callback
/******/ 			var moduleId, chunkId, i = 0;
/******/ 			if(chunkIds.some((id) => (installedChunks[id] !== 0))) {
/******/ 				for(moduleId in moreModules) {
/******/ 					if(__webpack_require__.o(moreModules, moduleId)) {
/******/ 						__webpack_require__.m[moduleId] = moreModules[moduleId];
/******/ 					}
/******/ 				}
/******/ 				if(runtime) var result = runtime(__webpack_require__);
/******/ 			}
/******/ 			if(parentChunkLoadingFunction) parentChunkLoadingFunction(data);
/******/ 			for(;i < chunkIds.length; i++) {
/******/ 				chunkId = chunkIds[i];
/******/ 				if(__webpack_require__.o(installedChunks, chunkId) && installedChunks[chunkId]) {
/******/ 					installedChunks[chunkId][0]();
/******/ 				}
/******/ 				installedChunks[chunkId] = 0;
/******/ 			}
/******/ 			return __webpack_require__.O(result);
/******/ 		}
/******/ 		
/******/ 		var chunkLoadingGlobal = self["webpackChunkcgprendering"] = self["webpackChunkcgprendering"] || [];
/******/ 		chunkLoadingGlobal.forEach(webpackJsonpCallback.bind(null, 0));
/******/ 		chunkLoadingGlobal.push = webpackJsonpCallback.bind(null, chunkLoadingGlobal.push.bind(chunkLoadingGlobal));
/******/ 	})();
/******/ 	
/************************************************************************/
/******/ 	
/******/ 	// startup
/******/ 	// Load entry module and return exports
/******/ 	// This entry module depends on other loaded chunks and execution need to be delayed
/******/ 	var __webpack_exports__ = __webpack_require__.O(undefined, ["vendors-node_modules_three_examples_jsm_controls_OrbitControls_js"], () => (__webpack_require__("./src/app.ts")))
/******/ 	__webpack_exports__ = __webpack_require__.O(__webpack_exports__);
/******/ 	
/******/ })()
;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,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QUMsRUFBRSxRQUFRLEVBQUUsQ0FBQyxFQUFFO1lBQ25DLEVBQUUsS0FBSyxFQUFFLENBQUMsRUFBRSxLQUFLLEVBQUUsQ0FBQyxFQUFFLFFBQVEsRUFBRSxDQUFDLEVBQUU7WUFDbkMsRUFBRSxLQUFLLEVBQUUsQ0FBQyxFQUFFLEtBQUssRUFBRSxFQUFFLEVBQUUsUUFBUSxFQUFFLENBQUMsRUFBRTtZQUNwQyxFQUFFLEtBQUssRUFBRSxDQUFDLEVBQUUsS0FBSyxFQUFFLEVBQUUsRUFBRSxRQUFRLEVBQUUsQ0FBQyxFQUFFO1lBRXBDLE9BQU87WUFDUCxFQUFFLEtBQUssRUFBRSxDQUFDLEVBQUUsS0FBSyxFQUFFLEVBQUUsRUFBRSxRQUFRLEVBQUUsR0FBRyxFQUFFO1lBQ3RDLEVBQUUsS0FBSyxFQUFFLENBQUMsRUFBRSxLQUFLLEVBQUUsSUFBSSxFQUFFLFFBQVEsRUFBRSxHQUFHLEVBQUU7WUFDeEMsRUFBRSxLQUFLLEVBQUUsQ0FBQyxFQUFFLEtBQUssRUFBRSxFQUFFLEVBQUUsUUFBUSxFQUFFLENBQUMsRUFBRTtZQUVwQyxPQUFPO1lBQ1AsRUFBRSxLQUFLLEVBQUUsQ0FBQyxFQUFFLEtBQUssRUFBRSxFQUFFLEVBQUUsUUFBUSxFQUFFLENBQUMsRUFBRTtZQUNwQyxFQUFFLEtBQUssRUFBRSxDQUFDLEVBQUUsS0FBSyxFQUFFLEVBQUUsRUFBRSxRQUFRLEVBQUUsQ0FBQyxFQUFFO1lBQ3BDLEVBQUUsS0FBSyxFQUFFLENBQUMsRUFBRSxLQUFLLEVBQUUsRUFBRSxFQUFFLFFBQVEsRUFBRSxDQUFDLEVBQUU7WUFDcEMsRUFBRSxLQUFLLEVBQUUsQ0FBQyxFQUFFLEtBQUssRUFBRSxFQUFFLEVBQUUsUUFBUSxFQUFFLENBQUMsRUFBRTtZQUVwQyxPQUFPO1lBQ1AsRUFBRSxLQUFLLEVBQUUsQ0FBQyxFQUFFLEtBQUssRUFBRSxFQUFFLEVBQUUsUUFBUSxFQUFFLENBQUMsRUFBRTtZQUNwQyxFQUFFLEtBQUssRUFBRSxDQUFDLEVBQUUsS0FBSyxFQUFFLEVBQUUsRUFBRSxRQUFRLEVBQUUsQ0FBQyxFQUFFO1lBQ3BDLEVBQUUsS0FBSyxFQUFFLENBQUMsRUFBRSxLQUFLLEVBQUUsRUFBRSxFQUFFLFFBQVEsRUFBRSxDQUFDLEVBQUU7WUFDcEMsRUFBRSxLQUFLLEVBQUUsQ0FBQyxFQUFFLEtBQUssRUFBRSxFQUFFLEVBQUUsUUFBUSxFQUFFLENBQUMsRUFBRTtZQUVwQyxPQUFPO1lBQ1AsRUFBRSxLQUFLLEVBQUUsQ0FBQyxFQUFFLEtBQUssRUFBRSxFQUFFLEVBQUUsUUFBUSxFQUFFLENBQUMsRUFBRTtZQUNwQyxFQUFFLEtBQUssRUFBRSxDQUFDLEVBQUUsS0FBSyxFQUFFLEVBQUUsRUFBRSxRQUFRLEVBQUUsQ0FBQyxFQUFFO1lBQ3BDLEVBQUUsS0FBSyxFQUFFLENBQUMsRUFBRSxLQUFLLEVBQUUsRUFBRSxFQUFFLFFBQVEsRUFBRSxDQUFDLEVBQUU7WUFDcEMsRUFBRSxLQUFLLEVBQUUsQ0FBQyxFQUFFLEtBQUssRUFBRSxFQUFFLEVBQUUsUUFBUSxFQUFFLENBQUMsRUFBRTtZQUVwQyxPQUFPO1lBQ1AsRUFBRSxLQUFLLEVBQUUsQ0FBQyxFQUFFLEtBQUssRUFBRSxFQUFFLEVBQUUsUUFBUSxFQUFFLEdBQUcsRUFBRTtZQUN0QyxFQUFFLEtBQUssRUFBRSxDQUFDLEVBQUUsS0FBSyxFQUFFLElBQUksRUFBRSxRQUFRLEVBQUUsR0FBRyxFQUFFO1lBQ3hDLEVBQUUsS0FBSyxFQUFFLENBQUMsRUFBRSxLQUFLLEVBQUUsRUFBRSxFQUFFLFFBQVEsRUFBRSxDQUFDLEVBQUU7U0FDdkMsQ0FBQztRQUVGLFdBQVcsQ0FBQyxDQUFDLENBQUMsR0FBRyxRQUFRLENBQUMsUUFBUSxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUMsQ0FBQyxLQUFLLEdBQUcsQ0FBQyxDQUFDLEdBQUcsT0FBTyxDQUFDLENBQUM7UUFDckUsV0FBVyxDQUFDLENBQUMsQ0FBQyxHQUFHLFFBQVEsQ0FBQyxRQUFRLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQyxDQUFDLEtBQUssR0FBRyxDQUFDLENBQUMsR0FBRyxPQUFP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O1dBQ0E7V0FDQSxpQkFBaUIscUJBQXFCO1dBQ3RDO1dBQ0E7V0FDQSxrQkFBa0IscUJBQXFCO1dBQ3ZDO1dBQ0E7V0FDQSxLQUFLO1dBQ0w7V0FDQTtXQUNBO1dBQ0E7V0FDQTtXQUNBO1dBQ0E7V0FDQTtXQUNBO1dBQ0E7V0FDQTtXQUNBOzs7OztXQzNCQTtXQUNBO1dBQ0E7V0FDQTtXQUNBLHlDQUF5Qyx3Q0FBd0M7V0FDakY7V0FDQTtXQUNBOzs7OztXQ1BBOzs7OztXQ0FBO1dBQ0E7V0FDQTtXQUNBLHVEQUF1RCxpQkFBaUI7V0FDeEU7V0FDQSxnREFBZ0QsYUFBYTtXQUM3RDs7Ozs7V0NOQTs7V0FFQTtXQUNBO1dBQ0E7V0FDQTtXQUNBO1dBQ0E7O1dBRUE7O1dBRUE7O1dBRUE7O1dBRUE7O1dBRUE7O1dBRUE7O1dBRUE7V0FDQTtXQUNBO1dBQ0E7V0FDQTtXQUNBO1dBQ0E7V0FDQTtXQUNBO1dBQ0E7V0FDQTtXQUNBO1dBQ0E7V0FDQTtXQUNBO1dBQ0EsTUFBTSxxQkFBcUI7V0FDM0I7V0FDQTtXQUNBO1dBQ0E7V0FDQTtXQUNBO1dBQ0E7V0FDQTs7V0FFQTtXQUNBO1dBQ0E7Ozs7O1VFaERBO1VBQ0E7VUFDQTtVQUNBO1VBQ0EiLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly9jZ3ByZW5kZXJpbmcvLi9zcmMvYXBwLnRzIiwid2VicGFjazovL2NncHJlbmRlcmluZy93ZWJwYWNrL2Jvb3RzdHJhcCIsIndlYnBhY2s6Ly9jZ3ByZW5kZXJpbmcvd2VicGFjay9ydW50aW1lL2NodW5rIGxvYWRlZCIsIndlYnBhY2s6Ly9jZ3ByZW5kZXJpbmcvd2VicGFjay9ydW50aW1lL2RlZmluZSBwcm9wZXJ0eSBnZXR0ZXJzIiwid2VicGFjazovL2NncHJlbmRlcmluZy93ZWJwYWNrL3J1bnRpbWUvaGFzT3duUHJvcGVydHkgc2hvcnRoYW5kIiwid2VicGFjazovL2NncHJlbmRlcmluZy93ZWJwYWNrL3J1bnRpbWUvbWFrZSBuYW1lc3BhY2Ugb2JqZWN0Iiwid2VicGFjazovL2NncHJlbmRlcmluZy93ZWJwYWNrL3J1bnRpbWUvanNvbnAgY2h1bmsgbG9hZGluZyIsIndlYnBhY2s6Ly9jZ3ByZW5kZXJpbmcvd2VicGFjay9iZWZvcmUtc3RhcnR1cCIsIndlYnBhY2s6Ly9jZ3ByZW5kZXJpbmcvd2VicGFjay9zdGFydHVwIiwid2VicGFjazovL2NncHJlbmRlcmluZy93ZWJwYWNrL2FmdGVyLXN0YXJ0dXAiXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0ICogYXMgVEhSRUUgZnJvbSBcInRocmVlXCI7XG5pbXBvcnQgeyBPcmJpdENvbnRyb2xzIH0gZnJvbSBcInRocmVlL2V4YW1wbGVzL2pzbS9jb250cm9scy9PcmJpdENvbnRyb2xzXCI7XG5pbXBvcnQgeyBjcmVhdGVFbWl0QW5kU2VtYW50aWNEaWFnbm9zdGljc0J1aWxkZXJQcm9ncmFtIH0gZnJvbSBcInR5cGVzY3JpcHRcIjtcblxuY2xhc3MgVGhyZWVKU0NvbnRhaW5lciB7XG4gICAgcHJpdmF0ZSBzY2VuZTogVEhSRUUuU2NlbmU7XG4gICAgcHJpdmF0ZSBwbGFuZTogVEhSRUUuTWVzaDtcbiAgICBwcml2YXRlIGdyb3VwOiBUSFJFRS5Hcm91cDtcbiAgICBwcml2YXRlIHN0YWZmOiBUSFJFRS5Hcm91cDtcbiAgICBwcml2YXRlIG5vdGVzOiBUSFJFRS5Hcm91cDtcbiAgICBwcml2YXRlIGJhbGw6IFRIUkVFLk1lc2g7XG4gICAgcHJpdmF0ZSBjYW1lcmE6IFRIUkVFLlBlcnNwZWN0aXZlQ2FtZXJhOyAvLyDjgqvjg6Hjg6njgpLnp7vli5XjgZXjgZvjgovjgZ/jgoHjgavlrprnvqlcblxuICAgIHByaXZhdGUgc3RhZmZNYXRlcmlhbCA9IG5ldyBUSFJFRS5NZXNoU3RhbmRhcmRNYXRlcmlhbCh7IGNvbG9yOiAweDAwMDAwMCB9KTtcblxuICAgIHByaXZhdGUgZ2VvbWV0cnk6IFRIUkVFLkJ1ZmZlckdlb21ldHJ5O1xuICAgIHByaXZhdGUgbWF0ZXJpYWw6IFRIUkVFLk1hdGVyaWFsO1xuICAgIHByaXZhdGUgbGlnaHQ6IFRIUkVFLlBvaW50TGlnaHQ7XG4gICAgcHJpdmF0ZSBhdWRpb0NvbnRleHQ6IEF1ZGlvQ29udGV4dDtcbiAgICBwcml2YXRlIG9zY2lsbGF0b3I6IE9zY2lsbGF0b3JOb2RlIHwgbnVsbCA9IG51bGw7XG5cbiAgICBjb25zdHJ1Y3RvcigpIHtcbiAgICAgICAgdGhpcy5zdGFmZiA9IG5ldyBUSFJFRS5Hcm91cCgpO1xuICAgICAgICB0aGlzLm5vdGVzID0gbmV3IFRIUkVFLkdyb3VwKCk7XG4gICAgICAgIHRoaXMubGlnaHQgPSBuZXcgVEhSRUUuUG9pbnRMaWdodCgweDAwZmZmZiwgMS4wLCAxNTApOyAvLyDot53pm6IxMDDjgb7jgaflhYnjgYzlsYrjgY9cblxuICAgICAgICAvLyDjgqrjg7zjg4fjgqPjgqrjgrPjg7Pjg4bjgq3jgrnjg4jjga7liJ3mnJ/ljJZcbiAgICAgICAgdGhpcy5hdWRpb0NvbnRleHQgPSBuZXcgKHdpbmRvdy5BdWRpb0NvbnRleHQgfHwgKHdpbmRvdyBhcyBhbnkpLndlYmtpdEF1ZGlvQ29udGV4dCkoKTtcbiAgICB9XG5cbiAgICAvLyDnlLvpnaLpg6jliIbjga7kvZzmiJAo6KGo56S644GZ44KL5p6g44GU44Go44GrKSpcbiAgICBwdWJsaWMgY3JlYXRlUmVuZGVyZXJET00gPSAod2lkdGg6IG51bWJlciwgaGVpZ2h0OiBudW1iZXIsIGNhbWVyYVBvczogVEhSRUUuVmVjdG9yMykgPT4ge1xuICAgICAgICBsZXQgcmVuZGVyZXIgPSBuZXcgVEhSRUUuV2ViR0xSZW5kZXJlcih7IGFudGlhbGlhczogdHJ1ZSB9KTtcbiAgICAgICAgcmVuZGVyZXIuc2V0U2l6ZSh3aWR0aCwgaGVpZ2h0KTtcbiAgICAgICAgcmVuZGVyZXIuc2V0Q2xlYXJDb2xvcihuZXcgVEhSRUUuQ29sb3IoMHgwMGVlZmYpKTsgIC8vIOiDjOaZr+iJslxuICAgICAgICByZW5kZXJlci5zaGFkb3dNYXAuZW5hYmxlZCA9IHRydWU7ICAvLyDjgrfjg6Pjg4njgqbjga7oqK3lrppcbiAgICAgICAgcmVuZGVyZXIuc2hhZG93TWFwLnR5cGUgPSBUSFJFRS5QQ0ZTb2Z0U2hhZG93TWFwO1xuXG4gICAgICAgIC8v44Kr44Oh44Op44Gu6Kit5a6aXG4gICAgICAgIHRoaXMuY2FtZXJhID0gbmV3IFRIUkVFLlBlcnNwZWN0aXZlQ2FtZXJhKDc1LCB3aWR0aCAvIGhlaWdodCwgMC4xLCAxMDAwKTtcbiAgICAgICAgdGhpcy5jYW1lcmEucG9zaXRpb24uY29weShjYW1lcmFQb3MpO1xuICAgICAgICB0aGlzLmNhbWVyYS5sb29rQXQobmV3IFRIUkVFLlZlY3RvcjMoMCwgMCwgMCkpO1xuXG4gICAgICAgIGxldCBvcmJpdENvbnRyb2xzID0gbmV3IE9yYml0Q29udHJvbHModGhpcy5jYW1lcmEsIHJlbmRlcmVyLmRvbUVsZW1lbnQpO1xuXG4gICAgICAgIHRoaXMuY3JlYXRlU2NlbmUoKTtcbiAgICAgICAgLy8g5q+O44OV44Os44O844Og44GudXBkYXRl44KS5ZG844KT44Gn77yMcmVuZGVyXG4gICAgICAgIC8vIHJlcWVzdEFuaW1hdGlvbkZyYW1lIOOBq+OCiOOCiuasoeODleODrOODvOODoOOCkuWRvOOBtlxuICAgICAgICBsZXQgcmVuZGVyOiBGcmFtZVJlcXVlc3RDYWxsYmFjayA9ICh0aW1lKSA9PiB7XG4gICAgICAgICAgICAvLyBvcmJpdENvbnRyb2xzLnVwZGF0ZSgpO1xuICAgICAgICAgICAgcmVuZGVyZXIucmVuZGVyKHRoaXMuc2NlbmUsIHRoaXMuY2FtZXJhKTtcbiAgICAgICAgICAgIHJlcXVlc3RBbmltYXRpb25GcmFtZShyZW5kZXIpO1xuICAgICAgICB9XG4gICAgICAgIHJlcXVlc3RBbmltYXRpb25GcmFtZShyZW5kZXIpO1xuXG4gICAgICAgIHJlbmRlcmVyLmRvbUVsZW1lbnQuc3R5bGUuY3NzRmxvYXQgPSBcImxlZnRcIjtcbiAgICAgICAgcmVuZGVyZXIuZG9tRWxlbWVudC5zdHlsZS5tYXJnaW4gPSBcIjEwcHhcIjtcbiAgICAgICAgcmV0dXJuIHJlbmRlcmVyLmRvbUVsZW1lbnQ7XG4gICAgfVxuXG4gICAgLy8g44K344O844Oz44Gu5L2c5oiQKOWFqOS9k+OBpzHlm54pXG4gICAgcHJpdmF0ZSBjcmVhdGVTY2VuZSA9ICgpID0+IHtcbiAgICAgICAgdGhpcy5zY2VuZSA9IG5ldyBUSFJFRS5TY2VuZSgpO1xuXG4gICAgICAgIGNvbnN0IHNwYWNpbmcgPSAyNDtcblxuICAgICAgICAvKipcbiAgICAgICAgICog6Z+z56ym44KS6YWN572uXG4gICAgICAgICAqIEBwYXJhbSBwaXRjaFxuICAgICAgICAgKi9cbiAgICAgICAgY29uc3QgY3JlYXRlTm90ZSA9IChwaXRjaDogbnVtYmVyLCBjb3VudDogbnVtYmVyKSA9PiB7XG4gICAgICAgICAgICBjb25zdCBub3RlWCA9ICgyICogY291bnQgKyAxKSAqIHNwYWNpbmc7XG5cbiAgICAgICAgICAgIC8vIOW5hTEw44O76auY44GVMeOBruWGhuafsVxuICAgICAgICAgICAgY29uc3QgZ2VvbWV0cnkgPSBuZXcgVEhSRUUuQ3lsaW5kZXJHZW9tZXRyeSgxMiwgMTIsIDIsIDY0KTtcbiAgICAgICAgICAgIGNvbnN0IG1hdGVyaWFsID0gbmV3IFRIUkVFLk1lc2hTdGFuZGFyZE1hdGVyaWFsKHtcbiAgICAgICAgICAgICAgICBjb2xvcjogMHgzMzMzMzMsXG4gICAgICAgICAgICAgICAgbWV0YWxuZXNzOiAwLjgsXG4gICAgICAgICAgICAgICAgcm91Z2huZXNzOiAwLjIsXG4gICAgICAgICAgICAgICAgZW1pc3NpdmU6IDB4MDAwMDAwLFxuICAgICAgICAgICAgICAgIGVtaXNzaXZlSW50ZW5zaXR5OiAwLjBcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgY29uc3Qgbm90ZSA9IG5ldyBUSFJFRS5NZXNoKGdlb21ldHJ5LCBtYXRlcmlhbCk7XG4gICAgICAgICAgICBub3RlLnBvc2l0aW9uLnNldChub3RlWCwgLTQsIHBpdGNoICogLXNwYWNpbmcgLyAyICsgc3BhY2luZyAqIDMpOyAgICAvLyAwIC0+IEMzLCA3LT5DNFxuICAgICAgICAgICAgbm90ZS5yZWNlaXZlU2hhZG93ID0gdHJ1ZTtcbiAgICAgICAgICAgIG5vdGUuY2FzdFNoYWRvdyA9IHRydWU7XG4gICAgICAgICAgICB0aGlzLm5vdGVzLmFkZChub3RlKTtcblxuICAgICAgICAgICAgLy8gNiAtPiBCM+S7peS4iuOBr+S4i+OBq+e3muOCkuS8uOOBsOOBl+OAgeOBneOCjOacqua6gOOBr+e3muOCkuS4iuOBq+S8uOOBsOOBmVxuICAgICAgICAgICAgY29uc3Qgbm90ZUJhckdlb21ldHJ5ID0gbmV3IFRIUkVFLkJveEdlb21ldHJ5KDMsIDEsIHNwYWNpbmcgKiAzLjUpO1xuICAgICAgICAgICAgY29uc3Qgbm90ZUJhciA9IG5ldyBUSFJFRS5NZXNoKG5vdGVCYXJHZW9tZXRyeSwgdGhpcy5zdGFmZk1hdGVyaWFsKTtcbiAgICAgICAgICAgIG5vdGVCYXIucG9zaXRpb24uc2V0KG5vdGVYICsgKHBpdGNoID49IDYgPyAtMTAuNSA6IDEwLjUpLCAtNCwgcGl0Y2ggKiAtc3BhY2luZyAvIDIgKyBzcGFjaW5nICogMyArIChwaXRjaCA+PSA2ID8gNDEgOiAtNDEpKTtcbiAgICAgICAgICAgIG5vdGVCYXIucmVjZWl2ZVNoYWRvdyA9IHRydWU7XG4gICAgICAgICAgICBub3RlQmFyLmNhc3RTaGFkb3cgPSB0cnVlO1xuICAgICAgICAgICAgdGhpcy5zY2VuZS5hZGQobm90ZUJhcik7XG5cbiAgICAgICAgICAgIC8vIEMz5Lul5LiL44Gu6auY44GV44Gr44Gv6KOc5Yqp57ea44KS6L+95YqgXG4gICAgICAgICAgICBjb25zdCBiYXJIZWlnaHQgPSAxO1xuICAgICAgICAgICAgY29uc3QgYmFyRGVwdGggPSAzO1xuICAgICAgICAgICAgY29uc3Qgc3RhZmZHZW9tZXRyeSA9IG5ldyBUSFJFRS5Cb3hHZW9tZXRyeShzcGFjaW5nICogMS41LCBiYXJIZWlnaHQsIGJhckRlcHRoKTtcbiAgICAgICAgICAgIGlmIChwaXRjaCA8PSAwKSB7XG4gICAgICAgICAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBNYXRoLmZsb29yKE1hdGguYWJzKHBpdGNoKSAvIDIpICsgMTsgaSsrKSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGJhciA9IG5ldyBUSFJFRS5NZXNoKHN0YWZmR2VvbWV0cnksIHRoaXMuc3RhZmZNYXRlcmlhbCk7XG4gICAgICAgICAgICAgICAgICAgIGJhci5wb3NpdGlvbi5zZXQobm90ZVgsIC00LCBzcGFjaW5nICogMyArIGkgKiBzcGFjaW5nKTtcbiAgICAgICAgICAgICAgICAgICAgYmFyLmNhc3RTaGFkb3cgPSB0cnVlO1xuICAgICAgICAgICAgICAgICAgICBiYXIucmVjZWl2ZVNoYWRvdyA9IHRydWU7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuc2NlbmUuYWRkKGJhcik7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKHBpdGNoID49IDEyKSB7XG4gICAgICAgICAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBNYXRoLmZsb29yKE1hdGguYWJzKHBpdGNoKSAvIDIpIC0gNTsgaSsrKSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGJhciA9IG5ldyBUSFJFRS5NZXNoKHN0YWZmR2VvbWV0cnksIHRoaXMuc3RhZmZNYXRlcmlhbCk7XG4gICAgICAgICAgICAgICAgICAgIGJhci5wb3NpdGlvbi5zZXQobm90ZVgsIC00LCAtIHNwYWNpbmcgKiAzIC0gaSAqIHNwYWNpbmcpO1xuICAgICAgICAgICAgICAgICAgICBiYXIuY2FzdFNoYWRvdyA9IHRydWU7XG4gICAgICAgICAgICAgICAgICAgIGJhci5yZWNlaXZlU2hhZG93ID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5zY2VuZS5hZGQoYmFyKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICAvLyDkupTnt5rorZzjgpLphY3nva5cbiAgICAgICAgY29uc3QgY3JlYXRlU3RhZmYgPSAobGVuZ3RoOiBudW1iZXIpID0+IHtcbiAgICAgICAgICAgIGNvbnN0IGJhckxlbmd0aCA9IGxlbmd0aCArIDQwMDtcbiAgICAgICAgICAgIGNvbnN0IGJhckhlaWdodCA9IDE7XG4gICAgICAgICAgICBjb25zdCBiYXJEZXB0aCA9IDM7XG4gICAgICAgICAgICBjb25zdCBiYXNlWSA9IC00O1xuICAgICAgICAgICAgY29uc3QgYmFzZVogPSAwO1xuXG4gICAgICAgICAgICBjb25zdCBzdGFmZkdlb21ldHJ5ID0gbmV3IFRIUkVFLkJveEdlb21ldHJ5KGJhckxlbmd0aCwgYmFySGVpZ2h0LCBiYXJEZXB0aCk7XG4gICAgICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IDU7IGkrKykge1xuICAgICAgICAgICAgICAgIGNvbnN0IGJhciA9IG5ldyBUSFJFRS5NZXNoKHN0YWZmR2VvbWV0cnksIHRoaXMuc3RhZmZNYXRlcmlhbCk7XG4gICAgICAgICAgICAgICAgYmFyLnBvc2l0aW9uLnNldChsZW5ndGggLyAyLCBiYXNlWSwgYmFzZVogKyAoMiAtIGkpICogc3BhY2luZyk7XG4gICAgICAgICAgICAgICAgYmFyLmNhc3RTaGFkb3cgPSB0cnVlO1xuICAgICAgICAgICAgICAgIGJhci5yZWNlaXZlU2hhZG93ID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICB0aGlzLnN0YWZmLmFkZChiYXIpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBjb25zdCBiYXJMaW5lR2VvbWV0cnkgPSBuZXcgVEhSRUUuQm94R2VvbWV0cnkoYmFyRGVwdGgsIGJhckhlaWdodCwgc3BhY2luZyAqIDQgKyAzKTtcbiAgICAgICAgICAgIGxldCBiYXJMaW5lWCA9IHNwYWNpbmcgKiAyICogODsgICAvLyDlsI/nr4DjgpLljLrliIfjgovnt5pcbiAgICAgICAgICAgIHdoaWxlIChiYXJMaW5lWCA8IGxlbmd0aCkge1xuICAgICAgICAgICAgICAgIGNvbnN0IGJhciA9IG5ldyBUSFJFRS5NZXNoKGJhckxpbmVHZW9tZXRyeSwgdGhpcy5zdGFmZk1hdGVyaWFsKTtcbiAgICAgICAgICAgICAgICBiYXIucG9zaXRpb24uc2V0KGJhckxpbmVYLCBiYXNlWSwgYmFzZVopO1xuICAgICAgICAgICAgICAgIGJhci5jYXN0U2hhZG93ID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICBiYXIucmVjZWl2ZVNoYWRvdyA9IHRydWU7XG4gICAgICAgICAgICAgICAgYmFyTGluZVggKz0gc3BhY2luZyAqIDIgKiA4O1xuICAgICAgICAgICAgICAgIHRoaXMuc3RhZmYuYWRkKGJhcik7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHRoaXMuc2NlbmUuYWRkKHRoaXMuc3RhZmYpO1xuICAgICAgICB9O1xuXG4gICAgICAgIGNvbnN0IGNyZWF0ZVBsYW5lID0gKGxlbmd0aDogbnVtYmVyKSA9PiB7XG4gICAgICAgICAgICAvLyDlubPpnaLjga7nlJ/miJBcbiAgICAgICAgICAgIGxldCBwbGFuZUdlb21ldHJ5ID0gbmV3IFRIUkVFLlBsYW5lR2VvbWV0cnkobGVuZ3RoICsgNDAwLCA0MDApO1xuICAgICAgICAgICAgbGV0IHBsYW5lTWF0ZXJpYWwgPSBuZXcgVEhSRUUuTWVzaFN0YW5kYXJkTWF0ZXJpYWwoeyBjb2xvcjogMHhmZmZmZmYsIG1ldGFsbmVzczogMC4zLCByb3VnaG5lc3M6IDAuOSB9KTtcbiAgICAgICAgICAgIHRoaXMucGxhbmUgPSBuZXcgVEhSRUUuTWVzaChwbGFuZUdlb21ldHJ5LCBwbGFuZU1hdGVyaWFsKTtcbiAgICAgICAgICAgIHRoaXMucGxhbmUucmVjZWl2ZVNoYWRvdyA9IHRydWU7IC8v5b2x44KS5Y+X44GR44KL44KI44GG44Gr44GZ44KLXG4gICAgICAgICAgICB0aGlzLnBsYW5lLnBvc2l0aW9uLnggPSBsZW5ndGggLyAyO1xuICAgICAgICAgICAgdGhpcy5wbGFuZS5wb3NpdGlvbi55ID0gLTU7XG4gICAgICAgICAgICB0aGlzLnBsYW5lLnJvdGF0aW9uLnggPSAtTWF0aC5QSSAvIDI7XG4gICAgICAgICAgICB0aGlzLnNjZW5lLmFkZCh0aGlzLnBsYW5lKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0IGNyZWF0ZUJhbGwgPSAoKSA9PiB7XG4gICAgICAgICAgICBjb25zdCBiYWxsR2VvbWV0cnkgPSBuZXcgVEhSRUUuU3BoZXJlR2VvbWV0cnkoNiwgMzIsIDMyKTtcbiAgICAgICAgICAgIGNvbnN0IGJhbGxNYXRlcmlhbCA9IG5ldyBUSFJFRS5NZXNoU3RhbmRhcmRNYXRlcmlhbCh7IGNvbG9yOiAweDAwZmZmZiB9KTtcbiAgICAgICAgICAgIHRoaXMuYmFsbCA9IG5ldyBUSFJFRS5NZXNoKGJhbGxHZW9tZXRyeSwgYmFsbE1hdGVyaWFsKTtcbiAgICAgICAgICAgIHRoaXMuYmFsbC5jYXN0U2hhZG93ID0gdHJ1ZTtcbiAgICAgICAgICAgIHRoaXMuYmFsbC5wb3NpdGlvbi5zZXQoMCwgMCwgMCk7XG4gICAgICAgICAgICB0aGlzLnNjZW5lLmFkZCh0aGlzLmJhbGwpO1xuICAgICAgICB9XG5cblxuICAgICAgICB0aGlzLmxpZ2h0LnBvc2l0aW9uLnNldCg1LCA1MCwgNSk7XG4gICAgICAgIHRoaXMubGlnaHQuY2FzdFNoYWRvdyA9IHRydWU7XG4gICAgICAgIHRoaXMuc2NlbmUuYWRkKHRoaXMubGlnaHQpO1xuXG4gICAgICAgIGNvbnN0IGhlcm1pdGUgPSAocDA6IFRIUkVFLlZlY3RvcjMsIHYwOiBUSFJFRS5WZWN0b3IzLCBwMTogVEhSRUUuVmVjdG9yMywgdjE6IFRIUkVFLlZlY3RvcjMsIHQ6IG51bWJlcik6IChUSFJFRS5WZWN0b3IzKSA9PiB7XG4gICAgICAgICAgICAvL+OCqOODq+ODn+ODvOODiOabsue3muOCkuWun+ijheOBmeOCi1xuICAgICAgICAgICAgY29uc3QgcmVzdWx0ID0gcDAubXVsdGlwbHlTY2FsYXIoKDIgKiB0ICsgMSkgKiAoMSAtIHQpICoqIDIpXG4gICAgICAgICAgICAgICAgLmFkZCh2MC5tdWx0aXBseVNjYWxhcih0ICogKDEgLSB0KSAqKiAyKSlcbiAgICAgICAgICAgICAgICAuYWRkKHAxLm11bHRpcGx5U2NhbGFyKHQgKiogMiAqICgzIC0gMiAqIHQpKSlcbiAgICAgICAgICAgICAgICAuYWRkKHYxLm11bHRpcGx5U2NhbGFyKC0xICogdCAqKiAyICogKDEgLSB0KSkpO1xuICAgICAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIOOBk+OBk+OBp+OCqOODq+ODn+ODvOODiOabsue3muOCkuS9nOOCi+OAglxuICAgICAgICBjb25zdCBub3RlRGF0YSA9IFtcbiAgICAgICAgICAgIC8vIOWwj+evgCAxXG4gICAgICAgICAgICB7IHBpdGNoOiA0LCBzdGFydDogMCwgZHVyYXRpb246IDEgfSxcbiAgICAgICAgICAgIHsgcGl0Y2g6IDQsIHN0YXJ0OiAxLCBkdXJhdGlvbjogMSB9LFxuICAgICAgICAgICAgeyBwaXRjaDogNSwgc3RhcnQ6IDIsIGR1cmF0aW9uOiAxIH0sXG4gICAgICAgICAgICB7IHBpdGNoOiA3LCBzdGFydDogMywgZHVyYXRpb246IDEgfSxcblxuICAgICAgICAgICAgLy8g5bCP56+AIDJcbiAgICAgICAgICAgIHsgcGl0Y2g6IDcsIHN0YXJ0OiA0LCBkdXJhdGlvbjogMSB9LFxuICAgICAgICAgICAgeyBwaXRjaDogNSwgc3RhcnQ6IDUsIGR1cmF0aW9uOiAxIH0sXG4gICAgICAgICAgICB7IHBpdGNoOiA0LCBzdGFydDogNiwgZHVyYXRpb246IDEgfSxcbiAgICAgICAgICAgIHsgcGl0Y2g6IDIsIHN0YXJ0OiA3LCBkdXJhdGlvbjogMSB9LFxuXG4gICAgICAgICAgICAvLyDlsI/nr4AgM1xuICAgICAgICAgICAgeyBwaXRjaDogMCwgc3RhcnQ6IDgsIGR1cmF0aW9uOiAxIH0sXG4gICAgICAgICAgICB7IHBpdGNoOiAwLCBzdGFydDogOSwgZHVyYXRpb246IDEgfSxcbiAgICAgICAgICAgIHsgcGl0Y2g6IDIsIHN0YXJ0OiAxMCwgZHVyYXRpb246IDEgfSxcbiAgICAgICAgICAgIHsgcGl0Y2g6IDQsIHN0YXJ0OiAxMSwgZHVyYXRpb246IDEgfSxcblxuICAgICAgICAgICAgLy8g5bCP56+AIDRcbiAgICAgICAgICAgIHsgcGl0Y2g6IDQsIHN0YXJ0OiAxMiwgZHVyYXRpb246IDEuNSB9LFxuICAgICAgICAgICAgeyBwaXRjaDogMiwgc3RhcnQ6IDEzLjUsIGR1cmF0aW9uOiAwLjUgfSxcbiAgICAgICAgICAgIHsgcGl0Y2g6IDIsIHN0YXJ0OiAxNCwgZHVyYXRpb246IDIgfSxcblxuICAgICAgICAgICAgLy8g5bCP56+AIDVcbiAgICAgICAgICAgIHsgcGl0Y2g6IDQsIHN0YXJ0OiAxNiwgZHVyYXRpb246IDEgfSxcbiAgICAgICAgICAgIHsgcGl0Y2g6IDQsIHN0YXJ0OiAxNywgZHVyYXRpb246IDEgfSxcbiAgICAgICAgICAgIHsgcGl0Y2g6IDUsIHN0YXJ0OiAxOCwgZHVyYXRpb246IDEgfSxcbiAgICAgICAgICAgIHsgcGl0Y2g6IDcsIHN0YXJ0OiAxOSwgZHVyYXRpb246IDEgfSxcblxuICAgICAgICAgICAgLy8g5bCP56+AIDZcbiAgICAgICAgICAgIHsgcGl0Y2g6IDcsIHN0YXJ0OiAyMCwgZHVyYXRpb246IDEgfSxcbiAgICAgICAgICAgIHsgcGl0Y2g6IDUsIHN0YXJ0OiAyMSwgZHVyYXRpb246IDEgfSxcbiAgICAgICAgICAgIHsgcGl0Y2g6IDQsIHN0YXJ0OiAyMiwgZHVyYXRpb246IDEgfSxcbiAgICAgICAgICAgIHsgcGl0Y2g6IDIsIHN0YXJ0OiAyMywgZHVyYXRpb246IDEgfSxcblxuICAgICAgICAgICAgLy8g5bCP56+AIDdcbiAgICAgICAgICAgIHsgcGl0Y2g6IDAsIHN0YXJ0OiAyNCwgZHVyYXRpb246IDEgfSxcbiAgICAgICAgICAgIHsgcGl0Y2g6IDAsIHN0YXJ0OiAyNSwgZHVyYXRpb246IDEgfSxcbiAgICAgICAgICAgIHsgcGl0Y2g6IDIsIHN0YXJ0OiAyNiwgZHVyYXRpb246IDEgfSxcbiAgICAgICAgICAgIHsgcGl0Y2g6IDQsIHN0YXJ0OiAyNywgZHVyYXRpb246IDEgfSxcblxuICAgICAgICAgICAgLy8g5bCP56+AIDhcbiAgICAgICAgICAgIHsgcGl0Y2g6IDIsIHN0YXJ0OiAyOCwgZHVyYXRpb246IDEuNSB9LFxuICAgICAgICAgICAgeyBwaXRjaDogMCwgc3RhcnQ6IDI5LjUsIGR1cmF0aW9uOiAwLjUgfSxcbiAgICAgICAgICAgIHsgcGl0Y2g6IDAsIHN0YXJ0OiAzMCwgZHVyYXRpb246IDIgfVxuICAgICAgICBdO1xuXG4gICAgICAgIGNyZWF0ZVN0YWZmKCgyICogbm90ZURhdGFbbm90ZURhdGEubGVuZ3RoIC0gMV0uc3RhcnQgKyAxKSAqIHNwYWNpbmcpO1xuICAgICAgICBjcmVhdGVQbGFuZSgoMiAqIG5vdGVEYXRhW25vdGVEYXRhLmxlbmd0aCAtIDFdLnN0YXJ0ICsgMSkgKiBzcGFjaW5nKTtcbiAgICAgICAgY3JlYXRlQmFsbCgpO1xuICAgICAgICAvLyBKU09O44GL44KJ6Z+z56ym44KS6L+95YqgIGZvciDpn7PnrKbphY3nva5cbiAgICAgICAgbm90ZURhdGEuZm9yRWFjaChub3RlID0+IHtcbiAgICAgICAgICAgIGNyZWF0ZU5vdGUobm90ZS5waXRjaCwgbm90ZS5zdGFydCk7XG4gICAgICAgIH0pO1xuICAgICAgICB0aGlzLnNjZW5lLmFkZCh0aGlzLm5vdGVzKTtcblxuICAgICAgICAvLyDpn7PnrKbjga5YLFrluqfmqJnjg6rjgrnjg4jjgpLkvZzmiJDvvIhjcmVhdGVOb3Rl44Go5ZCM44GY5bqn5qiZ6KiI566X44KS5L2/55So77yJXG4gICAgICAgIGNvbnN0IG5vdGVQb3NpdGlvbnMgPSBub3RlRGF0YS5tYXAobm90ZSA9PiB7XG4gICAgICAgICAgICBjb25zdCB4ID0gKDIgKiBub3RlLnN0YXJ0ICsgMSkgKiBzcGFjaW5nOyAvLyBjcmVhdGVOb3Rl44Go5ZCM44GY6KiI566XXG4gICAgICAgICAgICBjb25zdCB6ID0gbm90ZS5waXRjaCAqIC1zcGFjaW5nIC8gMiArIHNwYWNpbmcgKiAzO1xuICAgICAgICAgICAgcmV0dXJuIG5ldyBUSFJFRS5WZWN0b3IzKHgsIDUsIHopO1xuICAgICAgICB9KTtcblxuICAgICAgICAvLyDjg5zjg7zjg6vjga7jgqLjg4vjg6Hjg7zjgrfjg6fjg7PnlKjlpInmlbBcbiAgICAgICAgbGV0IGN1cnJlbnROb3RlSW5kZXggPSAwO1xuICAgICAgICBsZXQgYW5pbWF0aW9uU3RhcnRUaW1lID0gMDtcbiAgICAgICAgbGV0IGlzQW5pbWF0aW5nID0gZmFsc2U7XG4gICAgICAgIGxldCBzdGFydFBvcyA9IG5ldyBUSFJFRS5WZWN0b3IzKDAsIDUsIHNwYWNpbmcgKiAzKTsgLy8g6ZaL5aeL5L2N572uXG5cbiAgICAgICAgZnVuY3Rpb24gaGVybWl0ZTNEKFxuICAgICAgICAgICAgcDA6IFRIUkVFLlZlY3RvcjMsXG4gICAgICAgICAgICBwMTogVEhSRUUuVmVjdG9yMyxcbiAgICAgICAgICAgIGR1cmF0aW9uOiBudW1iZXIsXG4gICAgICAgICAgICBlbGFwc2VkOiBudW1iZXIsXG4gICAgICAgICAgICB2MDogVEhSRUUuVmVjdG9yMyA9IG5ldyBUSFJFRS5WZWN0b3IzKDAsIDEwMCwgMCksXG4gICAgICAgICAgICB2MTogVEhSRUUuVmVjdG9yMyA9IG5ldyBUSFJFRS5WZWN0b3IzKDAsIDEwMCwgMClcbiAgICAgICAgKTogVEhSRUUuVmVjdG9yMyB7XG4gICAgICAgICAgICBjb25zdCB0ID0gTWF0aC5taW4oZWxhcHNlZCAvIGR1cmF0aW9uLCAxKTsgLy8g5pmC6ZaT44Gr5a++44GX44Gm5q2j6KaP5YyW44GV44KM44GfdFxuXG4gICAgICAgICAgICBjb25zdCBoMDAgPSAyICogdCAqKiAzIC0gMyAqIHQgKiogMiArIDE7XG4gICAgICAgICAgICBjb25zdCBoMTAgPSB0ICoqIDMgLSAyICogdCAqKiAyICsgdDtcbiAgICAgICAgICAgIGNvbnN0IGgwMSA9IC0yICogdCAqKiAzICsgMyAqIHQgKiogMjtcbiAgICAgICAgICAgIGNvbnN0IGgxMSA9IHQgKiogMyAtIHQgKiogMjtcblxuICAgICAgICAgICAgLy8g44Ko44Or44Of44O844OI6KOc6ZaT6KiI566XXG4gICAgICAgICAgICBjb25zdCByZXN1bHQgPSBuZXcgVEhSRUUuVmVjdG9yMygpO1xuICAgICAgICAgICAgcmVzdWx0LmFkZFNjYWxlZFZlY3RvcihwMCwgaDAwKTtcbiAgICAgICAgICAgIHJlc3VsdC5hZGRTY2FsZWRWZWN0b3IodjAsIGgxMCk7XG4gICAgICAgICAgICByZXN1bHQuYWRkU2NhbGVkVmVjdG9yKHAxLCBoMDEpO1xuICAgICAgICAgICAgcmVzdWx0LmFkZFNjYWxlZFZlY3Rvcih2MSwgaDExKTtcbiAgICAgICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgICAgIH1cblxuICAgICAgICAvL+ODqeOCpOODiOOBruioreWumlxuICAgICAgICBjb25zdCBsaWdodCA9IG5ldyBUSFJFRS5EaXJlY3Rpb25hbExpZ2h0KDB4ZmZmZmZmLCAwLjYpO1xuICAgICAgICBjb25zdCBsdmVjID0gbmV3IFRIUkVFLlZlY3RvcjMoMSwgMSwgLTEpLm5vcm1hbGl6ZSgpO1xuICAgICAgICBsaWdodC5wb3NpdGlvbi5zZXQobHZlYy54LCBsdmVjLnksIGx2ZWMueik7XG4gICAgICAgIHRoaXMuc2NlbmUuYWRkKGxpZ2h0KTtcblxuICAgICAgICAvLyBjb25zb2xlLmxvZyh0aGlzLm5vdGVzKTtcbiAgICAgICAgbGV0IHVwZGF0ZTogRnJhbWVSZXF1ZXN0Q2FsbGJhY2sgPSAodGltZSkgPT4ge1xuICAgICAgICAgICAgLy8g44Oc44O844Or44Gu44Ki44OL44Oh44O844K344On44OzXG4gICAgICAgICAgICBpZiAoY3VycmVudE5vdGVJbmRleCA8IG5vdGVQb3NpdGlvbnMubGVuZ3RoKSB7XG4gICAgICAgICAgICAgICAgaWYgKCFpc0FuaW1hdGluZykge1xuICAgICAgICAgICAgICAgICAgICAvLyDjgqLjg4vjg6Hjg7zjgrfjg6fjg7Pplovlp4tcbiAgICAgICAgICAgICAgICAgICAgaXNBbmltYXRpbmcgPSB0cnVlO1xuICAgICAgICAgICAgICAgICAgICBhbmltYXRpb25TdGFydFRpbWUgPSB0aW1lO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIGNvbnN0IGN1cnJlbnROb3RlID0gbm90ZURhdGFbY3VycmVudE5vdGVJbmRleF07XG4gICAgICAgICAgICAgICAgY29uc3QgcHJldk5vdGUgPSBjdXJyZW50Tm90ZUluZGV4ID4gMCA/IG5vdGVEYXRhW2N1cnJlbnROb3RlSW5kZXggLSAxXSA6IG51bGw7XG5cbiAgICAgICAgICAgICAgICAvLyDliY3jga7pn7PnrKbjga5kdXJhdGlvbuOCkuS9v+eUqOOBl+OBpuenu+WLleaZgumWk+OCkuioiOeul1xuICAgICAgICAgICAgICAgIGxldCBkdXJhdGlvbjtcbiAgICAgICAgICAgICAgICBpZiAocHJldk5vdGUpIHtcbiAgICAgICAgICAgICAgICAgICAgZHVyYXRpb24gPSBwcmV2Tm90ZS5kdXJhdGlvbiAqIDEwMDA7IC8vIOWJjeOBrumfs+espuOBrmR1cmF0aW9u44KS5L2/55SoXG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgZHVyYXRpb24gPSAxMDAwOyAvLyDmnIDliJ3jga7pn7PnrKbjga8x56eS44Gn56e75YuVXG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgY29uc3QgZWxhcHNlZCA9IHRpbWUgLSBhbmltYXRpb25TdGFydFRpbWU7XG4gICAgICAgICAgICAgICAgY29uc3QgcHJvZ3Jlc3MgPSBNYXRoLm1pbihlbGFwc2VkIC8gZHVyYXRpb24gKiAyLCAxKTtcblxuICAgICAgICAgICAgICAgIGlmIChwcm9ncmVzcyA8IDEpIHtcbiAgICAgICAgICAgICAgICAgICAgLy8g54++5Zyo44Gu44OO44O844OI44GL44KJ5qyh44Gu44OO44O844OI44G45byn44KS5o+P44GE44Gm6aOb44G244Ki44OL44Oh44O844K344On44OzXG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGN1cnJlbnRQb3MgPSBjdXJyZW50Tm90ZUluZGV4ID09PSAwID8gc3RhcnRQb3MgOiBub3RlUG9zaXRpb25zW2N1cnJlbnROb3RlSW5kZXggLSAxXTtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgdGFyZ2V0UG9zID0gbm90ZVBvc2l0aW9uc1tjdXJyZW50Tm90ZUluZGV4XTtcblxuICAgICAgICAgICAgICAgICAgICAvLyBkdXJhdGlvbuOBq+WfuuOBpeOBhOOBpuW8p+OBrumrmOOBleOCkuioiOeul1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBiYXNlSGVpZ2h0ID0gMjA7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGR1cmF0aW9uTXVsdGlwbGllciA9IHByZXZOb3RlID8gcHJldk5vdGUuZHVyYXRpb24gOiAxO1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBqdW1wSGVpZ2h0ID0gYmFzZUhlaWdodCAqIGR1cmF0aW9uTXVsdGlwbGllcjtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QganVtcFByb2dyZXNzID0gTWF0aC5zaW4ocHJvZ3Jlc3MgKiBNYXRoLlBJKTsgLy8gMeWbnuOBruW8p1xuXG4gICAgICAgICAgICAgICAgICAgIC8vIOe3muW9ouijnOmWk+OBp+S9jee9ruOCkuioiOeul1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmJhbGwucG9zaXRpb24ueCA9IGN1cnJlbnRQb3MueCArICh0YXJnZXRQb3MueCAtIGN1cnJlbnRQb3MueCkgKiBwcm9ncmVzcztcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5iYWxsLnBvc2l0aW9uLnkgPSBjdXJyZW50UG9zLnkgKyBqdW1wSGVpZ2h0ICoganVtcFByb2dyZXNzO1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmJhbGwucG9zaXRpb24ueiA9IGN1cnJlbnRQb3MueiArICh0YXJnZXRQb3MueiAtIGN1cnJlbnRQb3MueikgKiBwcm9ncmVzcztcblxuICAgICAgICAgICAgICAgICAgICAvLyDjg6njgqTjg4jjgpLjg5zjg7zjg6vjgavov73lvpPjgZXjgZvjgotcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5saWdodC5wb3NpdGlvbi54ID0gdGhpcy5iYWxsLnBvc2l0aW9uLng7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMubGlnaHQucG9zaXRpb24ueSA9IHRoaXMuYmFsbC5wb3NpdGlvbi55ICsgMjA7IC8vIOODnOODvOODq+OBruWwkeOBl+S4iuOBq+mFjee9rlxuICAgICAgICAgICAgICAgICAgICB0aGlzLmxpZ2h0LnBvc2l0aW9uLnogPSB0aGlzLmJhbGwucG9zaXRpb24uejtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAvLyDnj77lnKjjga7jg47jg7zjg4jjga7jgqLjg4vjg6Hjg7zjgrfjg6fjg7PlrozkuoZcbiAgICAgICAgICAgICAgICAgICAgaXNBbmltYXRpbmcgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICAgICAgY3VycmVudE5vdGVJbmRleCsrO1xuXG4gICAgICAgICAgICAgICAgICAgIC8vIOePvuWcqOOBrumfs+espuOCkuWFieOCieOBm+OBpumfs+OCkumztOOCieOBme+8iOmAmumBjuOBl+OBn+OBk+OBqOOCkuekuuOBme+8iVxuICAgICAgICAgICAgICAgICAgICBpZiAoY3VycmVudE5vdGVJbmRleCAtIDEgPCB0aGlzLm5vdGVzLmNoaWxkcmVuLmxlbmd0aCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgY29uc3Qgbm90ZU1lc2ggPSB0aGlzLm5vdGVzLmNoaWxkcmVuW2N1cnJlbnROb3RlSW5kZXggLSAxXTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChub3RlTWVzaCBpbnN0YW5jZW9mIFRIUkVFLk1lc2ggJiYgbm90ZU1lc2gubWF0ZXJpYWwgaW5zdGFuY2VvZiBUSFJFRS5NZXNoU3RhbmRhcmRNYXRlcmlhbCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5vdGVNZXNoLm1hdGVyaWFsLmNvbG9yLnNldCgweDAwZmZmZik7IC8vIOm7hOiJsuOBq+WkieabtFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5vdGVNZXNoLm1hdGVyaWFsLmVtaXNzaXZlLnNldCgweDAwZmZmZik7IC8vIOeZuuWFieWKueaenOOCkui/veWKoFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5vdGVNZXNoLm1hdGVyaWFsLmVtaXNzaXZlSW50ZW5zaXR5ID0gMTsgLy8g55m65YWJ5by35bqmXG4gICAgICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIOmfs+OCkumztOOCieOBmVxuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5wbGF5Tm90ZShub3RlRGF0YVtjdXJyZW50Tm90ZUluZGV4IC0gMV0ucGl0Y2gpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAvLyDjgqvjg6Hjg6njgpLjg6njgqTjg4jjgavov73lvpPjgZXjgZvjgabjgIHluLjjgavliY3jgpLopovjgotcbiAgICAgICAgICAgIC8vIHRoaXMubGlnaHQucG9zaXRpb24ueCArPSA0O1xuICAgICAgICAgICAgdGhpcy5jYW1lcmEucG9zaXRpb24ueCA9IHRoaXMubGlnaHQucG9zaXRpb24ueCAtIDU1O1xuICAgICAgICAgICAgdGhpcy5jYW1lcmEubG9va0F0KHRoaXMubGlnaHQucG9zaXRpb24ueCwgMCwgMCk7IC8vIOODqeOCpOODiOOBruOBguOCi+aWueWQkeOCkuazqOimllxuXG4gICAgICAgICAgICByZXF1ZXN0QW5pbWF0aW9uRnJhbWUodXBkYXRlKTtcbiAgICAgICAgfTtcbiAgICAgICAgcmVxdWVzdEFuaW1hdGlvbkZyYW1lKHVwZGF0ZSk7XG4gICAgfVxuXG4gICAgLy8g6Z+z44KS6bO044KJ44GZ44Oh44K944OD44OJXG4gICAgcHJpdmF0ZSBwbGF5Tm90ZSA9IChwaXRjaDogbnVtYmVyKSA9PiB7XG4gICAgICAgIC8vIOaXouWtmOOBruOCquOCt+ODrOODvOOCv+ODvOOCkuWBnOatolxuICAgICAgICBpZiAodGhpcy5vc2NpbGxhdG9yKSB7XG4gICAgICAgICAgICB0aGlzLm9zY2lsbGF0b3Iuc3RvcCgpO1xuICAgICAgICAgICAgdGhpcy5vc2NpbGxhdG9yLmRpc2Nvbm5lY3QoKTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIOaWsOOBl+OBhOOCquOCt+ODrOODvOOCv+ODvOOCkuS9nOaIkFxuICAgICAgICB0aGlzLm9zY2lsbGF0b3IgPSB0aGlzLmF1ZGlvQ29udGV4dC5jcmVhdGVPc2NpbGxhdG9yKCk7XG4gICAgICAgIGNvbnN0IGdhaW5Ob2RlID0gdGhpcy5hdWRpb0NvbnRleHQuY3JlYXRlR2FpbigpO1xuXG4gICAgICAgIC8vIOODlOODg+ODgeOBi+OCieWRqOazouaVsOOCkuioiOeul++8iEM0ID0gMjYxLjYzSHrjgpLln7rmupbvvIlcbiAgICAgICAgY29uc3QgYmFzZUZyZXEgPSAyNjEuNjM7IC8vIEM0XG4gICAgICAgIGNvbnN0IGZyZXF1ZW5jeSA9IGJhc2VGcmVxICogTWF0aC5wb3coMiwgcGl0Y2ggLyAxMik7XG5cbiAgICAgICAgLy8g44Kq44K344Os44O844K/44O844Gu6Kit5a6aXG4gICAgICAgIHRoaXMub3NjaWxsYXRvci50eXBlID0gJ3NpbmUnO1xuICAgICAgICB0aGlzLm9zY2lsbGF0b3IuZnJlcXVlbmN5LnNldFZhbHVlQXRUaW1lKGZyZXF1ZW5jeSwgdGhpcy5hdWRpb0NvbnRleHQuY3VycmVudFRpbWUpO1xuXG4gICAgICAgIC8vIOOCsuOCpOODs+OBruioreWumu+8iOODleOCp+ODvOODieOCpOODs+ODu+ODleOCp+ODvOODieOCouOCpuODiO+8iVxuICAgICAgICBnYWluTm9kZS5nYWluLnNldFZhbHVlQXRUaW1lKDAsIHRoaXMuYXVkaW9Db250ZXh0LmN1cnJlbnRUaW1lKTtcbiAgICAgICAgZ2Fpbk5vZGUuZ2Fpbi5saW5lYXJSYW1wVG9WYWx1ZUF0VGltZSgwLjMsIHRoaXMuYXVkaW9Db250ZXh0LmN1cnJlbnRUaW1lICsgMC4xKTtcbiAgICAgICAgZ2Fpbk5vZGUuZ2Fpbi5leHBvbmVudGlhbFJhbXBUb1ZhbHVlQXRUaW1lKDAuMDEsIHRoaXMuYXVkaW9Db250ZXh0LmN1cnJlbnRUaW1lICsgMC41KTtcblxuICAgICAgICAvLyDmjqXntppcbiAgICAgICAgdGhpcy5vc2NpbGxhdG9yLmNvbm5lY3QoZ2Fpbk5vZGUpO1xuICAgICAgICBnYWluTm9kZS5jb25uZWN0KHRoaXMuYXVkaW9Db250ZXh0LmRlc3RpbmF0aW9uKTtcblxuICAgICAgICAvLyDpn7PjgpLplovlp4tcbiAgICAgICAgdGhpcy5vc2NpbGxhdG9yLnN0YXJ0KCk7XG4gICAgICAgIHRoaXMub3NjaWxsYXRvci5zdG9wKHRoaXMuYXVkaW9Db250ZXh0LmN1cnJlbnRUaW1lICsgMC41KTtcbiAgICB9O1xufVxuXG53aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcihcIkRPTUNvbnRlbnRMb2FkZWRcIiwgaW5pdCk7XG5cbmZ1bmN0aW9uIGluaXQoKSB7XG4gICAgbGV0IGNvbnRhaW5lciA9IG5ldyBUaHJlZUpTQ29udGFpbmVyKCk7XG5cbiAgICBsZXQgdmlld3BvcnQgPSBjb250YWluZXIuY3JlYXRlUmVuZGVyZXJET00oNjQwLCA0ODAsIG5ldyBUSFJFRS5WZWN0b3IzKC01MCwgMTAwLCAxMDApKTtcbiAgICBkb2N1bWVudC5ib2R5LmFwcGVuZENoaWxkKHZpZXdwb3J0KTtcbn1cbiIsIi8vIFRoZSBtb2R1bGUgY2FjaGVcbnZhciBfX3dlYnBhY2tfbW9kdWxlX2NhY2hlX18gPSB7fTtcblxuLy8gVGhlIHJlcXVpcmUgZnVuY3Rpb25cbmZ1bmN0aW9uIF9fd2VicGFja19yZXF1aXJlX18obW9kdWxlSWQpIHtcblx0Ly8gQ2hlY2sgaWYgbW9kdWxlIGlzIGluIGNhY2hlXG5cdHZhciBjYWNoZWRNb2R1bGUgPSBfX3dlYnBhY2tfbW9kdWxlX2NhY2hlX19bbW9kdWxlSWRdO1xuXHRpZiAoY2FjaGVkTW9kdWxlICE9PSB1bmRlZmluZWQpIHtcblx0XHRyZXR1cm4gY2FjaGVkTW9kdWxlLmV4cG9ydHM7XG5cdH1cblx0Ly8gQ3JlYXRlIGEgbmV3IG1vZHVsZSAoYW5kIHB1dCBpdCBpbnRvIHRoZSBjYWNoZSlcblx0dmFyIG1vZHVsZSA9IF9fd2VicGFja19tb2R1bGVfY2FjaGVfX1ttb2R1bGVJZF0gPSB7XG5cdFx0Ly8gbm8gbW9kdWxlLmlkIG5lZWRlZFxuXHRcdC8vIG5vIG1vZHVsZS5sb2FkZWQgbmVlZGVkXG5cdFx0ZXhwb3J0czoge31cblx0fTtcblxuXHQvLyBFeGVjdXRlIHRoZSBtb2R1bGUgZnVuY3Rpb25cblx0X193ZWJwYWNrX21vZHVsZXNfX1ttb2R1bGVJZF0obW9kdWxlLCBtb2R1bGUuZXhwb3J0cywgX193ZWJwYWNrX3JlcXVpcmVfXyk7XG5cblx0Ly8gUmV0dXJuIHRoZSBleHBvcnRzIG9mIHRoZSBtb2R1bGVcblx0cmV0dXJuIG1vZHVsZS5leHBvcnRzO1xufVxuXG4vLyBleHBvc2UgdGhlIG1vZHVsZXMgb2JqZWN0IChfX3dlYnBhY2tfbW9kdWxlc19fKVxuX193ZWJwYWNrX3JlcXVpcmVfXy5tID0gX193ZWJwYWNrX21vZHVsZXNfXztcblxuIiwidmFyIGRlZmVycmVkID0gW107XG5fX3dlYnBhY2tfcmVxdWlyZV9fLk8gPSAocmVzdWx0LCBjaHVua0lkcywgZm4sIHByaW9yaXR5KSA9PiB7XG5cdGlmKGNodW5rSWRzKSB7XG5cdFx0cHJpb3JpdHkgPSBwcmlvcml0eSB8fCAwO1xuXHRcdGZvcih2YXIgaSA9IGRlZmVycmVkLmxlbmd0aDsgaSA+IDAgJiYgZGVmZXJyZWRbaSAtIDFdWzJdID4gcHJpb3JpdHk7IGktLSkgZGVmZXJyZWRbaV0gPSBkZWZlcnJlZFtpIC0gMV07XG5cdFx0ZGVmZXJyZWRbaV0gPSBbY2h1bmtJZHMsIGZuLCBwcmlvcml0eV07XG5cdFx0cmV0dXJuO1xuXHR9XG5cdHZhciBub3RGdWxmaWxsZWQgPSBJbmZpbml0eTtcblx0Zm9yICh2YXIgaSA9IDA7IGkgPCBkZWZlcnJlZC5sZW5ndGg7IGkrKykge1xuXHRcdHZhciBbY2h1bmtJZHMsIGZuLCBwcmlvcml0eV0gPSBkZWZlcnJlZFtpXTtcblx0XHR2YXIgZnVsZmlsbGVkID0gdHJ1ZTtcblx0XHRmb3IgKHZhciBqID0gMDsgaiA8IGNodW5rSWRzLmxlbmd0aDsgaisrKSB7XG5cdFx0XHRpZiAoKHByaW9yaXR5ICYgMSA9PT0gMCB8fCBub3RGdWxmaWxsZWQgPj0gcHJpb3JpdHkpICYmIE9iamVjdC5rZXlzKF9fd2VicGFja19yZXF1aXJlX18uTykuZXZlcnkoKGtleSkgPT4gKF9fd2VicGFja19yZXF1aXJlX18uT1trZXldKGNodW5rSWRzW2pdKSkpKSB7XG5cdFx0XHRcdGNodW5rSWRzLnNwbGljZShqLS0sIDEpO1xuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0ZnVsZmlsbGVkID0gZmFsc2U7XG5cdFx0XHRcdGlmKHByaW9yaXR5IDwgbm90RnVsZmlsbGVkKSBub3RGdWxmaWxsZWQgPSBwcmlvcml0eTtcblx0XHRcdH1cblx0XHR9XG5cdFx0aWYoZnVsZmlsbGVkKSB7XG5cdFx0XHRkZWZlcnJlZC5zcGxpY2UoaS0tLCAxKVxuXHRcdFx0dmFyIHIgPSBmbigpO1xuXHRcdFx0aWYgKHIgIT09IHVuZGVmaW5lZCkgcmVzdWx0ID0gcjtcblx0XHR9XG5cdH1cblx0cmV0dXJuIHJlc3VsdDtcbn07IiwiLy8gZGVmaW5lIGdldHRlciBmdW5jdGlvbnMgZm9yIGhhcm1vbnkgZXhwb3J0c1xuX193ZWJwYWNrX3JlcXVpcmVfXy5kID0gKGV4cG9ydHMsIGRlZmluaXRpb24pID0+IHtcblx0Zm9yKHZhciBrZXkgaW4gZGVmaW5pdGlvbikge1xuXHRcdGlmKF9fd2VicGFja19yZXF1aXJlX18ubyhkZWZpbml0aW9uLCBrZXkpICYmICFfX3dlYnBhY2tfcmVxdWlyZV9fLm8oZXhwb3J0cywga2V5KSkge1xuXHRcdFx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIGtleSwgeyBlbnVtZXJhYmxlOiB0cnVlLCBnZXQ6IGRlZmluaXRpb25ba2V5XSB9KTtcblx0XHR9XG5cdH1cbn07IiwiX193ZWJwYWNrX3JlcXVpcmVfXy5vID0gKG9iaiwgcHJvcCkgPT4gKE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChvYmosIHByb3ApKSIsIi8vIGRlZmluZSBfX2VzTW9kdWxlIG9uIGV4cG9ydHNcbl9fd2VicGFja19yZXF1aXJlX18uciA9IChleHBvcnRzKSA9PiB7XG5cdGlmKHR5cGVvZiBTeW1ib2wgIT09ICd1bmRlZmluZWQnICYmIFN5bWJvbC50b1N0cmluZ1RhZykge1xuXHRcdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBTeW1ib2wudG9TdHJpbmdUYWcsIHsgdmFsdWU6ICdNb2R1bGUnIH0pO1xuXHR9XG5cdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCAnX19lc01vZHVsZScsIHsgdmFsdWU6IHRydWUgfSk7XG59OyIsIi8vIG5vIGJhc2VVUklcblxuLy8gb2JqZWN0IHRvIHN0b3JlIGxvYWRlZCBhbmQgbG9hZGluZyBjaHVua3Ncbi8vIHVuZGVmaW5lZCA9IGNodW5rIG5vdCBsb2FkZWQsIG51bGwgPSBjaHVuayBwcmVsb2FkZWQvcHJlZmV0Y2hlZFxuLy8gW3Jlc29sdmUsIHJlamVjdCwgUHJvbWlzZV0gPSBjaHVuayBsb2FkaW5nLCAwID0gY2h1bmsgbG9hZGVkXG52YXIgaW5zdGFsbGVkQ2h1bmtzID0ge1xuXHRcIm1haW5cIjogMFxufTtcblxuLy8gbm8gY2h1bmsgb24gZGVtYW5kIGxvYWRpbmdcblxuLy8gbm8gcHJlZmV0Y2hpbmdcblxuLy8gbm8gcHJlbG9hZGVkXG5cbi8vIG5vIEhNUlxuXG4vLyBubyBITVIgbWFuaWZlc3RcblxuX193ZWJwYWNrX3JlcXVpcmVfXy5PLmogPSAoY2h1bmtJZCkgPT4gKGluc3RhbGxlZENodW5rc1tjaHVua0lkXSA9PT0gMCk7XG5cbi8vIGluc3RhbGwgYSBKU09OUCBjYWxsYmFjayBmb3IgY2h1bmsgbG9hZGluZ1xudmFyIHdlYnBhY2tKc29ucENhbGxiYWNrID0gKHBhcmVudENodW5rTG9hZGluZ0Z1bmN0aW9uLCBkYXRhKSA9PiB7XG5cdHZhciBbY2h1bmtJZHMsIG1vcmVNb2R1bGVzLCBydW50aW1lXSA9IGRhdGE7XG5cdC8vIGFkZCBcIm1vcmVNb2R1bGVzXCIgdG8gdGhlIG1vZHVsZXMgb2JqZWN0LFxuXHQvLyB0aGVuIGZsYWcgYWxsIFwiY2h1bmtJZHNcIiBhcyBsb2FkZWQgYW5kIGZpcmUgY2FsbGJhY2tcblx0dmFyIG1vZHVsZUlkLCBjaHVua0lkLCBpID0gMDtcblx0aWYoY2h1bmtJZHMuc29tZSgoaWQpID0+IChpbnN0YWxsZWRDaHVua3NbaWRdICE9PSAwKSkpIHtcblx0XHRmb3IobW9kdWxlSWQgaW4gbW9yZU1vZHVsZXMpIHtcblx0XHRcdGlmKF9fd2VicGFja19yZXF1aXJlX18ubyhtb3JlTW9kdWxlcywgbW9kdWxlSWQpKSB7XG5cdFx0XHRcdF9fd2VicGFja19yZXF1aXJlX18ubVttb2R1bGVJZF0gPSBtb3JlTW9kdWxlc1ttb2R1bGVJZF07XG5cdFx0XHR9XG5cdFx0fVxuXHRcdGlmKHJ1bnRpbWUpIHZhciByZXN1bHQgPSBydW50aW1lKF9fd2VicGFja19yZXF1aXJlX18pO1xuXHR9XG5cdGlmKHBhcmVudENodW5rTG9hZGluZ0Z1bmN0aW9uKSBwYXJlbnRDaHVua0xvYWRpbmdGdW5jdGlvbihkYXRhKTtcblx0Zm9yKDtpIDwgY2h1bmtJZHMubGVuZ3RoOyBpKyspIHtcblx0XHRjaHVua0lkID0gY2h1bmtJZHNbaV07XG5cdFx0aWYoX193ZWJwYWNrX3JlcXVpcmVfXy5vKGluc3RhbGxlZENodW5rcywgY2h1bmtJZCkgJiYgaW5zdGFsbGVkQ2h1bmtzW2NodW5rSWRdKSB7XG5cdFx0XHRpbnN0YWxsZWRDaHVua3NbY2h1bmtJZF1bMF0oKTtcblx0XHR9XG5cdFx0aW5zdGFsbGVkQ2h1bmtzW2NodW5rSWRdID0gMDtcblx0fVxuXHRyZXR1cm4gX193ZWJwYWNrX3JlcXVpcmVfXy5PKHJlc3VsdCk7XG59XG5cbnZhciBjaHVua0xvYWRpbmdHbG9iYWwgPSBzZWxmW1wid2VicGFja0NodW5rY2dwcmVuZGVyaW5nXCJdID0gc2VsZltcIndlYnBhY2tDaHVua2NncHJlbmRlcmluZ1wiXSB8fCBbXTtcbmNodW5rTG9hZGluZ0dsb2JhbC5mb3JFYWNoKHdlYnBhY2tKc29ucENhbGxiYWNrLmJpbmQobnVsbCwgMCkpO1xuY2h1bmtMb2FkaW5nR2xvYmFsLnB1c2ggPSB3ZWJwYWNrSnNvbnBDYWxsYmFjay5iaW5kKG51bGwsIGNodW5rTG9hZGluZ0dsb2JhbC5wdXNoLmJpbmQoY2h1bmtMb2FkaW5nR2xvYmFsKSk7IiwiIiwiLy8gc3RhcnR1cFxuLy8gTG9hZCBlbnRyeSBtb2R1bGUgYW5kIHJldHVybiBleHBvcnRzXG4vLyBUaGlzIGVudHJ5IG1vZHVsZSBkZXBlbmRzIG9uIG90aGVyIGxvYWRlZCBjaHVua3MgYW5kIGV4ZWN1dGlvbiBuZWVkIHRvIGJlIGRlbGF5ZWRcbnZhciBfX3dlYnBhY2tfZXhwb3J0c19fID0gX193ZWJwYWNrX3JlcXVpcmVfXy5PKHVuZGVmaW5lZCwgW1widmVuZG9ycy1ub2RlX21vZHVsZXNfdGhyZWVfZXhhbXBsZXNfanNtX2NvbnRyb2xzX09yYml0Q29udHJvbHNfanNcIl0sICgpID0+IChfX3dlYnBhY2tfcmVxdWlyZV9fKFwiLi9zcmMvYXBwLnRzXCIpKSlcbl9fd2VicGFja19leHBvcnRzX18gPSBfX3dlYnBhY2tfcmVxdWlyZV9fLk8oX193ZWJwYWNrX2V4cG9ydHNfXyk7XG4iLCIiXSwibmFtZXMiOltdLCJzb3VyY2VSb290IjoiIn0=
import * as THREE from 'three';
import { OrbitControls } from '../node_modules/three/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from '../node_modules/three/examples/jsm/loaders/GLTFLoader.js';
import { createApp } from '../node_modules/vue/dist/vue.esm-browser.prod.js';

let scene, camera, renderer;

class PickHelper {
    constructor() {
        this.raycaster = new THREE.Raycaster();
        this.pickedObject = null;
        this.pickedObjectSavedColor = 0;
        this.description = '';
        this.objectsToHighlight = [
            ['Object_179', 'Description for Object_179'],
            ['Object_33', 'Description for Object_33'],
            ['Object_188', 'Description for Object_188'],
            ['Object_19', 'Description for Object_19'],
            ['Object_67', 'Description for Object_67'],
            ['Object_99', 'Description for Object_99'],
            ['Object_123', 'Description for Object_123']
        ];
    }
    pick(normalizedPosition, scene, camera, time) {
        // 恢复上一个被拾取对象的颜色
        if (this.pickedObject && this.pickedObject.material) {
            this.pickedObject.scale.copy(this.pickedObjectSavedScale);
            this.pickedObject.material.emissive.setHex(this.pickedObjectSavedColor);
            this.description = '';
            this.pickedObject = undefined;

        }

        // 发出射线
        this.raycaster.setFromCamera(normalizedPosition, camera);
        // 获取与射线相交的对象
        const intersectedObjects = this.raycaster.intersectObjects(scene.children, true);

        if (intersectedObjects.length) {

            this.pickedObject = intersectedObjects.find(object => {
                // 检查物体的名称是否在需要独立处理的列表中
                // console.log(object.object.name);
                const matchedItem = this.objectsToHighlight.find(item => item[0] === object.object.name);
                if (matchedItem) {
                    this.description = matchedItem[1]; // 赋值对象的描述给类下的变量 description
                    return true;
                } else {
                    return false;
                }

            });

            //console.log(this.pickedObject);


            // // 找到第一个对象，它是离鼠标最近的对象
            // const pickedObject1 = intersectedObjects[0].object;
            // console.log(pickedObject1);
            //console.log(this.pickedObject.name);
            if (this.pickedObject && this.pickedObject.object.material) {
                //console.log(this.pickedObject.object);
                this.pickedObject = this.pickedObject.object;
                // 保存它的颜色
                this.pickedObjectSavedColor = this.pickedObject.material.emissive.getHex();
                this.pickedObjectSavedScale = this.pickedObject.scale.clone();
                // 设置放大效果
                this.pickedObject.scale.multiplyScalar(1.01);
                this.pickedObject.material.emissive.setHex(0xffffff);

                //console.log(this.description);
            }

            //console.log(this.description + '1');
        }
    }

}
const pickHelper = new PickHelper();

const pickPosition = { x: 0, y: 0 };
clearPickPosition();



function getCanvasRelativePosition(event) {
    const rect = canvas.getBoundingClientRect();
    return {
        x: (event.clientX - rect.left) * canvas.width / rect.width,
        y: (event.clientY - rect.top) * canvas.height / rect.height,
    };
}

function setPickPosition(event) {
    const pos = getCanvasRelativePosition(event);
    pickPosition.x = (pos.x / canvas.width) * 2 - 1;
    pickPosition.y = (pos.y / canvas.height) * -2 + 1;  // note we flip Y
}

function clearPickPosition() {
    // 对于触屏，不像鼠标总是能有一个位置坐标，
    // 如果用户不在触摸屏幕，我们希望停止拾取操作。
    // 因此，我们选取一个特别的值，表明什么都没选中
    pickPosition.x = -100000;
    pickPosition.y = -100000;
}

window.addEventListener('mousemove', setPickPosition);
window.addEventListener('mouseout', clearPickPosition);
window.addEventListener('mouseleave', clearPickPosition);


window.addEventListener('touchstart', (event) => {
    // 阻止窗口滚动行为
    event.preventDefault();
    setPickPosition(event.touches[0]);
}, { passive: false });

window.addEventListener('touchmove', (event) => {
    setPickPosition(event.touches[0]);
});

window.addEventListener('touchend', clearPickPosition);

const app = createApp({
    data() {
        return {
            message: '',
            isShow: false,
        };
    },
    mounted() {
        this.message = pickHelper.description
        this.updateMessage();
    },
    methods: {
        updateMessage() {
            setInterval(() => {
                // 更新 message

                this.message = pickHelper.description;
                if (this.message)
                    this.isShow = true;
                else
                    this.isShow = false;
                    console.log(this.isShow);
            }, 100);
        }
    }
});
// 将 Vue 应用程序挂载到 DOM
app.mount('#app');

const init = () => {
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0xAAAAAA);

    // 创建渲染器
    const canvas = document.querySelector('#canvas');
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    renderer = new THREE.WebGLRenderer({ antialias: true, canvas });
    renderer.setSize(window.innerWidth, window.innerHeight);
    //document.querySelector('#canvas').appendChild(renderer.domElement);

    const aspect = window.innerWidth / window.innerHeight;
    //创建相机
    camera = new THREE.PerspectiveCamera(80, 2, 0.1, 1000);
    camera.position.z = 7;
    camera.position.y = 5;

    //控制相机
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.addEventListener("changes", animate);
    controls.enableDamping = true;

    // 把摄像机放到自拍杆上 (把它添加为一个对象的子元素)
    // 如此，我们就能通过旋转自拍杆，来移动摄像机
    const cameraPole = new THREE.Object3D();
    scene.add(cameraPole);
    cameraPole.add(camera);


    //window.addEventListener('resize', animate);

    // // 创建立方体
    // const geometry = new THREE.BoxGeometry();
    // //设置phong一定要加灯光
    // const material = new THREE.MeshPhongMaterial({
    //     color: 0x44aa88,
    //     shininess: 150
    // });
    // const cube = new THREE.Mesh(geometry, material);
    // scene.add(cube);

    let wheelComponents = [];
    //导入gltf
    {
        const gltfLoader = new GLTFLoader();
        const url = './train_-_british_rail_class_08_rail_blue_livery/scene.gltf';
        gltfLoader.load(url, (gltf) => {
            const root = gltf.scene;
            scene.add(root);
            console.log(dumpObject(root).join('\n'));
            //wheels = root.getObjectByName('Wheels001_71');
            root.traverse((child) => {
                // 如果子对象的名称以"Wheels00"开头，并且是Object3D类型
                if (child.name.startsWith("Wheels00") && child.isObject3D) {
                    // 将该子对象添加到数组中
                    wheelComponents.push(child);
                }
            });
        });
    }

    //打印场景图
    function dumpObject(obj, lines = [], isLast = true, prefix = '') {
        const localPrefix = isLast ? '└─' : '├─';
        lines.push(`${prefix}${prefix ? localPrefix : ''}${obj.name || '*no-name*'} [${obj.type}]`);
        const newPrefix = prefix + (isLast ? '  ' : '│ ');
        const lastNdx = obj.children.length - 1;
        obj.children.forEach((child, ndx) => {
            const isLast = ndx === lastNdx;
            dumpObject(child, lines, isLast, newPrefix);
        });
        return lines;
    }


    //控制灯光
    {
        const color = 0xffffff;
        const intensity = 3;
        const positions = [
            { x: -1, y: 2, z: 4 },
            { x: 1, y: 2, z: 4 },
            { x: -1, y: -2, z: 4 },
            { x: 1, y: 2, z: -4 },
        ];

        positions.forEach(position => {
            const light = new THREE.DirectionalLight(color, intensity);
            light.position.set(position.x, position.y, position.z);
            camera.add(light);
        });
    }
    //检查渲染器的canvas尺寸是不是和canvas的显示尺寸不一样
    function resizeRendererToDisplaySize(renderer) {
        const canvas = renderer.domElement;
        const width = canvas.clientWidth;
        const height = canvas.clientHeight;
        const needResize = canvas.width !== width || canvas.height !== height;
        if (needResize) {
            renderer.setSize(width, height, false);
        }
        return needResize;
    }

    // 渲染循环
    function animate(time) {


        time *= 0.001;


        //cameraPole.rotation.y = time * .1;
        //响应变形
        const canvas = renderer.domElement;
        camera.aspect = canvas.clientWidth / canvas.clientHeight;
        camera.updateProjectionMatrix();

        //放缩锯齿
        if (resizeRendererToDisplaySize(renderer)) {
            const canvas = renderer.domElement;
            camera.aspect = canvas.clientWidth / canvas.clientHeight;
            camera.updateProjectionMatrix();
        }
        // 遍历轮子部件的所有子对象（网格）
        if (wheelComponents) {
            for (const wheels of wheelComponents) {
                wheels.rotation.x = time;
            }
        }

        pickHelper.pick(pickPosition, scene, camera, time);
        console.log(pickHelper.description);

        // cube.rotation.x = time;
        // cube.rotation.y = time;
        renderer.render(scene, camera);

        requestAnimationFrame(animate);
    }
    requestAnimationFrame(animate);

}
init();


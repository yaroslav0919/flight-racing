import * as THREE from "three";
import { GUI } from "dat.gui";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import Track from "./Track";
import Vehicle from "./Vehicle";
import { IKeysPressed } from "./utils/interfaces";
import { Scene } from "three";

export default class GameScene extends THREE.Scene {
    debugger: GUI;

    camera: THREE.PerspectiveCamera;
    renderer: THREE.Renderer;
    orbitals: OrbitControls;

    height: number;
    width: number;

    keysPressed: IKeysPressed;

    track: Track;
    vehicles: Array<Vehicle>;

    constructor() {
        super();

        this.width = window.innerWidth;
        this.height = window.innerHeight;

        // set up camera
        this.camera = new THREE.PerspectiveCamera(64, 
            this.width / this.height, 0.1, 1000);

        // set up renderer
        this.renderer = new THREE.WebGLRenderer({
            canvas: document.getElementById("game") as HTMLCanvasElement,
            alpha: true
        });
        this.renderer.setSize(this.width, this.height);

        // set objects in the scene
        // this.background = new THREE.Color(0x07205a);
        this.add(new THREE.AmbientLight(0xffffff));

        this.track = new Track(this);
        this.track.render();

        let startPoint = this.track.startPoint.clone();
        startPoint.y += 0.5;

        let vehicle = new Vehicle(this, this.camera, startPoint);
        vehicle.render();
        
        this.vehicles = [];
        this.vehicles.push(vehicle);

        // set up debugger
        this.debugger =  new GUI();

        const cameraGroup = this.debugger.addFolder("Camera");
        cameraGroup.add(this.camera, "fov", 0, 120);
        cameraGroup.add(this.camera, "zoom", 0, 1);
        cameraGroup.add(vehicle, "manualCamera");
        cameraGroup.open();

        const vehicleGroup = this.debugger.addFolder("Vehicle");
        vehicleGroup.add(vehicle.position, "x", -100, 100);
        vehicleGroup.add(vehicle.position, "y", -100, 100);
        vehicleGroup.add(vehicle.position, "z", -100, 100);
        vehicleGroup.open();

        // set up utilities
        // set up grid
        let gridHelper = new THREE.GridHelper(1000, 1000, 0x5badfb, 0x5badfb);
        this.add(gridHelper);

        // setup axis-helper
        // this.add(new THREE.AxesHelper(3));

        // set up camera orbital controls
        this.orbitals = new OrbitControls(this.camera, this.renderer.domElement);
        
        // set up controls
        this.keysPressed = {
            "w": false,
            "a": false,
            "s": false,
            "d": false
        };

        window.addEventListener("keydown", (e: KeyboardEvent) => {
            this.keysPressed[e.key] = true;
        });

        window.addEventListener("keyup", (e: KeyboardEvent) => {
            this.keysPressed[e.key] = false;
        });

        // set up window resizing
        window.addEventListener("resize", () => {
            this.height = window.innerHeight;
            this.width = window.innerWidth;

            this.camera.aspect = this.width / this.height;
            this.camera.updateProjectionMatrix();
            this.renderer.setSize(this.width, this.height);
        }, false);
    }

    update(dt?: number) {
        for (let vehicle of this.vehicles) {
            vehicle.update(this.keysPressed, this.track, dt);
        }
    }
}
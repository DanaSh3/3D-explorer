/**
 * Created by Aibek on 11/2/13.
 */

$(document).ready(function () {

// important stuff: renderer - it shows everything and is appended to HTML
    var renderer;

// important stuff: camera - where to look
    var camera;

// important stuff: scene - you add everything to it
    var scene;

    var projector;

    var objects;

// variables for moving cube
    var cube1, cube2, cube3, cube4;

// variable for stationary cube in the center
    var cube;

// make the "room"
    var floor, wall1, wall2, wall3, wall4;

// main light
    var light;

// used when resizing windows and moving mouse, i.e. rotating camera
    var windowHalfX, windowHalfY;
    var mouseX, mouseY;

    var target;

    // initialize and render

    init();
    render();

    function init() {
        // get center of the screen (half of the width/height)
        windowHalfX = $('#viewer').width() / 2;
        windowHalfY =  $('#viewer').height() / 2;

        // initialize mouseX and mouseY
        mouseX = 0;
        mouseY = 0;

        // add mouse move listener (remember we heard about it in class?)
        var viewer = document.getElementById('viewer');
        viewer.addEventListener('mousemove', onDocumentMouseMove, false);
        viewer.addEventListener('mousedown', onDocumentMouseDown, false);


        //##########################################################################
        //                           WebGL starts here!
        //##########################################################################

        // NOTE: coordinate system in WebGL:
        // x - left/right
        // y - up/down                <-- vertical
        // z - forward/backward

        // initializing renderer - used to display entire WebGL thing in the browser
        renderer = new THREE.WebGLRenderer({antialias: true});
        renderer.setSize($('#viewer').width(), $('#viewer').height());    // take up entire space
        renderer.shadowMapEnabled = true;                           // enable shadows

        $('#viewer').html(renderer.domElement);

        // initializing camera - used to show stuff
        camera = new THREE.PerspectiveCamera(60, $('#viewer').width() / $('#viewer').height(), 1, 10000);       // don't worry about parameters
        camera.position.set(0, 500, 0);
        target = new THREE.Vector3(0, 0, 100);

        // finally initializing scene - you'll be adding stuff to it
        scene = new THREE.Scene();

        // projector is used for tracing where you click
        projector = new THREE.Projector();

        // initializing array for objects being clicked
        objects = new Array()

        // initializing every part of the WebGL - initGUI is optional (that's another library)
        initGeometry();
        initLights();
        initMouseWheel();
    }

    function initGeometry() {
        cube1 = new THREE.Mesh(
            new THREE.CubeGeometry(25, 25, 25),                           // supply size of the cube
            new THREE.MeshLambertMaterial({color: 0x000000}));          // supply color of the cube
        cube1.position.set(200, 0, 200);
        cube1.castShadow = true;
        cube1.receiveShadow = true;
        scene.add(cube1);
        objects.push(cube1);

        cube2 = new THREE.Mesh(
            new THREE.CubeGeometry(25, 25, 25),                           // supply size of the cube
            new THREE.MeshLambertMaterial({color: 0xFF0000}));          // supply color of the cube
        cube2.position.set(-200, 0, 200);
        cube2.castShadow = true;
        cube2.receiveShadow = true;
        scene.add(cube2);
        objects.push(cube2);

        cube3 = new THREE.Mesh(
            new THREE.CubeGeometry(25, 25, 25),                           // supply size of the cube
            new THREE.MeshLambertMaterial({color: 0x00FF00}));          // supply color of the cube
        cube3.position.set(200, 0, -200);
        cube3.castShadow = true;
        cube3.receiveShadow = true;
        scene.add(cube3);
        objects.push(cube3);

        cube4 = new THREE.Mesh(
            new THREE.CubeGeometry(25, 25, 25),                           // supply size of the cube
            new THREE.MeshLambertMaterial({color: 0x0000FF}));          // supply color of the cube
        cube4.position.set(-200, 0, -200);
        cube4.castShadow = true;
        cube4.receiveShadow = true;
        scene.add(cube4);
        objects.push(cube4);

        // just cube in the center, by default it is at 0,0,0 position
        cube = new THREE.Mesh(
            new THREE.CubeGeometry(25, 50, 100),
            new THREE.MeshLambertMaterial({color: 0x0000FF}));            // supply color of the cube
        cube.castShadow = true;
        cube.receiveShadow = true;
        scene.add(cube);
//    objects.push(cube);

        var starTexture = new THREE.ImageUtils.loadTexture('/images/stars.jpg');
        var starMaterial = new THREE.MeshLambertMaterial({map: starTexture});

        // making a floor - just a plane 500x500, with 10 width/height segments - they affect lightning/reflection I believe
        floor = new THREE.Mesh(
            new THREE.PlaneGeometry(windowHalfX * 5, windowHalfY * 5, 10, 10),
            starMaterial);
        floor.receiveShadow = true;
        floor.rotation.x = -Math.PI / 2;                    // make it horizontal, by default planes are vertical
        floor.position.y = -500;                                   // move it a little, to match bottom of the cube
        scene.add(floor);

        // since we will be adding similar walls, we can reuse the geometry and material
        var wallGeometry = new THREE.PlaneGeometry(500, 500, 10, 10);
        var wallMaterial = new THREE.MeshPhongMaterial({color: 0xAAFF66});

        // here is a wall, by default planes are vertical
        wall1 = new THREE.Mesh(wallGeometry, starMaterial);
        wall1.receiveShadow = true;
        wall1.position.z = -250;                // move it back
//        scene.add(wall1);

        // here is a wall, by default planes are vertical
        wall2 = new THREE.Mesh(wallGeometry, starMaterial);
        wall2.receiveShadow = true;
        wall2.rotation.y = Math.PI / 2;         // rotate to get perpendicular wall
        wall2.position.x = -250;                // move it left
//        scene.add(wall2);

        // here is a wall, by default planes are vertical
        wall3 = new THREE.Mesh(wallGeometry, starMaterial);
        wall3.position.x = 250;                 // move it right
        wall3.rotation.y = -Math.PI / 2;       // rotate to get perpendicular wall
        wall3.receiveShadow = true;
//        scene.add(wall3);

        // here is a wall, by default planes are vertical
        wall4 = new THREE.Mesh(wallGeometry, starMaterial);
        wall4.position.z = 250;                 // move it front
        wall4.rotation.y = Math.PI;             // rotate it 180 degrees, so the "front" will face towards us,
        // otherwise we will "look through" the plane
        wall4.receiveShadow = true;
//        scene.add(wall4);
    }

// lights tutorial - there has to be light in the scene
    function initLights() {
        // main light - we put on top, y = 500
        light = new THREE.SpotLight();
        light.position.set(0, 500, 0);
        light.intensity = 2.0;
        light.castShadow = true;
        scene.add(light);
    }

// knowing where the center is, and some other non-important stuff
    function onWindowResize() {
        windowHalfX = window.innerWidth / 2;
        windowHalfY = window.innerHeight / 2;

        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();

        renderer.setSize(window.innerWidth, window.innerHeight);
    }

// when we move mouse, this gets called (remember mouse events in class?) - we added listener before
    function onDocumentMouseMove(event) {
        mouseX = ( event.clientX - windowHalfX ) / 2;
        mouseY = ( event.clientY - windowHalfY ) / 2;
    }

    function zoomCamera(zoom) {
        var vector = new THREE.Vector3(( event.clientX / window.innerWidth ) * 2 - 1, -( event.clientY / window.innerHeight ) * 2 + 1, 0.5);
        projector.unprojectVector(vector, camera);
        vector.sub(camera.position).normalize();
        vector.multiplyScalar(20 * zoom);
        vector.y = 0;

        camera.position.add(vector);
        target.add(vector);
        light.position.add(vector);
        camera.position.y -= zoom * 10;
        target.y -= zoom * 10;
        floor.position.y -= zoom * 10;
        light.position.y -= zoom * 10;

        render();
    }

// used to show stuff, also updates the camera
    function render() {
        camera.lookAt(target);
        renderer.render(scene, camera);
    }

    function rotateCameraLeft() {
        var offset = new THREE.Vector3(0, 0, 0);
        offset.add(target);
        offset.sub(camera.position);
        offset.applyAxisAngle(new THREE.Vector3(0, 1, 0), Math.PI / 100);
        offset.add(camera.position);

        target = offset;
        camera.lookAt(target);
        render();
    }

    function rotateCameraRight() {
        var offset = new THREE.Vector3(0, 0, 0);
        offset.add(target);
        offset.sub(camera.position);
        offset.applyAxisAngle(new THREE.Vector3(0, 1, 0), -Math.PI / 100);
        offset.add(camera.position);

        target = offset;
        camera.lookAt(target);
        render();
    }

    function rotateCameraUp() {
        var offset = new THREE.Vector3(0, 0, 0);
        var rotationAxis = new THREE.Vector3(0, 0, 0);
        offset.add(target);
        offset.sub(camera.position);
        rotationAxis.crossVectors(offset, new THREE.Vector3(0, 1, 0)).normalize();
        offset.applyAxisAngle(rotationAxis, Math.PI / 72);
        offset.add(camera.position);

        target = offset;

        camera.lookAt(target);
        render();
    }

    function rotateCameraDown() {
        var offset = new THREE.Vector3(0, 0, 0);
        var rotationAxis = new THREE.Vector3(0, 0, 0);
        offset.add(target);
        offset.sub(camera.position);
        rotationAxis.crossVectors(offset, new THREE.Vector3(0, 1, 0)).normalize();
        offset.applyAxisAngle(rotationAxis, -Math.PI / 72);
        offset.add(camera.position);

        target = offset;
        camera.lookAt(target);
        render();
    }


    $('#viewer').onkeypress = function (event) {
        if ($(':focus').length > 0) //this indicates we are in a DOM object which can request focus (i.e. not in viewer or other div)
            return;
        var key = event.keyCode ? event.keyCode : event.which;
        var s = String.fromCharCode(key);
        if (s == 'w')
            zoomInCamera();
        else if (s == 's')
            zoomOutCamera();
        else if (s == 'a')
            rotateCameraLeft();
        else if (s == 'd')
            rotateCameraRight();
    }

    document.onkeydown = function (event) {
        if ($(':focus').length > 0) //this indicates we are in a DOM object which can request focus (i.e. not in viewer or other div)
            return;
        var key = event.keyCode ? event.keyCode : event.which;
        if (key == 38)
            rotateCameraUp();
        else if (key == 40)
            rotateCameraDown();
        else if (key == 37)
            rotateCameraLeft();
        else if (key == 39)
            rotateCameraRight();
    }

    function onDocumentMouseDown(event) {

        event.preventDefault();

        var vector = new THREE.Vector3(( event.clientX / window.innerWidth ) * 2 - 1, -( event.clientY / window.innerHeight ) * 2 + 1, 0.5);
        projector.unprojectVector(vector, camera);

        var raycaster = new THREE.Raycaster(camera.position, vector.sub(camera.position).normalize());

        var intersects = raycaster.intersectObjects(objects);

        // if you clicked on something
        if (intersects.length > 0) {
            // here is the object that was clicked, you can call a function and pass it as a parameter
            intersects[ 0 ].object.material.color.setHex(Math.random() * 0xffffff);
        }

        render();
    }

    function initMouseWheel(){
        var viewer = document.getElementById('viewer');
        if (viewer.addEventListener) {
            // IE9, Chrome, Safari, Opera
            viewer.addEventListener("mousewheel", MouseWheelHandler, false);
            // Firefox
            viewer.addEventListener("DOMMouseScroll", MouseWheelHandler, false);
        }
// IE 6/7/8
        else viewer.attachEvent("onmousewheel", MouseWheelHandler);


    }

    function MouseWheelHandler(e) {
        e.preventDefault();
        // cross-browser wheel delta
        var e = window.event || e;
        var delta = Math.max(-1, Math.min(1, (e.wheelDelta || -e.detail)));
        zoomCamera(delta*5);

        return false;
    }
});

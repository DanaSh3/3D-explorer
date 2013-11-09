/**
 * Created by Aibek on 11/2/13.
 */

$(document).ready(function () {

    fun();

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

// rotating light
    var rotatingLight;

// used when resizing windows and moving mouse, i.e. rotating camera
    var windowHalfX, windowHalfY;
    var mouseX, mouseY;


    var zoom;
    var fov;
    var zoomin = true;
    var target;

    function fun() {
        // initialize everything
        init();
//                setInterval(function(){zoomInCamera()}, 25);
        render();
    }

    function init() {
        // get center of the screen (half of the width/height)
//        windowHalfX = window.innerWidth / 2;
//        windowHalfY = window.innerHeight / 2;

        windowHalfX = $('#viewer').width() / 2;
        windowHalfY =  $('#viewer').height() / 2;

        // initialize mouseX and mouseY
        mouseX = 0;
        mouseY = 0;

        // add mouse move listener (remember we heard about it in class?)
        document.addEventListener('mousemove', onDocumentMouseMove, false);
        document.addEventListener('mousedown', onDocumentMouseDown, false);


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
//        $('#viewer').add(renderer.domElement);             // add renderer to HTML


        // initializing camera - used to show stuff

        camera = new THREE.PerspectiveCamera(60, $('#viewer').width() / $('#viewer').height(), 1, 10000);       // don't worry about parameters
        camera.position.set(0, 300, 0);
        zoom = 1;
        fov = camera.fov;
        target = new THREE.Vector3(0, 0, 0);


        // finally initializing scene - you'll be adding stuff to it
        scene = new THREE.Scene();

        // projector is used for tracing where you click
        projector = new THREE.Projector();
f
        // initializing array for objects being clicked
        objects = new Array()

        // initializing every part of the WebGL - initGUI is optional (that's another library)
        initGeometry();
        initLights();
        //initGUI();                  // gives you little box in the top right corner to manipulate size of the cube
        target.add(cube1.position);
    }

    function initGeometry() {
        cube1 = new THREE.Mesh(
            new THREE.CubeGeometry(25, 25, 25),                           // supply size of the cube
            new THREE.MeshLambertMaterial({color: 0xFF0000}));          // supply color of the cube
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
            new THREE.MeshLambertMaterial({color: 0xFF0000}));          // supply color of the cube
        cube3.position.set(200, 0, -200);
        cube3.castShadow = true;
        cube3.receiveShadow = true;
        scene.add(cube3);
        objects.push(cube3);

        cube4 = new THREE.Mesh(
            new THREE.CubeGeometry(25, 25, 25),                           // supply size of the cube
            new THREE.MeshLambertMaterial({color: 0xFF0000}));          // supply color of the cube
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

        // making a floor - just a plane 500x500, with 10 width/height segments - they affect lightning/reflection I believe
        floor = new THREE.Mesh(
            new THREE.PlaneGeometry(500, 500, 10, 10),
            new THREE.MeshLambertMaterial({color: 0xCEB2B3}));    // color
        floor.receiveShadow = true;
        floor.rotation.x = -Math.PI / 2;                    // make it horizontal, by default planes are vertical
        floor.position.y = -25;                                   // move it a little, to match bottom of the cube
        scene.add(floor);

        // since we will be adding similar walls, we can reuse the geometry and material
        var wallGeometry = new THREE.PlaneGeometry(500, 500, 10, 10);
        var wallMaterial = new THREE.MeshPhongMaterial({color: 0xAAFF66});

        // here is a wall, by default planes are vertical
        wall1 = new THREE.Mesh(wallGeometry, wallMaterial);
        wall1.receiveShadow = true;
        wall1.position.z = -250;                // move it back
        scene.add(wall1);

        // here is a wall, by default planes are vertical
        wall2 = new THREE.Mesh(wallGeometry, wallMaterial);
        wall2.receiveShadow = true;
        wall2.rotation.y = Math.PI / 2;         // rotate to get perpendicular wall
        wall2.position.x = -250;                // move it left
        scene.add(wall2);

        // here is a wall, by default planes are vertical
        wall3 = new THREE.Mesh(wallGeometry, wallMaterial);
        wall3.position.x = 250;                 // move it right
        wall3.rotation.y = -Math.PI / 2;       // rotate to get perpendicular wall
        wall3.receiveShadow = true;
        scene.add(wall3);

        // here is a wall, by default planes are vertical
        wall4 = new THREE.Mesh(wallGeometry, wallMaterial);
        wall4.position.z = 250;                 // move it front
        wall4.rotation.y = Math.PI;             // rotate it 180 degrees, so the "front" will face towards us,
        // otherwise we will "look through" the plane
        wall4.receiveShadow = true;
        scene.add(wall4);


        // feel free to add new stuff or change existing and play around with it!
        // you can comment out scene.add() to remove anything from viewport
    }

// lights tutorial - there has to be light in the scene
    function initLights() {
        // main light - we put on top, y = 500
        light = new THREE.SpotLight();
        light.position.set(0, 500, 0);
        light.intensity = 2.0;
        light.castShadow = true;
        scene.add(light);

        // rotating light that will orbit the cube
        rotatingLight = new THREE.SpotLight();
        rotatingLight.position.set(100, 75, -100);
        rotatingLight.castShadow = true;
        scene.add(rotatingLight);
    }

// little nice GUI from dat.GUI library
// we don't need this, but you can experiment with it
    function initGUI() {
        gui = new dat.GUI();
        gui.add(cube.scale, 'x').min(0.1).max(10).step(0.1);
        gui.add(cube.scale, 'y', 0.1, 10, 0.1);
        gui.add(cube.scale, 'z', 0.1, 10, 0.1);
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


// function that makes everything move around!
    function animate(t) {
        // spin the camera in a circle - before using, comment out the same stuff in render()
        // camera.position.x = Math.sin(t/1000)*150;
        // camera.position.y = 150;
        // camera.position.z = Math.cos(t/1000)*150;


        // updating the animation
        window.requestAnimationFrame(animate, renderer.domElement);

        // show stuff
        // render();
    };

    function zoomInCamera() {
        if (camera.position.distanceTo(target) > 60) {
            var offset = new THREE.Vector3(0, 0, 0);
            var dist = camera.position.distanceTo(target);
            offset.add(camera.position);
            offset.x += (target.x - camera.position.x) / (dist / 10);
            offset.y += (target.y - camera.position.y) / (dist / 10);
            offset.z += (target.z - camera.position.z) / (dist / 10);
            camera.position = offset;
            render();
        }

    }

    function zoomOutCamera() {
        var offset = new THREE.Vector3(0, 0, 0);
        var dist = camera.position.distanceTo(target);
        offset.add(camera.position);
        offset.x -= (target.x - camera.position.x) / (dist / 10);
        offset.y -= (target.y - camera.position.y) / (dist / 10);
        offset.z -= (target.z - camera.position.z) / (dist / 10);
        camera.position.set(offset.x, offset.y, offset.z);
        render();
    }

// used to show stuff, also updates the camera
    function render() {
        // horizontal mouse move is used to rotate around center
        // vertical mouse move is used to move up and down
        // camera.position.x = Math.sin(mouseX/100)*150;
        // camera.position.z = Math.cos(mouseX/100)*150;
        // camera.position.y = 200 + mouseY/2;


        // tell camera to look at the center of the scene

        camera.lookAt(target);


        // use animation
        // animate(new Date().getTime());


        // you can use vector to tell specific location like this:
        // camera.lookAt(new THREE.Vector3(0,0,0));

        // finally render the scene, via the camera you specified
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

//function moveCameraForward()
//{
//    var offset = new THREE.Vector3(0,0,0);
//    var dist = camera.position.distanceTo(target);
//    offset.add(camera.position);
//    offset.x -= (target.x - camera.position.x) / (dist / 10);
//    offset.y -= (target.y - camera.position.y) / (dist / 10);
//    offset.z -= (target.z - camera.position.z) / (dist / 10);
//    camera.position.set(offset.x, offset.y, offset.z);
//    render();
//}


    document.onkeypress = function (event) {
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


    function jump(object, t) {
        object.position.y += Math.cos(t) * 25;

    }

    function flyTo(object) {
        var vector = new THREE.Vector3();
        vector.add(object.position);
//    alert(vector.x + " " + vector.y + " " + vector.z);
//    var dist = target.distanceTo(vector);
//    while (dist >= 1)
//    {
//        target.sub(target.divideScalar(target.length));
//        target.add(vector.divideScalar(vector.length));
//        dist = target.distanceTo(vector);
//        camera.lookAt(target);
//        render();
//    }

//    camera.lookAt(new THREE.Vector3(100,100,100));
//    render();
    }

});
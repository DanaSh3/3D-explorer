/**
 * Created by Aibek on 11/2/13.
 */

$(document).ready(function () {

// important stuff: renderer - it shows everything and is appended to HTML
    var renderer;

// important stuff: camera - where to look
    var camera;
    var cameraTarget;

// important stuff: scene - you add everything to it
    var scene;

    var projector;

    var objects;

// the outer shell of a folder
    var shell;

    var orbit_array = new Array();

// variable for stationary cube in the center
    var cube;
    var variableMaterial;

    var c_o;

// variable for texture
    var starTexture;
//  global shell
    var globalShell;

    var fixedMaterial;

// main light
    var light, ambientLight;

// used when resizing windows and moving mouse, i.e. rotating camera
    var windowHalfX, windowHalfY;
    var mouseX, mouseY;
    var dragging;
    var prevDrag;

    // initialize and render

    var RADIUS = 12; // of spheres
    var X1 = 20;
    var X2 = 20;
    var BUFF_DIST = 6*RADIUS;
    var total= 5; //change this to any number

    init();
    render();

    function init() {
        // get center of the screen (half of the width/height)
        windowHalfX = $('#viewer').width() / 2;
        windowHalfY =  $('#viewer').height() / 2;

        // initialize mouseX and mouseY
        mouseX = 0;
        mouseY = 0;

        dragging = false;
        prevDrag = new THREE.Vector3(0,0,0);

        // add mouse move listener (remember we heard about it in class?)
        var viewer = document.getElementById('viewer');
//        viewer.addEventListener('mousemove', onDocumentMouseMove, false);
//        viewer.addEventListener('mousedown', onDocumentMouseDown, false);
//        viewer.addEventListener('mouseup', onDocumentMouseUp, false);
//        viewer.addEventListener('mouseleave', onDocumentMouseLeave, false);


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
        cameraTarget = new THREE.Vector3(0, 0, 100);

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
        starTexture = new THREE.ImageUtils.loadTexture('/images/stars_512.jpg', {}, function (){
            renderer.render(scene, camera);
        });
        starTexture.wrapS = starTexture.wrapT = THREE.RepeatWrapping;
        starTexture.repeat.set( 10, 10 );
        starTexture.needsUpdate = true;

        variableMaterial = new THREE.MeshLambertMaterial({map: starTexture, side: THREE.DoubleSide, transparent: true, opacity: 1.0});
        var starGeometry = new THREE.SphereGeometry(1000, 32, 32);
        shell = new THREE.Mesh(starGeometry, variableMaterial);
        scene.add(shell);

        fixedMaterial = new THREE.MeshLambertMaterial({map: starTexture, side: THREE.DoubleSide});
        globalShell = new THREE.Mesh(new THREE.SphereGeometry(4000, 32, 32), fixedMaterial);
        scene.add(globalShell);
        }

    function circle_orbit_obj(arr) {
        var size_count = 0;
        var orbit_count = 0;

        this.insert = insert;
        function insert(elem) {
            if (orbit_count === 0) {
                arr[0] = [];
                arr[0][0] = elem;
                initSphere(elem, 0, 0);
                orbit_count++;
            }
            else{
                if (arr[orbit_count] === undefined)
                {
                    arr[orbit_count] = new Array();
                    alert("new orbit created!");
                }

                arr[orbit_count].push(elem);
                initSphere( elem,
                    position_helper(orbit_count, arr[orbit_count].length, 'x', BUFF_DIST),
                    position_helper(orbit_count, arr[orbit_count].length, 'y', BUFF_DIST));

                if(arr[orbit_count].length === orbit_count*5) {
                    orbit_count++;
                }
            }
            size_count++;
            alert(size_count);
        }

        this.remove = remove;
        function remove() {
            if(size_count === 0) return;
            if ( arr[orbit_count] === undefined || arr[orbit_count].length === 0) {
                arr.pop();
                orbit_count--;
            }
            scene.remove(arr[orbit_count].pop());
            size_count--;
        }

        this.getLast = getLast;
        function getLast() {
            var ret;
            if (arr[orbit_count] === undefined) {
                //ret = arr[orbit_count-1][arr[orbit_count-1].length-1];
                ret = arr[orbit_count-1].pop();
                arr[orbit_count-1].push(ret);
            }
            else {
                //ret = arr[orbit_count][arr[orbit_count].length-1];
                ret = arr[orbit_count].pop();
                arr[orbit_count].push(ret);
            }
            return ret;
        }
    }

    function makeSphere() {
            var ret = new THREE.Mesh(
                new THREE.SphereGeometry(RADIUS, X1, X2),
                new THREE.MeshLambertMaterial({color: 0xFF0000}));
            return ret;
        }

    function initSphere(elem, pos_x, pos_y) {
        //alert("init! init!");
        elem.position.set(pos_x, 0, pos_y);         // set position by params
        elem.castShadow = true;
        elem.receiveShadow = true;
        scene.add(elem);
        objects.push(elem);                         // make click-able
    }

    function position_helper(obt, cnt, pos, rad) { // orbit, count: number in orbit, pos: 'x' or 'y', rad-BUFF_DIST
        var n;
        n = obt*5

        switch (pos)
        {
            case 'x':
                return obt*rad*Math.cos(cnt*((2*Math.PI)/n));
            case 'y':
                return obt*rad*Math.sin(cnt*((2*Math.PI)/n));
        }
    }

// lights tutorial - there has to be light in the scene
    function initLights() {
        // main light - we put on top, y = 500
        light = new THREE.SpotLight();
        light.position.set(0, 500, 0);
        light.intensity = 5.0;
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
        cameraTarget.add(vector);
        light.position.add(vector);
        light.target.position.add(vector);
        camera.position.y -= zoom * 10;
        cameraTarget.y -= zoom * 10;
        light.position.y -= zoom * 10;
        light.target.position.y -= zoom * 10;

        render();
    }

// used to show stuff, also updates the camera
    function render() {
        camera.lookAt(cameraTarget);
        renderer.render(scene, camera);
    }

    function rotateCameraLeft() {
        var offset = new THREE.Vector3(0, 0, 0);
        offset.add(cameraTarget);
        offset.sub(camera.position);
        offset.applyAxisAngle(new THREE.Vector3(0, 1, 0), Math.PI / 100);
        offset.add(camera.position);

        cameraTarget = offset;
        camera.lookAt(cameraTarget);
        render();
    }

    function rotateCameraRight() {
        var offset = new THREE.Vector3(0, 0, 0);
        offset.add(cameraTarget);
        offset.sub(camera.position);
        offset.applyAxisAngle(new THREE.Vector3(0, 1, 0), -Math.PI / 100);
        offset.add(camera.position);

        cameraTarget = offset;
        camera.lookAt(cameraTarget);
        render();
    }

    function rotateCameraUp() {
        var offset = new THREE.Vector3(0, 0, 0);
        var rotationAxis = new THREE.Vector3(0, 0, 0);
        offset.add(cameraTarget);
        offset.sub(camera.position);
        rotationAxis.crossVectors(offset, new THREE.Vector3(0, 1, 0)).normalize();
        offset.applyAxisAngle(rotationAxis, Math.PI / 72);
        offset.add(camera.position);

        cameraTarget = offset;

        camera.lookAt(cameraTarget);
        render();
    }

    function rotateCameraDown() {
        var offset = new THREE.Vector3(0, 0, 0);
        var rotationAxis = new THREE.Vector3(0, 0, 0);
        offset.add(cameraTarget);
        offset.sub(camera.position);
        rotationAxis.crossVectors(offset, new THREE.Vector3(0, 1, 0)).normalize();
        offset.applyAxisAngle(rotationAxis, -Math.PI / 72);
        offset.add(camera.position);

        cameraTarget = offset;
        camera.lookAt(cameraTarget);
        render();
    }

    function inc_spheres() {
        total++;
        c_o.insert(makeSphere());
        render();
    }
    function dec_spheres() {
        total--;
        c_o.remove();
        render();
    }


    //$('#viewer').onkeypress = function (event) {
    document.onkeypress = function (event) {
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
        else if (s == '=')
            inc_spheres();
        else if (s == '-')
            dec_spheres();
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

        dragging = true;
        prevDrag = vector;
        prevDrag.y = 0;

        render();
    });

    $('#viewer').mouseup(function (event){
        dragging = false;
        prevDrag = null;
    });

    $('#viewer').mouseout(function (event){
        dragging = false;
        prevDrag = null;
    });

    // when we move mouse, this gets called (remember mouse events in class?) - we added listener before
    $('#viewer').mousemove(function (event) {
        mouseX = ( event.clientX - windowHalfX ) / 2;
        mouseY = ( event.clientY - windowHalfY ) / 2;

        if (dragging)
        {
            var vector = new THREE.Vector3(( event.clientX / window.innerWidth ) * 2 - 1, -( event.clientY / window.innerHeight ) * 2 + 1, 0.5);
            projector.unprojectVector(vector, camera);
            vector.sub(camera.position).normalize();
            vector.y = 0;

            var temp = new THREE.Vector3(0,0,0);
            temp.add(vector);

            vector.sub(prevDrag);
            vector.multiplyScalar(-400);

            camera.position.add(vector);
            cameraTarget.add(vector);
            light.position.add(vector);
            light.target.position.add(vector);

            prevDrag = temp;
            render();
        }
    });

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

        var distance = camera.position.distanceTo(shell.position);
        if (distance < 3000 && distance > 999)
            shell.material.opacity = (distance - 1000) / 2000;
        else
            shell.material.opacity = 1.0;

        var index = jQuery.inArray(shell, objects);
        if (index === -1 && distance > 2600)
            objects.push(shell);
        else if (index !== -1 && distance < 2600)
            delete(objects[index]);
        render();
        return false;
    }
});

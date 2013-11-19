/**
 * Created by Aibek on 11/2/13.
 */

var objects;
var homeFolder;
var folders = new Array();

var initSockets3D;
var lookUpFolderByName;
var makeSphere;
var folder;

var globalTest;

$(document).ready(function () {

// important stuff: renderer - it shows everything and is appended to HTML
    var renderer;

// important stuff: camera - where to look
    var camera;
    var cameraTarget;

// important stuff: scene - you add everything to it
    var scene;

    var projector;

//  objects user can click on - folders and files
//    var objects;

//  filenames corresponding to objects
    var filenames = new Array();

// the outer shell of a folder
    var shell;

    var folder_array = new Array();
    var orbit_array = new Array();
    var cubelist = new Array();

// variable for stationary cube in the center
    var cube;
    var variableMaterial;

    var c_o;

// variable for texture
    var starTexture;
//  global shell
    var globalShell;

    var outerShellMaterial;

// main light
    var light, ambientLight;

// used when resizing windows and moving mouse, i.e. rotating camera
    var windowHalfX, windowHalfY;
    var mouseX, mouseY;
    var dragging;
    var prevDrag;

    // initialize and render

    var SIDE = 25;  // of cube
    var RADIUS = 100; // of spheres
    var X1 = 20;
    var X2 = 20;
    var BUFF_DIST = 6*RADIUS;
    var total= 0; //change this to any number


    // for file system

    var files = new Array();
    var FID = 0;
    var home = "/home";
    var currentDepth = 0;
    var currentFolder = {};

    // for hovering foldernames

    var updateFcts = [];
    var planes = [];

    // animating folders
    var animated = [];

    init();
    animate(new Date().getTime());
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

        // viewer object
        var viewer = document.getElementById('viewer');

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
        camera.position.set(400, 500, 400);
        cameraTarget = new THREE.Vector3(0, 0, 0);

        // finally initializing scene - you'll be adding stuff to it
        scene = new THREE.Scene();

        // for dynamic window resize
        THREEx.WindowResize(renderer, camera);

        // projector is used for tracing where you click
        projector = new THREE.Projector();

        // initializing array for objects being clicked
        objects = new Array()

        // initializing every part of the WebGL - initGUI is optional (that's another library)
        initGeometry();
        initLights();
        initMouseWheel();
    }

    var T;

    function initGeometry() {
        starTexture = new THREE.ImageUtils.loadTexture('/images/outer_space_512.jpg', {}, function (){});
        starTexture.wrapS = starTexture.wrapT = THREE.RepeatWrapping;
        starTexture.repeat.set( 10, 10 );
        starTexture.needsUpdate = true;

        variableMaterial = new THREE.MeshLambertMaterial({map: starTexture, side: THREE.DoubleSide, transparent: true, opacity: 1.0});
        outerShellMaterial = new THREE.MeshLambertMaterial({map: starTexture, side: THREE.DoubleSide});

        globalShell = new THREE.Mesh(new THREE.SphereGeometry(5000, 32, 32), outerShellMaterial);
        scene.add(globalShell);
    }


// lights tutorial - there has to be light in the scene
    function initLights() {
        // main light - we put on top, y = 500
        light = new THREE.SpotLight();
        light.position.set(0, 500, 0);
        light.target.position.set(0, -500, 0);
        light.intensity = 2.0;
        light.castShadow = true;
//        light = new THREE.PointLight();
//        light.position.set(0, 200, 0);
        scene.add(light);

        var topLight = new THREE.PointLight(0xffffff, 2.0);
        topLight.position.set(0, globalShell.geometry.radius * 0.9, 0);
        console.log("INITIALIZING LIGHTS");
        console.log("Radius: " + globalShell.geometry.radius );
//        scene.add(topLight);

        makeLight(0, 0, globalShell.geometry.radius);

        ambientLight = new THREE.AmbientLight(0x404040);
        scene.add(ambientLight);
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
//        light.position.add(vector);
//        light.target.position.add(vector);
        camera.position.y -= zoom * 10;
        cameraTarget.y -= zoom * 10;
//        light.position.y -= zoom * 10;
//        light.target.position.y -= zoom * 10;

        updateText();
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

    document.onkeypress = function (event) {
        if ($(':focus').length > 0) //this indicates we are in a DOM object which can request focus (i.e. not in viewer or other div)
            return;
        var key = event.keyCode ? event.keyCode : event.which;
        var s = String.fromCharCode(key);
        if (s == 'w')
            zoomCamera(3);
        else if (s == 's')
            zoomCamera(-3);
        else if (s == 'a')
            rotateCameraLeft();
        else if (s == 'd')
            rotateCameraRight();
        else if (s == '=')
            addFolder();
        else if (s == '-')
            dec_spheres();
        else if (s == '[')
            inc_cubes();
        else if (s == ']')
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

    $('#viewer').mousedown(function (event){

        event.preventDefault();

        var vector = new THREE.Vector3(( event.clientX / window.innerWidth ) * 2 - 1, -( event.clientY / window.innerHeight ) * 2 + 1, 0.5);
        projector.unprojectVector(vector, camera);

        var raycaster = new THREE.Raycaster(camera.position, vector.sub(camera.position).normalize());

        var intersects = raycaster.intersectObjects(objects);

        // if you clicked on something
        if (intersects.length > 0) {
            // here is the object that was clicked, you can call a function and pass it as a parameter
//            intersects[ 0 ].object.material.color.setHex(Math.random() * 0xffffff);
//            console.log("1");
            if (intersects[0].object.material.opacity < 0.95 && intersects[ 1 ] !== undefined)
                objectClicked(intersects[ 1 ].object);
            else
                objectClicked(intersects[ 0 ].object);
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
            vector.multiplyScalar(-1000 / Math.pow(3, currentDepth));

            camera.position.add(vector);
            cameraTarget.add(vector);

            prevDrag = temp;

            checkDistance();
            updateText();
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

        if (checkDistance())
            zoomCamera(delta*(10 / Math.pow(3, currentDepth)));
        else if (delta > 0)
            zoomCamera(delta*(10 / Math.pow(3, currentDepth)));

        render();

        return false;
    }

    function animate(t) {
        for (var i = 0; i < cubelist.length; i++)
        {
            cubelist[i].rotation.x = (t+i*200)/2000;
            cubelist[i].rotation.y = (t+i*500)/2000;
            cubelist[i].rotation.z = (t+i*100)/2000;
        }
        window.requestAnimationFrame(animate, renderer.domElement);
        render();
    }

    var distanceBuffer = [];
    function checkDistance()
    {
        if (currentDepth === 0 && camera.position.distanceTo(new THREE.Vector3(0,0,0)) >= (globalShell.geometry.radius - 100))
            return false;

        for (var i = 0; i < folders.length; i++)
        {
            var distance = camera.position.distanceTo(objects[i].position);
            if (distance < 6 * objects[i].geometry.radius && distance > objects[i].geometry.radius - 1)
            {
               objects[i].material.opacity = (distance - objects[i].geometry.radius) / 6 / objects[i].geometry.radius;
               if (lookUpFolderByID(i).children.length === 0)
                   lookUpFolderByID(i).loadChildren();
            }
            else
                objects[i].material.opacity = 1.0;

            if (distance < objects[i].geometry.radius && objects[i] !== globalShell)
                distanceBuffer.push(folders[i]);
        }

        if (distanceBuffer.length === 0)
            currentFolder = homeFolder;
        else
            currentFolder = distanceBuffer.pop();
        currentDepth =  currentFolder.depth;
        distanceBuffer.length = 0;
        return true;
    }

    function showHelloMessage()
    {
        var msg = "Hello! Press:\n";
        msg += " + and - to add and remove folders\n";
        msg += " [ and ] to add and remove files\n";
        msg += " + and - to add and remove folders\n";
        msg += " 'left' and 'right' to rotate camera left and right\n";
        msg += " 'up' and 'down' to rotate camera up and down\n";
        msg += "Supports:\n";
        msg += " Mouse Scroll - Zoom In/Out\n";
        msg += " Mouse Hold and Move - Drag\n";
        msg += "Features (Now):\n";
        msg += " transparent parent folder\n";
        msg += " change color of the subfolders\n";
        msg += " navigation via side panel\n";
        msg += " add folder via side panel\n";
        msg += " remove folder via side panel\n";
        setTimeout(function(){alert(msg)}, 500);
    }

    function objectClicked(object)
    {
        if (object === globalShell)
            return;

        var offset = 0;
        var animation = true;
        var initPos = object.position.y;

        if (animated.indexOf(objects.indexOf(object)) !== -1)       // Already being animated
            return;

        animated.push(objects.indexOf(object));

        setTimeout(stopAnimation, 1000);
        animateSphere();

        function animateSphere()
        {
            if (animation === true)
            {
                object.position.y = initPos + Math.sin(offset += Math.PI / 18) * 10;
                render();
                setTimeout(animateSphere, 10);
            }
        }

        function stopAnimation()
        {
            animation = false;
            object.position.y = initPos;
            animated = jQuery.grep(animated, function(value) {
                return value != objects.indexOf(object);
            });
        }
    }


    /* ---------------------------------------- SOCKETS IMPLEMENTATION ----------------------------------*/


    initSockets3D = function ()
    {
        filenames.push(home);
        homeFolder = new folder(FID++, "Home", 0, 0, globalShell.geometry.radius, home, 0);
        folders.push(homeFolder);
        objects.push(globalShell);
        homeFolder.loadChildren();
        currentFolder = homeFolder;

        socket.on('showfiles3D', function (data) {
//            console.log("DIR: " + data.dir + "\nFID: " + data.fid + "\nFILES: " + data.files.length + "\nDIRS: " + data.isDir.length + "\nDEPTH: " + data.depth);
            if(data.files.length) {
                for (var i = 0; i < data.files.length; i++){
                    var rad = 600 / (Math.pow(5, data.depth));
                    if(data.isDir[i]){
                        lookUpFolderByID(data.fid).insert(data.files[i], true, makeSphere(rad), rad);
                    }else{
                        var side = 600 / (Math.pow(5, data.depth));
                        lookUpFolderByID(data.fid).insert(data.files[i], true, makeCube(side), rad);
                    }
                    filenames.push(data.files[i]);
                }
            }
        });

        socket.on('dirCreated', function (data){
            homeFolder.insert(data.dir, true, makeSphere(500), 500);
        });
    }

    function lookUpFolderByID (fid)
    {
        for (var f = 0; f < folders.length; f++)
           if (folders[f].fid === fid)
            return folders[f];
        return null;
    }

    lookUpFolderByName = function(path)
    {
        for (var f = 0; f < folders.length; f++)
            if (folders[f].path === path)
                return folders[f];
        return null;
    }

   folder = function (fid, foldername, centerX, centerY, radius, path, depth, isDir) {
        this.fid = fid;
        this.foldername = foldername;
        this.files = files;
        this.centerX = centerX;
        this.centerY = centerY;
        this.radius = radius;
        this.path = path;
        this.depth = depth;
        this.isDir = isDir;
        this.children = [];
        this.size_count = 0;
        this.orbit_count = 0;
        this.arr = new Array();

        this.loadChildren = function(){
            makeLight(this.centerX, this.centerY, this.radius);
            socket.emit('showdir3D', { dir: this.path, fid: this.fid, depth: this.depth});
        }

        this.insert = function (insertFilename, insertIsDir, elem, rad) {
            if (this.arr[this.orbit_count] === undefined)
                this.arr[this.orbit_count] = new Array();
            if (this.orbit_count === 0) {
                this.arr[0] = [];
                this.arr[0][0] = elem;
                initElement(elem, this.centerX, this.centerY, this.foldername);
                initText(elem, insertFilename, rad);
                var newFolder = new folder(FID++, insertFilename, this.centerX, this.centerY, rad, this.path + "/" + insertFilename, this.depth+1, insertIsDir);
                folders.push(newFolder);
                this.children.push(newFolder);
                this.orbit_count++;
            }
            else{
                this.arr[this.orbit_count].push(elem);

                var insX = this.centerX + position_helper(this.orbit_count, this.arr[this.orbit_count].length, 'x', 2.5 * rad);
                var insY = this.centerY + position_helper(this.orbit_count, this.arr[this.orbit_count].length, 'y', 2.5 * rad);
                initElement( elem, insX, insY, this.foldername);
                initText(elem, insertFilename, rad);

                if(this.arr[this.orbit_count].length === this.orbit_count*5)
                    this.orbit_count++;
//                    console.log("Inserting into FID: " + this.fid + " X:Y "  + insX + " : " + insY);
                var newFolder = new folder(FID++, insertFilename, insX, insY, rad, this.path + "/" + insertFilename, this.depth+1, insertIsDir);
                folders.push(newFolder);
                this.children.push(newFolder);
            }
            this.size_count++;
        }

        this.remove = function() {
            if(this.size_count === 0) return;

            if ( this.arr[this.orbit_count] === undefined || arr[this.orbit_count].length === 0) {
                this.arr.pop();
                this.orbit_count--;
            }
            var ret = this.arr[this.orbit_count].pop();
            scene.remove(ret);
            this.size_count--;
            return ret;
        }
    }

    makeSphere = function(rad) {
        if (rad === 0)
            rad = RADIUS;
        var ret = new THREE.Mesh(
            new THREE.SphereGeometry(rad, X1, X2), new THREE.MeshLambertMaterial({map: starTexture, side: THREE.DoubleSide, transparent: true, opacity: 1.0}));
        ret.material.color.setHex(Math.random() * 0xffffff);
        return ret;
    }

    function makeCube(side) {
        var ret = new THREE.Mesh(
            new THREE.CubeGeometry(side, side, side), new THREE.MeshLambertMaterial({map: starTexture, side: THREE.DoubleSide}));
        ret.material.color.setHex(Math.random() * 0xffffff);
        cubelist.push(ret);
        return ret;
    }

    function makeLight(centerX, centerY, radius) {
        var light = new THREE.PointLight(0xffffff, 3.0);
        light.position.set(centerX, radius * 0.9, centerY);
        scene.add(light);
    }

    function initElement(elem, pos_x, pos_y, name) {
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


    function initText(elem, name, rad){
        //////////////////////////////////////////////////////////////////////////////////
        //		build the texture						//
        //////////////////////////////////////////////////////////////////////////////////

        var arr = name.split('/');
        name = arr[arr.length-1];

        var canvas        = document.createElement( 'canvas' );
        canvas.width        = name.length * 35;
        canvas.height        = 60;
        var context        = canvas.getContext( '2d' );
        context.font        = "bolder 50px Verdana";
        context.textAlign = 'center';
        context.fillStyle = 'black';
        context.fillText(name, canvas.width / 2, 50/2+canvas.height/2);
        var texture = new THREE.Texture( canvas );
        texture.needsUpdate        = true;
        texture.anisotropy        = 16

        var geometry	= new THREE.PlaneGeometry(canvas.width, canvas.height);
        var material	= new THREE.MeshBasicMaterial();

        material.map	= texture;
        material.side	= THREE.DoubleSide;

        var plane = new THREE.Mesh(geometry, material);
        plane.position.set(elem.position.x, elem.position.y, elem.position.z);
        plane.position.y += 1.1 * rad;

        scene.add(plane);
        planes.push(plane);

        THREEx.Transparency.init(planes);
        updateFcts.push(function(delta, now){
            THREEx.Transparency.update(planes, camera)
        })
    }

    function updateText ()
    {
        for (var i = 0; i < planes.length; i++)
        {
            planes[i].rotation.y = 0;

            var startVector = new THREE.Vector3(0,0,1);
            startVector.applyAxisAngle(new THREE.Vector3(0,1,0), Math.PI);

            var cameraDirection = new THREE.Vector3(1,0,0);
            cameraDirection.subVectors(camera.position, planes[i].position);

            var angle = startVector.angleTo(cameraDirection);

            if (cameraDirection.x < 0)
                planes[i].rotation.y = 135 + angle;
            else
                planes[i].rotation.y = 135 - angle;
        }
    }

});

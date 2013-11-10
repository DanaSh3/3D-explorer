function Tree() {
    this.root = null;
}

function Node(filename, isFile) {
    this.filename = filename;
    this.isFile = isFile;

    if (isFile === false)
    {
        this.children = new Array();
        this.isDir = true;
    }
    else if (isFile === true)
    {
        this.children = null;
        this.isDir = false;
    }
    else
        console.log("Enter a boolean for isFile parameter");
}

Tree.prototype = {
    insert: function(filename, isFile){
        var node = new Node(filename, isFile);

        var currentNode;

        if (this.root === null){
            this.root = node;
        }
        else {
            currentNode = this.root;

            if(currentNode) {
               alert("NO Child");
            }
            else {
                currentNode.name = filename;
                currentNode.hasChildren = true;
            }
        }
    }

}


function Treeble () {
    var T = new Tree();

    if(T.root === null) {
        T.insert("home", false);
    }

    socket.emit('children', {dir: '/home'});
    socket.on('showlength', function(data) {
//        alert(data.files[0]);
        for (var i = 0; i < data.size; i++)
            T.root.children.push(new Node(data.files[i], false));
    });
    return T;
}



function CheckFile (Tree) {
   var isFile = true;
   socket.on('listChilds', function(data) {
      var files = data.files;
       $('#display_contents').html('');
           if(files) {
               for( var i = 0; i < files.length; i++) {
                   if(data.isDir()) {
                     //  $('#display_contents').append('<div class="subfolder" id="' + files[i] + '"><p>' + files[i] + '</p></div>');
                       isFile = false;
                       alert(isFile);

                   }
                 //  else{
                     //  $('#display_contents').append('<div class="subfiles" id="' + files[i] + '"><p>' + files[i] + '</p></div>');
                 //  }
               }
           }
   });
}

$('#show_tree').click(function(e){
    var over = Treeble();
    var html = '';
    setTimeout(function() {
        for(var i = 0; i < over.root.children.length; i++) {
            html+= over.root.children[i].filename;
            html+= '\n';
        }
    alert(html);
    }, 500);
});

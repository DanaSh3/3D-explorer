function Tree() {
    this.root = null;
}

function Node(filename, isDir) {
    this.filename = filename;
    this.isDir = isDir;

    if (isDir === true)
    {
        this.children = new Array();
        this.isDir = true;
    }
    else if (isDir === false)
    {
        this.children = null;
        this.isDir = false;
    }
    else
        console.log("Enter a boolean for isDir parameter");
}

Tree.prototype = {
    insert: function(filename, isDir){
        var node = new Node(filename, isDir);

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

function fillChildren(filename, node)
{
    socket.emit('children', {dir: filename});
    socket.on('getchildren', function(data) {
        alert("FILENAME: " + node.filename + " " + data.msg);
        for (var i = 0; i < data.files.length; i++)
        {
            node.children.push(new Node(data.files[i], data.isDir[i]));
        }
    });
}

var T;

function initTree () {
    T = new Tree();

    if(T.root === null) {
        T.insert("home", true);
    }
    fillChildren("/home", T.root);

    setTimeout(function(){
        for (var i = 0; i < T.root.children.length; i++)
        {
            fillChildren("/home/" + T.root.children[i].filename, T.root.children[i]);
        }
    },500);

    return T;
}

//$('#show_tree').click(function(e){initTree();
//    var html = '';
//    setTimeout(function() {
//        for(var i = 0; i < T.root.children.length; i++) {
//            html += T.root.children[i].filename + " ";
//            html += T.root.children[i].isDir + " #";
//            if (T.root.children[i].children !== null)
//                html += T.root.children[i].children.length;
//            html += '\n';
//        }
//        alert(html);
//    }, 500);
//});
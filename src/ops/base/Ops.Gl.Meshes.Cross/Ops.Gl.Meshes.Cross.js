const render = op.inFunction('render');
const extend = op.inValue('extend',1.0);
const thick = op.inValue('thicker',0.25);
const target = op.inValueBool('Crosshair');
const active = op.inValueBool('Draw',true);

const trigger = op.outFunction('trigger');
const geomOut = op.outObject("geometry");

const cgl= op.patch.cgl;
var geom = null;
var mesh = null;

render.onTriggered=function()
{
    if(!mesh)buildMesh();
    if(active.get() && mesh) mesh.render(cgl.getShader());
    trigger.trigger();
};


function buildMesh()
{
    if(!geom)geom=new CGL.Geometry("cubemesh");
    geom.clear();
    
    var ext = extend.get();
    var thi = thick.get();

    if (thi < 0.0) 
    {
        thi = 0.0;
    }
    else if (thi > ext) 
    {
        thi = ext;
    }

    if (ext < 0.0) 
    {
        ext = 0.0;
        thi = 0.0;
    }

    //center verts
    var cx = thi;
    var cy = thi ;

    //o is outer verts from center
    var ox = ext ;
    var oy = ext ;


    geom.vertices = [
        //center piece
        -cx,-cy,0,          //0
        -cx,cy,0,           //1
        cx, cy,0,           //2
        cx,-cy,0,           //3
        
        //left piece
        -ox,-cy,0,          //4
        -ox,cy,0,           //5
        -cx,cy,0,           //6
        -cx,-cy,0,          //7
        
        //right piece
        cx,-cy,0,           //8
        cx,cy,0,            //9
        ox,cy,0,            //10
        ox,-cy,0,           //11
        
        //top piece
        -cx,cy,0,           //12
        -cx,oy,0,           //13
        cx, oy,0,           //14
        cx,cy,0,            //15
        
        //bottom piece
        -cx,-oy,0,          //12
        -cx,-cy,0,          //13
        cx, -cy,0,          //14
        cx,-oy,0            //15

        ];

    var texCoords = [];
    texCoords.length = (geom.vertices.length / 3.0) * 2.0;

    for (var i = 0; i < geom.vertices.length;i += 3)
    {
        var vx = (geom.vertices[i] / (ox) + 1) / 2;
        var vy = (geom.vertices[i+1] / (oy) + 1) / 2;
        var index = (i / 3.0) * 2.0;

        texCoords[index] = vx;
        texCoords[index+1] = vy;
    }

    geom.setTexCoords(texCoords);

    geom.vertexNormals = [
        //center piece
        0.0,0.0,1.0,
        0.0,0.0,1.0,
        0.0,0.0,1.0,
        0.0,0.0,1.0,
        
        //left
        0.0,0.0,1.0,
        0.0,0.0,1.0,
        0.0,0.0,1.0,
        0.0,0.0,1.0,
        //right
        0.0,0.0,1.0,
        0.0,0.0,1.0,
        0.0,0.0,1.0,
        0.0,0.0,1.0,
        //top
        0.0,0.0,1.0,
        0.0,0.0,1.0,
        0.0,0.0,1.0,
        0.0,0.0,1.0,
        //bottom
        0.0,0.0,1.0,
        0.0,0.0,1.0,
        0.0,0.0,1.0,
        0.0,0.0,1.0
        ];

    if(target.get() == true )
    {
        //draws a crosshair
        geom.verticesIndices = [
        //left
        4,5,6,      4,6,7,
        //right
        8,9,10,     8,10,11,
        //top
        12,13,14,   12,14,15,
        //bottom
        16,17,18,   16,18,19
        ];
    }
    else
    {
        //draws a solid cross
        geom.verticesIndices = [
        //center
        0,1,2, 0,2,3,
        //left
        4,5,6,      4,6,7,
        //right
        8,9,10,     8,10,11,
        //top
        12,13,14,   12,14,15,
        //bottom
        16,17,18,   16,18,19
        ];
    }

    mesh=new CGL.Mesh(cgl,geom);
    geomOut.set(null);
    geomOut.set(geom);
}

function buildMeshLater()
{
    if(mesh)mesh.dispose();
    mesh = null;
}

extend.onChange =
    thick.onChange = 
    target.onChange = buildMeshLater;

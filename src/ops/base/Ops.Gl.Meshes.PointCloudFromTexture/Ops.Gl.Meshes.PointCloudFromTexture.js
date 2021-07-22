const
    render = op.inTrigger("render"),
    inNum = op.inInt("Num Points", 0),
    inAxis = op.inSwitch("Axis", ["XYZ", "XY"], "XYZ"),
    inTex = op.inTexture("Texture", null, "texture"),
    inTexPS = op.inTexture("Point Size", null, "texture"),
    inNorm = op.inBool("Normalize", false),
    // inMode = op.inSwitch("Mode", ["Absolute", "Add"], "Absolute"),
    trigger = op.outTrigger("Trigger");

const cgl = op.patch.cgl;
// let inTexUniform = null;
let mesh = null;
let numVerts = 0;

const mod = new CGL.ShaderModifier(cgl, op.name);
mod.addModule({
    "priority": 2,
    "title": op.name,
    "name": "MODULE_VERTEX_POSITION",
    "srcHeadVert": "",
    "srcBodyVert": attachments.vertposbody_vert
});

mod.addUniformVert("t", "MOD_tex");
mod.addUniformVert("t", "MOD_texPointSize");
// inMode.onChange = updateDefines;
render.onTriggered = doRender;
updateDefines();

mod.addUniformVert("f", "MOD_texSize", 0);

inNorm.onChange =
    inTexPS.onChange =
    inAxis.onChange = updateDefines;

inTex.onChange =
inNum.onChange = setupMesh;
setupMesh();
updateDefines();

function updateDefines()
{
    mod.toggleDefine("MOD_AXIS_XY", inAxis.get() == "XY");
    mod.toggleDefine("MOD_AXIS_XYZ", inAxis.get() == "XYZ");

    mod.toggleDefine("MOD_NORMALIZE", inNorm.get());

    mod.toggleDefine("MOD_HAS_PS_TEX", inTexPS.get());
}

function doRender()
{
    mod.bind();
    if (!inTex.get() || !inTex.get().tex) return;
    if (inTex.get())mod.pushTexture("MOD_tex", inTex.get().tex);
    if (inTexPS.get())mod.pushTexture("MOD_texPointSize", inTexPS.get().tex);

    mod.setUniformValue("MOD_texSize", inTex.get().width + 1);

    if (numVerts > 0 && inNum.get() >= 0 && mesh) mesh.render(cgl.getShader());

    trigger.trigger();
    mod.unbind();
}

function setupMesh()
{
    if (inNum.get() === 0 && !inTex.get()) return;

    const num = Math.max(0, Math.ceil(inNum.get() || inTex.get().width * inTex.get().height));

    let verts = new Float32Array(num * 3);
    let texCoords = new Float32Array(num * 2);

    const geom = new CGL.Geometry("pointcloudfromTexture");
    geom.setPointVertices(verts);
    geom.setTexCoords(texCoords);
    geom.verticesIndices = [];
    numVerts = verts.length / 3;

    if (mesh)mesh.dispose();

    if (numVerts > 0)
        mesh = new CGL.Mesh(cgl, geom, cgl.gl.POINTS);

    mesh.addVertexNumbers = true;
    mesh.setGeom(geom);
}

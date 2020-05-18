import {
    getShadowPassVertexShader,
    getShadowPassFragmentShader,
    getBlurPassVertexShader,
    getBlurPassFragmentShader
} from "./createShaders";
// import { Framebuffer } from "./cgl_framebuffer";
// import { CGL.Framebuffer2 } from "./cgl_framebuffer2";
// import { Texture } from "./cgl_texture";
// import { CGL.TextureEffect } from "./cgl_textureeffect";
// import { Shader } from "./cgl_shader";
// import { CGL.Uniform } from "./cgl_shader_uniform";
// import { CGL.DEG2RAD } from "./cgl_utils";
// import { Cubemap } from "./cgl_cubemap";

/**
 *
 * @param {Object} config config for light
 */
function Light(cgl, config)
{
    // * common settings for each light
    this.type = config.type || "point";
    this.color = config.color || [1, 1, 1];
    this.specular = config.specular || [0, 0, 0];
    this.position = config.position || null;
    this.intensity = config.intensity || 1;
    this.radius = config.radius || 1;
    this.falloff = config.falloff || 1;

    // * spot light specific config
    this.spotExponent = config.spotExponent || 1;
    this.cosConeAngleInner = config.cosConeAngleInner || 0; // spot light
    this.cosConeAngle = config.cosConeAngle || 0;
    this.conePointAt = config.conePointAt || [0, 0, 0];

    // * shadow specific config
    this.castShadow = config.castShadow || false;
    this.nearFar = config.nearFar || [0, 0];
    this.normalOffset = 0;
    this.shadowBias = 0;
    this.shadowStrength = 0;
    this.lightMatrix = null;

    this.shadowMap = null;
    this.shadowMapDepth = null;
    this.shadowCubeMap = null;

    // * internal config
    this._cgl = cgl;
    this._framebuffer = null;
    this._shaderShadowMap = {
        "shader": null,
        "uniforms": {
            "lightPosition": null,
            "nearFar": null,
        },
        "matrices": {
            "modelMatrix": mat4.create(),
            "viewMatrix": mat4.create(),
            "projMatrix": mat4.create(),
            "biasMatrix": mat4.fromValues(0.5, 0.0, 0.0, 0.0, 0.0, 0.5, 0.0, 0.0, 0.0, 0.0, 0.5, 0.0, 0.5, 0.5, 0.5, 1.0),
        },
        "vectors": {
            "lookAt": vec3.create(),
            "camPos": vec3.create(),
            "up": vec3.fromValues(0, 1, 0),
        },
    };
    this._effectBlur = null;
    this._shaderBlur = {
        "shader": null,
        "uniforms": {
            "XY": null,
        },
    };
    this._cubemap = null;
    return this;
}

Light.prototype.getModifiableParameters = function ()
{
    return [
        "color",
        "specular",
        "position",
        "intensity",
        "radius",
        "falloff",

        // * spot light specific config
        "spotExponent",
        "cosConeAngleInner",
        "cosConeAngle",
        "conePointAt",
    ];
};

Light.prototype.createProjectionMatrix = Light.prototype.updateProjectionMatrix = function (lrBottomTop, near, far, angle)
{
    if (this.type === "spot")
    {
        mat4.perspective(this._shaderShadowMap.matrices.projMatrix, -2 * CGL.DEG2RAD * angle, 1, near, far); // * angle in degrees
    }
    else if (this.type === "directional")
    {
        mat4.ortho(this._shaderShadowMap.matrices.projMatrix, -1 * lrBottomTop, lrBottomTop, -1 * lrBottomTop, lrBottomTop, near, far);
    }
    else if (this.type === "point")
    {
        mat4.perspective(this._shaderShadowMap.matrices.projMatrix, CGL.DEG2RAD * 90, 1, near, far);
        this.nearFar = [near, far];
    }
};

Light.prototype.hasFramebuffer = function ()
{
    return !!this._framebuffer;
};
Light.prototype.hasShadowMapShader = function ()
{
    return !!this._shaderShadowMap.shader;
};

Light.prototype.hasBlurShader = function ()
{
    return !!this._shaderBlur.shader;
};
Light.prototype.hasBlurEffect = function ()
{
    return !!this._effectBlur;
};

Light.prototype.getShadowMap = function ()
{
    if (this.type === "point") return null; // TODO: replace
    return this._framebuffer.getTextureColor();
};

Light.prototype.getShadowMapDepth = function ()
{
    if (this.type === "point") return null;
    return this._framebuffer.getTextureDepth();
};

Light.prototype.createFramebuffer = function (width, height, options)
{
    if (this.hasFramebuffer()) this._framebuffer.delete();

    const fbWidth = width || 512;
    const fbHeight = height || 512;

    if (options)
    {
        if (options.filter)
        {
            // * set FP to false if mipmap filtering is selected
            options.isFloatingPointTexture = options.filter !== CGL.Texture.FILTER_MIPMAP;
        }
    }

    if (this._cgl.glVersion == 1)
    {
        this._framebuffer = new CGL.Framebuffer(
            this._cgl,
            fbWidth,
            fbHeight,
            Object.assign(
                {
                    "isFloatingPointTexture": true,
                    "filter": CGL.Texture.FILTER_LINEAR,
                    "wrap": CGL.Texture.WRAP_CLAMP_TO_EDGE,
                },
                options,
            ),
        );
    }
    else
    {
        this._framebuffer = new CGL.Framebuffer2(
            this._cgl,
            fbWidth,
            fbHeight,
            Object.assign(
                {
                    "isFloatingPointTexture": true,
                    "filter": CGL.Texture.FILTER_LINEAR,
                    "wrap": CGL.Texture.WRAP_CLAMP_TO_EDGE,
                },
                options,
            ),
        );
    }

    if (this.type === "point")
    {
        this._cubemap = new CGL.Cubemap(this._cgl, {
            "camPos": this.position,
            "cullFaces": true,
            "size": fbWidth,
        });

        this._cubemap.initializeCubemap();
    }
};

Light.prototype.setFramebufferSize = function (size)
{
    if (this.hasFramebuffer()) this._framebuffer.setSize(size, size);
};

Light.prototype.createShadowMapShader = function (vertexShader, fragmentShader)
{
    if (this.hasShadowMapShader()) return;

    this._shaderShadowMap.shader = new CGL.Shader(this._cgl, "shadowPass" + this.type.charAt(0).toUpperCase() + this.type.slice(1));
    this._shaderShadowMap.shader.setModules(["MODULE_VERTEX_POSITION", "MODULE_COLOR", "MODULE_BEGIN_FRAG"]);

    const vShader = vertexShader || this.getShadowPassVertexShader();
    const fShader = fragmentShader || this.getShadowPassFragmentShader();

    this._shaderShadowMap.shader.setSource(vShader, fShader);
    this._shaderShadowMap.shader.offScreenPass = true;

    if (this.type === "point")
    {
        this._shaderShadowMap.uniforms.lightPosition = new CGL.Uniform(this._shaderShadowMap.shader, "3f", "inLightPosition", vec3.create());

        this._shaderShadowMap.uniforms.nearFar = new CGL.Uniform(this._shaderShadowMap.shader, "2f", "inNearFar", vec2.create());
    }

    if (this._cgl.glVersion == 1)
    {
        this._cgl.gl.getExtension("OES_texture_float");
        this._cgl.gl.getExtension("OES_texture_float_linear");
        this._cgl.gl.getExtension("OES_texture_half_float");
        this._cgl.gl.getExtension("OES_texture_half_float_linear");

        this._shaderShadowMap.shader.enableExtension("GL_OES_standard_derivatives");
        this._shaderShadowMap.shader.enableExtension("GL_OES_texture_float");
        this._shaderShadowMap.shader.enableExtension("GL_OES_texture_float_linear");
        this._shaderShadowMap.shader.enableExtension("GL_OES_texture_half_float");
        this._shaderShadowMap.shader.enableExtension("GL_OES_texture_half_float_linear");
    }
};

Light.prototype.createBlurEffect = function (options)
{
    if (this.type === "point") return;
    if (this.hasBlurEffect()) this._effectBlur.delete();

    this._effectBlur = new CGL.TextureEffect(
        this._cgl,
        Object.assign(
            {
                "isFloatingPointTexture": true,
                "filter": CGL.Texture.FILTER_LINEAR,
                "wrap": CGL.Texture.WRAP_CLAMP_TO_EDGE,
            },
            options,
        ),
    );
};

Light.prototype.createBlurShader = function (vertexShader, fragmentShader)
{
    if (this.hasBlurShader()) return;
    if (this.type === "point") return; // TODO: add cubemap convolution

    const vShader = vertexShader || this.getBlurPassVertexShader();
    const fShader = fragmentShader || this.getBlurPassFragmentShader();

    this._shaderBlur.shader = new CGL.Shader(this._cgl, "blurPass" + this.type.charAt(0).toUpperCase() + this.type.slice(1));
    this._shaderBlur.shader.setModules(["MODULE_VERTEX_POSITION", "MODULE_COLOR", "MODULE_BEGIN_FRAG"]);
    this._shaderBlur.shader.setSource(vShader, fShader);

    this._shaderBlur.uniforms.XY = new CGL.Uniform(this._shaderBlur.shader, "2f", "inXY", vec2.create());
    this._shaderBlur.shader.offScreenPass = true;
};

Light.prototype.renderPasses = function (polygonOffset, blurAmount, renderFunction)
{
    if (this._cgl.frameStore.shadowPass) return;

    this._cgl.pushCullFace(true);
    this._cgl.pushCullFaceFacing(this._cgl.gl.FRONT);
    this._cgl.gl.enable(this._cgl.gl.POLYGON_OFFSET_FILL);
    this._cgl.gl.polygonOffset(polygonOffset, polygonOffset);

    this._cgl.frameStore.renderOffscreen = true;
    this._cgl.frameStore.shadowPass = true;

    this._cgl.pushBlend(false);
    this._cgl.gl.colorMask(true, true, this.type === "point", this.type === "point"); // * for now just 2 channels, with MSM we need 4

    this.renderShadowPass(renderFunction);
    this._cgl.gl.cullFace(this._cgl.gl.BACK);
    this._cgl.gl.disable(this._cgl.gl.CULL_FACE);
    this._cgl.gl.disable(this._cgl.gl.POLYGON_OFFSET_FILL);

    if (this._cgl.glVersion != 1 && this.type !== "point") this.renderBlurPass(blurAmount);

    this._cgl.gl.colorMask(true, true, true, true);

    this._cgl.popBlend();
    this._cgl.popCullFaceFacing();
    this._cgl.popCullFace();

    this._cgl.frameStore.shadowPass = false;
    this._cgl.frameStore.renderOffscreen = false;

    if (this.type !== "point")
    {
        this.shadowMap = this._framebuffer.getTextureColor();
        this.shadowMapDepth = this._framebuffer.getTextureDepth();
    }
    else
    {
        this.shadowMap = null;
        this.shadowMapDepth = null;
    }
};

Light.prototype.renderShadowPass = function (renderFunction)
{
    if (this.type === "point")
    {
        this._shaderShadowMap.uniforms.nearFar.setValue(this.nearFar);
        this._shaderShadowMap.uniforms.lightPosition.setValue(this.position);

        this._cubemap.setCamPos(this.position);
        this._cubemap.setMatrices(this._shaderShadowMap.matrices.modelMatrix, this._shaderShadowMap.matrices.viewMatrix, this._shaderShadowMap.matrices.projMatrix);
        this._cubemap.renderCubemap(this._shaderShadowMap.shader, renderFunction);
        this.shadowCubeMap = this._cubemap.getCubemap();
        return;
    }

    this._cgl.pushShader(this._shaderShadowMap.shader);

    this._cgl.pushModelMatrix();
    this._cgl.pushViewMatrix();
    this._cgl.pushPMatrix();

    this._framebuffer.renderStart(this._cgl);

    // * create MVP matrices
    mat4.copy(this._cgl.mMatrix, this._shaderShadowMap.matrices.modelMatrix);

    vec3.set(this._shaderShadowMap.vectors.camPos, this.position[0], this.position[1], this.position[2]);

    if (this.type === "spot") vec3.set(this._shaderShadowMap.vectors.lookAt, this.conePointAt[0], this.conePointAt[1], this.conePointAt[2]);

    mat4.lookAt(this._cgl.vMatrix, this._shaderShadowMap.vectors.camPos, this._shaderShadowMap.vectors.lookAt, this._shaderShadowMap.vectors.up);

    mat4.copy(this._cgl.pMatrix, this._shaderShadowMap.matrices.projMatrix);

    if (!this.lightMatrix) this.lightMatrix = mat4.create();

    // * create light mvp bias matrix
    mat4.mul(this.lightMatrix, this._cgl.pMatrix, this._cgl.vMatrix);
    mat4.mul(this.lightMatrix, this._cgl.mMatrix, this.lightMatrix);
    mat4.mul(this.lightMatrix, this._shaderShadowMap.matrices.biasMatrix, this.lightMatrix);

    this._cgl.gl.clear(this._cgl.gl.DEPTH_BUFFER_BIT | this._cgl.gl.COLOR_BUFFER_BIT);

    if (renderFunction) renderFunction(); // * e.g. op.trigger();

    this._framebuffer.renderEnd(this._cgl);

    this._cgl.popPMatrix();
    this._cgl.popModelMatrix();
    this._cgl.popViewMatrix();

    this._cgl.popShader();
};

Light.prototype.renderBlurPass = function (blurAmount)
{
    this._cgl.pushShader(this._shaderBlur.shader);

    this._effectBlur.setSourceTexture(this._framebuffer.getTextureColor()); // take shadow map as source
    this._effectBlur.startEffect();

    this._effectBlur.bind();
    this._cgl.setTexture(0, this._effectBlur.getCurrentSourceTexture().tex);

    this._shaderBlur.uniforms.XY.setValue([blurAmount, 0]);
    this._effectBlur.finish();

    this._effectBlur.bind();

    this._cgl.setTexture(0, this._effectBlur.getCurrentSourceTexture().tex);

    this._shaderBlur.uniforms.XY.setValue([0, blurAmount]);

    this._effectBlur.finish();

    this._effectBlur.endEffect();

    this._cgl.popShader();
};

Light.prototype.getShadowPassVertexShader = getShadowPassVertexShader;
Light.prototype.getShadowPassFragmentShader = getShadowPassFragmentShader;
Light.prototype.getBlurPassVertexShader = getBlurPassVertexShader;
Light.prototype.getBlurPassFragmentShader = getBlurPassFragmentShader;

export { Light };
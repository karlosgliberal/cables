const ShaderGraph = class extends CABLES.EventTarget
{
    constructor(op, port)
    {
        super();
        this._op = op;
        this._port = port;

        this._opIdsHeadFuncSrc = {};
        this._opIdsFuncCallSrc = {};
        this._headFuncSrc = "";
        this._headUniSrc = "";
        this._callFuncStack = [];
        this._finalSrcFrag = "";
        this._finalSrcVert = "";

        port.on("change", this.compile.bind(this));
    }

    getSrcFrag() { return this._finalSrcFrag; }

    getSrcVert() { return this._finalSrcVert; }

    setOpShaderId(op)
    {
        if (!op.shaderId) op.shaderId = CGL.ShaderGraph.getNewId();
    }

    replaceId(op, txt)
    {
        this.setOpShaderId(op);
        return txt.replaceAll("_ID", "_" + op.shaderId);
    }

    addOpShaderFuncCode(op)
    {
        if (this._opIdsHeadFuncSrc[op.id])
        {
        // console.log("already exist",op.name,op.id);
            return;
        }
        this._opIdsHeadFuncSrc[op.id] = true;

        if (op.shaderSrc)
        {
            let src = op.shaderSrc.endl();// +"/* "+op.id+" */".endl();;
            src = this.replaceId(op, src);

            // console.log(src);
            this._headFuncSrc += src;
        }

        if (op.shaderSrcUniforms) this._headUniSrc += op.shaderSrcUniforms.endl();
    }


    callFunc(op, convertTo)
    {
        this.setOpShaderId(op);
        let callstr = "  ";

        const varname = "var" + op.getTitle() + "_" + op.shaderId;
        if (convertTo)callstr += ShaderGraph.typeConv(convertTo) + " " + varname + " = ";

        if (this._opIdsFuncCallSrc[op.shaderId])
        {
            if (varname) return varname;
            return;
        }
        this._opIdsFuncCallSrc[op.shaderId] = true;

        callstr += this.replaceId(op, op.shaderFunc || "") + "(";

        this.addOpShaderFuncCode(op);

        for (let i = 0; i < op.portsIn.length; i++)
        {
            let paramStr = "";
            const p = op.portsIn[i];
            if (p.uiAttribs.objType == "sg_void") continue;
            if (p.type != CABLES.OP_PORT_TYPE_OBJECT) continue;

            // parameters...
            if (p.isLinked())
            {
                for (let j = 0; j < p.links.length; j++)
                {
                    const otherPort = p.links[j].getOtherPort(p);
                    paramStr = this._getPortParamStr(otherPort, p.uiAttribs.objType);

                    console.log("objtype", p.uiAttribs.objType);
                    this.addOpShaderFuncCode(otherPort.parent);
                }
            }
            else
            {
                this.addOpShaderFuncCode(p.parent);
                paramStr = ShaderGraph.getDefaultParameter(p.uiAttribs.objType);
            }

            if (p.parent.shaderCodeOperator)
            {
                callstr += paramStr;
                if (i < op.portsIn.length - 1) callstr += " " + p.parent.shaderCodeOperator + " ";
            }
            else
            if (paramStr)
            {
                callstr += paramStr;
                if (i < op.portsIn.length - 1) callstr += ", ";
            }
        }

        callstr += ");";

        this._callFuncStack.push(callstr);

        return varname;
    }


    _getPortParamStr(p, convertTo)
    {
        let paramStr = "";

        if (p.parent.shaderVar)
        {
            paramStr = p.parent.shaderVar;
        }
        else
        if (p.direction == CABLES.PORT_DIR_OUT)
        {
            paramStr += this.callFunc(p.parent, p.uiAttribs.objType);
        }

        if (convertTo && convertTo != p.uiAttribs.objType)
        {
            console.log("convertTo", convertTo, "from", p.uiAttribs.objType);
            paramStr = ShaderGraph.convertTypes(convertTo, p.uiAttribs.objType, paramStr);
        }

        return paramStr;
    }

    compile()
    {
        const l = this._port.links;
        console.log(l);

        this._callFuncStack = [];

        this._opIdsFuncCallSrc = {};
        this._opIdsHeadFuncSrc = {};
        this._headFuncSrc = "";
        this._headUniSrc = "";
        let callSrc = "";

        for (let i = 0; i < l.length; i++)
        {
            const lnk = l[i];
            callSrc += this.callFunc(lnk.getOtherPort(this._port).parent) + ";".endl();
        }

        callSrc = this._callFuncStack.join("\n");

        const src = "".endl() +
        "{{MODULES_HEAD}}".endl().endl() +
        "IN vec2 texCoord;".endl().endl() +
        this._headUniSrc.endl().endl() +
        this._headFuncSrc.endl().endl() +

        "void main()".endl() +
        "{".endl() +
        "  {{MODULE_BEGIN_FRAG}}".endl() +

        callSrc.endl() +
        "}".endl();

        this._finalSrcFrag = src;
        this.emitEvent("compiled");
    }
};

ShaderGraph.convertTypes = function (typeTo, typeFrom, paramStr)
{
    console.log(typeFrom, " to ", typeTo);

    if (typeTo == "sg_genType") return paramStr;

    if (typeFrom == "sg_vec4" && typeTo == "sg_vec3") return paramStr + ".xyz";
    if (typeFrom == "sg_vec4" && typeTo == "sg_vec2") return paramStr + ".xy";
    if (typeFrom == "sg_vec4" && typeTo == "sg_float") return paramStr + ".x";

    if (typeFrom == "sg_vec3" && typeTo == "sg_vec2") return paramStr + ".xy";
    if (typeFrom == "sg_vec3" && typeTo == "sg_float") return paramStr + ".x";

    if (typeFrom == "sg_vec2" && typeTo == "sg_float") return paramStr + ".x";

    if (typeFrom == "sg_vec3" && typeTo == "sg_vec4") return "vec4(" + paramStr + ", 1.)";

    if (typeFrom == "sg_vec2" && typeTo == "sg_vec4") return "vec4(" + paramStr + ", 1., 1.)";

    if (typeFrom == "sg_float" && typeTo == "sg_vec2") return "vec2(" + paramStr + "," + paramStr + ")";
    if (typeFrom == "sg_float" && typeTo == "sg_vec3") return "vec3(" + paramStr + "," + paramStr + "," + paramStr + ")";
    if (typeFrom == "sg_float" && typeTo == "sg_vec4") return "vec4(" + paramStr + "," + paramStr + "," + paramStr + ", 1.0)";

    return "/* conversionfail: " + typeFrom + "->" + typeTo + " */";
};

ShaderGraph.getDefaultParameter = function (t)
{
    if (t == "sg_vec4") return "vec4(1., 1., 1., 1.)";
    if (t == "sg_vec3") return "vec3(1., 1., 1.)";
    if (t == "sg_vec2") return "vec2(1., 1.)";
    if (t == "sg_float") return "1.";
    if (t == "sg_genType") return "1.";
    return "/* no default: " + t + "*/";
};

ShaderGraph.typeConv = function (sgtype)
{
    return sgtype.substr(3);
};


ShaderGraph.shaderIdCounter = ShaderGraph.shaderIdCounter || 1;
ShaderGraph.getNewId = () =>
{
    return ++ShaderGraph.shaderIdCounter;
};

export { ShaderGraph };

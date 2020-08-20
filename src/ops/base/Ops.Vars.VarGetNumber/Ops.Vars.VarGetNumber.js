const val = op.outValue("Value");
op.varName = op.inValueSelect("Variable", [], "", true);

let variable = null;
op.patch.addEventListener("variablesChanged", init);

val.changeAlways = true;

init();

updateVarNamesDropdown();

op.patch.on("variableRename", (oldname, newname) =>
{
    if (oldname != op.varName.get()) return;
    op.varName.set(newname);
    updateVarNamesDropdown();
});

function updateVarNamesDropdown()
{
    if (CABLES.UI)
    {
        const varnames = [];
        const vars = op.patch.getVars();

        for (const i in vars)
            // if(typeof vars[i].getValue()=="number" || typeof vars[i].getValue()=="boolean")
            // if(vars[i].type=="number")
            if (i != "0")
                varnames.push(i);

        op.varName.uiAttribs.values = varnames;
    }
}

op.varName.onChange = function ()
{
    init();
};

function init()
{
    updateVarNamesDropdown();

    // if(CABLES.UI)
    // {
    //     if(op.varName.get()=='+ create new one')
    //     {
    //         CABLES.CMD.PATCH.createVariable(op);
    //         return;
    //     }
    // }

    if (variable)
    {
        variable.removeListener(onChange);
    }

    variable = op.patch.getVar(op.varName.get());

    if (variable)
    {
        variable.addListener(onChange);
        op.setUiError("unknownvar", null);
        op.setTitle("#" + op.varName.get());
        onChange(variable.getValue());
        // console.log("var value ",variable.getName(),variable.getValue());
    }
    else
    {
        op.setUiError("unknownvar", "unknown variable! - there is no setVariable with this name (" + op.varName.get() + ")");
        op.setTitle("#invalid");
    }
}


function onChange(v)
{
    updateVarNamesDropdown();
    val.set(v);
}

op.onDelete = function ()
{
    if (variable)
        variable.removeListener(onChange);
};

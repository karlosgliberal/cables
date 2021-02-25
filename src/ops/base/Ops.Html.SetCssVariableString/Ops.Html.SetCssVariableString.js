const varname = op.inString("Var Name");
const val = op.inString("Value");
const quoted = op.inBool("Output quoted string", false);

const root = document.documentElement;

val.onChange = varname.onChange = quoted.onChange = update;


function update()
{
    let value = val.get();
    if (quoted.get())
    {
        value = "\"" + value + "\"";
    }

    root.style.setProperty("--" + varname.get(), value);
}

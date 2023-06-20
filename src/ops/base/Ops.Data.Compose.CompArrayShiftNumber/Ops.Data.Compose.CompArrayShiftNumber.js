const
    update = op.inTrigger("Update"),
    next = op.outTrigger("Next"),
    result = op.outNumber("Result", 0);

update.onTriggered = () =>
{
    if (op.patch.frameStore.compArray && op.patch.frameStore.compArray.length > 0)
    {
        let arr = op.patch.frameStore.compArray[op.patch.frameStore.compArray.length - 1];

        const n = arr.shift();
        if (CABLES.UTILS.isNumeric(n)) result.set(n);
        else result.set(0);
    }
    next.trigger();
};

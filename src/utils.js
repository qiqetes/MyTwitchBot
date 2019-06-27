function msToTime(duration) {
    var milliseconds = parseInt((duration % 1000) / 100),
        minutes = Math.floor((duration / (1000 * 60)) % 60),
        hours = Math.floor((duration / (1000 * 60 * 60)) % 24);

    hours = (hours < 10) ? "0" + hours : hours;
    minutes = (minutes < 10) ? "0" + minutes : minutes;


    return 'Qiqete has been up for ' + hours + 'h and ' + minutes + 'minutes';
}
function randomInt(max) {
    max = Math.floor(max);
    return Math.floor(Math.random() * (max));
}

function equalsArray(array1, array) {
    // if the other array is a falsy value, return
    if (!array)
        return false;

    // compare lengths - can save a lot of time 
    if (array1.length != array.length)
        return false;

    for (var i = 0, l = array1.length; i < l; i++) {
        // Check if we have nested arrays
        if (array1[i] instanceof Array && array[i] instanceof Array) {
            // recurse into the nested arrays
            if (!array1[i].equals(array[i]))
                return false;
        }
        else if (array1[i] != array[i]) {
            // Warning - two different object instances will never be equal: {x:20} != {x:20}
            return false;
        }
    }
    return true;
}

module.exports = {
    msToTime: msToTime,
    randomInt: randomInt,
    equalsArray: equalsArray
};

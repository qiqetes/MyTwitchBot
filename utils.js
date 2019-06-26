function msToTime(duration) {
    var milliseconds = parseInt((duration % 1000) / 100),
        minutes = Math.floor((duration / (1000 * 60)) % 60),
        hours = Math.floor((duration / (1000 * 60 * 60)) % 24);

    hours = (hours < 10) ? "0" + hours : hours;
    minutes = (minutes < 10) ? "0" + minutes : minutes;


    return 'Qiqete has been up for ' + hours + 'h and ' + minutes + 'minutes';
}


module.exports = {
    msToTime: msToTime
};

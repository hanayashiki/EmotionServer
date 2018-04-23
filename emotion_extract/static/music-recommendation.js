musicRecommendation = new function(){

    this.repertoire = {}

    let musicList = new Vue({
        el: '#recommendation',
        data: {
            recommendList: [],
            analyzed: false
        }
    })
    getRepertoire(this.repertoire)
    this.loadMusicList = function(emotion) {
        musicList.analyzed = true
        console.log(emotion)
        console.log(this.repertoire)
        musicList.recommendList = getRandomArrayElements(this.repertoire.data[emotion], 4)
    }
    this.hideMusicList = function() {
        console.log("hidden")
        musicList.analyzed = false;
    }
}();

function getRepertoire(repertoire) {
    new Vue().$http.get(
        "/getRepertoire/",{
            params: {}
        }).then(function(res) {
            repertoire.data = res.data
            console.log("repertoire loaded.")
        });
}

function getRandomArrayElements(arr, count) {
    let shuffled = arr.slice(0), i = arr.length, min = Math.max(i - count, 0), temp, index;
    while (i-- > min) {
        index = Math.floor((i + 1) * Math.random());
        temp = shuffled[index].slice(0);
        shuffled[index] = shuffled[i].slice(0);
        shuffled[i] = temp.slice(0);
    }
    console.log(shuffled.slice(min))
    console.log(arr)
    return shuffled.slice(min);
}

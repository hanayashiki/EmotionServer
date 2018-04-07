Vue.prototype.$http = axios;
Vue.http.headers.common['X-CSRFToken'] = $("input[name='csrfmiddlewaretoken']").val();
imgSource = {
    type: "",
    value: ""
}
emotionDict = {
    0: "Amusement / 愉快",
    1: "Anger / 愤怒",
    2: "Excitement / 兴奋",
    3: "Sadness / 悲伤"
}

uploadStatus = new Vue({
    el: '#upload-status',
    data: {
        status: ""
    }
});

imgPreview = new Vue({
    el: '#image-uploaded',
    data: {
        set: false,
        source: ""
    }
});

analysis = new Vue({
    el: "#analysis",
    data: {
        analyzed: false,
        result: [0.25, 0.25, 0.30, 0.20],
        answer: "",
        loading: false
    },
    watch: {
        result: function (old_val, new_val) {
            console.log(this.$children.length)
            console.log(new_val)
            this.analyzed = true;
            showChart(this.result)
        },
    },
    methods: {
        extract(event) {
            if (imgSource.type !== '') {
                this.loading = true
                this.analyzed = false
                analysis.answer = ''
                this.$http.get('/extract/', {
                    params: imgSource
                }).then(function (res) {
                    console.log(res.data)
                    if (res.data.success === true) {
                        let max = res.data.result[0]
                        let maxpos = 0
                        for (let i = 0; i < 4; i++) {
                            if (res.data.result[i] > max) {
                                max = res.data.result[i]
                                maxpos = i
                            }
                            res.data.result[i] = Math.floor(res.data.result[i] * 100) / 100
                        }
                        analysis.result = res.data.result
                        analysis.answer = '结果：' + emotionDict[maxpos]
                        scrollToElement(500, document.getElementById("analysis"))
                    } else {
                        alert(res.data.message)
                    }
                    this.loading = false
                }, function (res) {
                    alert(res.status)
                });
            } else {
                alert("图片未指定或未上传完毕")
            }
        }
    }

});

urlInput = new Vue({
    el: '#url-input',
    data: {
        url: ''
    },
    watch: {
        url: function (oldVal, newVal) {
            this.loadImg()
        }
    },
    methods: {
        loadImg: _.debounce(
            function () {
                imgPreview.source = this.url
                imgPreview.set = true
                imgSource.type = "url"
                imgSource.value = this.url
                analysis.analyzed = false
            },
            500
        )
    }
})

function getFileUrl(obj) {
    let url;
    url = window.URL.createObjectURL(obj.files.item(0));
    return url;
}

console.log(uploadStatus.status)

new Vue({
    el: '#upload',
    data: {
        file: ''
    },
    methods: {
        getFile(event) {
            if (event.target.files.length > 0) {
                this.file = event.target.files[0];
                console.log(this.file);
                let formData = new FormData();
                formData.append('image', this.file);
                uploadStatus.status = "上传中..."
                let target = event.target;
                imgPreview.source = getFileUrl(event.srcElement)
                imgPreview.set = true
                analysis.analyzed = false
                let config = {
                    headers: {
                        'Content-Type': 'multipart/form-data'
                    }
                };
                this.$http.post('/upload/', formData, config).then(function (res) {
                    console.log(res)
                    imgSource.type = "hash"
                    imgSource.value = res.data.hash
                    uploadStatus.status = "上传成功"
                    setInterval(() => {
                        uploadStatus.status = ""
                    }, 4000)
                }, function (res) {
                    setInterval(() => {
                        uploadStatus.status = ""
                    }, 4000)
                    uploadStatus.status = "上传失败"
                })
            }
        }
    }
});

function showChart(emotion) {
    require.config({
        paths: {
            echarts: 'http://echarts.baidu.com/build/dist'
        }
    });

    // 使用
    require(
        [
            'echarts',
            'echarts/chart/pie', // 使用柱状图就加载bar模块，按需加载
            'echarts/theme/infographic'
        ],
        function (ec) {
            // 基于准备好的dom，初始化echarts图表
            var myChart = ec.init(document.getElementById('canvas'), 'infographic');

            var option = {
                tooltip: {
                    trigger: 'item',
                    formatter: "{a} <br/>{b} : {c} ({d}%)"
                },
                legend: {
                    orient: 'vertical',
                    x: 'left',
                    data: ['Amusement', 'Anger', 'Excitement', 'Sadness']
                },
                toolbox: {
                    show: false
                },
                calculable: true,
                series: [
                    {
                        name: 'Emotion Analysis',
                        type: 'pie',
                        radius: ['50%', '70%'],
                        itemStyle: {
                            normal: {
                                label: {
                                    show: false
                                },
                                labelLine: {
                                    show: false
                                }
                            },
                            emphasis: {
                                label: {
                                    show: true,
                                    position: 'center',
                                    textStyle: {
                                        fontSize: '30',
                                        fontWeight: 'bold'
                                    }
                                }
                            }
                        },
                        data: [
                            {value: emotion[0], name: 'Amusement'},
                            {value: emotion[1], name: 'Anger'},
                            {value: emotion[2], name: 'Excitement'},
                            {value: emotion[3], name: 'Sadness'},
                        ]
                    }
                ]
            };
            // 为echarts对象加载数据
            myChart.setOption(option);
        }
    );
}

function scrollToElement(scrollDuration, element) {
    let scrollCount = 0
    let totalCount = scrollDuration / 15
    let startY = window.scrollY
    let play = setInterval(function () {
        scrollCount++
        let targetY = Math.min(getPosition(element).top, document.body.scrollHeight - window.innerHeight + 20)
        let ratio = (1 - Math.cos((scrollCount / totalCount) * Math.PI)) / 2
        //console.log("ratio:" + ratio)
        window.scrollTo(0, startY + ratio * (targetY - startY))
        //console.log("diff: " + (targetY - window.scrollY))
        if (scrollCount >= totalCount) {
            window.clearInterval(play)
        }
    }, 15)
}

// 获取元素到文档区域的坐标
function getPosition(element) {
    let actualLeft = element.offsetLeft,
        actualTop = element.offsetTop,
        current = element.offsetParent; // 取得元素的offsetParent
    // 一直循环直到根元素
    while (current !== null) {
        actualLeft += current.offsetLeft;
        actualTop += current.offsetTop;
        current = current.offsetParent;
    }
    // 返回包含left、top坐标的对象
    return {
        left: actualLeft,
        top: actualTop
    };
}
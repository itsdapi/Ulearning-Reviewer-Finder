(function () {
    'use strict';
    //If you want to show the name, just change this to TRUE xD.
    //USE AT YOUR OWN RISK!
    //USE AT YOUR OWN RISK!
    //USE AT YOUR OWN RISK!
    //风险自己承担！
    //风险自己承担！
    //风险自己承担！
    const hardcore_mode = false


    app()

    //main
    async function app() {
        const params = getParams()
        const classData = await getClassData(params.classid, params.token)
        const peerReviewData = await getPeerReviewList(params.homeworkid, params.studentid, params.classid, params.token)
        const buildData = buildList(classData, peerReviewData)
        appendInfo(buildData)
    }

    //get important params for data
    function getParams() {
        const url = window.unsafeWindow.location.href

        //get studentid, homeworkid
        const match1 = /stuDetail/gm
        const target = url.substring(match1.exec(url).index + match1.toString().length - 3)
        const studentid = target.split('/')[0]
        const homeworkid = target.split('/')[1].split('?')[0]

        //get ocid(classid)
        const match2 = /ocId/gm
        const classid = url.substring(match2.exec(url).index + match2.toString().length - 3)

        //get token
        const cookies = document.cookie
        const token = /token.*?(;|$)/gm.exec(cookies)[0].substring(6).slice(0, -1)

        const params = {
            studentid,
            homeworkid,
            classid,
            token
        }
        console.log('params', params)

        return params
    }

    async function getClassData(classid, token, pageSize = 100) {
        const url = `https://courseapi.ulearning.cn/student/list?ocId=${classid}&isDesc=1&pn=1&ps=${pageSize}&lang=zh`
        const result = await send(url, token)
        return result.list
    }

    async function getPeerReviewList(homeworkid, studentid, classid, token) {
        const url = `https://homeworkapi.ulearning.cn/stuHomework/homeworkDetail/${homeworkid}/${studentid}/${classid}`
        const result = await send(url, token)
        return result.result.peerReviewHomeworkList
    }

    function buildList(classData, peerReviewData) {
        let result_list = []
        for(let review of peerReviewData){
            let og_result_list = result_list 
            let result = classData.find((element) => {
                return element.userId === review.userID
            })
            // console.log(result.name)
            review.name = result.name
            result_list = [...og_result_list, review]
        }
        return result_list
    }

    async function appendInfo(info) {
        await waitForContentLoad()
        let oriElements = document.querySelectorAll('.peermain')
        for (let [index, scoreWrapper] of oriElements.entries()) {
            scoreWrapper.insertAdjacentHTML('afterend', `<div>${(hardcore_mode ? info[index].name : info[index].userID)}</div>`)
        }
    }

    function waitForContentLoad() {
        return new Promise((res) => {
            for (let index = 0; index < 10; index++) {
                setTimeout(() => {
                    if (document.getElementById('app') !== null) {
                        res()
                    }
                }, 500);
            }
        })
    }

    function send(url, token) {
        const xhr = new XMLHttpRequest()
        return new Promise((res, rej) => {
            xhr.open('GET', url, true)
            xhr.setRequestHeader("AUTHORIZATION", token)
            xhr.onreadystatechange = () => {
                // In local files, status is 0 upon success in Mozilla Firefox
                if (xhr.readyState === XMLHttpRequest.DONE) {
                    const status = xhr.status;
                    if (status === 0 || (status >= 200 && status < 400)) {
                        // The request has been completed successfully
                        res(JSON.parse(xhr.responseText))
                    } else {
                        rej(xhr.responseText)
                        // Oh no! There has been an error with the request!
                    }
                }
            };
            xhr.send()
        })

    }


    // function intersection() {
    //     var origOpen = XMLHttpRequest.prototype.open;
    //     XMLHttpRequest.prototype.open = function () {
    //         this.addEventListener('load', function () {
    //             let target = /homeworkDetail/gm
    //             //正则匹配目标地址
    //             if (target.test(this.responseURL)) {
    //                 const data = JSON.parse(this.response).result.peerReviewHomeworkList
    //                 console.log(this.responseURL)
    //                 appendInfo(data)
    //             }
    //         });
    //         origOpen.apply(this, arguments);
    //     };
    // }



})();
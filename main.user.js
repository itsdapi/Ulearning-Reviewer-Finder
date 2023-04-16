// ==UserScript==
// @name         优学院显示评分人id
// @namespace    http://tampermonkey.net/
// @version      0.3
// @description  显示评分人的id
// @author       itsdapi
// @match        https://homework.ulearning.cn/
// @run-at       document-start
// @grant        unsafeWindow
// @license MIT
// ==/UserScript==

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
        console.log('Ulearning-scorer-finder is running!')
        try {
            const params = getParams()
            const classData = await getClassData(params.classid, params.token)
            const homeworkData = await getHomeworkDetail(params.homeworkid, params.studentid, params.classid, params.token)
            const peerHomeworkData = await getPeerHomeworkDetail(params.homeworkid, params.studentid, params.token)
            const builedHomeworkData = buildList(classData, homeworkData)
            const builedPeerHomeworkData = buildList(classData, peerHomeworkData)
            appendInfoToHomework(builedHomeworkData)
            appendInfoToPeerHomework(builedPeerHomeworkData)
        } catch (error) {
            console.error('Script Error!', error)
        }

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

    async function getHomeworkDetail(homeworkid, studentid, classid, token) {
        const url = `https://homeworkapi.ulearning.cn/stuHomework/homeworkDetail/${homeworkid}/${studentid}/${classid}`
        const result = await send(url, token)
        return result.result.peerReviewHomeworkList
    }

    async function getPeerHomeworkDetail(homeworkid, studentid, token) {
        const url = `https://homeworkapi.ulearning.cn/stuHomework/peerReviewHomeworkDatil/${homeworkid}/${studentid}`
        const result = await send(url, token)
        return result.result
    }

    function buildList(classData, homeworkData) {
        let result_list = []
        for (let homework of homeworkData) {
            let og_result_list = result_list
            let result = classData.find((element) => {
                return element.userId === homework.userID
            })
            if (typeof (result) === typeof (undefined)) {
                console.log(`Name to ${homework.userID} not found!`)
                homework.name = `未找到 id: ${homework.userID}`
            } else {
                console.log(`ID ${homework.userID} found!`)
                homework.name = result.name
            }
            // console.log(result.name)
            result_list = [...og_result_list, homework]
        }
        return result_list
    }

    async function appendInfoToHomework(info) {
        await waitForContentLoad()
        let peerHomeworkItemEle = document.querySelectorAll('.peermain')
        if (peerHomeworkItemEle.length !== 0) {
            for (let [index, scoreWrapper] of peerHomeworkItemEle.entries()) {
                scoreWrapper.insertAdjacentHTML('afterend', `<div>${(hardcore_mode ? info[index].name : info[index].userID)}</div>`)
            }
        } else {
            let myHomeworkEle = document.querySelectorAll('.stuworkdetails-zone')
            console.log(myHomeworkEle)
            for (let _info of info) {
                myHomeworkEle[0].insertAdjacentHTML('afterend', `<div>${_info.name}: ${_info.score}</div>`)
            }

        }
    }

    async function appendInfoToPeerHomework(info) {
        await waitForContentLoad()
        let peerHomeworkEle = document.querySelectorAll('.peer_host')
        for (let [index, scoreWrapper] of peerHomeworkEle.entries()) {
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
})();
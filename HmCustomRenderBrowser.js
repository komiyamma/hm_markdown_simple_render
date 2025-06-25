// HmCustomRenderBrowser.js ver 2.4.4.2
(function() {
    // ファイルURLからポート番号を取得
    let urlLocationParams = new URLSearchParams(window.location.search);
    let urlLocationPort1 = Number(urlLocationParams.get('port1'));
    let urlLocationPort2 = Number(urlLocationParams.get('port2'));
    let urlLocationKey = urlLocationParams.get('key');
    let urlFuncID = Number(urlLocationParams.get('funcid'));

    // ロック用のフラグ
    let sendingLock = Promise.resolve();   
    let receiveLock = Promise.resolve();   

    async function updateTick(callBackFunc) {
        // 前回の完了を保証
        await receiveLock;

        receiveLock = (async () => {
            try {
                const response = await fetch(`http://localhost:${urlLocationPort1}/${urlLocationKey}`);

                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                const obj = await response.json();
                callBackFunc(obj, null); // 成功した場合はオブジェクトとnullを渡す
            } catch (error) {
                callBackFunc(null, error); // エラーの場合はnullとエラーオブジェクトを渡す
            };
        })();
        
        await receiveLock; // リクエストの完了を保証
    }

    HmCustomRenderBrowser = {
        setInterval: function(callBackFunc, timeout) {
            updateTick(callBackFunc);
            return window.setInterval(updateTick, timeout, callBackFunc);
        },

        clearInterval: function(timerHandle) {
             window.clearInterval(timerHandle);
        },

        setTimeout: function(callBackFunc, timeout) {
            return window.setTimeout(updateTick, timeout, callBackFunc);
        },

        clearTimeout: function(timerHandle) {
             window.clearTimeout(timerHandle);
        },

        sendObjectFromRenderPane: function(obj) {
            var json = JSON.stringify(obj);
            window.chrome.webview.postMessage({ funcid: urlFuncID, message: json });
        },

        sendObject: async function(obj, callBackFunc) {

            // 前回の完了を保証
            await sendingLock;
            
            sendingLock = (async () => {
                try {
                    let text = JSON.stringify(obj);
                    const response = await fetch(`http://localhost:${urlLocationPort2}/${urlLocationKey}?sendObject=${encodeURIComponent(text)}`);

                    if (!response.ok) {
                        throw new Error(`HTTP error! status: ${response.status}`);
                    }
                    if (typeof(callBackFunc) == "function") {
                        callBackFunc(response, null)
                    }
                } catch (error) {
                    if (typeof(callBackFunc) == "function") {
                        callBackFunc(null, error)
                    }
                }
            })();
            
            await sendingLock; // リクエストの完了を保証
        }
    }
})();



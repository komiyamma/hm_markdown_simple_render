// HmCustomRenderServer.WebView2.js ver 2.4.4.2
var _currentMacroDirectory = currentmacrodirectory();

if (typeof (_httpServer1) != "undefined") {
    _httpServer1.close();
}
if (typeof (_httpServer2) != "undefined") {
    _httpServer2.close();
}

var _httpServer1 = hidemaru.createHttpServer({ makeKey: 1 }, async (req, res) => {

    var url = req.url;

    // ここはパッチだと思って!!
    if (typeof (url) != "string") {
        url = await req.url;
    }

    if (url == "/" + _httpServer1.key) {
        res.writeHead(200); // OK
        var obj = onRequestObject();
        res.write(JSON.stringify(obj));
        res.end("");
    } else {
        res.writeHead(404); // Not found
        res.end("");
    }
});


var _httpServer2 = hidemaru.createHttpServer(async (req, res) => {

    var url = req.url;

    // ここはパッチだと思って!!
    if (typeof (url) != "string") {
        url = await req.url;
    }

    if (url.indexOf("/" + _httpServer1.key + "?sendObject=") == 0) {
        res.writeHead(200); // OK
        var json_text = decodeURIComponent(url);
        json_text = json_text.replace("/" + _httpServer1.key + "?sendObject=", "");
        _proxyOnReceiveObjectFromRenderPane(json_text);
        res.write("{}");
        res.end("");
    } else {
        res.writeHead(404); // Not found
        res.end("");
    }
});


// 非同期関数なので非同期中に使える関数で構築する必要あり
function onRequestObject() {
    var obj = {
        text: gettotaltext(),
    };

    return obj;
}

function _proxyOnReceiveObjectFromRenderPane(json_text) {
    try {
        if (onReceiveObject && typeof(onReceiveObject) == "function") {
            var json = JSON.parse(json_text);
            onReceiveObject(json);
        }
    } catch(e) {
    }
}

function _makeUrl(htmlFullPath, port1, port2, key, funcid) {
    var absoluteUrl = new URL(htmlFullPath);
    var params = new URLSearchParams({
        port1: String(port1),
        port2: String(port2),
        key: String(key),
        funcid: String(funcid),
    });
    absoluteUrl.search = params.toString();
    return absoluteUrl.href;
}

function _outputAlert(msg) {
    var dll = loaddll("HmOutputPane.dll");
    dll.dllFuncW.OutputW(hidemaru.getCurrentWindowHandle(), msg + "\r\n");
}


// メインの処理
function _showCustomRenderBrowser() {

    _httpServer1.listen(0); //ランダムなポート
    _httpServer2.listen(0); //ランダムなポート

    if (_httpServer1.port == 0 || _httpServer2.port == 0) {
        _outputAlert("サーバー構築失敗");
        return;
    }

    var funcid = hidemaru.getFunctionId(_proxyOnReceiveObjectFromRenderPane);
    var url = _makeUrl(_currentMacroDirectory + "\\HmCustomRenderBrowser.html", _httpServer1.port, _httpServer2.port, _httpServer1.key, funcid);

    if (showCustomRenderPane) { 
        showCustomRenderPane(url);
    }
}

function showCustomRenderPane(url) {

    browserpanecommand({
        target: "_each",
        url: url,
        show: 1,
        size: 500,
        initialize: "async",
    });
}


// 同期で処理せず、非同期で処理することで、マクロ実行で一瞬固まるのを回避する。
var _timerHandleShow;

if (typeof(_timerHandleShow) != "undefined") {
    hidemaru.clearTimeout(_timerHandleShow);
}

_timerHandleShow = hidemaru.setTimeout(_showCustomRenderBrowser, 0);

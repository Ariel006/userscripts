var ___userscripts = {
    loaded: false,
    savedCode: "",
    sessionCode: "",
    infoButton: document.getElementById("info"),
    saveButton: document.getElementById("save"),
    discardButton: document.getElementById("discard"),
    downloadButton: document.getElementById("download"),
    setEditorMessage: function(m) {
        document.getElementById("message").innerHTML = m;
    },
    setVersion: function(v) {
        document.getElementById("version").innerHTML = v;
    },
    enableButtons: function() {
        this.saveButton.removeAttribute("disabled");
        this.discardButton.removeAttribute("disabled");
    },
    disableButtons: function() {
        this.saveButton.setAttribute("disabled", true);
        this.discardButton.setAttribute("disabled", true);
    },
    getInfo: function() {
        window.webkit.messageHandlers.getInfo.postMessage("user wants info");
    },
    downloadScript: function() {
        window.webkit.messageHandlers.downloadScript.postMessage("user wants to download script");
    },
    discard: function() {
        this.editor.setValue(this.savedCode);
        this.disableButtons();
    },
    save: function() {
        var code = this.editor.getValue();
        window.webkit.messageHandlers.saveCode.postMessage(escape(code));
        this.savedCode = code;
        this.sessionCode = "";
        this.setEditorMessage("All changes saved");
        this.disableButtons();
    },
    setSaveDate: function(dateString) {
        var t = this;
        setTimeout(function() {
            t.setEditorMessage("Last edited on " + dateString);
        }, 1500);
    },
    loadCode: function(c) {
        var code = unescape(c);
        if (code.trim().length > 0 && this.loaded === false) {
            this.savedCode = code;
            this.editor.setValue(code);
            this.disableButtons();
            this.loaded = true;
        }
    },
    webViewOnLoad: function() {
        if (this.loaded === false) {
            window.webkit.messageHandlers.webViewOnLoad.postMessage(this.loaded);
        }
    },
    editor: CodeMirror.fromTextArea(document.getElementById("code"), {
        mode:  "javascript",
        smartIndent: true,
        tabSize: 2,
        lineWrapping: true,
        lineNumbers: true,
        autoCloseBrackets: true,
        styleActiveLine: true,
        matchBrackets: true,
        hintOptions: {useGlobalScope: true},
        extraKeys: {"Ctrl-Space": "autocomplete", "Cmd-S": function() {___userscripts.save();}, "Cmd-/": "toggleComment"}
    })
};

___userscripts.editor.on("change", function(e, c) {
    var inputAction = c.origin;
    
    if (inputAction !== "setValue") {
        ___userscripts.sessionCode = e.getValue();
        ___userscripts.enableButtons();
    }
    
    if (inputAction === "undo" || inputAction === "redo") {
        if (___userscripts.sessionCode.localeCompare(___userscripts.savedCode) === 0) {
            ___userscripts.disableButtons();
        }
    }
});

___userscripts.editor.on("keydown", function(cm, e) {
    var currentLinePosition = cm.getCursor()["ch"];
    if (!cm.state.completionActive && e.metaKey === false && e.keyCode >= 65 && e.keyCode <= 90 && currentLinePosition != 0) {
        cm.showHint({completeSingle: false});
    }
});

___userscripts.infoButton.addEventListener("click", function(){___userscripts.getInfo();});
___userscripts.saveButton.addEventListener("click", function(){___userscripts.save();});
___userscripts.discardButton.addEventListener("click", function(){___userscripts.discard();});
___userscripts.downloadButton.addEventListener("click", function(){___userscripts.downloadScript();});
window.onload = ___userscripts.webViewOnLoad();
// Function to add event listeners
function addWindowEvent(type, fn) {
    if (window.addEventListener) {
        window.addEventListener(type, fn, false);
    } else if (window.attachEvent) {
        window.attachEvent('on' + type, fn);
    } else {
        window['on' + type] = fn;
    }
}

// Execute entry point on page load
addWindowEvent('load', main);

// Entry point
function main() {
    // Primitive variables
    var consoleClass = "console",
        errorClass = "error",
        output = "";
    // DOM object variables
    var jsConsole = document.getElementById("jsConsole"),
        jsExecute = document.getElementById("jsExecute"),
        iframe = null,
        iWindow = null;
    // Editor variables
    var editor = ace.edit("jsCode");
    var theme = {
        name: "monokai",
        fontSize: 16,
        highlightLine: true,
        highlightWord: false,
        showFold: true,
        autoPair: false
    }

    // Set the page theme - in function in case I allow changes via HTML
    function setTheme() {
        if (!editor)
            return;
        editor.setBehavioursEnabled(theme.autoPair);
        editor.setFontSize(theme.fontSize);
        editor.setHighlightActiveLine(theme.highlightLine);
        editor.setHighlightSelectedWord(theme.highlightWord);
        editor.setShowFoldWidgets(theme.showFold);
        editor.setTheme("ace/theme/" + theme.name);

        // Other HTML elements share the editor's theme
        consoleClass = "ace-" + theme.name;
        jsConsole.className = consoleClass;
        document.body.className = consoleClass;
    }

    // Sandbox code using invisible <iframe>
    iframe = document.createElement("iframe");
    iframe.style.display = "none";
    document.body.appendChild(iframe);
    iWindow = frames[frames.length - 1];
    iWindow.document.writeln('<script src="js/console_iframe.js"></script>');

    // Function to actually execute the code
    function execute() {
        try {
            sandbox.clear();
            output = '<div class="eval">' + sandbox.eval(editor.getValue())
                   + '</div>';
            jsConsole.className = consoleClass;
            jsConsole.innerHTML = '<pre>' + sandbox.messages() + output
                                + '</pre>';
            editor.focus();
        } catch (e) {
            jsConsole.className = errorClass;
            jsConsole.innerHTML = '<pre><span class="error">' + e
                                + '</span></pre>';
            console.log(e);
        }
    }

    // Execute code on button click
    jsExecute.onclick = execute;

    // Also execute code on Ctrl-Enter
    function ctrlEnter(e) {
        if (e.keyCode == 13 && e.ctrlKey)
            execute();
    }
    if (window.addEventListener) {
        window.addEventListener('keyup', ctrlEnter, false);
    } else if (window.attachEvent) {
        window.attachEvent('onkeyup', ctrlEnter);
    } else {
        window.onkeyup = ctrlEnter;
    }

    // Set up the editor and theme
    editor.getSession().setMode("ace/mode/javascript");
    setTheme();
    editor.focus();
}

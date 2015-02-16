// Function to add event listeners
function addDomEvent(obj, type, fn) {
    if (obj.addEventListener) {
        obj.addEventListener(type, fn, false);
    } else if (window.attachEvent) {
        obj.attachEvent('on' + type, fn);
    } else {
        obj['on' + type] = fn;
    }
}

// Execute entry point on page load
addDomEvent(window, 'load', main);

// Entry point
function main() {
    // Primitive variables
    var consoleClass = "console",
        errorClass = "error",
        output = "";
    // DOM object variables
    var jsConsole = document.getElementById("jsConsole"),
        jsExecute = document.getElementById("jsExecute"),
        helpContent = document.getElementById("helpContent"),
        settingsContent = document.getElementById("settingsContent"),
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

    // Set the page theme
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
        consoleClass = "ace-" + theme.name.replace("_", "-");
        jsConsole.className = consoleClass;
        document.body.className = consoleClass;
        helpContent.className = consoleClass;
        settingsContent.className = consoleClass;
    }

    // Save theme settings
    addDomEvent(document.getElementById("settingsSave"), "click", function() {
        var themeSelect = document.getElementById("themeSelect"),
            fontSelect = document.getElementById("fontSize");
        theme.name = themeSelect.options[themeSelect.selectedIndex].value;
        theme.fontSize = parseInt(fontSelect.options[fontSelect.selectedIndex].text);
        theme.highlightLine = document.getElementById("highlightLine").checked;
        theme.highlightWord = document.getElementById("highlightWord").checked;
        theme.showFold = document.getElementById("showFold").checked;
        theme.autoPair = document.getElementById("autoPair").checked;
        setTheme();
        settingsContent.style.display = "none";
        return false;
    });


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
    addDomEvent(window, 'keyup', function(e) {
        if (e.keyCode == 13 && e.ctrlKey)
            execute();
    });

    // Show/hide help and settings
    addDomEvent(document.getElementById("help"), 'click', function() {
        helpContent.style.display = (helpContent.style.display == "block" ? "none" : "block");
        settingsContent.style.display = "none";
    });
    addDomEvent(document.getElementById("settings"), 'click', function() {
        helpContent.style.display = "none";
        settingsContent.style.display = (settingsContent.style.display == "block" ? "none" : "block");
    });
    addDomEvent(document.getElementById("helpClose"), 'click', function() {
        helpContent.style.display = "none";
    });
    addDomEvent(document.getElementById("settingsClose"), 'click', function() {
        settingsContent.style.display = "none";
    });

    // Set up the editor and theme
    editor.getSession().setMode("ace/mode/javascript");
    setTheme();
    editor.focus();
}

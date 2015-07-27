// TODO: Move all the styling into CSS classes
var Commands = function(hostline, user, group) {
    var FileLink = function (user, group, source, target) {
        return 'lrwxrwxrwx   1 ' + user + '    ' + group + '   35 Mar 29  2013 ' +
               '<b><font color="#29b4b4">' + source + '</font></b>' +
               ' -> ' +
               '<b><font color=#4444ff><a href=' + target + '>' + target + '</a></font></b>\n';
    }

    return { 'poweroff':   { typedCommand: "poweroff",
                             startDelay: 1250,
                             hesitation: 200,
                             output: "\nBroadcast message from " + hostline + "\n\t\t(/dev/pts/0) at " +
                                     new Date().getHours() + ":" + new Date().getMinutes() + "...\n\n" +
                                     "The system is going down for halt NOW!"
                           },
             'ls_home':    { typedCommand: 'ls ~' + user,
                             startDelay: 1250,
                             hesitation: 200,
                             output: 'drwx------ 113 ' + user + '    ' + group + '    36864 Jul 24 22:38 .\n' +
                                     'drwxr-xr-x   6 root root   4096 Jan  6  2015 ..\n' +
                                     FileLink(user, group, 'github', 'https://github.com/sgnn7') +
                                     FileLink(user, group, 'twitter', 'https://twitter.com/sgnn7')
                           },
            };
};

var Scroller = function(target){
    hostline = "root@" + (window.location.hostname || 'localhost');
    bash_prompt = '<b><font color="#6CDA33">' + hostline + '</font><font color="#FFF5E3">:</font><font color="#4444ff">~</font><font color="#FFF5E3">$ </font></b>';

    commands = new Commands(hostline, 'sg', 'sg');

    textSpeed = 18;
    textStartSpeed = 800;
    newlineSpeed = 400;
    promptDelay = 1000;

    textPos = 0;
    typed_text = '<b>thsdad</b> asdf asdf dfsa dasdsfagdgad is\nis\na\ntest!\npoweroff';

    commandList = ['ls_home', 'poweroff'];

    cursorSpeed = 500;
    cursorShowing = false;
    cursorStates = ['_', ' '];

    addTextInstant = function(line) {
        console.log(target);
        var oldText = document.getElementById(target).innerHTML || ""
        document.getElementById(target).innerHTML = oldText + line;
    };

    addPrompt = function() {
        addTextInstant(bash_prompt);
    };

    updateCursorState = function(text) {
        var oldText = document.getElementById(target).innerHTML || "";

        if (!text) {
            oldText += " ";
        }

        this.cursorShowing = !this.cursorShowing;

        newText = oldText.substring(0, oldText.length - 1) + this.cursorStates[ this.cursorShowing ? 0 : 1 ];
        document.getElementById(target).innerHTML = newText;
        setTimeout(function() {
                        this.updateCursorState(newText);
                   },
                   this.cursorSpeed);
    };

    appendText = function() {
        this.addTextInstant(this.typed_text.substring(this.textPos,this.textPos + 1));

        if (this.textPos <= this.typed_text.length) {
            this.textPos++;
            if (this.typed_text.substring(this.textPos - 1, this.textPos) == "\n") {
                setTimeout(function() {
                                this.addPrompt();
                                setTimeout(this.appendText, textStartSpeed);
                           },
                           this.newlineSpeed);
            } else {
                setTimeout(this.appendText, this.textSpeed);
            }
        } else {
            this.updateCursorState();
        }
    };

    // New eventing

    typeCommand = function(command, index) {
        addTextInstant(command.typedCommand + '\n');

        setTimeout(function() {
                       printCommandOutput(command, index);
                   },
                   command.hesitation);
    };

    // Prints the prompt and executes a single command and displays it's output
    printCommandOutput = function(command, index) {
        addTextInstant(command.output);
        addTextInstant('\n\n');

        setTimeout(function() {
                       executeCommands(index + 1);
                   },
                   promptDelay);
    };

    // Prints the prompt, types the command, and then executes it
    executeCommand = function(index) {
        commandName = commandList[index];
        command = commands[commandName];
        console.log('Command: ' + commandName);

        addPrompt();

        setTimeout(function() {
                       typeCommand(command, index);
                   },
                   command.startDelay);
    };

    // Executes one command at a time from the commandList
    executeCommands = function(index) {
        if (!index)
            index = 0;

        if (index >= commandList.length)
            return;

        executeCommand(index);
    };

    executeCommands();
}

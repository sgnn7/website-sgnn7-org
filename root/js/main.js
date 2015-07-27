// TODO: Move all the styling into CSS classes
var Commands = function(hostline, user, group) {
    // Various dd parameters
    exponent = Math.floor((Math.random() * 4));
    hd_size = 64 << exponent;            // Random but within the specified range
    dd_duration = (hd_size >> 6) * 500;  // Make the base length stable
    dd_device = 'sda'                    // This probably won't gain 'coolness' from changing
    dd_block_size = 4                    // Assumed MB

    var SoftLink = function (user, group, source, target) {
        return 'lrwxrwxrwx   1 ' + user + '    ' + group + '   35 Mar 29  2013 ' +
               '<b><font color="#28b0b0">' + source + '</font></b>' +
               ' -> ' +
               '<b><font color=#4444ff><a href=' + target + '>' + target + '</a></font></b>';
    }

    var DDCopyOutput = function (device, size_gb, block_size, duration) {
        records = (size_gb << 10) / block_size;
        variance = Math.random();
        true_duration = duration/1000.0 + variance;
        throughput = size_gb / true_duration;

        // This is stupid but JS seems to roll over at a certain point for ints 2^32 < x < 2^64
        // so we do this digit-trim hack to display it correctly
        bytes_copied = (size_gb << 20) / 1000;
        bytes_copied <<= 10;

        return records + '+0 records in\n' +
               records + '+0 records out\n' +
               bytes_copied + '000 bytes (' + size_gb + ' GB) copied, ' +
                 true_duration.toFixed(5) + ' s, ' + throughput.toFixed(1) + ' GB/s';
    }

    return { 'poweroff':     { typedCommand: "poweroff",
                               startDelay: 1250,
                               hesitation: 200,
                               duration: 0,
                               output: "\nBroadcast message from " + hostline + "\n\t\t(/dev/pts/0) at " +
                                       new Date().getHours() + ":" + new Date().getMinutes() + "...\n\n" +
                                       "The system is going down for halt NOW!"
                             },
             'ls_home':      { typedCommand: 'ls ~' + user,
                               startDelay: 1250,
                               hesitation: 200,
                               duration: 100,
                               output: 'drwx------ 113 ' + user + '    ' + group + '    36864 Jul 24 22:38 .\n' +
                                       'drwxr-xr-x   6 root root   4096 Jan  6  2015 ..\n' +
                                       SoftLink(user, group, 'github', 'https://github.com/sgnn7') + '\n' +
                                       SoftLink(user, group, 'twitter', 'https://twitter.com/sgnn7')
                             },
             'dd_partition': { typedCommand: 'dd if=/dev/urandom of=/dev/' + dd_device + ' bs=' + dd_block_size + 'M',
                               startDelay: 1200,
                               hesitation: 200,
                               duration: dd_duration,
                               output: DDCopyOutput(dd_device, hd_size, dd_block_size, dd_duration)
                             },
            };
};

var Scroller = function(target){
    hostline = "root@" + (window.location.hostname || 'localhost');
    bash_prompt = '<b><font color="#ACFA33">' + hostline + '</font><font color="#FFF5E3">:</font><font color="#4444ff">~</font><font color="#FFF5E3">$ </font></b>';

    commands = new Commands(hostline, 'sg', 'sg');

    textSpeed = 18;
    textStartSpeed = 800;
    newlineSpeed = 400;
    promptDelay = 1000;

    textPos = 0;
    typed_text = '<b>thsdad</b> asdf asdf dfsa dasdsfagdgad is\nis\na\ntest!\npoweroff';

    commandList = ['ls_home', 'dd_partition', 'poweroff'];

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

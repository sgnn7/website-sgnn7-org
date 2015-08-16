// TODO: Move all the styling into CSS classes
var Commands = function(hostline, user, group) {
    // Various dd parameters
    exponent = Math.floor((Math.random() * 4));
    hd_size = 64 << exponent;            // Random but within the specified range
    dd_duration = (hd_size >> 6) * 500;  // Make the base length stable
    dd_device = 'sda'                    // This probably won't gain 'coolness' from changing
    dd_block_size = 4                    // Assumed MB

    var formatSpaces = function (name, spaces) {
        emptyString = '';
        while (emptyString.length < spaces) emptyString += ' ';

        return (name + emptyString).slice(0, spaces);
    }

    var padNumber = function (value, spaces) {
        emptyString = '';
        while (emptyString.length < spaces) emptyString += '0';

        return (emptyString + value).slice(('' + value).length);
    }

    var softLink = function (user, group, source, target) {
        return 'lrwxrwxrwx   1 ' + formatSpaces(user, 5) + ' ' + formatSpaces(group, 5) + '    35 Mar 29  2013 ' +
               '<p class="softlink">' + source + '</p>' +
               ' -> ' +
               '<a class="softlink-target" href=' + target + '>' + target + '</a>';
    }

    var ddCopyOutput = function (device, size_gb, block_size, duration) {
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
                                       padNumber(new Date().getHours(), 2) + ":" +
                                       padNumber(new Date().getMinutes(), 2) + "...\n\n" +
                                       "The system is going down for halt NOW!"
                             },
             'get_users':    { typedCommand: 'cat /etc/passwd | grep \'/home/\' | grep \'^[^:]*:x:[0-9]\\{4\\}:\' | awk -F: \'{print $1}\'',
                               startDelay: 1250,
                               hesitation: 200,
                               duration: 100,
                               output: user
                             },
             'ls_home':      { typedCommand: 'ls -la ~' + user,
                               startDelay: 1250,
                               hesitation: 200,
                               duration: 100,
                               output: 'drwx------ 113 ' + formatSpaces(user, 5) + ' ' + formatSpaces(group, 5) + ' 36864 Jul 24 22:38 .\n' +
                                       'drwxr-xr-x   6 ' + formatSpaces('root', 5) + ' ' + formatSpaces('root', 5) + '  4096 Jan  6  2015 ..\n' +
                                       softLink(user, group, 'github', 'https://github.com/sgnn7') + '\n' +
                                       softLink(user, group, 'twitter', 'https://twitter.com/sgnn7') + '\n' +
                                       softLink(user, group, 'linkedin', 'https://linkedin.com/in/sgnn7')
                             },
             'dd_partition': { typedCommand: 'dd if=/dev/urandom of=/dev/' + dd_device + ' bs=' + dd_block_size + 'M',
                               startDelay: 1200,
                               hesitation: 3000,
                               duration: dd_duration,
                               output: ddCopyOutput(dd_device, hd_size, dd_block_size, dd_duration)
                             },
            };
};

var Scroller = function(target){
    hostline = "root@" + (window.location.hostname || 'localhost');
    bash_prompt = '<p class="prompt-hostline">' + hostline + '</p><p style="prompt-normal">:</p><p class="prompt-path">~</p><p class="prompt-normal"># </p>';

    commands = new Commands(hostline, 'sg', 'sg');

    textSpeed = 19;
    textSpeedJitter = 12;
    textStartSpeed = 800;
    newlineSpeed = 400;
    promptDelay = 1000;

    textPos = 0;

    commandList = ['get_users', 'ls_home', 'dd_partition', 'poweroff'];

    cursorSpeed = 500;
    cursorShowing = false;
    cursorStates = ['_', ' '];

    addTextInstant = function(text) {
        // console.log(target);

        var oldText = document.getElementById(target).innerHTML || "";
        document.getElementById(target).innerHTML = oldText + text;
    };

    removeCursor = function() {
        var oldText = document.getElementById(target).innerHTML || "";
        document.getElementById(target).innerHTML = oldText.substring(0, oldText.length - 1);
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

    addTypedText = function(typedText, commandIndex, originalText, textIndex) {
        // Could have assumed ECMA6 and done default params but this is more compatible
        if (!originalText)
            originalText = document.getElementById(target).innerHTML || "";

        if (!textIndex)
            textIndex = 0;

        this.addTextInstant(typedText.substring(textIndex, textIndex + 1));

        if (textIndex <= typedText.length) {
            textIndex++;
            if (typedText.substring(textIndex - 1, textIndex) == '\n') {
                this.addTextInstant('_');
                setTimeout(function() {
                               printCommandOutput(command, commandIndex);
                           },
                           command.hesitation);
            } else {
                randomJitter = this.textSpeedJitter * Math.random();
                jitteredTextSpeed = this.textSpeed + (randomJitter / 2);

                // console.log("Jitter:", jitteredTextSpeed);

                setTimeout(function() {
                               this.addTypedText(typedText, commandIndex, originalText, textIndex);
                           },
                           jitteredTextSpeed);
            }
        }
    };

    typeCommand = function(command, index) {
        addTypedText(command.typedCommand + '\n', index);
    };

    // Prints the prompt and executes a single command and displays it's output
    printCommandOutput = function(command, commandIndex) {
        removeCursor();
        addTextInstant(command.output);
        addTextInstant('\n\n');

        setTimeout(function() {
                       executeCommands(commandIndex + 1);
                   },
                   promptDelay);
    };

    // Prints the prompt, types the command, and then executes it
    executeCommand = function(commandIndex) {
        commandName = commandList[commandIndex];
        command = commands[commandName];
        console.log('Command: ' + commandName);

        addPrompt();

        setTimeout(function() {
                       typeCommand(command, commandIndex);
                   },
                   command.startDelay);
    };

    // Executes one command at a time from the commandList
    executeCommands = function(commandIndex) {
        if (!commandIndex)
            commandIndex = 0;

        if (commandIndex >= commandList.length)
            return;

        executeCommand(commandIndex);
    };

    executeCommands();
}

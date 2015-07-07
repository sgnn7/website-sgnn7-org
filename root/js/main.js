var Commands = function(hostline) {
    return { 'poweroff':   { command: "poweroff",
                             hesitation: 100,
                             output: "\nBroadcast message from " + hostline + "\n\t\t(/dev/pts/0) at " + new Date().getHours() + ":" + new Date().getMinutes() + "...\n\nThe system is going down for halt NOW!"}
            };
};

var Scroller = function(target){
    hostline = "root@" + window.location.hostname;
    prompt = '<b><font color="#6CDA33">' + hostline + '</font><font color="#FFF5E3">:</font><font color="#6F9BC8">~</font><font color="#FFF5E3">$ </font></b>';

    commands = new Commands(hostline);

    text_speed = 18;
    text_start_speed = 800;
    newline_speed = 400;

    text_pos = 0;
    typed_text = '<b>thsdad</b> asdf asdf dfsa dasdsfagdgad is\nis\na\ntest!\npoweroff';

    cursor_speed = 500;
    cursor_showing = false;
    cursor_states = ['_', ' '];

    addTextInstant = function(line) {
        console.log(target);
        var oldText = document.getElementById(target).innerHTML || ""
        document.getElementById(target).innerHTML = oldText + line;
    };

    addPrompt = function() {
        addTextInstant(prompt);
    };

    updateCursorState = function(text) {
        var oldText = document.getElementById(target).innerHTML || "";

        if (!text) {
            oldText += " ";
        }

        this.cursorShowing = !this.cursorShowing;

        newText = oldText.substring(0, oldText.length - 1) + this.cursor_states[ this.cursorShowing ? 0 : 1 ];
        document.getElementById(target).innerHTML = newText;
        setTimeout(function() {
                        this.updateCursorState(newText);
                   },
                   this.cursor_speed);
    };

    appendText = function() {
        this.addTextInstant(this.typed_text.substring(this.text_pos,this.text_pos + 1));

        if (this.text_pos <= this.typed_text.length) {
            this.text_pos++;
            if (this.typed_text.substring(this.text_pos - 1, this.text_pos) == "\n") {
                setTimeout(function() {
                                this.addPrompt();
                                setTimeout(this.appendText, text_start_speed);
                           },
                           this.newline_speed);
            } else {
                setTimeout(this.appendText, this.text_speed);
            }
        } else {
            this.updateCursorState();
        }
    };

    addPrompt();
    appendText();
}

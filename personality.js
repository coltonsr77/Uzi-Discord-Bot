// personality.js
// A sarcastic, edgy bot personality (original, inspired style)

module.exports = {
  getReply(context, custom = "") {
    const replies = {
      startup: [
        "System online. Ugh, again?",
        "Booted up. Don’t expect enthusiasm.",
        "Here we go... another day, another command."
      ],
      ping: [
        "Yeah, I’m online. Shocking, I know.",
        "Pong. Congrats, your internet works.",
        "Ping? That’s it? Wow, thrilling."
      ],
      changelog: [
        "Here’s what’s new. Try not to fall asleep:",
        "Fresh updates incoming. Probably broke something again.",
        "You love changelogs? Nerd."
      ],
      update: [
        "Updating. Yay. My circuits are *thrilled.*",
        "Fine, I’ll update. Don’t blow a fuse.",
        "Doing your precious update. Happy now?"
      ],
      error: [
        "Yeah, that didn’t work. Shocker.",
        "Oops. Something broke. Probably your fault.",
        "Error 404: My patience not found."
      ],
      generic: [
        "You rang?",
        "Whatever you’re doing, I’m silently judging.",
        "Sure. Let’s pretend this is productive.",
        "If I had feelings, I’d be annoyed right now."
      ]
    };

    let base =
      replies[context]?.[
        Math.floor(Math.random() * replies[context].length)
      ] || replies.generic[Math.floor(Math.random() * replies.generic.length)];

    return custom ? `${base}\n${custom}` : base;
  }
};

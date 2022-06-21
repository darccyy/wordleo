import fs from "fs";
import readline from "readline";

async function main(): Promise<void> {
  var answers = fs
      .readFileSync(__dirname + "/answers.txt")
      .toString()
      .split("\r\n"),
    accepted = fs
      .readFileSync(__dirname + "/accepted.txt")
      .toString()
      .split("\r\n"),
    warning = "";

  // Game loop
  Game: while (true) {
    var answer = randomItem(answers),
      grid: string[] = [],
      firstTitle = true,
      state = "play";

    // Guess loop
    while (true) {
      // Title
      clear();
      var title = "\x1b[36;3m┌VORTO┐\x1b[0m";
      if (firstTitle) {
        for (var l = 0; l < title.length; l++) {
          await sleep(l ? 30 : 80); // Time between characters
          process.stdout.write(title[l]);
        }
      } else {
        process.stdout.write(title);
      }
      firstTitle = false;

      // Warning
      if (warning) {
        await sleep(firstTitle ? 100 : 30); // Time before warning
        console.log(" \x1b[33m" + warning);
      } else {
        console.log();
      }

      // Generate lines
      var print: string[] = [];
      for (var l = 0; l < grid.length; l++) {
        var line = "\x1b[36m│\x1b[0m"; // Border

        for (var c = 0; c < grid[l].length; c++) {
          if (!grid[l]?.[c]) {
            line += " "; // Blank
            continue;
          }

          // Color
          if (answer[c] === grid[l][c]) {
            line += "\x1b[32m"; // Green
          } else if (answer.includes(grid[l][c])) {
            line += "\x1b[33m"; // Yellow
          } else {
            line += "\x1b[0m"; // White / Default
          }

          line += grid[l][c] + "\x1b[0m"; // Letter
        }

        line += "\x1b[36m│\x1b[0m"; // Border
        print.push(line);
      }

      // Print lines
      if (warning) {
        // All lines
        process.stdout.write(print.join("\n"));
        if (print.length > 0) {
          process.stdout.write("\n");
        }
      } else {
        // All but last
        process.stdout.write(print.slice(0, -1).join("\n"));
        // Last, slow
        var last = print.slice(-1)[0];
        if (last) {
          if (print.length > 1) {
            process.stdout.write("\n");
          }
          for (var c = 0; c < last.length; c++) {
            if (c) {
              await sleep(17); // Time between characters
            }
            process.stdout.write(last[c]);
          }
          process.stdout.write("\n");
        }
      }

      if (state === "loss") {
        await input("\x1b[36m└\x1b[31;1mPERDO\x1b[0m\x1b[36m┘\x1b[0m");
        warning = "";
        break;
      } else if (state === "win") {
        await input("\x1b[36m└\x1b[32;1mVENKO\x1b[0m\x1b[36m┘\x1b[0m");
        warning = "";
        break;
      }

      // Win
      if (answer === grid[grid.length - 1]) {
        state = "win";
        warning = "\x1b[32mBona!";
        continue;
      }

      // Loss
      if (grid.length >= 6) {
        state = "loss";
        warning = "Estis: \x1b[3m'" + answer + "'";
        continue;
      }

      // Guess
      var guess = await input("\x1b[36m└\x1b[0m");

      // Command with '/'
      if (guess && guess.startsWith("/")) {
        // New game '/'
        if (guess.length === 1) {
          warning = "Estis: \x1b[3m'" + answer + "'";
          continue Game;
        }
        // Answer '//'
        if (guess[1] === "/") {
          warning = "\x1b[31mEstas: \x1b[3m'" + answer + "'";
          continue;
        }
        if (guess[1] === "?") {
          grid.push(randomItem(answers));
          continue;
        }
        // Unknown command
        warning = "Ne estas ordono";
        continue;
      }
      // Must be 5 letters
      if (!guess || guess.length !== 5) {
        warning = "Devas esti 5 literoj";
        continue;
      }
      // Must be in broad word list
      if (!answers.includes(guess) && !accepted.includes(guess)) {
        warning = "Ne estas vorto";
        continue;
      }
      // Accepted
      grid.push(guess);
      warning = "";
    }
  }
}
main();

// Wait for user input
function input(prompt: string) {
  return new Promise<string | null>(resolve => {
    const rl = readline.createInterface(process.stdin, process.stdout);
    rl.question(prompt, text => {
      resolve(text);
      rl.close();
    });
  });
}

// Clear console
function clear(): void {
  console.log("\n".repeat(Math.max(0, process.stdout.rows - 1)));
  readline.cursorTo(process.stdout, 0, 0);
  readline.clearScreenDown(process.stdout);
}

// Get random item of array
function randomItem(array: any[]): any {
  return array[Math.floor(Math.random() * array.length)];
}

// Sleep program (ms)
function sleep(time: number) {
  return new Promise<void>(resolve => {
    setTimeout(resolve, time);
  });
}

import fs from "fs";

var words = fs
  .readFileSync(__dirname + "/../answers.txt")
  .toString()
  .split("\r\n")
  .concat(
    fs
      .readFileSync(__dirname + "/../accepted.txt")
      .toString()

      .split("\r\n"),
  );

var letters: any = {};
for (var i = 0; i < words.length; i++) {
  var word = words[i];
  for (var c = 0; c < word.length; c++) {
    if (!letters[word[c]]) {
      letters[word[c]] = 1;
    } else {
      letters[word[c]]++;
    }
  }
}

var sorted: [string, number][] = [],
  total = 0;
for (var l in letters) {
  sorted.push([l, letters[l]]);
  total += letters[l];
}
sorted.sort(function (a, b) {
  return b[1] - a[1];
});

var max = sorted[0][1];
for (var i = 0; i < sorted.length; i++) {
  var [letter, value] = sorted[i];
  console.log(
    letter,
    "■".repeat(Math.ceil((value / max) * 30)),
    Math.round((value / total) * 10000) / 100 + "%",
  );
}

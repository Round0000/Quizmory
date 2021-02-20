let db = [];

fetch("https://api.jsonbin.io/b/6030d5b07c58305d3957836a/latest")
  .then((res) => res.json())
  .then((data) =>
    data.forEach((item) => {
      db.push(item);
    })
  );

function getRandom(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

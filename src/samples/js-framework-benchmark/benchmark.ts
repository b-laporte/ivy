interface Data {
  id: number;
  label: string;
}

let startTime: number;
let lastMeasure: string;
let startMeasure = function (name: string) {
  startTime = performance.now();
  lastMeasure = name;
}
let stopMeasure = function () {
  var last = lastMeasure;
  if (lastMeasure) {
    window.setTimeout(function () {
      lastMeasure = '';
      var stop = performance.now();
      console.log(last + " took " + (stop - startTime));
    }, 0);
  }
}

export class Benchmark {
  renderer: any;
  data: Array<Data> = [];
  selected: number = -1;
  id: number = 1;

  constructor(renderer: any) {
    this.renderer = renderer;
  }

  refresh() {
    this.renderer.refresh({benchmark: this});
    stopMeasure();
  }

  private buildData(count: number = 1000): Array<Data> {
    var adjectives = ["pretty", "large", "big", "small", "tall", "short", "long", "handsome", "plain", "quaint", "clean", "elegant", "easy", "angry", "crazy", "helpful", "mushy", "odd", "unsightly", "adorable", "important", "inexpensive", "cheap", "expensive", "fancy"];
    var colours = ["red", "yellow", "blue", "green", "pink", "brown", "purple", "brown", "white", "black", "orange"];
    var nouns = ["table", "chair", "house", "bbq", "desk", "car", "pony", "cookie", "sandwich", "burger", "pizza", "mouse", "keyboard"];
    var data: Array<Data> = [];
    for (var i = 0; i < count; i++) {
      data.push({ id: this.id, label: adjectives[this._random(adjectives.length)] + " " + colours[this._random(colours.length)] + " " + nouns[this._random(nouns.length)] });
      this.id++;
    }
    return data;
  }

  private _random(max: number) {
    return Math.round(Math.random() * 1000) % max;
  }

  select(item: Data, event: Event) {
    startMeasure("select");
    event.preventDefault();
    this.selected = item.id;
    this.refresh();
  }

  delete(item: Data, event: Event) {
    event.preventDefault();
    startMeasure("delete");
    for (let i = 0, l = this.data.length; i < l; i++) {
      if (this.data[i].id === item.id) {
        this.data.splice(i, 1);
        break;
      }
    }
    this.refresh();
  }

  run() {
    startMeasure("run");
    this.data = this.buildData();
    this.refresh();
  }

  add() {
    startMeasure("add");
    this.data = this.data.concat(this.buildData(1000));
    this.refresh();
  }

  update() {
    startMeasure("update");
    for (let i = 0; i < this.data.length; i += 10) {
      this.data[i].label += ' !!!';
    }
    this.refresh();
  }
  runLots() {
    startMeasure("runLots");
    this.data = this.buildData(10000);
    this.selected = -1;
    this.refresh();
  }
  clear() {
    startMeasure("clear");
    this.data = [];
    this.selected = -1;
    this.refresh();
  }
  swapRows() {
    startMeasure("swapRows");
    if (this.data.length > 10) {
      var a = this.data[4];
      this.data[4] = this.data[9];
      this.data[9] = a;
    }
    this.refresh();
  }
}
import Immutable, {List} from 'immutable';

function updateById(list, id, update) {
  var apn = list.map(function(component) {
    if(component.get('id') === id) {
      return update(component);
    } else {
      return component;
    }
  });
  return apn;
}

class AppStore {
  constructor()
  {
    var old = JSON.parse(localStorage['current'] || '[]');

    if(old && old.length > 0) {
      this.state = Immutable.fromJS(old);
      this.nextID = this.state.last().get('id') + 1;
    } else {
      this.nextID = 0;
      this.state = this.startList();
    }

    this.subscriptions = [];
  }

  getState() {
    return this.state;
  }

  concentricComponent(offset=false,[r,g,b]=["20","20","120"]) {
    var freqString = "freq(2*n + " + (offset ? 0 : 1) + ")";
    return Immutable.fromJS({
      id: this.nextID++,
      name: "Concentric" + this.nextID,
      shape: "circle", 
      points: [],
      polar: false,
      active: true,
      // Radian
      theta: "n",
      r: "100",
      // Rectangular
      x: String(window.innerWidth / 2),
      y: String(window.innerHeight / 2), 
      center: ["200","200"],
      fill: false,
      width: "10",
      height: "10",
      rotation: "0",
      color: {
        r: r + " + 72*sin(" + freqString + "/4.7)",
        g: g + " + 12*sin(" + freqString + "/2.2)",
        b: b + " + 54*sin(" + freqString + "/3.5)"
      },
      count: "80",
      radius: (offset ? 0 : 5) + " + 13/7*abs(" + freqString + ") + n*14"
    })
  }

  psychodelicComponent() {
    var freqString = "freq(n)";
    return Immutable.fromJS({
      name: "Spiral",
      id: this.nextID++,
      shape: "rectangle", 
      points: [],
      polar: true,
      active: true,
      // Radian
      theta: "n + (t + freq(n)/72)/1987",
      r: "n + abs(freq(n*3))",
      // Rectangular
      x: "100+n*4", 
      y: "200",
      center: [window.innerWidth/2,window.innerHeight/2],
      fill: true,
      width: "0.7*freq(4*n,4)",
      height: "0.7*freq(4*n,4)",
      rotation: "0.2*73329123%(n*734)+t/700",
      color: {
        r: 200 + " + 65*sin(" + freqString + "/3.7)",
        g: 12 + " + 122*sin(" + freqString + "/9.2)",
        b: 70 + " + 74*sin(" + freqString + "/9.5)"
      },
      count: "240",
      radius: 0
    })
  }

  timeWaveComponent() {
    return Immutable.fromJS({
      name: "Time Wave",
      id: this.nextID++,
      shape: "rectangle", 
      points: [],
      polar: false,
      active: false,
      // Radian
      theta: "n",
      r: "100",
      // Rectangular
      x: "n", 
      y: "400 - 1000*time(n)/2",
      center: ["200","200"],
      fill: true,
      width: "1",
      height: "1000*time(n)",
      rotation: "0",
      color: {
        r: "2",
        g: "200",
        b: "2",
      },
      count: "1024",
      radius: 0
    })
  }
  polarComponent() {
    return Immutable.fromJS({
      id: this.nextID++,
      name: "Radial",
      shape: "polygon", 
      variables: [
        ["f5","freq(5*n,5)"],
        ["pieces", "27"]
      ],
      points: [
        ["0","0"],
        ["2*3.14*n/pieces","1.7*f5"],
        ["2*3.14*(n+1)/pieces","1.7*f5"],
      ],
      active: true,
      fill: true,
      polar: true,
      // Radian
      theta: "n*12",
      r: "freq(n)",
      // Rectangular
      center: [String(window.innerWidth-500),"150"],
      x: "40", 
      y: "600", 
      width: "10",
      height: "10",
      rotation: "0",
      radius: "10",
      color: {r: "355+4.5*freq(5*n,5)", g: "0", b: "0"},
      count: "27"
    });
  }

  barComponent() {
    return Immutable.fromJS({
      name: "Bars",
      id: this.nextID++,
      shape: "rectangle", 
      polar: false,
      active: true,
      points: [],
      variables: [["color", "200+freq(n)"]],
      // Radian
      theta: "n",
      r: "100",
      // Rectangular
      x: "0+n*4", 
      y: String(window.innerHeight),
      center: ["200","200"],
      fill: true,
      width: "4",
      height: "1.5*freq(4*n,4)",
      rotation: "0",
      color: {
        r: "color*(n%3)",
        g: "color*((n+2)%3)",
        b: "color*((n+1)%3)"
      },
      count: window.innerWidth / 4,
      radius: 0
    })
  }

  boxComponent() {
    return Immutable.fromJS({
      name: "Box",
      id: this.nextID++,
      shape: "rectangle", 
      polar: false,
      active: true,
      points: [],
      variables: [
        ["x0", "40 + (n%10)*20"],
        ["y0", "40 + floor(n/10)*20"]
      ],
      // Radian
      theta: "n",
      r: "100",
      // Rectangular
      x: "x0+40*sin((freq(x0))/120+4.5)", 
      y: "y0+40*sin((freq(y0))/120+4.5)", 
      center: ["200","200"],
      fill: true,
      width: "20",
      height: "20",
      rotation: "0",
      color: {
        r: "min((220+4.5*freq(x0,5)),20)",
        g: "min((220+4.5*freq(1024-x0,5)),20)",
        b: "min((120+4.5*freq(n,5)),20)"
      },
      count: 100,
      radius: 0
    })
  }

  startList() {
    return List([
      this.psychodelicComponent(),
      this.concentricComponent(false,["123","0","213"]),
      this.concentricComponent(true,["20","12","123"]),
      this.polarComponent(),
      this.barComponent(),
      this.boxComponent(),
      this.timeWaveComponent()
    ])
  }
  subscribe(f) {
    this.subscriptions.push(f);
  }

  save() {
    localStorage['current'] =  JSON.stringify(this.state);
  }

  notify() {
    this.subscriptions.forEach(f => f(this.state));
  }

  action(command,payload=null) {
    switch(command) {
      case 'ADD_COMPONENT': 
        if(!payload) {
          this.state = this.state.push(this.polarComponent());
        } else {
          payload['id'] = this.nextID++;
          var component = Immutable.fromJS(payload);
          this.state = this.state.push(component);
        }
        break;
      case 'REMOVE_COMPONENT':
        this.state = this.state.filter(o => o.get('id') !== payload.id)
        break;
      case 'UPDATE_COMPONENT':
        this.state = updateById(this.state, payload.id, 
          function(component) {
            return component.merge(payload)
          })
        break;
      case 'ADD_VARIABLE':
        this.state = updateById(this.state, payload.id, 
          function(component) {
            const variables = component.get('variables') || List(),
              lastKey = component.get('lastKey') || -1,
              nextKey = lastKey + 1;


            return component.merge({
              "lastKey": nextKey,
              "variables": variables.push(List(["var-" + nextKey, "freq(n)"]))
            })
          })
        break;
      default: 
        break;
    }
    this.save();
    this.notify();
  }
}

export default AppStore;

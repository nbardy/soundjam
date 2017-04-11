import injectTouchTapPlugin from 'react-tap-event-plugin';
import React, { Component } from 'react';
import {List} from 'immutable';

import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import {Card       , CardHeader  , CardText} from 'material-ui/Card';

import { RaisedButton , TextField  , FlatButton           ,
         SelectField  , MenuItem   , FloatingActionButton , 
         AppBar       , IconButton , Toggle               ,
         Dialog       , Paper   } 
from 'material-ui';

import ExpandMore from 'material-ui/svg-icons/navigation/expand-more';
import ExpandLess from 'material-ui/svg-icons/navigation/expand-less';
import Stop from 'material-ui/svg-icons/av/stop';
import Play from 'material-ui/svg-icons/av/play-arrow';
import Pause from 'material-ui/svg-icons/av/pause';
import Help from 'material-ui/svg-icons/action/help-outline';

import {Parser} from 'expr-eval';
import Spinner    from 'react-spinkit';

import once from 'once-event';

import mp3url from './downtheroad.mp3'; // Tell Webpack this JS file uses this image

import './App.css';

import './modernizr-custom.js'
var Modernizr = window.Modernizr;

injectTouchTapPlugin();

var SHAPES = ["circle","rectangle","polygon"];
// Memoize
var parsers = {};

if(detectMobile()) {
  alert("Warning: Mobile support dubios at best.")
}

function titleCase(string) { 
  return string.charAt(0).toUpperCase() + string.slice(1);
}

function setIntervalX(callback, delay, repetitions, done) {
  var x = 0;
  var intervalID = window.setInterval(function () {
    callback();
    if (++x === repetitions) {
      window.clearInterval(intervalID);
      done();
    }
  }, delay);
}

function EvalError(parseString, error) {
  this.name = 'EvalError';
  this.message = "Eval error: " + error + "in :\n" + parseString;
  this.stack = (new Error()).stack;
}

EvalError.prototype = Object.create(Error.prototype);
// eslint-disable-next-line
EvalError.prototype.constructor = EvalError;

var evalf = function(string,value) {
  if(!parsers[string]) {
    parsers[string] = Parser.parse(string);
  }
  try {
    return parsers[string].evaluate(value);
  }
  catch(error) {
    throw new EvalError(string, error);
  }
} 

function toRect([theta,r],[xcenter,ycenter]=[0,0]) {
  return [xcenter + r * Math.cos(theta), ycenter + r * Math.sin(theta)];
}

class SimpleDialog extends Component {
  render() {
    return (
      <Dialog
        title={this.props.title}
        actions={[
          <FlatButton 
            label="Close"
            primary={true} 
            onTouchTap={() => this.props.setOpen(false)} />]}
        modal={this.props.modal || false}
        open={this.props.open}
        onRequestClose={() => this.props.setOpen(false)}>
        {this.props.children}
      </Dialog>
    );
  }
}

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      importDialogue: false,
      functionDialogue: false,
      importString: "",
      focusLast: "",
      width: window.innerWidth,
      height: window.innerHeight
    };
  } 

  importComponent() {
    this.props.store.action('ADD_COMPONENT', 
      JSON.parse(this.state.importString))
    this.setState({importDialogue: false});
  }

  openDialogue(name) {
    var state = {};
    state[name + 'Dialogue'] = true;
    this.setState(state);
  }

  closeDialogue(name) {
    var state = {};
    state[name] = false;
    this.setState(state);
  }

  addComponent() {
    this.setState({hasNew: true})
    const _this = this;
    once(document.body, "click", () => { _this.setState({hasNew: false})})
    this.props.store.action('ADD_COMPONENT');
  }

  componentDidMount() {
    // Might want to remove this on unmount. Currently this node never unmounts so its not a problem
    document.body.onresize = (function() { 
      this.setState({
        width: window.innerWidth, 
        height: window.innerHeight})
    }).bind(this)
  }


  render() {
    const actions = [
      <FlatButton 
        label="Import"
        primary={true} 
        onTouchTap={() => this.importComponent()} />,
      <FlatButton 
        label="Cancel"
        primary={true} 
        onTouchTap={() => this.setState({importDialogue: false})} />];

    return (
      <MuiThemeProvider>
        <div className="App">
          <Visualizer 
            width={this.state.width} height={this.state.height}
            components={this.props.components} />
          <Drawer width={340} side="right" label="Components">
            <div id="components">
              {this.props.components.map((v,i) => 
                <EditableComponent 
                  key={v.get('id')}
                  focus={(v === this.props.components.last() && 
                            this.state.hasNew)
                            ? true : false}
                  store={this.props.store}
                  value={v} />)}
            </div>
            <RaisedButton 
              onClick={(e,v) => this.addComponent()} 
              primary={true} 
              label="Add Component"/>
            <RaisedButton 
              onClick={(e,v) => this.setState({importDialogue: true})} 
              primary={true} 
              label="Import Component"/>
            <RaisedButton 
              onClick={(e,v) => this.setState({functionDialogue: true})} 
              primary={true} 
              label="Available Functions"/>
          </Drawer>
          <SimpleDialog
            title="Available Functions/Values"
            setOpen={(v) => this.setState({functionDialogue: v})}
            open={this.state.functionDialogue}>
            <h4>The special function defined by soundjam are:</h4>
            <p><span className="code">freq(n[,count])</span>: Returns the value nth value in the <a href="https://developer.mozilla.org/en-US/docs/Web/API/AnalyserNode/getByteFrequencyData">FrequencyData </a> set. If count is supplied returns the mean of nth, nth+1,...,n+count.</p>
            <p><span className="code">time(n[,count])</span>: Returns the value nth value in the <a href="https://developer.mozilla.org/en-US/docs/Web/API/AnalyserNode/getFloatTimeDomainData">TimeData</a> set. If count is supplied returns the mean of nth, nth+1,...,n+count.</p>
            <h4>Special variables defined by sound are:</h4>
            <p><span className="code">t</span>: Equal to the time passed in milliseconds</p>
            <h4>Other functions</h4>
            <p>Evaluation is enabled by <a href="http://github.com/silentmatt/expr-eval">expr-eval</a>, so all functions defined by it are available including: <span className="code"> abs</span>,<span className="code">cos</span>, <span className="code">sin</span>, etc..
            </p>
          </SimpleDialog>
          <Dialog
            title="Import Component"
            actions={actions}
            modal={false}
            open={this.state.importDialogue}
            onRequestClose={() => this.setState({importDialogue: false})}>
            <TextField 
              id="import" 
              value={this.state.importString}
              onChange={(e) => 
                  this.setState({importString: e.target.value})}
              fullWidth={true} />
          </Dialog>
        </div>
      </MuiThemeProvider>
    );
  }
}

class EditOnClick extends Component {
  constructor(props) {
    super(props);
    this.state = {
      focus: false
    };
  }

  hasFocus() {
    return this.state.focus || this.props.focus;
  }

  componentDidUpdate() {
    if(this.hasFocus()) {
      this.input.focus();
    }
  }

  componentDidMount() {
    if(this.hasFocus()) {
      this.input.focus();
    }
  }

  render() {
    return (
      <div>
        <input 
          ref={(i) => this.input = i}
          style={{
            display: this.hasFocus() ? 'flex' : 'none',
            marginTop: -2,
            fontSize: 18,
            width: this.props.width | 170
          }}
          value={this.props.value} 
          onChange={(e) => this.props.onChange(e,e.target.value)}
          onBlur={() => this.setState({focus: false})} /> 
        <span 
          style={{
            display: this.hasFocus() ? 'none' : 'flex',
            fontSize: 18,
            color: this.props.value ? "inherit" : "grey",
            width: this.props.width | 170
          }}
          onClick={() => this.setState({focus: true})}>
          {this.props.value || this.props.placeHolder}
        </span>
      </div>
    );
  }
}

class EditableComponent extends Component {
  constructor(props) {
    super(props);
    this.state = {
      expanded: false,
    };
  }

  update(key,value) {
    var payload = { id: this.props.value.get('id') };
    payload[key] = value;
    this.props.store.action('UPDATE_COMPONENT', payload);
  }

  addVariable() {
    var payload = { id: this.props.value.get('id') };
    this.props.store.action('ADD_VARIABLE',payload);
  }

  remove() {
    var payload = { id: this.props.value.get('id') };
    this.props.store.action('REMOVE_COMPONENT', payload);
  }

  export() {
    window.prompt("Ctrl+C to copy to clipboard", JSON.stringify(this.props.value))
  }

  editProperty(prop) {
    // const update = this.update.bind(this);
    return (
      <TextField
        key={prop}
        value={this.props.value.get(prop)}
        onChange={(e,v) => this.update(prop,v)}
        floatingLabelFixed={true}
        floatingLabelText={titleCase(prop)} />
    );
  }

  renderShape() {
    const points = this.props.value.get('points'),
          shape = this.props.value.get('shape'),
          polar = this.props.value.get('polar');

    if(shape === "rectangle") {
      return (
        <div>
          {this.editProperty("width")}
          {this.editProperty("height")}
          {this.editProperty("rotation")}
        </div>
      );
    } else if(shape === "circle") {
      return this.editProperty("radius");
    } else if(shape === "polygon") {
      var pointsDom = [],
        update = this.update.bind(this);

      pointsDom.push(<h4> Points</h4>)

      points.forEach(function(pointPair,index) {
        pointsDom.push(
          <div className="thin-input">
            <TextField
              key={"0" + index}
              value={pointPair.get(0)}
              onChange={(e,v) => update('points', points.set(index,pointPair.set(0,v)))}
              floatingLabelFixed={true}
              floatingLabelText={polar ? "Theta" : "X"} />
            <TextField
              key={"1" + index}
              value={pointPair.get(1)}
              onChange={(e,v) => update('points', points.set(index,pointPair.set(1,v)))}
              floatingLabelFixed={true}
              floatingLabelText={polar ? "R" : "Y"} />
          </div>)
      })
      pointsDom.push(
        <RaisedButton 
          label="Add Point"
          primary={true} 
          onTouchTap={(e,v) => update('points', 
            points.push(List(["0","0"])))} />)

      return pointsDom;
    }
  }

  renderPosition() {
    const value = this.props.value,
      polar = this.props.value.get('polar'),
      shape = this.props.value.get('shape'),
      center = this.props.value.get('center');

    var positionDom = [];
    if(polar) {
      positionDom.push(
        <div>
          <h4>Center</h4>
          <div key="center" className="thin-input">
            <TextField value={center.get(0)}
              key="0"
              onChange={(e,v) => this.update('center',center.set(0,v))}
              floatingLabelFixed={true}
              fullWidth={true}
              floatingLabelText="X:" />
            <TextField value={center.get(1)}
              key="1"
              onChange={(e,v) => this.update('center',center.set(1,v))}
              fullWidth={true}
              floatingLabelFixed={true}
              floatingLabelText="Y:" />
          </div>
        </div>
      )
    }

    if(shape !== 'polygon') {
      if(polar) {
        positionDom.push(
          <div>
            {this.editProperty("r")}
            <br />
            <TextField value={value.get('theta')}
              onChange={(e,v) => this.update('theta',v)}
              floatingLabelFixed={true}
              floatingLabelText="Theta" />
          </div>)
      } else {
        positionDom.push(
          <div>
            {this.editProperty("x")}
            {this.editProperty("y")}
          </div>)
      }
    }

    return positionDom;
  }

  handleExpandChange = (expanded) => {
   this.setState({expanded: expanded});
  }

  render() {
    const value = this.props.value,
      variables = value.get('variables'),
      name  = value.get('name'),
      shape = value.get('shape'),
      color = value.get('color'),
      fill  = value.get('fill'),
      count = value.get('count');

    var customVariables = [];
    const update = this.update.bind(this);

    if(variables) {
      variables.forEach(function(variable,index) {
        const key = variable.get(0),
          value = variable.get(1);

        customVariables.push(
          <div key={index} className="custom-var">
            <TextField 
              name={"varname" + index}
              className="custom-var-name"
              value={key} 
              onChange={(e,newKey) => update('variables',
                variables.set(index,List([newKey,value])))} />
            <span>:</span>
            <TextField
              name={"varval" + index}
              className="custom-var-field"
              value={value}
              onChange={(e,newValue) => update('variables',
                variables.set(index,List([key,newValue])))} />
          </div>)
      })
    }

    return (
      <Card 
        expandable={true}
        expanded={this.state.expanded} 
        onExpandChange={this.handleExpandChange}
        className={"card-small " + (this.state.expanded ? "expanded": "")}>
        <CardHeader 
          openIcon={<ExpandLess/>}
          closeIcon={<ExpandMore/>}
          showExpandableButton={true}
          title={
            <div style={{display: "flex"}}>
              <Toggle
                style={{display: "flex", flexShrink: 1}}
                labelPosition="right"
                toggled={value.get('active')}
                onToggle={(e,v) => this.update('active',v)} />
              <EditOnClick 
                placeHolder={"Name..."}
                style={{display: "flex"}}
                value={name} 
                focus={this.props.focus}
                onChange={(e,v) => this.update('name',v )} />
            </div>}>
        </CardHeader>
        <CardText expandable={true}>
          <TextField
            key="count"
            value={count}
            onChange={(e,v) => this.update('count',v)}
            floatingLabelFixed={true}
            floatingLabelText="Numbers of elements" />
          <br />
          <SelectField value={shape} 
            onChange={(e,k,v) => this.update('shape',v)}>
            {SHAPES.map(v => 
                <MenuItem key={v} value={v} primaryText={v} />)}
          </SelectField>
          <Toggle label="Polar" toggled={value.get('polar')}
            onToggle={(e,v) => this.update('polar',v)} />
          <br />
          <RaisedButton 
            label="Add Custom Variable"
            primary={true} 
            onTouchTap={() => this.addVariable()} />
          {customVariables}
          <br />
          {this.renderPosition()}
          {this.renderShape()}
          <Toggle label="Fill" toggled={fill}
            onToggle={(e,v) => this.update('fill',v)}>
          </Toggle>
          <TextField
            key="red"
            value={color.get('r')}
            onChange={(e,v) => this.update('color',color.set('r',v))}
            floatingLabelFixed={true}
            floatingLabelText="Red" />
          <TextField
            key="blue"
            value={color.get('g')}
            onChange={(e,v) => this.update('color',color.set('g',v))}
            floatingLabelFixed={true}
            floatingLabelText="Green" />
          <TextField
            key="green"
            value={color.get('b')}
            onChange={(e,v) => this.update('color',color.set('b',v))}
            floatingLabelFixed={true}
            floatingLabelText="Blue" />
          <br />
          <RaisedButton 
            onClick={(e,v) => this.remove()} 
            primary={true} 
            label="Remove"/>
          <RaisedButton 
            onClick={(e,v) => this.export()} 
            primary={true} 
            label="Export"/>
        </CardText>
      </Card>
    );
  }
}

class Drawer extends Component {
  constructor(props) {
    super(props);
    this.state = {
      open: true
    };
  } 

  knobStyle() {
    return {
      width: 40,
      height: 40,
      backgroundColor: "red",
      color: "black",
      cursor: "pointer"
    }
  }

  toggleOpen() {
    this.setState({open: !this.state.open})
  }

  appBarStyle(side) {
    var style = { width: "calc(100% + 60px)", minHeight: 64 },
      open = this.state.open,
      oppositeSide = (side === "left") ? "right" : "left";

    style[oppositeSide] = (open ? 0 : -60);

    return style;
  }

  style(side) {
    const defaultStyle = { 
      display: 'flex',
      flexDirection: 'column',
      position: "fixed", 
      top: 0,
      width: this.props.width || 'auto',
      height: "100%",
      zIndex: 200,
      transition: "max-width 0.5s",
      maxWidth: this.state.open ? "100%" : 0,
      boxShadow: "0px 19px 38px rgba(0,0,0,0.30), 0 15px 12px rgba(0,0,0,0.22)"
    }
    var orientationStyle = {}
    orientationStyle[side] = 0;

    return Object.assign(defaultStyle,orientationStyle)
  }
  render() {
    const side = this.props.side;

    return (
      <div style={this.style(side)}>
        <AppBar 
          title={this.props.label} 
          style={this.appBarStyle(side)}
          onClick={this.toggleOpen.bind(this)}>
        </AppBar>
        <br/>

        {this.props.children}
      </div> 
    )
  }
}

class WelcomeDialogue extends Component {
  render() {
    var actions = [];
    var text = [];
    text.push(
      <div id="default-music-loader">
        {this.props.loadingSong ? 
            "Loading Default Song: " : "Song Loaded: "}
            <span className="song">Tetra - Down the Road</span>
        <Spinner spinnerName="triple-bounce" />
      </div>
    )

    // Autoplay
    if(!this.props.loadingSong) {
      if(this.props.pushToPlay) {
        actions.push(
          <FlatButton 
            label="Begin"
            primary={true} 
            onTouchTap={this.props.pushToPlay} />)
      } else {
        text.push(
          <div> Music will start playing in: <span>{this.props.countdown}</span> </div>
        )
      }
    }

    return (
      <Dialog
        title="Welcome"
        modal={true}
        actions={actions}
        open={this.props.open}>
        {text}
      </Dialog>
    );
  }
}

class Visualizer extends Component {
  constructor(props) {
    super(props);
    this.state = {
      audio: null,
      analyser: null,
      draw: false,
      started: false,
      infoDialogue: false,
      loadingSong: true,
      pushToPlay: false,
      welcomeDialogue: true,
      soundWarningCountdown: 5,
      errors: {}
    };
  } 

  singleOrAverage(data) {
    return function(n, count = 0) {
      if(count === 0) {
        return data[n];
      } else {
        for(var i = 0, total = 0; i < count; i++) {
          total += data[n + i];
        }
        return total / count;
      }
    }
  }

  drawFrame() {
    var ctx = this.canvas.getContext('2d')

    ctx.clearRect(0,0,this.props.width,this.props.height);
    const frequencies = this.state.frequencies,
      timeData = this.state.timeData;
    // analyser.timeSmoothingConsant = 1;

    var vals = {};

    vals['t'] = Date.now() - this.state['startTime'];
    vals['freq'] = this.singleOrAverage(frequencies);
    vals['time'] =  this.singleOrAverage(timeData);   

    const _this = this;
    for(var component of 
         this.props.components.filter(c => c.get('active'))) {
      try {
        _this.drawComponent(component,ctx,vals)
      } catch(e) {
        _this.state.errors[component.get('id')] = e;
        console.error(e)
      }
    }
  }

  drawComponent(c,ctx,vals) {
    const count = c.get('count'),
      variables = c.get('variables') || new Map(),
      polar = c.get('polar'),
      x = c.get('x'),
      y = c.get('y'),
      rotation = c.get('rotation'),
      theta = c.get('theta'),
      r = c.get('r'),
      radius = c.get('radius'),
      height = c.get('height'),
      width = c.get('width'),
      color = c.get('color'),
      fill = c.get('fill'),
      [red, green, blue] = 
      [color.get('r'),color.get('g'),color.get('b')];

    var xValue = 0,
      yValue = 0,
      widthValue = 0,
      heightValue = 0,
      rotationValue = 0,
      rValue = 0,
      radiusValue = 0,
      thetaValue = 0,
      redValue =0,
      greenValue = 0,
      blueValue = 0,
      center;

    if(polar) {
      center = 
        [evalf(c.get('center').get(0),vals),
          evalf(c.get('center').get(1),vals)];
    }

    for(let i =0; i < count; i++) {
      vals["n"] = i;

      // Setup pre-variables for eval
      variables.forEach(function([key, value]) {
        vals[key] = evalf(value, vals);
      })

      if(polar) {
        thetaValue = evalf(theta,vals);
        rValue = evalf(r,vals);
        [xValue, yValue] = toRect([thetaValue,rValue],center);
      } else {
        xValue = evalf(x,vals);
        yValue = evalf(y,vals);
      }
      redValue = Math.floor(Math.abs(evalf(red,vals)));
      greenValue = Math.floor(Math.abs(evalf(green,vals)));
      blueValue = Math.floor(Math.abs(evalf(blue,vals)));

      if(fill) {
        ctx.fillStyle = 
          "rgb("+redValue+","+greenValue+","+blueValue+")";
      } else {
        ctx.strokeStyle = 
          "rgb("+redValue+","+greenValue+","+blueValue+")";
        ctx.lineWidth = 1;
      }

      ctx.beginPath();
      switch(c.get('shape')) {
        case "circle":
          radiusValue = evalf(radius,vals);
          ctx.arc(xValue,yValue,radiusValue,0,2*Math.PI);
          break;
        case "rectangle":
          heightValue = evalf(height,vals);
          widthValue = evalf(width,vals);
          rotationValue   = evalf(rotation,vals);
          if(rotationValue !== 0) {
            ctx.translate(xValue+widthValue/2,yValue+heightValue/2)
            ctx.rotate(rotationValue)
            ctx.rect(-widthValue/2,-heightValue/2,widthValue,heightValue)
            ctx.rotate(-rotationValue)
            ctx.translate(-(xValue+widthValue/2),-(yValue+heightValue/2))
          } else {
            ctx.rect(xValue,yValue,widthValue,heightValue);
          }
          break;
        case "polygon": 
          const points = c.get('points');
          var [p1,p2] = [
            evalf(points.first().get(0), vals), 
            evalf(points.first().get(1), vals)
          ];
          if(polar) {
            let p = toRect([p1,p2],center)
            ctx.moveTo(p[0],p[1]);
          } else {
            ctx.moveTo(p1,p2);
          }
          for(var pointPair of points.rest()) {
            [p1,p2] = [
              evalf(pointPair.get(0), vals), 
              evalf(pointPair.get(1), vals)
            ];
            if(polar) {
              let p = toRect([p1,p2],center)
              ctx.lineTo(p[0],p[1]);
            } else {
              ctx.lineTo(p1,p2);
            }
          }
          break;
        default:
          // Do nothing
      }
      ctx.closePath();
      if(fill) { 
        ctx.fill();
      } else {
        ctx.stroke();
      }
    }
  }

  componentDidUpdate(prevProps,prevState) {
    if(this.state.draw && !prevState.draw) {
      this.drawAndRepeat.call(this);
    }
  }

  initializeAudio(node, analyser) {
    this.setState({
      startTime: Date.now(),
      draw: true,
      audio: node,
      analyser: analyser,
      frequencies: new Float32Array(analyser.frequencyBinCount),
      timeData: new Float32Array(analyser.frequencyBinCount)
    });

    node.play();
  }

  updateData() {
    this.state.analyser.getFloatFrequencyData(this.state.frequencies);
    this.state.analyser.getFloatTimeDomainData(this.state.timeData);
  }

  drawAndRepeat() {
    if(this.state.draw) {
      if(!this.state.paused) {
        this.updateData()
      }
      this.drawFrame()
      window.requestAnimationFrame(this.drawAndRepeat.bind(this));
    }
  }

  // Play music and render
  run(audio) {
    // Prevent double clicks from being strange(god I miss core.async)
    if(this.state["started"]) {
      return ;
    }
    this.setState({started: true});

    // Resume from pause
    if(this.state["paused"]) {
      this.setState({paused: false});
      this.state.audio.play()
      return ;
    }

    var _this = this,
      ctx = new AudioContext(),
      analyser = ctx.createAnalyser(),
      file = this.audio.files[0];

    if(file) {
      audio = new Audio();
      audio.src = URL.createObjectURL(file);
    } else {
      if(!audio) {
        audio = new Audio()
        audio.src = mp3url;
      }
    }
    var source = ctx.createMediaElementSource(audio); 
    source.connect(analyser);
    analyser.connect(ctx.destination);
    _this.initializeAudio(audio,analyser);
    audio.addEventListener("ended", this.stop.bind(this))
  }

  pauseAudio() {
    this.state.audio.pause()
  }

  pause() {
    this.setState({started: false, paused: true})
    this.pauseAudio()
  }

  restart() {
    this.stop()
  }


  stop() {
    this.setState({
      started: false, 
      draw: false,
      audio: null,
      analyser: null
    });
    this.pauseAudio()
  }

  componentDidMount() {
    const _this = this;
    var tickDown = function(){
      _this.setState({
        soundWarningCountdown: --_this.state.soundWarningCountdown
      })
    }

    // Default song
    var audio = new Audio();
    audio.src = mp3url;
    audio.load();

    var closeAndRun = function() {
      _this.setState({welcomeDialogue: false})
      _this.run(audio);
    }

    audio.addEventListener('canplaythrough', function() {
      _this.setState({loadingSong: false})

      Modernizr.on('videoautoplay',function(result) {
        if(result) {
          setIntervalX(tickDown, 1000, 5, () => closeAndRun())
        } else {
          _this.setState({pushToPlay: closeAndRun})
        }
      })
    })

    audio.load()
  }

  render() {


    return (
      <div>
        <canvas width={this.props.width} 
          height={this.props.height} 
          ref={(c) => this.canvas = c} />
        <Paper className="song-selector">
          <span>Audio File:</span>
          <input name="audioFile" 
            onChange={this.restart.bind(this)}
            ref={(i) => this.audio = i} type="file" />
          <IconButton 
            onClick={() => this.run.call(this)} 
            disabled={this.state.started} >
            <Play />
          </IconButton>
          <IconButton
            onClick={this.pause.bind(this)} 
            disabled={!this.state.started} >
            <Pause />
          </IconButton>
          <IconButton
            onClick={this.stop.bind(this)} 
            disabled={!this.state.started} >
            <Stop />
          </IconButton>
          <WelcomeDialogue
            loadingSong={this.state.loadingSong}
            pushToPlay={this.state.pushToPlay}
            countdown={this.state.soundWarningCountdown}
            closeAction={(v) => this.setState({welcomeDialogue: false})}
            open={this.state.welcomeDialogue} />
        </Paper>
        <FloatingActionButton
          mini={true}
          id="infoButton"
          onClick={() => this.setState({infoDialogue: true})} >
          <Help />
        </FloatingActionButton>
        <SimpleDialog
          title="Music Visualizer"
          setOpen={(v) => this.setState({infoDialogue: v})}
          open={this.state.infoDialogue}>
          <p> SoundJam allows you to renders visual components based on the musical frequencies of the song selected. The components panel to the right allows you to edit these visual components and see immediate changes of the visuals you are editing. Allowing you to explore the relationship between music, sound, and data. 
          </p>
          <p>Edit the components in the drawer to the right and watch the visualization update live</p>
          <p>If you like what I've done check out the <a href="http:/github.com/nbardy/soundjam">source</a>.</p>
          <p>
            P.S. I'm currently looking for employment as a remote fullstack developer. Reach out to me at nicholasbardy at gmail if you think we could work well together.
          </p>
        </SimpleDialog>
      </div>
    );
  }
} 

function detectMobile() { 
  if(navigator.userAgent.match(/Android/i)
  || navigator.userAgent.match(/webOS/i)
  || navigator.userAgent.match(/iPhone/i)
  || navigator.userAgent.match(/iPad/i)
  || navigator.userAgent.match(/iPod/i)
  || navigator.userAgent.match(/BlackBerry/i)
  || navigator.userAgent.match(/Windows Phone/i)
  ){
    return true;
  }
  else {
    return false;
  }
}

export default App;

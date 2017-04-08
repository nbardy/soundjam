import React, { Component } from 'react';

class SoundStage extends Component {

  play() {
    this.state.oscilator.frequency.value = this.props.frequency;
    this.state.oscilator.type = this.props.type;
    this.oscilator.start(0);
  }

  getInitialState() {
    var context = new AudioContext();
    var oscilator = context.createOscillator();
    oscilator.connect(context.destination);
    return {
      context: context,
      oscilator: oscilator
    };
  }

  render() {
    return (
      <div className="sounds">
      <button onClick={this.play}>Play</button>
        <input type="range" name="freq" min="-1" max="1" step="0.0001"/>
      </div>
      );
  }
}




export default SoundStage;

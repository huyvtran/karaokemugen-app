import React, { Component } from "react";
import '../styles/RadioButton.scss';

class RadioButton extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <div className="radiobutton-ui">
        {
          this.props.buttons.map(function(item,i){
            var style = {};
            if(item.active && item.activeColor)
              style.backgroundColor = item.activeColor;
            return (
              <button
                key={i}
                type="button"
                className={item.active ? 'active':''}
                style={style}
                onClick={item.onClick}
              >
                {item.label}
              </button>
            )
          })
        }
      </div>
    );
  }
}

export default RadioButton;
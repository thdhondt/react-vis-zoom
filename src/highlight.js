import React from "react";
import { ScaleUtils, AbstractSeries } from "react-vis";

export default class Highlight extends AbstractSeries {
  static displayName = "HighlightOverlay";
  static defaultProps = {
    allow: "x",
    color: "rgb(77, 182, 172)",
    opacity: 0.3
  };

  state = {
    drawing: false,
    drawArea: { top: 0, right: 0, bottom: 0, left: 0 },
    x_start: 0,
    y_start: 0,
    x_mode: false,
    y_mode: false,
    xy_mode: false
  };


  _cropDimension(loc, startLoc, minLoc, maxLoc){
    if (loc < startLoc) {
      return {
        start: Math.max(loc, minLoc),
        stop: startLoc
      };
    }

    return {
      stop: Math.min(loc, maxLoc),
      start: startLoc
    };
  }

  _getDrawArea(loc) {
    const {innerWidth, innerHeight} = this.props;
    const {x_mode, y_mode, xy_mode} = this.state;
    const {drawArea, x_start, y_start} = this.state;
    const {x, y} = loc;
    let out = drawArea;

    if(x_mode | xy_mode){
      // X mode
      const {start, stop} = this._cropDimension(x, x_start, 0, innerWidth);
      out = {
        ...out,
        left: start,
        right: stop
      }

    } 
    if (y_mode | xy_mode){
      // Y mode
      const {start, stop} = this._cropDimension(y, y_start, 0, innerHeight);
      out = {
        ...out,
        top: innerHeight - start,
        bottom: innerHeight - stop
      }
    } 
    return out
  }

  onParentMouseDown(e) {
    const {innerHeight, innerWidth, onBrushStart} = this.props;
    const {x, y} = this._getMousePosition(e);
    const y_rect = innerHeight - y;

    // Define zoom mode
    if (x < 0 & y >= 0){
      // Y mode
      this.setState({
        y_mode : true,
        drawing: true,
        drawArea: {
          top: y_rect,
          right: innerWidth,
          bottom: y_rect,
          left: 0
        },
        y_start: y
      });

    } else if (x >= 0 & y < 0){
      // X mode
      this.setState({
        x_mode: true,
        drawing: true,
        drawArea: {
          top: innerHeight,
          right: x,
          bottom: 0,
          left: x
        },
        x_start: x
      });

    } else if (x >= 0 & y >= 0){
      // XY mode
      this.setState({
        xy_mode: true,
        drawing: true,
        drawArea: {
          top: y_rect,
          right: x,
          bottom: y_rect,
          left: x
        },
        x_start: x,
        y_start: y
      });
    }

    // onBrushStart callback
    if (onBrushStart) {
      onBrushStart(e);
    }

  }

  stopDrawing() {
    // Reset zoom state
    this.setState({
      x_mode: false,
      y_mode: false,
      xy_mode: false
    });

    // Quickly short-circuit if the user isn't drawing in our component
    if (!this.state.drawing) {
      return;
    }

    const { onBrushEnd } = this.props;
    const { drawArea } = this.state;
    const xScale = ScaleUtils.getAttributeScale(this.props, "x");
    const yScale = ScaleUtils.getAttributeScale(this.props, "y");

    // Clear the draw area
    this.setState({
      drawing: false,
      drawArea: { top: 0, right: 0, bottom: 0, left: 0 },
      x_start: 0,
      y_start: 0
    });

    // Invoke the callback with null if the selected area was < 5px
    if (Math.abs(drawArea.right - drawArea.left) < 5) {
      onBrushEnd(null);
      return;
    }

    // Compute the corresponding domain drawn
    const domainArea = {
      top: yScale.invert(drawArea.top),
      right: xScale.invert(drawArea.right),
      bottom: yScale.invert(drawArea.bottom),
      left: xScale.invert(drawArea.left)
    };

    if (onBrushEnd) {
      onBrushEnd(domainArea);
    }

    
  }

  _getMousePosition(e){
    // Get graph size
    const { marginLeft, marginTop, innerHeight } = this.props;

    // Compute position in pixels relative to axis
    const loc_x = e.nativeEvent.offsetX - marginLeft;
    const loc_y = innerHeight + marginTop - e.nativeEvent.offsetY;

    // Return (x, y) coordinates
    return {
      x: loc_x,
      y: loc_y
    }

  }

  onParentMouseMove(e) {
    const {onBrush} = this.props;
    const {drawing} = this.state;

    const pos = this._getMousePosition(e);

    if (drawing) {
      const newDrawArea = this._getDrawArea(pos);
      this.setState({ drawArea: newDrawArea });
    }


    // Calll-back
    if (onBrush) {
      onBrush(pos);
    }
  }

  render() {
    const {
      marginLeft,
      marginTop,
      innerWidth,
      innerHeight,
      color,
      opacity
    } = this.props;
    const { drawArea: { left, right, top, bottom } } = this.state;

    return (
      <g
        transform={`translate(${marginLeft}, ${marginTop})`}
        className="highlight-container"
        onMouseUp={e => this.stopDrawing()}
        onMouseLeave={e => this.stopDrawing()}
      >
        <rect
          className="mouse-target"
          fill="black"
          opacity="0"
          x={0}
          y={0}
          width={innerWidth}
          height={innerHeight}
        />
        <rect
          className="highlight"
          pointerEvents="none"
          opacity={opacity}
          fill={color}
          x={left}
          y={bottom}
          width={right - left}
          height={top - bottom}
        />
      </g>
    );
  }
}

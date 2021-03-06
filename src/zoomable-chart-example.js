// Copyright (c) 2017 Uber Technologies, Inc.
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
// THE SOFTWARE.

import React from 'react';
import './index.css'

import {
  XAxis,
  YAxis,
  HorizontalGridLines,
  VerticalGridLines,
  LineSeries,
  DiscreteColorLegend,
  Borders,
  XYPlot
} from 'react-vis';
import Highlight from './highlight';
import CustomAxisLabel from './custom-axis-label';

const totalValues = 100;

/**
 * Get the array of x and y pairs.
 * The function tries to avoid too large changes of the chart.
 * @param {number} total Total number of values.
 * @returns {Array} Array of data.
 * @private
 */
function getRandomSeriesData(total) {
  const result = [];
  let lastY = Math.random() * 40 - 20;
  let y;
  const firstY = lastY;
  for (let i = 0; i < total; i++) {
    y = Math.random() * firstY - firstY / 2 + lastY;
    result.push({
      x: i,
      y
    });
    lastY = y;
  }
  return result;
}

export default class ZoomableChartExample extends React.Component {

  state = {
    lastDrawLocation: null,
    series: [
      {
        title: 'Apples',
        disabled: false,
        data: getRandomSeriesData(totalValues)
      },
      {
        title: 'Bananas',
        disabled: false,
        data: getRandomSeriesData(totalValues)
      }
    ],
  }

  render() {
    const { series, lastDrawLocation } = this.state;
    return (
      
      <div className="example-with-click-me">
        <div className="legend">
          <DiscreteColorLegend
            width={180}
            items={series} />
        </div>

        <div className="chart no-select" onDragStart={function (e) { e.preventDefault(); }}>
          <XYPlot
            xDomain={lastDrawLocation && [lastDrawLocation.left, lastDrawLocation.right]}
            yDomain={lastDrawLocation && [lastDrawLocation.bottom, lastDrawLocation.top]}
            height={300}
            width={600}
            margin={{ left: 45, right: 20, top: 10, bottom: 45 }}>

            <HorizontalGridLines />
            <VerticalGridLines />

            {series.map(entry => (
              <LineSeries
                key={entry.title}
                data={entry.data}
              />
            ))}

            <Highlight
              onBrushEnd={(area) => {
                this.setState(
                  { lastDrawLocation: area }
                )
              }}
            />
            <Borders style={{ all: { fill: '#fff' } }} />
            <XAxis tickFormat={(v) => (<tspan className="unselectable"> {v} </tspan>)} />
            <YAxis tickFormat={(v) => (<tspan className="unselectable"> {v} </tspan>)} />
            <CustomAxisLabel title={'Time [s]'} xAxis/>
            <CustomAxisLabel title={'Value [-]'} />          
          </XYPlot>
        </div>
      </div>
    );
  }
}
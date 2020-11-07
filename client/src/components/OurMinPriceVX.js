import React from 'react';
import { LinePath } from '@vx/shape';

export default ({data, label, yText, yScale, xScale, x, y}) => {
    return (
        <g>
            <LinePath
                data={data}
                x={d => xScale(x(d))}
                y={d => yScale(y(d))}
                strokeDasharray="4,4"
                stroke={"#1d3d64"}
            />
            <text y={yText} dy="-.5em" fill="white" dx="1em" fontSize="14">
                {label}
            </text>
        </g>
    )
}
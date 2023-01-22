import { Component, useState, useEffect } from 'react';

import { Defs, linearGradientDef } from '@nivo/core'
import { ResponsiveLine } from '@nivo/line';
import { CostAnalysis } from '../types/dashboard-types';
import dayjs from 'dayjs';
import localizedFormat from 'dayjs/plugin/localizedFormat';
dayjs.extend(localizedFormat);

const getFormattedDate = (date: Date) => dayjs(date).format('YYYY-MM-DD');

interface LineGraphProps {
    data: CostAnalysis[];
}

export default function LineGraph({ data }: LineGraphProps) {
    const lineGraphProps = {
        margin: { top: 20, right: 20, bottom: 60, left: 80 },
        animate: true,
    };

    const formattedData = data.map(costAnalysis => {
        return {
            id: costAnalysis.id,
            data: costAnalysis.data.map(dataPoint => {
                return { x: getFormattedDate(dataPoint.date), y: dataPoint.cost }
            })
        };
    });

    console.log(formattedData);

    return (
        <ResponsiveLine
            xFormat="time:%Y-%m-%d"
            // xScale={{
            //     type: 'time',
            //     format: '%Y-%m-%d',
            // }}
            yScale={{
                type: 'linear',
            }}
            axisLeft={{
                format: "$.2f",
                legend: "Cost",
                legendOffset: -70,
                legendPosition: "middle"
              }}
            axisBottom={{
                tickRotation: -50,
                legend: "Time",
                legendOffset: 70,
                legendPosition: "middle"
            }}
            legends={[
                {
                    anchor: 'bottom-right',
                    direction: 'column',
                    itemWidth: 100,
                    itemHeight: 200,
                }
            ]}
            data={formattedData}
            {...lineGraphProps}
        />
    );
}
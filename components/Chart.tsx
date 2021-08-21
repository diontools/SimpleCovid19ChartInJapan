import { FunctionComponent } from 'react'
import type { ChartConfiguration } from 'chart.js'
import { Line, Chart as OriginalChart } from 'react-chartjs-2'
import 'chartjs-adapter-moment'
import 'moment/locale/ja'

if (typeof window !== 'undefined') {
    require('hammerjs')
    const zoomPlugin = require('chartjs-plugin-zoom').default
    OriginalChart.register(zoomPlugin)
    console.log('registed', zoomPlugin)
}

type Props = {
    data: ChartConfiguration['data']
    options: ChartConfiguration['options']
}

export const Chart: FunctionComponent<Props> = props => {
    return <Line
        options={props.options}
        data={props.data}
    />
}

import { FunctionComponent, useEffect, useRef, useState } from 'react'
import { ChartConfiguration, Chart as OriginalChart, LineController, PointElement, LineElement, LinearScale, TimeScale, Legend, Tooltip } from 'chart.js'
import 'chartjs-adapter-moment'
import 'moment/locale/ja'

if (typeof window !== 'undefined') {
    require('hammerjs')
    const zoomPlugin = require('chartjs-plugin-zoom').default
    OriginalChart.register(zoomPlugin)
    console.log('registed', zoomPlugin)

    OriginalChart.register(
        LineController,
        LineElement,
        PointElement,
        LinearScale,
        TimeScale,
        Legend,
        Tooltip,
    )
}

type ChartType = ReturnType<typeof initializeChart>

type Props = {
    data: ChartConfiguration['data']
    options: ChartConfiguration['options']
}

export const Chart: FunctionComponent<Props> = props => {
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const [chart, setChart] = useState<ChartType>(undefined)

    useEffect(() => {
        if (!chart) {
            console.log('initialize chart')
            const newChart = initializeChart(canvasRef.current, props.data, props.options)
            if (!newChart) return
            setChart(newChart)
        } else {
            console.log('update chart')
            chart.data = takeOverLabelVisible(chart, props.data)
            chart.update()
        }
    }, [canvasRef.current, props.data])

    return <canvas key="canvas-key" ref={canvasRef} />
}

const initializeChart = (canvas: HTMLCanvasElement | null, data: ChartConfiguration['data'], options: ChartConfiguration['options']) => {
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const chart = new OriginalChart(ctx, {
        type: 'line',
        data: data,
        options: options,
    })

    return chart
}

const takeOverLabelVisible = (chart: ChartType, newData: ChartConfiguration['data']): ChartConfiguration['data'] => {
    for (const dataset of newData.datasets) {
        if (dataset.label) {
            const datasetIndex = chart?.data.datasets.findIndex(ds => ds.label === dataset.label)
            if (datasetIndex !== undefined) {
                const visible = !chart?.isDatasetVisible(datasetIndex)
                console.log(dataset.label, visible)
                dataset.hidden = visible
            } else {
                console.log(dataset.label, 'not found', dataset, chart?.data.datasets)
            }
        }
    }
    return newData
}

export const chartOptions: Parameters<typeof Chart>[0]['options'] = {
    interaction: {
        intersect: false,
        axis: 'x',
        mode: 'nearest',
    },
    animation: false,
    scales: {
        x: {
            type: 'time',
            time: {
                tooltipFormat: 'YYYY / MM / DD (ddd)',
                displayFormats: {
                    'day': 'YYYY / MM / DD (ddd)',
                    'month': 'YYYY / MM',
                },
                minUnit: 'day',
            },
        },
        y: {
            type: 'linear',
            position: 'right',
            min: 0,
            title: {
                display: true,
                text: '新規陽性者数',
                color: 'green',
            },
        },
        y1: {
            type: 'linear',
            position: 'right',
            min: 0,
            title: {
                display: true,
                text: '重症者数',
                color: 'purple',
            },
            grid: {
                drawOnChartArea: false,
            },
        },
        y2: {
            type: 'linear',
            position: 'right',
            min: 0,
            title: {
                display: true,
                text: '死者数',
                color: 'red',
            },
            grid: {
                drawOnChartArea: false,
            },
        },
        y3: {
            type: 'linear',
            position: 'right',
            min: 0,
            title: {
                display: true,
                text: '入院治療等を要する者等',
                color: 'rgb(180,180,0)',
            },
            grid: {
                drawOnChartArea: false,
            },
        },
        y4: {
            type: 'linear',
            position: 'right',
            min: 0,
            title: {
                display: true,
                text: '退院及び療養解除者数',
                color: 'blue',
            },
            grid: {
                drawOnChartArea: false,
            },
        },
        y5: {
            type: 'linear',
            position: 'right',
            min: 0,
            title: {
                display: true,
                text: 'ワクチン接種回数',
                color: 'darkgray',
            },
            grid: {
                drawOnChartArea: false,
            },
        },
    },
    plugins: {
        tooltip: {
            position: 'nearest',
            caretSize: 0,
            caretPadding: 32,
        },
        zoom: {
            pan: {
                enabled: true,
                mode: 'x',
                threshold: 5,
            },
            zoom: {
                wheel: {
                    enabled: true,
                },
                pinch: {
                    enabled: true,
                },
                mode: 'x',
            },
            limits: {
                x: {
                    max: 'original',
                    min: 'original',
                },
            },
        },
    },
}

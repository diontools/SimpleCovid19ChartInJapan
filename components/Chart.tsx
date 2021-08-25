import { FunctionComponent, useEffect, useRef, useState } from 'react'
import { ChartConfiguration, Chart as OriginalChart, LineController, PointElement, LineElement, LinearScale, TimeScale, Legend, Tooltip, ChartEvent, InteractionItem } from 'chart.js'
import 'chartjs-adapter-luxon'
import { DateTime } from 'luxon'

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

const dayInMillisec = 24 * 60 * 60 * 1000
const weekInMillisec = 7 * dayInMillisec

const initializeChart = (canvas: HTMLCanvasElement | null, data: ChartConfiguration['data'], options: ChartConfiguration['options']) => {
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const chart = new OriginalChart(ctx, {
        type: 'line',
        data: data,
        options: options,
        plugins: [{
            id: 'draw-weekends',
            beforeDraw: chart => {
                const { ctx, chartArea: { left, top, right, bottom }, scales: { x, y } } = chart
                const { min, max } = x.getMinMax(false)
                const oneDayWidth = x.getPixelForValue(min + dayInMillisec) - x.getPixelForValue(min)
                if (oneDayWidth < 10) return

                const minDateTime = DateTime.fromMillis(min, { zone: 'UTC+0' })
                const minY = y.getPixelForValue(y.min);
                const satDate = minDateTime.startOf('day')
                let satInMillisec = satDate.valueOf() + (7 - satDate.weekday) * dayInMillisec

                const h = minY - top
                ctx.save();
                ctx.fillStyle = '#fff4f9';
                while (satInMillisec < max) {
                    const startX = x.getPixelForValue(Math.max(satInMillisec, min))
                    const endX = x.getPixelForValue(Math.min(satInMillisec + dayInMillisec, max))
                    ctx.fillRect(startX, top, endX - startX, h)
                    satInMillisec += weekInMillisec
                }
                ctx.restore();
            }
        }, {
            id: 'vh-line',
            afterDraw: (chart, _, options) => {
                const { ctx, chartArea: { left, top, right, bottom }, scales: { x, y } } = chart
                const nearest = (chart as any).options.vhLine as InteractionItem | undefined
                if (!nearest) return

                ctx.save()

                const dataset = chart.data.datasets[nearest.datasetIndex]
                const value = dataset.data[nearest.index]
                if (value && typeof value === 'object') {
                    const date = DateTime.fromMillis(value.x, { zone: 'UTC+0', locale: 'ja' }).toFormat('yyyy / MM / dd (ccc)')
                    ctx.textBaseline = 'top'
                    ctx.textAlign = 'end'
                    ctx.fillText(date, nearest.element.x, top)
                    ctx.textAlign = 'left'
                    ctx.fillText(`${dataset.label} ${value.y.toLocaleString()}`, left, nearest.element.y)
                }

                ctx.strokeStyle = 'black'
                ctx.lineWidth = 0.5
                ctx.beginPath()
                ctx.setLineDash([5, 5])
                ctx.moveTo(left, nearest.element.y)
                ctx.lineTo(right, nearest.element.y)
                ctx.moveTo(nearest.element.x, top)
                ctx.lineTo(nearest.element.x, bottom)
                ctx.stroke()
                ctx.restore()
            },
            beforeEvent: (chart, args, options) => {
                if (args.event.type === 'click' && args.event.native && args.event.x && args.event.y) {
                    const { left, top, right, bottom } = chart.chartArea
                    const { x, y } = args.event
                    if (left <= x && x <= right && top <= y && y <= bottom) {
                        const nearest = chart.getElementsAtEventForMode(args.event.native, 'point', { axis: 'xy' }, true)[0];
                        (chart as any).options.vhLine = nearest
                        args.replay = true
                    }
                }
            }
        }],
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
                tooltipFormat: 'yyyy / MM / dd (ccc)',
                displayFormats: {
                    'day': 'yyyy / MM / dd',
                    'month': 'yyyy / MM',
                },
                minUnit: 'day',
                parser: v => (v as number)
            },
            adapters: {
                date: {
                    zone: 'UTC+0',
                    locale: 'ja',
                },
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

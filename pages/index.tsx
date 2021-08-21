import type { GetStaticProps, NextPage } from 'next'
import Head from 'next/head'
import { Chart } from '../components/Chart'
import * as data from '../components/data'
import '../components/arrayEx'
import moment from 'moment'
import { FunctionComponent } from 'react'

type Props = {
    update: data.UpdateInfo
    charts: {
        data: Parameters<typeof Chart>[0]['data']
        options: Parameters<typeof Chart>[0]['options']
    }[]
}

const Home: NextPage<Props> = props => {
    console.log(props)
    return (
        <div className="">
            <Head>
                <title>Simple COVID-19 Chart In Japan</title>
                <link rel="icon" href="/favicon.ico" />
            </Head>

            <div>
                最終更新時刻: {moment.utc(props.update.updatedAt).utcOffset(9 * 60).format('YYYY / MM / DD (ddd) HH:mm')}
            </div>
            <div>
                感染状況データソース: <Link href="https://covid19.mhlw.go.jp/extensions/public/index.html">データからわかる－新型コロナウイルス感染症情報－ | 厚生労働省</Link>
            </div>
            <div>
                ワクチンデータソース: <Link href="https://cio.go.jp/c19vaccine_dashboard">新型コロナワクチンの接種状況（一般接種（高齢者含む）） | 政府CIOポータル</Link>
            </div>
            
            {props.charts.map((c, i) => <Chart key={i} data={c.data} options={c.options} />)}
        </div>
    )
}

const Link: FunctionComponent<{ href: string, children: string }> = props => {
    return (
        <a href={props.href} className="no-underline hover:underline text-blue-500">{props.children}</a>
    )
}

export default Home

export const getStaticProps: GetStaticProps<Props> = async context => {
    function sma(items: [number, number][], length: number) {
        const result: [number, number][] = []
        let movingTotal = 0
        let count = 0
        let oldIndex = 0
        for (let i = 0; i < items.length; i++) {
            const item = items[i]
            movingTotal += item[1]
            if (count === length) {
                movingTotal -= items[oldIndex++][1]
            } else {
                ++count
            }
            result.push([item[0], Math.round(movingTotal / count)])
        }
        return result
    }

    const confirmeds = data
        .newlyConfirmedCasesDailies
        .filter(item => item.Prefecture === 'ALL')
        .groupBy(item => item.Date)
        .map<[number, number]>(g => [g[0], g[1][0]['Newly confirmed cases']])

    const confirmeds7ma = sma(confirmeds, 7)

    const severes = data
        .severeCasesDailies
        .filter(item => item.Prefecture === 'ALL')
        .groupBy(item => item.Date)
        .map<[number, number]>(g => [g[0], g[1][0]['Severe cases']])

    const severes7ma = sma(severes, 7)

    const deaths = data
        .deathsCumulativeDailies
        .filter(item => item.Prefecture === 'ALL')
        .groupBy(item => item.Date)
        .map(g => [g[0], g[1][0]['Deaths(Cumulative)']])
        .map<[number, number]>((item, index, items) => [item[0], item[1] - items[index - 1]?.[1]])
        .filter(item => item[1])

    const deaths7ma = sma(deaths, 7)

    const inpatients = data
        .requiringInpatientCareEtcDailies
        .filter(item => item.Prefecture === 'ALL')
        .groupBy(item => item.Date)
        .map<[number, number]>(g => [g[0], g[1][0]['Requiring inpatient care'] + g[1][0]['To be confirmed']])

    const inpatients7ma = sma(inpatients, 7)

    const dischargeds = data
        .requiringInpatientCareEtcDailies
        .filter(item => item.Prefecture === 'ALL')
        .groupBy(item => item.Date)
        .map<[number, number]>(g => [g[0], g[1][0]['Discharged from hospital or released from treatment']])
        .map<[number, number]>((item, index, items) => [item[0], item[1] - items[index - 1]?.[1]])
        .filter(item => item[1])

    const dischargeds7ma = sma(dischargeds, 7)

    const vaccinesByDate = data
        .vaccineDailies
        .groupBy(item => item.date)

    const vaccines1 =
        vaccinesByDate
            .map<[number, number]>(g => [Date.parse(g[0]) - 9 * 60 * 60 * 1000, g[1].filter(v => v.status === 1).reduce((t, v) => t + v.count, 0)])
            .reduce<[number, number][]>((t, v) => { t.push([v[0], v[1] + (t[t.length - 1]?.[1] || 0)]); return t }, [])

    const vaccines2 =
        vaccinesByDate
            .map<[number, number]>(g => [Date.parse(g[0]) - 9 * 60 * 60 * 1000, g[1].filter(v => v.status === 2).reduce((t, v) => t + v.count, 0)])
            .reduce<[number, number][]>((t, v) => { t.push([v[0], v[1] + (t[t.length - 1]?.[1] || 0)]); return t }, [])

    return {
        props: {
            update: data.update,
            charts: [{
                data: {
                    datasets: [
                        {
                            label: '新規陽性者数',
                            backgroundColor: 'green',
                            borderColor: 'rgba(0,128,0,0.3)',
                            pointRadius: 2,
                            data: confirmeds.map(g => ({
                                x: g[0],
                                y: g[1],
                            })),
                            yAxisID: 'y',
                        }, {
                            label: '新規陽性者数(7日間移動平均)',
                            backgroundColor: 'lime',
                            borderColor: 'rgba(0,255,0,0.8)',
                            pointRadius: 0,
                            data: confirmeds7ma.map(g => ({
                                x: g[0],
                                y: g[1],
                            })),
                            yAxisID: 'y',
                        }, {
                            label: '重症者数',
                            backgroundColor: 'purple',
                            borderColor: 'rgba(128,0,128,0.3)',
                            pointRadius: 2,
                            data: severes.map(g => ({
                                x: g[0],
                                y: g[1],
                            })),
                            yAxisID: 'y1',
                        }, {
                            label: '重症者数(7日間移動平均)',
                            backgroundColor: 'magenta',
                            borderColor: 'rgba(255,0,255,0.8)',
                            pointRadius: 0,
                            data: severes7ma.map(g => ({
                                x: g[0],
                                y: g[1],
                            })),
                            yAxisID: 'y1',
                        }, {
                            label: '死者数',
                            backgroundColor: 'orangered',
                            borderColor: 'rgba(255,69,0,0.3)',
                            pointRadius: 2,
                            data: deaths.map(g => ({
                                x: g[0],
                                y: g[1],
                            })),
                            yAxisID: 'y2',
                        }, {
                            label: '死者数(7日間移動平均)',
                            backgroundColor: 'red',
                            borderColor: 'rgba(255,0,0,0.8)',
                            pointRadius: 0,
                            data: deaths7ma.map(g => ({
                                x: g[0],
                                y: g[1],
                            })),
                            yAxisID: 'y2',
                        }, {
                            label: '入院治療等を要する者等',
                            backgroundColor: 'rgb(230, 230, 0)',
                            borderColor: 'rgba(180,180,0,0.3)',
                            pointRadius: 2,
                            data: inpatients.map(g => ({
                                x: g[0],
                                y: g[1],
                            })),
                            yAxisID: 'y3',
                        }, {
                            label: '入院治療等を要する者等(7日間移動平均)',
                            backgroundColor: 'yellow',
                            borderColor: 'rgba(255,255,0,0.8)',
                            pointRadius: 0,
                            data: inpatients7ma.map(g => ({
                                x: g[0],
                                y: g[1],
                            })),
                            yAxisID: 'y3',
                        }, {
                            label: '退院及び療養解除者数',
                            backgroundColor: 'darkblue',
                            borderColor: 'rgba(0,0,128,0.3)',
                            pointRadius: 2,
                            data: dischargeds.map(g => ({
                                x: g[0],
                                y: g[1],
                            })),
                            yAxisID: 'y4',
                        }, {
                            label: '退院及び療養解除者数(7日間移動平均)',
                            backgroundColor: 'blue',
                            borderColor: 'rgba(0,0,255,0.8)',
                            pointRadius: 0,
                            data: dischargeds7ma.map(g => ({
                                x: g[0],
                                y: g[1],
                            })),
                            yAxisID: 'y4',
                        }, {
                            label: 'ワクチン接種回数(1回目)',
                            backgroundColor: 'darkgray',
                            borderColor: 'rgba(128,128,128,0.3)',
                            pointRadius: 2,
                            data: vaccines1.map(g => ({
                                x: g[0],
                                y: g[1],
                            })),
                            yAxisID: 'y5',
                        }, {
                            label: 'ワクチン接種回数(2回目)',
                            backgroundColor: 'darkgray',
                            borderColor: 'rgba(128,128,128,0.3)',
                            pointRadius: 2,
                            data: vaccines2.map(g => ({
                                x: g[0],
                                y: g[1],
                            })),
                            yAxisID: 'y5',
                        },
                    ]
                },
                options: {
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
                            beginAtZero: true,
                            title: {
                                display: true,
                                text: '新規陽性者数',
                                color: 'green',
                            },
                        },
                        y1: {
                            type: 'linear',
                            position: 'right',
                            beginAtZero: true,
                            title: {
                                display: true,
                                text: '重症者数',
                                color: 'purple',
                            },
                            grid: {
                                drawOnChartArea: false, // only want the grid lines for one axis to show up
                            },
                        },
                        y2: {
                            type: 'linear',
                            position: 'right',
                            beginAtZero: true,
                            title: {
                                display: true,
                                text: '死者数',
                                color: 'red',
                            },
                            grid: {
                                drawOnChartArea: false, // only want the grid lines for one axis to show up
                            },
                        },
                        y3: {
                            type: 'linear',
                            position: 'right',
                            beginAtZero: true,
                            title: {
                                display: true,
                                text: '入院治療等を要する者等',
                                color: 'rgb(180,180,0)',
                            },
                            grid: {
                                drawOnChartArea: false, // only want the grid lines for one axis to show up
                            },
                        },
                        y4: {
                            type: 'linear',
                            position: 'right',
                            beginAtZero: true,
                            title: {
                                display: true,
                                text: '退院及び療養解除者数',
                                color: 'blue',
                            },
                            grid: {
                                drawOnChartArea: false, // only want the grid lines for one axis to show up
                            },
                        },
                        y5: {
                            type: 'linear',
                            position: 'right',
                            beginAtZero: true,
                            title: {
                                display: true,
                                text: 'ワクチン接種回数',
                                color: 'darkgray',
                            },
                            grid: {
                                drawOnChartArea: false, // only want the grid lines for one axis to show up
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
                },
            }],
        }
    }
}
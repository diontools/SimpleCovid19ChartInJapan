import * as path from 'path'
import * as fs from 'fs'
import { Chart } from './Chart'
import { Prefecture } from './regions'
import '../components/arrayEx'
import { DateTime } from 'luxon'

const currentDir = process.cwd()
console.log(currentDir)
const dir = path.join(currentDir, 'data')

const loadJson = <T>(name: string) => {
    const file = path.join(dir, name)
    console.log('load', file)
    const json = fs.readFileSync(file).toString()
    return JSON.parse(json) as T
}


export type UpdateInfo = {
    updatedAt: number
}

export const update = loadJson<UpdateInfo>('update.json')


export type NewlyConfirmedCasesDaily = {
    Date: number
    Prefecture: string
    'Newly confirmed cases': number
}

export const newlyConfirmedCasesDailies = loadJson<NewlyConfirmedCasesDaily[]>('newly_confirmed_cases_daily.csv.json')


export type SevereCasesDaily = {
    Date: number
    Prefecture: string
    'Severe cases': number
}

export const severeCasesDailies = loadJson<SevereCasesDaily[]>('severe_cases_daily.csv.json')


export type DeathsCumulativeDaily = {
    Date: number
    Prefecture: string
    'Deaths(Cumulative)': number
}

export const deathsCumulativeDailies = loadJson<DeathsCumulativeDaily[]>('deaths_cumulative_daily.csv.json')


export type RequiringInpatientCareEtcDaily = {
    Date: number
    Prefecture: string
    'Requiring inpatient care': number
    'Discharged from hospital or released from treatment': number
    'To be confirmed': number
}

export const requiringInpatientCareEtcDailies = loadJson<RequiringInpatientCareEtcDaily[]>('requiring_inpatient_care_etc_daily.csv.json')


export type VaccineDaily = {
    date: string
    prefecture: string
    gender: 'M' | 'F' | 'U'
    age: '-64' | '65-' | 'UNK'
    medical_worker: boolean
    status: 1 | 2
    count: number
}

export const vaccineDailies = loadJson<VaccineDaily[]>('prefecture.ndjson.json')


export type ChartProps = {
    data: Parameters<typeof Chart>[0]['data']
}

export const generateCharts = (prefecture?: Prefecture): ChartProps[] => {
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
            result.push([item[0], Math.round(movingTotal / count * 10) / 10])
        }
        return result
    }

    const prefectureName = prefecture?.name || 'ALL'
    const prefectureId = prefecture?.id

    const confirmeds =
        newlyConfirmedCasesDailies
            .filter(item => item.Prefecture === prefectureName)
            .groupBy(item => item.Date)
            .map<[number, number]>(g => [g[0], g[1][0]['Newly confirmed cases']])

    const confirmeds7ma = sma(confirmeds, 7)

    const severes =
        severeCasesDailies
            .filter(item => item.Prefecture === prefectureName)
            .groupBy(item => item.Date)
            .map<[number, number]>(g => [g[0], g[1][0]['Severe cases']])

    const severes7ma = sma(severes, 7)

    const deaths =
        deathsCumulativeDailies
            .filter(item => item.Prefecture === prefectureName)
            .groupBy(item => item.Date)
            .map(g => [g[0], g[1][0]['Deaths(Cumulative)']])
            .map<[number, number]>((item, index, items) => [item[0], item[1] - items[index - 1]?.[1]])
            .filter(item => !isNaN(item[1]))

    const deaths7ma = sma(deaths, 7)

    const inpatients =
        requiringInpatientCareEtcDailies
            .filter(item => item.Prefecture === prefectureName)
            .groupBy(item => item.Date)
            .map<[number, number]>(g => [g[0], g[1][0]['Requiring inpatient care'] + g[1][0]['To be confirmed']])

    const inpatients7ma = sma(inpatients, 7)

    const dischargeds =
        requiringInpatientCareEtcDailies
            .filter(item => item.Prefecture === prefectureName)
            .groupBy(item => item.Date)
            .map<[number, number]>(g => [g[0], g[1][0]['Discharged from hospital or released from treatment']])
            .map<[number, number]>((item, index, items) => [item[0], item[1] - items[index - 1]?.[1]])
            .filter(item => !isNaN(item[1]))

    const dischargeds7ma = sma(dischargeds, 7)

    const vaccinesByDate =
        vaccineDailies
            .filter(item => prefectureId ? item.prefecture === prefectureId : true)
            .groupBy(item => item.date)

    const vaccines1 =
        vaccinesByDate
            .map<[number, number]>(g => [DateTime.fromFormat(g[0], 'yyyy-MM-dd', { zone: 'UTC+0' }).valueOf(), g[1].filter(v => v.status === 1).reduce((t, v) => t + v.count, 0)])
            .reduce<[number, number][]>((t, v) => { t.push([v[0], v[1] + (t[t.length - 1]?.[1] || 0)]); return t }, [])

    const vaccines2 =
        vaccinesByDate
            .map<[number, number]>(g => [DateTime.fromFormat(g[0], 'yyyy-MM-dd', { zone: 'UTC+0' }).valueOf(), g[1].filter(v => v.status === 2).reduce((t, v) => t + v.count, 0)])
            .reduce<[number, number][]>((t, v) => { t.push([v[0], v[1] + (t[t.length - 1]?.[1] || 0)]); return t }, [])

    return [{
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
    }]
}
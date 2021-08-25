import * as path from 'path'
import * as fs from 'fs'
import fetch from 'node-fetch'
import { DateTime } from 'luxon'

type Format = 'int' | 'date' | undefined

const dataDir = path.join(__dirname, '..', 'data')
fs.existsSync(dataDir) || fs.mkdirSync(dataDir)

const downloadCsv = async (url: string, formats: Format[]) => {
    console.log('download', url)

    const res = await fetch(url)
    const csv = await res.text()
    console.log('length:', csv.length)

    const json = csvToJson(removeBom(csv), formats)

    const name = path.basename(url)
    fs.writeFileSync(path.join(dataDir, name), csv)
    fs.writeFileSync(path.join(dataDir, name + '.json'), json)
}

const downloadNdJson = async (url: string) => {
    console.log('download', url)

    const res = await fetch(url)
    const ndJson = await res.text()
    console.log('length:', ndJson.length)

    const json = ndJsonToJson(ndJson)

    const name = path.basename(url)
    fs.writeFileSync(path.join(dataDir, name), ndJson)
    fs.writeFileSync(path.join(dataDir, name + '.json'), json)
}

const removeBom = (text: string) => {
    if (text.charCodeAt(0) === 0xFEFF) {
        return text.substr(1)
    }
    return text
}

const csvToJson = (csv: string, formats: Format[]) => {
    const lines = csv.split('\r\n')
    const headers = lines[0].split(',')
    const results = []

    for (let i = 1; i < lines.length; i++) {
        const line = lines[i]
        if (!line || line.length === 0) {
            break
        }

        const values = line.split(',')
        const obj = {}

        for (let n = 0; n < values.length; n++) {
            const parsedValue = parse(values[n], formats[n])
            obj[headers[n]] = parsedValue
        }

        results.push(obj)
    }

    return JSON.stringify(results, undefined, ' ')
}

const ndJsonToJson = (csv: string) => {
    const lines = csv.trim().split('\n')
    return '[' + lines.join(',\n') + ']'
}

const parse = (value: string, format: Format) => {
    switch (format) {
        case 'int': return parseInt(value, 10)
        case 'date': return DateTime.fromFormat(value, 'yyyy/M/d', { zone: 'UTC+0' }).valueOf()
        case undefined: return value
        default: const n: never = format
    }
}

const setUpdateTime = () => {
    const file = path.join(dataDir, 'update.json')
    const json = JSON.stringify({ updatedAt: DateTime.utc().valueOf() }, undefined, 4)
    console.log(file, json)
    fs.writeFileSync(file, json)
}

const main = async () => {
    await downloadCsv('https://covid19.mhlw.go.jp/public/opendata/newly_confirmed_cases_daily.csv', ['date', , 'int'])
    await downloadCsv('https://covid19.mhlw.go.jp/public/opendata/severe_cases_daily.csv', ['date', , 'int'])
    await downloadCsv('https://covid19.mhlw.go.jp/public/opendata/deaths_cumulative_daily.csv', ['date', , 'int'])
    await downloadCsv('https://covid19.mhlw.go.jp/public/opendata/requiring_inpatient_care_etc_daily.csv', ['date', , 'int', 'int', 'int'])
    await downloadNdJson('https://vrs-data.cio.go.jp/vaccination/opendata/latest/prefecture.ndjson')
    setUpdateTime()
}

main()

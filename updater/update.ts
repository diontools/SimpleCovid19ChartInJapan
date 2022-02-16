import * as path from 'path'
import * as fs from 'fs'
import fetch from 'node-fetch'
import { DateTime } from 'luxon'

const dataDir = path.join(__dirname, '..', 'data')
fs.existsSync(dataDir) || fs.mkdirSync(dataDir)

const downloadCsv = async <T>(url: string, parse: (values: string[], headers: string[]) => T[]) => {
    console.log('download', url)

    const res = await fetch(url)
    const csv = await res.text()
    console.log('length:', csv.length)

    const json = csvToJson(removeBom(csv), parse)

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

const csvToJson = <T>(csv: string, parse: (values: string[], headers: string[]) => T[]) => {
    const lines = csv.split('\r\n')
    const headers = lines[0].split(',')
    const results: T[] = []

    for (let i = 1; i < lines.length; i++) {
        const line = lines[i]
        if (!line || line.length === 0) {
            break
        }

        const values = line.split(',')
        results.push(...parse(values, headers))
    }

    return JSON.stringify(results, undefined, ' ')
}

const ndJsonToJson = (csv: string) => {
    const lines = csv.trim().split('\n')
    return '[' + lines.join(',\n') + ']'
}

const parseDate = (value: string): number => DateTime.fromFormat(value, 'yyyy/M/d', { zone: 'UTC+0' }).valueOf()

const setUpdateTime = () => {
    const file = path.join(dataDir, 'update.json')
    const json = JSON.stringify({ updatedAt: DateTime.utc().valueOf() }, undefined, 4)
    console.log(file, json)
    fs.writeFileSync(file, json)
}

const main = async () => {
    await downloadCsv('https://covid19.mhlw.go.jp/public/opendata/newly_confirmed_cases_daily.csv', (values, headers) => values.slice(1).map((v, i) => ({ Date: parseDate(values[0]), Prefecture: headers[i + 1], 'Newly confirmed cases': parseInt(v, 10) })))
    await downloadCsv('https://covid19.mhlw.go.jp/public/opendata/severe_cases_daily.csv', (values, headers) => values.slice(1).map((v, i) => ({ Date: parseDate(values[0]), Prefecture: headers[i + 1], 'Severe cases': parseInt(v, 10) })))
    await downloadCsv('https://covid19.mhlw.go.jp/public/opendata/deaths_cumulative_daily.csv', (values, headers) => values.slice(1).map((v, i) => ({ Date: parseDate(values[0]), Prefecture: headers[i + 1], 'Deaths(Cumulative)': parseInt(v, 10) })))
    await downloadCsv('https://covid19.mhlw.go.jp/public/opendata/requiring_inpatient_care_etc_daily.csv', (values, headers) => {
        const prefs: {
            [pref: string]: {
                Date: number
                Prefecture: string
                'Requiring inpatient care': number
                'Discharged from hospital or released from treatment': number
                'To be confirmed': number
            }
        } = {}

        for (let i = 0; i < headers.length; i++) {
            const header = headers[i]
            if (header[0] === '(') {
                const end = header.indexOf(')')
                if (end > 0) {
                    const prefName = header.slice(1, end)
                    const name = header.slice(end + 2)
                    let pref = prefs[prefName]
                    if (!pref) prefs[prefName] = pref = {
                        Date: parseDate(values[0]),
                        Prefecture: prefName,
                        "Requiring inpatient care": 0,
                        "Discharged from hospital or released from treatment": 0,
                        "To be confirmed": 0,
                    }
                    pref[name] = parseInt(values[i], 10)
                }
            }
        }

        return Object.entries(prefs).map(a => a[1])
    })
    await downloadNdJson('https://data.vrs.digital.go.jp/vaccination/opendata/latest/prefecture.ndjson')
    setUpdateTime()
}

main()

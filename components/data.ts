import * as path from 'path'
import * as fs from 'fs'

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

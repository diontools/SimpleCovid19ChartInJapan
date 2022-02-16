import { FunctionComponent, useState } from "react"
import { ChevronDownIcon } from "@heroicons/react/solid"
import { Prefecture, regions } from './regions'
import { Link } from '../components/Link'
import { DateTime } from 'luxon'

export type Props = {
    updatedAt: number
    prefecture?: Prefecture
}

export const Header: FunctionComponent<Props> = props => {
    const [isOpen, setIsOpen] = useState(false)

    return (
        <header className="bg-gray-700 text-white py-1 px-4">
            <span className="pr-4 cursor-pointer select-none" onClick={() => setIsOpen(!isOpen)}>
                <ChevronDownIcon className={`h-5 w-5 inline-block transform ${isOpen ? 'rotate-180' : ''}`} />
                Simple COVID-19 Chart In Japan
            </span>
            <span className="pr-4">{props.prefecture?.title || '全国'}</span>
            <span>更新時刻: {DateTime.fromMillis(props.updatedAt, { zone: 'UTC+0', locale: 'ja' }).toLocal().toFormat('yyyy / MM / dd (ccc) HH:mm')}</span>
            {isOpen && <div className="lg:flex">
                <div className="flex-none">
                    <div><Link href="/" linkType="Text">全国</Link></div>
                    {regions.map(region => <div key={region.name}>
                        {region.name}：{region.prefectures.map(pref => <Link key={pref.id} href={'/' + pref.name} linkType="Text" className='m-1'>{pref.title}</Link>)}
                    </div>)}
                </div>

                <div className="flex-1 mt-4 lg:mt-0">
                    <div>
                        感染状況データソース: <Link href="https://covid19.mhlw.go.jp/extensions/public/index.html" linkType="Text">データからわかる－新型コロナウイルス感染症情報－ | 厚生労働省</Link>
                    </div>
                    <div>
                        ワクチンデータソース: <Link href="https://info.vrs.digital.go.jp/dashboard/" linkType="Text">新型コロナワクチンの接種状況 ワクチン接種記録システム（VRS）</Link>
                    </div>
                </div>
            </div>}
        </header>
    )
}

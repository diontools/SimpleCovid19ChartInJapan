import { GetStaticPaths, GetStaticProps, NextPage } from "next"
import { Layout } from "../components/Layout"
import * as data from '../components/data'
import { getPrefecture, Prefecture, regions } from '../components/regions'
import { Chart, chartOptions } from "../components/Chart"

export type Props = {
    update: data.UpdateInfo
    prefecture: Prefecture | null
    charts: data.ChartProps[]
}

export const PrefPage: NextPage<Props> = props => (
    <Layout
        updatedAt={props.update.updatedAt}
        prefecture={props.prefecture || undefined}
    >
        {props.charts.map((c, i) => <Chart key={i} data={c.data} options={chartOptions} />)}
    </Layout>
)

export default PrefPage

export const getStaticProps: GetStaticProps<Props> = async context => {
    console.log(context.params)
    const prefectureName = context.params?.id?.[0] || ''
    const prefecture = getPrefecture(prefectureName) || null
    // if (!prefecture) throw 'unknown prefecture ' + JSON.stringify(prefectureName)

    return {
        props: {
            update: data.update,
            prefecture: prefecture,
            charts: data.generateCharts(prefecture || undefined),
        }
    }
}

export const getStaticPaths: GetStaticPaths = async context => {
    return {
        paths: regions.flatMap(region => region.prefectures.map(pref => '/' + pref.name)).concat(['/']),
        fallback: false,
    }
}
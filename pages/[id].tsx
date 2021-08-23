import { GetStaticPaths, GetStaticProps, NextPage } from "next"
import { Layout } from "../components/Layout"
import * as data from '../components/data'
import { getPrefecture, Prefecture, regions } from '../components/regions'
import { Chart } from "../components/Chart"

export type Props = {
    update: data.UpdateInfo
    prefecture: Prefecture
    charts: data.ChartProps[]
}

export const PrefPage: NextPage<Props> = props => (
    <Layout
        updatedAt={props.update.updatedAt}
        prefecture={props.prefecture}
    >
        {props.charts.map((c, i) => <Chart key={i} data={c.data} options={c.options} />)}
    </Layout>
)

export default PrefPage

export const getStaticProps: GetStaticProps<Props> = async context => {
    const prefectureName = context.params?.id as string
    const prefecture = getPrefecture(prefectureName)
    if (!prefecture) throw 'unknown prefecture ' + prefectureName

    return {
        props: {
            update: data.update,
            prefecture: prefecture,
            charts: data.generateCharts(prefecture),
        }
    }
}

export const getStaticPaths: GetStaticPaths = async context => {
    return {
        paths: regions.flatMap(region => region.prefectures.map(pref => '/' + pref.name)),
        fallback: false,
    }
}
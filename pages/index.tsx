import type { GetStaticProps, NextPage } from 'next'
import { Chart } from '../components/Chart'
import * as data from '../components/data'
import '../components/arrayEx'
import { Layout } from '../components/Layout'

type Props = {
    update: data.UpdateInfo
    charts: data.ChartProps[]
}

const Home: NextPage<Props> = props => {
    return (
        <Layout updatedAt={props.update.updatedAt}>
            {props.charts.map((c, i) => <Chart key={i} data={c.data} options={c.options} />)}
        </Layout>
    )
}

export default Home

export const getStaticProps: GetStaticProps<Props> = async context => {
    return {
        props: {
            update: data.update,
            charts: data.generateCharts(),
        }
    }
}
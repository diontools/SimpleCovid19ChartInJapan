import { FunctionComponent } from "react"
import Head from 'next/head'
import { Header } from "./Header"
import { Prefecture } from "./regions"

export const Layout: FunctionComponent<{ updatedAt: number, prefecture?: Prefecture }> = props => (
    <>
        <Head>
            <title>{props.prefecture?.title || '全国'} | Simple COVID-19 Chart In Japan</title>
            <link rel="icon" href="/favicon.ico" />
        </Head>

        <Header updatedAt={props.updatedAt} prefecture={props.prefecture} />
        {props.children}
    </>
)
import { FunctionComponent } from "react"
import NextLink from "next/link"
import { withRouter } from 'next/router'
import { WithRouterProps } from "next/dist/client/with-router"

export type LinkType = 'Normal' | 'Text'

export type Props = {
    linkType?: LinkType
    href: string
    as?: string
    children: string
    className?: string
    activeClassName?: string
}

export const Link = withRouter<Props & WithRouterProps>(props => {
    const isActive = props.router.asPath === props.href || props.router.asPath === props.as
    const active = props.activeClassName || 'font-bold'
    const className = getStyle(props.linkType) + ' ' + (props.className || '')

    return (
        <NextLink href={props.href} as={props.as} prefetch={true}>
            <a className={`${className} ${isActive && active}`}>{props.children}</a>
        </NextLink>
    )
})

function getStyle(type?: LinkType) {
    switch (type) {
        case undefined:
        case 'Normal':
            return 'no-underline hover:underline text-blue-500'
        case 'Text':
            return 'no-underline hover:underline text-blue-100'
        default: const _: never = type
    }
}
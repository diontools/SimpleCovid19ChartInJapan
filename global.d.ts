import type { ChartType } from 'chart.js'
import type { ZoomPluginOptions } from 'chartjs-plugin-zoom/types/options'

declare module 'chart.js' {
    interface PluginOptionsByType<TType extends ChartType> {
        zoom: ZoomPluginOptions
    }
}
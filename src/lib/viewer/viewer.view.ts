import { VirtualDOM, CSSAttribute } from '@youwol/rx-vdom'
import { State } from './viewer.state'
import { BehaviorSubject } from 'rxjs'

export type ViewConfig = {
    class?: string
    style?: CSSAttribute
}
const defaultViewConfig = {
    class: 'h-100 w-100',
    style: {},
    sizeHint: 'auto',
}
export class ViewerView implements VirtualDOM<'div'> {
    public readonly tag = 'div'
    public readonly class: string = ''
    public readonly style = {}
    public readonly state: State

    public readonly connectedCallback: (el: HTMLElement) => void
    public readonly disconnectedCallback: (el: HTMLElement) => void

    public readonly parentHeight$ = new BehaviorSubject<
        'resolved' | 'unresolved'
    >('unresolved')

    public readonly viewConfig = defaultViewConfig

    constructor(params: { state: State; viewConfig?: ViewConfig }) {
        Object.assign(this, params)
        this.viewConfig = this.viewConfig || defaultViewConfig
        this.class = this.viewConfig.class
        this.style = this.viewConfig.style
        this.connectedCallback = (div: HTMLDivElement) => {
            setTimeout(() => {
                this.state.registerRenderingContext(div)
            }, 0)
        }
        this.disconnectedCallback = (div: HTMLDivElement) => {
            this.state.disposeRenderingContext(div)
        }
    }
}

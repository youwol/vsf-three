import { asMutable, Contracts, Modules } from '@youwol/vsf-core'
import { Color, Object3D, PerspectiveCamera, Scene, WebGLRenderer } from 'three'
import { TrackballControls } from './trackball.controls'
import { ReplaySubject, Subject } from 'rxjs'
import {
    fitSceneToContentIfNeeded,
    getSceneBoundingBox,
    initializeRenderer,
} from './utils'
import { VirtualDOM } from '@youwol/flux-view'
import { Context } from '@youwol/logging'

export const configuration = {
    schema: {},
}

export const inputs = {
    input$: {
        description: 'The object to add.',
        contract: Contracts.contract<{ objects: Object3D[] }>({
            description: 'Be able to retrieve a Three.Object3D',
            requirements: {
                objects: Contracts.some({
                    description: 'One or more objects',
                    when: Contracts.instanceOf({
                        typeName: 'Object3D',
                        Type: Object3D,
                        attNames: ['object', 'mesh'],
                    }),
                }),
            },
        }),
    },
}

export class PluginsGateway {
    scene$ = new ReplaySubject<Scene>(1)

    renderingDiv$ = new ReplaySubject<HTMLDivElement>(1)
    controls$ = new ReplaySubject<TrackballControls>(1)
    mouseDown$ = new Subject<MouseEvent>()
    mouseMove$ = new Subject<MouseEvent>()
    mouseUp$ = new Subject<MouseEvent>()
    click$ = new Subject<MouseEvent>()
}

export const outputs = () => ({})

export function module(fwdArgs) {
    const state = new State()
    const module = new Modules.Implementation(
        {
            configuration,
            inputs,
            outputs,
            html: () => renderHtmlElement(state),
            state,
        },
        fwdArgs,
    )
    module.inputSlots.input$.preparedMessage$.subscribe((message) => {
        state.render(
            asMutable<Object3D[]>(message.data.objects),
            module.journal.addPage({ title: 'render' }),
        )
    })
    return module
}

export class State {
    public readonly pluginsGateway = new PluginsGateway()

    public readonly scene = new Scene()
    public camera: PerspectiveCamera
    public renderer: WebGLRenderer
    public controls: TrackballControls

    private registeredRenderLoopActions: {
        [key: string]: { action: (Module) => void; instance: unknown }
    } = {}
    private animationFrameHandle: number

    constructor() {
        this.scene.background = new Color(0x424242)
    }

    setRenderingDiv(renderingDiv: HTMLDivElement) {
        this.init(renderingDiv)
        this.pluginsGateway.renderingDiv$.next(renderingDiv)
    }

    addRenderLoopAction(
        uid: string,
        instance: unknown,
        action: (Module) => void,
    ) {
        this.registeredRenderLoopActions[uid] = {
            action: action,
            instance: instance,
        }
    }

    removeRenderLoopAction(uid: string) {
        delete this.registeredRenderLoopActions[uid]
    }

    resize(renderingDiv: HTMLDivElement) {
        this.renderer.setSize(
            renderingDiv.clientWidth,
            renderingDiv.clientHeight,
        )
        this.camera.aspect =
            renderingDiv.clientWidth / renderingDiv.clientHeight
        this.camera.updateProjectionMatrix()
    }

    init(renderingDiv: HTMLDivElement) {
        this.camera = new PerspectiveCamera(
            70,
            renderingDiv.clientWidth / renderingDiv.clientHeight,
            0.01,
            1000,
        )
        this.camera.position.z = 10

        try {
            this.controls = new TrackballControls(this.camera, renderingDiv)

            this.pluginsGateway.controls$.next(this.controls)
            this.renderer = initializeRenderer({
                renderingDiv,
                scene: this.scene,
                camera: this.camera,
                controls: this.controls,
                registeredRenderLoopActions: this.registeredRenderLoopActions,
                viewerInstance: this,
                onNextFrame: (handle) => (this.animationFrameHandle = handle),
            })
        } catch (e) {
            console.error('Creation of webGl context failed.')
            this.renderer = undefined
        }
    }

    render(objects: Object3D[], logContext: Context) {
        this.scene.clear()

        objects.forEach((obj) => {
            this.scene.add(obj)
        })

        if (!this.renderer) {
            logContext.info('No renderer available', {
                scene: this.scene,
            })
            logContext.terminate()
            return
        }

        const fromBBox = this.scene && getSceneBoundingBox(this.scene)
        fitSceneToContentIfNeeded(
            fromBBox,
            this.scene,
            this.camera,
            this.controls,
        )

        this.renderer.render(this.scene, this.camera)
        logContext.info('Scene updated', {
            scene: this.scene,
            renderer: this.renderer,
        })
        logContext.terminate()
    }

    cancelAnimationFrame() {
        cancelAnimationFrame(this.animationFrameHandle)
    }
}

function renderHtmlElement(state /*: State*/): VirtualDOM {
    return {
        class: 'h-100 w-100',
        disconnectedCallback: () => {
            state.cancelAnimationFrame()
        },
        connectedCallback: (div: HTMLDivElement) => {
            div.addEventListener(
                'mousedown',
                (e) => state.pluginsGateway.mouseDown$.next(e),
                false,
            )
            div.addEventListener(
                'click',
                (e) => state.pluginsGateway.click$.next(e),
                false,
            )
            div.addEventListener(
                'mousemove',
                (e) => state.pluginsGateway.mouseMove$.next(e),
                false,
            )

            div.addEventListener(
                'mouseup',
                (e) => state.pluginsGateway.mouseUp$.next(e),
                false,
            )
            setTimeout(() => {
                state.setRenderingDiv(div)
                const observer = new window['ResizeObserver'](() =>
                    state.resize(div),
                )
                observer.observe(div)
            }, 0)
        },
    }
}

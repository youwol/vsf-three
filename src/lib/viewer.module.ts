import { asMutable, Contracts, Modules } from '@youwol/vsf-core'
import {
    AmbientLight,
    BoxHelper,
    BufferGeometry,
    Color,
    Group,
    HemisphereLight,
    LineBasicMaterial,
    LineSegments,
    Mesh,
    MeshStandardMaterial,
    Object3D,
    PerspectiveCamera,
    PointLight,
    Raycaster,
    Scene,
    Vector2,
    WebGLRenderer,
    WireframeGeometry,
} from 'three'
import { TrackballControls } from './trackball.controls'
import {
    merge,
    ReplaySubject,
    Subject,
    Subscription,
    withLatestFrom,
} from 'rxjs'
import {
    fitSceneToContentIfNeeded,
    getSceneBoundingBox,
    initializeRenderer,
} from './utils'
import { AnyVirtualDOM } from '@youwol/rx-vdom'
import { filter } from 'rxjs/operators'
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
    private vdomSubscriptions: Subscription[] = []

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
            this.plugRayCaster()
            this.initializeSelectables()
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
        this.initializeSelectables()
        logContext.terminate()
    }

    public disconnectView() {
        cancelAnimationFrame(this.animationFrameHandle)
        this.vdomSubscriptions.forEach((s) => s.unsubscribe())
        this.vdomSubscriptions = []
    }
    private initializeSelectables() {
        const selectables = this.getSelectableObjects()
        const selections$ = new Set(
            selectables.map((obj) => obj.selectorManager.selection$),
        )
        this.vdomSubscriptions.push(
            merge(...selections$).subscribe((obj) => {
                obj && this.select(obj.target)
                if (!obj) {
                    this.clearSelection()
                }
            }),
        )
    }

    private getSelectableObjects(): (Object3D & SelectableTrait)[] {
        const selectableObjects: (Object3D & SelectableTrait)[] = []
        function traverseChildren(obj: Scene | Object3D) {
            if (isSelectable(obj)) {
                selectableObjects.push(obj)
            }
            obj.children.forEach((child) => {
                traverseChildren(child)
            })
        }
        traverseChildren(this.scene)
        return selectableObjects
    }

    private selectedHelpers: {
        currentBoundingBox?: BoxHelper
        currentWireframe?: LineSegments
    } = {}
    private selection?: {
        object: Object3D
        helpers: Group
        manager: SelectorManager
    }
    private select(object: (Object3D & SelectableTrait) | undefined) {
        this.clearSelection()
        if (!object) {
            return
        }
        // defaultColor is yellow
        const defaultColor = 0x00ff00
        let colorBox = defaultColor
        let colorWireframe = defaultColor
        if (object instanceof Mesh) {
            colorBox = object.material.color.getHex()

            const color = object.material.color
            const luminance =
                0.2126 * color.r + 0.7152 * color.g + 0.0722 * color.b
            const contrastingColor =
                luminance > 0.5 ? new Color(0x000000) : new Color(0xffffff)
            colorWireframe = contrastingColor.getHex()
        }
        const selectionGroup = new Group()
        selectionGroup.name = 'selectionHelpers'
        selectionGroup.add(new BoxHelper(object, colorBox))

        const wireframeGeometry = new WireframeGeometry(object['geometry'])
        const currentWireframe = new LineSegments(
            wireframeGeometry,
            new LineBasicMaterial({ color: colorWireframe }),
        )
        currentWireframe.position.copy(object.position)
        currentWireframe.rotation.copy(object.rotation)
        currentWireframe.scale.copy(object.scale)
        selectionGroup.add(currentWireframe)

        object.add(selectionGroup)
        this.selection = {
            object,
            helpers: selectionGroup,
            manager: object.selectorManager,
        }
    }

    private clearSelection() {
        if (!this.selection) {
            return
        }
        this.selection.object.remove(this.selection.helpers)
        this.selection = undefined
    }

    private plugRayCaster() {
        const canvas = this.renderer.domElement
        const raycaster = new Raycaster()
        const mouse = new Vector2()
        const mouseDown$ = new Subject<Date>()
        const mouseUp$ = new Subject<{ ev: MouseEvent; date: Date }>()
        canvas.addEventListener(
            'mousedown',
            () => mouseDown$.next(new Date()),
            false,
        )
        canvas.addEventListener(
            'mouseup',
            (ev) => mouseUp$.next({ ev, date: new Date() }),
            false,
        )
        this.vdomSubscriptions.push(
            mouseUp$
                .pipe(
                    withLatestFrom(mouseDown$),
                    filter(([a, b]) => a.date.getTime() - b.getTime() < 500),
                )
                .subscribe(([a]) => {
                    onMouseClick(a.ev)
                }),
        )
        const onMouseClick = (event: MouseEvent) => {
            // Calculate mouse position in normalized device coordinates (-1 to +1) for x & y components.
            const rect = canvas.getBoundingClientRect()
            mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1
            mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1

            raycaster.setFromCamera(mouse, this.camera)
            const intersects = raycaster.intersectObjects(this.scene.children)

            if (intersects.length > 0 && isSelectable(intersects[0].object)) {
                const obj = intersects[0].object
                obj.selectorManager.selection$.next({
                    target: obj,
                    event: 'clicked',
                })
            } else {
                this.selection?.manager.selection$.next(undefined)
            }
        }
    }
}

function renderHtmlElement(state: State): AnyVirtualDOM {
    return {
        tag: 'div',
        class: 'h-100 w-100',
        disconnectedCallback: () => {
            state.disconnectView()
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

export interface SelectorManager {
    selection$: Subject<{
        target: Object3D & SelectableTrait
        event: 'clicked' | 'hovered'
    }>
}

export type SelectableTrait = {
    selectorManager: SelectorManager
}

function isSelectable(object: Object3D): object is Object3D & SelectableTrait {
    return object['selectorManager'] !== undefined
}

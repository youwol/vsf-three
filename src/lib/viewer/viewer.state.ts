import {
    merge,
    ReplaySubject,
    Subject,
    Subscription,
    withLatestFrom,
} from 'rxjs'
import {
    BoxHelper,
    Color,
    Group,
    LineBasicMaterial,
    LineSegments,
    Mesh,
    Object3D,
    PerspectiveCamera,
    Raycaster,
    Scene,
    Vector2,
    WebGLRenderer,
    WireframeGeometry,
} from 'three'
import { TrackballControls } from './trackball.controls'
import {
    createRenderingContext,
    defaultLights,
    disposeRenderingContext,
    render,
} from './utils'
import { Context } from '@youwol/logging'
import { filter } from 'rxjs/operators'

export type DefaultLights = 'none' | 'default'

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

export class PluginsGateway {
    scene$ = new ReplaySubject<Scene>(1)

    renderingDiv$ = new ReplaySubject<HTMLDivElement>(1)
    controls$ = new ReplaySubject<TrackballControls>(1)
    mouseDown$ = new Subject<MouseEvent>()
    mouseMove$ = new Subject<MouseEvent>()
    mouseUp$ = new Subject<MouseEvent>()
    click$ = new Subject<MouseEvent>()
}

export type RenderingContext = {
    resizeObserver: ResizeObserver
    renderingDiv: HTMLDivElement
    canvas: HTMLCanvasElement
    renderer: WebGLRenderer
    camera: PerspectiveCamera
    controls: TrackballControls
    animationFrameHandle?: number
    subscriptions: Subscription[]
}

export class State {
    public readonly pluginsGateway = new PluginsGateway()

    public readonly scene = new Scene()
    public readonly defaultLights: DefaultLights

    private registeredRenderLoopActions: {
        [key: string]: { action: (Module) => void; instance: unknown }
    } = {}

    private renderingContexts: RenderingContext[] = []
    private subscriptions: Subscription[] = []

    constructor(params: { defaultLights: DefaultLights }) {
        Object.assign(this, params)
        this.scene.background = new Color(0x424242)
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

    registerRenderingContext(renderingDiv: HTMLDivElement): RenderingContext {
        const renderingContext = createRenderingContext(
            renderingDiv,
            this.scene,
        )
        this.renderingContexts.push(renderingContext)
        this.plugRayCaster(renderingContext)
        return renderingContext
    }

    disposeRenderingContext(renderingDiv: HTMLDivElement) {
        const renderingContext = this.renderingContexts.find(
            (ctx) => ctx.renderingDiv === renderingDiv,
        )
        if (!renderingContext) {
            return
        }
        disposeRenderingContext(renderingContext)
        renderingContext.subscriptions.forEach((s) => s.unsubscribe())
        this.renderingContexts = this.renderingContexts.filter(
            (ctx) => ctx !== renderingContext,
        )
    }

    render(objects: Object3D[], logContext: Context) {
        this.scene.clear()
        if (this.defaultLights === 'default') {
            this.scene.add(defaultLights())
        }
        objects.forEach((obj) => {
            this.scene.add(obj)
        })
        this.initializeSelectables()

        this.renderingContexts.forEach((renderingCtx) => {
            render(renderingCtx, this.scene, logContext)
        })
    }

    private initializeSelectables() {
        const selectables = this.getSelectableObjects()
        const selections$ = new Set(
            selectables.map((obj) => obj.selectorManager.selection$),
        )
        this.subscriptions.push(
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

    private plugRayCaster(renderingContext: RenderingContext) {
        const canvas = renderingContext.renderer.domElement
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
        renderingContext.subscriptions.push(
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

            raycaster.setFromCamera(mouse, renderingContext.camera)
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

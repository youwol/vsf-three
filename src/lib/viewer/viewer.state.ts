import { merge, Subject, Subscription, withLatestFrom } from 'rxjs'
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
    public readonly scene = new Scene()
    public readonly defaultLights: DefaultLights

    private selection?: {
        object: Object3D
        helpers: Group
        manager: SelectorManager
    }
    private renderingContexts: RenderingContext[] = []
    private subscriptions: Subscription[] = []

    constructor(params: { defaultLights: DefaultLights }) {
        Object.assign(this, params)
        this.scene.background = new Color(0x424242)
    }

    registerRenderingContext(renderingDiv: HTMLDivElement): RenderingContext {
        const renderingContext = createRenderingContext(
            renderingDiv,
            this.scene,
        )
        this.renderingContexts.push(renderingContext)
        plugRayCaster(this.scene, renderingContext)
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
        const selectables = getSelectableObjects(this.scene)
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

    private select(object: (Object3D & SelectableTrait) | undefined) {
        this.clearSelection()
        const selectionGroup = createSelectionGroup(object)
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
}

function getSelectableObjects(scene: Scene): (Object3D & SelectableTrait)[] {
    const selectableObjects: (Object3D & SelectableTrait)[] = []
    function traverseChildren(obj: Scene | Object3D) {
        if (isSelectable(obj)) {
            selectableObjects.push(obj)
        }
        obj.children.forEach((child) => {
            traverseChildren(child)
        })
    }
    traverseChildren(scene)
    return selectableObjects
}

function createSelectionGroup(
    object: (Object3D & SelectableTrait) | undefined,
) {
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
        const luminance = 0.2126 * color.r + 0.7152 * color.g + 0.0722 * color.b
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
    return selectionGroup
}

function plugRayCaster(scene: Scene, renderingContext: RenderingContext) {
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
    let lastSelector: SelectorManager | undefined
    const isVisible = (object: Object3D) => {
        if (!object.visible) {
            return false
        }
        if (object instanceof Mesh && !object.material?.visible) {
            return false
        }
        if (object.parent) {
            return isVisible(object.parent)
        }
        return true
    }
    const onMouseClick = (event: MouseEvent) => {
        // Calculate mouse position in normalized device coordinates (-1 to +1) for x & y components.
        const rect = canvas.getBoundingClientRect()
        mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1
        mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1

        raycaster.setFromCamera(mouse, renderingContext.camera)
        const intersects = raycaster.intersectObjects(scene.children)
        const visibles = intersects.filter(({ object }) => isVisible(object))
        if (visibles.length > 0 && isSelectable(visibles[0].object)) {
            const obj = visibles[0].object
            lastSelector = obj.selectorManager
            obj.selectorManager.selection$.next({
                target: obj,
                event: 'clicked',
            })
        } else {
            lastSelector?.selection$.next(undefined)
        }
    }
}

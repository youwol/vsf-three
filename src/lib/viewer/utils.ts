import {
    Box3,
    BufferGeometry,
    Group,
    Object3D,
    PerspectiveCamera,
    Mesh,
    Scene,
    Vector3,
    WebGLRenderer,
    AmbientLight,
    PointLight,
    HemisphereLight,
    MeshStandardMaterial,
} from 'three'
import { TrackballControls } from './trackball.controls'
import { RenderingContext } from './viewer.state'
import { Context } from '@youwol/logging'

export function getChildrenGeometries(children) {
    const geometries = children
        .filter((child) => child instanceof Group || child['geometry'])
        .map((child) => {
            if (child instanceof Group) {
                return getChildrenGeometries(child.children).reduce(
                    (acc, e) => acc.concat(e),
                    [],
                )
            }
            return [child]
        })
    return geometries.reduce((acc, e) => acc.concat(e), [])
}

export function fitSceneToContent(
    scene: Scene,
    camera: PerspectiveCamera,
    controls: TrackballControls,
) {
    const bbox = getSceneBoundingBox(scene)
    const size = bbox.getSize(new Vector3())
    const center = bbox.getCenter(new Vector3())

    if (size.length() == 0) {
        return
    }

    const fitRatio = 1.2
    const pcamera = camera

    const maxSize = Math.max(size.x, size.y, size.z)
    const fitHeightDistance =
        maxSize / (2 * Math.atan((Math.PI * pcamera.fov) / 360))
    const fitWidthDistance = fitHeightDistance / pcamera.aspect
    const distance = fitRatio * Math.max(fitHeightDistance, fitWidthDistance)

    const direction = controls.target
        .clone()
        .sub(camera.position)
        .normalize()
        .multiplyScalar(distance)

    controls.maxDistance = distance * 10
    controls.target.copy(center)
    pcamera.near = distance / 100
    pcamera.far = distance * 100
    pcamera.updateProjectionMatrix()
    camera.position.copy(controls.target).sub(direction)

    controls.update()
}

export function getSceneBoundingBox(scene) {
    const selection = getChildrenGeometries(scene.children)
    const box = new Box3()

    selection.forEach((mesh) => {
        box.expandByObject(mesh)
    })

    return box
}

export function fitSceneToContentIfNeeded(
    fromBBox: Box3,
    scene: Scene,
    camera: PerspectiveCamera,
    controls: TrackballControls,
) {
    if (!scene || !camera || !controls) {
        return
    }
    const toBBox = getSceneBoundingBox(scene)
    let size = fromBBox.getSize(new Vector3())
    const fromSize = Math.max(size.x, size.y, size.z)
    size = toBBox.getSize(new Vector3())
    const toSize = Math.max(size.x, size.y, size.z)

    if (fromSize == 0 && toSize > 0) {
        fitSceneToContent(scene, camera, controls)
    }

    const minTranslation = fromBBox.min.distanceTo(toBBox.min) / fromSize
    const maxTranslation = fromBBox.max.distanceTo(toBBox.max) / fromSize
    const hasChanged = minTranslation > 0.1 || maxTranslation > 0.1

    if (hasChanged && controls) {
        fitSceneToContent(scene, camera, controls)
    }
}
type Transform = {
    x: number
    y: number
    z: number
}
type AllTransform = {
    rotation: Transform
    translation: Transform
    scaling: Transform
}
export function applyTransformation(object: Object3D, transform: AllTransform) {
    const scale = transform.scaling
    const rotation = transform.rotation
    const translation = transform.translation

    const applyOnGeom = (geometry: BufferGeometry) => {
        geometry.scale(scale.x, scale.y, scale.z)
        geometry.rotateX((rotation.x / 180) * Math.PI)
        geometry.rotateY((rotation.y / 180) * Math.PI)
        geometry.rotateZ((rotation.z / 180) * Math.PI)
        geometry.translate(translation.x, translation.y, translation.z)
    }
    if (object instanceof Group) {
        const objects = getChildrenGeometries(object.children)
        objects.forEach((obj) => {
            applyOnGeom(obj.geometry)
        })
    }
    if (object instanceof Mesh) {
        applyOnGeom(object.geometry)
    }

    return object
}

export function defaultLights() {
    const ambientLight = new AmbientLight(0xffffff, 0.5)

    const pointLight0 = new PointLight(0xffffff, 1, 0)
    pointLight0.name = 'point-light0'
    pointLight0.position.set(10, 10, 10)
    const pointLight1 = new PointLight(0xffffff, 1, 0)
    pointLight1.name = 'point-light1'
    pointLight1.position.set(-10, 10, -10)
    const hemLight = new HemisphereLight(0xffffff, 0x000001)
    hemLight.name = 'hemisphere-light'
    const grp = new Group()
    grp.add(ambientLight, hemLight, pointLight0, pointLight1)
    grp.name = 'Lights'
    return grp
}

export const defaultMaterial = new MeshStandardMaterial({
    color: 0x156289,
    opacity: 1,
    emissive: 0x072534,
    roughness: 0.5,
    metalness: 0.0,
    wireframe: true,
})

export function createRenderingContext(
    renderingDiv: HTMLDivElement,
    scene: Scene,
): RenderingContext {
    const camera = new PerspectiveCamera(
        70,
        renderingDiv.clientWidth / renderingDiv.clientHeight,
        0.01,
        1000,
    )
    camera.position.z = 10
    const controls = new TrackballControls(camera, renderingDiv)
    const canvas = document.createElement('canvas')
    const context = canvas.getContext('webgl2', { alpha: false })
    const renderer = new WebGLRenderer({ canvas, context, antialias: true })
    renderer.setSize(renderingDiv.clientWidth, renderingDiv.clientHeight)

    if (renderingDiv.children.length == 0) {
        renderingDiv.appendChild(renderer.domElement)
    }

    const resizeObserver = new ResizeObserver(() =>
        resize(renderingDiv, renderer, camera),
    )

    const renderingContext: RenderingContext = {
        resizeObserver,
        renderingDiv,
        canvas,
        renderer,
        camera,
        controls,
        subscriptions: [],
    }
    fitSceneToContent(scene, camera, controls)

    const animate = () => {
        renderingContext.animationFrameHandle = requestAnimationFrame(animate)
        controls && controls.update()
        renderer.render(scene, camera)
    }
    renderingContext.resizeObserver.observe(renderingDiv)
    animate()

    return renderingContext
}

export function disposeRenderingContext(renderingContext: RenderingContext) {
    renderingContext.resizeObserver.disconnect()
    renderingContext.animationFrameHandle &&
        cancelAnimationFrame(renderingContext.animationFrameHandle)
    renderingContext.renderer.forceContextLoss()
    renderingContext.renderer.dispose()
    renderingContext.renderer.domElement.remove()
    renderingContext.controls.dispose()
    renderingContext.renderer = null
    renderingContext.camera = null
    renderingContext.controls = null
    renderingContext.canvas = null
    renderingContext.renderingDiv = null
}

export function resize(
    renderingDiv: HTMLDivElement,
    renderer: WebGLRenderer,
    camera: PerspectiveCamera,
) {
    renderer.setSize(renderingDiv.clientWidth, renderingDiv.clientHeight)
    camera.aspect = renderingDiv.clientWidth / renderingDiv.clientHeight
    camera.updateProjectionMatrix()
}

export function render(
    renderingCtx: RenderingContext,
    scene: Scene,
    logContext: Context,
) {
    fitSceneToContent(scene, renderingCtx.camera, renderingCtx.controls)

    renderingCtx.renderer.render(scene, renderingCtx.camera)
    logContext.info('Scene updated', {
        scene: scene,
        renderer: renderingCtx.renderer,
    })
    logContext.terminate()
}

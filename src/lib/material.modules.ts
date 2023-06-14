/**
 *
 *
 * This module wrap the [MeshStandardMaterial](https://threejs.org/docs/#api/en/materials/MeshStandardMaterial)
 * class of three.js.
 *
 * <iframe width="100%" height="800px"
 * src="http://localhost:2000/applications/@youwol/vsf-snippet/latest?content=return%20async%20(%7Bproject%2C%20cell%2C%20env%7D)%20%3D%3E%20%7B%0A%20%20%20%20project%20%3D%20await%20project.import(%27rxjs%27%2C%20%27core%27%2C%20%27three%27)%0A%0A%20%20%20%20project%20%3D%20await%20project.parseDag(%5B%0A%20%20%20%20%20%20%20%20%2F%2F%20mesh%0A%20%20%20%20%20%20%20%20%27(standardMaterial%23mat)%3E%3E(combineLatest%23combineMesh1)%3E%3E(mesh%23meshPlain)%3E%3E0(combineLatest%23combine)%27%2C%0A%20%20%20%20%09%27(of%23of)%3E%3E(torusKnot%23geom)%3E%3E1(%23combineMesh1)%27%2C%0A%20%20%20%20%20%20%20%20%2F%2F%20lights%0A%20%20%20%20%20%20%20%20%27(of%23of2)%3E%3E(hemisphereLight%23light)%3E%3E1(%23combine)%27%2C%0A%20%20%20%20%20%20%20%20%27(%23of2)%3E%3E(pointLight%23light2)%3E%3E2(%23combine)%27%2C%0A%20%20%20%20%20%20%20%20%2F%2F%20viewer%0A%20%20%20%20%20%20%20%20%27(%23combine)%3E%3E(viewer%23viewer)%27%2C%0A%20%20%20%20%5D%2C%7B%0A%20%20%20%20%20%20%20%20combine%3A%20%20%09%7B%20inputsCount%3A3%20%7D%2C%0A%20%20%20%20%20%20%20%20light%3A%20%09%09%7B%20groundColor%3A%200x000001%20%7D%2C%0A%20%20%20%20%20%20%20%20light2%3A%20%09%7B%20position%3A%20%7Bx%3A10%2C%20y%3A10%2C%20z%3A10%7D%20%7D%0A%20%20%20%20%7D)%0A%20%20%20%20const%20matMdle%20%3D%20project.getModule(%27mat%27)%0A%20%20%20%20project%20%3D%20await%20project.parseDag(%5B%0A%20%20%20%20%09%27(autoForm%23form)%3E%23a%3E(%23mat)%27%0A%20%20%20%20%5D%2C%7B%0A%20%20%20%20%20%20%20%20form%3A%20%09%09%7B%20schema%3A%20matMdle.configuration.schema%20%7D%2C%0A%20%20%20%20%20%20%20%20a%3A%20%09%09%09%7B%20adaptor%3A%20(%7Bdata%2C%20context%7D)%20%3D%3E%20(%7Bconfiguration%3A%20data%2C%20data%2C%20context%7D)%7D%2C%0A%20%20%20%20%7D)%0A%20%20%20%20%0A%20%20%20%20project%20%3D%20project.addLayer(%7B%0A%20%20%20%20%20%20%20%20layerId%3A%27Lights%27%2C%0A%20%20%20%20%09uids%3A%5B%27of2%27%2C%20%27light%27%2C%27light2%27%5D%0A%20%20%20%20%7D)%0A%20%20%20%20const%20viewerMdle%20%3D%20project.getModule(%27viewer%27)%0A%20%20%20%20const%20autoFormMdle%20%3D%20project.getModule(%27form%27)%0A%20%20%20%20%0A%20%20%20%20project%20%3D%20project.addHtml(%22View%22%2C%20%7B%0A%20%20%20%20%20%20%20%20class%3A%27w-100%20h-100%27%2C%0A%20%20%20%20%20%20%20%20style%3A%7B%20position%3A%20%27relative%27%7D%2C%0A%20%20%20%20%20%20%20%20children%3A%5B%0A%20%20%20%20%20%20%20%20%20%20%20%20viewerMdle.html()%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20%7B%0A%20%20%20%20%20%20%20%20%20%20%20%20%09style%3A%7B%20position%3A%20%27absolute%27%2C%20top%3A%275px%27%2C%20left%3A%275px%27%7D%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20children%3A%5BautoFormMdle.html()%5D%0A%20%20%20%20%20%20%20%20%20%20%20%20%7D%0A%20%20%20%20%20%20%20%20%5D%0A%20%20%20%20%7D)%0A%0A%20%20%20%20return%20project%0A%7D">
 * </iframe>
 *
 * @module
 */
import { Modules, Attributes } from '@youwol/vsf-core'
import {
    MeshStandardMaterial,
    DoubleSide,
    FrontSide,
    BackSide,
    Side,
} from 'three'
import { map } from 'rxjs/operators'

type SideConf = 'DoubleSide' | 'FrontSide' | 'BackSide'

const materialConfiguration = {
    transparent: new Attributes.Boolean({ value: false }),
    opacity: new Attributes.Float({ value: 1 }),
    visible: new Attributes.Boolean({ value: true }),
    side: new Attributes.StringLiteral<SideConf>({
        value: 'DoubleSide',
    }),
}
export const configuration = {
    schema: {
        ...materialConfiguration,
        color: new Attributes.Integer({ value: 0x3399ff }),
        wireframe: new Attributes.Boolean({ value: false }),
        wireframeLinewidth: new Attributes.Integer({ value: 1 }),
        emissive: new Attributes.Integer({
            value: 0x3399ff,
        }),
        emissiveIntensity: new Attributes.Float({
            value: 1,
        }),
        roughness: new Attributes.Float({ value: 0.2, min: 0, max: 1 }),
        metalness: new Attributes.Float({ value: 0.3, min: 0, max: 1 }),
        flatShading: new Attributes.Boolean({
            value: false,
        }),
    },
}

export const inputs = {
    input$: {},
}

export const outputs = (
    arg: Modules.OutputMapperArg<typeof configuration.schema, typeof inputs>,
) => ({
    output$: arg.inputs.input$.pipe(
        map(({ configuration, context }) => {
            const sideFactory: Record<SideConf, Side> = {
                DoubleSide: DoubleSide,
                FrontSide: FrontSide,
                BackSide: BackSide,
            }
            const material = new MeshStandardMaterial({
                ...configuration,
                side: sideFactory[configuration.side],
            })
            return {
                data: material,
                context,
            }
        }),
    ),
})

export function module(fwdParams) {
    return new Modules.Implementation(
        {
            configuration,
            inputs,
            outputs,
        },
        fwdParams,
    )
}

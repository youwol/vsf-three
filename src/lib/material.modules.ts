/**
 *
 *
 * This module wrap the [MeshStandardMaterial](https://threejs.org/docs/#api/en/materials/MeshStandardMaterial)
 * class of three.js.
 *
 * <iframe id="iFrameExample" src="" width="100%" height="800px"></iframe>
 * <script>
 *     const src = `return async ({project, cell, env}) => {
 *     project = await project.import('@youwol/vsf-rxjs', '@youwol/vsf-std-widgets', '@youwol/vsf-three')
 *     project = await project.parseDag([
 *         // mesh
 *         '(standardMaterial#mat)>>1(combineLatest#combineMesh1)>>(mesh#meshPlain)>>0(combineLatest#combine)',
 *     	   '(of#of)>>(torusKnot#geom)>>0(#combineMesh1)',
 *         // lights
 *         '(of#of2)>>(hemisphereLight#light)>>1(#combine)',
 *         '(#of2)>>(pointLight#light2)>>2(#combine)',
 *         // viewer
 *         '(#combine)>>(viewer#viewer)',
 *     ],{
 *         combine: { inputsCount:3 },
 *         light:   { groundColor: 0x000001 },
 *         light2:  { position: {x:10, y:10, z:10} }
 *     })
 *     const matMdle = project.getModule('mat')
 *     project = await project.parseDag([
 *         '(autoForm#form)>#a>(#mat)'
 *     ],{
 *         form: { schema: matMdle.configuration.schema },
 *         a:    { adaptor: ({data, context}) => ({configuration: data, data, context})},
 *     })
 *     project = project.addLayer({
 *         layerId: 'Lights',
 *         uids: [ 'of2', 'light','light2' ]
 *     })
 *     const viewerMdle = project.getModule('viewer')
 *     const autoFormMdle = project.getModule('form')
 *     project = project.addHtml("View", {
 *         class:'w-100 h-100',
 *         style: { position: 'relative' },
 *         children:[
 *             viewerMdle.html(),
 *             {
 *                 style: { position: 'absolute', top:'5px', left:'5px' },
 *                 children: [ autoFormMdle.html() ]
 *             }
 *         ]
 *     })
 *     return project
 * }
 *  `
 *     const url = '/applications/@youwol/vsf-snippet/latest?tab=view&content='+encodeURIComponent(src)
 *     document.getElementById('iFrameExample').setAttribute("src",url);
 * </script>
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

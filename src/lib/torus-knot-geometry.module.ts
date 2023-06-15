/**
 * This module wrap the [TorusKnotGeometry](https://threejs.org/docs/?q=torusknot#api/en/geometries/TorusKnotGeometry)
 * class of three.js.
 *
 * <iframe id="iFrameExample" src="" width="100%" height="800px"></iframe>
 * <script>
 *     const src = `return async ({project, cell, env}) => {
 *     project = await project.import('@youwol/vsf-rxjs', '@youwol/vsf-std-widgets', '@youwol/vsf-three')
 *     project = await project.parseDag([
 *         //inputs
 *         '(torusKnot#geom)>>1(combineLatest#combWire)',
 *         '(of#of)>>(standardMaterial#matWire)>>0(#combWire)',
 *         '(#of)>>(standardMaterial#matPlain)>>1(combineLatest#combPlain)',
 *         '(#geom)>>0(#combPlain)',
 *         //meshes
 *         '(#combWire)>>(mesh#meshWire)>>(combineLatest#combMeshes)',
 *         '(#combPlain)>>(mesh#meshPlain)>>1(combineLatest#combMeshes)',
 *         '(#combMeshes)>>(group#group)>>0(combineLatest#combViewer)>>(viewer#viewer)',
 *         //lights
 *         '(of#of2)>>(hemisphereLight#light)>>1(#combViewer)',
 *         '(#of2)>>(pointLight#light2)>>2(#combViewer)',
 *     ],{
 *         combWire:    { inputsCount:2 },
 *         combPlain:   { inputsCount:2 },
 *         combViewer:  { inputsCount:3 },
 *         matWire: 	{ wireframe: true, emissive: 0xFF0000 },
 *         matPlain: 	{ emissiveIntensity: 0.2, flatShading: true },
 *         light: 		{ groundColor: 0x000001 },
 *         light2: 	    { position: {x:10, y:10, z:10} },
 *         mapWire: 	{ project: ({data,context}) => ({data:[data[0], data[1]], context}) },
 *         mapPlain: 	{ project: ({data,context}) => ({data:[data[0], data[2]], context}) },
 *     })
 *     const geomMdle = project.getModule('geom')
 *     project = await project.parseDag([
 *     	'(#of)>>(autoForm#form)>#a>(#geom)'
 *     ],{
 *         form: 		{ schema: geomMdle.configuration.schema },
 *         a: 			{ adaptor: ({data, context}) => ({configuration: data, data, context})},
 *     })
 *     project = project.addLayer({
 *         layerId:'Lights',
 *     	   uids:['of2', 'light','light2']
 *     })
 *     project = project.addToCanvas({
 *     	   selector: (elem) => elem.uid == 'mapWire',
 *         view: () => ({innerText:'[geom, wire]'})
 *     },{
 *     	   selector: (elem) => elem.uid == 'mapPlain',
 *         view: () => ({innerText:'[geom, plain]'})
 *     })
 *     const viewerMdle = project.getModule('viewer')
 *     const autoFormMdle = project.getModule('form')
 *     project = project.addHtml("View", {
 *         class:'w-100 h-100',
 *         style:{ position: 'relative'},
 *         children:[
 *             viewerMdle.html(),
 *             {
 *             	   style:{ position: 'absolute', top:'5px', left:'5px'},
 *                 children:[autoFormMdle.html()]
 *             }
 *         ]
 *     })
 *     return project
 * }
 *  `
 *     const url = '/applications/@youwol/vsf-snippet/latest?tab=view&content='+encodeURIComponent(src)
 *     document.getElementById('iFrameExample').setAttribute("src",url);
 * </script>
 * @module
 */

import { Modules, Attributes } from '@youwol/vsf-core'
import { TorusKnotGeometry } from 'three'
import { map } from 'rxjs/operators'

export const configuration = {
    schema: {
        radius: new Attributes.Float({ value: 1, min: 0 }),
        tube: new Attributes.Float({ value: 0.4 }),
        tubularSegments: new Attributes.Integer({ value: 64 }),
        radialSegments: new Attributes.Integer({ value: 8 }),
        p: new Attributes.Integer({
            value: 2,
            min: 0,
        }),
        q: new Attributes.Integer({
            value: 3,
            min: 0,
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
            const geometry = new TorusKnotGeometry(
                configuration.radius,
                configuration.tube,
                configuration.tubularSegments,
                configuration.radialSegments,
                configuration.p,
                configuration.q,
            )
            return {
                data: geometry,
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

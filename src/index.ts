/**
 * Visual Studio Flow toolbox wrapping the <a href="https://threejs.org/" target="_blank">three.js</a> library.
 *
 * For comprehensive information about the Visual Studio Flow (vs-flow) environment as a whole, a user guide can be
 * accessed <a href="https://l.youwol.com/doc/@youwol/vs-flow" target="_blank" >here</a>.
 * For developers seeking detailed documentation, please refer to the resources available
 *  <a href="https://platform.youwol.com/applications/@youwol/cdn-explorer/latest?package=@youwol/vs-flow&tab=doc" target="_blank" >here</a>.
 *
 * We encourage you to participate in the development process of this toolbox by opening issues or contributing to the
 * project to add new modules and features. Your feedback and contributions are highly appreciated.
 *
 * Illustrative example:
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
export * from './lib'
export { setup } from './auto-generated'

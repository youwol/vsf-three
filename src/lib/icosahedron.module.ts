/**
 * This module wrap the [IcosahedronGeometry](https://threejs.org/docs/?q=torusknot#api/en/geometries/IcosahedronGeometry)
 * class of three.js.
 *
 * <iframe width="100%" height="800px"
 * src="/applications/@youwol/vsf-snippet/latest?geometry=icosahedron&content=return%20async%20(%7Bproject%2C%20cell%2C%20env%7D)%20%3D%3E%20%7B%0A%20%20%20%20const%20geometry%20%3D%20new%20URLSearchParams(window.location.search).get(%27geometry%27)%20%7C%7C%20%27torusKnot%27%0A%20%20%20%20project%20%3D%20await%20project.import(%27rxjs%27%2C%20%27core%27%2C%20%27three%27)%20%20%20%20%0A%20%20%20%20project%20%3D%20await%20project.parseDag(%5B%0A%20%20%20%20%20%20%20%20%2F%2Finputs%0A%20%20%20%20%20%20%20%20%60(%24%7Bgeometry%7D%23geom)%3E%3E0(combineLatest%23combInputs)%60%2C%0A%20%20%20%20%20%20%20%20%27(of%23of)%3E%3E(standardMaterial%23matWire)%3E%3E1(%23combInputs)%27%2C%0A%20%20%20%20%20%20%20%20%27(%23of)%3E%3E(standardMaterial%23matPlain)%3E%3E2(%23combInputs)%27%2C%0A%20%20%20%20%20%20%20%20%2F%2Fmeshes%0A%20%20%20%20%20%20%20%20%27(%23combInputs)%3E%3E(map%23mapWire)%3E%3E(mesh%23meshWire)%3E%3E(combineLatest%23combMeshes)%27%2C%0A%20%20%20%20%20%20%20%20%27(%23combInputs)%3E%3E(map%23mapPlain)%3E%3E(mesh%23meshPlain)%3E%3E1(combineLatest%23combMeshes)%27%2C%0A%20%20%20%20%20%20%20%20%27(%23combMeshes)%3E%3E(group%23group)%3E%3E0(combineLatest%23combViewer)%3E%3E(viewer%23viewer)%27%2C%0A%20%20%20%20%20%20%20%20%2F%2Flights%0A%20%20%20%20%20%20%20%20%27(of%23of2)%3E%3E(hemisphereLight%23light)%3E%3E1(%23combViewer)%27%2C%0A%20%20%20%20%20%20%20%20%27(%23of2)%3E%3E(pointLight%23light2)%3E%3E2(%23combViewer)%27%2C%0A%20%20%20%20%5D%2C%7B%0A%20%20%20%20%20%20%20%20combInputs%3A%20%7B%20inputsCount%3A3%20%7D%2C%0A%20%20%20%20%20%20%20%20combViewer%3A%20%7B%20inputsCount%3A3%20%7D%2C%0A%20%20%20%20%20%20%20%20matWire%3A%20%09%7B%20wireframe%3A%20true%2C%20emissive%3A%200xFF0000%20%7D%2C%0A%20%20%20%20%20%20%20%20matPlain%3A%20%09%7B%20emissiveIntensity%3A%200.2%2C%20flatShading%3A%20true%20%7D%2C%0A%20%20%20%20%20%20%20%20light%3A%20%09%09%7B%20groundColor%3A%200x000001%20%7D%2C%0A%20%20%20%20%20%20%20%20light2%3A%20%09%7B%20position%3A%20%7Bx%3A10%2C%20y%3A10%2C%20z%3A10%7D%20%7D%2C%0A%20%20%20%20%20%20%20%20mapWire%3A%20%09%7B%20project%3A%20(%7Bdata%2Ccontext%7D)%20%3D%3E%20(%7Bdata%3A%5Bdata%5B0%5D%2C%20data%5B1%5D%5D%2C%20context%7D)%20%7D%2C%0A%20%20%20%20%20%20%20%20mapPlain%3A%20%09%7B%20project%3A%20(%7Bdata%2Ccontext%7D)%20%3D%3E%20(%7Bdata%3A%5Bdata%5B0%5D%2C%20data%5B2%5D%5D%2C%20context%7D)%20%7D%2C%20%20%20%20%0A%20%20%20%20%7D)%0A%20%20%20%20const%20geomMdle%20%3D%20project.getModule(%27geom%27)%0A%20%20%20%20project%20%3D%20await%20project.parseDag(%5B%0A%20%20%20%20%09%27(autoForm%23form)%3E%23a%3E(%23geom)%27%0A%20%20%20%20%5D%2C%7B%0A%20%20%20%20%20%20%20%20form%3A%20%09%09%7B%20schema%3A%20geomMdle.configuration.schema%20%7D%2C%0A%20%20%20%20%20%20%20%20a%3A%20%09%09%09%7B%20adaptor%3A%20(%7Bdata%2C%20context%7D)%20%3D%3E%20(%7Bconfiguration%3A%20data%2C%20data%2C%20context%7D)%7D%2C%0A%20%20%20%20%7D)%0A%20%20%20%20%0A%20%20%20%20project%20%3D%20project.addLayer(%7B%0A%20%20%20%20%20%20%20%20layerId%3A%27Meshes%27%2C%0A%20%20%20%20%09uids%3A%5B%27mapWire%27%2C%20%27mapPlain%27%2C%20%27meshWire%27%2C%20%27meshPlain%27%2C%20%27combMeshes%27%2C%20%27group%27%20%5D%0A%20%20%20%20%7D)%0A%20%20%20%20project%20%3D%20project.addLayer(%7B%0A%20%20%20%20%20%20%20%20layerId%3A%27Lights%27%2C%0A%20%20%20%20%09uids%3A%5B%27of2%27%2C%20%27light%27%2C%27light2%27%5D%0A%20%20%20%20%7D)%0A%20%20%20%20project%20%3D%20project.addToCanvas(%7B%0A%20%20%20%20%09selector%3A%20(elem)%20%3D%3E%20elem.uid%20%3D%3D%20%27mapWire%27%2C%0A%20%20%20%20%20%20%20%20view%3A%20()%20%3D%3E%20(%7BinnerText%3A%27%5Bgeom%2C%20wire%5D%27%7D)%0A%20%20%20%20%7D%2C%7B%0A%20%20%20%20%09selector%3A%20(elem)%20%3D%3E%20elem.uid%20%3D%3D%20%27mapPlain%27%2C%0A%20%20%20%20%20%20%20%20view%3A%20()%20%3D%3E%20(%7BinnerText%3A%27%5Bgeom%2C%20plain%5D%27%7D)%0A%20%20%20%20%7D)%0A%20%20%20%20%0A%20%20%20%20const%20viewerMdle%20%3D%20project.getModule(%27viewer%27)%0A%20%20%20%20const%20autoFormMdle%20%3D%20project.getModule(%27form%27)%0A%20%20%20%20project%20%3D%20project.addHtml(%22View%22%2C%20%7B%0A%20%20%20%20%20%20%20%20class%3A%27w-100%20h-100%27%2C%0A%20%20%20%20%20%20%20%20style%3A%7B%20position%3A%20%27relative%27%7D%2C%0A%20%20%20%20%20%20%20%20children%3A%5B%0A%20%20%20%20%20%20%20%20%20%20%20%20viewerMdle.html()%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20%7B%0A%20%20%20%20%20%20%20%20%20%20%20%20%09style%3A%7B%20position%3A%20%27absolute%27%2C%20top%3A%275px%27%2C%20left%3A%275px%27%7D%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20children%3A%5BautoFormMdle.html()%5D%0A%20%20%20%20%20%20%20%20%20%20%20%20%7D%0A%20%20%20%20%20%20%20%20%5D%0A%20%20%20%20%7D)%0A%20%20%20%20return%20project%0A%7D"
 * >
 * </iframe>
 *
 * @module
 */

import { Modules, Attributes } from '@youwol/vsf-core'
import { IcosahedronGeometry } from 'three'
import { map } from 'rxjs/operators'

export const configuration = {
    schema: {
        radius: new Attributes.Float({ value: 1, min: 0 }),
        detail: new Attributes.Integer({ value: 0, min: 0 }),
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
            return {
                data: new IcosahedronGeometry(
                    configuration.radius,
                    configuration.detail,
                ),
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

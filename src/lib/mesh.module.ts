import { Modules, Contracts, asMutable } from '@youwol/vsf-core'
import { BufferGeometry, Material, Mesh } from 'three'
import { map } from 'rxjs/operators'

export const configuration = {
    schema: {
        id: Modules.stringAttribute({ value: 'mesh' }),
        renderOrder: Modules.integerAttribute({ value: 0 }),
    },
}

export const inputs = {
    input$: {
        description: 'The material + geometry to create the mesh.',
        contract: Contracts.contract<{
            geometry: BufferGeometry
            material: Material
        }>({
            description:
                'Be able to retrieve a Three.Material + Three.BufferGeometry',
            requirements: {
                material: Contracts.single({
                    when: Contracts.instanceOf({
                        typeName: 'Material',
                        Type: Material,
                        attNames: ['mat', 'material'],
                    }),
                }),
                geometry: Contracts.single({
                    when: Contracts.instanceOf({
                        typeName: 'BufferGeometry',
                        Type: BufferGeometry,
                        attNames: ['geom', 'geometry', 'bufferGeometry'],
                    }),
                }),
            },
        }),
    },
}

export const outputs = (
    arg: Modules.OutputMapperArg<typeof configuration.schema, typeof inputs>,
) => ({
    output$: arg.inputs.input$.pipe(
        map(({ configuration, data, context }) => {
            const mutableGeom = asMutable<BufferGeometry>(data.geometry)
            const mesh = new Mesh(mutableGeom, data.material)
            mesh.name = configuration.id
            mesh.renderOrder = configuration.renderOrder
            return {
                data: mesh,
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

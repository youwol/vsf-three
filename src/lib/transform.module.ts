import { Modules, Configurations, Contracts } from '@youwol/vsf-core'
import { Object3D } from 'three'
import { filter, map } from 'rxjs/operators'

const transform3D = (defaultValue: number) => ({
    x: new Configurations.Float({ value: defaultValue }),
    y: new Configurations.Float({ value: defaultValue }),
    z: new Configurations.Float({ value: defaultValue }),
})

export const configuration = {
    schema: {
        rotation: transform3D(0),
        position: transform3D(0),
        scale: transform3D(1),
    },
}

export const inputs = {
    input$: {
        description: 'The object 3D to transform.',
        contract: Contracts.contract<{
            object: Object3D
        }>({
            description: 'Be able to retrieve a Three.Object3D',
            requirements: {
                object: Contracts.instanceOf({
                    typeName: 'Object3D',
                    Type: Object3D,
                    attNames: ['object', 'object3D'],
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
            const obj = data.object.clone()
            obj.rotation.set(
                configuration.rotation.x,
                configuration.rotation.y,
                configuration.rotation.z,
            )
            obj.position.set(
                configuration.position.x,
                configuration.position.y,
                configuration.position.z,
            )
            obj.scale.set(
                configuration.scale.x,
                configuration.scale.y,
                configuration.scale.z,
            )
            return {
                data: obj,
                context,
            }
        }),
        filter((d) => d != undefined),
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

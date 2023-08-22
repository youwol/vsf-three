import { asMutable, Modules, Contracts } from '@youwol/vsf-core'
import { Group, Object3D } from 'three'
import { map } from 'rxjs/operators'

export const configuration = {
    schema: {},
}

export const inputs = {
    input$: {
        description: 'Some objects 3D to group',
        contract: Contracts.some<Object3D>({
            description: 'Be able to retrieve some Three.Object3D only',
            when: Contracts.instanceOf({
                typeName: 'Object3D',
                Type: Object3D,
                attNames: ['object', 'object3D'],
            }),
        }),
    },
}

export const outputs = (
    arg: Modules.OutputMapperArg<typeof configuration.schema, typeof inputs>,
) => ({
    output$: arg.inputs.input$.pipe(
        map(({ data, context }) => {
            const group = new Group()
            const converted = asMutable<Object3D[]>(data)
            group.add(...converted)
            return {
                data: group,
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

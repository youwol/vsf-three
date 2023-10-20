/**
 *
 *
 * This module wrap the [HemisphereLight](https://threejs.org/docs/?q=light#api/en/lights/HemisphereLight)
 * class of three.js.
 *
 * @module
 */
import { Modules } from '@youwol/vsf-core'
import { HemisphereLight } from 'three'
import { map } from 'rxjs/operators'

export const configuration = {
    schema: {
        skyColor: Modules.integerAttribute({ value: 0xffffff }),
        groundColor: Modules.integerAttribute({ value: 0xffffff }),
        intensity: Modules.floatAttribute({ value: 1 }),
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
                data: new HemisphereLight(
                    configuration.skyColor,
                    configuration.groundColor,
                    configuration.intensity,
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

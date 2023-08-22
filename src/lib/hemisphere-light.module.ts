/**
 *
 *
 * This module wrap the [HemisphereLight](https://threejs.org/docs/?q=light#api/en/lights/HemisphereLight)
 * class of three.js.
 *
 * @module
 */
import { Modules, Configurations } from '@youwol/vsf-core'
import { HemisphereLight } from 'three'
import { map } from 'rxjs/operators'

export const configuration = {
    schema: {
        skyColor: new Configurations.Integer({ value: 0xffffff }),
        groundColor: new Configurations.Integer({ value: 0xffffff }),
        intensity: new Configurations.Float({ value: 1 }),
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

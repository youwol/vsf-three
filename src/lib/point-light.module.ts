/**
 *
 *
 * This module wrap the [HemisphereLight](https://threejs.org/docs/?q=light#api/en/lights/HemisphereLight)
 * class of three.js.
 *
 * @module
 */
import { Modules, Configurations } from '@youwol/vsf-core'
import { PointLight } from 'three'
import { map } from 'rxjs/operators'

export const configuration = {
    schema: {
        color: new Configurations.Integer({ value: 0xffffff }),
        intensity: new Configurations.Float({ value: 1 }),
        distance: new Configurations.Float({ value: 0 }),
        position: {
            x: new Configurations.Float({ value: 0 }),
            y: new Configurations.Float({ value: 0 }),
            z: new Configurations.Float({ value: 0 }),
        },
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
            const light = new PointLight(
                configuration.color,
                configuration.intensity,
                configuration.distance,
            )
            light.position.set(
                configuration.position.x,
                configuration.position.y,
                configuration.position.z,
            )
            return {
                data: light,
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

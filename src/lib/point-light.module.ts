/**
 *
 *
 * This module wrap the [HemisphereLight](https://threejs.org/docs/?q=light#api/en/lights/HemisphereLight)
 * class of three.js.
 *
 * @module
 */
import { Modules } from '@youwol/vsf-core'
import { PointLight } from 'three'
import { map } from 'rxjs/operators'

export const configuration = {
    schema: {
        color: Modules.integerAttribute({ value: 0xffffff }),
        intensity: Modules.floatAttribute({ value: 1 }),
        distance: Modules.floatAttribute({ value: 0 }),
        position: {
            x: Modules.floatAttribute({ value: 0 }),
            y: Modules.floatAttribute({ value: 0 }),
            z: Modules.floatAttribute({ value: 0 }),
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

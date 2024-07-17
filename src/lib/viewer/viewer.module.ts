import { asMutable, Contracts, Modules } from '@youwol/vsf-core'
import { BufferGeometry, Mesh, Object3D } from 'three'

import { DefaultLights, State } from './viewer.state'
import { defaultMaterial } from './utils'
import { ViewConfig, ViewerView } from './viewer.view'

export const configuration = {
    schema: {
        defaultLights: Modules.stringLiteralAttribute<DefaultLights, 'final'>({
            value: 'default',
        }),
    },
}

export const inputs = {
    input$: {
        description: 'The object to add.',
        contract: Contracts.contract<{ objects: Object3D[] }>({
            description: 'Be able to retrieve a Three.Object3D',
            requirements: {
                objects: Contracts.some({
                    description: 'One or more objects',
                    when: Contracts.any({
                        description: 'An Object3D or a BufferGeometry',
                        when: [
                            Contracts.instanceOf({
                                typeName: 'Object3D',
                                Type: Object3D,
                                attNames: ['object', 'mesh'],
                            }),
                            Contracts.instanceOf({
                                typeName: 'BufferGeometry',
                                Type: BufferGeometry,
                                attNames: ['geometry'],
                                normalizeTo: (geom: BufferGeometry) => {
                                    return new Mesh(geom, defaultMaterial)
                                },
                            }),
                        ],
                    }),
                }),
            },
        }),
    },
}

export const outputs = () => ({})

export function module(fwdArgs: Modules.ForwardArgs) {
    const state = new State({
        defaultLights:
            (fwdArgs.configurationInstance?.defaultLights as DefaultLights) ||
            'default',
    })
    const module = new Modules.Implementation(
        {
            configuration,
            inputs,
            outputs,
            html: (_instance, viewConfig?: ViewConfig) =>
                new ViewerView({ state, viewConfig }),
            state,
        },
        fwdArgs,
    )
    module.inputSlots.input$.preparedMessage$.subscribe((message) => {
        state.render(
            asMutable<Object3D[]>(message.data.objects),
            module.journal.addPage({ title: 'render' }),
        )
    })
    return module
}

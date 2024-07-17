import { Contracts, Modules, Immutables } from '@youwol/vsf-core'
import { BufferAttribute, BufferGeometry } from 'three'
import { map } from 'rxjs/operators'

export const configuration = {
    schema: {},
}

function createBufferAttr<T extends Float32Array | Uint32Array>(
    Type: (new (buffer: ArrayBuffer | SharedArrayBuffer) => T) & {
        BYTES_PER_ELEMENT: number
    },
    array: Immutables<number>,
    size: number,
): BufferAttribute {
    const length = array.length * Type.BYTES_PER_ELEMENT
    const buffer = new Type(new ArrayBuffer(length))
    buffer.set(array)
    return new BufferAttribute(buffer, size)
}

/**
 * The module feature one input `$input`.
 * It accepts objects featuring attributes 'position' - flat array of x, y, z coordinates of vertex -,
 * and 'index' - flat array of triangles's index -.
 */
export const inputs = {
    input$: {
        description: 'A input mapping to a valid GOCAD object definition',
        contract: Contracts.of<{ position: number[]; index: number[] }>({
            description: 'A valid URL of GOCAD file',
            when: (input: unknown) => {
                return (
                    Array.isArray(input?.['position']) &&
                    Array.isArray(input?.['index'])
                )
            },
        }),
    },
}

export const outputs = (
    arg: Modules.OutputMapperArg<typeof configuration.schema, typeof inputs>,
) => ({
    output$: arg.inputs.input$.pipe(
        map(({ data, context }) => {
            const geometry = new BufferGeometry()

            geometry.setAttribute(
                'position',
                createBufferAttr(Float32Array, data.position, 3),
            )
            geometry.setIndex(createBufferAttr(Uint32Array, data.index, 1))

            geometry.computeVertexNormals()
            geometry.computeBoundingBox()
            geometry.computeBoundingSphere()

            return {
                data: geometry,
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

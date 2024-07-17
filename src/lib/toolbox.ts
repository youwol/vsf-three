import { Modules } from '@youwol/vsf-core'
import { module as standardMaterialModule } from './material.modules'
import { module as sphereGeomModule } from './sphere.module'
import { module as meshModule } from './mesh.module'
import { module as hemisphereLightModule } from './hemisphere-light.module'
import { module as pointLightModule } from './point-light.module'
import { module as torusKnotModule } from './torus-knot-geometry.module'
import { module as transformModule } from './transform.module'
import { module as groupModule } from './group.module'
import { module as boxModule } from './box-geometry.module'
import { module as cylinderModule } from './cylinder.module'
import { module as dodecahedronModule } from './dodecahedron.module'
import { module as circleModule } from './circle.module'
import { module as planeModule } from './plane.module'
import { module as viewerModule } from './viewer/viewer.module'
import { module as bufferGeomModule } from './buffer-geometry/buffer-geometry.module'

import { basePathDoc, urlModuleDoc } from './constants'
import { setup } from '../auto-generated'

export function toolbox() {
    return {
        name: 'three',
        uid: setup.name,
        origin: {
            packageName: setup.name,
            version: setup.version,
        },
        documentation: `${basePathDoc}.html`,
        icon: {
            svgString: `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
<!-- Font Awesome Pro 5.15.4 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) -->
<path fill="darkslategrey"  d="M239.1 6.3l-208 78c-18.7 7-31.1 25-31.1 45v225.1c0 18.2 10.3 34.8 26.5 42.9l208 104c13.5 6.8 29.4 6.8 42.9 0l208-104c16.3-8.1 26.5-24.8 26.5-42.9V129.3c0-20-12.4-37.9-31.1-44.9l-208-78C262 2.2 250 2.2 239.1 6.3zM256 68.4l192 72v1.1l-192 78-192-78v-1.1l192-72zm32 356V275.5l160-65v133.9l-160 80z"/>
</svg>
`,
        },
        modules: [
            new Modules.Module({
                declaration: {
                    typeId: 'sphere',
                    documentation: urlModuleDoc('Sphere'),
                },
                implementation: ({ fwdParams }) => {
                    return sphereGeomModule(fwdParams)
                },
            }),
            new Modules.Module({
                declaration: {
                    typeId: 'mesh',
                    documentation: urlModuleDoc('Mesh'),
                },
                implementation: ({ fwdParams }) => {
                    return meshModule(fwdParams)
                },
            }),
            new Modules.Module({
                declaration: {
                    typeId: 'standardMaterial',
                    documentation: urlModuleDoc('Material'),
                },
                implementation: ({ fwdParams }) => {
                    return standardMaterialModule(fwdParams)
                },
            }),
            new Modules.Module({
                declaration: {
                    typeId: 'viewer',
                    documentation: urlModuleDoc('Viewer'),
                },
                implementation: ({ fwdParams }) => {
                    return viewerModule(fwdParams)
                },
            }),
            new Modules.Module({
                declaration: {
                    typeId: 'hemisphereLight',
                    documentation: urlModuleDoc('HemisphereLight'),
                },
                implementation: ({ fwdParams }) => {
                    return hemisphereLightModule(fwdParams)
                },
            }),
            new Modules.Module({
                declaration: {
                    typeId: 'pointLight',
                    documentation: urlModuleDoc('PointLight'),
                },
                implementation: ({ fwdParams }) => {
                    return pointLightModule(fwdParams)
                },
            }),
            new Modules.Module({
                declaration: {
                    typeId: 'torusKnot',
                    documentation: urlModuleDoc('TorusKnot'),
                },
                implementation: ({ fwdParams }) => {
                    return torusKnotModule(fwdParams)
                },
            }),
            new Modules.Module({
                declaration: {
                    typeId: 'transform',
                    documentation: urlModuleDoc('Transform'),
                },
                implementation: ({ fwdParams }) => {
                    return transformModule(fwdParams)
                },
            }),
            new Modules.Module({
                declaration: {
                    typeId: 'group',
                    documentation: urlModuleDoc('Group'),
                },
                implementation: ({ fwdParams }) => {
                    return groupModule(fwdParams)
                },
            }),
            new Modules.Module({
                declaration: {
                    typeId: 'box',
                    documentation: urlModuleDoc('Box'),
                },
                implementation: ({ fwdParams }) => {
                    return boxModule(fwdParams)
                },
            }),
            new Modules.Module({
                declaration: {
                    typeId: 'cylinder',
                    documentation: urlModuleDoc('Cylinder'),
                },
                implementation: ({ fwdParams }) => {
                    return cylinderModule(fwdParams)
                },
            }),
            new Modules.Module({
                declaration: {
                    typeId: 'dodecahedron',
                    documentation: urlModuleDoc('Dodecahedron'),
                },
                implementation: ({ fwdParams }) => {
                    return dodecahedronModule(fwdParams)
                },
            }),
            new Modules.Module({
                declaration: {
                    typeId: 'icosahedron',
                    documentation: urlModuleDoc('Icosahedron'),
                },
                implementation: ({ fwdParams }) => {
                    return dodecahedronModule(fwdParams)
                },
            }),
            new Modules.Module({
                declaration: {
                    typeId: 'circle',
                    documentation: urlModuleDoc('Circle'),
                },
                implementation: ({ fwdParams }) => {
                    return circleModule(fwdParams)
                },
            }),
            new Modules.Module({
                declaration: {
                    typeId: 'plane',
                    documentation: urlModuleDoc('Plane'),
                },
                implementation: ({ fwdParams }) => {
                    return planeModule(fwdParams)
                },
            }),
            new Modules.Module({
                declaration: {
                    typeId: 'bufferGeom',
                    documentation: urlModuleDoc('BufferGeometry'),
                },
                implementation: ({ fwdParams }) => {
                    return bufferGeomModule(fwdParams)
                },
            }),
        ],
    }
}
